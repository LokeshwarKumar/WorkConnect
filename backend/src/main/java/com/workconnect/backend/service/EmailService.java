package com.workconnect.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

@Service
public class EmailService {

    private static final Logger logger =
            LoggerFactory.getLogger(EmailService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Autowired
    private Environment env;

    @Value("${spring.mail.username}")
    private String fromEmail;

    private boolean isDevelopment() {
        List<String> activeProfiles =
                Arrays.asList(env.getActiveProfiles());

        return activeProfiles.isEmpty()
                || activeProfiles.contains("dev")
                || activeProfiles.contains("default");
    }

    public void sendOtpEmail(String to, String otp) {

        String subject = "WorkConnect - Verify Your Email";

        String body =
                "Dear User,\n\n" +
                "Thank you for registering with WorkConnect.\n\n" +
                "Your OTP is: " + otp + "\n\n" +
                "This OTP is valid for 5 minutes.\n\n" +
                "Regards,\nWorkConnect Team";

        if (isDevelopment()) {
            logger.info("========================================");
            logger.info("DEVELOPMENT MODE: OTP for {}: {}", to, otp);
            logger.info("========================================");
        }

        if (mailSender == null) {
            logger.warn("JavaMailSender is not configured.");
            return;
        }

        try {
            SimpleMailMessage message =
                    new SimpleMailMessage();

            message.setFrom(fromEmail);   // IMPORTANT
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);

            mailSender.send(message);

            logger.info("OTP email sent to {}", to);

        } catch (Exception e) {
            logger.error("Failed to send OTP email", e);
        }
    }
}