\# Payment Service - Complete Build Prompt

Act as a Senior Spring Boot Microservices Architect.

Existing services:

\- identity-service

\- directory-service

\- schedule-service

\- appointment-service

\- notification-service

Build Payment Service completely.

IMPORTANT:

\- No Docker now.

\- No Eureka now.

\- Local PostgreSQL.

\- Use environment variables for payment secrets.

\- Do not store card numbers or CVV.

\- Build complete production structure.

\- Compile at the end.

\- Tests can be expanded later.

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

Payment provider:

Stripe

\==================================================

SERVICE

\==================================================

Name:

payment-service

Port:

8086

Database:

payment\_db

Database:

localhost:5432

postgres

1234

\==================================================

DOMAIN

\==================================================

Payment entity.

Fields:

id UUID

appointmentId UUID

patientId UUID

amount BigDecimal

currency

paymentMethod

paymentProvider

providerPaymentId

status

description

paidAt

failedAt

createdAt

updatedAt

\==================================================

ENUM

\==================================================

PaymentStatus:

PENDING

PROCESSING

SUCCESS

FAILED

REFUNDED

CANCELLED

PaymentMethod:

CARD

ONLINE

PaymentProvider:

STRIPE

\==================================================

DATABASE

\==================================================

Flyway:

V1\_\_init\_payment\_schema.sql

Table:

payments

Indexes:

appointment\_id

patient\_id

provider\_payment\_id

status

created\_at

Do not store:

card number

CVV

full payment credentials

\==================================================

DTO

\==================================================

PaymentRequest

PaymentResponse

RefundRequest

PaymentIntentResponse

\==================================================

MAPPER

\==================================================

PaymentMapper

MapStruct.

\==================================================

REPOSITORY

\==================================================

PaymentRepository

Methods:

findById

findByAppointmentId

findByPatientId

findByProviderPaymentId

findByStatus

\==================================================

SERVICE

\==================================================

PaymentService

Methods:

createPayment

getPaymentById

getPaymentByAppointment

getPatientPayments

confirmPayment

markPaymentFailed

refundPayment

cancelPayment

StripePaymentService

Methods:

createPaymentIntent

confirmPayment

refundPayment

\==================================================

STRIPE CONFIG

\==================================================

Use environment variables:

STRIPE\_SECRET\_KEY

STRIPE\_PUBLISHABLE\_KEY

STRIPE\_WEBHOOK\_SECRET

Never hardcode secrets.

application.yml:

stripe:

secret-key: ${STRIPE\_SECRET\_KEY:}

publishable-key: ${STRIPE\_PUBLISHABLE\_KEY:}

webhook-secret: ${STRIPE\_WEBHOOK\_SECRET:}

\==================================================

PAYMENT FLOW

\==================================================

Create Payment:

1\. Receive appointmentId

2\. Receive patientId

3\. Validate amount

4\. Create local payment record

5\. Status = PENDING

6\. Create Stripe PaymentIntent

7\. Store Stripe PaymentIntent ID

8\. Return client secret / payment information

Successful payment:

PENDING

↓

PROCESSING

↓

SUCCESS

Failed:

PROCESSING

↓

FAILED

Refund:

SUCCESS

↓

REFUNDED

\==================================================

WEBHOOK

\==================================================

Create:

POST

/api/v1/payments/webhook/stripe

Validate Stripe webhook signature.

Update payment state safely.

Make webhook handling idempotent.

\==================================================

CONTROLLER

\==================================================

PaymentController

POST

/api/v1/payments

GET

/api/v1/payments/{id}

GET

/api/v1/payments/appointment/{appointmentId}

GET

/api/v1/payments/patient/{patientId}

POST

/api/v1/payments/{id}/refund

POST

/api/v1/payments/{id}/cancel

POST

/api/v1/payments/webhook/stripe

\==================================================

SECURITY

\==================================================

Eureka disabled.

JWT-ready.

Swagger available.

Actuator health available.

Webhook endpoint must be configured appropriately.

\==================================================

EXCEPTION

\==================================================

GlobalExceptionHandler

Handle:

ResourceNotFoundException

PaymentProcessingException

InvalidPaymentStateException

RefundException

WebhookValidationException

BadRequestException

\==================================================

TESTS

\==================================================

Create basic unit tests for:

PaymentService

StripePaymentService

Webhook handling

Mock Stripe API.

Do not make real Stripe calls in unit tests.

\==================================================

VERIFICATION

\==================================================

Run:

mvn clean compile

Fix compile errors.

Do not require real Stripe credentials for compilation.

At end provide:

\- file tree

\- DB schema

\- APIs

\- environment variables

\- payment flow

\- compile result

Do not use Docker.

Do not use Eureka.

Do not hardcode secrets.