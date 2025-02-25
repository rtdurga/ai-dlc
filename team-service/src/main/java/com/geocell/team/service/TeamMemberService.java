package com.geocell.team.service;

import com.geocell.team.model.TeamMember;
import com.geocell.team.model.TeamMember.TeamRole;

import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface TeamMemberService {
    TeamMember createTeamMember(TeamMember member);
    Optional<TeamMember> getTeamMemberById(Long id);
    Optional<TeamMember> getTeamMemberByUserId(String userId);
    
    TeamMember updateTeamMember(TeamMember member);
    void deleteTeamMember(Long id);
    
    void updatePrimaryRole(String userId, TeamRole newPrimaryRole);
    void addAdditionalRole(String userId, TeamRole additionalRole);
    void removeAdditionalRole(String userId, TeamRole roleToRemove);
    
    Set<TeamRole> getMemberRoles(String userId);
    Set<String> getMemberPermissions(String userId);
    
    void addPermission(String userId, String permission);
    void removePermission(String userId, String permission);
    
    void activateMember(String userId);
    void deactivateMember(String userId);
    
    void updateLastLogin(String userId);
    
    List<TeamMember> getMembersByRole(TeamRole role);
    List<TeamMember> getMembersByTeamId(Long teamId);
    
    boolean hasRole(String userId, TeamRole role);
    boolean hasPermission(String userId, String permission);
    
    long countTeamMembers(Long teamId);
    List<TeamMember> searchMembersByEmail(String emailDomain);
}
