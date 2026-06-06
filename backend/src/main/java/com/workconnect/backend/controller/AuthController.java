package com.workconnect.backend.controller;

import com.workconnect.backend.dto.request.LoginRequest;
import com.workconnect.backend.dto.request.SignupRequest;
import com.workconnect.backend.service.AuthService;
import com.workconnect.backend.dto.request.VerifyOtpRequest;
import com.workconnect.backend.dto.request.ResendOtpRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    AuthService authService;

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        return ResponseEntity.ok(authService.authenticateUser(loginRequest));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        authService.registerUser(signUpRequest);
        return ResponseEntity.ok(Map.of("message", "OTP sent to your email. Please verify."));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@Valid @RequestBody VerifyOtpRequest verifyOtpRequest) {
        authService.verifyOtp(verifyOtpRequest);
        return ResponseEntity.ok(Map.of("message", "OTP verified successfully. Your account is now active."));
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<?> resendOtp(@Valid @RequestBody ResendOtpRequest resendOtpRequest) {
        authService.resendOtp(resendOtpRequest);
        return ResponseEntity.ok(Map.of("message", "OTP resent successfully. Please check your email."));
    }
}
