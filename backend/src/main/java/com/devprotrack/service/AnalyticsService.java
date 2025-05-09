package com.devprotrack.service;

import com.devprotrack.dto.CommitStatsDTO;
import com.devprotrack.dto.DashboardDTO;
import com.devprotrack.dto.PullRequestStatsDTO;
import com.devprotrack.model.Repository;
import com.devprotrack.model.User;

import java.time.LocalDateTime;

public interface AnalyticsService {
    CommitStatsDTO getCommitStats(Repository repository, LocalDateTime startDate, LocalDateTime endDate);

    PullRequestStatsDTO getPullRequestStats(Repository repository, LocalDateTime startDate, LocalDateTime endDate);

    DashboardDTO getDashboardData(User user, LocalDateTime startDate, LocalDateTime endDate);
}