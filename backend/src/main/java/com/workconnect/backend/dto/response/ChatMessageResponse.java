package com.workconnect.backend.dto.response;

import com.workconnect.backend.enums.ChatSenderRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageResponse {
    private Long id;
    private Long serviceRequestId;
    private ChatSenderRole senderRole;
    private String senderName;
    private String content;
    private LocalDateTime sentAt;
}
