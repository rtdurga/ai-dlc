# Team Service

## Overview
Team Service manages team-related operations for the GeoCELL Intelligence Platform, supporting Karthik's team management and collaboration requirements.

## Key Features
- Team creation and management
- Member role assignment
- Access control and permissions
- Audit logging
- Team collaboration tracking

## API Endpoints
- `GET /api/teams`: List all teams
- `POST /api/teams`: Create a new team
- `GET /api/teams/{id}`: Retrieve team details
- `PUT /api/teams/{id}`: Update team information
- `DELETE /api/teams/{id}`: Delete a team
- `POST /api/teams/{id}/members`: Add team members
- `DELETE /api/teams/{id}/members/{memberId}`: Remove team member
- `GET /api/teams/{id}/audit-logs`: Retrieve team audit logs

## Technology Stack
- Java 17
- Spring Boot
- PostgreSQL
- JPA/Hibernate
- Spring Security

## Local Development
1. Install Java 17+
2. Configure database in `application.yml`
3. Run: `mvn spring-boot:run`

## Testing
- Run tests: `mvn test`
- Generate coverage report: `mvn jacoco:report`

## Deployment
- Build JAR: `mvn clean package`
- Docker build: `docker build -t team-service .`

## Contribution Guidelines
- Follow clean code principles
- Write comprehensive tests
- Maintain strict access control
- Document team management features
- Ensure audit trail integrity
