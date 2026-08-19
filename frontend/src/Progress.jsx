import { useState, useMemo } from "react";
import { useAppContext } from "./context/AppContext";
import "./Progress.css";

function Progress() {
  const { user, progressLogs, addProgressLog, deleteProgressLog } = useAppContext();

  const [weightInput, setWeightInput] = useState("");
  const [bodyFatInput, setBodyFatInput] = useState("");
  const [notesInput, setNotesInput] = useState("");
  const [dateInput, setDateInput] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const currentHeight = user?.height ? Number(user.height) : 175;
  const currentWeight = user?.weight ? Number(user.weight) : 72.5;
  const userAge = user?.age ? Number(user.age) : 26;
  const userGender = user?.gender || "Male";
  const userGoal = user?.goal || "maintain";

  // Calculate BMI: weight (kg) / [height (m)]^2
  const bmiValue = useMemo(() => {
    if (!currentHeight || currentHeight <= 0 || !currentWeight || currentWeight <= 0) return 0;
    const heightInMeters = currentHeight / 100;
    return Number((currentWeight / (heightInMeters * heightInMeters)).toFixed(1));
  }, [currentHeight, currentWeight]);

  // Determine BMI Category & color
  const bmiInfo = useMemo(() => {
    if (bmiValue <= 0) return { category: "Unknown", color: "#94a3b8", description: "Enter height & weight" };
    if (bmiValue < 18.5) return { category: "Underweight", color: "#38bdf8", description: "Below healthy weight range" };
    if (bmiValue < 25.0) return { category: "Normal Weight", color: "#00d68f", description: "Healthy weight range" };
    if (bmiValue < 30.0) return { category: "Overweight", color: "#fbbf24", description: "Above healthy weight range" };
    return { category: "Obese", color: "#f87171", description: "Significantly above healthy range" };
  }, [bmiValue]);

  // Healthy Weight Range: 18.5 to 24.9 BMI
  const healthyWeightRange = useMemo(() => {
    if (!currentHeight || currentHeight <= 0) return { min: 50, max: 75 };
    const heightInMeters = currentHeight / 100;
    const min = (18.5 * heightInMeters * heightInMeters).toFixed(1);
    const max = (24.9 * heightInMeters * heightInMeters).toFixed(1);
    return { min, max };
  }, [currentHeight]);

  // Calculate BMR (Mifflin-St Jeor)
  const bmrValue = useMemo(() => {
    if (!currentWeight || !currentHeight || !userAge) return 1700;
    if (userGender.toLowerCase() === "female") {
      return Math.round(10 * currentWeight + 6.25 * currentHeight - 5 * userAge - 161);
    }
    return Math.round(10 * currentWeight + 6.25 * currentHeight - 5 * userAge + 5);
  }, [currentWeight, currentHeight, userAge, userGender]);

  // Total weight change calculation
  const weightStats = useMemo(() => {
    if (!progressLogs || progressLogs.length === 0) {
      return { change: 0, initial: currentWeight, latest: currentWeight };
    }
    const sorted = [...progressLogs].sort((a, b) => new Date(a.Date) - new Date(b.Date));
    const first = sorted[0]?.Weight || currentWeight;
    const latest = sorted[sorted.length - 1]?.Weight || currentWeight;
    const change = Number((latest - first).toFixed(1));
    return { change, initial: first, latest };
  }, [progressLogs, currentWeight]);

  const handleAddLog = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const weightNum = parseFloat(weightInput);
    if (!weightNum || weightNum <= 20 || weightNum > 300) {
      setError("Please enter a valid weight between 20kg and 300kg.");
      return;
    }

    const bodyFatNum = bodyFatInput ? parseFloat(bodyFatInput) : null;
    if (bodyFatNum !== null && (bodyFatNum < 3 || bodyFatNum > 60)) {
      setError("Body fat percentage must be between 3% and 60%.");
      return;
    }

    try {
      await addProgressLog({
        weight: weightNum,
        height: currentHeight,
        bodyFat: bodyFatNum,
        notes: notesInput.trim() || "Weight check-in",
        date: dateInput || new Date().toISOString().split("T")[0]
      });

      setWeightInput("");
      setBodyFatInput("");
      setNotesInput("");
      setSuccess("Weight & progress entry logged successfully!");
      setTimeout(() => setSuccess(""), 4000);
    } catch {
      setError("Failed to save progress entry.");
    }
  };

  const handleDelete = (progressId) => {
    deleteProgressLog(progressId);
  };

  return (
    <div className="progress-page">
      {/* HEADER */}
      <div className="progress-page-header">
        <div>
          <h1>Progress & Body Tracking</h1>
          <p>Monitor your weight trajectory, BMI metrics, and fitness milestones</p>
        </div>
      </div>

      {/* METRIC OVERVIEW CARDS */}
      <div className="progress-metrics-grid">
        {/* CURRENT WEIGHT CARD */}
        <div className="metric-card">
          <div className="metric-card-header">
            <span className="metric-icon">⚖️</span>
            <span className="metric-label">Current Weight</span>
          </div>
          <div className="metric-value-row">
            <strong>{currentWeight}</strong>
            <span>kg</span>
          </div>
          <div className="metric-footer">
            <span>Goal: {userGoal.toUpperCase()}</span>
            <span className={`weight-diff ${weightStats.change < 0 ? "diff-down" : weightStats.change > 0 ? "diff-up" : ""}`}>
              {weightStats.change > 0 ? `+${weightStats.change}` : weightStats.change} kg total
            </span>
          </div>
        </div>

        {/* BMI CARD */}
        <div className="metric-card">
          <div className="metric-card-header">
            <span className="metric-icon">📊</span>
            <span className="metric-label">Body Mass Index (BMI)</span>
          </div>
          <div className="metric-value-row">
            <strong style={{ color: bmiInfo.color }}>{bmiValue}</strong>
            <span className="bmi-badge" style={{ backgroundColor: `${bmiInfo.color}22`, color: bmiInfo.color, borderColor: bmiInfo.color }}>
              {bmiInfo.category}
            </span>
          </div>
          <div className="metric-footer">
            <span>Ideal range: {healthyWeightRange.min} - {healthyWeightRange.max} kg</span>
          </div>
        </div>

        {/* BMR CARD */}
        <div className="metric-card">
          <div className="metric-card-header">
            <span className="metric-icon">⚡</span>
            <span className="metric-label">Basal Metabolic Rate (BMR)</span>
          </div>
          <div className="metric-value-row">
            <strong>{bmrValue}</strong>
            <span>kcal/day</span>
          </div>
          <div className="metric-footer">
            <span>Calories burned at rest</span>
          </div>
        </div>

        {/* LOGGED ENTRIES COUNT */}
        <div className="metric-card">
          <div className="metric-card-header">
            <span className="metric-icon">📈</span>
            <span className="metric-label">Tracking History</span>
          </div>
          <div className="metric-value-row">
            <strong>{progressLogs.length}</strong>
            <span>entries</span>
          </div>
          <div className="metric-footer">
            <span>Height: {currentHeight} cm</span>
          </div>
        </div>
      </div>

      {/* MAIN TWO-COLUMN CONTENT */}
      <div className="progress-content-grid">
        {/* LEFT: LOG WEIGHT FORM */}
        <div className="progress-card log-card">
          <div className="card-title-row">
            <h2>Log New Progress</h2>
            <span className="subtitle">Record weight & body metrics</span>
          </div>

          {error && <div className="progress-alert alert-error">{error}</div>}
          {success && <div className="progress-alert alert-success">{success}</div>}

          <form onSubmit={handleAddLog} className="progress-form">
            <div className="form-row">
              <label>
                Weight (kg) *
                <input
                  type="number"
                  step="0.1"
                  min="20"
                  max="300"
                  placeholder="e.g. 72.5"
                  value={weightInput}
                  onChange={(e) => setWeightInput(e.target.value)}
                  required
                />
              </label>

              <label>
                Body Fat % (optional)
                <input
                  type="number"
                  step="0.1"
                  min="3"
                  max="60"
                  placeholder="e.g. 17.5"
                  value={bodyFatInput}
                  onChange={(e) => setBodyFatInput(e.target.value)}
                />
              </label>
            </div>

            <div className="form-row">
              <label>
                Date
                <input
                  type="date"
                  value={dateInput}
                  onChange={(e) => setDateInput(e.target.value)}
                  required
                />
              </label>

              <label>
                Notes / Milestone
                <input
                  type="text"
                  placeholder="e.g. Post-workout, feeling great"
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                />
              </label>
            </div>

            <button type="submit" className="log-submit-btn">
              ➕ Record Entry
            </button>
          </form>

          {/* BMI VISUAL SCALE */}
          <div className="bmi-scale-section">
            <h3>BMI Category Scale</h3>
            <div className="bmi-bar">
              <div className="bmi-segment underweight" title="Underweight: < 18.5">
                <span>&lt; 18.5</span>
              </div>
              <div className="bmi-segment normal" title="Normal: 18.5 - 24.9">
                <span>18.5 - 24.9</span>
              </div>
              <div className="bmi-segment overweight" title="Overweight: 25 - 29.9">
                <span>25.0 - 29.9</span>
              </div>
              <div className="bmi-segment obese" title="Obese: ≥ 30">
                <span>&ge; 30.0</span>
              </div>
            </div>
            <div className="bmi-legend">
              <span>🔵 Underweight</span>
              <span>🟢 Normal (Healthy)</span>
              <span>🟡 Overweight</span>
              <span>🔴 Obese</span>
            </div>
          </div>
        </div>

        {/* RIGHT: PROGRESS HISTORY TABLE */}
        <div className="progress-card history-card">
          <div className="card-title-row">
            <h2>Weight & Metric History</h2>
            <span className="subtitle">{progressLogs.length} total recorded entries</span>
          </div>

          {progressLogs.length === 0 ? (
            <div className="empty-history">
              <p>No progress records logged yet.</p>
              <small>Log your first weight entry above to begin tracking your journey.</small>
            </div>
          ) : (
            <div className="progress-table-container">
              <table className="progress-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Weight</th>
                    <th>BMI</th>
                    <th>Body Fat</th>
                    <th>Notes</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {progressLogs.map((log) => (
                    <tr key={log.ProgressID || log.id}>
                      <td className="date-cell">{log.Date ? String(log.Date).split("T")[0] : "Today"}</td>
                      <td className="weight-cell">
                        <strong>{log.Weight}</strong> kg
                      </td>
                      <td className="bmi-cell">
                        {log.BMI ? (
                          <span className="table-bmi-badge">{log.BMI}</span>
                        ) : (
                          "--"
                        )}
                      </td>
                      <td>{log.BodyFat ? `${log.BodyFat}%` : "--"}</td>
                      <td className="notes-cell">{log.Notes || "--"}</td>
                      <td>
                        <button
                          className="delete-log-btn"
                          title="Delete entry"
                          onClick={() => handleDelete(log.ProgressID || log.id)}
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Progress;
