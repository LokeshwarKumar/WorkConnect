package com.workconnect.backend.dto.response;

import com.workconnect.backend.enums.ServiceRequestStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ServiceRequestResponse {

    private Long id;
    private ServiceRequestStatus status;
    private LocalDateTime requestDate;
    private String description;
    private String location;
    /** Worker's primary service type (for display). */
    private String serviceType;
    private UserBrief user;
    private WorkerBrief worker;
    private boolean reviewed;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserBrief {
        private Long id;
        private String name;
        private String email;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WorkerBrief {
        private Long id;
        private String name;
        private String email;
        private String serviceType;
        private Double minimumCharge;
        private Double hourlyCharge;
    }
}
