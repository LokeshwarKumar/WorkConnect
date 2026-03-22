package com.workconnect.backend.entity;

import java.util.List;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "workers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Worker {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String contactDetails; // Mobile number

    @Column
    @Builder.Default
    private String address = "";

    @Column(nullable = false)
    private String location; // Where they work

    private String description; // About their work

    @Column(nullable = false)
    private String serviceType; // What work they do

    private Double rating;

    @Column(nullable = false)
    private Double minimumCharge;

    @Column(nullable = false)
    private Double hourlyCharge;

    private Boolean availability;

    @Column(nullable = false)
    @Builder.Default
    private Boolean approved = true;

    // Relationships
    @OneToMany(mappedBy = "worker", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ServiceRequest> serviceRequestsAsWorker;

    @OneToMany(mappedBy = "worker", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Review> reviewsReceived;
}
