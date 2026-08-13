-- =============================================
-- Directory Service - Initial Schema (UUID based)
-- =============================================

CREATE TABLE IF NOT EXISTS specializations (
    id          UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(100)    NOT NULL UNIQUE,
    created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS hospitals (
    id          UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(255)    NOT NULL,
    address     VARCHAR(500),
    city        VARCHAR(100),
    type        VARCHAR(50),
    geo_lat     DOUBLE PRECISION,
    geo_lng     DOUBLE PRECISION,
    created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS doctors (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID            NOT NULL,
    full_name           VARCHAR(200)    NOT NULL,
    specialization_id   UUID            NOT NULL REFERENCES specializations(id),
    qualifications      VARCHAR(500),
    slmc_number         VARCHAR(100),
    bio                 TEXT,
    created_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS doctor_hospital_affiliations (
    doctor_id   UUID    NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    hospital_id UUID    NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
    PRIMARY KEY (doctor_id, hospital_id)
);

CREATE INDEX idx_doctors_specialization ON doctors(specialization_id);
CREATE INDEX idx_doctors_user_id ON doctors(user_id);
CREATE INDEX idx_hospitals_city ON hospitals(city);
