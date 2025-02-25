package com.geocell.map.service.impl;

import com.geocell.map.model.Polygon;
import com.geocell.map.repository.PolygonRepository;
import com.geocell.map.service.PolygonService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PolygonServiceImpl implements PolygonService {
    private final PolygonRepository polygonRepository;

    @Override
    @Transactional
    public Polygon createPolygon(Polygon polygon) {
        // Auto-generate cache key if not provided
        if (polygon.getCacheKey() == null) {
            polygon.setCacheKey(UUID.randomUUID().toString());
        }
        
        // Default caching to true
        if (polygon.getCached() == null) {
            polygon.setCached(true);
        }
        
        return polygonRepository.save(polygon);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Polygon> getPolygonById(Long id) {
        return polygonRepository.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Polygon> getPolygonByName(String name) {
        return polygonRepository.findByName(name);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Polygon> getPolygonsByOptimizationLevel(String optimizationLevel) {
        return polygonRepository.findByOptimizationLevel(optimizationLevel);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Polygon> getPolygonsWithSmoothing(Boolean smoothingEnabled) {
        return polygonRepository.findBySmoothingEnabled(smoothingEnabled);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Polygon> getPolygonByCacheKey(String cacheKey) {
        return polygonRepository.findByCacheKey(cacheKey);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Polygon> getCachedPolygons(Boolean smoothingEnabled, String optimizationLevel) {
        return polygonRepository.findCachedPolygons(smoothingEnabled, optimizationLevel);
    }

    @Override
    @Transactional
    public Polygon updatePolygon(Polygon polygon) {
        return polygonRepository.save(polygon);
    }

    @Override
    @Transactional
    public void deletePolygon(Long id) {
        polygonRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Polygon> getAllPolygons() {
        return polygonRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Polygon> getCachedPolygons() {
        return polygonRepository.findByCached(true);
    }
}
