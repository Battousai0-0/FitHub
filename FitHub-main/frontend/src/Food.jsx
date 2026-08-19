import { useEffect, useState } from "react";
import "./Food.css";
import { API_BASE, useAppContext } from "./context/AppContext";

function Food() {
  const { user, refreshUser } = useAppContext();
  const [foodLogs, setFoodLogs] = useState([]);
  const [formData, setFormData] = useState({ foodName:"", calories:"", protein:"", carbs:"", fat:"" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const loadFood = async () => {
    if (!user?.userId) return;
    try {
      const response = await fetch(`${API_BASE}/api/food/${user.userId}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to load food");
      setFoodLogs(data);
    } catch (e) { setError(e.message); }
  };

  useEffect(() => { loadFood(); }, [user?.userId]);

  const handleChange = (e) => setFormData((current) => ({ ...current, [e.target.name]: e.target.value }));

  const handleAddFood = async (e) => {
    e.preventDefault();
    setError("");
    if (!formData.foodName.trim() || !formData.calories) {
      setError("Food name and calories are required.");
      return;
    }
    setSaving(true);
    try {
      const response = await fetch(`${API_BASE}/api/food/${user.userId}`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not add food");
      setFormData({ foodName:"", calories:"", protein:"", carbs:"", fat:"" });
      await loadFood();
      await refreshUser();
    } catch (e) { setError(e.message); } finally { setSaving(false); }
  };

  const deleteFood = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/api/food/${user.userId}/${id}`, { method:"DELETE" });
      if (!response.ok) throw new Error("Could not delete food");
      await loadFood(); await refreshUser();
    } catch (e) { setError(e.message); }
  };

  const totalCalories = foodLogs.reduce((sum, food) => sum + Number(food.Calories || 0), 0);

  return (
    <div className="food-page">
      <div className="food-page-header"><h1>Food</h1><p>Track your daily food intake</p></div>
      {error && <p className="field-error">{error}</p>}
      <div className="food-content">
        <div className="food-card">
          <h2>Add Food</h2>
          <form onSubmit={handleAddFood}>
            <label>Food Name<input name="foodName" value={formData.foodName} onChange={handleChange} placeholder="e.g. Chicken Breast" /></label>
            <label>Calories<input type="number" min="0" name="calories" value={formData.calories} onChange={handleChange} /></label>
            <label>Protein (g)<input type="number" min="0" step="0.1" name="protein" value={formData.protein} onChange={handleChange} /></label>
            <label>Carbohydrates (g)<input type="number" min="0" step="0.1" name="carbs" value={formData.carbs} onChange={handleChange} /></label>
            <label>Fat (g)<input type="number" min="0" step="0.1" name="fat" value={formData.fat} onChange={handleChange} /></label>
            <button type="submit" disabled={saving}>{saving ? "Adding..." : "Add Food"}</button>
          </form>
        </div>
        <div className="food-card">
          <h2>Today's Summary</h2>
          <div className="calorie-summary"><strong>{totalCalories}</strong><span>Calories consumed</span></div>
        </div>
        <div className="food-card">
          <h2>Food Entries</h2>
          {foodLogs.length === 0 ? <p>No food entries yet.</p> : foodLogs.map((food) => (
            <div className="food-entry" key={food.FoodLogID}>
              <strong>{food.FoodName}</strong><span>{food.Calories} kcal</span>
              <button type="button" onClick={() => deleteFood(food.FoodLogID)}>Delete</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
export default Food;
