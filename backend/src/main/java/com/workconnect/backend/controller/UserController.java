package com.workconnect.backend.controller;

import com.workconnect.backend.dto.response.UserProfileResponse;
import com.workconnect.backend.security.services.UserDetailsImpl;
import com.workconnect.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/profile")
    @PreAuthorize("hasRole('USER') or hasRole('WORKER') or hasRole('ADMIN')")
    public ResponseEntity<UserProfileResponse> getProfile(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(userService.getUserProfile(userDetails.getId()));
    }

    @PutMapping("/profile")
    @PreAuthorize("hasRole('USER') or hasRole('WORKER')")
    public ResponseEntity<?> updateProfile(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                           @RequestBody Map<String, String> updateRequest) {
        userService.updateProfile(userDetails.getId(), updateRequest.get("contactDetails"), updateRequest.get("address"));
        return ResponseEntity.ok("Profile updated successfully");
    }
}
