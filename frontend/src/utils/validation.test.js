import { describe, it, expect } from 'vitest';
import { validateTimeLimit } from './validation';

describe('Time Validation Logic (24-hour limit)', () => {
  it('should return null if total daily active time is under 14 hours', () => {
    const activities = {
      study_time_daily: { hours: 4, minutes: 0 },         // 240 mins daily
      material_prep_weekly: { hours: 7, minutes: 0 },     // 60 mins daily
      extracurricular_weekly: { hours: 14, minutes: 0 },  // 120 mins daily
      skill_dev_weekly: { hours: 7, minutes: 0 }          // 60 mins daily
    };
    // Total = 480 mins = 8 hours
    expect(validateTimeLimit(activities)).toBeNull();
  });

  it('should return an error message if total daily active time exceeds 14 hours', () => {
    const activities = {
      study_time_daily: { hours: 10, minutes: 0 },        // 600 mins daily
      material_prep_weekly: { hours: 14, minutes: 0 },    // 120 mins daily
      extracurricular_weekly: { hours: 7, minutes: 0 },   // 60 mins daily
      skill_dev_weekly: { hours: 14, minutes: 0 }         // 120 mins daily
    };
    // Total = 900 mins = 15 hours
    const result = validateTimeLimit(activities);
    expect(result).toContain('cannot exceed 14 hours');
  });
});
