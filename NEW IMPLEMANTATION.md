FINAL RUNTIME VERIFICATION — DO NOT BUILD NEW FEATURES

We already have all 6 services compiling successfully.

Now ONLY verify that every service actually starts with:

mvn spring-boot:run

Services:

identity-service 8081 identity\_db

directory-service 8082 directory\_db

schedule-service 8083 schedule\_db

booking-service 8084 appointment\_db

notification-service 8085 notification\_db

payment-service 8086 payment\_db

\==================================================

IMPORTANT

\==================================================

Do NOT redesign services.

Do NOT add new features.

Do NOT introduce Docker.

Do NOT introduce Eureka.

Do NOT introduce Kafka broker.

Do NOT introduce Redis.

Do NOT change ports.

Use local PostgreSQL.

Verify services one-by-one.

\==================================================

STEP 1 — CLEAN PORTS

\==================================================

Check ports:

8081

8082

8083

8084

8085

8086

If 8084 or 8086 are occupied by old instances of the same service,

stop those processes safely.

Do not randomly change ports.

\==================================================

STEP 2 — FIX ONLY KNOWN STARTUP BLOCKERS

\==================================================

A. directory-service

Inspect SecurityConfig.

If no SecurityConfig exists and Spring Security is blocking all requests,

create a minimal LOCAL DEVELOPMENT SecurityConfig.

Permit:

/swagger-ui/\*\*

/v3/api-docs/\*\*

/actuator/health

/api/\*\*

Use stateless security.

Do not implement authentication again in directory-service.

\------------------------------------------

B. booking-service

If spring-kafka exists only as a dependency and no Kafka broker is running,

disable Kafka auto configuration for LOCAL DEVELOPMENT.

Use:

spring.autoconfigure.exclude=\\

org.springframework.boot.autoconfigure.kafka.KafkaAutoConfiguration

Do NOT start Kafka.

Do NOT remove business code.

\------------------------------------------

C. schedule-service

Inspect DoctorScheduleMapper.

Fix isActive/active mapping mismatch.

Use explicit mapping or ignore only if the field is intentionally managed

by the entity/service.

Do not leave incorrect null mapping.

\------------------------------------------

D. identity-service

MapStruct warnings for:

accountNonLocked

emailVerified

authorities

are non-blocking.

Do not break working authentication logic.

Only fix them if it is safe and straightforward.

\==================================================

STEP 3 — START SERVICES

\==================================================

For EACH service:

1\. Enter service directory.

2\. Run:

mvn spring-boot:run

3\. Wait for startup completion.

4\. Confirm:

Started

5\. Confirm:

Tomcat started on correct port

6\. Confirm:

HikariPool - Added connection

7\. Confirm:

Flyway validation successful

8\. Confirm:

Flyway migration successful OR schema up to date

9\. Confirm:

JPA EntityManagerFactory initialized

10\. Confirm:

Spring ApplicationContext started successfully

\==================================================

STEP 4 — HEALTH CHECK

\==================================================

After service starts:

GET:

http://localhost:/actuator/health

Expected:

HTTP 200

{

"status": "UP"

}

\==================================================

STEP 5 — SWAGGER CHECK

\==================================================

Check:

http://localhost:/swagger-ui/index.html

Also:

http://localhost:/v3/api-docs

Swagger loading is PASS.

If Swagger is protected but the application is healthy,

report it separately and do NOT classify startup as failed.

\==================================================

STEP 6 — STOP BEFORE NEXT SERVICE

\==================================================

After successful verification:

Stop the running service cleanly.

Then move to the next service.

Use this order:

1\. identity-service

2\. directory-service

3\. schedule-service

4\. booking-service

5\. notification-service

6\. payment-service

\==================================================

STEP 7 — DATABASE CHECK

\==================================================

Verify every service uses the correct database:

identity-service -> identity\_db

directory-service -> directory\_db

schedule-service -> schedule\_db

booking-service -> appointment\_db

notification-service -> notification\_db

payment-service -> payment\_db

Do NOT create cross-database foreign keys.

\==================================================

STEP 8 — FINAL REPORT

\==================================================

Return exactly:

SERVICE | PORT | DATABASE | COMPILE | TESTS | STARTUP | POSTGRES | FLYWAY | JPA | HEALTH | SWAGGER

Then for each failed service provide:

ROOT CAUSE:

FIX:

COMMAND USED:

FINAL STATUS:

Finally report:

Total services compiled:

Total services tested:

Total services successfully started:

Total services with HEALTH=UP:

Total services with Swagger working:

Do not claim a service is complete unless:

mvn spring-boot:run = SUCCESS

PostgreSQL = SUCCESS

Flyway = SUCCESS

JPA = SUCCESS

Spring context = SUCCESS

Health = UP

Finish the verification for all 6 services.