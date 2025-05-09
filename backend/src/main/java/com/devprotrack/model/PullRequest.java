package com.devprotrack.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "pull_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PullRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long prNumber;

    @Column(nullable = false, length = 1000)
    private String title;

    @Column(length = 5000)
    private String description;

    private String author;
    private String state; // OPEN, CLOSED, MERGED

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime closedAt;
    private LocalDateTime mergedAt;

    private Long commentCount;
    private Long reviewCount;

    // Time in minutes from creation to merge (cycle time)
    private Long cycleTime;

    @ManyToOne
    @JoinColumn(name = "repository_id", nullable = false)
    private Repository repository;
}