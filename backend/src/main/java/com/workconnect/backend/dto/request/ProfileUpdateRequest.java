package com.workconnect.backend.dto.request;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ProfileUpdateRequest {
    
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String name;

    @Pattern(regexp = "^$|^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$", message = "Invalid email format")
    @Size(max = 100, message = "Email must not exceed 100 characters")
    private String email;

    @Size(max = 20, message = "Contact details must not exceed 20 characters")
    private String contactDetails;

    @Size(max = 500, message = "Address must not exceed 500 characters")
    private String address;

    // Worker-specific fields
    @Size(max = 100, message = "Location must not exceed 100 characters")
    private String location;

    @Size(max = 200, message = "Description must not exceed 200 characters")
    private String description;

    @Size(max = 100, message = "Service type must not exceed 100 characters")
    private String serviceType;

    private Double minimumCharge;

    private Double hourlyCharge;

    private Boolean availability;
}
