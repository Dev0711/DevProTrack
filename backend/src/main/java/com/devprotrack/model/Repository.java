package com.devprotrack.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "repositories")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Repository {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String owner;

    @Column(nullable = false, unique = true)
    private String fullName;

    private String description;
    private LocalDateTime lastSyncTime;
    private boolean active = true;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @OneToMany(mappedBy = "repository", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Commit> commits = new HashSet<>();

    @OneToMany(mappedBy = "repository", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<PullRequest> pullRequests = new HashSet<>();
}