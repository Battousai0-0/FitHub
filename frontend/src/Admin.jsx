import { useState, useEffect } from "react";
import "./Admin.css";

function Admin() {
  const [activeTab, setActiveTab] = useState("users"); // "users", "trainers", "exercises"

  // Data states
  const [stats, setStats] = useState({
    totalUsers: 6,
    totalTrainers: 3,
    pendingTrainers: 2,
    totalExercises: 7,
    engagementRate: "88.4%"
  });

  const [users, setUsers] = useState([
    { id: 1, name: "Demo User", email: "user@fithub.com", role: "User", status: "Active", joinDate: "2026-06-15" },
    { id: 2, name: "Marcus Vance", email: "marcus@gympro.com", role: "Trainer", status: "Active", joinDate: "2026-06-20" },
    { id: 3, name: "Elena Rostova", email: "elena.fitness@fit.io", role: "Trainer", status: "Pending", joinDate: "2026-07-01" },
    { id: 4, name: "Sarah Jenkins", email: "sarah.j@gmail.com", role: "User", status: "Active", joinDate: "2026-07-04" },
    { id: 5, name: "David Kim", email: "dkim@workout.net", role: "User", status: "Suspended", joinDate: "2026-07-10" },
    { id: 6, name: "Alex Mercer", email: "admin@fithub.com", role: "Admin", status: "Active", joinDate: "2026-01-01" }
  ]);

  const [trainers, setTrainers] = useState([
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
  ]);

  const [exercises, setExercises] = useState([
    { id: 1, name: "Push-ups", muscleGroup: "Chest", difficulty: "Beginner", equipment: "Bodyweight", instructions: "Keep back straight, lower chest to floor, and push back up explosively." },
    { id: 2, name: "Barbell Squats", muscleGroup: "Legs", difficulty: "Intermediate", equipment: "Barbell", instructions: "Lower hips below knees keeping chest upright, then drive upward through midfoot." },
    { id: 3, name: "Pull-ups", muscleGroup: "Back", difficulty: "Intermediate", equipment: "Pull-up Bar", instructions: "Hang with overhand grip, engage lats, and pull chin clearly over the bar." },
    { id: 4, name: "Dumbbell Shoulder Press", muscleGroup: "Shoulders", difficulty: "Beginner", equipment: "Dumbbells", instructions: "Press dumbbells overhead smoothly from shoulder height until arms are fully extended." },
    { id: 5, name: "Plank", muscleGroup: "Core", difficulty: "Beginner", equipment: "Bodyweight", instructions: "Maintain a rigid plank posture on forearms and toes with tight abdominal bracing." },
    { id: 6, name: "Barbell Deadlift", muscleGroup: "Back", difficulty: "Advanced", equipment: "Barbell", instructions: "Hinge at hips, grip bar, drive through heels keeping neutral spine throughout movement." },
    { id: 7, name: "Dumbbell Bicep Curls", muscleGroup: "Arms", difficulty: "Beginner", equipment: "Dumbbells", instructions: "Curl weights towards shoulders while keeping elbows pinned to sides." }
  ]);

  // Search & Filter states
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("All");
  const [exerciseSearch, setExerciseSearch] = useState("");
  const [exerciseMuscleFilter, setExerciseMuscleFilter] = useState("All");

  // Form states for adding/editing exercises
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [editingExercise, setEditingExercise] = useState(null);
  const [exerciseForm, setExerciseForm] = useState({
    name: "",
    muscleGroup: "Chest",
    difficulty: "Beginner",
    equipment: "Bodyweight",
    instructions: ""
  });

  const [notification, setNotification] = useState("");

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 3500);
  };

  // Fetch initial admin data from backend API
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [statsRes, usersRes, trainersRes, exercisesRes] = await Promise.all([
          fetch("http://localhost:5000/api/admin/stats"),
          fetch("http://localhost:5000/api/admin/users"),
          fetch("http://localhost:5000/api/admin/trainers"),
          fetch("http://localhost:5000/api/admin/exercises")
        ]);

        if (statsRes.ok) setStats(await statsRes.json());
        if (usersRes.ok) setUsers(await usersRes.json());
        if (trainersRes.ok) setTrainers(await trainersRes.json());
        if (exercisesRes.ok) setExercises(await exercisesRes.json());
      } catch {
        // Fallback already pre-initialized
      }
    };

    fetchAdminData();
  }, []);

  // User Actions: Suspend / Activate
  const handleToggleUserStatus = async (userId) => {
    const target = users.find((u) => u.id === userId);
    if (!target) return;
    const newStatus = target.status === "Active" ? "Suspended" : "Active";

    setUsers(users.map((u) => (u.id === userId ? { ...u, status: newStatus } : u)));
    showToast(`User "${target.name}" status changed to ${newStatus}`);

    try {
      await fetch(`http://localhost:5000/api/admin/users/${userId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
    } catch {
      // Local state updated
    }
  };

  // User Actions: Delete
  const handleDeleteUser = async (userId) => {
    const target = users.find((u) => u.id === userId);
    if (!target || !window.confirm(`Are you sure you want to delete user "${target.name}"?`)) return;

    setUsers(users.filter((u) => u.id !== userId));
    showToast(`User "${target.name}" deleted successfully.`);

    try {
      await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
        method: "DELETE"
      });
    } catch {
      // Local state updated
    }
  };

  // Trainer Actions: Approve / Suspend (FR-11.1)
  const handleApproveTrainer = async (trainerId, currentApproved) => {
    const newApproved = !currentApproved;
    setTrainers(trainers.map((t) => (t.id === trainerId ? { ...t, isApproved: newApproved } : t)));

    const trainer = trainers.find((t) => t.id === trainerId);
    showToast(`Trainer "${trainer?.name}" is now ${newApproved ? "Approved & Activated" : "Suspended"}`);

    try {
      await fetch(`http://localhost:5000/api/admin/trainers/${trainerId}/approve`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved: newApproved })
      });
    } catch {
      // Local state updated
    }
  };

  // Exercise Actions: Add / Edit
  const handleOpenAddExercise = () => {
    setEditingExercise(null);
    setExerciseForm({
      name: "",
      muscleGroup: "Chest",
      difficulty: "Beginner",
      equipment: "Bodyweight",
      instructions: ""
    });
    setShowExerciseModal(true);
  };

  const handleOpenEditExercise = (exercise) => {
    setEditingExercise(exercise);
    setExerciseForm({
      name: exercise.name,
      muscleGroup: exercise.muscleGroup,
      difficulty: exercise.difficulty,
      equipment: exercise.equipment,
      instructions: exercise.instructions
    });
    setShowExerciseModal(true);
  };

  const handleSaveExercise = async (e) => {
    e.preventDefault();
    if (!exerciseForm.name) return;

    if (editingExercise) {
      // Update
      const updated = { ...editingExercise, ...exerciseForm };
      setExercises(exercises.map((ex) => (ex.id === editingExercise.id ? updated : ex)));
      showToast(`Exercise "${exerciseForm.name}" updated successfully.`);

      try {
        await fetch(`http://localhost:5000/api/admin/exercises/${editingExercise.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(exerciseForm)
        });
      } catch {
        // Handled
      }
    } else {
      // Create new
      const newEx = {
        id: Date.now(),
        ...exerciseForm
      };
      setExercises([...exercises, newEx]);
      showToast(`New exercise "${exerciseForm.name}" added to library.`);

      try {
        await fetch("http://localhost:5000/api/admin/exercises", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(exerciseForm)
        });
      } catch {
        // Handled
      }
    }

    setShowExerciseModal(false);
  };

  const handleDeleteExercise = async (exerciseId) => {
    const target = exercises.find((e) => e.id === exerciseId);
    if (!target || !window.confirm(`Delete exercise "${target.name}"?`)) return;

    setExercises(exercises.filter((e) => e.id !== exerciseId));
    showToast(`Exercise "${target.name}" removed from library.`);

    try {
      await fetch(`http://localhost:5000/api/admin/exercises/${exerciseId}`, {
        method: "DELETE"
      });
    } catch {
      // Handled
    }
  };

  // CSV Export (FR-11.2)
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,ID,Name,Email,Role,Status,JoinDate\n";
    users.forEach((u) => {
      csvContent += `${u.id},"${u.name}","${u.email}","${u.role}","${u.status}","${u.joinDate}"\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `fithub_users_report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("CSV report generated & downloaded successfully!");
  };

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = userRoleFilter === "All" || u.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  // Filtered Exercises
  const filteredExercises = exercises.filter((ex) => {
    const matchesSearch = ex.name.toLowerCase().includes(exerciseSearch.toLowerCase());
    const matchesMuscle =
      exerciseMuscleFilter === "All" || ex.muscleGroup === exerciseMuscleFilter;
    return matchesSearch && matchesMuscle;
  });

  return (
    <div className="admin-page">
      {/* HEADER */}
      <div className="admin-page-header">
        <div>
          <h1>🛡️ Admin Dashboard</h1>
          <p>System oversight, user permissions, trainer approvals, and exercise management</p>
        </div>
        <button onClick={handleExportCSV} className="export-csv-btn">
          📥 Export CSV Report
        </button>
      </div>

      {/* TOAST NOTIFICATION */}
      {notification && <div className="admin-toast">{notification}</div>}

      {/* SYSTEM OVERVIEW METRICS (FR-11) */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="stat-icon-wrap">👥</div>
          <div>
            <span className="stat-title">Total Users</span>
            <strong>{users.length}</strong>
            <small>Active platform accounts</small>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-icon-wrap" style={{ background: "#063b36", color: "#00d68f" }}>
            🏋️
          </div>
          <div>
            <span className="stat-title">Certified Trainers</span>
            <strong>{trainers.filter((t) => t.isApproved).length}</strong>
            <small>{trainers.filter((t) => !t.isApproved).length} pending approval</small>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-icon-wrap" style={{ background: "#0c3149", color: "#38bdf8" }}>
            📋
          </div>
          <div>
            <span className="stat-title">Exercise Database</span>
            <strong>{exercises.length}</strong>
            <small>Total library exercises</small>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-icon-wrap" style={{ background: "#3b1e06", color: "#fbbf24" }}>
            ⚡
          </div>
          <div>
            <span className="stat-title">System Engagement</span>
            <strong>{stats.engagementRate || "88.4%"}</strong>
            <small>Weekly active rate</small>
          </div>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="admin-tabs">
        <button
          className={`admin-tab-btn ${activeTab === "users" ? "active" : ""}`}
          onClick={() => setActiveTab("users")}
        >
          👥 User Management ({users.length})
        </button>
        <button
          className={`admin-tab-btn ${activeTab === "trainers" ? "active" : ""}`}
          onClick={() => setActiveTab("trainers")}
        >
          🏋️‍♂️ Trainer Approvals & Management ({trainers.length})
          {trainers.some((t) => !t.isApproved) && <span className="tab-badge">Pending</span>}
        </button>
        <button
          className={`admin-tab-btn ${activeTab === "exercises" ? "active" : ""}`}
          onClick={() => setActiveTab("exercises")}
        >
          📋 Exercise Library ({exercises.length})
        </button>
      </div>

      {/* TAB 1: USER MANAGEMENT */}
      {activeTab === "users" && (
        <div className="admin-card">
          <div className="table-controls-row">
            <div className="search-box">
              🔍
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
            </div>
            <div className="filter-group">
              <label>Role:</label>
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
              >
                <option value="All">All Roles</option>
                <option value="User">User</option>
                <option value="Trainer">Trainer</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Join Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar">{u.name.charAt(0)}</div>
                        <div>
                          <strong>{u.name}</strong>
                          <small>{u.email}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`role-badge role-${u.role.toLowerCase()}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge status-${u.status.toLowerCase()}`}>
                        {u.status}
                      </span>
                    </td>
                    <td>{u.joinDate}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className={`btn-status-toggle ${u.status === "Active" ? "btn-suspend" : "btn-activate"}`}
                          onClick={() => handleToggleUserStatus(u.id)}
                          title={u.status === "Active" ? "Suspend user" : "Reactivate user"}
                        >
                          {u.status === "Active" ? "Suspend" : "Activate"}
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDeleteUser(u.id)}
                          title="Delete user"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: TRAINER APPROVALS & MANAGEMENT (FR-11.1) */}
      {activeTab === "trainers" && (
        <div className="admin-card">
          <div className="card-header-desc">
            <h2>Trainer Applications & Credentials</h2>
            <p>Admin verification is required before trainer privileges are activated (SRS FR-11.1).</p>
          </div>

          <div className="trainers-grid">
            {trainers.map((t) => (
              <div
                key={t.id}
                className={`trainer-admin-card ${!t.isApproved ? "trainer-pending-card" : ""}`}
              >
                <div className="trainer-card-top">
                  <div className="trainer-header-info">
                    <div className="trainer-avatar-large">🏋️</div>
                    <div>
                      <h3>{t.name}</h3>
                      <span className="trainer-email">{t.email}</span>
                    </div>
                  </div>
                  <span className={`status-badge ${t.isApproved ? "status-active" : "status-pending"}`}>
                    {t.isApproved ? "✓ Approved" : "⏳ Pending Approval"}
                  </span>
                </div>

                <div className="trainer-credentials">
                  <div className="cert-box">
                    <strong>Certification:</strong>
                    <p>{t.certification}</p>
                  </div>
                  <div className="bio-box">
                    <strong>Bio:</strong>
                    <p>{t.bio}</p>
                  </div>
                </div>

                <div className="trainer-meta-row">
                  <span>👥 Active Clients: <strong>{t.clientsCount}</strong></span>
                  <span>⭐ Rating: <strong>{t.rating}/5.0</strong></span>
                </div>

                <div className="trainer-action-footer">
                  <button
                    className={`btn-approve-trainer ${t.isApproved ? "btn-revoke" : "btn-grant"}`}
                    onClick={() => handleApproveTrainer(t.id, t.isApproved)}
                  >
                    {t.isApproved ? "Suspend Trainer" : "✓ Approve Trainer"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: EXERCISE LIBRARY MANAGEMENT */}
      {activeTab === "exercises" && (
        <div className="admin-card">
          <div className="table-controls-row">
            <div className="search-box">
              🔍
              <input
                type="text"
                placeholder="Search exercises by name..."
                value={exerciseSearch}
                onChange={(e) => setExerciseSearch(e.target.value)}
              />
            </div>
            <div className="filter-group">
              <label>Muscle:</label>
              <select
                value={exerciseMuscleFilter}
                onChange={(e) => setExerciseMuscleFilter(e.target.value)}
              >
                <option value="All">All Muscles</option>
                <option value="Chest">Chest</option>
                <option value="Back">Back</option>
                <option value="Legs">Legs</option>
                <option value="Shoulders">Shoulders</option>
                <option value="Arms">Arms</option>
                <option value="Core">Core</option>
              </select>
            </div>
            <button onClick={handleOpenAddExercise} className="btn-add-exercise">
              ➕ Add New Exercise
            </button>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Exercise</th>
                  <th>Muscle Group</th>
                  <th>Difficulty</th>
                  <th>Equipment</th>
                  <th>Instructions</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExercises.map((ex) => (
                  <tr key={ex.id}>
                    <td><strong>{ex.name}</strong></td>
                    <td>
                      <span className="muscle-badge">{ex.muscleGroup}</span>
                    </td>
                    <td>
                      <span className={`diff-badge diff-${ex.difficulty.toLowerCase()}`}>
                        {ex.difficulty}
                      </span>
                    </td>
                    <td>{ex.equipment}</td>
                    <td className="instructions-cell">{ex.instructions}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-edit"
                          onClick={() => handleOpenEditExercise(ex)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDeleteExercise(ex.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD / EDIT EXERCISE MODAL */}
      {showExerciseModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="modal-header">
              <h2>{editingExercise ? "✏️ Edit Exercise" : "➕ Add New Exercise"}</h2>
              <button onClick={() => setShowExerciseModal(false)} className="modal-close-btn">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveExercise} className="modal-form">
              <label>
                Exercise Name *
                <input
                  type="text"
                  placeholder="e.g. Romanian Deadlift"
                  value={exerciseForm.name}
                  onChange={(e) => setExerciseForm({ ...exerciseForm, name: e.target.value })}
                  required
                />
              </label>

              <div className="form-grid-2">
                <label>
                  Muscle Group *
                  <select
                    value={exerciseForm.muscleGroup}
                    onChange={(e) => setExerciseForm({ ...exerciseForm, muscleGroup: e.target.value })}
                  >
                    <option value="Chest">Chest</option>
                    <option value="Back">Back</option>
                    <option value="Legs">Legs</option>
                    <option value="Shoulders">Shoulders</option>
                    <option value="Arms">Arms</option>
                    <option value="Core">Core</option>
                  </select>
                </label>

                <label>
                  Difficulty
                  <select
                    value={exerciseForm.difficulty}
                    onChange={(e) => setExerciseForm({ ...exerciseForm, difficulty: e.target.value })}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </label>
              </div>

              <label>
                Equipment Needed
                <input
                  type="text"
                  placeholder="e.g. Barbell, Dumbbells, Bodyweight"
                  value={exerciseForm.equipment}
                  onChange={(e) => setExerciseForm({ ...exerciseForm, equipment: e.target.value })}
                />
              </label>

              <label>
                Instructions
                <textarea
                  rows="3"
                  placeholder="Step-by-step performance tips..."
                  value={exerciseForm.instructions}
                  onChange={(e) => setExerciseForm({ ...exerciseForm, instructions: e.target.value })}
                ></textarea>
              </label>

              <div className="modal-actions">
                <button type="submit" className="btn-modal-save">
                  {editingExercise ? "Save Changes" : "Create Exercise"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowExerciseModal(false)}
                  className="btn-modal-cancel"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;
