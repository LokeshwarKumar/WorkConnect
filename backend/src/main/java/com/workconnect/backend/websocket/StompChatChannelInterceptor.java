package com.workconnect.backend.websocket;

import com.workconnect.backend.security.jwt.JwtUtils;
import com.workconnect.backend.security.services.UserDetailsImpl;
import com.workconnect.backend.security.services.UserDetailsServiceImpl;
import com.workconnect.backend.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.MessageDeliveryException;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class StompChatChannelInterceptor implements ChannelInterceptor {

    private static final String TOPIC_PREFIX = "/topic/chat/";
    private static final String APP_PREFIX = "/app/chat.request/";

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    @Autowired
    private ChatService chatService;

    @Override
    public Message<?> preSend(@NonNull Message<?> message, @NonNull MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor == null) {
            return message;
        }

        StompCommand cmd = accessor.getCommand();
        if (StompCommand.CONNECT.equals(cmd)) {
            List<String> authHeaders = accessor.getNativeHeader("Authorization");
            String authHeader = authHeaders != null && !authHeaders.isEmpty() ? authHeaders.get(0) : null;
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                throw new MessageDeliveryException("Missing or invalid Authorization header.");
            }
            String token = authHeader.substring(7).trim();
            if (!jwtUtils.validateJwtToken(token)) {
                throw new MessageDeliveryException("Invalid or expired token.");
            }
            String subject = jwtUtils.getSubjectFromJwtToken(token);
            UserDetails userDetails = userDetailsService.loadUserByJwtSubject(subject);
            UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                    userDetails, null, userDetails.getAuthorities());
            accessor.setUser(auth);
            return message;
        }

        if (StompCommand.SUBSCRIBE.equals(cmd)) {
            String dest = accessor.getDestination();
            Long requestId = parseTopicChatId(dest);
            if (requestId != null) {
                UserDetailsImpl user = requireUser(accessor);
                chatService.assertCanAccessChat(requestId, user);
            }
            return message;
        }

        if (StompCommand.SEND.equals(cmd)) {
            String dest = accessor.getDestination();
            Long requestId = parseAppChatRequestId(dest);
            if (requestId != null) {
                UserDetailsImpl user = requireUser(accessor);
                chatService.assertCanPostChatMessage(requestId, user);
            }
            return message;
        }

        return message;
    }

    private static UserDetailsImpl requireUser(StompHeaderAccessor accessor) {
        if (accessor.getUser() instanceof UsernamePasswordAuthenticationToken token) {
            Object p = token.getPrincipal();
            if (p instanceof UserDetailsImpl u) {
                return u;
            }
        }
        throw new MessageDeliveryException("Unauthorized.");
    }

    private static Long parseTopicChatId(String dest) {
        if (dest == null || !dest.startsWith(TOPIC_PREFIX)) {
            return null;
        }
        try {
            return Long.parseLong(dest.substring(TOPIC_PREFIX.length()));
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private static Long parseAppChatRequestId(String dest) {
        if (dest == null || !dest.startsWith(APP_PREFIX)) {
            return null;
        }
        try {
            return Long.parseLong(dest.substring(APP_PREFIX.length()));
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
