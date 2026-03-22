package com.workconnect.backend.service;

import com.workconnect.backend.dto.response.AdminStatsResponse;
import com.workconnect.backend.entity.User;
import com.workconnect.backend.enums.Role;
import com.workconnect.backend.enums.ServiceRequestStatus;
import com.workconnect.backend.exception.ResourceNotFoundException;
import com.workconnect.backend.repository.ReviewRepository;
import com.workconnect.backend.repository.ServiceRequestRepository;
import com.workconnect.backend.repository.UserRepository;
import com.workconnect.backend.repository.WorkerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WorkerRepository workerRepository;

    @Autowired
    private ServiceRequestRepository serviceRequestRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public void deleteUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found with id: " + userId);
        }
        userRepository.deleteById(userId);
    }

    public void deleteWorker(Long workerId) {
        if (!workerRepository.existsById(workerId)) {
            throw new ResourceNotFoundException("Worker not found with id: " + workerId);
        }
        workerRepository.deleteById(workerId);
    }

    public AdminStatsResponse getStats() {
        long totalUsers = userRepository.count();
        long admins = userRepository.countByRole(Role.ADMIN);
        long customers = Math.max(0, totalUsers - admins);

        Double avg = reviewRepository.averageRating();
        if (avg != null) {
            avg = Math.round(avg * 10.0) / 10.0;
        }

        return AdminStatsResponse.builder()
                .customerCount(customers)
                .administratorCount(admins)
                .workerCount(workerRepository.count())
                .totalServiceRequests(serviceRequestRepository.count())
                .completedServiceRequests(serviceRequestRepository.countByStatus(ServiceRequestStatus.COMPLETED))
                .totalReviews(reviewRepository.count())
                .averageReviewRating(avg)
                .build();
    }
}
