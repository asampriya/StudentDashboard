# 📊 EduAnalytics — Student Performance Intelligence Dashboard

<div align="center">

![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts-2.x-22B5BF?style=for-the-badge)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![LocalStorage](https://img.shields.io/badge/Storage-LocalStorage-FF6B6B?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**A full-stack React web application for managing, tracking, and analyzing student academic performance — built with role-based access control, period-wise attendance tracking, and ML-inspired GPA prediction.**


</div>

---

## 📌 Table of Contents

- [About the Project](#-about-the-project)
- [Features](#-features)
- [Role-Based Access](#-role-based-access-control)
- [Tech Stack](#-tech-stack)
- [Installation](#️-installation)
- [Demo Credentials](#-demo-credentials)
- [Project Structure](#-project-structure)
- [How It Works](#-how-it-works)
- [Future Enhancements](#-future-enhancements)
- [Author](#-author)

---

## 🧠 About the Project

**EduAnalytics** is a comprehensive student performance management system designed for educational institutions. It provides real-time academic insights for administrators, teachers, and students through a clean, modern dashboard interface.

The platform supports **three distinct user roles**, each with a tailored experience:

- 🔴 **Admin** — Full system control: manage teachers, students, and view institution-wide analytics
- 🔵 **Teacher** — Mark period-wise attendance, edit student scores, and monitor their assigned class
- 🟣 **Student** — View personal performance, subject-wise scores, class ranking, and detailed attendance logs

This project was built as a **portfolio project** to demonstrate skills in React, data visualization, state management, and role-based application architecture.

---

## ✨ Features

### 🔐 Authentication & Role-Based Access
- Separate **Staff Login** and **Student Login** on the same login page
- Staff login supports both **Admin** and **Teacher** accounts
- Student login via **Roll Number** and password
- Secure role detection — each user sees only what they are authorized to view
- Session managed in React state; logout clears access instantly

---

### 👑 Admin Portal
| Feature | Description |
|---|---|
| 📊 Overview Dashboard | Institution-wide GPA trends, subject averages, scatter plots, and at-risk student tracking |
| 🎓 Student Management | Add, edit, and delete students with full form validation |
| 👩‍🏫 Teacher Management | Add, edit, and remove teachers; assign each teacher to a class |
| 📋 Class Assignment | Each teacher is assigned to exactly one class section |
| 🗑️ Safe Deletion | Confirmation dialogs prevent accidental deletion; empty states prevent app crashes |
| 🔔 Toast Notifications | Real-time feedback for every create, update, and delete action |

---

### 👩‍🏫 Teacher Portal
| Feature | Description |
|---|---|
| 📋 Take Attendance | Mark attendance period-by-period for any date (past or today) |
| 🕐 6 Periods Per Day | Period 1–6, each with a fixed subject and time slot |
| 🔁 Toggle Students | Tap each student card to toggle Present ✅ / Absent ❌ |
| ⚡ Quick Actions | "All Present" and "All Absent" buttons for fast marking |
| 💾 Save & Re-edit | Records are saved to localStorage; re-opening a slot loads existing data |
| 🗂 Attendance History | Browse all saved records filtered by student or month |
| 📊 Class Overview | GPA trends, subject averages, and risk scatter plots for their class only |
| ✏️ Edit Student Scores | Update marks and details for students in their assigned class |

---

### 🎓 Student Portal
| Feature | Description |
|---|---|
| 📊 Performance Tab | Personal GPA, attendance, class rank, risk level |
| 📚 Subject Scores | My scores vs class average bar chart and radar chart |
| 🏅 Class Ranking | Rank among classmates based on GPA |
| 📋 Subject Breakdown | Score, deviation from class average, and progress bar per subject |
| 📅 Attendance Tab | Full period-by-period attendance log |
| 📈 Attendance Progress | Visual progress bar with 55% (minimum) and 75% (good standing) thresholds |
| 📚 Subject-wise Attendance | Attendance % per subject — see which class you miss most |
| 🗓 Monthly Filter | Filter attendance log by month |
| 💡 Smart Recommendations | Personalized advice based on risk level and weak subjects |

---

### 📋 Period-wise Attendance System
- **6 periods per day**, each mapped to a subject and time slot
- Teachers pick a **date + period** and mark students present/absent
- Attendance **percentage auto-calculates** from all saved records
- Student GPA and risk level **update dynamically** based on actual attendance
- Students can view a **detailed log** showing every date, every period, and attendance status

---

### 🤖 ML-Inspired GPA Prediction
The dashboard uses a **weighted linear formula** to predict GPA:

```
Predicted GPA = (Subject Average / 100) × 10 × 0.6 + (Attendance / 100) × 10 × 0.4
```

This simulates a **linear regression model** trained on academic data, where subject performance accounts for 60% of the prediction and attendance for 40%.

---

### 📊 Data Visualizations (Recharts)
| Chart | Description |
|---|---|
| 📈 Line Chart | GPA trends across 6 semesters (Class Avg, Top, Low) |
| 📊 Bar Chart | Subject-wise average scores (horizontal) |
| 🔵 Scatter Chart | Attendance vs GPA correlation, color-coded by risk level |
| 🕸 Radar Chart | Subject performance radar for each student |
| 📊 Grouped Bar Chart | My scores vs class average (student view) |
| 📊 Actual vs Predicted | GPA comparison chart |

---

## 🔒 Role-Based Access Control

| Action | Admin | Teacher | Student |
|---|:---:|:---:|:---:|
| View all students | ✅ | ❌ (own class only) | ❌ (self only) |
| Add student | ✅ | ❌ | ❌ |
| Edit student scores | ✅ | ✅ (own class only) | ❌ |
| Delete student | ✅ | ❌ | ❌ |
| Mark attendance | ❌ | ✅ | ❌ |
| View attendance history | ✅ | ✅ (own class only) | ✅ (self only) |
| Add / remove teacher | ✅ | ❌ | ❌ |
| View analytics | ✅ | ✅ (own class) | ✅ (self) |

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **React 18** | UI framework, component architecture, state management |
| **Recharts** | All data visualizations and charts |
| **LocalStorage API** | Persistent data storage (no backend required) |
| **CSS-in-JS** | All styling via inline style objects |
| **Google Fonts** | Syne (display) + DM Sans (body) typography |

---

## ⚙️ Installation

### Prerequisites
- Node.js v16+ installed → [nodejs.org](https://nodejs.org)
- npm (comes with Node.js)

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/asampriya/StudentDashboard.git

# 2. Navigate into the project
cd StudentDashboard

# 3. Install dependencies
npm install

# 4. Install Recharts
npm install recharts

# 5. Replace src/App.js with the provided App.js file

# 6. Start the development server
npm start
```

The app will open at **http://localhost:3000** 🎉

---

## 🔑 Demo Credentials

### Staff Login
| Role | Username | Password |
|---|---|---|
| Admin | `admin` | `admin123` |
| Teacher (Section A) | `kavitha` | `teach123` |
| Teacher (Section B) | `rajan` | `teach123` |
| Teacher (Section C) | `divya` | `teach123` |

### Student Login
| Roll Number | Password |
|---|---|
| `2024001` | `2024001` |
| `2024004` | `2024004` |
| `2024007` | `2024007` |

> 💡 Student password defaults to their roll number unless changed by admin.

---

## 📁 Project Structure

```
StudentDashboard/
├── public/
│   └── index.html
├── src/
│   └── App.js              ← Entire application (single file)
├── package.json
└── README.md
```

### Key Components Inside App.js

```
App                          ← Root — handles routing between roles
├── LoginPage                ← Staff + Student login with tab switcher
├── AdminDashboard           ← Admin portal (Overview, Students, Teachers)
│   ├── StudentModal         ← Add / Edit student form (2-step)
│   ├── TeacherModal         ← Add / Edit teacher form
│   ├── DeleteDialog         ← Confirmation dialog
│   ├── StudentsTable        ← Searchable, filterable student table
│   └── OverviewCharts       ← All analytics charts
├── TeacherDashboard         ← Teacher portal (Attendance, History, Overview, Class)
│   ├── AttendanceTaker      ← Period-wise attendance marking UI
│   └── AttendanceHistory    ← Browse saved attendance records
└── StudentSelfDashboard     ← Student portal (Performance + Attendance tabs)
    └── StudentAttendanceView ← Period-by-period attendance log
```

---

## 🔍 How It Works

### Data Flow
```
localStorage ──► useLS() hook ──► App state
                                      │
              ┌───────────────────────┤
              ▼                       ▼
         Teachers                 Students
         Records                  Attendance Records
              │                       │
              ▼                       ▼
    TeacherDashboard          enrichStudent()
    (mark attendance)     (calculates live GPA & risk
                           from period records)
```

### Attendance Calculation
```
attendancePct = (periodsPresent / totalPeriods) × 100
GPA           = (subjectAvg / 100) × 6 + (attendancePct / 100) × 4
risk          = GPA ≥ 7.5 && att ≥ 75% → "Low"
              = GPA ≥ 5.5 && att ≥ 55% → "Medium"
              = otherwise               → "High"
```

### Storage Keys (localStorage)
| Key | Contents |
|---|---|
| `edu_classes` | Class sections |
| `edu_teachers` | Teacher accounts |
| `edu_students` | Student profiles and scores |
| `edu_att_records` | All period-wise attendance records |

---

## 🚀 Future Enhancements

- [ ] Backend integration with Node.js + MongoDB
- [ ] Email notifications for at-risk students
- [ ] Export attendance and reports as PDF / Excel
- [ ] Parent portal for monitoring their child's performance
- [ ] Timetable management system
- [ ] SMS alerts for low attendance
- [ ] Real ML model integration (scikit-learn API)
- [ ] Multi-subject teacher support

---

## 👩‍💻 Author

**Laxmi Priya Asam**


[![GitHub](https://img.shields.io/badge/GitHub-asampriya-181717?style=flat-square&logo=github)](https://github.com/asampriya)

---

## 📄 License

This project is licensed under the **MIT License** — feel free to use it, modify it, and build on top of it.

---

<div align="center">
  <b>⭐ If you found this project helpful, please give it a star on GitHub! ⭐</b>
</div>
