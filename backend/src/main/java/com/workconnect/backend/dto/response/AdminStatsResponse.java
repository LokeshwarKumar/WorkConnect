package com.workconnect.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminStatsResponse {
    private long customerCount;
    private long administratorCount;
    private long workerCount;
    private long totalServiceRequests;
    private long completedServiceRequests;
    private long totalReviews;
    private Double averageReviewRating;
}
