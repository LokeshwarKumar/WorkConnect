package com.workconnect.backend.controller;

import com.workconnect.backend.dto.request.ProfileUpdateRequest;
import com.workconnect.backend.dto.response.ProfileResponse;
import com.workconnect.backend.security.services.UserDetailsImpl;
import com.workconnect.backend.service.ProfileService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    @Autowired
    private ProfileService profileService;

    @GetMapping
    @PreAuthorize("hasRole('USER') or hasRole('WORKER') or hasRole('ADMIN')")
    public ResponseEntity<ProfileResponse> getProfile(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        ProfileResponse response = profileService.getProfile(userDetails.getId(), userDetails.getAuthorities());
        return ResponseEntity.ok(response);
    }

    @PutMapping
    @PreAuthorize("hasRole('USER') or hasRole('WORKER') or hasRole('ADMIN')")
    public ResponseEntity<?> updateProfile(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                          @Valid @RequestBody ProfileUpdateRequest request) {
        ProfileResponse response = profileService.updateProfile(userDetails.getId(), userDetails.getAuthorities(), request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/test")
    public ResponseEntity<String> testEndpoint() {
        return ResponseEntity.ok("Profile controller is running and accessible!");
    }
}
