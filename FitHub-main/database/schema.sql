-- FitHub MySQL schema
CREATE DATABASE IF NOT EXISTS fithub;
USE fithub;

CREATE TABLE IF NOT EXISTS Users (
    UserID INT AUTO_INCREMENT PRIMARY KEY,
    Username VARCHAR(50) NOT NULL UNIQUE,
    Email VARCHAR(100) NOT NULL UNIQUE,
    PasswordHash VARCHAR(255) NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Profiles (
    ProfileID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT NOT NULL UNIQUE,
    Age INT NULL,
    Gender VARCHAR(20) NULL,
    HeightCm DECIMAL(5,2) NULL,
    WeightKg DECIMAL(5,2) NULL,
    ActivityLevel VARCHAR(30) NULL,
    Goal VARCHAR(20) NULL,
    DailyCalorieIntake INT NULL DEFAULT 2000,
    DailyCalorieBurn INT NULL DEFAULT 600,
    Onboarded TINYINT(1) NOT NULL DEFAULT 0,
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Exercises (
    ExerciseID INT AUTO_INCREMENT PRIMARY KEY,
    ExerciseName VARCHAR(100) NOT NULL,
    MuscleGroup VARCHAR(50) NULL,
    MET DECIMAL(4,2) NOT NULL DEFAULT 5.0,
    UNIQUE KEY uq_exercise_name (ExerciseName)
);

CREATE TABLE IF NOT EXISTS WorkoutPlans (
    WorkoutPlanID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT NOT NULL,
    PlanName VARCHAR(100) NOT NULL,
    Description VARCHAR(255) NULL,
    Difficulty VARCHAR(20) NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS WorkoutPlanExercises (
    WorkoutPlanExerciseID INT AUTO_INCREMENT PRIMARY KEY,
    WorkoutPlanID INT NOT NULL,
    ExerciseID INT NOT NULL,
    Sets INT NULL,
    Repetitions INT NULL,
    DurationMinutes INT NULL,
    FOREIGN KEY (WorkoutPlanID) REFERENCES WorkoutPlans(WorkoutPlanID) ON DELETE CASCADE,
    FOREIGN KEY (ExerciseID) REFERENCES Exercises(ExerciseID) ON DELETE CASCADE,
    UNIQUE KEY uq_plan_exercise (WorkoutPlanID, ExerciseID)
);

CREATE TABLE IF NOT EXISTS FoodLogs (
    FoodLogID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT NOT NULL,
    FoodName VARCHAR(150) NOT NULL,
    Calories INT NOT NULL,
    Protein DECIMAL(7,2) NOT NULL DEFAULT 0,
    Carbs DECIMAL(7,2) NOT NULL DEFAULT 0,
    Fat DECIMAL(7,2) NOT NULL DEFAULT 0,
    LoggedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
    INDEX idx_food_user_date (UserID, LoggedAt)
);

CREATE TABLE IF NOT EXISTS ActivityLogs (
    ActivityLogID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT NOT NULL,
    WorkoutPlanExerciseID INT NULL,
    ExerciseID INT NOT NULL,
    CaloriesBurned INT NOT NULL DEFAULT 0,
    DurationMinutes INT NOT NULL DEFAULT 0,
    CompletedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
    FOREIGN KEY (WorkoutPlanExerciseID) REFERENCES WorkoutPlanExercises(WorkoutPlanExerciseID) ON DELETE SET NULL,
    FOREIGN KEY (ExerciseID) REFERENCES Exercises(ExerciseID) ON DELETE CASCADE,
    INDEX idx_activity_user_date (UserID, CompletedAt),
    UNIQUE KEY uq_activity_completion (UserID, WorkoutPlanExerciseID, CompletedAt)
);

INSERT INTO Exercises (ExerciseName, MuscleGroup, MET) VALUES
('Push Up', 'Chest', 8.0),
('Squat', 'Legs', 5.5),
('Plank', 'Core', 3.5),
('Bench Press', 'Chest', 5.0),
('Deadlift', 'Back', 6.0),
('Pull Up', 'Back', 8.0),
('Lunges', 'Legs', 5.0),
('Bicep Curl', 'Arms', 3.5)
ON DUPLICATE KEY UPDATE MuscleGroup=VALUES(MuscleGroup), MET=VALUES(MET);
