import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "./context/AppContext";
import "./Onboarding.css";

const TOTAL_STEPS = 3;

const GOALS = [
  { value: "lose", label: "Lose Weight" },
  { value: "maintain", label: "Maintain Weight" },
  { value: "gain", label: "Gain Muscle" }
];

function Onboarding() {
  const { completeOnboarding } = useAppContext();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    age: "",
    weight: "",
    height: "",
    goal: "maintain",
    dailyCalorieIntake: 2000,
    dailyCalorieBurn: 600
  });

  const updateField = (name, value) => {
    setFormData((current) => ({
      ...current,
      [name]: value
    }));
    setError("");
  };

  const goBack = () => {
    setError("");
    setStep((current) => Math.max(1, current - 1));
  };

  const goNext = () => {
    if (step === 1 && !formData.age) {
      setError("Please enter your age.");
      return;
    }

    if (step === 1 && (Number(formData.age) < 1 || Number(formData.age) > 120)) {
      setError("Please enter a valid age.");
      return;
    }

    if (step === 2 && !formData.weight) {
      setError("Please enter your weight.");
      return;
    }

    setError("");
    setStep((current) => Math.min(TOTAL_STEPS, current + 1));
  };

  const handleFinish = async () => {
    setSubmitting(true);
    setError("");

    const result = await completeOnboarding({
      age: Number(formData.age),
      weight: Number(formData.weight),
      height: formData.height ? Number(formData.height) : null,
      goal: formData.goal,
      dailyCalorieIntake: Number(formData.dailyCalorieIntake),
      dailyCalorieBurn: Number(formData.dailyCalorieBurn)
    });

    setSubmitting(false);

    if (!result.success) {
      setError(result.message);
      return;
    }

    navigate("/");
  };

  return (
    <div className="onboarding-page">
      <div className="onboarding-card">

        <div className="onboarding-brand">
          <span className="onboarding-logo">🏃</span>
          <span>FitHub</span>
        </div>

        <p className="onboarding-subtitle">
          Let's personalize your experience
        </p>

        <div className="onboarding-progress">
          {Array.from({ length: TOTAL_STEPS }).map((_, index) => (
            <div
              key={index}
              className={`onboarding-progress-segment ${
                index < step ? "filled" : ""
              }`}
            />
          ))}
        </div>

        <span className="onboarding-step-label">
          Step {step} of {TOTAL_STEPS}
        </span>


        {/* STEP 1 - AGE */}
        {step === 1 && (
          <div className="onboarding-step">

            <div className="onboarding-step-header">
              <span className="onboarding-step-icon">👤</span>
              <div>
                <h2>How old are you?</h2>
                <p>This helps us calculate your needs</p>
              </div>
            </div>

            <label className="onboarding-field">
              Age *
              <input
                type="number"
                min="1"
                max="120"
                value={formData.age}
                onChange={(e) => updateField("age", e.target.value)}
                placeholder="e.g. 28"
              />
            </label>

          </div>
        )}


        {/* STEP 2 - MEASUREMENTS */}
        {step === 2 && (
          <div className="onboarding-step">

            <div className="onboarding-step-header">
              <span className="onboarding-step-icon">⚖️</span>
              <div>
                <h2>Your measurements</h2>
                <p>Help us track your progress</p>
              </div>
            </div>

            <label className="onboarding-field">
              Weight (kg) *
              <input
                type="number"
                min="1"
                max="500"
                step="0.1"
                value={formData.weight}
                onChange={(e) => updateField("weight", e.target.value)}
                placeholder="e.g. 70"
              />
            </label>

            <label className="onboarding-field">
              Height (cm) - Optional
              <input
                type="number"
                min="1"
                max="300"
                step="0.1"
                value={formData.height}
                onChange={(e) => updateField("height", e.target.value)}
                placeholder="e.g. 175"
              />
            </label>

          </div>
        )}


        {/* STEP 3 - GOAL + DAILY TARGETS */}
        {step === 3 && (
          <div className="onboarding-step">

            <div className="onboarding-step-header">
              <span className="onboarding-step-icon">🎯</span>
              <div>
                <h2>What's your goal?</h2>
                <p>We'll tailor your experience</p>
              </div>
            </div>

            <div className="onboarding-goal-options">
              {GOALS.map((goal) => (
                <button
                  type="button"
                  key={goal.value}
                  className={`onboarding-goal-option ${
                    formData.goal === goal.value ? "selected" : ""
                  }`}
                  onClick={() => updateField("goal", goal.value)}
                >
                  {goal.label}
                </button>
              ))}
            </div>

            <div className="onboarding-targets">
              <h3>Daily Targets</h3>

              <div className="onboarding-slider">
                <div className="onboarding-slider-label">
                  <span>Daily Calorie Intake</span>
                  <strong>{formData.dailyCalorieIntake} kcal</strong>
                </div>
                <input
                  type="range"
                  min="1200"
                  max="4000"
                  step="50"
                  value={formData.dailyCalorieIntake}
                  onChange={(e) =>
                    updateField("dailyCalorieIntake", e.target.value)
                  }
                />
              </div>

              <div className="onboarding-slider">
                <div className="onboarding-slider-label">
                  <span>Daily Calorie Burn</span>
                  <strong>{formData.dailyCalorieBurn} kcal</strong>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2000"
                  step="50"
                  value={formData.dailyCalorieBurn}
                  onChange={(e) =>
                    updateField("dailyCalorieBurn", e.target.value)
                  }
                />
              </div>
            </div>

          </div>
        )}


        {error && <small className="field-error">{error}</small>}


        <div className="onboarding-actions">

          {step > 1 && (
            <button
              type="button"
              className="onboarding-back-btn"
              onClick={goBack}
              disabled={submitting}
            >
              ← Back
            </button>
          )}

          <div className="onboarding-actions-spacer" />

          {step < TOTAL_STEPS ? (
            <button
              type="button"
              className="onboarding-next-btn"
              onClick={goNext}
            >
              Continue →
            </button>
          ) : (
            <button
              type="button"
              className="onboarding-next-btn"
              onClick={handleFinish}
              disabled={submitting}
            >
              {submitting ? "Saving..." : "Get Started →"}
            </button>
          )}

        </div>

      </div>
    </div>
  );
}

export default Onboarding;
