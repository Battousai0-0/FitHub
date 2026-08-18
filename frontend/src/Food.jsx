import { useState } from "react";
import"./Food.css";
function Food() {

  const [foodLogs, setFoodLogs] = useState([]);

  const [formData, setFormData] = useState({
    foodName: "",
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

    if (!formData.foodName || !formData.calories) {
      return;
    }

    const newFood = {
      id: Date.now(),
      foodName: formData.foodName,
      calories: Number(formData.calories),
      protein: Number(formData.protein) || 0,
      carbs: Number(formData.carbs) || 0,
      fat: Number(formData.fat) || 0
    };

    setFoodLogs((currentLogs) => [
      ...currentLogs,
      newFood
    ]);

    setFormData({
      foodName: "",
      calories: "",
      protein: "",
      carbs: "",
      fat: ""
    });
  };

  const totalCalories = foodLogs.reduce(
    (total, food) => total + food.calories,
    0
  );

  return (
    <div className="food-page">

      <div className="food-page-header">
        <h1>Food</h1>
        <p>Track your daily food intake</p>
      </div>

      <div className="food-content">

        {/* ADD FOOD */}
        <div className="food-card">

          <h2>Add Food</h2>

          <form onSubmit={handleAddFood}>

            <label>
              Food Name
              <input
                type="text"
                name="foodName"
                value={formData.foodName}
                onChange={handleChange}
                placeholder="e.g. Chicken Breast"
              />
            </label>

            <label>
              Calories
              <input
                type="number"
                name="calories"
                value={formData.calories}
                onChange={handleChange}
                placeholder="e.g. 250"
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
              />
            </label>

            <button type="submit">
              Add Food
            </button>

          </form>

        </div>

        {/* FOOD SUMMARY */}
        <div className="food-card">

          <h2>Today's Summary</h2>

          <div className="calorie-summary">
            <strong>{totalCalories}</strong>
            <span>Calories</span>
          </div>

        </div>

        {/* FOOD LOG */}
        <div className="food-card">

          <h2>Food Entries</h2>

          {foodLogs.length === 0 ? (

            <p>No food entries yet.</p>

          ) : (

            foodLogs.map((food) => (

              <div
                className="food-entry"
                key={food.id}
              >

                <strong>
                  {food.foodName}
                </strong>

                <span>
                  {food.calories} kcal
                </span>

              </div>

            ))

          )}

        </div>

      </div>

    </div>
  );
}

export default Food;