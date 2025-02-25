# Report Service

## Overview
Report Service provides analytics, reporting, and usage tracking capabilities for the GeoCELL Intelligence Platform, supporting Karthik's reporting and insights generation.

## Key Features
- Custom report generation
- Usage analytics tracking
- Performance monitoring
- Scheduled reporting
- Insights and recommendations

## API Endpoints
- `GET /api/reports`: List available reports
- `POST /api/reports`: Generate new report
- `GET /api/analytics/usage`: Retrieve usage statistics
- `GET /api/analytics/performance`: Get system performance metrics
- `POST /api/reports/schedule`: Schedule recurring reports

## Technology Stack
- Java 17
- Spring Boot
- PostgreSQL
- JPA/Hibernate
- Reporting libraries

## Local Development
1. Install Java 17+
2. Configure database in `application.yml`
3. Run: `mvn spring-boot:run`

## Testing
- Run tests: `mvn test`
- Generate coverage report: `mvn jacoco:report`

## Deployment
- Build JAR: `mvn clean package`
- Docker build: `docker build -t report-service .`

## Contribution Guidelines
- Follow clean code principles
- Write comprehensive tests
- Document new reporting features
- Ensure data privacy and security
- Maintain performance tracking accuracy
