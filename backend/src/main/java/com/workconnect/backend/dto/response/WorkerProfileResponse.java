package com.workconnect.backend.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class WorkerProfileResponse {
    private Long id;
    private Long workerId;
    private String workerName;
    private String workerEmail;
    private String serviceType;
    private String location;
    private Double minimumCharge;
    private Double hourlyCharge;
    private Double rating;
    private Boolean availability;
}
