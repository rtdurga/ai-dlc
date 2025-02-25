package com.geocell.map.repository;

import com.geocell.map.model.Polygon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PolygonRepository extends JpaRepository<Polygon, Long> {
    List<Polygon> findByName(String name);
    List<Polygon> findByColor(String color);
    List<Polygon> findByNameAndColor(String name, String color);
}
