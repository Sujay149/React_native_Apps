package com.example.BackendTask.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "service_analytics")
public class ServiceAnalytics {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 100)
    private String serviceType; // Home Care, Marketing, Health, Security, Education

    @Column(name = "analytics_date")
    private LocalDate analyticsDate;

    @Column(name = "total_entries")
    private Integer totalEntries;

    @Column(name = "active_entries")
    private Integer activeEntries;

    @Column(name = "completed_entries")
    private Integer completedEntries;

    @Column(name = "performance_score", precision = 5, scale = 2)
    private BigDecimal performanceScore;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (totalEntries == null) totalEntries = 0;
        if (activeEntries == null) activeEntries = 0;
        if (completedEntries == null) completedEntries = 0;
    }
}
