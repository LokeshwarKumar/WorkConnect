package com.workconnect.backend.repository;

import com.workconnect.backend.entity.Worker;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WorkerRepository extends JpaRepository<Worker, Long> {
    Optional<Worker> findByEmail(String email);
    Boolean existsByEmail(String email);

    @Query("SELECT w FROM Worker w WHERE (w.approved IS NULL OR w.approved = true) "
            + "AND (:serviceType IS NULL OR LOWER(w.serviceType) LIKE LOWER(CONCAT('%', :serviceType, '%'))) "
            + "AND (:location IS NULL OR LOWER(w.location) LIKE LOWER(CONCAT('%', :location, '%'))) "
            + "AND (:keyword IS NULL OR LOWER(w.serviceType) LIKE LOWER(CONCAT('%', :keyword, '%')) "
            + "     OR LOWER(COALESCE(w.description, '')) LIKE LOWER(CONCAT('%', :keyword, '%')) "
            + "     OR LOWER(COALESCE(w.location, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))) "
            + "AND (:maxCharge IS NULL OR w.minimumCharge <= :maxCharge) "
            + "AND w.availability = true "
            + "AND COALESCE(w.rating, 0) >= :minRating")
    Page<Worker> searchApprovedMarketplace(
            @Param("serviceType") String serviceType,
            @Param("location") String location,
            @Param("keyword") String keyword,
            @Param("maxCharge") Double maxCharge,
            @Param("minRating") Double minRating,
            Pageable pageable);
}
