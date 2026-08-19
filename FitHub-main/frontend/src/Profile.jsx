import { useEffect, useState } from "react";
import { useAppContext } from "./context/AppContext";

function Profile() {

  const {
    user,
    updateUser,
    logout,
    
  } = useAppContext();


  const [isEditing, setIsEditing] = useState(false);
  const[errors, setErrors] = useState({});


  const [formData, setFormData] = useState({
    age: "",
    weight: "",
    height: "",
    goal: "maintain"
  });


  // Keep form values synchronized with user data
  useEffect(() => {

    if (user) {

      setFormData({
        age: user.age ?? "",
        weight: user.weight ?? "",
        height: user.height ?? "",
        goal: user.goal ?? "maintain"
      });

    }

  }, [user]);


  // Handle input changes
  const handleChange = (event) => {
  const { name, value } = event.target;

  setFormData((currentData) => ({
    ...currentData,
    [name]: value
  }));

  setErrors((currentErrors) => ({
    ...currentErrors,
    [name]: ""
  }));
};


  // Open edit mode
  const handleEdit = () => {

    if (!user) return;

    setFormData({
      age: user.age ?? "",
      weight: user.weight ?? "",
      height: user.height ?? "",
      goal: user.goal ?? "maintain"
    });

    setIsEditing(true);

  };


  // Save frontend changes
 const handleSave = () => {
  const age = Number(formData.age);
  const weight = Number(formData.weight);
  const height = Number(formData.height);

  const newErrors = {};

  if (!age || age < 1 || age > 120) {
    newErrors.age = "Age must be between 1 and 120.";
  }

  if (!weight || weight <= 0 || weight > 500) {
    newErrors.weight = "Please enter a valid weight.";
  }

  if (formData.height !== "" && (height <= 0 || height > 300)) {
    newErrors.height = "Please enter a valid height.";
  }

  if (!formData.goal) {
    newErrors.goal = "Please select a goal.";
  }

  setErrors(newErrors);

  // Stop if there are errors
  if (Object.keys(newErrors).length > 0) {
    return;
  }

  updateUser({ age, weight, height, goal: formData.goal }).then((result) => {
    if (!result?.success) {
      setErrors({ form: result?.message || "Could not update profile." });
      return;
    }
    setErrors({});
    setIsEditing(false);
  });
};


  // Cancel editing
  const handleCancel = () => {

    if (user) {

      setFormData({
        age: user.age ?? "",
        weight: user.weight ?? "",
        height: user.height ?? "",
        goal: user.goal ?? "maintain"
      });
    }
    setIsEditing(false);
  };


  // Loading state
  if (!user) {

    return (
      <div className="profile-loading">
        Loading profile...
      </div>
    );

  }

  return (
    <div className="profile-page">
      {/* HEADER */}
      <div className="profile-page-header">
        <h1>Profile</h1>
        <p>
          Manage your settings
        </p>
      </div>
      {/* CONTENT */}
      <div className="profile-content">
        {/* PROFILE CARD */}
        <div className="profile-card">
          <div className="profile-card-header">
            <div className="profile-icon">
              👤
            </div>
            <div>
              <h2>
                Your Profile
              </h2>
              <p>
                Member since {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
              </p>
            </div>
          </div>
          {!isEditing ? (
            <>
              {/* AGE */}
              <div className="profile-info">
                <span className="info-icon">
                  🗓️
                </span>
                <div>
                  <span>
                    Age
                  </span>
                  <strong>
                    {user.age} years
                  </strong>
                </div>
              </div>
              {/* WEIGHT */}
              <div className="profile-info">
                <span className="info-icon">
                  ⚖️
                </span>
                <div>
                  <span>
                    Weight
                  </span>
                  <strong>
                    {user.weight} kg
                  </strong>
                </div>
              </div>
              {/* HEIGHT */}
              <div className="profile-info">
                <span className="info-icon">
                  📏
                </span>
                <div>
                  <span>
                    Height
                  </span>
                  <strong>
                    {user.height} cm
                  </strong>
                </div>
              </div>
              {/* GOAL */}
              <div className="profile-info">
                <span className="info-icon">
                  🎯
                </span>
                <div>
                  <span>
                    Goal
                  </span>
                  <strong>
                    {user.goal}
                  </strong>
                </div>
              </div>
              <button
                className="edit-profile-btn"
                onClick={handleEdit}
              >
                Edit Profile
              </button>
            </>
          ) : (
            /* EDIT FORM */
            <div className="edit-profile-form">
              <h3>Edit Profile</h3>{errors.form && <small className="field-error">{errors.form}</small>}
              {/* AGE */}
              <label>
                Age
                <input
                  type="number"
                  name="age"
                  min="1"
                  max="120"
                  value={formData.age}
                  onChange={handleChange}
                 />
                 {errors.age && (
                  <small className="field-error">
                    {errors.age}
                  </small>
                 )}
              </label>
              {/* WEIGHT */}
              <label>
                Weight (kg)
                <input
                    type="number"
                    name="weight"
                    min="1"
                    max="500"
                    step="0.1"
                    value={formData.weight}
                    onChange={handleChange}
                />
                {errors.weight && (
                    <small className="field-error">
                    {errors.weight}
                    </small>
                )}
                </label>
              {/* HEIGHT */}
              <label>
                Height (cm)
                <input
                    type="number"
                    name="height"
                    min="1"
                    max="300"
                    step="0.1"
                    value={formData.height}
                    onChange={handleChange}
                />
                {errors.height && (
                    <small className="field-error">
                    {errors.height}
                    </small>
                )}
                </label>
              {/* GOAL */}
             <label>
                    Goal
                 <select
                     name="goal"
                     value={formData.goal}
                     onChange={handleChange}
                    >
                    <option value="lose">Lose Weight</option>
                    <option value="maintain">Maintain Weight</option>
                    <option value="gain">Gain Weight</option>
                 </select>
                    {errors.goal && (
                        <small className="field-error">
                        {errors.goal}
                        </small>
                    )}
                    </label>
              {/* BUTTONS */}
              <div className="edit-buttons">
                <button
                  className="save-profile-btn"
                  onClick={handleSave}
               >
                  Save Changes
                </button>
                <button
                  className="cancel-profile-btn"
                  onClick={handleCancel}               >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
        {/* RIGHT SIDE */}
        <div className="profile-right">
          
          {/* STATS */}
          <div className="stats-card">
            <h2>
              Your Stats
            </h2>

            <div className="stats-grid">
              <div className="stat-box">

                <strong>
                  {user.foodEntries ?? 0}
                </strong>

                <span>
                  Food entries
                </span>
              </div>
              <div className="stat-box">
                <strong>
                  {user.activities ?? 0}
                </strong>
                <span>
                  Activities
                </span>
              </div>
            </div>
          </div>
          {/* LOGOUT */}
          <button
            className="logout-btn"
            onClick={logout}     >
            ↪ Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;