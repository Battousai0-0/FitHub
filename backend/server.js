const express = require("express");
const cors = require("cors");

const { sql, poolPromise } = require("./db");

const app = express();

const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());


// Test API
app.get("/", async (req, res) => {
    try {
        await poolPromise;

        res.json({
            message: "FitHub API is running",
            database: true
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Database connection failed",
            database: false
        });
    }
});

// Get user's workout activity
app.get("/api/activity/:userId", async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);

        if (isNaN(userId)) {
            return res.status(400).json({
                message: "Invalid user ID"
            });
        }

        const pool = await poolPromise;

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

        res.json(result.recordset);

    } catch (error) {
        console.error("Activity fetch error:", error);

        res.status(500).json({
            message: "Failed to fetch activity"
        });
    }
});
// Get user profile
app.get("/api/profile/:userId", async (req, res) => {

    try {

        const userId = parseInt(req.params.userId);

        if (isNaN(userId)) {
            return res.status(400).json({
                message: "Invalid user ID"
            });
        }

        
        const pool = await poolPromise;
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
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json(result.recordset[0]);

    } catch (error) {

        console.error("Profile error:", error);

        res.status(500).json({
            message: "Failed to fetch profile"
        });
    }
});

// Update user profile
app.put("/api/profile/:userId", async (req, res) => {
    try {

        const userId = parseInt(req.params.userId);

        if (isNaN(userId)) {
            return res.status(400).json({
                message: "Invalid user ID"
            });
        }

        const { age, weight, height, goal } = req.body;

console.log("UPDATE REQUEST BODY:", req.body);
console.log("age:", age);
console.log("weight:", weight);
console.log("height:", height);

if (age === undefined || weight === undefined || height === undefined) {
    console.log("VALIDATION FAILED:", {
        age,
        weight,
        height
    });

    return res.status(400).json({
        message: "Age, weight and height are required"
    });
}

const pool = await poolPromise;

console.log("ABOUT TO UPDATE DATABASE");

await pool
    .request()
    .input("UserID", sql.Int, userId)
    .input("Age", sql.Int, age)
    .input("WeightKg", sql.Decimal(5, 2), weight)
    .input("HeightCm", sql.Decimal(5, 2), height)
    .input("Goal", sql.NVarChar(50), goal) // Add the goal parameter
    .query(`
        UPDATE Profiles
        SET
            Age = @Age,
            WeightKg = @WeightKg,
            HeightCm = @HeightCm,
            Goal = @Goal
        WHERE UserID = @UserID
    `);

console.log("DATABASE UPDATE COMPLETED");

res.json({
    message: "Profile updated successfully"
});

    } catch (error) {

        console.error("Profile update error:", error);

        res.status(500).json({
            message: "Failed to update profile"
        });
    }
});


    
// Start server
app.listen(PORT, () => {
    console.log(`FitHub API running on http://localhost:${PORT}`);
});