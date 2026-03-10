package com.workconnect.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ServiceRequestForm {
    @NotNull(message = "Worker ID is required")
    private Long workerId;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Location is required")
    private String location;
}
