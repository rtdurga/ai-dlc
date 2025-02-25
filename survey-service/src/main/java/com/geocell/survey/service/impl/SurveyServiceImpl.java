package com.geocell.survey.service.impl;

import com.geocell.survey.model.SurveyData;
import com.geocell.survey.repository.SurveyRepository;
import com.geocell.survey.service.SurveyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SurveyServiceImpl implements SurveyService {
    
    private final SurveyRepository surveyRepository;

    @Override
    public SurveyData createSurvey(SurveyData surveyData) {
        if (surveyRepository.existsById(surveyData.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Survey already exists with ID: " + surveyData.getId());
        }
        return surveyRepository.save(surveyData);
    }

    @Override
    public SurveyData getSurvey(String id) {
        return surveyRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Survey not found with ID: " + id));
    }

    @Override
    public List<SurveyData> getAllSurveys() {
        return surveyRepository.findAll();
    }

    @Override
    public SurveyData updateSurvey(String id, SurveyData surveyData) {
        if (!surveyRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Survey not found with ID: " + id);
        }
        surveyData.setId(id);
        return surveyRepository.save(surveyData);
    }

    @Override
    public void deleteSurvey(String id) {
        if (!surveyRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Survey not found with ID: " + id);
        }
        surveyRepository.deleteById(id);
    }

    @Override
    public List<SurveyData> getSurveysBySurveyor(String surveyorId) {
        return surveyRepository.findBySurveyorId(surveyorId);
    }
}
