package com.docplatform.schedule.entity;

/**
 * Represents the day of the week for a doctor's schedule.
 * Named ScheduleDayOfWeek internally to avoid conflict with java.time.DayOfWeek,
 * but exposed as DayOfWeek in the API.
 */
public enum DayOfWeek {
    MONDAY,
    TUESDAY,
    WEDNESDAY,
    THURSDAY,
    FRIDAY,
    SATURDAY,
    SUNDAY
}
