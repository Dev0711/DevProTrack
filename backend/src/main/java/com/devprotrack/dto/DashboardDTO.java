package com.devprotrack.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardDTO {
    private String username;
    private Long totalRepositories;
    private Long activeRepositories;
    private LocalDateTime lastSyncTime;

    private CommitStatsDTO commitStats;
    private PullRequestStatsDTO pullRequestStats;

    // Overall productivity indicators
    private Double commitTrend; // +/- percentage compared to previous period
    private Double prCompletionTrend; // +/- percentage compared to previous period
    private Map<String, Double> focusTimeByDay; // hours of coding activity by day

    // Most active repositories
    private List<Map<String, Object>> topRepositories;
}