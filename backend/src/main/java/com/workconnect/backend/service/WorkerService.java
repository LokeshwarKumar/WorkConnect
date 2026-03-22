package com.workconnect.backend.service;

import com.workconnect.backend.dto.request.WorkerRequest;
import com.workconnect.backend.dto.request.WorkerProfileUpdateRequest;
import com.workconnect.backend.dto.response.WorkerResponse;
import com.workconnect.backend.enums.ServiceRequestStatus;
import com.workconnect.backend.entity.Worker;
import com.workconnect.backend.exception.InvalidRequestException;
import com.workconnect.backend.exception.ResourceNotFoundException;
import com.workconnect.backend.exception.UnauthorizedException;
import com.workconnect.backend.security.services.UserDetailsImpl;
import com.workconnect.backend.repository.ServiceRequestRepository;
import com.workconnect.backend.repository.WorkerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.List;
import java.util.Map;

@Service
public class WorkerService {

    @Autowired
    private WorkerRepository workerRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ServiceRequestRepository serviceRequestRepository;

    public WorkerResponse createWorker(WorkerRequest request) {
        if (workerRepository.existsByEmail(request.getEmail())) {
            throw new InvalidRequestException("Email already exists");
        }

        Worker worker = Worker.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .contactDetails(request.getContactDetails())
                .address(request.getAddress() != null && !request.getAddress().isBlank()
                        ? request.getAddress().trim() : "")
                .location(request.getLocation())
                .description(request.getDescription())
                .serviceType(request.getServiceType())
                .minimumCharge(request.getMinimumCharge())
                .hourlyCharge(request.getHourlyCharge())
                .availability(request.getAvailability() != null ? request.getAvailability() : true)
                .rating(0.0)
                .approved(true)
                .build();

        Worker savedWorker = workerRepository.save(worker);
        // New worker starts with 0 completed services.
        return mapToResponse(savedWorker, 0L);
    }

    public WorkerResponse updateWorkerProfile(Long workerId, WorkerProfileUpdateRequest request) {
        Worker worker = workerRepository.findById(workerId)
                .orElseThrow(() -> new ResourceNotFoundException("Worker not found with id: " + workerId));

        // Update only non-null fields
        if (request.getLocation() != null && !request.getLocation().trim().isEmpty()) {
            worker.setLocation(request.getLocation().trim());
        }
        if (request.getDescription() != null) {
            worker.setDescription(request.getDescription().trim());
        }
        if (request.getServiceType() != null && !request.getServiceType().trim().isEmpty()) {
            worker.setServiceType(request.getServiceType().trim());
        }
        if (request.getMinimumCharge() != null) {
            worker.setMinimumCharge(request.getMinimumCharge());
        }
        if (request.getHourlyCharge() != null) {
            worker.setHourlyCharge(request.getHourlyCharge());
        }
        if (request.getAvailability() != null) {
            worker.setAvailability(request.getAvailability());
        }

        Worker savedWorker = workerRepository.save(worker);
        return mapToResponse(savedWorker, servicesDoneForWorker(workerId));
    }

    public WorkerResponse updateWorker(Long workerId, WorkerRequest request, UserDetailsImpl principal) {
        Worker worker = workerRepository.findById(workerId)
                .orElseThrow(() -> new ResourceNotFoundException("Worker not found with id: " + workerId));

        assertCanManageWorker(workerId, principal);

        // Update only non-null fields
        if (request.getName() != null) {
            worker.setName(request.getName());
        }
        if (request.getContactDetails() != null) {
            worker.setContactDetails(request.getContactDetails());
        }
        if (request.getLocation() != null) {
            worker.setLocation(request.getLocation());
        }
        if (request.getDescription() != null) {
            worker.setDescription(request.getDescription());
        }
        if (request.getServiceType() != null) {
            worker.setServiceType(request.getServiceType());
        }
        if (request.getMinimumCharge() != null) {
            worker.setMinimumCharge(request.getMinimumCharge());
        }
        if (request.getHourlyCharge() != null) {
            worker.setHourlyCharge(request.getHourlyCharge());
        }
        if (request.getAvailability() != null) {
            worker.setAvailability(request.getAvailability());
        }

        Worker savedWorker = workerRepository.save(worker);
        return mapToResponse(savedWorker, servicesDoneForWorker(workerId));
    }

    public WorkerResponse getWorker(Long workerId) {
        Worker worker = workerRepository.findById(workerId)
                .orElseThrow(() -> new ResourceNotFoundException("Worker not found with id: " + workerId));
        return mapToResponse(worker, servicesDoneForWorker(workerId));
    }

    @Transactional(readOnly = true)
    public List<WorkerResponse> listAllWorkers() {
        List<Worker> allWorkers = workerRepository.findAll();
        List<Long> workerIds = allWorkers.stream().map(Worker::getId).toList();
        Map<Long, Long> completedCounts = servicesDoneByWorkerIds(workerIds);

        return allWorkers.stream()
                .map(w -> mapToResponse(w, completedCounts.getOrDefault(w.getId(), 0L)))
                .toList();
    }

    public WorkerResponse setWorkerApproved(Long workerId, boolean approved) {
        Worker worker = workerRepository.findById(workerId)
                .orElseThrow(() -> new ResourceNotFoundException("Worker not found with id: " + workerId));
        worker.setApproved(approved);
        Worker saved = workerRepository.save(worker);
        return mapToResponse(saved, servicesDoneForWorker(workerId));
    }

    public Page<WorkerResponse> searchWorkers(String serviceType, String location, String keyword,
                                              Double maxCharge, Double minRating, Pageable pageable) {
        String st = blankToNull(serviceType);
        String loc = blankToNull(location);
        String kw = blankToNull(keyword);
        double minR = minRating != null ? minRating : 0.0;

        Page<Worker> workers = workerRepository.searchApprovedMarketplace(st, loc, kw, maxCharge, minR, pageable);

        List<Long> workerIds = workers.getContent().stream().map(Worker::getId).toList();
        Map<Long, Long> completedCounts = servicesDoneByWorkerIds(workerIds);

        return workers.map(w -> mapToResponse(w, completedCounts.getOrDefault(w.getId(), 0L)));
    }

    private static String blankToNull(String s) {
        if (s == null || s.isBlank()) {
            return null;
        }
        return s.trim();
    }

    private void assertCanManageWorker(Long workerId, UserDetailsImpl principal) {
        boolean admin = hasRole(principal.getAuthorities(), "ROLE_ADMIN");
        if (admin) {
            return;
        }
        if (!workerId.equals(principal.getId())) {
            throw new UnauthorizedException("You can only update your own worker profile");
        }
    }

    private static boolean hasRole(Collection<? extends GrantedAuthority> authorities, String role) {
        return authorities.stream().map(GrantedAuthority::getAuthority).anyMatch(role::equals);
    }

    private WorkerResponse mapToResponse(Worker worker, Long servicesDone) {
        return WorkerResponse.builder()
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
                .approved(worker.getApproved() != null ? worker.getApproved() : true)
                .servicesDone(servicesDone != null ? servicesDone : 0L)
                .build();
    }

    private Long servicesDoneForWorker(Long workerId) {
        Map<Long, Long> counts = servicesDoneByWorkerIds(List.of(workerId));
        return counts.getOrDefault(workerId, 0L);
    }

    private Map<Long, Long> servicesDoneByWorkerIds(List<Long> workerIds) {
        if (workerIds == null || workerIds.isEmpty()) {
            return Map.of();
        }

        List<Object[]> rows = serviceRequestRepository.countByWorkerIdsAndStatus(workerIds, ServiceRequestStatus.COMPLETED);
        // rows item format: [workerId, count]
        Map<Long, Long> out = rows.stream().collect(java.util.stream.Collectors.toMap(
                r -> ((Number) r[0]).longValue(),
                r -> ((Number) r[1]).longValue()
        ));
        return out;
    }
}
