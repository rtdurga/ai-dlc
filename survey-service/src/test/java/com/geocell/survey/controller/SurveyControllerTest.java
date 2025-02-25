package com.geocell.survey.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.geocell.survey.model.SurveyData;
import com.geocell.survey.service.SurveyService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(SurveyController.class)
class SurveyControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private SurveyService surveyService;

    @Autowired
    private ObjectMapper objectMapper;

    private SurveyData testSurvey;

    @BeforeEach
    void setUp() {
        testSurvey = new SurveyData();
        testSurvey.setId("test-id");
        testSurvey.setTimestamp(LocalDateTime.now());
        testSurvey.setSurveyorId("surveyor-1");
        testSurvey.setDescription("Test Survey");
        
        SurveyData.Location location = new SurveyData.Location();
        location.setLatitude(12.9716);
        location.setLongitude(77.5946);
        testSurvey.setLocation(location);

        SurveyData.PolygonPoint point = new SurveyData.PolygonPoint();
        point.setLatitude(12.9716);
        point.setLongitude(77.5946);
        point.setElevation(920.0);
        testSurvey.setPolygonPoints(Collections.singletonList(point));
    }

    @Test
    void createSurvey_ValidData_ReturnsCreatedSurvey() throws Exception {
        when(surveyService.createSurvey(any(SurveyData.class))).thenReturn(testSurvey);

        mockMvc.perform(post("/api/v1/surveys")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testSurvey)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(testSurvey.getId()))
                .andExpect(jsonPath("$.surveyorId").value(testSurvey.getSurveyorId()));
    }

    @Test
    void getSurvey_ExistingSurvey_ReturnsSurvey() throws Exception {
        when(surveyService.getSurvey("test-id")).thenReturn(testSurvey);

        mockMvc.perform(get("/api/v1/surveys/test-id"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(testSurvey.getId()))
                .andExpect(jsonPath("$.surveyorId").value(testSurvey.getSurveyorId()));
    }

    @Test
    void getAllSurveys_ReturnsListOfSurveys() throws Exception {
        when(surveyService.getAllSurveys()).thenReturn(Arrays.asList(testSurvey));

        mockMvc.perform(get("/api/v1/surveys"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(testSurvey.getId()))
                .andExpect(jsonPath("$[0].surveyorId").value(testSurvey.getSurveyorId()));
    }

    @Test
    void updateSurvey_ValidData_ReturnsUpdatedSurvey() throws Exception {
        when(surveyService.updateSurvey(eq("test-id"), any(SurveyData.class))).thenReturn(testSurvey);

        mockMvc.perform(put("/api/v1/surveys/test-id")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testSurvey)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(testSurvey.getId()))
                .andExpect(jsonPath("$.surveyorId").value(testSurvey.getSurveyorId()));
    }

    @Test
    void deleteSurvey_ExistingSurvey_ReturnsNoContent() throws Exception {
        mockMvc.perform(delete("/api/v1/surveys/test-id"))
                .andExpect(status().isNoContent());
    }

    @Test
    void getSurveysBySurveyor_ReturnsSurveysList() throws Exception {
        when(surveyService.getSurveysBySurveyor("surveyor-1"))
                .thenReturn(Arrays.asList(testSurvey));

        mockMvc.perform(get("/api/v1/surveys/surveyor/surveyor-1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(testSurvey.getId()))
                .andExpect(jsonPath("$[0].surveyorId").value(testSurvey.getSurveyorId()));
    }
}
