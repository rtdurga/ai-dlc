package com.geocell.report.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Report {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String type; // e.g., API_USAGE, PERFORMANCE, CUSTOM

    @Column(name = "start_date")
    private LocalDateTime startDate;

    @Column(name = "end_date")
    private LocalDateTime endDate;

    @ElementCollection
    @CollectionTable(name = "report_parameters", 
        joinColumns = @JoinColumn(name = "report_id"))
    @MapKeyColumn(name = "param_key")
    @Column(name = "param_value")
    private Map<String, String> parameters;

    @ElementCollection
    @CollectionTable(name = "report_data", 
        joinColumns = @JoinColumn(name = "report_id"))
    private List<String> data;

    private String format; // PDF, CSV, etc.
    private String status; // GENERATED, PENDING, ERROR

    @Column(name = "generated_file_path")
    private String generatedFilePath;

    private Boolean scheduled;

    @Column(name = "next_run_time")
    private LocalDateTime nextRunTime;

    @Column(name = "cron_expression")
    private String cronExpression;
}
