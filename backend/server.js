const express = require("express");
const cors = require("cors");

const { sql, poolPromise } = require("./db");

const app = express();

const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory fallback stores for offline/development mode
const inMemoryData = {
    profiles: {
        1: {
            UserID: 1,
            FullName: "Demo User",
            Email: "user@fithub.com",
            ProfileID: 1,
            Age: 26,
            Gender: "Male",
            HeightCm: 175,
            WeightKg: 72.5,
            ActivityLevel: "Moderate",
            Goal: "maintain",
            DailyWaterGoalMl: 2500,
            DailyCaloriesGoal: 2000,
            ActivityCount: 4
        }
    },
    activities: {
        1: [
            {
                WorkoutPlanID: 1,
                UserID: 1,
                PlanName: "Full Body Strength",
                Description: "Comprehensive beginner full body routine",
                Difficulty: "Beginner",
                WorkoutPlanExerciseID: 1,
                ExerciseID: 1,
                ExerciseName: "Push-ups",
                MuscleGroup: "Chest",
                Sets: 3,
                Repetitions: 12,
                DurationMinutes: 10
            },
            {
                WorkoutPlanID: 1,
                UserID: 1,
                PlanName: "Full Body Strength",
                Description: "Comprehensive beginner full body routine",
                Difficulty: "Beginner",
                WorkoutPlanExerciseID: 2,
                ExerciseID: 2,
                ExerciseName: "Barbell Squats",
                MuscleGroup: "Legs",
                Sets: 4,
                Repetitions: 10,
                DurationMinutes: 15
            },
            {
                WorkoutPlanID: 1,
                UserID: 1,
                PlanName: "Full Body Strength",
                Description: "Comprehensive beginner full body routine",
                Difficulty: "Beginner",
                WorkoutPlanExerciseID: 3,
                ExerciseID: 3,
                ExerciseName: "Pull-ups",
                MuscleGroup: "Back",
                Sets: 3,
                Repetitions: 8,
                DurationMinutes: 10
            },
            {
                WorkoutPlanID: 1,
                UserID: 1,
                PlanName: "Full Body Strength",
                Description: "Comprehensive beginner full body routine",
                Difficulty: "Beginner",
                WorkoutPlanExerciseID: 4,
                ExerciseID: 4,
                ExerciseName: "Plank",
                MuscleGroup: "Core",
                Sets: 3,
                Repetitions: 1,
                DurationMinutes: 5
            }
        ]
    },
    progress: {
        1: [
            {
                ProgressID: 1,
                UserID: 1,
                Weight: 75.0,
                BMI: 24.49,
                BodyFat: 18.5,
                Notes: "Starting fitness journey",
                Date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
            },
            {
                ProgressID: 2,
                UserID: 1,
                Weight: 73.8,
                BMI: 24.10,
                BodyFat: 17.8,
                Notes: "Feeling more energetic",
                Date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
            },
            {
                ProgressID: 3,
                UserID: 1,
                Weight: 72.5,
                BMI: 23.67,
                BodyFat: 17.2,
                Notes: "Reached milestone weight",
                Date: new Date().toISOString().split("T")[0]
            }
        ]
    },
    waterLogs: {
        1: {
            todayAmount: 1500,
            goal: 2500,
            logs: [
                { id: 1, amount: 500, time: "08:30 AM" },
                { id: 2, amount: 500, time: "11:15 AM" },
                { id: 3, amount: 500, time: "02:00 PM" }
            ]
        }
    },
    foodLogs: {
        1: [
            {
                id: 1,
                foodName: "Oatmeal with Blueberries & Honey",
                category: "Breakfast",
                calories: 320,
                protein: 12,
                carbs: 58,
                fat: 6
            },
            {
                id: 2,
                foodName: "Grilled Chicken Breast with Brown Rice",
                category: "Lunch",
                calories: 550,
                protein: 45,
                carbs: 50,
                fat: 10
            },
            {
                id: 3,
                foodName: "Greek Yogurt with Almonds",
                category: "Snack",
                calories: 210,
                protein: 18,
                carbs: 12,
                fat: 9
            }
        ]
    },
    adminUsers: [
        { id: 1, name: "Demo User", email: "user@fithub.com", role: "User", status: "Active", joinDate: "2026-06-15" },
        { id: 2, name: "Marcus Vance", email: "marcus@gympro.com", role: "Trainer", status: "Active", joinDate: "2026-06-20" },
        { id: 3, name: "Elena Rostova", email: "elena.fitness@fit.io", role: "Trainer", status: "Pending", joinDate: "2026-07-01" },
        { id: 4, name: "Sarah Jenkins", email: "sarah.j@gmail.com", role: "User", status: "Active", joinDate: "2026-07-04" },
        { id: 5, name: "David Kim", email: "dkim@workout.net", role: "User", status: "Suspended", joinDate: "2026-07-10" },
        { id: 6, name: "Alex Mercer", email: "admin@fithub.com", role: "Admin", status: "Active", joinDate: "2026-01-01" }
    ],
    adminTrainers: [
        {
            id: 1,
            userId: 2,
            name: "Marcus Vance",
            email: "marcus@gympro.com",
            certification: "NASM-CPT, CSCS Strength Coach",
            bio: "Specializing in hypertrophy, barbell powerbuilding, and athlete conditioning with 8+ years experience.",
            isApproved: true,
            clientsCount: 14,
            rating: 4.9
        },
        {
            id: 2,
            userId: 3,
            name: "Elena Rostova",
            email: "elena.fitness@fit.io",
            certification: "ISSA Master Trainer, PN Nutrition Coach",
            bio: "Passionate about sustainable weight loss, mobility routines, and plant-based macronutrient planning.",
            isApproved: false,
            clientsCount: 0,
            rating: 5.0
        },
        {
            id: 3,
            userId: 7,
            name: "Kenji Takahashi",
            email: "kenji.fit@tokyo.jp",
            certification: "ACE Certified Personal Trainer",
            bio: "Calisthenics specialist, functional mobility, and high-intensity interval training (HIIT).",
            isApproved: false,
            clientsCount: 0,
            rating: 4.8
        }
    ],
    adminExercises: [
        { id: 1, name: "Push-ups", muscleGroup: "Chest", difficulty: "Beginner", equipment: "Bodyweight", instructions: "Keep back straight, lower chest to floor, and push back up explosively." },
        { id: 2, name: "Barbell Squats", muscleGroup: "Legs", difficulty: "Intermediate", equipment: "Barbell", instructions: "Lower hips below knees keeping chest upright, then drive upward through midfoot." },
        { id: 3, name: "Pull-ups", muscleGroup: "Back", difficulty: "Intermediate", equipment: "Pull-up Bar", instructions: "Hang with overhand grip, engage lats, and pull chin clearly over the bar." },
        { id: 4, name: "Dumbbell Shoulder Press", muscleGroup: "Shoulders", difficulty: "Beginner", equipment: "Dumbbells", instructions: "Press dumbbells overhead smoothly from shoulder height until arms are fully extended." },
        { id: 5, name: "Plank", muscleGroup: "Core", difficulty: "Beginner", equipment: "Bodyweight", instructions: "Maintain a rigid plank posture on forearms and toes with tight abdominal bracing." },
        { id: 6, name: "Barbell Deadlift", muscleGroup: "Back", difficulty: "Advanced", equipment: "Barbell", instructions: "Hinge at hips, grip bar, drive through heels keeping neutral spine throughout movement." },
        { id: 7, name: "Dumbbell Bicep Curls", muscleGroup: "Arms", difficulty: "Beginner", equipment: "Dumbbells", instructions: "Curl weights towards shoulders while keeping elbows pinned to sides." }
    ]
};

// Test API
app.get("/", async (req, res) => {
    try {
        const pool = await poolPromise;
        if (pool) {
            res.json({ message: "FitHub API is running", database: true });
        } else {
            res.json({ message: "FitHub API is running in fallback mode", database: false });
        }
    } catch {
        res.json({ message: "FitHub API is running in fallback mode", database: false });
    }
});

// Get user's workout activity
app.get("/api/activity/:userId", async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);

        if (isNaN(userId)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        try {
            const pool = await poolPromise;
            if (!pool) throw new Error("SQL pool unavailable");

            const result = await pool
                .request()
                .input("UserID", sql.Int, userId)
                .query(`
                    SELECT
                        wp.WorkoutPlanID,
                        wp.UserID,
                        wp.PlanName,
                        wp.Description,
                        wp.Difficulty,
                        wpe.WorkoutPlanExerciseID,
                        wpe.ExerciseID,
                        e.ExerciseName,
                        e.MuscleGroup,
                        wpe.Sets,
                        wpe.Repetitions,
                        wpe.DurationMinutes
                    FROM WorkoutPlans wp
                    LEFT JOIN WorkoutPlanExercises wpe
                        ON wp.WorkoutPlanID = wpe.WorkoutPlanID
                    LEFT JOIN Exercises e
                        ON wpe.ExerciseID = e.ExerciseID
                    WHERE wp.UserID = @UserID
                    ORDER BY wp.WorkoutPlanID, wpe.WorkoutPlanExerciseID
                `);

            return res.json(result.recordset);
        } catch {
            const fallback = inMemoryData.activities[userId] || inMemoryData.activities[1] || [];
            return res.json(fallback);
        }
    } catch (error) {
        console.error("Activity fetch error:", error);
        res.status(500).json({ message: "Failed to fetch activity" });
    }
});

// Get user profile
app.get("/api/profile/:userId", async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);

        if (isNaN(userId)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        try {
            const pool = await poolPromise;
            if (!pool) throw new Error("SQL pool unavailable");

            const result = await pool
                .request()
                .input("UserID", sql.Int, userId)
                .query(`
                    SELECT
                        u.UserID,
                        u.FullName,
                        u.Email,
                        p.ProfileID,
                        p.Age,
                        p.Gender,
                        p.HeightCm,
                        p.WeightKg,
                        p.ActivityLevel,
                        p.Goal,
                        (
                            SELECT COUNT(*)
                            FROM WorkoutPlanExercises wpe
                            INNER JOIN WorkoutPlans wp
                                ON wpe.WorkoutPlanID = wp.WorkoutPlanID
                            WHERE wp.UserID = u.UserID
                        ) AS ActivityCount
                    FROM Users u
                    LEFT JOIN Profiles p
                        ON u.UserID = p.UserID
                    WHERE u.UserID = @UserID
                `);

            if (result.recordset.length === 0) {
                return res.status(404).json({ message: "User not found" });
            }

            return res.json(result.recordset[0]);
        } catch {
            const userProfile = inMemoryData.profiles[userId] || inMemoryData.profiles[1];
            return res.json(userProfile);
        }
    } catch (error) {
        console.error("Profile error:", error);
        res.status(500).json({ message: "Failed to fetch profile" });
    }
});

// Update user profile
app.put("/api/profile/:userId", async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);

        if (isNaN(userId)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        const { age, weight, height, goal, activityLevel } = req.body;

        if (age === undefined || weight === undefined || height === undefined) {
            return res.status(400).json({
                message: "Age, weight and height are required"
            });
        }

        // Update in-memory
        if (!inMemoryData.profiles[userId]) {
            inMemoryData.profiles[userId] = { ...inMemoryData.profiles[1], UserID: userId };
        }
        inMemoryData.profiles[userId].Age = Number(age);
        inMemoryData.profiles[userId].WeightKg = Number(weight);
        inMemoryData.profiles[userId].HeightCm = Number(height);
        if (goal) inMemoryData.profiles[userId].Goal = goal;
        if (activityLevel) inMemoryData.profiles[userId].ActivityLevel = activityLevel;

        try {
            const pool = await poolPromise;
            if (pool) {
                await pool
                    .request()
                    .input("UserID", sql.Int, userId)
                    .input("Age", sql.Int, age)
                    .input("WeightKg", sql.Decimal(5, 2), weight)
                    .input("HeightCm", sql.Decimal(5, 2), height)
                    .input("Goal", sql.NVarChar(50), goal || "maintain")
                    .query(`
                        UPDATE Profiles
                        SET
                            Age = @Age,
                            WeightKg = @WeightKg,
                            HeightCm = @HeightCm,
                            Goal = @Goal
                        WHERE UserID = @UserID
                    `);
            }
        } catch (dbErr) {
            console.warn("SQL Server unavailable, updated in memory:", dbErr.message);
        }

        res.json({ message: "Profile updated successfully" });
    } catch (error) {
        console.error("Profile update error:", error);
        res.status(500).json({ message: "Failed to update profile" });
    }
});

// Get user progress logs
app.get("/api/progress/:userId", async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);

        if (isNaN(userId)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        try {
            const pool = await poolPromise;
            if (!pool) throw new Error("SQL pool unavailable");

            const result = await pool
                .request()
                .input("UserID", sql.Int, userId)
                .query(`
                    SELECT ProgressID, UserID, Weight, BMI, BodyFat, Notes, Date
                    FROM Progress
                    WHERE UserID = @UserID
                    ORDER BY Date DESC
                `);

            return res.json(result.recordset);
        } catch {
            const logs = inMemoryData.progress[userId] || inMemoryData.progress[1] || [];
            return res.json(logs);
        }
    } catch (error) {
        console.error("Progress fetch error:", error);
        res.status(500).json({ message: "Failed to fetch progress" });
    }
});

// Add new progress log entry (Weight, BMI, BodyFat)
app.post("/api/progress/:userId", async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);

        if (isNaN(userId)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        const { weight, height, bodyFat, notes, date } = req.body;

        if (!weight || weight <= 0) {
            return res.status(400).json({ message: "Valid weight is required" });
        }

        const weightNum = parseFloat(weight);
        const heightNum = height ? parseFloat(height) : (inMemoryData.profiles[userId]?.HeightCm || 175);
        const bmi = heightNum > 0 ? parseFloat((weightNum / Math.pow(heightNum / 100, 2)).toFixed(2)) : null;
        const entryDate = date || new Date().toISOString().split("T")[0];

        const newEntry = {
            ProgressID: Date.now(),
            UserID: userId,
            Weight: weightNum,
            BMI: bmi,
            BodyFat: bodyFat ? parseFloat(bodyFat) : null,
            Notes: notes || "Manual entry",
            Date: entryDate
        };

        if (!inMemoryData.progress[userId]) {
            inMemoryData.progress[userId] = [];
        }
        inMemoryData.progress[userId].unshift(newEntry);

        if (inMemoryData.profiles[userId]) {
            inMemoryData.profiles[userId].WeightKg = weightNum;
        }

        try {
            const pool = await poolPromise;
            if (pool) {
                await pool
                    .request()
                    .input("UserID", sql.Int, userId)
                    .input("Weight", sql.Decimal(5, 2), weightNum)
                    .input("BMI", sql.Decimal(5, 2), bmi)
                    .input("BodyFat", sql.Decimal(5, 2), bodyFat ? parseFloat(bodyFat) : null)
                    .input("Notes", sql.NVarChar(255), notes || "")
                    .input("Date", sql.DateTime, new Date(entryDate))
                    .query(`
                        INSERT INTO Progress (UserID, Weight, BMI, BodyFat, Notes, Date)
                        VALUES (@UserID, @Weight, @BMI, @BodyFat, @Notes, @Date);

                        UPDATE Profiles
                        SET WeightKg = @Weight
                        WHERE UserID = @UserID;
                    `);
            }
        } catch (dbErr) {
            console.warn("SQL Server unavailable, recorded progress in memory:", dbErr.message);
        }

        res.status(201).json({
            message: "Progress logged successfully",
            entry: newEntry
        });
    } catch (error) {
        console.error("Progress log error:", error);
        res.status(500).json({ message: "Failed to log progress" });
    }
});

// Delete a progress entry
app.delete("/api/progress/:userId/:progressId", async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const progressId = parseInt(req.params.progressId);

        if (inMemoryData.progress[userId]) {
            inMemoryData.progress[userId] = inMemoryData.progress[userId].filter(
                p => p.ProgressID !== progressId
            );
        }

        try {
            const pool = await poolPromise;
            if (pool) {
                await pool
                    .request()
                    .input("ProgressID", sql.Int, progressId)
                    .input("UserID", sql.Int, userId)
                    .query("DELETE FROM Progress WHERE ProgressID = @ProgressID AND UserID = @UserID");
            }
        } catch (dbErr) {
            console.warn("SQL Server unavailable, deleted from memory:", dbErr.message);
        }

        res.json({ message: "Progress entry deleted successfully" });
    } catch (error) {
        console.error("Delete progress error:", error);
        res.status(500).json({ message: "Failed to delete progress entry" });
    }
});

// Get user water intake
app.get("/api/water/:userId", async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const userWater = inMemoryData.waterLogs[userId] || inMemoryData.waterLogs[1] || {
            todayAmount: 0,
            goal: 2500,
            logs: []
        };
        res.json(userWater);
    } catch (error) {
        console.error("Water fetch error:", error);
        res.status(500).json({ message: "Failed to fetch water data" });
    }
});

// Log water intake
app.post("/api/water/:userId", async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const { amount, goal } = req.body;

        if (!inMemoryData.waterLogs[userId]) {
            inMemoryData.waterLogs[userId] = {
                todayAmount: 0,
                goal: 2500,
                logs: []
            };
        }

        if (goal !== undefined) {
            inMemoryData.waterLogs[userId].goal = Number(goal);
        }

        if (amount !== undefined && Number(amount) > 0) {
            const addAmount = Number(amount);
            inMemoryData.waterLogs[userId].todayAmount += addAmount;
            const now = new Date();
            const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            inMemoryData.waterLogs[userId].logs.unshift({
                id: Date.now(),
                amount: addAmount,
                time: timeStr
            });
        }

        res.json({
            message: "Water logged successfully",
            data: inMemoryData.waterLogs[userId]
        });
    } catch (error) {
        console.error("Water log error:", error);
        res.status(500).json({ message: "Failed to log water" });
    }
});

// Reset water intake
app.post("/api/water/:userId/reset", async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        if (inMemoryData.waterLogs[userId]) {
            inMemoryData.waterLogs[userId].todayAmount = 0;
            inMemoryData.waterLogs[userId].logs = [];
        }
        res.json({ message: "Water intake reset", data: inMemoryData.waterLogs[userId] });
    } catch {
        res.status(500).json({ message: "Failed to reset water" });
    }
});

// Get user food logs
app.get("/api/food/:userId", async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const foods = inMemoryData.foodLogs[userId] || inMemoryData.foodLogs[1] || [];
        res.json(foods);
    } catch (error) {
        console.error("Food fetch error:", error);
        res.status(500).json({ message: "Failed to fetch food logs" });
    }
});

// Add food log
app.post("/api/food/:userId", async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const { foodName, category, calories, protein, carbs, fat } = req.body;

        if (!foodName || !calories) {
            return res.status(400).json({ message: "Food name and calories are required" });
        }

        const newFood = {
            id: Date.now(),
            foodName,
            category: category || "Breakfast",
            calories: Number(calories),
            protein: Number(protein) || 0,
            carbs: Number(carbs) || 0,
            fat: Number(fat) || 0
        };

        if (!inMemoryData.foodLogs[userId]) {
            inMemoryData.foodLogs[userId] = [];
        }
        inMemoryData.foodLogs[userId].push(newFood);

        res.status(201).json({
            message: "Food logged successfully",
            food: newFood
        });
    } catch (error) {
        console.error("Food log error:", error);
        res.status(500).json({ message: "Failed to log food" });
    }
});

// Delete food log
app.delete("/api/food/:userId/:foodId", async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const foodId = parseInt(req.params.foodId);

        if (inMemoryData.foodLogs[userId]) {
            inMemoryData.foodLogs[userId] = inMemoryData.foodLogs[userId].filter(
                f => f.id !== foodId
            );
        }

        res.json({ message: "Food entry removed" });
    } catch (error) {
        console.error("Delete food error:", error);
        res.status(500).json({ message: "Failed to delete food entry" });
    }
});

// ==========================================
// ADMIN MODULE ENDPOINTS (FR-11, FR-11.1, FR-11.2)
// ==========================================

// Get system stats overview
app.get("/api/admin/stats", (req, res) => {
    const totalUsers = inMemoryData.adminUsers.length;
    const totalTrainers = inMemoryData.adminTrainers.length;
    const pendingTrainers = inMemoryData.adminTrainers.filter(t => !t.isApproved).length;
    const totalExercises = inMemoryData.adminExercises.length;
    
    res.json({
        totalUsers,
        totalTrainers,
        pendingTrainers,
        totalExercises,
        engagementRate: "88.4%",
        activeSessions: 42
    });
});

// Get all users (User Management)
app.get("/api/admin/users", (req, res) => {
    res.json(inMemoryData.adminUsers);
});

// Update user status (Suspend / Reactivate User)
app.put("/api/admin/users/:userId/status", (req, res) => {
    const userId = parseInt(req.params.userId);
    const { status } = req.body;

    const user = inMemoryData.adminUsers.find(u => u.id === userId);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    user.status = status || (user.status === "Active" ? "Suspended" : "Active");
    res.json({ message: `User status updated to ${user.status}`, user });
});

// Delete user
app.delete("/api/admin/users/:userId", (req, res) => {
    const userId = parseInt(req.params.userId);
    const initialLen = inMemoryData.adminUsers.length;
    inMemoryData.adminUsers = inMemoryData.adminUsers.filter(u => u.id !== userId);

    if (inMemoryData.adminUsers.length === initialLen) {
        return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
});

// Get all trainers (Trainer Management)
app.get("/api/admin/trainers", (req, res) => {
    res.json(inMemoryData.adminTrainers);
});

// Approve / Suspend Trainer (FR-11.1)
app.put("/api/admin/trainers/:trainerId/approve", (req, res) => {
    const trainerId = parseInt(req.params.trainerId);
    const { isApproved } = req.body;

    const trainer = inMemoryData.adminTrainers.find(t => t.id === trainerId);
    if (!trainer) {
        return res.status(404).json({ message: "Trainer not found" });
    }

    trainer.isApproved = isApproved !== undefined ? isApproved : !trainer.isApproved;
    
    // Also sync with adminUsers status
    const correspondingUser = inMemoryData.adminUsers.find(u => u.id === trainer.userId);
    if (correspondingUser) {
        correspondingUser.status = trainer.isApproved ? "Active" : "Pending";
    }

    res.json({
        message: `Trainer ${trainer.name} is now ${trainer.isApproved ? "Approved" : "Pending/Suspended"}`,
        trainer
    });
});

// Get all exercises (Exercise Management)
app.get("/api/admin/exercises", (req, res) => {
    res.json(inMemoryData.adminExercises);
});

// Add new exercise
app.post("/api/admin/exercises", (req, res) => {
    const { name, muscleGroup, difficulty, equipment, instructions } = req.body;

    if (!name || !muscleGroup) {
        return res.status(400).json({ message: "Exercise name and muscle group are required" });
    }

    const newExercise = {
        id: Date.now(),
        name,
        muscleGroup,
        difficulty: difficulty || "Beginner",
        equipment: equipment || "None",
        instructions: instructions || "Perform movement with good form."
    };

    inMemoryData.adminExercises.push(newExercise);
    res.status(201).json({ message: "Exercise added successfully", exercise: newExercise });
});

// Update exercise
app.put("/api/admin/exercises/:exerciseId", (req, res) => {
    const exerciseId = parseInt(req.params.exerciseId);
    const { name, muscleGroup, difficulty, equipment, instructions } = req.body;

    const exercise = inMemoryData.adminExercises.find(e => e.id === exerciseId);
    if (!exercise) {
        return res.status(404).json({ message: "Exercise not found" });
    }

    if (name) exercise.name = name;
    if (muscleGroup) exercise.muscleGroup = muscleGroup;
    if (difficulty) exercise.difficulty = difficulty;
    if (equipment) exercise.equipment = equipment;
    if (instructions) exercise.instructions = instructions;

    res.json({ message: "Exercise updated successfully", exercise });
});

// Delete exercise
app.delete("/api/admin/exercises/:exerciseId", (req, res) => {
    const exerciseId = parseInt(req.params.exerciseId);
    const initialLen = inMemoryData.adminExercises.length;
    inMemoryData.adminExercises = inMemoryData.adminExercises.filter(e => e.id !== exerciseId);

    if (inMemoryData.adminExercises.length === initialLen) {
        return res.status(404).json({ message: "Exercise not found" });
    }

    res.json({ message: "Exercise deleted successfully" });
});

// Export usage reports to CSV (FR-11.2)
app.get("/api/admin/reports/csv", (req, res) => {
    let csv = "ID,Name,Email,Role,Status,JoinDate\n";
    inMemoryData.adminUsers.forEach(u => {
        csv += `${u.id},"${u.name}","${u.email}","${u.role}","${u.status}","${u.joinDate}"\n`;
    });

    res.header("Content-Type", "text/csv");
    res.attachment("fithub_users_report.csv");
    res.send(csv);
});

// Start server
app.listen(PORT, () => {
    console.log(`FitHub API running on http://localhost:${PORT}`);
});