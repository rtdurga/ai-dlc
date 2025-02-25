package com.geocell.team.repository;

import com.geocell.team.model.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findByUserId(String userId);
    
    List<AuditLog> findByActionType(String actionType);
    
    List<AuditLog> findByResourceType(String resourceType);
    
    List<AuditLog> findByResourceId(String resourceId);
    
    List<AuditLog> findByTimestampBetween(LocalDateTime start, LocalDateTime end);
    
    @Query("SELECT al FROM AuditLog al WHERE al.userId = :userId AND al.actionType = :actionType")
    List<AuditLog> findByUserIdAndActionType(
        @Param("userId") String userId, 
        @Param("actionType") String actionType
    );
    
    @Query("SELECT al FROM AuditLog al WHERE al.resourceType = :resourceType AND al.success = :success")
    List<AuditLog> findByResourceTypeAndSuccess(
        @Param("resourceType") String resourceType, 
        @Param("success") Boolean success
    );
    
    @Query("SELECT al FROM AuditLog al WHERE al.ipAddress = :ipAddress")
    List<AuditLog> findByIpAddress(@Param("ipAddress") String ipAddress);
    
    @Query("SELECT al FROM AuditLog al WHERE al.timestamp BETWEEN :start AND :end " +
           "AND al.actionType = :actionType AND al.success = :success")
    List<AuditLog> findByTimePeriodAndActionTypeAndSuccess(
        @Param("start") LocalDateTime start, 
        @Param("end") LocalDateTime end,
        @Param("actionType") String actionType,
        @Param("success") Boolean success
    );
    
    long countByUserId(String userId);
    
    long countByActionType(String actionType);
    
    long countByResourceType(String resourceType);
}
