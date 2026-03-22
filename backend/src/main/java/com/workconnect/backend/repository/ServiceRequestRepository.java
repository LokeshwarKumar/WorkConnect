package com.workconnect.backend.repository;

import com.workconnect.backend.entity.ServiceRequest;
import com.workconnect.backend.enums.ServiceRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceRequestRepository extends JpaRepository<ServiceRequest, Long> {

    long countByStatus(ServiceRequestStatus status);

    @Query("SELECT DISTINCT r FROM ServiceRequest r "
            + "LEFT JOIN FETCH r.user "
            + "LEFT JOIN FETCH r.worker "
            + "LEFT JOIN FETCH r.review "
            + "WHERE r.user.id = :userId ORDER BY r.requestDate DESC")
    List<ServiceRequest> findAllByUserForList(@Param("userId") Long userId);

    @Query("SELECT DISTINCT r FROM ServiceRequest r "
            + "LEFT JOIN FETCH r.user "
            + "LEFT JOIN FETCH r.worker "
            + "LEFT JOIN FETCH r.review "
            + "WHERE r.worker.id = :workerId ORDER BY r.requestDate DESC")
    List<ServiceRequest> findAllByWorkerForList(@Param("workerId") Long workerId);

    @Query("SELECT r.worker.id, COUNT(r) FROM ServiceRequest r " +
            "WHERE r.status = :status AND r.worker.id IN :workerIds " +
            "GROUP BY r.worker.id")
    List<Object[]> countByWorkerIdsAndStatus(
            @Param("workerIds") List<Long> workerIds,
            @Param("status") ServiceRequestStatus status);
}
