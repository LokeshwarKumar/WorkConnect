package com.workconnect.backend.service;

import com.workconnect.backend.dto.request.ServiceRequestForm;
import com.workconnect.backend.dto.response.ServiceRequestResponse;
import com.workconnect.backend.entity.ServiceRequest;
import com.workconnect.backend.entity.User;
import com.workconnect.backend.entity.Worker;
import com.workconnect.backend.enums.ServiceRequestStatus;
import com.workconnect.backend.exception.InvalidRequestException;
import com.workconnect.backend.exception.ResourceNotFoundException;
import com.workconnect.backend.exception.UnauthorizedException;
import com.workconnect.backend.repository.ServiceRequestRepository;
import com.workconnect.backend.repository.UserRepository;
import com.workconnect.backend.repository.WorkerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ServiceRequestService {

    @Autowired
    private ServiceRequestRepository requestRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WorkerRepository workerRepository;

    public void createServiceRequest(Long userId, ServiceRequestForm form) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Worker worker = workerRepository.findById(form.getWorkerId())
                .orElseThrow(() -> new ResourceNotFoundException("Worker not found"));

        if (worker.getApproved() != null && !worker.getApproved()) {
            throw new InvalidRequestException("This worker profile is not available for booking");
        }
        if (Boolean.FALSE.equals(worker.getAvailability())) {
            throw new InvalidRequestException("This worker is not available");
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

    @Transactional(readOnly = true)
    public List<ServiceRequestResponse> getUserRequests(Long userId) {
        return requestRepository.findAllByUserForList(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ServiceRequestResponse> getWorkerRequests(Long workerId) {
        return requestRepository.findAllByWorkerForList(workerId).stream()
                .map(this::toResponse)
                .toList();
    }

    public void updateRequestStatus(Long workerId, Long requestId, ServiceRequestStatus newStatus) {
        ServiceRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Service Request not found"));

        if (!request.getWorker().getId().equals(workerId)) {
            throw new UnauthorizedException("You are not authorized to update this request");
        }

        validateStatusTransition(request.getStatus(), newStatus);

        request.setStatus(newStatus);
        requestRepository.save(request);
    }

    private void validateStatusTransition(ServiceRequestStatus current, ServiceRequestStatus next) {
        if (current == ServiceRequestStatus.COMPLETED || current == ServiceRequestStatus.REJECTED) {
            throw new InvalidRequestException("This request is already finalized");
        }
        if (current == ServiceRequestStatus.PENDING) {
            if (next != ServiceRequestStatus.ACCEPTED && next != ServiceRequestStatus.REJECTED) {
                throw new InvalidRequestException("You can only accept or reject pending requests");
            }
            return;
        }
        if (current == ServiceRequestStatus.ACCEPTED) {
            throw new InvalidRequestException("Accepted requests are managed by the customer (mark complete)");
        }
        throw new InvalidRequestException("Invalid status change");
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

    private ServiceRequestResponse toResponse(ServiceRequest r) {
        User u = r.getUser();
        Worker w = r.getWorker();
        return ServiceRequestResponse.builder()
                .id(r.getId())
                .status(r.getStatus())
                .requestDate(r.getRequestDate())
                .description(r.getDescription())
                .location(r.getLocation())
                .serviceType(w.getServiceType())
                .user(ServiceRequestResponse.UserBrief.builder()
                        .id(u.getId())
                        .name(u.getName())
                        .email(u.getEmail())
                        .build())
                .worker(ServiceRequestResponse.WorkerBrief.builder()
                        .id(w.getId())
                        .name(w.getName())
                        .email(w.getEmail())
                        .serviceType(w.getServiceType())
                        .minimumCharge(w.getMinimumCharge())
                        .hourlyCharge(w.getHourlyCharge())
                        .build())
                .reviewed(r.getReview() != null)
                .build();
    }
}
