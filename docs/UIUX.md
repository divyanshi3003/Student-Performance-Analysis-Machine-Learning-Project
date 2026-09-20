# UI/UX Document
**Project Name:** EduMetrics ML (Student Performance Analysis)
**Phase:** 5

## 1. User Flows
### Student Flow
1. **Login:** Student logs in with credentials.
2. **Dashboard:** Student arrives at Dashboard. If no previous predictions exist, they are prompted to take their first assessment.
3. **Input Form:** Student fills out their data (Demographics -> Academics -> Activities).
4. **Result:** Form submits -> Loading state -> Prediction Result Page appears.
5. **What-If Simulator:** From the Result page, student clicks "Simulate Improvements" to tweak inputs and instantly see the score change.
6. **History:** Student clicks "History" to view past predictions on a line chart.

### Teacher Flow
1. **Login:** Teacher logs in with credentials.
2. **Dashboard:** Arrives at the Teacher Analytics Dashboard.
3. **Filter/Sort:** Filters the class list by "Department" and sorts by "Predicted Score: Low to High".
4. **Export:** Clicks "Export to CSV" to download the at-risk students list.

## 2. Sitemap
- `/login` - Authentication.
- `/student`
  - `/student/dashboard` - Main overview (charts, history).
  - `/student/predict` - Multi-step input form.
  - `/student/result` - Prediction output.
  - `/student/simulate` - What-If Simulator.
- `/teacher`
  - `/teacher/dashboard` - Class analytics overview.
  - `/teacher/students` - Data table of all students.

## 3. Wireframe Descriptions
### Screen 1: Login
- **Layout:** Centered card on a light gray background.
- **Components:** Logo, Email input, Password input, "Login" button.
- **Action:** Validates credentials via API.

### Screen 2: Student Input Form (Critical Feature)
- **Layout:** Stepper layout (e.g., Step 1 of 3: Academics).
- **Time Inputs:** **MUST** be separated into two distinct dropdowns or number fields side-by-side: `[ Hours ]` and `[ Minutes ]`. Under no circumstances should users enter decimals. Total hours validation logic prevents >24 hours per day.
- **Categorical Inputs:** Styled Select dropdowns (e.g., Sleep Quality: Poor, Average, Good).
- **Actions:** "Next", "Back", "Predict Score".

### Screen 3: Prediction Result
- **Layout:** Hero section displaying the final Score (e.g., `82%`) and Category badge (`Good` in a green pill).
- **Components:** 
  - A dial or gauge chart for the score.
  - A "Top Drivers" list showing what positively/negatively affected the score (derived from feature importance).
- **Actions:** "Go to Simulator", "Return to Dashboard".

### Screen 4: Student Dashboard (Analytics & History)
- **Layout:** Grid layout of cards.
- **Components:** 
  - Line chart showing predicted scores over time.
  - Quick stat cards (e.g., Average Study Hours vs. Class Average).

### Screen 5: What-If Simulator
- **Layout:** Split screen. Left side: Sliders and dropdowns for current inputs. Right side: Live updated Score and Category.
- **Interaction:** Dragging a slider (e.g., Study Hours from 2 to 4) triggers a quick API call and animates the score changing on the right.

### Screen 6: Teacher/Admin Dashboard
- **Layout:** Top bar with aggregated metrics (Total Students, At-Risk Count). Main body is a complex Data Table.
- **Components:** Search bar, Filter dropdowns (Semester, Department), Paginated table.
- **Actions:** Click row for student details, click "Export CSV".

## 4. Design System
- **Colors:**
  - `Primary:` Indigo-600 (`#4f46e5`) - Buttons, active links.
  - `Success:` Emerald-500 (`#10b981`) - "Excellent"/"Good" badges, positive trends.
  - `Warning:` Amber-500 (`#f59e0b`) - "Average" badges.
  - `Danger:` Red-500 (`#ef4444`) - "Low" badges, errors.
  - `Background:` Gray-50 (`#f9fafb`).
  - `Text:` Gray-900 (Headings) and Gray-500 (Body).
- **Typography:** Inter or Roboto. Tailwind default sans-serif.
  - H1: 24px, Bold.
  - Body: 14px/16px, Regular.
- **Spacing:** standard Tailwind spacing scale (`p-4`, `m-2`, `gap-4`).
- **Components:** Use clean, flat UI with subtle shadows (`shadow-sm`, `rounded-lg`).

## 5. Accessibility (a11y)
- All form inputs must have associated `<label>` elements.
- Ensure minimum contrast ratio of 4.5:1 for text against backgrounds.
- Provide clear focus states (`focus:ring-2 focus:ring-indigo-500`) for keyboard navigation.

## 6. Responsive Behavior
- **Mobile (< 768px):** Navigation collapses into a hamburger menu. Data tables convert to card lists or allow horizontal scrolling. Grid layouts stack into a single column.
- **Tablet (768px - 1024px):** 2-column grids.
- **Desktop (> 1024px):** Multi-column grids, sidebar navigation visible.

## 7. Empty, Loading, and Error States
- **Empty State:** E.g., Dashboard with no predictions shows an illustration and a prominent "Take your first assessment" CTA.
- **Loading State:** Skeleton loaders for charts and tables; spinning indicator inside buttons on form submit.
- **Error State:** Red toast notifications for API failures. Inline red text below input fields for validation errors (e.g., "Total time exceeds 24 hours").
