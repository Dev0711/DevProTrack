package com.devprotrack.service.impl;

import com.devprotrack.model.Commit;
import com.devprotrack.model.PullRequest;
import com.devprotrack.model.Repository;
import com.devprotrack.model.User;
import com.devprotrack.repository.CommitRepository;
import com.devprotrack.repository.PullRequestRepository;
import com.devprotrack.repository.RepositoryRepository;
import com.devprotrack.service.GitHubService;
import org.kohsuke.github.*;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class GitHubServiceImpl implements GitHubService {

    private final RepositoryRepository repositoryRepository;
    private final CommitRepository commitRepository;
    private final PullRequestRepository pullRequestRepository;

    public GitHubServiceImpl(RepositoryRepository repositoryRepository,
            CommitRepository commitRepository,
            PullRequestRepository pullRequestRepository) {
        this.repositoryRepository = repositoryRepository;
        this.commitRepository = commitRepository;
        this.pullRequestRepository = pullRequestRepository;
    }

    @Override
    public List<Repository> fetchUserRepositories(User user) {
        if (user.getGithubAccessToken() == null || user.getGithubAccessToken().isEmpty()) {
            throw new RuntimeException("GitHub access token not found for user");
        }

        try {
            GitHub github = GitHub.connectUsingOAuth(user.getGithubAccessToken());
            GHUser ghUser = github.getUser(user.getGithubUsername());

            List<Repository> repositories = new ArrayList<>();
            for (GHRepository ghRepo : ghUser.listRepositories()) {
                Optional<Repository> existingRepo = repositoryRepository.findByFullName(ghRepo.getFullName());

                Repository repo;
                if (existingRepo.isPresent()) {
                    repo = existingRepo.get();
                } else {
                    repo = new Repository();
                    repo.setName(ghRepo.getName());
                    repo.setOwner(ghRepo.getOwnerName());
                    repo.setFullName(ghRepo.getFullName());
                    repo.setDescription(ghRepo.getDescription());
                    repo.setUser(user);
                    repo.setActive(true);
                }

                repo.setLastSyncTime(LocalDateTime.now());
                repositories.add(repositoryRepository.save(repo));
            }

            return repositories;
        } catch (IOException e) {
            throw new RuntimeException("Error fetching GitHub repositories: " + e.getMessage());
        }
    }

    @Override
    public boolean syncRepositoryData(String repositoryFullName) {
        Optional<Repository> optRepo = repositoryRepository.findByFullName(repositoryFullName);
        if (optRepo.isEmpty()) {
            throw new RuntimeException("Repository not found: " + repositoryFullName);
        }

        Repository repository = optRepo.get();
        User user = repository.getUser();

        if (user.getGithubAccessToken() == null || user.getGithubAccessToken().isEmpty()) {
            throw new RuntimeException("GitHub access token not found for user");
        }

        try {
            GitHub github = GitHub.connectUsingOAuth(user.getGithubAccessToken());
            GHRepository ghRepo = github.getRepository(repositoryFullName);

            // Sync commits
            syncCommits(ghRepo, repository);

            // Sync pull requests
            syncPullRequests(ghRepo, repository);

            // Update last sync time
            repository.setLastSyncTime(LocalDateTime.now());
            repositoryRepository.save(repository);

            return true;
        } catch (IOException e) {
            throw new RuntimeException("Error syncing repository data: " + e.getMessage());
        }
    }

    @Override
    public boolean syncAllRepositories(User user) {
        List<Repository> repositories = repositoryRepository.findByUserAndActive(user, true);

        for (Repository repo : repositories) {
            syncRepositoryData(repo.getFullName());
        }

        return true;
    }

    @Override
    public String getRepositoryReadme(String repositoryFullName) {
        Optional<Repository> optRepo = repositoryRepository.findByFullName(repositoryFullName);
        if (optRepo.isEmpty()) {
            System.out.println("DEBUG: Repository not found in database: " + repositoryFullName);
            throw new RuntimeException("Repository not found: " + repositoryFullName);
        }

        Repository repository = optRepo.get();
        User user = repository.getUser();

        if (user.getGithubAccessToken() == null || user.getGithubAccessToken().isEmpty()) {
            System.out.println("DEBUG: GitHub access token not found for user: " + user.getUsername());
            throw new RuntimeException("GitHub access token not found for user");
        }

        try {
            System.out.println("DEBUG: Connecting to GitHub with token for user: " + user.getUsername());
            GitHub github = GitHub.connectUsingOAuth(user.getGithubAccessToken());
            System.out.println("DEBUG: Looking up repository: " + repositoryFullName);
            GHRepository ghRepo = github.getRepository(repositoryFullName);
            System.out.println("DEBUG: Found repository on GitHub: " + ghRepo.getFullName());
            
            // Common README file names to try
            String[] possibleReadmeNames = {
                "README.md", "readme.md", "README", "readme", 
                "README.txt", "readme.txt", "README.markdown", "readme.markdown"
            };
            
            // Try different README file variations
            for (String readmeName : possibleReadmeNames) {
                try {
                    System.out.println("DEBUG: Attempting to fetch " + readmeName);
                    GHContent readmeContent = ghRepo.getFileContent(readmeName);
                    if (readmeContent != null) {
                        System.out.println("DEBUG: " + readmeName + " found, decoding content");
                        return new String(Base64.getDecoder().decode(readmeContent.getContent()));
                    }
                } catch (Exception e) {
                    System.out.println("DEBUG: Error fetching " + readmeName + ": " + e.getMessage());
                    // Continue to next file name
                }
            }
            
            // If no README found, look for any .md files in the root
            try {
                System.out.println("DEBUG: Trying to list all files in root directory to find other documentation");
                List<GHContent> contents = ghRepo.getDirectoryContent("");
                System.out.println("DEBUG: Files in root directory:");
                
                for (GHContent content : contents) {
                    System.out.println("  - " + content.getName() + " (" + content.getType() + ")");
                    
                    // Check if this is a markdown file we can use as documentation
                    if (content.getName().toLowerCase().endsWith(".md") && 
                            !content.getName().toLowerCase().startsWith("license")) {
                        try {
                            System.out.println("DEBUG: Found potential documentation file: " + content.getName());
                            return new String(Base64.getDecoder().decode(content.getContent()));
                        } catch (Exception e) {
                            System.out.println("DEBUG: Error fetching content of " + content.getName() + ": " + e.getMessage());
                        }
                    }
                }
                
                // No markdown files found, check if there's a docs directory
                for (GHContent content : contents) {
                    if (content.isDirectory() && 
                            (content.getName().equalsIgnoreCase("docs") || 
                             content.getName().equalsIgnoreCase("doc") || 
                             content.getName().equalsIgnoreCase("documentation"))) {
                        try {
                            System.out.println("DEBUG: Found docs directory, checking for README inside");
                            List<GHContent> docsContents = ghRepo.getDirectoryContent(content.getPath());
                            
                            for (GHContent docFile : docsContents) {
                                if (docFile.getName().toLowerCase().contains("readme") || 
                                        docFile.getName().toLowerCase().endsWith(".md")) {
                                    System.out.println("DEBUG: Found documentation in docs directory: " + docFile.getName());
                                    return new String(Base64.getDecoder().decode(docFile.getContent()));
                                }
                            }
                        } catch (Exception e) {
                            System.out.println("DEBUG: Error exploring docs directory: " + e.getMessage());
                        }
                    }
                }
            } catch (Exception listEx) {
                System.out.println("DEBUG: Error listing files in root directory: " + listEx.getMessage());
            }
            
            // If we still don't have a README, create a generic one based on repository description
            System.out.println("DEBUG: No README found, generating default content");
            StringBuilder defaultReadme = new StringBuilder();
            defaultReadme.append("# ").append(ghRepo.getName()).append("\n\n");
            
            if (ghRepo.getDescription() != null && !ghRepo.getDescription().isEmpty()) {
                defaultReadme.append(ghRepo.getDescription()).append("\n\n");
            }
            
            defaultReadme.append("This repository doesn't have a README file. You can view it on GitHub: ")
                .append("[").append(ghRepo.getFullName()).append("](")
                .append(ghRepo.getHtmlUrl()).append(")\n\n");
            
            return defaultReadme.toString();
        } catch (IOException e) {
            System.out.println("DEBUG: Error in GitHub API: " + e.getMessage());
            throw new RuntimeException("Error fetching repository README: " + e.getMessage());
        }
    }

    private void syncCommits(GHRepository ghRepo, Repository repository) throws IOException {
        // Get last 100 commits from GitHub
        PagedIterable<GHCommit> ghCommits = ghRepo.listCommits().withPageSize(100);

        for (GHCommit ghCommit : ghCommits) {
            if (!commitRepository.existsBySha(ghCommit.getSHA1())) {
                Commit commit = new Commit();
                commit.setSha(ghCommit.getSHA1());
                commit.setMessage(ghCommit.getCommitShortInfo().getMessage());
                commit.setAuthor(ghCommit.getCommitShortInfo().getAuthor().getName());

                Date commitDate = ghCommit.getCommitShortInfo().getCommitDate();
                commit.setDate(LocalDateTime.ofInstant(commitDate.toInstant(), ZoneId.systemDefault()));

                // Get commit stats if available
                try {
                    GHCommit detailedCommit = ghRepo.getCommit(ghCommit.getSHA1());
                    commit.setAdditions(detailedCommit.getLinesAdded());
                    commit.setDeletions(detailedCommit.getLinesDeleted());
                    commit.setFilesChanged(detailedCommit.getFiles().size());
                } catch (Exception e) {
                    // If detailed stats are not available, set defaults
                    commit.setAdditions(0);
                    commit.setDeletions(0);
                    commit.setFilesChanged(0);
                }

                commit.setRepository(repository);
                commitRepository.save(commit);
            }
        }
    }

    private void syncPullRequests(GHRepository ghRepo, Repository repository) throws IOException {
        // Get pull requests from GitHub
        PagedIterable<GHPullRequest> ghPullRequests = ghRepo.listPullRequests(GHIssueState.ALL).withPageSize(100);

        for (GHPullRequest ghPr : ghPullRequests) {
            if (!pullRequestRepository.existsByRepositoryAndPrNumber(repository, (long) ghPr.getNumber())) {
                PullRequest pr = new PullRequest();
                pr.setPrNumber((long) ghPr.getNumber());
                pr.setTitle(ghPr.getTitle());
                pr.setDescription(ghPr.getBody());
                pr.setAuthor(ghPr.getUser().getLogin());
                pr.setState(ghPr.getState().name());

                // Set dates
                Date createdAt = ghPr.getCreatedAt();
                Date updatedAt = ghPr.getUpdatedAt();
                Date closedAt = ghPr.getClosedAt();
                Date mergedAt = ghPr.getMergedAt();

                pr.setCreatedAt(
                        createdAt != null ? LocalDateTime.ofInstant(createdAt.toInstant(), ZoneId.systemDefault())
                                : null);
                pr.setUpdatedAt(
                        updatedAt != null ? LocalDateTime.ofInstant(updatedAt.toInstant(), ZoneId.systemDefault())
                                : null);
                pr.setClosedAt(closedAt != null ? LocalDateTime.ofInstant(closedAt.toInstant(), ZoneId.systemDefault())
                        : null);
                pr.setMergedAt(mergedAt != null ? LocalDateTime.ofInstant(mergedAt.toInstant(), ZoneId.systemDefault())
                        : null);

                // Calculate cycle time (if merged)
                if (mergedAt != null && createdAt != null) {
                    long diffInMillies = mergedAt.getTime() - createdAt.getTime();
                    pr.setCycleTime(diffInMillies / (1000 * 60)); // convert to minutes
                }

                // Additional metrics
                pr.setCommentCount((long) ghPr.getCommentsCount());

                try {
                    pr.setReviewCount((long) ghPr.listReviews().toList().size());
                } catch (Exception e) {
                    pr.setReviewCount(0L);
                }

                pr.setRepository(repository);
                pullRequestRepository.save(pr);
            }
        }
    }
}