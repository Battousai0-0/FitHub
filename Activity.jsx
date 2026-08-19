import { useEffect, useMemo, useState } from "react";
import "./Activity.css";
import { API_BASE, useAppContext } from "./context/AppContext";

function Activity() {
  const { user, refreshUser } = useAppContext();
  const [workouts, setWorkouts] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [selectedWorkout, setSelectedWorkout] = useState("");
  const [summary, setSummary] = useState({ ExercisesCompleted:0, CaloriesBurned:0, WorkoutMinutes:0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [exerciseForm, setExerciseForm] = useState({ exerciseName:"", muscleGroup:"", met:"5" });
  const [workoutForm, setWorkoutForm] = useState({
    planName:"", description:"", difficulty:"Beginner",
    items:[{ exerciseId:"", sets:"3", repetitions:"10", durationMinutes:"10" }]
  });

  const load = async () => {
    if (!user?.userId) return;
    try {
      setLoading(true); setError("");
      const [wRes, eRes, sRes] = await Promise.all([
        fetch(`${API_BASE}/api/activity/${user.userId}`),
        fetch(`${API_BASE}/api/exercises`),
        fetch(`${API_BASE}/api/activity-summary/${user.userId}`)
      ]);
      const [w, e, s] = await Promise.all([wRes.json(), eRes.json(), sRes.json()]);
      if (!wRes.ok || !eRes.ok || !sRes.ok) throw new Error(w.message || e.message || s.message || "Failed to load activity");
      setWorkouts(w); setExercises(e); setSummary(s);
      const names = [...new Set(w.map(x => x.PlanName))];
      if (!selectedWorkout || !names.includes(selectedWorkout)) setSelectedWorkout(names[0] || "");
      if (!workoutForm.items[0].exerciseId && e[0]) {
        setWorkoutForm((f) => ({ ...f, items:[{...f.items[0], exerciseId:String(e[0].ExerciseID)}] }));
      }
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [user?.userId]);

  const planNames = useMemo(() => [...new Set(workouts.map(w => w.PlanName))], [workouts]);
  const currentExercises = workouts.filter(w => w.PlanName === selectedWorkout);

  const completeExercise = async (item) => {
    try {
      const response = await fetch(`${API_BASE}/api/activity/${user.userId}/complete`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          workoutPlanExerciseId: item.WorkoutPlanExerciseID,
          durationMinutes: item.DurationMinutes
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not complete exercise");
      await load(); await refreshUser();
    } catch (e) { setError(e.message); }
  };

  const addExercise = async (e) => {
    e.preventDefault(); setSaving(true); setError("");
    try {
      const response = await fetch(`${API_BASE}/api/exercises`, {
        method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(exerciseForm)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not add exercise");
      setExerciseForm({ exerciseName:"", muscleGroup:"", met:"5" });
      await load();
    } catch (e) { setError(e.message); } finally { setSaving(false); }
  };

  const addWorkoutItem = () => setWorkoutForm(f => ({
    ...f, items:[...f.items, { exerciseId:exercises[0] ? String(exercises[0].ExerciseID) : "", sets:"3", repetitions:"10", durationMinutes:"10" }]
  }));
  const removeWorkoutItem = (index) => setWorkoutForm(f => ({...f, items:f.items.filter((_,i)=>i!==index)}));
  const updateWorkoutItem = (index, key, value) => setWorkoutForm(f => ({
    ...f, items:f.items.map((item,i)=>i===index ? {...item,[key]:value}:item)
  }));

  const createWorkout = async (e) => {
    e.preventDefault(); setSaving(true); setError("");
    try {
      const response = await fetch(`${API_BASE}/api/workouts/${user.userId}`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify(workoutForm)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not create workout");
      setWorkoutForm({ planName:"", description:"", difficulty:"Beginner",
        items:[{ exerciseId:exercises[0] ? String(exercises[0].ExerciseID) : "", sets:"3", repetitions:"10", durationMinutes:"10" }]});
      await load();
      setSelectedWorkout(data.planName || workoutForm.planName);
    } catch (e) { setError(e.message); } finally { setSaving(false); }
  };

  if (loading) return <div className="activity-page"><div className="activity-header"><h1>Activity</h1><p>Loading your workouts...</p></div></div>;

  return (
    <div className="activity-page">
      <div className="activity-header"><div><h1>Activity</h1><p>Build workouts, add exercises and track calories burned.</p></div></div>
      {error && <p className="field-error">{error}</p>}

      <div className="activity-card">
        <div className="activity-card-header"><div><h2>Add Exercise</h2><p>Add a reusable exercise to your library.</p></div></div>
        <form onSubmit={addExercise} className="activity-form">
          <input placeholder="Exercise name" value={exerciseForm.exerciseName} onChange={e=>setExerciseForm({...exerciseForm,exerciseName:e.target.value})} required />
          <input placeholder="Muscle group" value={exerciseForm.muscleGroup} onChange={e=>setExerciseForm({...exerciseForm,muscleGroup:e.target.value})} />
          <input type="number" min="1" step="0.1" placeholder="MET" value={exerciseForm.met} onChange={e=>setExerciseForm({...exerciseForm,met:e.target.value})} />
          <button disabled={saving}>Add Exercise</button>
        </form>
      </div>

      <div className="activity-card">
        <div className="activity-card-header"><div><h2>Create Workout</h2><p>Create a plan and attach exercises to it.</p></div></div>
        <form onSubmit={createWorkout} className="activity-form">
          <input placeholder="Workout name" value={workoutForm.planName} onChange={e=>setWorkoutForm({...workoutForm,planName:e.target.value})} required />
          <input placeholder="Description" value={workoutForm.description} onChange={e=>setWorkoutForm({...workoutForm,description:e.target.value})} />
          <select value={workoutForm.difficulty} onChange={e=>setWorkoutForm({...workoutForm,difficulty:e.target.value})}>
            <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
          </select>
          {workoutForm.items.map((item,index)=><div className="workout-builder-row" key={index}>
            <select value={item.exerciseId} onChange={e=>updateWorkoutItem(index,"exerciseId",e.target.value)} required>
              <option value="">Choose exercise</option>
              {exercises.map(x=><option key={x.ExerciseID} value={x.ExerciseID}>{x.ExerciseName}</option>)}
            </select>
            <input type="number" min="0" placeholder="Sets" value={item.sets} onChange={e=>updateWorkoutItem(index,"sets",e.target.value)} />
            <input type="number" min="0" placeholder="Reps" value={item.repetitions} onChange={e=>updateWorkoutItem(index,"repetitions",e.target.value)} />
            <input type="number" min="0" placeholder="Minutes" value={item.durationMinutes} onChange={e=>updateWorkoutItem(index,"durationMinutes",e.target.value)} />
            {workoutForm.items.length > 1 && <button type="button" onClick={()=>removeWorkoutItem(index)}>Remove</button>}
          </div>)}
          <div><button type="button" onClick={addWorkoutItem}>+ Add Exercise to Workout</button> <button type="submit" disabled={saving || !exercises.length}>Create Workout</button></div>
        </form>
      </div>

      <div className="activity-card workout-selector">
        <div className="activity-card-header"><div><h2>Today's Workout</h2><p>Your current workout plans</p></div>
          <select value={selectedWorkout} onChange={e=>setSelectedWorkout(e.target.value)}>
            {planNames.length ? planNames.map(name=><option key={name}>{name}</option>) : <option value="">No workouts yet</option>}
          </select>
        </div>
      </div>

      <div className="activity-card">
        <div className="activity-card-header"><div><h2>{selectedWorkout || "Workout"} Exercises</h2><p>Complete an exercise once per day. Calories are calculated from MET × body weight × duration.</p></div></div>
        <div className="exercise-list">
          {!currentExercises.length ? <p>No workout exercises yet.</p> : currentExercises.map(item => (
            <div className={`exercise-item ${item.CompletedToday ? "exercise-completed" : ""}`} key={item.WorkoutPlanExerciseID}>
              <div className="exercise-icon">🏋️</div>
              <div className="exercise-info"><strong>{item.ExerciseName}</strong><span>{item.MuscleGroup}</span></div>
              <div className="exercise-details">
                <div><span>Sets</span><strong>{item.Sets}</strong></div>
                <div><span>Reps</span><strong>{item.Repetitions}</strong></div>
                <div><span>Duration</span><strong>{item.DurationMinutes} min</strong></div>
              </div>
              <button className={item.CompletedToday ? "completed-button" : ""} disabled={!!item.CompletedToday} onClick={()=>completeExercise(item)}>
                {item.CompletedToday ? "Completed" : "Complete"}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="activity-summary-grid">
        <div className="activity-summary-card"><span>Exercises</span><strong>{Number(summary.ExercisesCompleted || 0)}</strong></div>
        <div className="activity-summary-card"><span>Calories Burned</span><strong>{Number(summary.CaloriesBurned || 0)}</strong><small>kcal today</small></div>
        <div className="activity-summary-card"><span>Workout Time</span><strong>{Number(summary.WorkoutMinutes || 0)}</strong><small>minutes today</small></div>
      </div>
    </div>
  );
}
export default Activity;
