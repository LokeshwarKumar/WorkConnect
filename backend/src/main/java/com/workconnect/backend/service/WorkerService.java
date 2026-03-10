package com.workconnect.backend.service;

import com.workconnect.backend.dto.request.WorkerProfileRequest;
import com.workconnect.backend.dto.response.WorkerProfileResponse;
import com.workconnect.backend.entity.User;
import com.workconnect.backend.entity.WorkerProfile;
import com.workconnect.backend.enums.Role;
import com.workconnect.backend.exception.InvalidRequestException;
import com.workconnect.backend.exception.ResourceNotFoundException;
import com.workconnect.backend.repository.UserRepository;
import com.workconnect.backend.repository.WorkerProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class WorkerService {

    @Autowired
    private WorkerProfileRepository workerProfileRepository;

    @Autowired
    private UserRepository userRepository;

    public void createOrUpdateWorkerProfile(Long userId, WorkerProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getRole() != Role.WORKER) {
            throw new InvalidRequestException("User is not a worker");
        }

        WorkerProfile profile = workerProfileRepository.findByUserId(userId)
                .orElse(new WorkerProfile());

        profile.setUser(user);
        profile.setServiceType(request.getServiceType());
        profile.setLocation(request.getLocation());
        profile.setMinimumCharge(request.getMinimumCharge());
        profile.setHourlyCharge(request.getHourlyCharge());
        
        if (request.getAvailability() != null) {
             profile.setAvailability(request.getAvailability());
        } else if (profile.getAvailability() == null) {
             profile.setAvailability(true); // default to true
        }

        if (profile.getRating() == null) {
            profile.setRating(0.0);
        }

        workerProfileRepository.save(profile);
    }

    public Page<WorkerProfileResponse> searchWorkers(String serviceType, String location, Double maxCharge, Pageable pageable) {
        Page<WorkerProfile> profiles = workerProfileRepository
                .findByServiceTypeContainingIgnoreCaseAndLocationContainingIgnoreCaseAndMinimumChargeLessThanEqualAndAvailabilityTrue(
                        serviceType, location, maxCharge, pageable);

        return profiles.map(this::mapToResponse);
    }

    public WorkerProfileResponse getWorkerProfile(Long workerId) {
        WorkerProfile profile = workerProfileRepository.findByUserId(workerId)
                .orElseThrow(() -> new ResourceNotFoundException("Worker profile not found for user: " + workerId));

        return mapToResponse(profile);
    }

    private WorkerProfileResponse mapToResponse(WorkerProfile profile) {
        return WorkerProfileResponse.builder()
                .id(profile.getId())
                .workerId(profile.getUser().getId())
                .workerName(profile.getUser().getName())
                .workerEmail(profile.getUser().getEmail())
                .serviceType(profile.getServiceType())
                .location(profile.getLocation())
                .minimumCharge(profile.getMinimumCharge())
                .hourlyCharge(profile.getHourlyCharge())
                .rating(profile.getRating())
                .availability(profile.getAvailability())
                .build();
    }
}
