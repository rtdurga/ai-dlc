package com.geocell.report.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UsageAnalytics {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "endpoint_path")
    private String endpointPath;

    @Column(name = "http_method")
    private String httpMethod;

    @Column(name = "timestamp")
    private LocalDateTime timestamp;

    @Column(name = "response_time")
    private Long responseTime; // in milliseconds

    @Column(name = "status_code")
    private Integer statusCode;

    @Column(name = "user_id")
    private String userId;

    @Column(name = "ip_address")
    private String ipAddress;

    @ElementCollection
    @CollectionTable(name = "request_parameters",
        joinColumns = @JoinColumn(name = "analytics_id"))
    @MapKeyColumn(name = "param_key")
    @Column(name = "param_value")
    private Map<String, String> requestParameters;

    @ElementCollection
    @CollectionTable(name = "performance_metrics",
        joinColumns = @JoinColumn(name = "analytics_id"))
    @MapKeyColumn(name = "metric_key")
    @Column(name = "metric_value")
    private Map<String, Double> performanceMetrics;

    @Column(name = "error_message")
    private String errorMessage;

    @Column(name = "api_version")
    private String apiVersion;

    @Column(name = "client_info")
    private String clientInfo;

    @Column(name = "request_size")
    private Long requestSize; // in bytes

    @Column(name = "response_size")
    private Long responseSize; // in bytes

    @Column(name = "cache_hit")
    private Boolean cacheHit;

    @ElementCollection
    @CollectionTable(name = "resource_usage",
        joinColumns = @JoinColumn(name = "analytics_id"))
    @MapKeyColumn(name = "resource_key")
    @Column(name = "resource_value")
    private Map<String, Double> resourceUsage; // CPU, Memory, etc.
}
