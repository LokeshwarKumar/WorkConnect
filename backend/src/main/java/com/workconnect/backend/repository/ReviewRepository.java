package com.workconnect.backend.repository;

import com.workconnect.backend.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByWorker_IdOrderByReviewDateDesc(Long workerId);

    boolean existsByServiceRequest_Id(Long serviceRequestId);

    @Query("SELECT COALESCE(AVG(r.rating), 0) FROM Review r")
    Double averageRating();
}
