package com.geocell.team.service;

import com.geocell.team.model.Team;
import com.geocell.team.model.TeamMember;
import com.geocell.team.model.TeamMember.TeamRole;

import java.util.List;
import java.util.Optional;
import java.util.Map;

public interface TeamService {
    Team createTeam(Team team);
    Optional<Team> getTeamById(Long id);
    Optional<Team> getTeamByName(String name);
    List<Team> getAllTeams();
    Team updateTeam(Team team);
    void deleteTeam(Long id);
    
    TeamMember addMemberToTeam(Long teamId, TeamMember member);
    void removeMemberFromTeam(Long teamId, String userId);
    List<TeamMember> getTeamMembers(Long teamId);
    
    void updateMemberRole(Long teamId, String userId, TeamRole primaryRole);
    void addAdditionalRoleToMember(Long teamId, String userId, TeamRole additionalRole);
    void removeAdditionalRoleFromMember(Long teamId, String userId, TeamRole additionalRole);
    
    List<Team> getTeamsByUser(String userId);
    List<Team> getTeamsCreatedByUser(String userId);
    
    void updateTeamSettings(Long teamId, Map<String, String> settings);
    Map<String, String> getTeamSettings(Long teamId);
    
    boolean isUserTeamAdmin(Long teamId, String userId);
    boolean isUserTeamMember(Long teamId, String userId);
    
    List<Team> searchTeamsByName(String namePattern);
    
    void transferTeamOwnership(Long teamId, String currentOwnerId, String newOwnerId);
}
