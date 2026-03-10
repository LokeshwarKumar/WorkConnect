package com.workconnect.backend.controller;

import com.workconnect.backend.dto.request.ServiceRequestForm;
import com.workconnect.backend.entity.ServiceRequest;
import com.workconnect.backend.enums.ServiceRequestStatus;
import com.workconnect.backend.security.services.UserDetailsImpl;
import com.workconnect.backend.service.ServiceRequestService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/requests")
public class ServiceRequestController {

    @Autowired
    private ServiceRequestService serviceRequestService;

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> createRequest(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                           @Valid @RequestBody ServiceRequestForm form) {
        serviceRequestService.createServiceRequest(userDetails.getId(), form);
        return ResponseEntity.ok("Service reuqest created successfully");
    }

    @GetMapping("/user")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<ServiceRequest>> getUserRequests(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(serviceRequestService.getUserRequests(userDetails.getId()));
    }

    @GetMapping("/worker")
    @PreAuthorize("hasRole('WORKER')")
    public ResponseEntity<List<ServiceRequest>> getWorkerRequests(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(serviceRequestService.getWorkerRequests(userDetails.getId()));
    }

    @PutMapping("/{requestId}/status")
    @PreAuthorize("hasRole('WORKER')")
    public ResponseEntity<?> updateRequestStatus(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                                 @PathVariable Long requestId,
                                                 @RequestParam ServiceRequestStatus status) {
        serviceRequestService.updateRequestStatus(userDetails.getId(), requestId, status);
        return ResponseEntity.ok("Service request status updated to " + status);
    }

    @PutMapping("/{requestId}/complete")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> completeRequest(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                             @PathVariable Long requestId) {
        serviceRequestService.completeRequest(userDetails.getId(), requestId);
        return ResponseEntity.ok("Service request marked as completed");
    }
}
