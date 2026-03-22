package com.workconnect.backend.controller;

import com.workconnect.backend.dto.response.AdminStatsResponse;
import com.workconnect.backend.dto.response.WorkerResponse;
import com.workconnect.backend.entity.User;
import com.workconnect.backend.service.AdminService;
import com.workconnect.backend.service.WorkerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private WorkerService workerService;

    @GetMapping("/stats")
    public ResponseEntity<AdminStatsResponse> getStats() {
        return ResponseEntity.ok(adminService.getStats());
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId) {
        adminService.deleteUser(userId);
        return ResponseEntity.ok("User deleted successfully");
    }

    @GetMapping("/workers")
    public ResponseEntity<List<WorkerResponse>> listWorkers() {
        return ResponseEntity.ok(workerService.listAllWorkers());
    }

    @PutMapping("/workers/{workerId}/approved")
    public ResponseEntity<WorkerResponse> setWorkerApproved(@PathVariable Long workerId,
                                                              @RequestParam boolean approved) {
        return ResponseEntity.ok(workerService.setWorkerApproved(workerId, approved));
    }

    @DeleteMapping("/workers/{workerId}")
    public ResponseEntity<?> deleteWorker(@PathVariable Long workerId) {
        adminService.deleteWorker(workerId);
        return ResponseEntity.ok("Worker deleted successfully");
    }
}
