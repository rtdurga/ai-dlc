package com.geocell.map.model;

import javax.persistence.*;
import java.util.List;

@Entity
@Table(name = "polygons")
public class Polygon {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String description;

    @ElementCollection
    @CollectionTable(name = "polygon_coordinates", joinColumns = @JoinColumn(name = "polygon_id"))
    private List<PolygonCoordinate> coordinates;

    @Column(nullable = false)
    private String color;

    public static class PolygonCoordinate {
        private double latitude;
        private double longitude;

        public PolygonCoordinate() {}

        public PolygonCoordinate(double latitude, double longitude) {
            this.latitude = latitude;
            this.longitude = longitude;
        }

        // Getters and setters
        public double getLatitude() { return latitude; }
        public void setLatitude(double latitude) { this.latitude = latitude; }
        public double getLongitude() { return longitude; }
        public void setLongitude(double longitude) { this.longitude = longitude; }
    }

    // Constructors
    public Polygon() {}

    public Polygon(String name, String description, List<PolygonCoordinate> coordinates, String color) {
        this.name = name;
        this.description = description;
        this.coordinates = coordinates;
        this.color = color;
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public List<PolygonCoordinate> getCoordinates() { return coordinates; }
    public void setCoordinates(List<PolygonCoordinate> coordinates) { this.coordinates = coordinates; }
    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
}
