package com.devprotrack.controller;

import com.devprotrack.model.Repository;
import com.devprotrack.model.User;
import com.devprotrack.repository.RepositoryRepository;
import com.devprotrack.service.GitHubService;
import com.devprotrack.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/repositories")
public class RepositoryController {

    private final RepositoryRepository repositoryRepository;
    private final GitHubService gitHubService;
    private final UserService userService;

    public RepositoryController(RepositoryRepository repositoryRepository,
            GitHubService gitHubService,
            UserService userService) {
        this.repositoryRepository = repositoryRepository;
        this.gitHubService = gitHubService;
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<Repository>> getAllRepositories() {
        User currentUser = userService.getCurrentUser();
        List<Repository> repositories = repositoryRepository.findByUser(currentUser);
        return ResponseEntity.ok(repositories);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Repository> getRepositoryById(@PathVariable Long id) {
        User currentUser = userService.getCurrentUser();
        Optional<Repository> repository = repositoryRepository.findById(id);

        if (repository.isPresent() && repository.get().getUser().getId().equals(currentUser.getId())) {
            return ResponseEntity.ok(repository.get());
        }

        return ResponseEntity.notFound().build();
    }

    @GetMapping("/{fullName}/readme")
    public ResponseEntity<String> getRepositoryReadme(@PathVariable String fullName) {
        try {
            System.out.println("DEBUG: Received README request for repository: " + fullName);
            User currentUser = userService.getCurrentUser();
            System.out.println("DEBUG: Current user: " + currentUser.getUsername());
            
            // Decode the repository fullName (which comes URL-encoded)
            String decodedFullName = java.net.URLDecoder.decode(fullName, "UTF-8");
            System.out.println("DEBUG: Decoded fullName: " + decodedFullName);
            
            Optional<Repository> repository = repositoryRepository.findByFullName(decodedFullName);
            
            if (repository.isEmpty()) {
                System.out.println("DEBUG: Repository not found in database: " + decodedFullName);
                return ResponseEntity.notFound().build();
            }
            
            if (!repository.get().getUser().getId().equals(currentUser.getId())) {
                System.out.println("DEBUG: Repository owner mismatch. Repo user: " + repository.get().getUser().getId() 
                    + ", Current user: " + currentUser.getId());
                return ResponseEntity.notFound().build();
            }
            
            System.out.println("DEBUG: Calling service to get README content");
            String readmeContent = gitHubService.getRepositoryReadme(decodedFullName);
            
            if (readmeContent == null) {
                System.out.println("DEBUG: No README content returned from service");
                return ResponseEntity.notFound().build();
            }
            
            System.out.println("DEBUG: README content found, length: " + readmeContent.length());
            return ResponseEntity.ok(readmeContent);
        } catch (Exception e) {
            System.out.println("DEBUG: Exception in getRepositoryReadme: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/sync/github")
    public ResponseEntity<?> syncGithubRepositories() {
        try {
            User currentUser = userService.getCurrentUser();
            List<Repository> repositories = gitHubService.fetchUserRepositories(currentUser);
            return ResponseEntity.ok(repositories);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error syncing repositories: " + e.getMessage());
        }
    }

    @PostMapping("/sync/{repositoryFullName}")
    public ResponseEntity<?> syncRepositoryData(@PathVariable String repositoryFullName) {
        try {
            boolean success = gitHubService.syncRepositoryData(repositoryFullName);
            return ResponseEntity.ok("Repository data synced successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error syncing repository data: " + e.getMessage());
        }
    }

    @PostMapping("/sync/all")
    public ResponseEntity<?> syncAllRepositories() {
        try {
            User currentUser = userService.getCurrentUser();
            boolean success = gitHubService.syncAllRepositories(currentUser);
            return ResponseEntity.ok("All repositories synced successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error syncing all repositories: " + e.getMessage());
        }
    }

    @PutMapping("/{id}/active")
    public ResponseEntity<?> toggleRepositoryActive(@PathVariable Long id, @RequestParam boolean active) {
        User currentUser = userService.getCurrentUser();
        Optional<Repository> repository = repositoryRepository.findById(id);

        if (repository.isPresent() && repository.get().getUser().getId().equals(currentUser.getId())) {
            Repository repo = repository.get();
            repo.setActive(active);
            repositoryRepository.save(repo);
            return ResponseEntity.ok("Repository active status updated");
        }

        return ResponseEntity.notFound().build();
    }
}