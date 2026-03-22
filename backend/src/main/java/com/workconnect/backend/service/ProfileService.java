package com.workconnect.backend.service;

import com.workconnect.backend.dto.request.ProfileUpdateRequest;
import com.workconnect.backend.dto.response.ProfileResponse;
import com.workconnect.backend.entity.User;
import com.workconnect.backend.entity.Worker;
import com.workconnect.backend.exception.InvalidRequestException;
import com.workconnect.backend.exception.ResourceNotFoundException;
import com.workconnect.backend.repository.UserRepository;
import com.workconnect.backend.repository.WorkerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;

import java.util.Collection;

@Service
public class ProfileService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WorkerRepository workerRepository;

    public ProfileResponse getProfile(Long userId, Collection<? extends GrantedAuthority> authorities) {
        boolean isWorker = authorities.stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_WORKER"));

        if (isWorker) {
            Worker worker = workerRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Worker profile not found"));
            return mapWorkerToResponse(worker);
        } else {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User profile not found"));
            return mapUserToResponse(user);
        }
    }

    public ProfileResponse updateProfile(Long userId, Collection<? extends GrantedAuthority> authorities, ProfileUpdateRequest request) {
        boolean isWorker = authorities.stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_WORKER"));

        if (isWorker) {
            return updateWorkerProfile(userId, request);
        } else {
            return updateUserProfile(userId, request);
        }
    }

    private ProfileResponse updateUserProfile(Long userId, ProfileUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User profile not found"));

        // Update user fields
        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            user.setName(request.getName().trim());
        }
        
        if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
            String newEmail = request.getEmail().trim();
            // Email format validation
            if (!newEmail.matches("^[A-Za-z0-9+_.-]+@([A-Za-z0-9.-]+\\.[A-Za-z]{2,})$")) {
                throw new InvalidRequestException("Invalid email format");
            }
            // Check if email is being changed and if new email already exists
            if (!newEmail.equals(user.getEmail())) {
                if (userRepository.existsByEmail(newEmail) || workerRepository.existsByEmail(newEmail)) {
                    throw new InvalidRequestException("Email is already in use");
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

        User savedUser = userRepository.save(user);
        return mapUserToResponse(savedUser);
    }

    private ProfileResponse updateWorkerProfile(Long userId, ProfileUpdateRequest request) {
        Worker worker = workerRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Worker profile not found"));

        // Update user fields
        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            worker.setName(request.getName().trim());
        }
        
        if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
            String newEmail = request.getEmail().trim();
            // Email format validation
            if (!newEmail.matches("^[A-Za-z0-9+_.-]+@([A-Za-z0-9.-]+\\.[A-Za-z]{2,})$")) {
                throw new InvalidRequestException("Invalid email format");
            }
            // Check if email is being changed and if new email already exists
            if (!newEmail.equals(worker.getEmail())) {
                if (userRepository.existsByEmail(newEmail) || workerRepository.existsByEmail(newEmail)) {
                    throw new InvalidRequestException("Email is already in use");
                }
                worker.setEmail(newEmail);
            }
        }
        
        if (request.getContactDetails() != null) {
            worker.setContactDetails(request.getContactDetails().trim());
        }

        if (request.getAddress() != null) {
            worker.setAddress(request.getAddress().trim());
        }

        // Update worker-specific fields
        if (request.getLocation() != null) {
            worker.setLocation(request.getLocation().trim());
        }
        
        if (request.getDescription() != null) {
            worker.setDescription(request.getDescription().trim());
        }
        
        if (request.getServiceType() != null) {
            worker.setServiceType(request.getServiceType().trim());
        }
        
        if (request.getMinimumCharge() != null && request.getMinimumCharge() >= 0) {
            worker.setMinimumCharge(request.getMinimumCharge());
        }
        
        if (request.getHourlyCharge() != null && request.getHourlyCharge() >= 0) {
            worker.setHourlyCharge(request.getHourlyCharge());
        }
        
        if (request.getAvailability() != null) {
            worker.setAvailability(request.getAvailability());
        }

        Worker savedWorker = workerRepository.save(worker);
        return mapWorkerToResponse(savedWorker);
    }

    private ProfileResponse mapUserToResponse(User user) {
        String roleName = user.getRole() != null ? user.getRole().name() : "USER";
        return ProfileResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .contactDetails(user.getContactDetails())
                .address(user.getAddress())
                .role(roleName)
                .build();
    }

    private ProfileResponse mapWorkerToResponse(Worker worker) {
        return ProfileResponse.builder()
                .id(worker.getId())
                .name(worker.getName())
                .email(worker.getEmail())
                .contactDetails(worker.getContactDetails())
                .address(worker.getAddress() != null ? worker.getAddress() : "")
                .location(worker.getLocation())
                .description(worker.getDescription())
                .serviceType(worker.getServiceType())
                .rating(worker.getRating())
                .minimumCharge(worker.getMinimumCharge())
                .hourlyCharge(worker.getHourlyCharge())
                .availability(worker.getAvailability())
                .role("WORKER")
                .build();
    }
}
