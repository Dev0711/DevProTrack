package com.devprotrack.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommitStatsDTO {
    private Long totalCommits;
    private Double avgCommitsPerDay;
    private Map<String, Long> commitsByAuthor;
    private Map<LocalDate, Long> commitsByDay;
    private Long totalAdditions;
    private Long totalDeletions;
    private Long totalFilesChanged;
}