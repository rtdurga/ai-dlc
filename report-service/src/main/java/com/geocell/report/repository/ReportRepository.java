package com.geocell.report.repository;

import com.geocell.report.model.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    List<Report> findByType(String type);
    List<Report> findByScheduledTrue();
    List<Report> findByStatusAndStartDateBetween(String status, LocalDateTime start, LocalDateTime end);
    List<Report> findByNameContaining(String name);
    List<Report> findByNextRunTimeBefore(LocalDateTime time);
}
