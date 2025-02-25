package com.geocell.survey.repository;

import com.geocell.survey.model.SurveyData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SurveyRepository extends JpaRepository<SurveyData, String> {
    List<SurveyData> findBySurveyorId(String surveyorId);
}
