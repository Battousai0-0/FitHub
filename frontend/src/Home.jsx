import { useAppContext } from "./context/AppContext";
import "./Home.css";

function Home() {

    const { user } = useAppContext();

    const caloriesConsumed = user?.dailyCaloriesIntake ?? 2000;
    const caloriesBurned = user?.dailyCalorieBurn ?? 400;
    const activities = user?.activities ?? 0;

    const goal = user?.goal || "maintain";
    const goalText =
        goal.charAt(0).toUpperCase() + goal.slice(1);

    return (
        <div className="home-page">

            {/* HEADER */}
            <div className="home-header">

                <div>
                    <h1>Dashboard</h1>

                    <p>
                        Welcome back, {user?.fullName || "User"}
                    </p>
                </div>

            </div>


            {/* STAT CARDS */}
            <div className="dashboard-stats">

                <div className="dashboard-stat-card">

                    <div className="dashboard-stat-icon">
                        🔥
                    </div>

                    <div>
                        <span>Calories Consumed</span>

                        <strong>
                            {caloriesConsumed}
                        </strong>

                        <small>kcal</small>
                    </div>

                </div>


                <div className="dashboard-stat-card">

                    <div className="dashboard-stat-icon">
                        ⚡
                    </div>

                    <div>
                        <span>Calories Burned</span>

                        <strong>
                            {caloriesBurned}
                        </strong>

                        <small>kcal</small>
                    </div>

                </div>


                <div className="dashboard-stat-card">

                    <div className="dashboard-stat-icon">
                        🏃
                    </div>

                    <div>
                        <span>Activities</span>

                        <strong>
                            {activities}
                        </strong>

                        <small>completed</small>
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

                            <p>
                                Keep working toward your fitness goal
                            </p>
                        </div>

                        <span className="goal-badge">
                            {goalText}
                        </span>

                    </div>


                    <div className="goal-content">

                        <div className="goal-progress-header">

                            <span>Daily Progress</span>

                            <strong>70%</strong>

                        </div>

                        <div className="progress-bar">

                            <div
                                className="progress-fill"
                                style={{ width: "70%" }}
                            ></div>

                        </div>

                    </div>

                </div>


                {/* PROFILE SUMMARY */}
                <div className="dashboard-card">

                    <div className="dashboard-card-header">

                        <div>
                            <h2>Your Profile</h2>

                            <p>
                                Your current information
                            </p>
                        </div>

                    </div>


                    <div className="profile-summary">

                        <div>
                            <span>Age</span>
                            <strong>
                                {user?.age ?? "--"} Years
                            </strong>
                        </div>

                        <div>
                            <span>Weight</span>
                            <strong>
                                {user?.weight ?? "--"} Kg
                            </strong>
                        </div>

                        <div>
                            <span>Height</span>
                            <strong>
                                {user?.height ?? "--"} Cm
                            </strong>
                        </div>

                        <div>
                            <span>Activity Level</span>
                            <strong>
                                {user?.activityLevel ?? "--"}
                            </strong>
                        </div>

                    </div>

                </div>

            </div>


            {/* ACTIVITY SECTION */}
            <div className="dashboard-card activity-card">

                <div className="dashboard-card-header">

                    <div>
                        <h2>Today's Activity</h2>

                        <p>
                            Your latest workout activity
                        </p>
                    </div>

                </div>


                {activities > 0 ? (

                    <div className="activity-item">

                        <div className="activity-icon">
                            🏋️
                        </div>

                        <div className="activity-info">

                            <strong>
                                Workout Activity
                            </strong>

                            <span>
                                {activities} exercise
                                {activities !== 1 ? "s" : ""} planned
                            </span>

                        </div>

                        <div className="activity-status">
                            Active
                        </div>

                    </div>

                ) : (

                    <div className="empty-activity">
                        No activities yet.
                    </div>

                )}

            </div>

        </div>
    );
}

export default Home;