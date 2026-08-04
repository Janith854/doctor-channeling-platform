-- =============================================
-- Booking Service - Initial Schema
-- =============================================

CREATE TABLE IF NOT EXISTS bookings (
    id                  BIGSERIAL       PRIMARY KEY,
    booking_reference   VARCHAR(20)     NOT NULL UNIQUE,
    patient_id          BIGINT          NOT NULL,
    doctor_id           BIGINT          NOT NULL,
    schedule_id         BIGINT          NOT NULL,
    time_slot_id        BIGINT          NOT NULL,
    appointment_date    DATE            NOT NULL,
    appointment_time    TIME            NOT NULL,
    patient_name        VARCHAR(200)    NOT NULL,
    patient_phone       VARCHAR(20),
    patient_email       VARCHAR(255),
    reason              TEXT,
    status              VARCHAR(20)     NOT NULL DEFAULT 'PENDING',
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP       NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS booking_history (
    id              BIGSERIAL       PRIMARY KEY,
    booking_id      BIGINT          NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    previous_status VARCHAR(20)     NOT NULL,
    new_status      VARCHAR(20)     NOT NULL,
    changed_by      BIGINT,
    remarks         TEXT,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_bookings_reference ON bookings(booking_reference);
CREATE INDEX idx_bookings_patient ON bookings(patient_id);
CREATE INDEX idx_bookings_doctor ON bookings(doctor_id);
CREATE INDEX idx_bookings_date ON bookings(appointment_date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_booking_history_booking ON booking_history(booking_id);
