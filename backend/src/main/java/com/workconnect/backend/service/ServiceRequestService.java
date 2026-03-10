package com.workconnect.backend.service;

import com.workconnect.backend.dto.request.ServiceRequestForm;
import com.workconnect.backend.entity.ServiceRequest;
import com.workconnect.backend.entity.User;
import com.workconnect.backend.enums.Role;
import com.workconnect.backend.enums.ServiceRequestStatus;
import com.workconnect.backend.exception.InvalidRequestException;
import com.workconnect.backend.exception.ResourceNotFoundException;
import com.workconnect.backend.exception.UnauthorizedException;
import com.workconnect.backend.repository.ServiceRequestRepository;
import com.workconnect.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ServiceRequestService {

    @Autowired
    private ServiceRequestRepository requestRepository;

    @Autowired
    private UserRepository userRepository;

    public void createServiceRequest(Long userId, ServiceRequestForm form) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        User worker = userRepository.findById(form.getWorkerId())
                .orElseThrow(() -> new ResourceNotFoundException("Worker not found"));

        if (worker.getRole() != Role.WORKER) {
            throw new InvalidRequestException("Target user is not a worker");
        }

        ServiceRequest request = ServiceRequest.builder()
                .user(user)
                .worker(worker)
                .status(ServiceRequestStatus.PENDING)
                .requestDate(LocalDateTime.now())
                .description(form.getDescription())
                .location(form.getLocation())
                .build();

        requestRepository.save(request);
    }

    public List<ServiceRequest> getUserRequests(Long userId) {
        return requestRepository.findByUserId(userId);
    }

    public List<ServiceRequest> getWorkerRequests(Long workerId) {
        return requestRepository.findByWorkerId(workerId);
    }

    public void updateRequestStatus(Long workerId, Long requestId, ServiceRequestStatus newStatus) {
        ServiceRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Service Request not found"));

        if (!request.getWorker().getId().equals(workerId)) {
            throw new UnauthorizedException("You are not authorized to update this request");
        }

        request.setStatus(newStatus);
        requestRepository.save(request);
    }

    public void completeRequest(Long userId, Long requestId) {
        ServiceRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Service Request not found"));

        if (!request.getUser().getId().equals(userId)) {
             throw new UnauthorizedException("Only the user who created the request can mark it as completed");
        }
        
        if (request.getStatus() != ServiceRequestStatus.ACCEPTED) {
             throw new InvalidRequestException("Request must be ACCEPTED first before marking as COMPLETED");
        }

        request.setStatus(ServiceRequestStatus.COMPLETED);
        requestRepository.save(request);
    }
}
