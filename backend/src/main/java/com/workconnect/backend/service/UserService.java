package com.workconnect.backend.service;

import com.workconnect.backend.dto.response.UserProfileResponse;
import com.workconnect.backend.entity.User;
import com.workconnect.backend.exception.ResourceNotFoundException;
import com.workconnect.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public UserProfileResponse getUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        return UserProfileResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .contactDetails(user.getContactDetails())
                .address(user.getAddress())
                .build();
    }

    public void updateProfile(Long userId, String contactDetails, String address) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        user.setContactDetails(contactDetails);
        user.setAddress(address);
        userRepository.save(user);
    }
}
