package com.devprotrack.repository;

import com.devprotrack.model.Repository;
import com.devprotrack.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

@org.springframework.stereotype.Repository
public interface RepositoryRepository extends JpaRepository<Repository, Long> {
    List<Repository> findByUser(User user);

    List<Repository> findByUserAndActive(User user, boolean active);

    Optional<Repository> findByFullName(String fullName);

    boolean existsByFullName(String fullName);
}