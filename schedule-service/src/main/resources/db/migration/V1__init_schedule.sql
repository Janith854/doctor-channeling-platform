-- =============================================
-- Schedule Service - Initial Schema
-- =============================================

CREATE TABLE IF NOT EXISTS schedules (
    id              BIGSERIAL       PRIMARY KEY,
    doctor_id       BIGINT          NOT NULL,
    schedule_date   DATE            NOT NULL,
    start_time      TIME            NOT NULL,
    end_time        TIME            NOT NULL,
    max_patients    INT             NOT NULL DEFAULT 20,
    location        VARCHAR(255),
    status          VARCHAR(20)     NOT NULL DEFAULT 'ACTIVE',
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    UNIQUE(doctor_id, schedule_date, start_time)
);

CREATE TABLE IF NOT EXISTS time_slots (
    id              BIGSERIAL       PRIMARY KEY,
    schedule_id     BIGINT          NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
    slot_number     INT             NOT NULL,
    start_time      TIME            NOT NULL,
    end_time        TIME            NOT NULL,
    status          VARCHAR(20)     NOT NULL DEFAULT 'AVAILABLE',
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP       NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_schedules_doctor ON schedules(doctor_id);
CREATE INDEX idx_schedules_date ON schedules(schedule_date);
CREATE INDEX idx_schedules_status ON schedules(status);
CREATE INDEX idx_time_slots_schedule ON time_slots(schedule_id);
CREATE INDEX idx_time_slots_status ON time_slots(status);
