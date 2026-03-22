package com.workconnect.backend.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class WorkerRequest {
    
    @NotBlank(message = "Name is required")
    private String name;
    
    @NotBlank(message = "Email is required")
    private String email;
    
    @NotBlank(message = "Password is required")
    private String password;
    
    @NotBlank(message = "Contact details are required")
    private String contactDetails;

    private String address;
    
    @NotBlank(message = "Location is required")
    private String location;
    
    private String description;
    
    @NotBlank(message = "Service type is required")
    private String serviceType;
    
    @NotNull(message = "Minimum charge is required")
    @Min(value = 0, message = "Minimum charge must be non-negative")
    private Double minimumCharge;
    
    @NotNull(message = "Hourly charge is required")
    @Min(value = 0, message = "Hourly charge must be non-negative")
    private Double hourlyCharge;
    
    private Boolean availability;
}
