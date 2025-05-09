package com.devprotrack.repository;

import com.devprotrack.model.PullRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PullRequestRepository extends JpaRepository<PullRequest, Long> {
    List<PullRequest> findByRepository(com.devprotrack.model.Repository repository);

    List<PullRequest> findByRepositoryAndCreatedAtBetween(com.devprotrack.model.Repository repository,
            LocalDateTime start,
            LocalDateTime end);

    List<PullRequest> findByAuthorAndCreatedAtBetween(String author, LocalDateTime start, LocalDateTime end);

    Optional<PullRequest> findByRepositoryAndPrNumber(com.devprotrack.model.Repository repository, Long prNumber);

    boolean existsByRepositoryAndPrNumber(com.devprotrack.model.Repository repository, Long prNumber);

    @Query("SELECT AVG(p.cycleTime) FROM PullRequest p WHERE p.repository = ?1 AND p.mergedAt IS NOT NULL AND p.createdAt BETWEEN ?2 AND ?3")
    Double getAverageCycleTime(com.devprotrack.model.Repository repository, LocalDateTime start, LocalDateTime end);

    @Query("SELECT p.author, COUNT(p) FROM PullRequest p WHERE p.repository = ?1 AND p.createdAt BETWEEN ?2 AND ?3 GROUP BY p.author")
    List<Object[]> countPullRequestsByAuthorInRepository(com.devprotrack.model.Repository repository,
            LocalDateTime start, LocalDateTime end);
}