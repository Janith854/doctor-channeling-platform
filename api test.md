You are working on my Doctor Channeling Platform microservices project.

The following services are already running successfully:

* Identity Service — 8081
* Directory Service — 8082
* Schedule Service — 8083
* Booking Service — 8084
* Payment Service — 8085
* Notification Service — 8086
* Frontend — 3000

Already verified successfully:

1. User Registration
2. User Login
3. Doctor retrieval/search
4. Hospital retrieval
5. Specialization retrieval
6. Doctor schedule creation
7. Doctor schedule database record
8. Appointment creation
9. Appointment ID retrieval
10. Appointment number generation

Example successful appointment:

* Appointment ID: d71dfb2a-6899-44db-9fe0-0335e43cc222
* Appointment Number: APP-20260819-7863
* Status: PENDING
* Doctor ID: f61f29db-67e2-406e-9476-9db770e9905e
* Appointment date: 2026-08-19
* Time: 09:00–09:30

NOW I WANT YOU TO VERIFY THE REST OF THE SYSTEM END-TO-END.

IMPORTANT RULES:

1. Do NOT randomly modify working services.
2. First inspect the existing code, Swagger endpoints, DTOs, controllers, services, repositories, entities, database migrations and frontend API clients.
3. Use the actual endpoint names and request/response structures from my project.
4. Do NOT invent UUIDs.
5. Do NOT use placeholder UUIDs such as `3fa85f64-...` or `YOUR-UUID`.
6. Use real IDs already available in the databases.
7. If an API fails, identify the root cause and fix the code only where necessary.
8. After every fix, run the relevant Maven/Spring Boot service and retest the endpoint.
9. Do not break previously working functionality.
10. Verify both API behavior and database persistence.
11. Check frontend API integration where applicable.
12. At the end, give me a clear PASS/FAIL report for every service and endpoint.

==================================================
PHASE 1 — PAYMENT SERVICE
=========================

Inspect Payment Service on port 8085.

Open/check:

http://localhost:8085/swagger-ui/index.html

Identify all payment-related endpoints.

Verify at minimum:

* Create payment
* Get payment by ID
* Get payment by appointment
* Payment status
* Payment success flow
* Payment failure handling
* Payment cancellation/refund if implemented

Use the existing appointment:

Appointment ID:
d71dfb2a-6899-44db-9fe0-0335e43cc222

Appointment Number:
APP-20260819-7863

Do NOT create fake appointment IDs.

Check Payment Service database and verify that payment records are persisted.

If payment requires an amount, currency, provider or transaction reference, inspect the actual DTO and use the values required by the implementation.

If Stripe, PayHere, or another payment provider is configured, determine whether the project currently uses real integration, mock/test mode, or a local simulation.

Do not expose or print secret API keys.

==================================================
PHASE 2 — NOTIFICATION SERVICE
==============================

Inspect Notification Service on port 8086.

Open/check:

http://localhost:8086/swagger-ui/index.html

Identify all notification endpoints.

Verify:

* Create/send notification
* Get notification
* Notification status
* Email notification if implemented
* Appointment confirmation notification if implemented
* Payment notification if implemented

Use the real appointment ID:

d71dfb2a-6899-44db-9fe0-0335e43cc222

Check the Notification database and verify persistence.

If external email/Firebase integration is not configured, verify the local/mock implementation instead of inventing credentials.

==================================================
PHASE 3 — COMPLETE BOOKING API VERIFICATION
===========================================

Re-check Booking Service on port 8084.

Verify all available endpoints from Swagger.

At minimum:

* Create appointment
* Get appointment by ID
* Get appointments
* Update appointment if implemented
* Cancel appointment if implemented
* Appointment status
* Any available-slot endpoint

Use the real appointment:

d71dfb2a-6899-44db-9fe0-0335e43cc222

Verify database persistence.

==================================================
PHASE 4 — COMPLETE SCHEDULE API VERIFICATION
============================================

Re-check Schedule Service on port 8083.

Verify all available endpoints.

At minimum:

* Create schedule
* Get schedule
* Get schedules by doctor
* Get schedules by hospital
* Update schedule if implemented
* Delete/deactivate schedule if implemented
* Available slots if implemented

Use the existing real doctor and hospital IDs.

Doctor:
f61f29db-67e2-406e-9476-9db770e9905e

Do not create duplicate schedules unnecessarily.

==================================================
PHASE 5 — COMPLETE DIRECTORY API VERIFICATION
=============================================

Verify Directory Service on port 8082.

Test all implemented endpoints for:

Doctors
Hospitals
Specializations
Doctor-Hospital Affiliations

Verify:

* GET all
* GET by ID
* POST
* PUT
* DELETE

Only create test records if necessary.

Do not delete existing valid records.

Verify database persistence.

==================================================
PHASE 6 — COMPLETE IDENTITY API VERIFICATION
============================================

Verify Identity Service on port 8081.

Already verified:

* Register
* Login

Now check all other implemented endpoints.

Verify:

* Get current user/profile
* Refresh token
* Logout
* Role endpoints
* User endpoints
* Authentication validation
* Unauthorized request behavior
* Invalid credentials behavior

Use the existing test account where appropriate.

Do not expose JWT tokens in the final report.

==================================================
PHASE 7 — DATABASE VERIFICATION
===============================

Inspect every PostgreSQL database used by the project.

Verify:

* Tables exist
* Flyway migrations completed
* Records are persisted
* Foreign keys are valid
* UUID relationships are correct
* No unexpected duplicate records
* No failed migrations

Do not delete production/test data unless explicitly required.

==================================================
PHASE 8 — FRONTEND API VERIFICATION
===================================

Inspect the React frontend.

Verify the complete flow:

Login
→ Doctor Search
→ Doctor Details
→ Hospital
→ Schedule
→ Available Slot
→ Booking
→ Payment
→ Booking Confirmation
→ Notification

Check:

* API base URLs
* Axios clients
* Authorization headers
* JWT handling
* Error handling
* Loading states
* Response parsing
* Role-based routes
* Protected routes

Use browser Network/F12 information where useful.

If an API works in Swagger but fails in the frontend, identify the mismatch and fix the frontend API client or component.

==================================================
PHASE 9 — BUILD VERIFICATION
============================

For every Spring Boot service:

Run the appropriate Maven build/test command.

Verify:

BUILD SUCCESS

Do not leave compilation errors.

For the frontend:

Run the appropriate production build command, such as:

npm run build

Verify that the frontend production build succeeds.

==================================================
PHASE 10 — FINAL END-TO-END TEST
================================

Perform this complete flow using real project data:

1. Login
2. Search doctors
3. Select doctor
4. Select hospital
5. View schedule
6. Select available slot
7. Create appointment
8. Verify appointment
9. Create/process payment
10. Verify payment status
11. Trigger/check notification
12. Verify final appointment status
13. Verify all related database records

Do not stop at the first successful API.

==================================================
FINAL REPORT
============

At the end, provide a table:

Service | Port | API | Result | Database | Frontend | Status

Use:

PASS
FAIL
NOT IMPLEMENTED
BLOCKED

For every FAIL, provide:

* Endpoint
* HTTP status
* Actual error
* Root cause
* File that needs fixing
* Fix applied
* Retest result

For every NOT IMPLEMENTED, clearly state that the endpoint/functionality does not exist instead of pretending it works.

Finally provide:

1. All working services
2. All working APIs
3. Remaining failures
4. Remaining missing features
5. Exact next steps required before production deployment

Do not claim an API is verified unless it was actually tested successfully.
