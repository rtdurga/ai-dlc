package com.geocell.team.service;

import com.geocell.team.model.AuditLog;
import com.geocell.team.model.AuditLog.ActionType;
import com.geocell.team.model.AuditLog.ResourceType;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public interface AuditLogService {
    void logAction(String userId, ActionType actionType, ResourceType resourceType, 
                   String resourceId, String description, Map<String, String> details);
    
    void logSuccessfulAction(String userId, ActionType actionType, ResourceType resourceType, 
                              String resourceId, String description);
    
    void logFailedAction(String userId, ActionType actionType, ResourceType resourceType, 
                          String resourceId, String description, String errorMessage);
    
    List<AuditLog> getAuditLogsByUser(String userId);
    List<AuditLog> getAuditLogsByActionType(ActionType actionType);
    List<AuditLog> getAuditLogsByResourceType(ResourceType resourceType);
    List<AuditLog> getAuditLogsByResourceId(String resourceId);
    
    List<AuditLog> getAuditLogsBetweenDates(LocalDateTime start, LocalDateTime end);
    
    List<AuditLog> getAuditLogsByUserAndActionType(String userId, ActionType actionType);
    
    List<AuditLog> getAuditLogsByResourceTypeAndSuccess(ResourceType resourceType, boolean success);
    
    List<AuditLog> getAuditLogsByIpAddress(String ipAddress);
    
    List<AuditLog> getAuditLogsWithDetailFilter(Map<String, String> detailFilters);
    
    long countAuditLogsByUser(String userId);
    long countAuditLogsByActionType(ActionType actionType);
    long countAuditLogsByResourceType(ResourceType resourceType);
    
    void purgeOldAuditLogs(LocalDateTime olderThan);
}
