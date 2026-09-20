# Data Dictionary: Student Performance Dataset v2

## Identifiers / Demographics
| Column Name | Type | Unit | Range / Values | Description |
|---|---|---|---|---|
| `student_id` | String | - | STU0001 - STU5000 | Unique identifier for each student |
| `department` | Categorical | - | CSE, CSE-AIML, CSE-DS, IT, ECE | Department of the student |
| `semester` | Integer | - | 1 - 8 | Current semester |
| `gender` | Categorical | - | Male, Female, Other | Gender |
| `hostel_or_dayscholar` | Categorical | - | Hostel, Day Scholar | Living arrangement |

## Categorical / Behavioral
| Column Name | Type | Unit | Range / Values | Description |
|---|---|---|---|---|
| `study_time_preference` | Categorical | - | Morning, Afternoon, Night | Preferred time of day for studying |
| `learning_style` | Categorical | - | Visual, Auditory, Kinesthetic | Primary learning style |
| `sleep_quality` | Categorical | - | Poor, Average, Good | Self-reported sleep quality |
| `stress_level` | Categorical | - | Low, Medium, High | Self-reported stress level |
| `internet_access_quality` | Categorical | - | Poor, Average, Good | Quality of home internet connection |
| `part_time_job` | Categorical | - | Yes, No | Whether the student works a part-time job |
| `mentor_support` | Categorical | - | Yes, No | Access to a dedicated mentor |
| `placement_status` | Categorical | - | Not Started, In Progress, Placed | Placement status (heavily correlates with semester 7-8) |

## Time Features
| Column Name | Type | Unit | Range / Values | Description |
|---|---|---|---|---|
| `study_minutes_per_day` | Integer | Minutes | 0 - 600 | Daily self-study time |
| `material_prep_minutes_per_week` | Integer | Minutes | 0 - 1200 | Time spent preparing learning materials weekly |
| `extracurricular_minutes_per_week` | Integer | Minutes | 0 - 1200 | Time spent on extracurriculars weekly |
| `skill_dev_minutes_per_week` | Integer | Minutes | 0 - 1500 | Time spent on skill development weekly |

## Academic Records
| Column Name | Type | Unit | Range / Values | Description |
|---|---|---|---|---|
| `attendance_percentage` | Float | Percentage | 0.0 - 100.0 | Overall attendance percentage |
| `previous_year_score` | Float | Percentage | 0.0 - 100.0 | Overall score in the previous academic year |
| `previous_semester_gpa` | Float | GPA | 0.0 - 10.0 | GPA of the immediate previous semester |
| `backlogs_count` | Integer | Count | 0 - 10 | Number of current academic backlogs |
| `internal_marks` | Integer | Marks | 0 - 50 | Total internal assessment marks |

## Extracurricular & Skills
| Column Name | Type | Unit | Range / Values | Description |
|---|---|---|---|---|
| `projects_completed` | Integer | Count | 0 - 20 | Number of significant projects completed |
| `hackathons_participated` | Integer | Count | 0 - 10 | Number of hackathons participated in |
| `internships_completed` | Integer | Count | 0 - 5 | Number of internships completed |
| `certifications_count` | Integer | Count | 0 - 10 | Number of extra certifications obtained |
| `coding_problems_solved` | Integer | Count | 0 - 2000 | Number of competitive programming problems solved |
| `coding_platform_rating` | Integer | Elo | 500 - 3000 | Rating on platforms like LeetCode/Codeforces |

## Computed Targets
| Column Name | Type | Unit | Range / Values | Description |
|---|---|---|---|---|
| `productivity_index` | Float | Index | 0.0 - 100.0 | Computed index representing overall productivity |
| `final_score` | Float | Percentage | 0.0 - 100.0 | Computed final academic score |
| `performance_category` | Categorical | - | Low, Average, Good, Excellent | Binned category of `final_score` |

---

## Target Formulas

### 1. Productivity Index
Base = 50.0
+ (study_minutes_per_day / 60) * 3
+ (skill_dev_minutes_per_week / 60) * 1.5
+ (projects_completed * 2)
+ (coding_problems_solved / 100)
- (10 if stress_level == 'High' else 5 if stress_level == 'Medium' else 0)
- (10 if sleep_quality == 'Poor' else 0)
+ (5 if sleep_quality == 'Good' else 0)
+ (5 if mentor_support == 'Yes' else 0)
- (10 if internet_access_quality == 'Poor' else 0)
*Result is clipped between 0 and 100. A small random noise (Gaussian, std=3) is added.*

### 2. Final Score
Base = 20.0
+ (previous_semester_gpa * 3)
+ (attendance_percentage * 0.2)
+ (internal_marks * 0.4)
+ (productivity_index * 0.1)
- (backlogs_count * 2)
- (3 if part_time_job == 'Yes' else 0)
+ (2 if learning_style == 'Kinesthetic' and projects_completed >= 2 else 0)
*Result is clipped between 0 and 100. A small random noise (Gaussian, std=2) is added.*

`performance_category` is then assigned:
- `< 50` -> Low
- `50 - 70` -> Average
- `70 - 85` -> Good
- `>= 85` -> Excellent
