-- =============================================
-- Notification Service - Initial Schema (UUID based)
-- =============================================

-- Enable pgcrypto for gen_random_uuid() if not already available
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS notifications (
    id          UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID,
    recipient   VARCHAR(255)    NOT NULL,
    subject     VARCHAR(255),
    message     TEXT            NOT NULL,
    type        VARCHAR(50)     NOT NULL,
    channel     VARCHAR(20)     NOT NULL,
    status      VARCHAR(20)     NOT NULL DEFAULT 'PENDING',
    sent_at     TIMESTAMP,
    created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id    ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient  ON notifications(recipient);
CREATE INDEX IF NOT EXISTS idx_notifications_type       ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_channel    ON notifications(channel);
CREATE INDEX IF NOT EXISTS idx_notifications_status     ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
