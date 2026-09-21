export const validateTimeLimit = (activities) => {
  const studyMins = (activities.study_time_daily.hours * 60) + activities.study_time_daily.minutes;
  const matMins = ((activities.material_prep_weekly.hours * 60) + activities.material_prep_weekly.minutes) / 7;
  const extMins = ((activities.extracurricular_weekly.hours * 60) + activities.extracurricular_weekly.minutes) / 7;
  const skillMins = ((activities.skill_dev_weekly.hours * 60) + activities.skill_dev_weekly.minutes) / 7;
  
  const totalDailyMins = studyMins + matMins + extMins + skillMins;
  if (totalDailyMins > 840) {
    return `Total active daily hours cannot exceed 14 hours. Currently at ${(totalDailyMins / 60).toFixed(1)} hours. Please reduce your time inputs.`;
  }
  return null;
};
