import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

import { validateTimeLimit } from '../utils/validation';

export default function StudentForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    profile: {
      student_identifier: '', department: 'CSE', semester: 1, gender: 'Male',
      hostel_or_dayscholar: 'Dayscholar', study_time_preference: 'Morning', learning_style: 'Visual',
      sleep_quality: 'Average', stress_level: 'Medium', internet_access_quality: 'Good',
      part_time_job: 'No', mentor_support: 'Yes', placement_status: 'Not Started'
    },
    academics: {
      attendance_percentage: 0, previous_year_score: 0, previous_semester_gpa: 0,
      backlogs_count: 0, internal_marks: 0
    },
    activities: {
      study_time_daily: { hours: 0, minutes: 0 },
      material_prep_weekly: { hours: 0, minutes: 0 },
      extracurricular_weekly: { hours: 0, minutes: 0 },
      skill_dev_weekly: { hours: 0, minutes: 0 },
      projects_completed: 0, hackathons_participated: 0, internships_completed: 0,
      certifications_count: 0, coding_problems_solved: 0, coding_platform_rating: 500
    }
  });

  useEffect(() => {
    // Load existing data if available
    api.get('/students/me')
      .then(res => {
        if (res.data) {
          // Convert flat minutes back to hours/minutes format for UI
          const act = res.data.activities;
          setFormData({
            profile: res.data.profile,
            academics: res.data.academics,
            activities: {
              ...act,
              study_time_daily: { hours: Math.floor(act.study_minutes_per_day / 60), minutes: act.study_minutes_per_day % 60 },
              material_prep_weekly: { hours: Math.floor(act.material_prep_minutes_per_week / 60), minutes: act.material_prep_minutes_per_week % 60 },
              extracurricular_weekly: { hours: Math.floor(act.extracurricular_minutes_per_week / 60), minutes: act.extracurricular_minutes_per_week % 60 },
              skill_dev_weekly: { hours: Math.floor(act.skill_dev_minutes_per_week / 60), minutes: act.skill_dev_minutes_per_week % 60 }
            }
          });
        }
      })
      .catch(err => {
        if (err.response?.status !== 404) {
          console.error("Failed to fetch profile", err);
        }
      });
  }, []);

  const handleChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleTimeChange = (field, unit, value) => {
    setFormData(prev => ({
      ...prev,
      activities: {
        ...prev.activities,
        [field]: {
          ...prev.activities[field],
          [unit]: parseInt(value) || 0
        }
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (step < 3) {
      setStep(step + 1);
      return;
    }

    const timeError = validateTimeLimit(formData.activities);
    if (timeError) {
      setError(timeError);
      return;
    }

    setLoading(true);
    try {
      await api.put('/students/me', formData);
      navigate('/result'); // To be implemented in next phase
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to save profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Assessment" subtitle="Student Profile Assessment">
      <div className="max-w-3xl mx-auto py-10 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Student Profile Assessment (Step {step} of 3)</CardTitle>
            <div className="flex gap-2 mt-4">
              <div className={`h-2 flex-1 rounded ${step >= 1 ? 'bg-primary-600' : 'bg-border-default'}`} />
              <div className={`h-2 flex-1 rounded ${step >= 2 ? 'bg-primary-600' : 'bg-border-default'}`} />
              <div className={`h-2 flex-1 rounded ${step >= 3 ? 'bg-primary-600' : 'bg-border-default'}`} />
            </div>
          </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {step === 1 && (
              <div className="space-y-4">
                <h4 className="font-semibold text-text-main border-b pb-2">Demographics & Preferences</h4>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Student Identifier" value={formData.profile.student_identifier} onChange={e => handleChange('profile', 'student_identifier', e.target.value)} required />
                  <Select label="Semester" value={formData.profile.semester} onChange={e => handleChange('profile', 'semester', parseInt(e.target.value))} options={[1,2,3,4,5,6,7,8]} required />
                  <Select label="Department" value={formData.profile.department} onChange={e => handleChange('profile', 'department', e.target.value)} options={['CSE', 'ECE', 'ME', 'CE', 'EE']} required />
                  <Select label="Gender" value={formData.profile.gender} onChange={e => handleChange('profile', 'gender', e.target.value)} options={['Male', 'Female', 'Other']} required />
                  <Select label="Accommodation" value={formData.profile.hostel_or_dayscholar} onChange={e => handleChange('profile', 'hostel_or_dayscholar', e.target.value)} options={['Hostel', 'Dayscholar']} required />
                  <Select label="Study Time Preference" value={formData.profile.study_time_preference} onChange={e => handleChange('profile', 'study_time_preference', e.target.value)} options={['Morning', 'Night', 'Anytime']} required />
                  <Select label="Sleep Quality" value={formData.profile.sleep_quality} onChange={e => handleChange('profile', 'sleep_quality', e.target.value)} options={['Poor', 'Average', 'Good']} required />
                  <Select label="Stress Level" value={formData.profile.stress_level} onChange={e => handleChange('profile', 'stress_level', e.target.value)} options={['Low', 'Medium', 'High']} required />
                  <Select label="Learning Style" value={formData.profile.learning_style} onChange={e => handleChange('profile', 'learning_style', e.target.value)} options={['Visual', 'Auditory', 'Kinesthetic']} required />
                  <Select label="Internet Quality" value={formData.profile.internet_access_quality} onChange={e => handleChange('profile', 'internet_access_quality', e.target.value)} options={['Poor', 'Average', 'Good']} required />
                  <Select label="Part Time Job" value={formData.profile.part_time_job} onChange={e => handleChange('profile', 'part_time_job', e.target.value)} options={['Yes', 'No']} required />
                  <Select label="Placement Status" value={formData.profile.placement_status} onChange={e => handleChange('profile', 'placement_status', e.target.value)} options={['Placed', 'Not Started', 'Looking']} required />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h4 className="font-semibold text-text-main border-b pb-2">Academic Records</h4>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Attendance (%)" type="number" step="0.1" min="0" max="100" value={formData.academics.attendance_percentage} onChange={e => handleChange('academics', 'attendance_percentage', parseFloat(e.target.value))} required />
                  <Input label="Previous Year Score (%)" type="number" step="0.1" min="0" max="100" value={formData.academics.previous_year_score} onChange={e => handleChange('academics', 'previous_year_score', parseFloat(e.target.value))} required />
                  <Input label="Previous Semester GPA" type="number" step="0.1" min="0" max="10" value={formData.academics.previous_semester_gpa} onChange={e => handleChange('academics', 'previous_semester_gpa', parseFloat(e.target.value))} required />
                  <Input label="Internal Marks (Out of 50)" type="number" min="0" max="50" value={formData.academics.internal_marks} onChange={e => handleChange('academics', 'internal_marks', parseInt(e.target.value))} required />
                  <Input label="Backlogs Count" type="number" min="0" max="20" value={formData.academics.backlogs_count} onChange={e => handleChange('academics', 'backlogs_count', parseInt(e.target.value))} required />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h4 className="font-semibold text-text-main border-b pb-2">Extracurriculars & Time Management</h4>
                
                {error && <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>}

                <div className="space-y-4">
                  {[
                    { label: "Study Time (Daily)", key: "study_time_daily" },
                    { label: "Material Prep (Weekly)", key: "material_prep_weekly" },
                    { label: "Extracurriculars (Weekly)", key: "extracurricular_weekly" },
                    { label: "Skill Dev (Weekly)", key: "skill_dev_weekly" },
                  ].map(item => (
                    <div key={item.key} className="flex gap-4 items-end">
                      <div className="w-1/3 text-sm font-medium text-text-main pb-2">{item.label}</div>
                      <Input label="Hours" type="number" min="0" value={formData.activities[item.key].hours} onChange={e => handleTimeChange(item.key, 'hours', e.target.value)} required />
                      <Input label="Minutes" type="number" min="0" max="59" value={formData.activities[item.key].minutes} onChange={e => handleTimeChange(item.key, 'minutes', e.target.value)} required />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <Input label="Projects Completed" type="number" min="0" value={formData.activities.projects_completed} onChange={e => handleChange('activities', 'projects_completed', parseInt(e.target.value))} required />
                  <Input label="Hackathons Participated" type="number" min="0" value={formData.activities.hackathons_participated} onChange={e => handleChange('activities', 'hackathons_participated', parseInt(e.target.value))} required />
                  <Input label="Internships Completed" type="number" min="0" value={formData.activities.internships_completed} onChange={e => handleChange('activities', 'internships_completed', parseInt(e.target.value))} required />
                  <Input label="Certifications Count" type="number" min="0" value={formData.activities.certifications_count} onChange={e => handleChange('activities', 'certifications_count', parseInt(e.target.value))} required />
                  <Input label="Coding Problems Solved" type="number" min="0" value={formData.activities.coding_problems_solved} onChange={e => handleChange('activities', 'coding_problems_solved', parseInt(e.target.value))} required />
                  <Input label="Coding Platform Rating" type="number" min="0" value={formData.activities.coding_platform_rating} onChange={e => handleChange('activities', 'coding_platform_rating', parseInt(e.target.value))} required />
                </div>
              </div>
            )}

            <div className="flex justify-between pt-6">
              {step > 1 && (
                <Button type="button" variant="secondary" onClick={() => { setStep(step - 1); setError(null); }}>
                  Back
                </Button>
              )}
              <Button type="submit" disabled={loading} className="ml-auto">
                {step < 3 ? 'Next' : (loading ? 'Saving...' : 'Predict My Score')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
    </Layout>
  );
}
