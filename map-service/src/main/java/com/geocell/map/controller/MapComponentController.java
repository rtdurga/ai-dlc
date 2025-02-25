package com.geocell.map.controller;

import com.geocell.map.model.MapComponent;
import com.geocell.map.service.MapComponentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/map-components")
@RequiredArgsConstructor
public class MapComponentController {
    private final MapComponentService mapComponentService;

    @PostMapping
    public ResponseEntity<MapComponent> createMapComponent(
            @Valid @RequestBody MapComponent mapComponent) {
        MapComponent createdComponent = mapComponentService.createMapComponent(mapComponent);
        return new ResponseEntity<>(createdComponent, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MapComponent> getMapComponentById(@PathVariable Long id) {
        return mapComponentService.getMapComponentById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/name/{name}")
    public ResponseEntity<MapComponent> getMapComponentByName(@PathVariable String name) {
        return mapComponentService.getMapComponentByName(name)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<MapComponent>> getMapComponentsByType(@PathVariable String type) {
        List<MapComponent> components = mapComponentService.getMapComponentsByType(type);
        return ResponseEntity.ok(components);
    }

    @GetMapping("/visible")
    public ResponseEntity<List<MapComponent>> getVisibleMapComponents() {
        List<MapComponent> visibleComponents = mapComponentService.getVisibleMapComponents();
        return ResponseEntity.ok(visibleComponents);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MapComponent> updateMapComponent(
            @PathVariable Long id, 
            @Valid @RequestBody MapComponent mapComponent) {
        // Ensure the ID from the path matches the ID in the body
        mapComponent.setId(id);
        MapComponent updatedComponent = mapComponentService.updateMapComponent(mapComponent);
        return ResponseEntity.ok(updatedComponent);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMapComponent(@PathVariable Long id) {
        mapComponentService.deleteMapComponent(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<MapComponent>> getAllMapComponents() {
        List<MapComponent> components = mapComponentService.getAllMapComponents();
        return ResponseEntity.ok(components);
    }
}
