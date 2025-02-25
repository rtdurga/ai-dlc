package com.geocell.map.service;

import com.geocell.map.model.Polygon;
import com.geocell.map.repository.PolygonRepository;
import com.geocell.map.exception.PolygonNotFoundException;
import com.geocell.map.exception.InvalidPolygonDataException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class PolygonService {

    @Autowired
    private PolygonRepository polygonRepository;

    public Polygon createPolygon(Polygon polygon) {
        validatePolygon(polygon);
        return polygonRepository.save(polygon);
    }

    public List<Polygon> getAllPolygons() {
        return polygonRepository.findAll();
    }

    public Polygon getPolygonById(Long id) {
        return polygonRepository.findById(id)
            .orElseThrow(() -> new PolygonNotFoundException(id));
    }

    public List<Polygon> getPolygonsByName(String name) {
        List<Polygon> polygons = polygonRepository.findByName(name);
        if (polygons.isEmpty()) {
            throw new PolygonNotFoundException("No polygons found with name: " + name);
        }
        return polygons;
    }

    public List<Polygon> getPolygonsByColor(String color) {
        List<Polygon> polygons = polygonRepository.findByColor(color);
        if (polygons.isEmpty()) {
            throw new PolygonNotFoundException("No polygons found with color: " + color);
        }
        return polygons;
    }

    public Polygon updatePolygon(Long id, Polygon polygonDetails) {
        Polygon existingPolygon = getPolygonById(id);
        
        validatePolygon(polygonDetails);
        
        existingPolygon.setName(polygonDetails.getName());
        existingPolygon.setDescription(polygonDetails.getDescription());
        existingPolygon.setCoordinates(polygonDetails.getCoordinates());
        existingPolygon.setColor(polygonDetails.getColor());

        return polygonRepository.save(existingPolygon);
    }

    public void deletePolygon(Long id) {
        Polygon polygon = getPolygonById(id);
        polygonRepository.delete(polygon);
    }

    private void validatePolygon(Polygon polygon) {
        // Validate name
        if (polygon.getName() == null || polygon.getName().trim().isEmpty()) {
            throw InvalidPolygonDataException.invalidName(polygon.getName());
        }

        // Validate coordinates
        if (polygon.getCoordinates() == null || polygon.getCoordinates().size() < 3) {
            throw InvalidPolygonDataException.invalidCoordinates();
        }

        // Validate color (basic color validation)
        if (polygon.getColor() == null || !polygon.getColor().matches("^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$")) {
            throw InvalidPolygonDataException.invalidColor(polygon.getColor());
        }
    }
}
