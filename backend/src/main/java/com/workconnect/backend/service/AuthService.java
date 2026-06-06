package com.workconnect.backend.service;

import com.workconnect.backend.dto.request.LoginRequest;
import com.workconnect.backend.dto.request.SignupRequest;
import com.workconnect.backend.dto.request.VerifyOtpRequest;
import com.workconnect.backend.dto.request.ResendOtpRequest;
import com.workconnect.backend.dto.response.JwtResponse;
import com.workconnect.backend.entity.User;
import com.workconnect.backend.entity.Worker;
import com.workconnect.backend.entity.OtpVerification;
import com.workconnect.backend.enums.Role;
import com.workconnect.backend.exception.InvalidRequestException;
import com.workconnect.backend.exception.EmailNotVerifiedException;
import com.workconnect.backend.repository.UserRepository;
import com.workconnect.backend.repository.WorkerRepository;
import com.workconnect.backend.repository.OtpVerificationRepository;
import com.workconnect.backend.security.jwt.JwtUtils;
import com.workconnect.backend.security.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuthService {

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    WorkerRepository workerRepository;

    @Autowired
    OtpVerificationRepository otpVerificationRepository;

    @Autowired
    EmailService emailService;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    private final SecureRandom secureRandom = new SecureRandom();

    public JwtResponse authenticateUser(LoginRequest loginRequest) {
        String email = loginRequest.getEmail();

        // Block login if email is not verified
        userRepository.findByEmail(email).ifPresent(user -> {
            if (!Boolean.TRUE.equals(user.getEmailVerified())) {
                throw new EmailNotVerifiedException("Please verify your email before logging in.");
            }
        });
        workerRepository.findByEmail(email).ifPresent(worker -> {
            if (!Boolean.TRUE.equals(worker.getEmailVerified())) {
                throw new EmailNotVerifiedException("Please verify your email before logging in.");
            }
        });

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        return new JwtResponse(jwt,
                userDetails.getId(),
                userDetails.getName(),
                userDetails.getEmail(),
                roles);
    }

    private String generateOtp() {
        int code = 100000 + secureRandom.nextInt(900000);
        return String.valueOf(code);
    }

    public void registerUser(SignupRequest signUpRequest) {
        // Check if email exists in either table
        boolean emailExistsInUser = userRepository.existsByEmail(signUpRequest.getEmail());
        boolean emailExistsInWorker = workerRepository.existsByEmail(signUpRequest.getEmail());
        
        if (emailExistsInUser || emailExistsInWorker) {
            throw new InvalidRequestException("Error: Email is already in use!");
        }

        Role userRole;
        try {
            userRole = Role.valueOf(signUpRequest.getRole().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new InvalidRequestException("Error: Role must be either USER or WORKER");
        }
        
        if (userRole == Role.ADMIN) {
             throw new InvalidRequestException("Error: Cannot register as ADMIN directly");
        }

        String otp = generateOtp();

        // Invalidate previous OTP for the same email if exists
        otpVerificationRepository.findByEmail(signUpRequest.getEmail())
                .ifPresent(existing -> otpVerificationRepository.delete(existing));

        OtpVerification otpVerification = OtpVerification.builder()
                .email(signUpRequest.getEmail())
                .name(signUpRequest.getName())
                .password(encoder.encode(signUpRequest.getPassword()))
                .role(userRole)
                .otp(otp)
                .expiryTime(LocalDateTime.now().plusMinutes(5))
                .attempts(0)
                .build();

        otpVerificationRepository.save(otpVerification);

        // Send the OTP
        emailService.sendOtpEmail(signUpRequest.getEmail(), otp);
    }

    public void verifyOtp(VerifyOtpRequest request) {
        OtpVerification otpVerification = otpVerificationRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new InvalidRequestException("OTP details not found. Please sign up again."));

        otpVerification.setAttempts(otpVerification.getAttempts() + 1);
        otpVerificationRepository.save(otpVerification);

        if (otpVerification.getAttempts() > 5) {
            otpVerificationRepository.delete(otpVerification);
            throw new InvalidRequestException("Maximum verification attempts exceeded. Please register again.");
        }

        if (otpVerification.getExpiryTime().isBefore(LocalDateTime.now())) {
            throw new InvalidRequestException("OTP has expired. Please request a new one.");
        }

        if (!otpVerification.getOtp().equals(request.getOtp())) {
            int remaining = 5 - otpVerification.getAttempts();
            throw new InvalidRequestException("Invalid OTP. Remaining attempts: " + remaining);
        }

        // OTP is valid. Save the actual User or Worker entity.
        if (otpVerification.getRole() == Role.USER) {
            User user = User.builder()
                    .name(otpVerification.getName())
                    .email(otpVerification.getEmail())
                    .password(otpVerification.getPassword()) // Already encoded when building OtpVerification
                    .contactDetails("")
                    .address("")
                    .role(Role.USER)
                    .emailVerified(true)
                    .build();
            userRepository.save(user);
        } else if (otpVerification.getRole() == Role.WORKER) {
            Worker worker = Worker.builder()
                    .name(otpVerification.getName())
                    .email(otpVerification.getEmail())
                    .password(otpVerification.getPassword()) // Already encoded when building OtpVerification
                    .contactDetails("")
                    .address("")
                    .location("")
                    .description("")
                    .serviceType("")
                    .minimumCharge(0.0)
                    .hourlyCharge(0.0)
                    .availability(true)
                    .rating(0.0)
                    .approved(true)
                    .emailVerified(true)
                    .build();
            workerRepository.save(worker);
        }

        // Delete the temporary record
        otpVerificationRepository.delete(otpVerification);
    }

    public void resendOtp(ResendOtpRequest request) {
        OtpVerification otpVerification = otpVerificationRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new InvalidRequestException("Registration details not found. Please sign up again."));

        String newOtp = generateOtp();

        otpVerification.setOtp(newOtp);
        otpVerification.setExpiryTime(LocalDateTime.now().plusMinutes(5));
        otpVerification.setAttempts(0);

        otpVerificationRepository.save(otpVerification);

        emailService.sendOtpEmail(otpVerification.getEmail(), newOtp);
    }
}
