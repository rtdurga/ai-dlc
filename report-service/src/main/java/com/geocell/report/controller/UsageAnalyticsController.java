package com.geocell.report.controller;

import com.geocell.report.model.UsageAnalytics;
import com.geocell.report.service.UsageAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/usage-analytics")
@RequiredArgsConstructor
public class UsageAnalyticsController {
    private final UsageAnalyticsService usageAnalyticsService;

    @PostMapping
    public ResponseEntity<Void> recordApiUsage(@RequestBody UsageAnalytics analytics) {
        usageAnalyticsService.recordApiUsage(analytics);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/endpoint/{endpointPath}")
    public ResponseEntity<List<UsageAnalytics>> getAnalyticsByEndpoint(@PathVariable String endpointPath) {
        List<UsageAnalytics> analytics = usageAnalyticsService.getAnalyticsByEndpoint(endpointPath);
        return ResponseEntity.ok(analytics);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<UsageAnalytics>> getAnalyticsByUser(@PathVariable String userId) {
        List<UsageAnalytics> analytics = usageAnalyticsService.getAnalyticsByUser(userId);
        return ResponseEntity.ok(analytics);
    }

    @GetMapping("/date-range")
    public ResponseEntity<List<UsageAnalytics>> getAnalyticsBetweenDates(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        List<UsageAnalytics> analytics = usageAnalyticsService.getAnalyticsBetweenDates(start, end);
        return ResponseEntity.ok(analytics);
    }

    @GetMapping("/endpoint/{endpointPath}/avg-response-time")
    public ResponseEntity<Double> getAverageResponseTimeForEndpoint(@PathVariable String endpointPath) {
        Double avgResponseTime = usageAnalyticsService.getAverageResponseTimeForEndpoint(endpointPath);
        return ResponseEntity.ok(avgResponseTime);
    }

    @GetMapping("/endpoint-usage-frequency")
    public ResponseEntity<List<Map.Entry<String, Long>>> getEndpointUsageFrequency() {
        List<Map.Entry<String, Long>> usageFrequency = usageAnalyticsService.getEndpointUsageFrequency();
        return ResponseEntity.ok(usageFrequency);
    }

    @GetMapping("/slow-endpoints")
    public ResponseEntity<List<UsageAnalytics>> findSlowEndpoints(
            @RequestParam(defaultValue = "1000") Long thresholdMilliseconds) {
        List<UsageAnalytics> slowEndpoints = usageAnalyticsService.findSlowEndpoints(thresholdMilliseconds);
        return ResponseEntity.ok(slowEndpoints);
    }

    @GetMapping("/errors")
    public ResponseEntity<List<UsageAnalytics>> findErrorsInTimePeriod(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        List<UsageAnalytics> errors = usageAnalyticsService.findErrorsInTimePeriod(start, end);
        return ResponseEntity.ok(errors);
    }

    @GetMapping("/performance-summary")
    public ResponseEntity<Map<String, Object>> generatePerformanceSummary(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        Map<String, Object> summary = usageAnalyticsService.generatePerformanceSummary(start, end);
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/status-code/{statusCode}")
    public ResponseEntity<List<UsageAnalytics>> getAnalyticsByStatusCode(@PathVariable Integer statusCode) {
        List<UsageAnalytics> analytics = usageAnalyticsService.getAnalyticsByStatusCode(statusCode);
        return ResponseEntity.ok(analytics);
    }

    @GetMapping("/cache-hit/{cacheHit}")
    public ResponseEntity<List<UsageAnalytics>> getCacheHitAnalytics(@PathVariable Boolean cacheHit) {
        List<UsageAnalytics> analytics = usageAnalyticsService.getCacheHitAnalytics(cacheHit);
        return ResponseEntity.ok(analytics);
    }

    @GetMapping("/resource-utilization")
    public ResponseEntity<Map<String, Double>> calculateResourceUtilization(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        Map<String, Double> resourceUtilization = usageAnalyticsService.calculateResourceUtilization(start, end);
        return ResponseEntity.ok(resourceUtilization);
    }
}
