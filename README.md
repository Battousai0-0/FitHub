# 🏋️ FitHub

> A modern fitness management and tracking platform designed to help users manage their workouts, nutrition, fitness goals, and daily activity from a single dashboard.

---

## 📌 Overview

**FitHub** is a full-stack fitness management application that provides users with a centralized platform for managing their fitness journey.

The system allows users to create an account, securely log in, manage their profile, track nutrition, follow workout plans, record exercises, and monitor their fitness progress.

The project was originally designed around an **MS SQL Server** database and has been adapted to use **MySQL** as the primary database.

---

## ✨ Features

### 🔐 Authentication

- User registration
- Secure login
- Password hashing
- JWT-based authentication
- Logout
- Forgot password functionality
- Password reset
- Protected routes
- Authentication validation

### 📊 Dashboard

The FitHub dashboard provides an overview of the user's fitness activity.

Users can view:

- Daily calorie intake
- Calories burned
- Workout statistics
- Fitness goal progress
- Weekly activity
- Recommended workouts
- Daily fitness goals

### 👤 User Profile

Users can manage their personal fitness information.

Profile information includes:

- Full name
- Email
- Age
- Height
- Weight
- Activity level
- Fitness goal

### 🍎 Nutrition Tracking

Users can record and monitor their daily food intake.

Features include:

- Add food
- Calories tracking
- Protein tracking
- Carbohydrate tracking
- Fat tracking
- Daily nutrition summary
- Food history

### 🏋️ Workout Management

Users can browse and manage workout plans.

Features include:

- Workout plans
- Exercise lists
- Exercise details
- Workout duration
- Sets and repetitions
- Difficulty levels
- Exercise completion tracking

### 📈 Activity Tracking

Users can monitor their fitness activity over time.

Includes:

- Workout history
- Calories burned
- Workout duration
- Weekly statistics
- Completed exercises
- Activity summaries

---

# 🏗️ System Architecture

FitHub follows a **3-Tier Architecture combined with MVC and Repository/Service patterns**.

```text
┌───────────────────────────────┐
│       Presentation Layer      │
│                               │
│       React.js / Vite         │
│       Components & Pages      │
└───────────────┬───────────────┘
                │
                │ REST API / JSON
                ▼
┌───────────────────────────────┐
│       Application Layer       │
│                               │
│     Node.js + Express.js      │
│                               │
│ Routes → Controllers →        │
│ Services → Business Logic     │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│        Data Access Layer      │
│                               │
│      Repository Pattern       │
│          mysql2               │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│          MySQL Database       │
└───────────────────────────────┘
