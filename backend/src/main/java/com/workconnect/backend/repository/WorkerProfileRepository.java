package com.workconnect.backend.repository;

import com.workconnect.backend.entity.WorkerProfile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WorkerProfileRepository extends JpaRepository<WorkerProfile, Long> {
    Optional<WorkerProfile> findByUserId(Long userId);
    
    Page<WorkerProfile> findByServiceTypeContainingIgnoreCaseAndLocationContainingIgnoreCaseAndMinimumChargeLessThanEqualAndAvailabilityTrue(
            String serviceType, String location, Double maxCharge, Pageable pageable);
}
