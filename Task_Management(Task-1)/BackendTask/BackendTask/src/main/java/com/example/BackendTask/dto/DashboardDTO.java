package com.example.BackendTask.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DashboardDTO {
    private Long userId;
    private String userRole;
    private String userName;
    
    // Summary metrics
    private Integer totalAttendance;
    private Integer totalLeads;
    private Integer approvedLeads;
    private Integer totalComplaints;
    private Integer resolvedComplaints;
    private BigDecimal leadConversionRate;
    
    // Daily metrics
    private Integer todayAttendance;
    private Integer todayLeads;
    
    // Service module counts
    private Integer homeCarePatients;
    private Integer healthServiceIntakes;
    private Integer securityComplaints;
    private Integer marketingEntries;
    private Integer educationRequests;
    
    // Weekly/Monthly trends
    private List<Map<String, Object>> weeklyTrends;
    private List<Map<String, Object>> monthlyTrends;
    
    // Service-wise performance
    private List<Map<String, Object>> servicePerformance;
    
    // Pending approvals (for managers)
    private Integer pendingLeadApprovals;
    private Integer pendingLeaveRequests;
}
