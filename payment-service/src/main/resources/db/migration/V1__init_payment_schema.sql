-- =============================================
-- Payment Service - Initial Schema (UUID based)
-- =============================================

-- Enable pgcrypto for gen_random_uuid() if not already available
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS payments (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id      UUID            NOT NULL,
    patient_id          UUID            NOT NULL,
    amount              DECIMAL(10,2)   NOT NULL,
    currency            VARCHAR(10)     NOT NULL DEFAULT 'USD',
    payment_method      VARCHAR(30)     NOT NULL,
    payment_provider    VARCHAR(30)     NOT NULL DEFAULT 'STRIPE',
    provider_payment_id VARCHAR(255),
    status              VARCHAR(30)     NOT NULL DEFAULT 'PENDING',
    description         VARCHAR(500),
    paid_at             TIMESTAMP,
    failed_at           TIMESTAMP,
    created_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for payments
CREATE INDEX IF NOT EXISTS idx_payments_appointment_id      ON payments(appointment_id);
CREATE INDEX IF NOT EXISTS idx_payments_patient_id          ON payments(patient_id);
CREATE INDEX IF NOT EXISTS idx_payments_provider_payment_id ON payments(provider_payment_id);
CREATE INDEX IF NOT EXISTS idx_payments_status              ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at          ON payments(created_at);
