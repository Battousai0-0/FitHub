-- FitHub Database Schema (MS SQL Server / MySQL compatible)
-- Reference: SRS Section 7.1 Database Requirements

-- 1. Roles
CREATE TABLE Roles (
    RoleID INT PRIMARY KEY IDENTITY(1,1),
    RoleName NVARCHAR(50) NOT NULL UNIQUE
);

-- 2. Users
CREATE TABLE Users (
    UserID INT PRIMARY KEY IDENTITY(1,1),
    FullName NVARCHAR(100) NOT NULL,
    Email NVARCHAR(100) NOT NULL UNIQUE,
    Password NVARCHAR(255) NOT NULL,
    Gender NVARCHAR(20),
    DOB DATE,
    RoleID INT FOREIGN KEY REFERENCES Roles(RoleID),
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- 3. Profiles
CREATE TABLE Profiles (
    ProfileID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT NOT NULL UNIQUE FOREIGN KEY REFERENCES Users(UserID) ON DELETE CASCADE,
    Age INT,
    Gender NVARCHAR(20),
    HeightCm DECIMAL(5,2),
    WeightKg DECIMAL(5,2),
    ActivityLevel NVARCHAR(50),
    Goal NVARCHAR(50) DEFAULT 'maintain',
    DailyWaterGoalMl INT DEFAULT 2500,
    DailyCaloriesGoal INT DEFAULT 2000,
    UpdatedAt DATETIME DEFAULT GETDATE()
);

-- 4. Trainers
CREATE TABLE Trainers (
    TrainerID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT NOT NULL UNIQUE FOREIGN KEY REFERENCES Users(UserID) ON DELETE CASCADE,
    Certification NVARCHAR(255),
    Bio NVARCHAR(MAX),
    IsApproved BIT DEFAULT 0
);

-- 5. Exercises
CREATE TABLE Exercises (
    ExerciseID INT PRIMARY KEY IDENTITY(1,1),
    ExerciseName NVARCHAR(100) NOT NULL,
    MuscleGroup NVARCHAR(50) NOT NULL,
    Difficulty NVARCHAR(30) DEFAULT 'Beginner',
    Equipment NVARCHAR(100) DEFAULT 'None',
    Instructions NVARCHAR(MAX),
    MediaUrl NVARCHAR(255)
);

-- 6. WorkoutPlans
CREATE TABLE WorkoutPlans (
    WorkoutPlanID INT PRIMARY KEY IDENTITY(1,1),
    TrainerID INT NULL FOREIGN KEY REFERENCES Trainers(TrainerID),
    UserID INT NOT NULL FOREIGN KEY REFERENCES Users(UserID),
    PlanName NVARCHAR(100) NOT NULL,
    Description NVARCHAR(MAX),
    Difficulty NVARCHAR(30) DEFAULT 'Intermediate',
    StartDate DATE DEFAULT GETDATE()
);

-- 7. WorkoutPlanExercises
CREATE TABLE WorkoutPlanExercises (
    WorkoutPlanExerciseID INT PRIMARY KEY IDENTITY(1,1),
    WorkoutPlanID INT NOT NULL FOREIGN KEY REFERENCES WorkoutPlans(WorkoutPlanID) ON DELETE CASCADE,
    ExerciseID INT NOT NULL FOREIGN KEY REFERENCES Exercises(ExerciseID),
    Sets INT DEFAULT 3,
    Repetitions INT DEFAULT 10,
    DurationMinutes INT DEFAULT 15
);

-- 8. WorkoutLogs
CREATE TABLE WorkoutLogs (
    LogID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT NOT NULL FOREIGN KEY REFERENCES Users(UserID),
    ExerciseID INT NOT NULL FOREIGN KEY REFERENCES Exercises(ExerciseID),
    Sets INT,
    Reps INT,
    Weight DECIMAL(5,2),
    Date DATETIME DEFAULT GETDATE()
);

-- 9. Foods
CREATE TABLE Foods (
    FoodID INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(100) NOT NULL,
    Calories INT NOT NULL,
    Protein DECIMAL(5,2) DEFAULT 0,
    Carbs DECIMAL(5,2) DEFAULT 0,
    Fats DECIMAL(5,2) DEFAULT 0
);

-- 10. MealLogs
CREATE TABLE MealLogs (
    MealLogID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT NOT NULL FOREIGN KEY REFERENCES Users(UserID),
    FoodName NVARCHAR(100) NOT NULL,
    Category NVARCHAR(30) DEFAULT 'Breakfast', -- Breakfast, Lunch, Dinner, Snack
    Calories INT NOT NULL,
    Protein DECIMAL(5,2) DEFAULT 0,
    Carbs DECIMAL(5,2) DEFAULT 0,
    Fats DECIMAL(5,2) DEFAULT 0,
    Quantity INT DEFAULT 1,
    Date DATETIME DEFAULT GETDATE()
);

-- 11. Progress (Weight & BMI Tracking - FR-8)
CREATE TABLE Progress (
    ProgressID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT NOT NULL FOREIGN KEY REFERENCES Users(UserID),
    Weight DECIMAL(5,2) NOT NULL,
    BMI DECIMAL(5,2),
    BodyFat DECIMAL(5,2),
    Notes NVARCHAR(255),
    Date DATETIME DEFAULT GETDATE()
);

-- 12. WaterLogs (Water Tracker - FR-7)
CREATE TABLE WaterLogs (
    WaterLogID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT NOT NULL FOREIGN KEY REFERENCES Users(UserID),
    AmountMl INT NOT NULL,
    Date DATETIME DEFAULT GETDATE()
);

-- 13. Notifications
CREATE TABLE Notifications (
    NotifID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT NOT NULL FOREIGN KEY REFERENCES Users(UserID),
    Message NVARCHAR(255) NOT NULL,
    Type NVARCHAR(50),
    IsRead BIT DEFAULT 0,
    Date DATETIME DEFAULT GETDATE()
);

-- SEED DATA
INSERT INTO Roles (RoleName) VALUES ('User'), ('Trainer'), ('Admin');

INSERT INTO Users (FullName, Email, Password, Gender, DOB, RoleID)
VALUES ('Demo User', 'user@fithub.com', 'password123!', 'Male', '1998-05-15', 1);

INSERT INTO Profiles (UserID, Age, Gender, HeightCm, WeightKg, ActivityLevel, Goal, DailyWaterGoalMl, DailyCaloriesGoal)
VALUES (1, 26, 'Male', 175.0, 72.5, 'Moderate', 'maintain', 2500, 2000);

INSERT INTO Exercises (ExerciseName, MuscleGroup, Difficulty, Equipment, Instructions)
VALUES 
('Push-ups', 'Chest', 'Beginner', 'Bodyweight', 'Keep back straight, lower chest to floor, push back up.'),
('Barbell Squats', 'Legs', 'Intermediate', 'Barbell', 'Lower hips below knees with straight back, drive back up.'),
('Pull-ups', 'Back', 'Intermediate', 'Pull-up Bar', 'Hang from bar with palms facing away, pull chin above bar.'),
('Dumbbell Shoulder Press', 'Shoulders', 'Beginner', 'Dumbbells', 'Press dumbbells overhead until arms extended.'),
('Plank', 'Core', 'Beginner', 'Bodyweight', 'Hold rigid body position supported on forearms and toes.');

INSERT INTO WorkoutPlans (UserID, PlanName, Description, Difficulty)
VALUES (1, 'Full Body Strength', 'Comprehensive beginner full body routine', 'Beginner');

INSERT INTO WorkoutPlanExercises (WorkoutPlanID, ExerciseID, Sets, Repetitions, DurationMinutes)
VALUES 
(1, 1, 3, 12, 10),
(1, 2, 4, 10, 15),
(1, 3, 3, 8, 10),
(1, 5, 3, 1, 5);

INSERT INTO Progress (UserID, Weight, BMI, BodyFat, Notes, Date)
VALUES 
(1, 75.0, 24.49, 18.5, 'Starting fitness journey', DATEADD(DAY, -14, GETDATE())),
(1, 73.8, 24.10, 17.8, 'Feeling more energetic', DATEADD(DAY, -7, GETDATE())),
(1, 72.5, 23.67, 17.2, 'Reached milestone weight', GETDATE());
