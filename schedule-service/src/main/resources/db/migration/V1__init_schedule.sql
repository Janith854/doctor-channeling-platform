-- =============================================
-- Schedule Service - Initial Schema (UUID based)
-- =============================================

-- Enable pgcrypto for gen_random_uuid() if not already available
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS doctor_schedules (
    id                      UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id               UUID            NOT NULL,
    hospital_id             UUID            NOT NULL,
    day_of_week             VARCHAR(10)     NOT NULL,
    start_time              TIME            NOT NULL,
    end_time                TIME            NOT NULL,
    slot_duration_minutes   INT             NOT NULL DEFAULT 20,
    is_active               BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at              TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_doctor_hospital_day UNIQUE (doctor_id, hospital_id, day_of_week)
);

CREATE TABLE IF NOT EXISTS appointment_slots (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id UUID        NOT NULL REFERENCES doctor_schedules(id) ON DELETE CASCADE,
    doctor_id   UUID        NOT NULL,
    slot_date   DATE        NOT NULL,
    start_time  TIME        NOT NULL,
    end_time    TIME        NOT NULL,
    status      VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
    created_at  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_slot_doctor_date_start UNIQUE (doctor_id, slot_date, start_time)
);

-- Indexes for doctor_schedules
CREATE INDEX IF NOT EXISTS idx_ds_doctor_id     ON doctor_schedules(doctor_id);
CREATE INDEX IF NOT EXISTS idx_ds_hospital_id   ON doctor_schedules(hospital_id);
CREATE INDEX IF NOT EXISTS idx_ds_day_of_week   ON doctor_schedules(day_of_week);
CREATE INDEX IF NOT EXISTS idx_ds_is_active     ON doctor_schedules(is_active);

-- Indexes for appointment_slots
CREATE INDEX IF NOT EXISTS idx_as_schedule_id   ON appointment_slots(schedule_id);
CREATE INDEX IF NOT EXISTS idx_as_doctor_id     ON appointment_slots(doctor_id);
CREATE INDEX IF NOT EXISTS idx_as_slot_date     ON appointment_slots(slot_date);
CREATE INDEX IF NOT EXISTS idx_as_status        ON appointment_slots(status);
