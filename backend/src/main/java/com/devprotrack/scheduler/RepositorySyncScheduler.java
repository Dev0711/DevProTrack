package com.devprotrack.scheduler;

import com.devprotrack.model.Repository;
import com.devprotrack.model.User;
import com.devprotrack.repository.RepositoryRepository;
import com.devprotrack.repository.UserRepository;
import com.devprotrack.service.GitHubService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class RepositorySyncScheduler {

    private static final Logger logger = LoggerFactory.getLogger(RepositorySyncScheduler.class);

    private final UserRepository userRepository;
    private final RepositoryRepository repositoryRepository;
    private final GitHubService gitHubService;

    public RepositorySyncScheduler(UserRepository userRepository,
            RepositoryRepository repositoryRepository,
            GitHubService gitHubService) {
        this.userRepository = userRepository;
        this.repositoryRepository = repositoryRepository;
        this.gitHubService = gitHubService;
    }

    // Run every 12 hours
    @Scheduled(fixedRate = 12 * 60 * 60 * 1000)
    public void syncAllActiveRepositories() {
        logger.info("Starting scheduled repository sync: {}", LocalDateTime.now());

        List<User> users = userRepository.findAll();

        for (User user : users) {
            if (user.getGithubAccessToken() != null && !user.getGithubAccessToken().isEmpty()) {
                try {
                    // First, sync repository list
                    List<Repository> repos = gitHubService.fetchUserRepositories(user);

                    // Then sync data for active repositories
                    gitHubService.syncAllRepositories(user);

                    logger.info("Successfully synced repositories for user: {}", user.getUsername());
                } catch (Exception e) {
                    logger.error("Error syncing repositories for user {}: {}", user.getUsername(), e.getMessage());
                }
            }
        }

        logger.info("Completed scheduled repository sync: {}", LocalDateTime.now());
    }
}