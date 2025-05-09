package com.devprotrack.repository;

import com.devprotrack.model.Commit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CommitRepository extends JpaRepository<Commit, Long> {
    List<Commit> findByRepository(com.devprotrack.model.Repository repository);

    List<Commit> findByRepositoryAndDateBetween(com.devprotrack.model.Repository repository, LocalDateTime start,
            LocalDateTime end);

    List<Commit> findByAuthorAndDateBetween(String author, LocalDateTime start, LocalDateTime end);

    Optional<Commit> findBySha(String sha);

    boolean existsBySha(String sha);

    @Query("SELECT COUNT(c) FROM Commit c WHERE c.repository = ?1 AND c.date BETWEEN ?2 AND ?3 GROUP BY FUNCTION('DATE', c.date)")
    List<Long> countCommitsByRepositoryAndDateGroupByDay(com.devprotrack.model.Repository repository,
            LocalDateTime start, LocalDateTime end);

    @Query("SELECT c.author, COUNT(c) FROM Commit c WHERE c.repository = ?1 AND c.date BETWEEN ?2 AND ?3 GROUP BY c.author")
    List<Object[]> countCommitsByAuthorInRepository(com.devprotrack.model.Repository repository, LocalDateTime start,
            LocalDateTime end);
}