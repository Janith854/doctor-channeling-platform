-- =============================================
-- Payment Service - Initial Schema
-- =============================================

CREATE TABLE IF NOT EXISTS payments (
    id                  BIGSERIAL       PRIMARY KEY,
    payment_reference   VARCHAR(30)     NOT NULL UNIQUE,
    booking_id          BIGINT          NOT NULL,
    patient_id          BIGINT          NOT NULL,
    amount              DECIMAL(10,2)   NOT NULL,
    currency            VARCHAR(3)      NOT NULL DEFAULT 'LKR',
    payment_method      VARCHAR(30)     NOT NULL,
    status              VARCHAR(20)     NOT NULL DEFAULT 'PENDING',
    paid_at             TIMESTAMP,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP       NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transactions (
    id                      BIGSERIAL       PRIMARY KEY,
    payment_id              BIGINT          NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    transaction_reference   VARCHAR(100),
    gateway_response        TEXT,
    status                  VARCHAR(20)     NOT NULL,
    created_at              TIMESTAMP       NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS refunds (
    id                  BIGSERIAL       PRIMARY KEY,
    payment_id          BIGINT          NOT NULL REFERENCES payments(id),
    refund_reference    VARCHAR(30)     NOT NULL UNIQUE,
    amount              DECIMAL(10,2)   NOT NULL,
    reason              TEXT,
    status              VARCHAR(20)     NOT NULL DEFAULT 'PENDING',
    refunded_at         TIMESTAMP,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP       NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_reference ON payments(payment_reference);
CREATE INDEX idx_payments_booking ON payments(booking_id);
CREATE INDEX idx_payments_patient ON payments(patient_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_transactions_payment ON transactions(payment_id);
CREATE INDEX idx_refunds_payment ON refunds(payment_id);
