const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const { pool } = require("./db");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const todayFilter = (column = "CreatedAt") => `DATE(${column}) = CURDATE()`;

app.get("/", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ message: "FitHub API is running", database: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Database connection failed", database: false });
  }
});

// ---------------- AUTH ----------------
app.post("/api/auth/signup", async (req, res) => {
  try {
    const username = String(req.body.username || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!username || !email || !password)
      return res.status(400).json({ message: "Username, email and password are required" });
    if (password.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters" });

    const [existing] = await pool.query(
      "SELECT UserID FROM Users WHERE LOWER(Email)=? OR Username=?",
      [email, username]
    );
    if (existing.length)
      return res.status(409).json({ message: "An account with that email or username already exists" });

    const passwordHash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      "INSERT INTO Users (Username, Email, PasswordHash) VALUES (?, ?, ?)",
      [username, email, passwordHash]
    );
    await pool.query("INSERT INTO Profiles (UserID, Onboarded) VALUES (?, 0)", [result.insertId]);

    res.status(201).json({ userId: result.insertId, username, email, onboarded: false });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Failed to create account" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required" });

    const [rows] = await pool.query(
      `SELECT u.UserID, u.Username, u.Email, u.PasswordHash, COALESCE(p.Onboarded,0) Onboarded
       FROM Users u LEFT JOIN Profiles p ON p.UserID=u.UserID
       WHERE LOWER(u.Email)=?`,
      [email]
    );
    if (!rows.length)
      return res.status(401).json({ message: "Invalid email or password" });

    const account = rows[0];
    if (!(await bcrypt.compare(password, account.PasswordHash)))
      return res.status(401).json({ message: "Invalid email or password" });

    res.json({
      userId: account.UserID,
      username: account.Username,
      email: account.Email,
      onboarded: !!account.Onboarded
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Failed to log in" });
  }
});

// ---------------- PROFILE / ONBOARDING ----------------
app.put("/api/onboarding/:userId", async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const age = Number(req.body.age);
    const weight = Number(req.body.weight);
    const height = req.body.height == null || req.body.height === "" ? null : Number(req.body.height);
    const goal = String(req.body.goal || "");
    const dailyCalorieIntake = Number(req.body.dailyCalorieIntake);
    const dailyCalorieBurn = Number(req.body.dailyCalorieBurn);

    if (!Number.isInteger(userId) || !age || !weight || !goal)
      return res.status(400).json({ message: "Age, weight and goal are required" });

    await pool.query(
      `UPDATE Profiles SET Age=?, WeightKg=?, HeightCm=?, Goal=?,
       DailyCalorieIntake = ?, DailyCalorieBurn = ?, Onboarded = 1 WHERE UserID = ?`,
      [age, weight, height, goal,
       dailyCalorieIntake > 0 ? dailyCalorieIntake : 2000,
       dailyCalorieBurn >= 0 ? dailyCalorieBurn : 600, userId]
    );
    res.json({ message: "Onboarding complete" });
  } catch (error) {
    console.error("Onboarding error:", error);
    res.status(500).json({ message: "Failed to save onboarding data" });
  }
});

app.get("/api/profile/:userId", async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    if (!Number.isInteger(userId)) return res.status(400).json({ message: "Invalid user ID" });

    const [rows] = await pool.query(
      `SELECT u.UserID,u.Username,u.Email,u.CreatedAt,
              p.ProfileID,p.Age,p.Gender,p.HeightCm,p.WeightKg,p.ActivityLevel,p.Goal,
              p.DailyCalorieIntake,p.DailyCalorieBurn,p.Onboarded,
              (SELECT COUNT(*) FROM ActivityLogs al WHERE al.UserID=u.UserID AND ${todayFilter("al.CompletedAt")}) ActivityCount,
              (SELECT COALESCE(SUM(fl.Calories),0) FROM FoodLogs fl WHERE fl.UserID=u.UserID AND ${todayFilter("fl.LoggedAt")}) DailyCaloriesConsumed,
              (SELECT COALESCE(SUM(al.CaloriesBurned),0) FROM ActivityLogs al WHERE al.UserID=u.UserID AND ${todayFilter("al.CompletedAt")}) DailyCaloriesBurned,
              (SELECT COALESCE(SUM(al.DurationMinutes),0) FROM ActivityLogs al WHERE al.UserID=u.UserID AND ${todayFilter("al.CompletedAt")}) DailyWorkoutMinutes,
              (SELECT COUNT(*) FROM FoodLogs fl WHERE fl.UserID=u.UserID AND ${todayFilter("fl.LoggedAt")}) FoodEntryCount
       FROM Users u LEFT JOIN Profiles p ON p.UserID=u.UserID WHERE u.UserID=?`,
      [userId]
    );
    if (!rows.length) return res.status(404).json({ message: "User not found" });
    res.json(rows[0]);
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
});

app.put("/api/profile/:userId", async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const { age, weight, height, goal } = req.body;
    if (!Number.isInteger(userId) || !age || !weight || !goal)
      return res.status(400).json({ message: "Age, weight and goal are required" });

    const normalizedHeight = height === null || height === "" || height === undefined ? null : Number(height);
    await pool.query(
      `UPDATE Profiles SET Age=?,WeightKg=?,HeightCm=?,Goal=? WHERE UserID=?`,
      [Number(age), Number(weight), normalizedHeight, goal, userId]
    );
    res.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ message: "Failed to update profile" });
  }
});

// ---------------- FOOD ----------------
app.get("/api/food/:userId", async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const [rows] = await pool.query(
      `SELECT FoodLogID,FoodName,Calories,Protein,Carbs,Fat,LoggedAt
       FROM FoodLogs WHERE UserID=? AND ${todayFilter("LoggedAt")} ORDER BY LoggedAt DESC`,
      [userId]
    );
    res.json(rows);
  } catch (error) {
    console.error("Food fetch error:", error);
    res.status(500).json({ message: "Failed to fetch food logs" });
  }
});

app.post("/api/food/:userId", async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const foodName = String(req.body.foodName || "").trim();
    const calories = Number(req.body.calories);
    const protein = Number(req.body.protein) || 0;
    const carbs = Number(req.body.carbs) || 0;
    const fat = Number(req.body.fat) || 0;

    if (!Number.isInteger(userId) || !foodName || !Number.isFinite(calories) || calories < 0)
      return res.status(400).json({ message: "Food name and valid calories are required" });

    const [result] = await pool.query(
      `INSERT INTO FoodLogs(UserID,FoodName,Calories,Protein,Carbs,Fat) VALUES(?,?,?,?,?,?)`,
      [userId, foodName, Math.round(calories), protein, carbs, fat]
    );
    res.status(201).json({ FoodLogID: result.insertId });
  } catch (error) {
    console.error("Food add error:", error);
    res.status(500).json({ message: "Failed to add food" });
  }
});

app.delete("/api/food/:userId/:foodId", async (req, res) => {
  try {
    await pool.query("DELETE FROM FoodLogs WHERE FoodLogID=? AND UserID=?",
      [Number(req.params.foodId), Number(req.params.userId)]);
    res.json({ message: "Food entry deleted" });
  } catch (error) {
    console.error("Food delete error:", error);
    res.status(500).json({ message: "Failed to delete food" });
  }
});

// ---------------- EXERCISES / WORKOUTS ----------------
app.get("/api/exercises", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT ExerciseID,ExerciseName,MuscleGroup,MET FROM Exercises ORDER BY ExerciseName"
    );
    res.json(rows);
  } catch (error) {
    console.error("Exercises error:", error);
    res.status(500).json({ message: "Failed to fetch exercises" });
  }
});

app.post("/api/exercises", async (req, res) => {
  try {
    const name = String(req.body.exerciseName || "").trim();
    const muscleGroup = String(req.body.muscleGroup || "").trim();
    const met = Number(req.body.met) || 5;
    if (!name) return res.status(400).json({ message: "Exercise name is required" });

    const [result] = await pool.query(
      "INSERT INTO Exercises(ExerciseName,MuscleGroup,MET) VALUES(?,?,?)",
      [name, muscleGroup || null, met]
    );
    res.status(201).json({ ExerciseID: result.insertId, ExerciseName: name, MuscleGroup: muscleGroup, MET: met });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") return res.status(409).json({ message: "That exercise already exists" });
    console.error("Exercise add error:", error);
    res.status(500).json({ message: "Failed to add exercise" });
  }
});

app.get("/api/activity/:userId", async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const [rows] = await pool.query(
      `SELECT wp.WorkoutPlanID,wp.UserID,wp.PlanName,wp.Description,wp.Difficulty,
              wpe.WorkoutPlanExerciseID,wpe.ExerciseID,e.ExerciseName,e.MuscleGroup,e.MET,
              wpe.Sets,wpe.Repetitions,wpe.DurationMinutes,
              EXISTS(SELECT 1 FROM ActivityLogs al
                     WHERE al.UserID=? AND al.WorkoutPlanExerciseID=wpe.WorkoutPlanExerciseID
                     AND ${todayFilter("al.CompletedAt")}) CompletedToday
       FROM WorkoutPlans wp
       LEFT JOIN WorkoutPlanExercises wpe ON wp.WorkoutPlanID=wpe.WorkoutPlanID
       LEFT JOIN Exercises e ON e.ExerciseID=wpe.ExerciseID
       WHERE wp.UserID=? ORDER BY wp.WorkoutPlanID,wpe.WorkoutPlanExerciseID`,
      [userId, userId]
    );
    res.json(rows);
  } catch (error) {
    console.error("Activity fetch error:", error);
    res.status(500).json({ message: "Failed to fetch activity" });
  }
});

app.post("/api/workouts/:userId", async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const userId = Number(req.params.userId);
    const { planName, description, difficulty } = req.body;
    // The frontend historically called this field `items`; accept both names for compatibility.
    const exercises = Array.isArray(req.body.exercises) ? req.body.exercises : req.body.items;
    if (!Number.isInteger(userId) || !String(planName || "").trim() || !Array.isArray(exercises) || !exercises.length)
      return res.status(400).json({ message: "Plan name and at least one exercise are required" });

    await connection.beginTransaction();
    const [plan] = await connection.query(
      "INSERT INTO WorkoutPlans(UserID,PlanName,Description,Difficulty) VALUES(?,?,?,?)",
      [userId, String(planName).trim(), description || null, difficulty || null]
    );

    for (const item of exercises) {
      const exerciseId = Number(item.exerciseId);
      if (!exerciseId) throw new Error("Invalid exercise ID");
      await connection.query(
        `INSERT INTO WorkoutPlanExercises(WorkoutPlanID,ExerciseID,Sets,Repetitions,DurationMinutes)
         VALUES(?,?,?,?,?)`,
        [plan.insertId, exerciseId, Number(item.sets) || 0, Number(item.repetitions) || 0, Number(item.durationMinutes) || 0]
      );
    }
    await connection.commit();
    res.status(201).json({ workoutPlanId: plan.insertId, planName: String(planName).trim(), message: "Workout created successfully" });
  } catch (error) {
    await connection.rollback();
    console.error("Workout create error:", error);
    res.status(500).json({ message: "Failed to create workout" });
  } finally {
    connection.release();
  }
});

app.post("/api/activity/:userId/complete", async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const workoutPlanExerciseId = Number(req.body.workoutPlanExerciseId);
    const durationMinutes = Number(req.body.durationMinutes);

    if (!Number.isInteger(userId) || !Number.isInteger(workoutPlanExerciseId))
      return res.status(400).json({ message: "Invalid activity data" });

    const [rows] = await pool.query(
      `SELECT wpe.WorkoutPlanExerciseID,wpe.DurationMinutes,e.ExerciseID,e.MET,p.WeightKg
       FROM WorkoutPlanExercises wpe
       JOIN WorkoutPlans wp ON wp.WorkoutPlanID=wpe.WorkoutPlanID
       JOIN Exercises e ON e.ExerciseID=wpe.ExerciseID
       JOIN Profiles p ON p.UserID=wp.UserID
       WHERE wpe.WorkoutPlanExerciseID=? AND wp.UserID=?`,
      [workoutPlanExerciseId, userId]
    );
    if (!rows.length) return res.status(404).json({ message: "Workout exercise not found" });

    const row = rows[0];
    const minutes = durationMinutes > 0 ? durationMinutes : Number(row.DurationMinutes || 0);
    const weight = Number(row.WeightKg || 0);
    const met = Number(row.MET || 5);
    const calories = Math.max(0, Math.round(met * 3.5 * weight / 200 * minutes));

    const [existing] = await pool.query(
      `SELECT ActivityLogID FROM ActivityLogs
       WHERE UserID=? AND WorkoutPlanExerciseID=? AND ${todayFilter("CompletedAt")}`,
      [userId, workoutPlanExerciseId]
    );

    if (existing.length) {
      await pool.query(
        "UPDATE ActivityLogs SET CaloriesBurned=?,DurationMinutes=?,CompletedAt=CURRENT_TIMESTAMP WHERE ActivityLogID=?",
        [calories, minutes, existing[0].ActivityLogID]
      );
    } else {
      await pool.query(
        `INSERT INTO ActivityLogs(UserID,WorkoutPlanExerciseID,ExerciseID,CaloriesBurned,DurationMinutes)
         VALUES(?,?,?,?,?)`,
        [userId, workoutPlanExerciseId, row.ExerciseID, calories, minutes]
      );
    }

    res.json({ message: "Exercise completed", caloriesBurned: calories, durationMinutes: minutes });
  } catch (error) {
    console.error("Activity complete error:", error);
    res.status(500).json({ message: "Failed to complete exercise" });
  }
});

app.get("/api/activity-summary/:userId", async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const [rows] = await pool.query(
      `SELECT COUNT(*) ExercisesCompleted,
              COALESCE(SUM(CaloriesBurned),0) CaloriesBurned,
              COALESCE(SUM(DurationMinutes),0) WorkoutMinutes
       FROM ActivityLogs WHERE UserID=? AND ${todayFilter("CompletedAt")}`,
      [userId]
    );
    res.json(rows[0]);
  } catch (error) {
    console.error("Activity summary error:", error);
    res.status(500).json({ message: "Failed to fetch activity summary" });
  }
});

if (require.main === module) {
  app.listen(PORT, () => console.log(`FitHub API running on http://localhost:${PORT}`));
}

module.exports = app;
