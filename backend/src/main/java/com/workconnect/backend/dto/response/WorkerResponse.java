package com.workconnect.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class WorkerResponse {
    private Long id;
    private String name;
    private String email;
    private String contactDetails;
    private String address;
    private String location;
    private String description;
    private String serviceType;
    private Double rating;
    private Double minimumCharge;
    private Double hourlyCharge;
    private Boolean availability;
    private Boolean approved;
    private Long servicesDone;
}
