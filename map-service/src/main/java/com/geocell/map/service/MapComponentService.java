package com.geocell.map.service;

import com.geocell.map.model.MapComponent;
import java.util.List;
import java.util.Optional;

public interface MapComponentService {
    MapComponent createMapComponent(MapComponent mapComponent);
    Optional<MapComponent> getMapComponentById(Long id);
    Optional<MapComponent> getMapComponentByName(String name);
    List<MapComponent> getMapComponentsByType(String type);
    List<MapComponent> getVisibleMapComponents();
    MapComponent updateMapComponent(MapComponent mapComponent);
    void deleteMapComponent(Long id);
    List<MapComponent> getAllMapComponents();
}
