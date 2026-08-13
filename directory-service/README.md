# Directory Service

The Directory Service is a robust, enterprise-grade Spring Boot 3 microservice that manages the core entities of the Doctor Channeling Platform, including Doctors, Hospitals, Specializations, and their relationships (Affiliations).

## 🚀 Technologies Used
- **Java 17** & **Spring Boot 3.x**
- **Spring Data JPA** & **Hibernate**
- **PostgreSQL** & **Flyway** (Database & Migrations)
- **MapStruct** & **Lombok** (Boilerplate & Mapping)
- **Spring Cloud Netflix Eureka** (Service Discovery)
- **Spring Cloud Config** (Externalized Configuration)
- **Spring Boot Actuator** (Health & Metrics)
- **JUnit 5** & **Mockito** (Testing)
- **SpringDoc OpenAPI** (Swagger Documentation)
- **Docker** (Containerization)

## 📁 Architecture & Folder Structure

This project follows Clean Architecture principles, ensuring a clear separation of concerns:

```text
src/main/java/com/docplatform/directory/
├── config/       # Swagger and App configurations
├── controller/   # REST Controllers (API Endpoints)
├── dto/          # Data Transfer Objects & Mappers
│   ├── mapper/
│   ├── request/
│   └── response/
├── entity/       # JPA Entities
├── exception/    # Global Exception Handling & Custom Exceptions
├── payload/      # Standardized API Responses (ApiResponse<T>)
├── repository/   # Spring Data JPA Repositories
└── service/      # Business Logic (Interfaces & Impl)
```

## 🔗 API Endpoints

All endpoints use a unified `ApiResponse<T>` format and support full CRUD.
The base path is `/api/v1`.

### Doctors
- `POST /doctors` - Create a doctor
- `GET /doctors` - Get all doctors
- `GET /doctors/{id}` - Get a doctor by ID
- `PUT /doctors/{id}` - Update a doctor
- `DELETE /doctors/{id}` - Delete a doctor

### Hospitals
- `POST /hospitals` - Create a hospital
- `GET /hospitals` - Get all hospitals
- `GET /hospitals/{id}` - Get a hospital by ID
- `PUT /hospitals/{id}` - Update a hospital
- `DELETE /hospitals/{id}` - Delete a hospital

### Specializations
- `POST /specializations` - Create a specialization
- `GET /specializations` - Get all specializations
- `GET /specializations/{id}` - Get a specialization by ID
- `PUT /specializations/{id}` - Update a specialization
- `DELETE /specializations/{id}` - Delete a specialization

### Doctor-Hospital Affiliations
- `POST /affiliations` - Create an affiliation
- `GET /affiliations` - Get all affiliations
- `GET /affiliations/doctor/{doctorId}/hospital/{hospitalId}` - Get an affiliation by ID
- `PUT /affiliations/doctor/{doctorId}/hospital/{hospitalId}` - Update an affiliation
- `DELETE /affiliations/doctor/{doctorId}/hospital/{hospitalId}` - Delete an affiliation

## 📖 Swagger Usage
Once the service is running, access the interactive API documentation at:
`http://localhost:8082/swagger-ui.html`

## 🐳 Docker Commands

The service is fully containerized and integrated into the global `docker-compose.yml`.

To build and run:
```bash
# From the root directory containing docker-compose.yml
docker compose build directory-service
docker compose up -d directory-service
```

## 🧪 Testing Instructions

The project includes both Unit Tests (Services) and Integration Tests (Controllers).

To run the tests:
```bash
mvn clean test
```

## 🛠️ Run Instructions (Local)

If running outside Docker:
1. Ensure PostgreSQL is running and a database named `directory_db` exists.
2. Build the project:
   ```bash
   mvn clean install -DskipTests
   ```
3. Run the application:
   ```bash
   mvn spring-boot:run
   ```

## ✨ Future Improvements
- Implement Redis caching for frequently accessed doctors/hospitals.
- Implement pagination and filtering via Spring Data Pageable.
- Secure endpoints using Spring Security and OAuth2/JWT integration.
