package com.workconnect.backend;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.workconnect.backend.dto.request.LoginRequest;
import com.workconnect.backend.dto.request.ResendOtpRequest;
import com.workconnect.backend.dto.request.SignupRequest;
import com.workconnect.backend.dto.request.VerifyOtpRequest;
import com.workconnect.backend.entity.OtpVerification;
import com.workconnect.backend.repository.OtpVerificationRepository;
import com.workconnect.backend.repository.UserRepository;
import com.workconnect.backend.repository.WorkerRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.time.LocalDateTime;

import static org.hamcrest.Matchers.containsString;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
public class AuthOtpIntegrationTests {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext webApplicationContext;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WorkerRepository workerRepository;

    @Autowired
    private OtpVerificationRepository otpVerificationRepository;

    private final String testEmail = "testuser_otp@example.com";

    @BeforeEach
    public void setup() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();

        // Cleanup existing test records
        userRepository.findByEmail(testEmail).ifPresent(user -> userRepository.delete(user));
        workerRepository.findByEmail(testEmail).ifPresent(worker -> workerRepository.delete(worker));
        otpVerificationRepository.findByEmail(testEmail).ifPresent(otp -> otpVerificationRepository.delete(otp));
    }

    @Test
    public void testFullOtpSignupAndVerificationFlow() throws Exception {
        // 1. Signup Request
        SignupRequest signupRequest = new SignupRequest();
        signupRequest.setName("Test User");
        signupRequest.setEmail(testEmail);
        signupRequest.setPassword("password123");
        signupRequest.setRole("USER");

        mockMvc.perform(post("/api/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(signupRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message", containsString("OTP sent to your email")));

        // Verify user is NOT in userRepository yet, but OTP record is created
        assertFalse(userRepository.existsByEmail(testEmail));
        assertTrue(otpVerificationRepository.findByEmail(testEmail).isPresent());

        OtpVerification otpRecord = otpVerificationRepository.findByEmail(testEmail).get();
        assertNotNull(otpRecord.getOtp());
        assertEquals(6, otpRecord.getOtp().length());
        assertEquals(0, otpRecord.getAttempts());

        // 2. Try to login (should fail because account does not exist/unverified)
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail(testEmail);
        loginRequest.setPassword("password123");

        mockMvc.perform(post("/api/auth/signin")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized()); // fails since username not found

        // 3. Try to verify with wrong OTP
        VerifyOtpRequest verifyRequest = new VerifyOtpRequest();
        verifyRequest.setEmail(testEmail);
        verifyRequest.setOtp("000000");

        mockMvc.perform(post("/api/auth/verify-otp")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(verifyRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Invalid OTP. Remaining attempts: 4")));

        // Verify attempts count incremented
        OtpVerification updatedRecord = otpVerificationRepository.findByEmail(testEmail).get();
        assertEquals(1, updatedRecord.getAttempts());

        // 4. Test Resend OTP
        ResendOtpRequest resendRequest = new ResendOtpRequest();
        resendRequest.setEmail(testEmail);

        mockMvc.perform(post("/api/auth/resend-otp")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(resendRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message", containsString("OTP resent successfully")));

        OtpVerification resentRecord = otpVerificationRepository.findByEmail(testEmail).get();
        assertEquals(0, resentRecord.getAttempts()); // should reset attempts
        assertNotEquals(otpRecord.getOtp(), resentRecord.getOtp()); // new OTP should be generated

        // 5. Verify with the correct resent OTP
        verifyRequest.setOtp(resentRecord.getOtp());
        mockMvc.perform(post("/api/auth/verify-otp")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(verifyRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message", containsString("OTP verified successfully")));

        // Verify User is created and OTP record is removed
        assertTrue(userRepository.existsByEmail(testEmail));
        assertFalse(otpVerificationRepository.findByEmail(testEmail).isPresent());
        assertTrue(userRepository.findByEmail(testEmail).get().getEmailVerified());

        // 6. Login now (should succeed)
        mockMvc.perform(post("/api/auth/signin")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists());
    }

    @Test
    public void testOtpAttemptsExceeded() throws Exception {
        // Signup
        SignupRequest signupRequest = new SignupRequest();
        signupRequest.setName("Test User");
        signupRequest.setEmail(testEmail);
        signupRequest.setPassword("password123");
        signupRequest.setRole("USER");

        mockMvc.perform(post("/api/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(signupRequest)))
                .andExpect(status().isOk());

        VerifyOtpRequest verifyRequest = new VerifyOtpRequest();
        verifyRequest.setEmail(testEmail);
        verifyRequest.setOtp("000000");

        // Fail 5 times
        for (int i = 0; i < 5; i++) {
            mockMvc.perform(post("/api/auth/verify-otp")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(verifyRequest)))
                    .andExpect(status().isBadRequest());
        }

        // 6th attempt should delete OTP record and throw max attempts exceeded
        mockMvc.perform(post("/api/auth/verify-otp")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(verifyRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Maximum verification attempts exceeded")));

        // Verify record was deleted
        assertFalse(otpVerificationRepository.findByEmail(testEmail).isPresent());
    }

    @Test
    public void testOtpExpiration() throws Exception {
        // Signup
        SignupRequest signupRequest = new SignupRequest();
        signupRequest.setName("Test User");
        signupRequest.setEmail(testEmail);
        signupRequest.setPassword("password123");
        signupRequest.setRole("USER");

        mockMvc.perform(post("/api/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(signupRequest)))
                .andExpect(status().isOk());

        // Manually expire the OTP in the database
        OtpVerification otp = otpVerificationRepository.findByEmail(testEmail).get();
        otp.setExpiryTime(LocalDateTime.now().minusMinutes(1));
        otpVerificationRepository.save(otp);

        // Try to verify
        VerifyOtpRequest verifyRequest = new VerifyOtpRequest();
        verifyRequest.setEmail(testEmail);
        verifyRequest.setOtp(otp.getOtp());

        mockMvc.perform(post("/api/auth/verify-otp")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(verifyRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("OTP has expired")));
    }
}
