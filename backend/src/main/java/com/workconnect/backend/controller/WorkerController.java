package com.workconnect.backend.controller;

import com.workconnect.backend.dto.request.WorkerRequest;
import com.workconnect.backend.dto.response.WorkerResponse;
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

import java.util.Set;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/workers")
public class WorkerController {

    private static final Set<String> SORT_WHITELIST = Set.of(
            "rating", "minimumCharge", "hourlyCharge", "name", "id", "serviceType", "location");

    @Autowired
    private WorkerService workerService;

    @GetMapping("/test")
    public ResponseEntity<String> testEndpoint() {
        return ResponseEntity.ok("Worker controller is running!");
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createWorker(@Valid @RequestBody WorkerRequest request) {
        WorkerResponse response = workerService.createWorker(request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{workerId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('WORKER')")
    public ResponseEntity<?> updateWorker(@PathVariable Long workerId,
                                          @Valid @RequestBody WorkerRequest request,
                                          @AuthenticationPrincipal UserDetailsImpl userDetails) {
        WorkerResponse response = workerService.updateWorker(workerId, request, userDetails);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{workerId}")
    public ResponseEntity<WorkerResponse> getWorker(@PathVariable Long workerId) {
        WorkerResponse response = workerService.getWorker(workerId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/search")
    public ResponseEntity<Page<WorkerResponse>> searchWorkers(
            @RequestParam(defaultValue = "") String serviceType,
            @RequestParam(defaultValue = "") String location,
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam(defaultValue = "1000000") Double maxCharge,
            @RequestParam(defaultValue = "0") Double minRating,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "rating") String sortBy) {

        String sortProperty = SORT_WHITELIST.contains(sortBy) ? sortBy : "rating";
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, sortProperty));
        return ResponseEntity.ok(workerService.searchWorkers(serviceType, location, keyword, maxCharge, minRating, pageable));
    }
}
