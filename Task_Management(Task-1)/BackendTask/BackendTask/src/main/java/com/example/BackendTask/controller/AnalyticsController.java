package com.example.BackendTask.controller;

import com.example.BackendTask.dto.DashboardDTO;
import com.example.BackendTask.entity.*;
import com.example.BackendTask.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final UserRepository userRepository;
    private final AttendanceRepository attendanceRepository;
    private final LeadRepository leadRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final ComplaintRepository complaintRepository;
    private final DailyAnalyticsRepository dailyAnalyticsRepository;
    private final ServiceAnalyticsRepository serviceAnalyticsRepository;
    private final HomeCarePatientRepository homeCarePatientRepository;
    private final HealthServiceIntakeRepository healthServiceIntakeRepository;
    private final SecurityComplaintRepository securityComplaintRepository;
    private final MarketingEntryRepository marketingEntryRepository;
    private final EducationGuidanceRequestRepository educationGuidanceRequestRepository;

    public AnalyticsController(UserRepository userRepository,
                             AttendanceRepository attendanceRepository,
                             LeadRepository leadRepository,
                             LeaveRequestRepository leaveRequestRepository,
                             ComplaintRepository complaintRepository,
                             DailyAnalyticsRepository dailyAnalyticsRepository,
                             ServiceAnalyticsRepository serviceAnalyticsRepository,
                             HomeCarePatientRepository homeCarePatientRepository,
                             HealthServiceIntakeRepository healthServiceIntakeRepository,
                             SecurityComplaintRepository securityComplaintRepository,
                             MarketingEntryRepository marketingEntryRepository,
                             EducationGuidanceRequestRepository educationGuidanceRequestRepository) {
        this.userRepository = userRepository;
        this.attendanceRepository = attendanceRepository;
        this.leadRepository = leadRepository;
        this.leaveRequestRepository = leaveRequestRepository;
        this.complaintRepository = complaintRepository;
        this.dailyAnalyticsRepository = dailyAnalyticsRepository;
        this.serviceAnalyticsRepository = serviceAnalyticsRepository;
        this.homeCarePatientRepository = homeCarePatientRepository;
        this.healthServiceIntakeRepository = healthServiceIntakeRepository;
        this.securityComplaintRepository = securityComplaintRepository;
        this.marketingEntryRepository = marketingEntryRepository;
        this.educationGuidanceRequestRepository = educationGuidanceRequestRepository;
    }

    @GetMapping("/dashboard/{userId}")
    public ResponseEntity<DashboardDTO> getDashboard(@PathVariable Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        DashboardDTO dashboard = new DashboardDTO();
        dashboard.setUserId(userId);
        dashboard.setUserRole(user.getRole().name());
        dashboard.setUserName(user.getName());

        // Calculate metrics based on role
        LocalDate today = LocalDate.now();
        LocalDate thirtyDaysAgo = today.minusDays(30);

        // Attendance metrics
        dashboard.setTotalAttendance((int) attendanceRepository.countByUserIdAndStatus(userId, AttendanceStatus.PRESENT));
        dashboard.setTodayAttendance((int) attendanceRepository.findByUserIdAndAttendanceDateBetween(userId, today, today)
                .stream().filter(a -> a.getStatus() == AttendanceStatus.PRESENT).count());

        // Lead metrics
        List<Lead> userLeads = leadRepository.findByCreatedByIdOrderByCreatedAtDesc(userId);
        dashboard.setTotalLeads(userLeads.size());
        dashboard.setApprovedLeads((int) userLeads.stream()
                .filter(l -> l.getApprovalStatus() == ApprovalStatus.APPROVED).count());
        dashboard.setTodayLeads((int) userLeads.stream()
                .filter(l -> l.getCreatedAt().toLocalDate().equals(today)).count());

        // Lead conversion rate
        if (!userLeads.isEmpty()) {
            long approvedCount = userLeads.stream()
                    .filter(l -> l.getApprovalStatus() == ApprovalStatus.APPROVED).count();
            dashboard.setLeadConversionRate(new java.math.BigDecimal(approvedCount * 100 / userLeads.size()));
        }

        // Complaint metrics
        List<Complaint> userComplaints = complaintRepository.findByUserIdOrderByCreatedAtDesc(userId);
        dashboard.setTotalComplaints(userComplaints.size());
        dashboard.setResolvedComplaints((int) userComplaints.stream()
                .filter(c -> c.getComplaintStatus() == ComplaintStatus.RESOLVED ||
                        c.getComplaintStatus() == ComplaintStatus.CLOSED).count());

        // Service module counts
        dashboard.setHomeCarePatients((int) homeCarePatientRepository.findByCreatedByIdAndStatus(userId, ServiceModuleStatus.ACTIVE).size());
        dashboard.setHealthServiceIntakes((int) healthServiceIntakeRepository.findByCreatedByIdAndStatus(userId, ServiceModuleStatus.OPEN).size());
        dashboard.setSecurityComplaints((int) securityComplaintRepository.findByCreatedByIdOrderByCreatedAtDesc(userId).size());
        dashboard.setMarketingEntries((int) marketingEntryRepository.findByCreatedByIdOrderByCreatedAtDesc(userId).size());
        dashboard.setEducationRequests((int) educationGuidanceRequestRepository.findByCreatedByIdAndStatus(userId, ServiceModuleStatus.OPEN).size());

        // Pending approvals (for managers)
        if (user.getRole() == Role.ADMIN || user.getRole() == Role.SELLER) {
            dashboard.setPendingLeadApprovals((int) leadRepository.findByApprovalStatus(ApprovalStatus.PENDING).size());
            dashboard.setPendingLeaveRequests((int) leaveRequestRepository.findByStatus(LeaveStatus.PENDING).size());
        }

        return ResponseEntity.ok(dashboard);
    }

    @GetMapping("/daily/{startDate}/{endDate}")
    public ResponseEntity<List<DailyAnalytics>> getDailyAnalytics(@PathVariable String startDate,
                                                                  @PathVariable String endDate) {
        LocalDate start = LocalDate.parse(startDate);
        LocalDate end = LocalDate.parse(endDate);
        List<DailyAnalytics> analytics = dailyAnalyticsRepository.findByAnalyticsDateBetween(start, end);
        return ResponseEntity.ok(analytics);
    }

    @GetMapping("/service-performance/{startDate}/{endDate}")
    public ResponseEntity<List<ServiceAnalytics>> getServiceAnalytics(@PathVariable String startDate,
                                                                     @PathVariable String endDate) {
        LocalDate start = LocalDate.parse(startDate);
        LocalDate end = LocalDate.parse(endDate);
        List<ServiceAnalytics> analytics = serviceAnalyticsRepository.findByAnalyticsDateBetween(start, end);
        return ResponseEntity.ok(analytics);
    }

    @GetMapping("/leads/status-breakdown")
    public ResponseEntity<Map<String, Long>> getLeadsStatusBreakdown() {
        Map<String, Long> breakdown = new HashMap<>();
        breakdown.put("WEAK", leadRepository.countByLeadStatus(LeadStatus.WEAK));
        breakdown.put("MEDIUM", leadRepository.countByLeadStatus(LeadStatus.MEDIUM));
        breakdown.put("STRONG", leadRepository.countByLeadStatus(LeadStatus.STRONG));
        breakdown.put("PENDING_APPROVAL", leadRepository.countByApprovalStatus(ApprovalStatus.PENDING));
        breakdown.put("APPROVED", leadRepository.countByApprovalStatus(ApprovalStatus.APPROVED));
        return ResponseEntity.ok(breakdown);
    }

    @GetMapping("/complaints/status-breakdown")
    public ResponseEntity<Map<String, Long>> getComplaintsStatusBreakdown() {
        Map<String, Long> breakdown = new HashMap<>();
        breakdown.put("OPEN", complaintRepository.countByComplaintStatus(ComplaintStatus.OPEN));
        breakdown.put("IN_PROGRESS", complaintRepository.countByComplaintStatus(ComplaintStatus.IN_PROGRESS));
        breakdown.put("RESOLVED", complaintRepository.countByComplaintStatus(ComplaintStatus.RESOLVED));
        breakdown.put("CLOSED", complaintRepository.countByComplaintStatus(ComplaintStatus.CLOSED));
        return ResponseEntity.ok(breakdown);
    }

    @GetMapping("/complaints/priority-breakdown")
    public ResponseEntity<Map<String, Long>> getComplaintsPriorityBreakdown() {
        Map<String, Long> breakdown = new HashMap<>();
        breakdown.put("LOW", complaintRepository.countByPriority(Priority.LOW));
        breakdown.put("MEDIUM", complaintRepository.countByPriority(Priority.MEDIUM));
        breakdown.put("HIGH", complaintRepository.countByPriority(Priority.HIGH));
        breakdown.put("URGENT", complaintRepository.countByPriority(Priority.URGENT));
        return ResponseEntity.ok(breakdown);
    }
}
