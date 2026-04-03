package com.example.BackendTask.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "health_service_intakes")
public class HealthServiceIntake {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @Column(nullable = false, length = 100)
    private String patientName;

    @Column
    private Integer age;

    @Column(length = 20)
    private String contactNumber;

    @Column(length = 1000)
    private String problemDescription;

    @Column(length = 100)
    private String hospitalName;

    @Column(length = 100)
    private String doctorName;

    @Column(length = 100)
    private String village;

    @Column(length = 100)
    private String mandal;

    @Column(length = 100)
    private String district;

    @Column(length = 100)
    private String state;

    @Enumerated(EnumType.STRING)
    private ServiceModuleStatus status;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = ServiceModuleStatus.OPEN;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
