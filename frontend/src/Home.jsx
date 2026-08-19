import { useAppContext } from "./context/AppContext";
import { Link } from "react-router-dom";
import "./Home.css";

function Home() {
    const { user, foodLogs, waterIntake, waterGoal } = useAppContext();

    // Calculate total calories from logged foods
    const totalFoodCalories = foodLogs.reduce((sum, f) => sum + (Number(f.calories) || 0), 0);
    const caloriesConsumed = totalFoodCalories > 0 ? totalFoodCalories : (user?.dailyCaloriesIntake ?? 2000);
    const caloriesBurned = user?.dailyCalorieBurn ?? 400;
    const activities = user?.activities ?? 0;

    const goal = user?.goal || "maintain";
    const goalText = goal.charAt(0).toUpperCase() + goal.slice(1);

    const heightInM = (user?.height || 175) / 100;
    const currentWeight = user?.weight || 72.5;
    const bmi = Number((currentWeight / (heightInM * heightInM)).toFixed(1));

    const waterPercent = Math.min(Math.round(((waterIntake || 0) / (waterGoal || 2500)) * 100), 100);

    return (
        <div className="home-page">
            {/* HEADER */}
            <div className="home-header">
                <div>
                    <h1>Dashboard</h1>
                    <p>Welcome back, {user?.fullName || "User"}</p>
                </div>
            </div>

            {/* STAT CARDS (4-GRID) */}
            <div className="dashboard-stats" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
                {/* CALORIES CONSUMED */}
                <div className="dashboard-stat-card">
                    <div className="dashboard-stat-icon">🔥</div>
                    <div>
                        <span>Calories Consumed</span>
                        <strong>{caloriesConsumed}</strong>
                        <small>kcal</small>
                    </div>
                </div>

                {/* CALORIES BURNED */}
                <div className="dashboard-stat-card">
                    <div className="dashboard-stat-icon">⚡</div>
                    <div>
                        <span>Calories Burned</span>
                        <strong>{caloriesBurned}</strong>
                        <small>kcal</small>
                    </div>
                </div>

                {/* WATER INTAKE */}
                <div className="dashboard-stat-card">
                    <div className="dashboard-stat-icon" style={{ background: "#0c3149" }}>💧</div>
                    <div>
                        <span>Water Intake</span>
                        <strong style={{ color: "#38bdf8" }}>{waterIntake || 0}</strong>
                        <small>/ {waterGoal || 2500} ml</small>
                    </div>
                </div>

                {/* WEIGHT & BMI */}
                <div className="dashboard-stat-card">
                    <div className="dashboard-stat-icon" style={{ background: "#063b36" }}>📊</div>
                    <div>
                        <span>Weight & BMI</span>
                        <strong>{currentWeight} kg</strong>
                        <small>(BMI {bmi})</small>
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="dashboard-main">
                {/* GOAL CARD */}
                <div className="dashboard-card goal-card">
                    <div className="dashboard-card-header">
                        <div>
                            <h2>Today's Goal</h2>
                            <p>Keep working toward your fitness milestones</p>
                        </div>
                        <span className="goal-badge">{goalText}</span>
                    </div>

                    <div className="goal-content">
                        <div className="goal-progress-header">
                            <span>Hydration Progress ({waterIntake || 0} / {waterGoal || 2500} ml)</span>
                            <strong style={{ color: "#38bdf8" }}>{waterPercent}%</strong>
                        </div>
                        <div className="progress-bar">
                            <div
                                className="progress-fill"
                                style={{ width: `${waterPercent}%`, background: "linear-gradient(90deg, #0284c7, #38bdf8)" }}
                            ></div>
                        </div>

                        <div className="goal-progress-header" style={{ marginTop: "18px" }}>
                            <span>Nutrition Intake ({caloriesConsumed} / 2000 kcal)</span>
                            <strong>{Math.min(Math.round((caloriesConsumed / 2000) * 100), 100)}%</strong>
                        </div>
                        <div className="progress-bar">
                            <div
                                className="progress-fill"
                                style={{ width: `${Math.min(Math.round((caloriesConsumed / 2000) * 100), 100)}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* PROFILE SUMMARY */}
                <div className="dashboard-card">
                    <div className="dashboard-card-header">
                        <div>
                            <h2>Your Health Profile</h2>
                            <p>Current metrics & measurements</p>
                        </div>
                    </div>

                    <div className="profile-summary">
                        <div>
                            <span>Age</span>
                            <strong>{user?.age ?? "--"} Years</strong>
                        </div>
                        <div>
                            <span>Weight</span>
                            <strong>{user?.weight ?? "--"} Kg</strong>
                        </div>
                        <div>
                            <span>Height</span>
                            <strong>{user?.height ?? "--"} Cm</strong>
                        </div>
                        <div>
                            <span>Activity Level</span>
                            <strong>{user?.activityLevel ?? "Moderate"}</strong>
                        </div>
                    </div>
                </div>
            </div>

            {/* ACTIVITY & QUICK SHORTCUTS SECTION */}
            <div className="dashboard-card activity-card">
                <div className="dashboard-card-header">
                    <div>
                        <h2>Today's Activity & Quick Actions</h2>
                        <p>Track your workout plan or log nutrition</p>
                    </div>
                </div>

                {activities > 0 ? (
                    <div className="activity-item">
                        <div className="activity-icon">🏋️</div>
                        <div className="activity-info">
                            <strong>Full Body Workout Plan</strong>
                            <span>{activities} exercises scheduled today</span>
                        </div>
                        <Link to="/activity" className="activity-status" style={{ textDecoration: "none" }}>
                            Start Workout →
                        </Link>
                    </div>
                ) : (
                    <div className="empty-activity">
                        No activities scheduled today.
                    </div>
                )}
            </div>
        </div>
    );
}

export default Home;