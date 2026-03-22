package com.workconnect.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UserProfileUpdateRequest {
    
    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String name;

    @Size(max = 100, message = "Email must not exceed 100 characters")
    private String email;

    @Size(max = 500, message = "Contact details must not exceed 500 characters")
    private String contactDetails;

    @Size(max = 500, message = "Address must not exceed 500 characters")
    private String address;
}
