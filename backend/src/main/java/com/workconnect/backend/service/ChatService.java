package com.workconnect.backend.service;

import com.workconnect.backend.dto.response.ChatMessageResponse;
import com.workconnect.backend.entity.ChatMessage;
import com.workconnect.backend.entity.ServiceRequest;
import com.workconnect.backend.enums.ChatSenderRole;
import com.workconnect.backend.enums.ServiceRequestStatus;
import com.workconnect.backend.repository.ChatMessageRepository;
import com.workconnect.backend.repository.ServiceRequestRepository;
import com.workconnect.backend.security.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChatService {

    private static final int MAX_CONTENT_LEN = 2000;

    @Autowired
    private ServiceRequestRepository serviceRequestRepository;

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Transactional(readOnly = true)
    public List<ChatMessageResponse> getHistory(Long requestId, UserDetailsImpl principal) {
        ServiceRequest sr = loadAndAssertAccess(requestId, principal);
        return chatMessageRepository.findByServiceRequest_IdOrderBySentAtAsc(sr.getId()).stream()
                .map(m -> toResponse(m, sr))
                .collect(Collectors.toList());
    }

    @Transactional
    public ChatMessageResponse sendMessage(Long requestId, UserDetailsImpl principal, String content) {
        ServiceRequest sr = loadAndAssertAccess(requestId, principal);
        if (sr.getStatus() != ServiceRequestStatus.ACCEPTED) {
            throw new IllegalStateException("Chat is read-only for this request.");
        }
        String trimmed = content == null ? "" : content.trim();
        if (trimmed.isEmpty()) {
            throw new IllegalArgumentException("Message cannot be empty.");
        }
        if (trimmed.length() > MAX_CONTENT_LEN) {
            throw new IllegalArgumentException("Message is too long.");
        }

        ChatSenderRole role = isWorker(principal) ? ChatSenderRole.WORKER : ChatSenderRole.USER;

        ChatMessage msg = ChatMessage.builder()
                .serviceRequest(sr)
                .senderRole(role)
                .content(trimmed)
                .sentAt(LocalDateTime.now())
                .build();
        chatMessageRepository.save(msg);
        return toResponse(msg, sr);
    }

    public void assertCanAccessChat(Long requestId, UserDetailsImpl principal) {
        loadAndAssertAccess(requestId, principal);
    }

    public void assertCanPostChatMessage(Long requestId, UserDetailsImpl principal) {
        ServiceRequest sr = serviceRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Request not found."));
        assertParticipant(sr, principal);
        if (sr.getStatus() != ServiceRequestStatus.ACCEPTED) {
            throw new IllegalStateException("Chat is read-only.");
        }
    }

    private ServiceRequest loadAndAssertAccess(Long requestId, UserDetailsImpl principal) {
        ServiceRequest sr = serviceRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Request not found."));
        assertParticipant(sr, principal);
        if (sr.getStatus() != ServiceRequestStatus.ACCEPTED && sr.getStatus() != ServiceRequestStatus.COMPLETED) {
            throw new IllegalStateException("Chat is not available for this request.");
        }
        return sr;
    }

    private void assertParticipant(ServiceRequest sr, UserDetailsImpl principal) {
        if (isWorker(principal)) {
            if (!sr.getWorker().getId().equals(principal.getId())) {
                throw new AccessDeniedException("Not a participant in this request.");
            }
            return;
        }
        if (!sr.getUser().getId().equals(principal.getId())) {
            throw new AccessDeniedException("Not a participant in this request.");
        }
    }

    private static boolean isWorker(UserDetailsImpl principal) {
        return principal.getAuthorities().stream()
                .anyMatch(a -> "ROLE_WORKER".equals(a.getAuthority()));
    }

    private ChatMessageResponse toResponse(ChatMessage m, ServiceRequest sr) {
        String senderName;
        if (m.getSenderRole() == ChatSenderRole.WORKER) {
            senderName = sr.getWorker().getName();
        } else {
            senderName = sr.getUser().getName();
        }
        return ChatMessageResponse.builder()
                .id(m.getId())
                .serviceRequestId(sr.getId())
                .senderRole(m.getSenderRole())
                .senderName(senderName)
                .content(m.getContent())
                .sentAt(m.getSentAt())
                .build();
    }
}
