package com.geocell.team.repository;

import com.geocell.team.model.TeamMember;
import com.geocell.team.model.TeamMember.TeamRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeamMemberRepository extends JpaRepository<TeamMember, Long> {
    Optional<TeamMember> findByUserId(String userId);
    
    List<TeamMember> findByTeamId(Long teamId);
    
    @Query("SELECT tm FROM TeamMember tm WHERE tm.team.id = :teamId AND tm.primaryRole = :role")
    List<TeamMember> findByTeamIdAndPrimaryRole(@Param("teamId") Long teamId, @Param("role") TeamRole role);
    
    @Query("SELECT tm FROM TeamMember tm WHERE tm.team.id = :teamId AND :role MEMBER OF tm.additionalRoles")
    List<TeamMember> findByTeamIdAndAdditionalRole(@Param("teamId") Long teamId, @Param("role") TeamRole role);
    
    boolean existsByUserIdAndTeamId(String userId, Long teamId);
    
    @Query("SELECT tm FROM TeamMember tm WHERE tm.team.id = :teamId AND tm.isActive = true")
    List<TeamMember> findActiveMembers(@Param("teamId") Long teamId);
    
    @Query("SELECT COUNT(tm) FROM TeamMember tm WHERE tm.team.id = :teamId")
    long countMembersByTeamId(@Param("teamId") Long teamId);
    
    @Query("SELECT tm FROM TeamMember tm WHERE tm.email LIKE %:emailDomain%")
    List<TeamMember> findByEmailDomain(@Param("emailDomain") String emailDomain);
}
