package com.geocell.map.controller;

import com.geocell.map.model.Polygon;
import com.geocell.map.service.PolygonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/polygons")
public class PolygonController {

    @Autowired
    private PolygonService polygonService;

    @PostMapping
    public ResponseEntity<Polygon> createPolygon(@Valid @RequestBody Polygon polygon) {
        Polygon createdPolygon = polygonService.createPolygon(polygon);
        return new ResponseEntity<>(createdPolygon, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Polygon>> getAllPolygons() {
        List<Polygon> polygons = polygonService.getAllPolygons();
        return ResponseEntity.ok(polygons);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Polygon> getPolygonById(@PathVariable Long id) {
        Polygon polygon = polygonService.getPolygonById(id);
        return ResponseEntity.ok(polygon);
    }

    @GetMapping("/name/{name}")
    public ResponseEntity<List<Polygon>> getPolygonsByName(@PathVariable String name) {
        List<Polygon> polygons = polygonService.getPolygonsByName(name);
        return ResponseEntity.ok(polygons);
    }

    @GetMapping("/color/{color}")
    public ResponseEntity<List<Polygon>> getPolygonsByColor(@PathVariable String color) {
        List<Polygon> polygons = polygonService.getPolygonsByColor(color);
        return ResponseEntity.ok(polygons);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Polygon> updatePolygon(
        @PathVariable Long id, 
        @Valid @RequestBody Polygon polygonDetails
    ) {
        Polygon updatedPolygon = polygonService.updatePolygon(id, polygonDetails);
        return ResponseEntity.ok(updatedPolygon);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePolygon(@PathVariable Long id) {
        polygonService.deletePolygon(id);
        return ResponseEntity.noContent().build();
    }
}
