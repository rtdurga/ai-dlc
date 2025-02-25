package com.geocell.report.repository;

import com.geocell.report.model.UsageAnalytics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface UsageAnalyticsRepository extends JpaRepository<UsageAnalytics, Long> {
    List<UsageAnalytics> findByEndpointPath(String endpointPath);
    List<UsageAnalytics> findByUserId(String userId);
    List<UsageAnalytics> findByTimestampBetween(LocalDateTime start, LocalDateTime end);
    List<UsageAnalytics> findByStatusCode(Integer statusCode);
    
    @Query("SELECT AVG(ua.responseTime) FROM UsageAnalytics ua WHERE ua.endpointPath = :path")
    Double getAverageResponseTimeForEndpoint(@Param("path") String endpointPath);
    
    @Query("SELECT ua.endpointPath, COUNT(ua) as callCount " +
           "FROM UsageAnalytics ua " +
           "GROUP BY ua.endpointPath " +
           "ORDER BY callCount DESC")
    List<Object[]> getEndpointUsageFrequency();
    
    @Query("SELECT ua FROM UsageAnalytics ua " +
           "WHERE ua.responseTime > :thresholdMs " +
           "ORDER BY ua.responseTime DESC")
    List<UsageAnalytics> findSlowEndpoints(@Param("thresholdMs") Long thresholdMilliseconds);
    
    List<UsageAnalytics> findByCacheHit(Boolean cacheHit);
    
    @Query("SELECT ua FROM UsageAnalytics ua " +
           "WHERE ua.timestamp BETWEEN :start AND :end " +
           "AND ua.statusCode >= 400")
    List<UsageAnalytics> findErrorsInTimePeriod(
        @Param("start") LocalDateTime start, 
        @Param("end") LocalDateTime end
    );
}
