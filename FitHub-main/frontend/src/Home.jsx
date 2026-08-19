import { useAppContext } from "./context/AppContext";
import "./Home.css";

function Home() {
  const { user } = useAppContext();
  const consumed = user?.dailyCaloriesConsumed ?? 0;
  const burned = user?.dailyCaloriesBurned ?? 0;
  const net = Math.max(0, consumed - burned);
  const target = user?.dailyCaloriesIntake ?? 2000;
  const progress = Math.min(100, Math.round((net / target) * 100));
  const goal = user?.goal || "maintain";
  const goalText = goal.charAt(0).toUpperCase() + goal.slice(1);

  return (
    <div className="home-page">
      <div className="home-header">
        <div><h1>Dashboard</h1><p>Welcome back, {user?.fullName || "User"}</p></div>
      </div>

      <div className="dashboard-stats">
        <div className="dashboard-stat-card"><div className="dashboard-stat-icon">🔥</div><div>
          <span>Calories Consumed</span><strong>{consumed}</strong><small>kcal today</small>
        </div></div>
        <div className="dashboard-stat-card"><div className="dashboard-stat-icon">⚡</div><div>
          <span>Calories Burned</span><strong>{burned}</strong><small>kcal today</small>
        </div></div>
        <div className="dashboard-stat-card"><div className="dashboard-stat-icon">⚖️</div><div>
          <span>Net Calories</span><strong>{net}</strong><small>consumed − burned</small>
        </div></div>
        <div className="dashboard-stat-card"><div className="dashboard-stat-icon">🏃</div><div>
          <span>Activities</span><strong>{user?.activities ?? 0}</strong><small>completed today</small>
        </div></div>
      </div>

      <div className="dashboard-main">
        <div className="dashboard-card goal-card">
          <div className="dashboard-card-header">
            <div><h2>Today's Goal</h2><p>Net calorie progress toward your daily intake target</p></div>
            <span className="goal-badge">{goalText}</span>
          </div>
          <div className="goal-content">
            <div className="goal-progress-header"><span>{net} / {target} kcal</span><strong>{progress}%</strong></div>
            <div className="progress-bar"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-header"><div><h2>Your Profile</h2><p>Your current information</p></div></div>
          <div className="profile-summary">
            <div><span>Age</span><strong>{user?.age ?? "--"} Years</strong></div>
            <div><span>Weight</span><strong>{user?.weight ?? "--"} Kg</strong></div>
            <div><span>Height</span><strong>{user?.height ?? "--"} Cm</strong></div>
            <div><span>Goal</span><strong>{goalText}</strong></div>
          </div>
        </div>
      </div>

      <div className="dashboard-card activity-card">
        <div className="dashboard-card-header">
          <div><h2>Today's Activity</h2><p>{user?.dailyWorkoutMinutes ?? 0} minutes and {burned} kcal burned today</p></div>
        </div>
        {user?.activities > 0
          ? <div className="activity-item"><div className="activity-icon">🏋️</div><div className="activity-info"><strong>{user.activities} completed exercise{user.activities !== 1 ? "s" : ""}</strong><span>{burned} kcal burned</span></div><div className="activity-status">Completed</div></div>
          : <div className="empty-activity">No exercises completed today. Go to Activity to start a workout.</div>}
      </div>
    </div>
  );
}
export default Home;
