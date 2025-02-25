package com.geocell.report.controller;

import com.geocell.report.model.Report;
import com.geocell.report.service.ReportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
public class ReportController {
    private final ReportService reportService;

    @PostMapping
    public ResponseEntity<Report> createReport(@Valid @RequestBody Report report) {
        Report createdReport = reportService.createReport(report);
        return new ResponseEntity<>(createdReport, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Report> getReportById(@PathVariable Long id) {
        return reportService.getReportById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<Report>> getReportsByType(@PathVariable String type) {
        List<Report> reports = reportService.getReportsByType(type);
        return ResponseEntity.ok(reports);
    }

    @GetMapping("/name/{name}")
    public ResponseEntity<List<Report>> getReportsByName(@PathVariable String name) {
        List<Report> reports = reportService.getReportsByNameContaining(name);
        return ResponseEntity.ok(reports);
    }

    @GetMapping("/status")
    public ResponseEntity<List<Report>> getReportsByStatusAndDateRange(
            @RequestParam String status,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        List<Report> reports = reportService.getReportsByStatusAndDateRange(status, start, end);
        return ResponseEntity.ok(reports);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Report> updateReport(
            @PathVariable Long id, 
            @Valid @RequestBody Report report) {
        report.setId(id);
        Report updatedReport = reportService.updateReport(report);
        return ResponseEntity.ok(updatedReport);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReport(@PathVariable Long id) {
        reportService.deleteReport(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/schedule")
    public ResponseEntity<Report> scheduleReport(@PathVariable Long id) {
        Report report = reportService.getReportById(id)
                .orElseThrow(() -> new RuntimeException("Report not found"));
        Report scheduledReport = reportService.scheduleReport(report);
        return ResponseEntity.ok(scheduledReport);
    }

    @DeleteMapping("/{id}/schedule")
    public ResponseEntity<Void> cancelScheduledReport(@PathVariable Long id) {
        reportService.cancelScheduledReport(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/generate")
    public ResponseEntity<byte[]> generateReportFile(@PathVariable Long id) {
        byte[] reportContent = reportService.generateReportFile(id);
        
        Report report = reportService.getReportById(id)
                .orElseThrow(() -> new RuntimeException("Report not found"));

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(getMediaTypeForFormat(report.getFormat())))
                .header(HttpHeaders.CONTENT_DISPOSITION, 
                        "attachment; filename=\"" + report.getName() + "." + report.getFormat() + "\"")
                .body(reportContent);
    }

    @GetMapping("/{id}/export")
    public ResponseEntity<String> exportReport(
            @PathVariable Long id, 
            @RequestParam(defaultValue = "pdf") String format) {
        String filePath = reportService.exportReport(id, format);
        return ResponseEntity.ok(filePath);
    }

    private String getMediaTypeForFormat(String format) {
        switch (format.toLowerCase()) {
            case "pdf":
                return MediaType.APPLICATION_PDF_VALUE;
            case "csv":
                return MediaType.TEXT_PLAIN_VALUE;
            default:
                return MediaType.APPLICATION_OCTET_STREAM_VALUE;
        }
    }
}
