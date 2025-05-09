package com.devprotrack.controller;

import com.devprotrack.dto.AuthRequestDTO;
import com.devprotrack.dto.AuthResponseDTO;
import com.devprotrack.dto.RegisterRequestDTO;
import com.devprotrack.model.User;
import com.devprotrack.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequestDTO registerRequest) {
        try {
            User user = userService.registerUser(registerRequest);
            return ResponseEntity.ok("User registered successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody AuthRequestDTO loginRequest) {
        try {
            AuthResponseDTO authResponse = userService.authenticateUser(
                    loginRequest.getUsername(),
                    loginRequest.getPassword());
            return ResponseEntity.ok(authResponse);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/github/connect")
    public ResponseEntity<?> connectGithub(@RequestBody GithubConnectRequest request) {
        try {
            boolean updated = userService.updateGithubToken(
                    request.getUsername(),
                    request.getGithubUsername(),
                    request.getGithubToken());
            return ResponseEntity.ok("GitHub account connected successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error connecting GitHub account: " + e.getMessage());
        }
    }

    // Simple inner class for GitHub connection request
    static class GithubConnectRequest {
        private String username;
        private String githubUsername;
        private String githubToken;

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getGithubUsername() {
            return githubUsername;
        }

        public void setGithubUsername(String githubUsername) {
            this.githubUsername = githubUsername;
        }

        public String getGithubToken() {
            return githubToken;
        }

        public void setGithubToken(String githubToken) {
            this.githubToken = githubToken;
        }
    }
}