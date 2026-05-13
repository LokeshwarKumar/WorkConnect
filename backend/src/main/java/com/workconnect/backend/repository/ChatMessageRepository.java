package com.workconnect.backend.repository;

import com.workconnect.backend.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage> findByServiceRequest_IdOrderBySentAtAsc(Long serviceRequestId);
}
