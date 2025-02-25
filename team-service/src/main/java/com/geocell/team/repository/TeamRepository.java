package com.geocell.team.repository;

import com.geocell.team.model.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeamRepository extends JpaRepository<Team, Long> {
    Optional<Team> findByName(String name);
    
    @Query("SELECT t FROM Team t JOIN t.members m WHERE m.userId = :userId")
    List<Team> findTeamsByUserId(@Param("userId") String userId);
    
    @Query("SELECT t FROM Team t WHERE t.createdBy = :userId")
    List<Team> findTeamsCreatedByUser(@Param("userId") String userId);
    
    List<Team> findByNameContainingIgnoreCase(String namePattern);
    
    @Query("SELECT DISTINCT t FROM Team t JOIN t.members m WHERE m.primaryRole = 'ADMIN'")
    List<Team> findTeamsWithAdmin();
    
    boolean existsByName(String name);
}
