import { useState } from "react";
import { useAppContext } from "./context/AppContext";
import "./Food.css";

function Food() {
  const {
    foodLogs,
    addFoodLog,
    deleteFoodLog,
    waterIntake,
    waterGoal,
    logWater,
    resetWater,
    updateWaterGoal
  } = useAppContext();

  const [activeCategoryFilter, setActiveCategoryFilter] = useState("All");
  const [customWater, setCustomWater] = useState("");
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(waterGoal || 2500);

  const [formData, setFormData] = useState({
    foodName: "",
    category: "Breakfast",
    calories: "",
    protein: "",
    carbs: "",
    fat: ""
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((currentData) => ({
      ...currentData,
      [name]: value
    }));
  };

  const handleAddFood = (event) => {
    event.preventDefault();
    if (!formData.foodName || !formData.calories) return;

    addFoodLog({
      foodName: formData.foodName,
      category: formData.category,
      calories: Number(formData.calories),
      protein: Number(formData.protein) || 0,
      carbs: Number(formData.carbs) || 0,
      fat: Number(formData.fat) || 0
    });

    setFormData({
      foodName: "",
      category: formData.category,
      calories: "",
      protein: "",
      carbs: "",
      fat: ""
    });
  };

  // Nutrition Totals
  const totalCalories = foodLogs.reduce((sum, food) => sum + (Number(food.calories) || 0), 0);
  const totalProtein = foodLogs.reduce((sum, food) => sum + (Number(food.protein) || 0), 0);
  const totalCarbs = foodLogs.reduce((sum, food) => sum + (Number(food.carbs) || 0), 0);
  const totalFat = foodLogs.reduce((sum, food) => sum + (Number(food.fat) || 0), 0);

  // Water calculations
  const waterPercent = Math.min(Math.round((waterIntake / (waterGoal || 2500)) * 100), 100);
  const waterRemaining = Math.max((waterGoal || 2500) - waterIntake, 0);

  const handleCustomWaterSubmit = (e) => {
    e.preventDefault();
    const amt = parseInt(customWater);
    if (amt && amt > 0) {
      logWater(amt);
      setCustomWater("");
    }
  };

  const handleGoalSave = () => {
    const num = parseInt(goalInput);
    if (num && num >= 500 && num <= 10000) {
      updateWaterGoal(num);
      setIsEditingGoal(false);
    }
  };

  const filteredFoods = activeCategoryFilter === "All"
    ? foodLogs
    : foodLogs.filter(f => f.category === activeCategoryFilter);

  return (
    <div className="food-page">
      {/* HEADER */}
      <div className="food-page-header">
        <h1>Nutrition & Hydration</h1>
        <p>Track your daily food intake, macronutrients, and water consumption</p>
      </div>

      {/* TOP SUMMARY CARDS (MACROS & WATER) */}
      <div className="nutrition-stats-grid">
        {/* CALORIES */}
        <div className="nutrition-stat-card cal-card">
          <div className="stat-title">🔥 Calories</div>
          <div className="stat-value"><strong>{totalCalories}</strong> <small>kcal</small></div>
          <div className="stat-sub">Target: 2,000 kcal</div>
        </div>

        {/* PROTEIN */}
        <div className="nutrition-stat-card">
          <div className="stat-title">🥩 Protein</div>
          <div className="stat-value"><strong>{totalProtein}</strong> <small>g</small></div>
          <div className="stat-sub">{Math.round(totalProtein * 4)} kcal from protein</div>
        </div>

        {/* CARBS */}
        <div className="nutrition-stat-card">
          <div className="stat-title">🍞 Carbohydrates</div>
          <div className="stat-value"><strong>{totalCarbs}</strong> <small>g</small></div>
          <div className="stat-sub">{Math.round(totalCarbs * 4)} kcal from carbs</div>
        </div>

        {/* FATS */}
        <div className="nutrition-stat-card">
          <div className="stat-title">🥑 Healthy Fats</div>
          <div className="stat-value"><strong>{totalFat}</strong> <small>g</small></div>
          <div className="stat-sub">{Math.round(totalFat * 9)} kcal from fats</div>
        </div>
      </div>

      <div className="food-content">
        {/* ADD FOOD FORM (FR-6, FR-6.2) */}
        <div className="food-card">
          <h2>Log Meal / Food</h2>

          <form onSubmit={handleAddFood}>
            <label>
              Food Name *
              <input
                type="text"
                name="foodName"
                value={formData.foodName}
                onChange={handleChange}
                placeholder="e.g. Grilled Chicken Breast"
                required
              />
            </label>

            <label>
              Meal Category *
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="category-select"
              >
                <option value="Breakfast">🍳 Breakfast</option>
                <option value="Lunch">🥗 Lunch</option>
                <option value="Dinner">🍲 Dinner</option>
                <option value="Snack">🍎 Snack</option>
              </select>
            </label>

            <label>
              Calories (kcal) *
              <input
                type="number"
                name="calories"
                value={formData.calories}
                onChange={handleChange}
                placeholder="e.g. 250"
                min="1"
                required
              />
            </label>

            <label>
              Protein (g)
              <input
                type="number"
                name="protein"
                value={formData.protein}
                onChange={handleChange}
                placeholder="e.g. 30"
                min="0"
              />
            </label>

            <label>
              Carbohydrates (g)
              <input
                type="number"
                name="carbs"
                value={formData.carbs}
                onChange={handleChange}
                placeholder="e.g. 10"
                min="0"
              />
            </label>

            <label>
              Fat (g)
              <input
                type="number"
                name="fat"
                value={formData.fat}
                onChange={handleChange}
                placeholder="e.g. 5"
                min="0"
              />
            </label>

            <button type="submit" className="add-food-btn">
              ➕ Add Food Entry
            </button>
          </form>
        </div>

        {/* WATER TRACKER CARD (FR-7, FR-7.1) */}
        <div className="food-card water-tracker-card">
          <div className="card-header-flex">
            <h2>💧 Water Tracker</h2>
            {!isEditingGoal ? (
              <button className="goal-edit-btn" onClick={() => setIsEditingGoal(true)}>
                Goal: {waterGoal} ml ✏️
              </button>
            ) : (
              <div className="goal-edit-inline">
                <input
                  type="number"
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value)}
                  step="100"
                  min="500"
                  max="10000"
                />
                <button onClick={handleGoalSave} className="goal-save-btn">Save</button>
              </div>
            )}
          </div>

          <div className="water-progress-display">
            <div className="water-amount-big">
              <strong>{waterIntake}</strong>
              <span>/ {waterGoal} ml</span>
            </div>
            <div className="water-status-text">
              {waterRemaining === 0 ? (
                <span className="goal-reached">🎉 Daily hydration goal achieved!</span>
              ) : (
                <span>{waterRemaining} ml remaining today ({waterPercent}%)</span>
              )}
            </div>

            <div className="water-bar-container">
              <div
                className="water-bar-fill"
                style={{ width: `${waterPercent}%` }}
              ></div>
            </div>
          </div>

          <div className="water-quick-buttons">
            <button type="button" onClick={() => logWater(250)} className="water-btn">
              🥛 +250 ml <small>(Glass)</small>
            </button>
            <button type="button" onClick={() => logWater(500)} className="water-btn">
              🧴 +500 ml <small>(Bottle)</small>
            </button>
            <button type="button" onClick={() => logWater(1000)} className="water-btn">
              💧 +1000 ml <small>(Flask)</small>
            </button>
          </div>

          <form onSubmit={handleCustomWaterSubmit} className="water-custom-form">
            <input
              type="number"
              placeholder="Custom ml..."
              value={customWater}
              onChange={(e) => setCustomWater(e.target.value)}
              min="10"
            />
            <button type="submit" className="custom-add-btn">Add</button>
            <button type="button" onClick={resetWater} className="water-reset-btn" title="Reset Today's Water">
              🔄
            </button>
          </form>
        </div>

        {/* FOOD ENTRIES LOG (FULL WIDTH) */}
        <div className="food-card food-entries-card">
          <div className="food-entries-header">
            <h2>Today's Food Entries ({foodLogs.length})</h2>
            
            {/* Category Filter Tabs */}
            <div className="category-filter-tabs">
              {["All", "Breakfast", "Lunch", "Dinner", "Snack"].map((cat) => (
                <button
                  key={cat}
                  className={`filter-tab ${activeCategoryFilter === cat ? "active" : ""}`}
                  onClick={() => setActiveCategoryFilter(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {filteredFoods.length === 0 ? (
            <p className="no-entries">No food entries in this category yet.</p>
          ) : (
            <div className="food-entries-list">
              {filteredFoods.map((food) => (
                <div className="food-entry-item" key={food.id}>
                  <div className="entry-main">
                    <span className="entry-category-badge">{food.category || "Meal"}</span>
                    <strong>{food.foodName}</strong>
                  </div>

                  <div className="entry-macros">
                    <span>🔥 {food.calories} kcal</span>
                    {food.protein > 0 && <span>P: {food.protein}g</span>}
                    {food.carbs > 0 && <span>C: {food.carbs}g</span>}
                    {food.fat > 0 && <span>F: {food.fat}g</span>}
                  </div>

                  <button
                    className="delete-food-btn"
                    onClick={() => deleteFoodLog(food.id)}
                    title="Remove item"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Food;