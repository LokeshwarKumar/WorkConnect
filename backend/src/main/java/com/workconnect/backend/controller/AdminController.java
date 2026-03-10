package com.workconnect.backend.controller;

import com.workconnect.backend.entity.User;
import com.workconnect.backend.service.AdminService;
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

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId) {
        adminService.deleteUser(userId);
        return ResponseEntity.ok("User deleted successfully");
    }
}
