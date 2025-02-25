package com.geocell.map.repository;

import com.geocell.map.model.MapComponent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MapComponentRepository extends JpaRepository<MapComponent, Long> {
    Optional<MapComponent> findByName(String name);
    List<MapComponent> findByType(String type);
    List<MapComponent> findByVisible(Boolean visible);
}
