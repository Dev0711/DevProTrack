package com.devprotrack.service;

import com.devprotrack.dto.AuthResponseDTO;
import com.devprotrack.dto.RegisterRequestDTO;
import com.devprotrack.model.User;

import java.util.Optional;

public interface UserService {
    Optional<User> findByUsername(String username);

    User registerUser(RegisterRequestDTO registerRequest);

    AuthResponseDTO authenticateUser(String username, String password);

    boolean updateGithubToken(String username, String githubUsername, String githubToken);

    User getCurrentUser();
}