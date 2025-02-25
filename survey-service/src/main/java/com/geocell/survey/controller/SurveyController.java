package com.geocell.survey.controller;

import com.geocell.survey.model.SurveyData;
import com.geocell.survey.service.SurveyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/surveys")
@RequiredArgsConstructor
public class SurveyController {

    private final SurveyService surveyService;

    @PostMapping
    public ResponseEntity<SurveyData> createSurvey(@Valid @RequestBody SurveyData surveyData) {
        return ResponseEntity.ok(surveyService.createSurvey(surveyData));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SurveyData> getSurvey(@PathVariable String id) {
        return ResponseEntity.ok(surveyService.getSurvey(id));
    }

    @GetMapping
    public ResponseEntity<List<SurveyData>> getAllSurveys() {
        return ResponseEntity.ok(surveyService.getAllSurveys());
    }

    @PutMapping("/{id}")
    public ResponseEntity<SurveyData> updateSurvey(
            @PathVariable String id,
            @Valid @RequestBody SurveyData surveyData) {
        return ResponseEntity.ok(surveyService.updateSurvey(id, surveyData));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSurvey(@PathVariable String id) {
        surveyService.deleteSurvey(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/surveyor/{surveyorId}")
    public ResponseEntity<List<SurveyData>> getSurveysBySurveyor(@PathVariable String surveyorId) {
        return ResponseEntity.ok(surveyService.getSurveysBySurveyor(surveyorId));
    }
}
