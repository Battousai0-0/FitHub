import { useState, useEffect } from "react";
import "./Activity.css";
import { useAppContext } from "./context/AppContext";

function Activity() {

    const { user } = useAppContext();

    const [selectedWorkout, setSelectedWorkout] = useState("");
    const [workouts, setWorkouts] = useState([]);
    const [completed, setCompleted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Fetch user's workout data
    useEffect(() => {

        const fetchActivities = async () => {

            try {

                setLoading(true);
                setError("");

                const response = await fetch(
                    `http://localhost:5000/api/activity/${user.userId}`
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch activities");
                }

                const data = await response.json();

                console.log("ACTIVITY API DATA:", data);

                setWorkouts(data);

                // Set workout plan name from database
                if (data.length > 0) {
                    setSelectedWorkout(data[0].PlanName);
                }

            } catch (error) {

                console.error("ACTIVITY FETCH ERROR:", error);
                setError("Failed to load activities");

            } finally {

                setLoading(false);

            }

        };

        if (user?.userId) {
            fetchActivities();
        }

    }, [user?.userId]);


    const handleComplete = () => {
        setCompleted(!completed);
    };


    // Loading state
    if (loading) {
        return (
            <div className="activity-page">
                <div className="activity-header">
                    <h1>Activity</h1>
                    <p>Loading your workouts...</p>
                </div>
            </div>
        );
    }


    // Error state
    if (error) {
        return (
            <div className="activity-page">
                <div className="activity-header">
                    <h1>Activity</h1>
                    <p>{error}</p>
                </div>
            </div>
        );
    }


    return (
        <div className="activity-page">

            {/* HEADER */}
            <div className="activity-header">

                <div>
                    <h1>Activity</h1>

                    <p>
                        Track your workouts and physical activity
                    </p>
                </div>

            </div>


            {/* WORKOUT SELECTOR */}
            <div className="activity-card workout-selector">

                <div className="activity-card-header">

                    <div>
                        <h2>Today's Workout</h2>

                        <p>
                            Your current workout plan
                        </p>
                    </div>

                    <select
                        value={selectedWorkout}
                        onChange={(e) =>
                            setSelectedWorkout(e.target.value)
                        }
                    >
                        {[
                            ...new Set(
                                workouts.map(
                                    workout => workout.PlanName
                                )
                            )
                        ].map((planName) => (

                            <option
                                key={planName}
                                value={planName}
                            >
                                {planName}
                            </option>

                        ))}

                    </select>

                </div>

            </div>


            {/* WORKOUT EXERCISES */}
            <div className="activity-card">

                <div className="activity-card-header">

                    <div>
                        <h2>
                            {selectedWorkout} Exercises
                        </h2>

                        <p>
                            Complete your exercises to track your progress
                        </p>
                    </div>

                </div>


                <div className="exercise-list">

                    {workouts
                        .filter(
                            workout =>
                                workout.PlanName === selectedWorkout
                        )
                        .map((workout) => (

                            <div
                                className={`exercise-item ${
                                    completed
                                        ? "exercise-completed"
                                        : ""
                                }`}
                                key={workout.WorkoutPlanExerciseID}
                            >

                                <div className="exercise-icon">
                                    🏋️
                                </div>


                                <div className="exercise-info">

                                    <strong>
                                        {workout.ExerciseName}
                                    </strong>

                                    <span>
                                        {workout.MuscleGroup}
                                    </span>

                                </div>


                                <div className="exercise-details">

                                    <div>
                                        <span>Sets</span>

                                        <strong>
                                            {workout.Sets}
                                        </strong>
                                    </div>


                                    <div>
                                        <span>Reps</span>

                                        <strong>
                                            {workout.Repetitions}
                                        </strong>
                                    </div>


                                    <div>
                                        <span>Duration</span>

                                        <strong>
                                            {workout.DurationMinutes ?? 0} min
                                        </strong>
                                    </div>

                                </div>


                                <button
                                    className={
                                        completed
                                            ? "completed-button"
                                            : ""
                                    }
                                    onClick={handleComplete}
                                >
                                    {completed
                                        ? "Completed"
                                        : "Complete"}
                                </button>

                            </div>

                        ))}

                </div>

            </div>


            {/* ACTIVITY SUMMARY */}
            <div className="activity-summary-grid">

                <div className="activity-summary-card">

                    <span>
                        Exercises
                    </span>

                    <strong>
                        {completed ? workouts.length : 0}
                    </strong>

                </div>


                <div className="activity-summary-card">

                    <span>
                        Calories Burned
                    </span>

                    <strong>
                        {completed ? 250 : 0}
                    </strong>

                    <small>
                        kcal
                    </small>

                </div>


                <div className="activity-summary-card">

                    <span>
                        Workout Time
                    </span>

                    <strong>
                        {completed ? 16 : 0}
                    </strong>

                    <small>
                        minutes
                    </small>

                </div>

            </div>

        </div>
    );
}

export default Activity;