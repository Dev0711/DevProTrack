package com.devprotrack.service;

import com.devprotrack.model.Repository;
import com.devprotrack.model.User;

import java.util.List;

public interface GitHubService {
    List<Repository> fetchUserRepositories(User user);

    boolean syncRepositoryData(String repositoryFullName);

    boolean syncAllRepositories(User user);
    
    String getRepositoryReadme(String repositoryFullName);
}