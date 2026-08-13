\# Schedule Service - Complete Build Prompt

Act as a Senior Spring Boot Microservices Architect.

We are building a Doctor Channeling Platform.

Already completed services:

\- identity-service

\- directory-service

Build the Schedule Service completely.

IMPORTANT:

\- Do NOT use Docker.

\- Do NOT use Eureka for now.

\- Use local PostgreSQL.

\- Build the complete service first.

\- Do not stop for confirmation.

\- Do not ask unnecessary questions.

\- Follow the same coding conventions as directory-service and identity-service.

\==================================================

TECH STACK

\==================================================

Java 17

Spring Boot 3.2.0

Spring Data JPA

PostgreSQL

Flyway

Spring Security

JWT-ready architecture

Lombok

MapStruct

Bean Validation

Swagger/OpenAPI

Actuator

JUnit 5

Mockito

\==================================================

SERVICE

\==================================================

Service name:

schedule-service

Port:

8083

Database:

schedule\_db

PostgreSQL:

localhost:5432

Username:

postgres

Password:

1234

\==================================================

ARCHITECTURE

\==================================================

Create:

controller/

service/

service/impl/

repository/

entity/

dto/request/

dto/response/

dto/mapper/

exception/

payload/

config/

security/

client/

util/

\==================================================

CORE DOMAIN

\==================================================

Create Doctor Schedule management.

Entities:

DoctorSchedule

Fields:

id UUID

doctorId UUID

hospitalId UUID

dayOfWeek

startTime

endTime

slotDurationMinutes

isActive

createdAt

updatedAt

Use UUID.

Do not create cross-database foreign keys to directory\_db.

doctorId and hospitalId are external service IDs.

\==================================================

AVAILABILITY / SLOTS

\==================================================

Create AppointmentSlot entity.

Fields:

id UUID

scheduleId UUID

doctorId UUID

slotDate

startTime

endTime

status

createdAt

Slot status:

AVAILABLE

BOOKED

BLOCKED

EXPIRED

\==================================================

DATABASE

\==================================================

Create Flyway migration:

V1\_\_init\_schedule\_schema.sql

Create:

doctor\_schedules

appointment\_slots

Add indexes for:

doctor\_id

hospital\_id

schedule\_id

slot\_date

status

Add unique constraints where appropriate.

Use:

gen\_random\_uuid()

Enable pgcrypto extension if required.

\==================================================

ENUMS

\==================================================

DayOfWeek:

MONDAY

TUESDAY

WEDNESDAY

THURSDAY

FRIDAY

SATURDAY

SUNDAY

SlotStatus:

AVAILABLE

BOOKED

BLOCKED

EXPIRED

\==================================================

DTO

\==================================================

Create:

DoctorScheduleRequest

DoctorScheduleResponse

AppointmentSlotRequest

AppointmentSlotResponse

Use Jakarta Validation.

\==================================================

MAPPER

\==================================================

Use MapStruct.

Create:

DoctorScheduleMapper

AppointmentSlotMapper

\==================================================

REPOSITORIES

\==================================================

Create:

DoctorScheduleRepository

AppointmentSlotRepository

Methods:

findByDoctorId

findByHospitalId

findByDoctorIdAndDayOfWeek

findByDoctorIdAndSlotDate

findByStatus

existsByDoctorId

\==================================================

SERVICE

\==================================================

DoctorScheduleService

Methods:

createSchedule

updateSchedule

getScheduleById

getSchedulesByDoctor

getSchedulesByHospital

deleteSchedule

activateSchedule

deactivateSchedule

AppointmentSlotService

Methods:

generateSlots

getSlotsByDoctorAndDate

getAvailableSlots

getSlotById

updateSlotStatus

deleteSlot

\==================================================

CONTROLLERS

\==================================================

DoctorScheduleController

POST

/api/v1/schedules

GET

/api/v1/schedules

GET

/api/v1/schedules/{id}

GET

/api/v1/schedules/doctor/{doctorId}

GET

/api/v1/schedules/hospital/{hospitalId}

PUT

/api/v1/schedules/{id}

DELETE

/api/v1/schedules/{id}

PATCH

/api/v1/schedules/{id}/activate

PATCH

/api/v1/schedules/{id}/deactivate

AppointmentSlotController

POST

/api/v1/slots/generate

GET

/api/v1/slots/{id}

GET

/api/v1/slots/doctor/{doctorId}

GET

/api/v1/slots/doctor/{doctorId}/date/{date}

GET

/api/v1/slots/available/{doctorId}/{date}

PATCH

/api/v1/slots/{id}/status

\==================================================

SECURITY

\==================================================

Do not require Eureka.

Keep service JWT-ready.

Configure:

SecurityConfig

Allow:

Swagger

Actuator health

Authentication can be temporarily permissive for local development if necessary.

Do NOT implement a second authentication system.

\==================================================

DATABASE CONFIG

\==================================================

application.yml:

server:

port: 8083

spring:

application:

name: schedule-service

datasource:

url: jdbc:postgresql://localhost:5432/schedule\_db

username: postgres

password: 1234

jpa:

hibernate:

ddl-auto: validate

flyway:

enabled: true

baseline-on-migrate: true

Eureka must be disabled.

\==================================================

API RESPONSE

\==================================================

Use:

ApiResponse

Fields:

success

message

data

timestamp

\==================================================

EXCEPTION HANDLING

\==================================================

Create:

ResourceNotFoundException

BadRequestException

GlobalExceptionHandler

Handle:

404

400

409

500

\==================================================

SWAGGER

\==================================================

Document every controller endpoint.

\==================================================

TESTS

\==================================================

Create basic unit tests for services.

Do not spend excessive time on integration tests now.

\==================================================

IMPLEMENTATION RULE

\==================================================

Generate ALL production files required.

Do not leave TODOs.

Do not leave placeholder methods.

Make sure imports are correct.

Make sure MapStruct implementations are generated.

Make sure Flyway migration matches entities.

\==================================================

VERIFICATION

\==================================================

Run:

mvn clean compile

Fix compilation errors.

Do not stop because tests are not implemented completely.

At the end provide:

1\. Complete file tree

2\. Database tables

3\. API list

4\. Port

5\. Database name

6\. Compilation result

7\. Remaining optional improvements

Do not move to Docker yet.