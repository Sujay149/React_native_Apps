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
@Table(name = "daily_analytics", uniqueConstraints = @UniqueConstraint(columnNames = {"analytics_date", "role"}))
public class DailyAnalytics {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "analytics_date", nullable = false)
    private LocalDate analyticsDate;

    @Column(length = 50)
    private String role;

    @Column(name = "total_attendance")
    private Integer totalAttendance;

    @Column(name = "total_leads")
    private Integer totalLeads;

    @Column(name = "approved_leads")
    private Integer approvedLeads;

    @Column(name = "total_complaints")
    private Integer totalComplaints;

    @Column(name = "resolved_complaints")
    private Integer resolvedComplaints;

    @Column(name = "lead_conversion_rate", precision = 5, scale = 2)
    private BigDecimal leadConversionRate;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (totalAttendance == null) totalAttendance = 0;
        if (totalLeads == null) totalLeads = 0;
        if (approvedLeads == null) approvedLeads = 0;
        if (totalComplaints == null) totalComplaints = 0;
        if (resolvedComplaints == null) resolvedComplaints = 0;
    }
}
