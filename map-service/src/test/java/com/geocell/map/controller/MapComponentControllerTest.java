package com.geocell.map.controller;

import com.geocell.map.model.MapComponent;
import com.geocell.map.service.MapComponentService;
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

@WebMvcTest(MapComponentController.class)
public class MapComponentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private MapComponentService mapComponentService;

    @Autowired
    private ObjectMapper objectMapper;

    private MapComponent mapComponent;

    @BeforeEach
    void setUp() {
        mapComponent = new MapComponent();
        mapComponent.setId(1L);
        mapComponent.setName("Test Map Component");
        mapComponent.setType("BASE_MAP");
        mapComponent.setVisible(true);
    }

    @Test
    void createMapComponent_ShouldReturnCreatedComponent() throws Exception {
        when(mapComponentService.createMapComponent(any(MapComponent.class)))
            .thenReturn(mapComponent);

        mockMvc.perform(post("/map-components")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(mapComponent)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.name").value("Test Map Component"));
    }

    @Test
    void getMapComponentById_ShouldReturnComponent() throws Exception {
        when(mapComponentService.getMapComponentById(1L))
            .thenReturn(Optional.of(mapComponent));

        mockMvc.perform(get("/map-components/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.name").value("Test Map Component"));
    }

    @Test
    void getMapComponentByName_ShouldReturnComponent() throws Exception {
        when(mapComponentService.getMapComponentByName("Test Map Component"))
            .thenReturn(Optional.of(mapComponent));

        mockMvc.perform(get("/map-components/name/Test Map Component"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.name").value("Test Map Component"));
    }

    @Test
    void getMapComponentsByType_ShouldReturnComponents() throws Exception {
        List<MapComponent> components = Arrays.asList(mapComponent);
        when(mapComponentService.getMapComponentsByType("BASE_MAP"))
            .thenReturn(components);

        mockMvc.perform(get("/map-components/type/BASE_MAP"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1L))
                .andExpect(jsonPath("$[0].type").value("BASE_MAP"));
    }

    @Test
    void updateMapComponent_ShouldReturnUpdatedComponent() throws Exception {
        MapComponent updatedComponent = new MapComponent();
        updatedComponent.setId(1L);
        updatedComponent.setName("Updated Map Component");

        when(mapComponentService.updateMapComponent(any(MapComponent.class)))
            .thenReturn(updatedComponent);

        mockMvc.perform(put("/map-components/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updatedComponent)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Map Component"));
    }

    @Test
    void deleteMapComponent_ShouldReturnNoContent() throws Exception {
        doNothing().when(mapComponentService).deleteMapComponent(1L);

        mockMvc.perform(delete("/map-components/1"))
                .andExpect(status().isNoContent());
    }
}
