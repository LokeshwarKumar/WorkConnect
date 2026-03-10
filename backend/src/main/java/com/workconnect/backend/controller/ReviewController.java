package com.workconnect.backend.controller;

import com.workconnect.backend.dto.request.ReviewForm;
import com.workconnect.backend.security.services.UserDetailsImpl;
import com.workconnect.backend.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> createReview(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                          @Valid @RequestBody ReviewForm form) {
        reviewService.createReview(userDetails.getId(), form);
        return ResponseEntity.ok("Review submitted successfully");
    }
}
