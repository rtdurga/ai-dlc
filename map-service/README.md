# Map Service

## Overview
Map Service manages geospatial data and polygon generation for the GeoCELL Intelligence Platform, supporting Karthik's visualization and mapping requirements.

## Key Features
- Polygon generation and management
- Geospatial data processing
- Custom map component creation
- Layer and styling management

## API Endpoints
- `GET /api/maps`: List available map components
- `GET /api/polygons`: Retrieve polygon data
- `POST /api/polygons`: Create new polygon
- `PUT /api/polygons/{id}`: Update polygon
- `DELETE /api/polygons/{id}`: Remove polygon

## Technology Stack
- Java 17
- Spring Boot
- PostgreSQL
- Geospatial libraries
- JPA/Hibernate

## Local Development
1. Install Java 17+
2. Configure database in `application.yml`
3. Run: `mvn spring-boot:run`

## Testing
- Run tests: `mvn test`
- Generate coverage report: `mvn jacoco:report`

## Deployment
- Build JAR: `mvn clean package`
- Docker build: `docker build -t map-service .`

## Contribution Guidelines
- Follow clean code principles
- Write comprehensive tests
- Document new features
- Maintain geospatial data integrity
