package com.workconnect.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileResponse {
    
    private Long id;
    private String name;
    private String email;
    private String contactDetails;
    private String address;
    private String role;
    
    // Worker-specific fields
    private String location;
    private String description;
    private String serviceType;
    private Double rating;
    private Double minimumCharge;
    private Double hourlyCharge;
    private Boolean availability;
}
