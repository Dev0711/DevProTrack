package com.devprotrack.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PullRequestStatsDTO {
    private Long totalPRs;
    private Long openPRs;
    private Long closedPRs;
    private Long mergedPRs;
    private Double avgCycleTime; // in minutes
    private Map<String, Long> prsByAuthor;
    private Map<LocalDate, Long> prsByDay;
}