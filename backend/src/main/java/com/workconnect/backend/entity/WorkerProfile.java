package com.workconnect.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "worker_profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkerProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String serviceType;
    
    @Column(nullable = false)
    private String location;

    private Double minimumCharge;

    private Double hourlyCharge;

    private Double rating;

    private Boolean availability;
}
