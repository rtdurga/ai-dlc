package com.geocell.map.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.JoinColumn;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;
import java.util.Map;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MapComponent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String type;
    
    @Column(name = "center_lat")
    private Double centerLatitude;
    
    @Column(name = "center_lng")
    private Double centerLongitude;
    
    private Integer zoomLevel;
    private Boolean visible;
    
    @ElementCollection
    @CollectionTable(name = "map_layers", 
        joinColumns = @JoinColumn(name = "map_component_id"))
    private List<String> layers;
    
    @ElementCollection
    @CollectionTable(name = "map_styles", 
        joinColumns = @JoinColumn(name = "map_component_id"))
    private Map<String, String> styles;
}
