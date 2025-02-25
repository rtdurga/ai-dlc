package com.geocell.survey.service;

import com.geocell.survey.model.SurveyData;
import java.util.List;

public interface SurveyService {
    SurveyData createSurvey(SurveyData surveyData);
    
    SurveyData getSurvey(String id);
    
    List<SurveyData> getAllSurveys();
    
    SurveyData updateSurvey(String id, SurveyData surveyData);
    
    void deleteSurvey(String id);
    
    List<SurveyData> getSurveysBySurveyor(String surveyorId);
}
