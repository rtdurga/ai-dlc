package com.geocell.map.exception;

public class PolygonNotFoundException extends RuntimeException {
    public PolygonNotFoundException(String message) {
        super(message);
    }

    public PolygonNotFoundException(Long id) {
        super("Polygon not found with id: " + id);
    }

    public PolygonNotFoundException(String name, String color) {
        super("No polygons found with name: " + name + " and color: " + color);
    }
}
