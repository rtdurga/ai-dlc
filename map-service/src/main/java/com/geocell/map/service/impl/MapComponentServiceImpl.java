package com.geocell.map.service.impl;

import com.geocell.map.model.MapComponent;
import com.geocell.map.repository.MapComponentRepository;
import com.geocell.map.service.MapComponentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MapComponentServiceImpl implements MapComponentService {
    private final MapComponentRepository mapComponentRepository;

    @Override
    @Transactional
    public MapComponent createMapComponent(MapComponent mapComponent) {
        return mapComponentRepository.save(mapComponent);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<MapComponent> getMapComponentById(Long id) {
        return mapComponentRepository.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<MapComponent> getMapComponentByName(String name) {
        return mapComponentRepository.findByName(name);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MapComponent> getMapComponentsByType(String type) {
        return mapComponentRepository.findByType(type);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MapComponent> getVisibleMapComponents() {
        return mapComponentRepository.findByVisible(true);
    }

    @Override
    @Transactional
    public MapComponent updateMapComponent(MapComponent mapComponent) {
        return mapComponentRepository.save(mapComponent);
    }

    @Override
    @Transactional
    public void deleteMapComponent(Long id) {
        mapComponentRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MapComponent> getAllMapComponents() {
        return mapComponentRepository.findAll();
    }
}
