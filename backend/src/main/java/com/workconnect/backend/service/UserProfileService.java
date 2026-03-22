package com.workconnect.backend.service;

import com.workconnect.backend.dto.request.UserProfileUpdateRequest;
import com.workconnect.backend.dto.response.UserProfileResponse;
import com.workconnect.backend.entity.User;
import com.workconnect.backend.enums.Role;
import com.workconnect.backend.exception.InvalidRequestException;
import com.workconnect.backend.exception.ResourceNotFoundException;
import com.workconnect.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserProfileService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public UserProfileResponse createUserProfile(UserProfileUpdateRequest request, String password) {
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(password))
                .contactDetails(request.getContactDetails())
                .address(request.getAddress())
                .role(Role.USER)
                .build();

        User savedUser = userRepository.save(user);
        return mapToResponse(savedUser);
    }

    public UserProfileResponse getUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User profile not found with id: " + userId));
        return mapToResponse(user);
    }

    public void updateUserProfile(Long userId, UserProfileUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User profile not found with id: " + userId));

        // Update only non-null fields
        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            user.setName(request.getName().trim());
        }
        if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
            String newEmail = request.getEmail().trim();
            // Basic email format validation
            if (!newEmail.matches("^[A-Za-z0-9+_.-]+@([A-Za-z0-9.-]+\\.[A-Za-z]{2,})$")) {
                throw new InvalidRequestException("Invalid email format");
            }
            // Check if email is being changed and if new email already exists
            if (!newEmail.equals(user.getEmail())) {
                if (userRepository.existsByEmail(newEmail)) {
                    throw new InvalidRequestException("Email is already in use by another user");
                }
                user.setEmail(newEmail);
            }
        }
        if (request.getContactDetails() != null) {
            user.setContactDetails(request.getContactDetails().trim());
        }
        if (request.getAddress() != null) {
            user.setAddress(request.getAddress().trim());
        }

        userRepository.save(user);
    }

    private UserProfileResponse mapToResponse(User user) {
        return UserProfileResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .contactDetails(user.getContactDetails())
                .address(user.getAddress())
                .build();
    }
}
