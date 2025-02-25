package com.geocell.map.controller;

import com.geocell.map.model.Polygon;
import com.geocell.map.service.PolygonService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PolygonController.class)
public class PolygonControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PolygonService polygonService;

    @Autowired
    private ObjectMapper objectMapper;

    private Polygon polygon;

    @BeforeEach
    void setUp() {
        polygon = new Polygon();
        polygon.setId(1L);
        polygon.setName("Test Polygon");
        polygon.setOptimizationLevel("HIGH");
        polygon.setSmoothingEnabled(true);
        polygon.setCached(true);
        polygon.setCacheKey("test-cache-key");
    }

    @Test
    void createPolygon_ShouldReturnCreatedPolygon() throws Exception {
        when(polygonService.createPolygon(any(Polygon.class)))
            .thenReturn(polygon);

        mockMvc.perform(post("/polygons")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(polygon)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.name").value("Test Polygon"));
    }

    @Test
    void getPolygonById_ShouldReturnPolygon() throws Exception {
        when(polygonService.getPolygonById(1L))
            .thenReturn(Optional.of(polygon));

        mockMvc.perform(get("/polygons/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.name").value("Test Polygon"));
    }

    @Test
    void getPolygonByName_ShouldReturnPolygon() throws Exception {
        when(polygonService.getPolygonByName("Test Polygon"))
            .thenReturn(Optional.of(polygon));

        mockMvc.perform(get("/polygons/name/Test Polygon"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.name").value("Test Polygon"));
    }

    @Test
    void getPolygonsByOptimizationLevel_ShouldReturnPolygons() throws Exception {
        List<Polygon> polygons = Arrays.asList(polygon);
        when(polygonService.getPolygonsByOptimizationLevel("HIGH"))
            .thenReturn(polygons);

        mockMvc.perform(get("/polygons/optimization/HIGH"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1L))
                .andExpect(jsonPath("$[0].optimizationLevel").value("HIGH"));
    }

    @Test
    void getPolygonsWithSmoothing_ShouldReturnPolygons() throws Exception {
        List<Polygon> polygons = Arrays.asList(polygon);
        when(polygonService.getPolygonsWithSmoothing(true))
            .thenReturn(polygons);

        mockMvc.perform(get("/polygons/smoothing/true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1L))
                .andExpect(jsonPath("$[0].smoothingEnabled").value(true));
    }

    @Test
    void getPolygonByCacheKey_ShouldReturnPolygon() throws Exception {
        when(polygonService.getPolygonByCacheKey("test-cache-key"))
            .thenReturn(Optional.of(polygon));

        mockMvc.perform(get("/polygons/cache/test-cache-key"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.cacheKey").value("test-cache-key"));
    }

    @Test
    void updatePolygon_ShouldReturnUpdatedPolygon() throws Exception {
        Polygon updatedPolygon = new Polygon();
        updatedPolygon.setId(1L);
        updatedPolygon.setName("Updated Polygon");

        when(polygonService.updatePolygon(any(Polygon.class)))
            .thenReturn(updatedPolygon);

        mockMvc.perform(put("/polygons/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updatedPolygon)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Polygon"));
    }

    @Test
    void deletePolygon_ShouldReturnNoContent() throws Exception {
        doNothing().when(polygonService).deletePolygon(1L);

        mockMvc.perform(delete("/polygons/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    void getCachedPolygons_ShouldReturnPolygons() throws Exception {
        List<Polygon> cachedPolygons = Arrays.asList(polygon);
        when(polygonService.getCachedPolygons())
            .thenReturn(cachedPolygons);

        mockMvc.perform(get("/polygons/cached"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1L))
                .andExpect(jsonPath("$[0].cached").value(true));
    }
}
