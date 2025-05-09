package com.devprotrack.controller;

import com.devprotrack.dto.CommitStatsDTO;
import com.devprotrack.dto.DashboardDTO;
import com.devprotrack.dto.PullRequestStatsDTO;
import com.devprotrack.model.Repository;
import com.devprotrack.model.User;
import com.devprotrack.repository.RepositoryRepository;
import com.devprotrack.service.AnalyticsService;
import com.devprotrack.service.UserService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Optional;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;
    private final UserService userService;
    private final RepositoryRepository repositoryRepository;

    public AnalyticsController(AnalyticsService analyticsService,
            UserService userService,
            RepositoryRepository repositoryRepository) {
        this.analyticsService = analyticsService;
        this.userService = userService;
        this.repositoryRepository = repositoryRepository;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardDTO> getDashboard(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        User currentUser = userService.getCurrentUser();

        // Default to last 30 days if dates not provided
        LocalDateTime start = startDate != null ? LocalDateTime.of(startDate, LocalTime.MIN)
                : LocalDateTime.now().minusDays(30).with(LocalTime.MIN);

        LocalDateTime end = endDate != null ? LocalDateTime.of(endDate, LocalTime.MAX)
                : LocalDateTime.now().with(LocalTime.MAX);

        DashboardDTO dashboard = analyticsService.getDashboardData(currentUser, start, end);
        return ResponseEntity.ok(dashboard);
    }

    @GetMapping("/repository/{id}/commits")
    public ResponseEntity<CommitStatsDTO> getRepositoryCommitStats(
            @PathVariable Long id,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        User currentUser = userService.getCurrentUser();
        Optional<Repository> repository = repositoryRepository.findById(id);

        if (repository.isEmpty() || !repository.get().getUser().getId().equals(currentUser.getId())) {
            return ResponseEntity.notFound().build();
        }

        // Default to last 30 days if dates not provided
        LocalDateTime start = startDate != null ? LocalDateTime.of(startDate, LocalTime.MIN)
                : LocalDateTime.now().minusDays(30).with(LocalTime.MIN);

        LocalDateTime end = endDate != null ? LocalDateTime.of(endDate, LocalTime.MAX)
                : LocalDateTime.now().with(LocalTime.MAX);

        CommitStatsDTO stats = analyticsService.getCommitStats(repository.get(), start, end);
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/repository/{id}/pull-requests")
    public ResponseEntity<PullRequestStatsDTO> getRepositoryPullRequestStats(
            @PathVariable Long id,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        User currentUser = userService.getCurrentUser();
        Optional<Repository> repository = repositoryRepository.findById(id);

        if (repository.isEmpty() || !repository.get().getUser().getId().equals(currentUser.getId())) {
            return ResponseEntity.notFound().build();
        }

        // Default to last 30 days if dates not provided
        LocalDateTime start = startDate != null ? LocalDateTime.of(startDate, LocalTime.MIN)
                : LocalDateTime.now().minusDays(30).with(LocalTime.MIN);

        LocalDateTime end = endDate != null ? LocalDateTime.of(endDate, LocalTime.MAX)
                : LocalDateTime.now().with(LocalTime.MAX);

        PullRequestStatsDTO stats = analyticsService.getPullRequestStats(repository.get(), start, end);
        return ResponseEntity.ok(stats);
    }
}