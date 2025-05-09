package com.devprotrack.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "commits")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Commit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String sha;

    @Column(nullable = false, length = 1000)
    private String message;

    @Column(nullable = false)
    private String author;

    @Column(nullable = false)
    private LocalDateTime date;

    private int additions;
    private int deletions;
    private int filesChanged;

    @ManyToOne
    @JoinColumn(name = "repository_id", nullable = false)
    private Repository repository;
}