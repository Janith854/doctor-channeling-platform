\# Notification Service - Complete Build Prompt

Act as a Senior Spring Boot Microservices Architect.

Existing platform:

\- Identity Service

\- Directory Service

\- Schedule Service

\- Appointment Service

Build Notification Service completely.

IMPORTANT:

\- No Docker now.

\- No Eureka.

\- Local PostgreSQL.

\- Build all files.

\- Compile at the end.

\- Testing can be done later.

\- Do not stop for confirmation.

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

Validation

Swagger/OpenAPI

Actuator

JUnit 5

Mockito

Email support:

Spring Mail

\==================================================

SERVICE

\==================================================

Name:

notification-service

Port:

8085

Database:

notification\_db

Database:

localhost:5432

postgres

1234

\==================================================

DOMAIN

\==================================================

Notification entity.

Fields:

id UUID

userId UUID

recipient

subject

message

type

channel

status

sentAt

createdAt

updatedAt

\==================================================

ENUMS

\==================================================

NotificationType:

APPOINTMENT\_CREATED

APPOINTMENT\_CONFIRMED

APPOINTMENT\_CANCELLED

APPOINTMENT\_RESCHEDULED

PAYMENT\_SUCCESS

PAYMENT\_FAILED

SYSTEM

NotificationChannel:

EMAIL

SMS

PUSH

NotificationStatus:

PENDING

SENT

FAILED

CANCELLED

\==================================================

DATABASE

\==================================================

Flyway:

V1\_\_init\_notification\_schema.sql

Table:

notifications

Indexes:

user\_id

recipient

type

channel

status

created\_at

\==================================================

DTO

\==================================================

NotificationRequest

NotificationResponse

EmailNotificationRequest

\==================================================

MAPPER

\==================================================

NotificationMapper

Use MapStruct.

\==================================================

REPOSITORY

\==================================================

NotificationRepository

Methods:

findById

findByUserId

findByStatus

findByType

findByChannel

\==================================================

SERVICE

\==================================================

NotificationService

Methods:

createNotification

getNotificationById

getUserNotifications

getPendingNotifications

markAsSent

markAsFailed

deleteNotification

EmailService

Methods:

sendEmail

\==================================================

EMAIL CONFIG

\==================================================

Create EmailConfig.

Use:

JavaMailSender

application.yml placeholders:

spring:

mail:

host: ${MAIL\_HOST:localhost}

port: ${MAIL\_PORT:1025}

username: ${MAIL\_USERNAME:}

password: ${MAIL\_PASSWORD:}

Do not hardcode real email credentials.

Support local development.

\==================================================

CONTROLLER

\==================================================

NotificationController

POST

/api/v1/notifications

GET

/api/v1/notifications/{id}

GET

/api/v1/notifications/user/{userId}

PATCH

/api/v1/notifications/{id}/sent

PATCH

/api/v1/notifications/{id}/failed

DELETE

/api/v1/notifications/{id}

POST

/api/v1/notifications/email

\==================================================

SECURITY

\==================================================

Eureka disabled.

JWT-ready.

Swagger public.

Actuator health public.

\==================================================

RESPONSE

\==================================================

Use:

ApiResponse

\==================================================

EXCEPTION

\==================================================

GlobalExceptionHandler

Handle:

ResourceNotFoundException

NotificationSendException

BadRequestException

\==================================================

TESTS

\==================================================

Basic unit tests.

Do not spend excessive time on external SMTP integration.

\==================================================

VERIFICATION

\==================================================

Run:

mvn clean compile

Fix all compile errors.

At the end report:

file tree

database schema

endpoints

port

compile result

external dependencies

Do not use Docker.

Do not use Eureka.