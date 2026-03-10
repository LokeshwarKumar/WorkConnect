package com.workconnect.backend.service;

import com.workconnect.backend.dto.request.ReviewForm;
import com.workconnect.backend.entity.Review;
import com.workconnect.backend.entity.ServiceRequest;
import com.workconnect.backend.entity.User;
import com.workconnect.backend.entity.WorkerProfile;
import com.workconnect.backend.enums.ServiceRequestStatus;
import com.workconnect.backend.exception.InvalidRequestException;
import com.workconnect.backend.exception.ResourceNotFoundException;
import com.workconnect.backend.exception.UnauthorizedException;
import com.workconnect.backend.repository.ReviewRepository;
import com.workconnect.backend.repository.ServiceRequestRepository;
import com.workconnect.backend.repository.UserRepository;
import com.workconnect.backend.repository.WorkerProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private ServiceRequestRepository requestRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WorkerProfileRepository workerProfileRepository;

    public void createReview(Long userId, ReviewForm form) {
        User reviewer = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        ServiceRequest request = requestRepository.findById(form.getServiceRequestId())
                .orElseThrow(() -> new ResourceNotFoundException("Service request not found"));

        if (!request.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You can only review your own requests");
        }

        if (request.getStatus() != ServiceRequestStatus.COMPLETED) {
            throw new InvalidRequestException("You can only review completed services");
        }

        Review review = Review.builder()
                .serviceRequest(request)
                .reviewer(reviewer)
                .worker(request.getWorker())
                .rating(form.getRating())
                .comment(form.getComment())
                .reviewDate(LocalDateTime.now())
                .build();

        reviewRepository.save(review);
        updateWorkerRating(request.getWorker().getId());
    }

    private void updateWorkerRating(Long workerId) {
        List<Review> workerReviews = reviewRepository.findByWorkerId(workerId);
        
        if (workerReviews.isEmpty()) return;

        double sum = workerReviews.stream().mapToDouble(Review::getRating).sum();
        double newRating = sum / workerReviews.size();

        WorkerProfile profile = workerProfileRepository.findByUserId(workerId)
                .orElseThrow(() -> new ResourceNotFoundException("Worker Profile not found while calculating rating"));
        
        profile.setRating(Math.round(newRating * 10.0) / 10.0); // Round to 1 decimal place
        workerProfileRepository.save(profile);
    }
}
