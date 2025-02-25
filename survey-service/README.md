# Survey Service

## Overview
Survey Service is a microservice responsible for managing survey-related operations in the GeoCELL application, focusing on data collection and processing.

## Key Features
- Survey data management
- Geospatial survey tracking
- Data validation and storage

## API Endpoints
- `GET /api/surveys`: List all surveys
- `GET /api/surveys/{id}`: Retrieve specific survey details
- `POST /api/surveys`: Create a new survey
- `PUT /api/surveys/{id}`: Update existing survey
- `DELETE /api/surveys/{id}`: Remove a survey

## Technology Stack
- Java 17
- Spring Boot
- PostgreSQL
- JPA/Hibernate

## Local Development
1. Install Java 17+
2. Configure database in `application.yml`
3. Run: `mvn spring-boot:run`

## Testing
- Run tests: `mvn test`
- Coverage report: `mvn jacoco:report`

## Deployment
- Build JAR: `mvn clean package`
- Docker build: `docker build -t survey-service .`

## Contribution
- Follow code style guidelines
- Write unit and integration tests
- Update documentation
