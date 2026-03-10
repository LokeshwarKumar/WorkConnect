package com.workconnect.backend.controller;

import com.workconnect.backend.dto.request.WorkerProfileRequest;
import com.workconnect.backend.dto.response.WorkerProfileResponse;
import com.workconnect.backend.security.services.UserDetailsImpl;
import com.workconnect.backend.service.WorkerService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/workers")
public class WorkerController {

    @Autowired
    private WorkerService workerService;

    @PostMapping("/profile")
    @PreAuthorize("hasRole('WORKER')")
    public ResponseEntity<?> createOrUpdateProfile(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                                   @Valid @RequestBody WorkerProfileRequest request) {
        workerService.createOrUpdateWorkerProfile(userDetails.getId(), request);
        return ResponseEntity.ok("Worker profile updated successfully");
    }

    @GetMapping("/profile")
    @PreAuthorize("hasRole('WORKER')")
    public ResponseEntity<WorkerProfileResponse> getMyProfile(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(workerService.getWorkerProfile(userDetails.getId()));
    }

    @GetMapping("/{workerId}")
    public ResponseEntity<WorkerProfileResponse> getWorkerProfile(@PathVariable Long workerId) {
        return ResponseEntity.ok(workerService.getWorkerProfile(workerId));
    }

    @GetMapping("/search")
    public ResponseEntity<Page<WorkerProfileResponse>> searchWorkers(
            @RequestParam(defaultValue = "") String serviceType,
            @RequestParam(defaultValue = "") String location,
            @RequestParam(defaultValue = "1000000") Double maxCharge,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "rating") String sortBy) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, sortBy));
        return ResponseEntity.ok(workerService.searchWorkers(serviceType, location, maxCharge, pageable));
    }
}
