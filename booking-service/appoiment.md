\# Appointment Service - Complete Build Prompt

Act as a Senior Spring Boot Microservices Architect.

Existing services:

\- identity-service

\- directory-service

\- schedule-service

Build Appointment Service completely.

IMPORTANT:

\- No Docker.

\- No Eureka.

\- Local PostgreSQL.

\- Do not wait for confirmation.

\- Complete all production files.

\- Compile at the end.

\- Testing can be done later.

\==================================================

TECH STACK

\==================================================

Java 17

Spring Boot 3.2.0

Spring Data JPA

PostgreSQL

Flyway

Lombok

MapStruct

Bean Validation

Swagger/OpenAPI

Actuator

JUnit 5

Mockito

JWT-ready architecture

\==================================================

SERVICE

\==================================================

Name:

appointment-service

Port:

8084

Database:

appointment\_db

PostgreSQL:

localhost:5432

postgres

1234

\==================================================

DOMAIN

\==================================================

Create Appointment entity.

Fields:

id UUID

patientId UUID

doctorId UUID

hospitalId UUID

slotId UUID

appointmentDate

startTime

endTime

status

appointmentNumber

reason

notes

createdAt

updatedAt

Do not create cross-database foreign keys.

\==================================================

ENUM

\==================================================

AppointmentStatus:

PENDING

CONFIRMED

CANCELLED

COMPLETED

NO\_SHOW

RESCHEDULED

\==================================================

DATABASE

\==================================================

Flyway:

V1\_\_init\_appointment\_schema.sql

Create table:

appointments

Indexes:

patient\_id

doctor\_id

hospital\_id

slot\_id

appointment\_date

status

Unique appointmentNumber.

\==================================================

DTO

\==================================================

AppointmentRequest

AppointmentResponse

CancelAppointmentRequest

RescheduleAppointmentRequest

Use validation annotations.

\==================================================

MAPPER

\==================================================

AppointmentMapper

Use MapStruct.

\==================================================

REPOSITORY

\==================================================

AppointmentRepository

Methods:

findById

findByAppointmentNumber

findByPatientId

findByDoctorId

findByHospitalId

findByDoctorIdAndAppointmentDate

findByPatientIdAndAppointmentDate

findByStatus

\==================================================

SERVICE

\==================================================

AppointmentService

Methods:

createAppointment

getAppointmentById

getByAppointmentNumber

getPatientAppointments

getDoctorAppointments

getHospitalAppointments

confirmAppointment

cancelAppointment

completeAppointment

markNoShow

rescheduleAppointment

deleteAppointment

\==================================================

BUSINESS RULES

\==================================================

When creating appointment:

1\. Validate patientId

2\. Validate doctorId

3\. Validate slotId

4\. Generate appointment number

5\. Initial status = PENDING

Do not actually modify Schedule Service database.

Prepare client interfaces for future communication.

Optional Feign clients:

ScheduleServiceClient

DirectoryServiceClient

IdentityServiceClient

Use service IDs but do not require Eureka now.

\==================================================

CONTROLLERS

\==================================================

AppointmentController

POST

/api/v1/appointments

GET

/api/v1/appointments/{id}

GET

/api/v1/appointments/number/{appointmentNumber}

GET

/api/v1/appointments/patient/{patientId}

GET

/api/v1/appointments/doctor/{doctorId}

GET

/api/v1/appointments/hospital/{hospitalId}

PATCH

/api/v1/appointments/{id}/confirm

PATCH

/api/v1/appointments/{id}/cancel

PATCH

/api/v1/appointments/{id}/complete

PATCH

/api/v1/appointments/{id}/no-show

PUT

/api/v1/appointments/{id}/reschedule

DELETE

/api/v1/appointments/{id}

\==================================================

CONFIG

\==================================================

Eureka disabled.

Swagger enabled.

Actuator health enabled.

Security JWT-ready.

\==================================================

API RESPONSE

\==================================================

ApiResponse

\==================================================

EXCEPTION

\==================================================

GlobalExceptionHandler

Handle:

ResourceNotFoundException

InvalidAppointmentStateException

DuplicateAppointmentException

BadRequestException

\==================================================

SWAGGER

\==================================================

Document all endpoints.

\==================================================

TESTS

\==================================================

Create basic unit tests.

Focus on service layer.

Do not spend excessive time on integration tests.

\==================================================

VERIFICATION

\==================================================

Run:

mvn clean compile

Fix all compile errors.

At end provide:

\- file tree

\- DB schema

\- API list

\- port

\- compilation status

\- next integration points

Do not use Docker.

Do not use Eureka.

Do not stop for confirmation.