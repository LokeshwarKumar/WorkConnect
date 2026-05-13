package com.workconnect.backend.controller;

import com.workconnect.backend.dto.request.ChatSendRequest;
import com.workconnect.backend.dto.response.ChatMessageResponse;
import com.workconnect.backend.service.ChatService;
import com.workconnect.backend.security.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
public class ChatStompController {

    @Autowired
    private ChatService chatService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat.request/{requestId}")
    public void send(
            @DestinationVariable Long requestId,
            @Payload ChatSendRequest payload,
            Principal principal) {
        UserDetailsImpl user = (UserDetailsImpl) ((UsernamePasswordAuthenticationToken) principal).getPrincipal();
        String content = payload != null ? payload.getContent() : null;
        ChatMessageResponse dto = chatService.sendMessage(requestId, user, content);
        messagingTemplate.convertAndSend("/topic/chat/" + requestId, dto);
    }
}
