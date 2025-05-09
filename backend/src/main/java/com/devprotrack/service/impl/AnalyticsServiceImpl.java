package com.devprotrack.service.impl;

import com.devprotrack.dto.CommitStatsDTO;
import com.devprotrack.dto.DashboardDTO;
import com.devprotrack.dto.PullRequestStatsDTO;
import com.devprotrack.model.Commit;
import com.devprotrack.model.PullRequest;
import com.devprotrack.model.Repository;
import com.devprotrack.model.User;
import com.devprotrack.repository.CommitRepository;
import com.devprotrack.repository.PullRequestRepository;
import com.devprotrack.repository.RepositoryRepository;
import com.devprotrack.service.AnalyticsService;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsServiceImpl implements AnalyticsService {

    private final CommitRepository commitRepository;
    private final PullRequestRepository pullRequestRepository;
    private final RepositoryRepository repositoryRepository;

    public AnalyticsServiceImpl(CommitRepository commitRepository,
            PullRequestRepository pullRequestRepository,
            RepositoryRepository repositoryRepository) {
        this.commitRepository = commitRepository;
        this.pullRequestRepository = pullRequestRepository;
        this.repositoryRepository = repositoryRepository;
    }

    @Override
    public CommitStatsDTO getCommitStats(Repository repository, LocalDateTime startDate, LocalDateTime endDate) {
        List<Commit> commits = commitRepository.findByRepositoryAndDateBetween(repository, startDate, endDate);

        if (commits.isEmpty()) {
            return new CommitStatsDTO(0L, 0.0, Collections.emptyMap(), Collections.emptyMap(), 0L, 0L, 0L);
        }

        long totalCommits = commits.size();

        // Calculate days between start and end date
        long daysBetween = ChronoUnit.DAYS.between(startDate.toLocalDate(), endDate.toLocalDate()) + 1;
        double avgCommitsPerDay = (double) totalCommits / daysBetween;

        // Group commits by author
        Map<String, Long> commitsByAuthor = commits.stream()
                .collect(Collectors.groupingBy(Commit::getAuthor, Collectors.counting()));

        // Group commits by day
        Map<LocalDate, Long> commitsByDay = commits.stream()
                .collect(Collectors.groupingBy(commit -> commit.getDate().toLocalDate(), Collectors.counting()));

        // Calculate code changes
        long totalAdditions = commits.stream().mapToInt(Commit::getAdditions).sum();
        long totalDeletions = commits.stream().mapToInt(Commit::getDeletions).sum();
        long totalFilesChanged = commits.stream().mapToInt(Commit::getFilesChanged).sum();

        return new CommitStatsDTO(
                totalCommits,
                avgCommitsPerDay,
                commitsByAuthor,
                commitsByDay,
                totalAdditions,
                totalDeletions,
                totalFilesChanged);
    }

    @Override
    public PullRequestStatsDTO getPullRequestStats(Repository repository, LocalDateTime startDate,
            LocalDateTime endDate) {
        List<PullRequest> prs = pullRequestRepository.findByRepositoryAndCreatedAtBetween(repository, startDate,
                endDate);

        if (prs.isEmpty()) {
            return new PullRequestStatsDTO(0L, 0L, 0L, 0L, 0.0, Collections.emptyMap(), Collections.emptyMap());
        }

        long totalPRs = prs.size();

        // Count PRs by state
        long openPRs = prs.stream().filter(pr -> "OPEN".equals(pr.getState())).count();
        long closedPRs = prs.stream().filter(pr -> "CLOSED".equals(pr.getState())).count();
        long mergedPRs = prs.stream().filter(pr -> pr.getMergedAt() != null).count();

        // Calculate average cycle time for merged PRs
        Double avgCycleTime = pullRequestRepository.getAverageCycleTime(repository, startDate, endDate);
        if (avgCycleTime == null) {
            avgCycleTime = 0.0;
        }

        // Group PRs by author
        Map<String, Long> prsByAuthor = prs.stream()
                .collect(Collectors.groupingBy(PullRequest::getAuthor, Collectors.counting()));

        // Group PRs by day
        Map<LocalDate, Long> prsByDay = prs.stream()
                .collect(Collectors.groupingBy(pr -> pr.getCreatedAt().toLocalDate(), Collectors.counting()));

        return new PullRequestStatsDTO(
                totalPRs,
                openPRs,
                closedPRs,
                mergedPRs,
                avgCycleTime,
                prsByAuthor,
                prsByDay);
    }

    @Override
    public DashboardDTO getDashboardData(User user, LocalDateTime startDate, LocalDateTime endDate) {
        List<Repository> repositories = repositoryRepository.findByUserAndActive(user, true);

        // Get previous period for trend calculation
        long periodDays = ChronoUnit.DAYS.between(startDate.toLocalDate(), endDate.toLocalDate()) + 1;
        LocalDateTime previousPeriodStart = startDate.minusDays(periodDays);
        LocalDateTime previousPeriodEnd = startDate.minusSeconds(1);

        // Initialize aggregated stats
        long totalCommits = 0;
        long previousPeriodCommits = 0;
        long totalPRs = 0;
        long previousPeriodPRs = 0;
        long completedPRs = 0;
        long previousPeriodCompletedPRs = 0;

        Map<LocalDate, Long> allCommitsByDay = new HashMap<>();
        Map<String, Long> allCommitsByAuthor = new HashMap<>();

        // Process each repository
        for (Repository repo : repositories) {
            // Current period
            List<Commit> commits = commitRepository.findByRepositoryAndDateBetween(repo, startDate, endDate);
            List<PullRequest> prs = pullRequestRepository.findByRepositoryAndCreatedAtBetween(repo, startDate, endDate);

            totalCommits += commits.size();
            totalPRs += prs.size();
            completedPRs += prs.stream().filter(pr -> pr.getMergedAt() != null).count();

            // Aggregate commits by day and author
            commits.forEach(commit -> {
                LocalDate commitDay = commit.getDate().toLocalDate();
                allCommitsByDay.put(commitDay, allCommitsByDay.getOrDefault(commitDay, 0L) + 1);

                String author = commit.getAuthor();
                allCommitsByAuthor.put(author, allCommitsByAuthor.getOrDefault(author, 0L) + 1);
            });

            // Previous period
            List<Commit> prevCommits = commitRepository.findByRepositoryAndDateBetween(
                    repo, previousPeriodStart, previousPeriodEnd);
            List<PullRequest> prevPRs = pullRequestRepository.findByRepositoryAndCreatedAtBetween(
                    repo, previousPeriodStart, previousPeriodEnd);

            previousPeriodCommits += prevCommits.size();
            previousPeriodPRs += prevPRs.size();
            previousPeriodCompletedPRs += prevPRs.stream().filter(pr -> pr.getMergedAt() != null).count();
        }

        // Calculate trends
        double commitTrend = calculateTrend(totalCommits, previousPeriodCommits);
        double prCompletionTrend = calculateTrend(completedPRs, previousPeriodCompletedPRs);

        // Estimate focus time by day (very simple heuristic for MVP)
        Map<String, Double> focusTimeByDay = allCommitsByDay.entrySet().stream()
                .collect(Collectors.toMap(
                        entry -> entry.getKey().toString(),
                        entry -> Math.min(entry.getValue() * 0.5, 8.0) // 30 min per commit, max 8 hours
                ));

        // Get top repositories by activity
        List<Map<String, Object>> topRepositories = getTopRepositories(repositories, startDate, endDate);

        // Create aggregate stats
        CommitStatsDTO commitStats = new CommitStatsDTO(
                totalCommits,
                (double) totalCommits / periodDays,
                allCommitsByAuthor,
                allCommitsByDay,
                repositories.stream()
                        .flatMap(repo -> commitRepository.findByRepositoryAndDateBetween(repo, startDate, endDate)
                                .stream())
                        .mapToLong(Commit::getAdditions)
                        .sum(),
                repositories.stream()
                        .flatMap(repo -> commitRepository.findByRepositoryAndDateBetween(repo, startDate, endDate)
                                .stream())
                        .mapToLong(Commit::getDeletions)
                        .sum(),
                repositories.stream()
                        .flatMap(repo -> commitRepository.findByRepositoryAndDateBetween(repo, startDate, endDate)
                                .stream())
                        .mapToLong(Commit::getFilesChanged)
                        .sum());

        // Calculate PR stats
        PullRequestStatsDTO prStats = new PullRequestStatsDTO(
                totalPRs,
                repositories.stream()
                        .flatMap(repo -> pullRequestRepository
                                .findByRepositoryAndCreatedAtBetween(repo, startDate, endDate).stream())
                        .filter(pr -> "OPEN".equals(pr.getState()))
                        .count(),
                repositories.stream()
                        .flatMap(repo -> pullRequestRepository
                                .findByRepositoryAndCreatedAtBetween(repo, startDate, endDate).stream())
                        .filter(pr -> "CLOSED".equals(pr.getState()))
                        .count(),
                completedPRs,
                repositories.stream()
                        .flatMap(repo -> pullRequestRepository
                                .findByRepositoryAndCreatedAtBetween(repo, startDate, endDate).stream())
                        .filter(pr -> pr.getMergedAt() != null && pr.getCycleTime() != null)
                        .mapToLong(PullRequest::getCycleTime)
                        .average()
                        .orElse(0.0),
                repositories.stream()
                        .flatMap(repo -> pullRequestRepository
                                .findByRepositoryAndCreatedAtBetween(repo, startDate, endDate).stream())
                        .collect(Collectors.groupingBy(PullRequest::getAuthor, Collectors.counting())),
                repositories.stream()
                        .flatMap(repo -> pullRequestRepository
                                .findByRepositoryAndCreatedAtBetween(repo, startDate, endDate).stream())
                        .filter(pr -> pr.getCreatedAt() != null)
                        .collect(Collectors.groupingBy(pr -> pr.getCreatedAt().toLocalDate(), Collectors.counting())));

        // Get last sync time
        LocalDateTime lastSyncTime = repositories.stream()
                .filter(repo -> repo.getLastSyncTime() != null)
                .map(Repository::getLastSyncTime)
                .max(LocalDateTime::compareTo)
                .orElse(null);

        return new DashboardDTO(
                user.getUsername(),
                (long) repositories.size(),
                (long) repositories.stream().filter(Repository::isActive).count(),
                lastSyncTime,
                commitStats,
                prStats,
                commitTrend,
                prCompletionTrend,
                focusTimeByDay,
                topRepositories);
    }

    private double calculateTrend(long current, long previous) {
        if (previous == 0) {
            return current > 0 ? 100.0 : 0.0;
        }
        return ((double) current - previous) / previous * 100.0;
    }

    private List<Map<String, Object>> getTopRepositories(List<Repository> repositories, LocalDateTime startDate,
            LocalDateTime endDate) {
        return repositories.stream()
                .map(repo -> {
                    Map<String, Object> repoData = new HashMap<>();
                    repoData.put("id", repo.getId());
                    repoData.put("name", repo.getName());
                    repoData.put("fullName", repo.getFullName());

                    long commitCount = commitRepository.findByRepositoryAndDateBetween(repo, startDate, endDate).size();
                    repoData.put("commitCount", commitCount);

                    long prCount = pullRequestRepository.findByRepositoryAndCreatedAtBetween(repo, startDate, endDate)
                            .size();
                    repoData.put("prCount", prCount);

                    Double avgCycleTime = pullRequestRepository.getAverageCycleTime(repo, startDate, endDate);
                    repoData.put("avgCycleTime", avgCycleTime != null ? avgCycleTime : 0.0);

                    // Calculate a simple activity score
                    repoData.put("activityScore", commitCount * 1.0 + prCount * 5.0);

                    return repoData;
                })
                .sorted(Comparator.comparingDouble(repo -> -((double) repo.get("activityScore"))))
                .limit(5)
                .collect(Collectors.toList());
    }
}