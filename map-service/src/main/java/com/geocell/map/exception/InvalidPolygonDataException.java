package com.geocell.map.exception;

public class InvalidPolygonDataException extends RuntimeException {
    public InvalidPolygonDataException(String message) {
        super(message);
    }

    public InvalidPolygonDataException(String fieldName, Object invalidValue) {
        super("Invalid value for field " + fieldName + ": " + invalidValue);
    }

    public static InvalidPolygonDataException invalidCoordinates() {
        return new InvalidPolygonDataException("Polygon must have at least 3 coordinates to form a valid polygon");
    }

    public static InvalidPolygonDataException invalidName(String name) {
        return new InvalidPolygonDataException("Polygon name cannot be null or empty: " + name);
    }

    public static InvalidPolygonDataException invalidColor(String color) {
        return new InvalidPolygonDataException("Invalid polygon color: " + color);
    }
}
