import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback
} from "react";

const AppContext = createContext(null);

const DEFAULT_USER = {
  userId: 1,
  fullName: "Demo User",
  email: "user@fithub.com",
  age: 26,
  gender: "Male",
  height: 175,
  weight: 72.5,
  activityLevel: "Moderate",
  goal: "maintain",
  dailyCaloriesIntake: 2000,
  dailyCalorieBurn: 400,
  foodEntries: 3,
  activities: 4
};

const DEFAULT_PROGRESS = [
  {
    ProgressID: 1,
    UserID: 1,
    Weight: 75.0,
    BMI: 24.49,
    BodyFat: 18.5,
    Notes: "Starting fitness journey",
    Date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  },
  {
    ProgressID: 2,
    UserID: 1,
    Weight: 73.8,
    BMI: 24.10,
    BodyFat: 17.8,
    Notes: "Feeling more energetic",
    Date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  },
  {
    ProgressID: 3,
    UserID: 1,
    Weight: 72.5,
    BMI: 23.67,
    BodyFat: 17.2,
    Notes: "Reached milestone weight",
    Date: new Date().toISOString().split("T")[0]
  }
];

const DEFAULT_FOODS = [
  {
    id: 1,
    foodName: "Oatmeal with Blueberries & Honey",
    category: "Breakfast",
    calories: 320,
    protein: 12,
    carbs: 58,
    fat: 6
  },
  {
    id: 2,
    foodName: "Grilled Chicken Breast with Brown Rice",
    category: "Lunch",
    calories: 550,
    protein: 45,
    carbs: 50,
    fat: 10
  },
  {
    id: 3,
    foodName: "Greek Yogurt with Almonds",
    category: "Snack",
    calories: 210,
    protein: 18,
    carbs: 12,
    fat: 9
  }
];

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(DEFAULT_USER);
  const [progressLogs, setProgressLogs] = useState(DEFAULT_PROGRESS);
  const [foodLogs, setFoodLogs] = useState(DEFAULT_FOODS);
  const [waterIntake, setWaterIntake] = useState(1500);
  const [waterGoal, setWaterGoal] = useState(2500);
  const [waterLogs, setWaterLogs] = useState([
    { id: 1, amount: 500, time: "08:30 AM" },
    { id: 2, amount: 500, time: "11:15 AM" },
    { id: 3, amount: 500, time: "02:00 PM" }
  ]);

  // Fetch user profile
  const fetchUser = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:5000/api/profile/1");
      if (!response.ok) throw new Error("Failed to fetch user");
      const data = await response.json();

      setUser((prev) => ({
        ...prev,
        userId: data.UserID || 1,
        fullName: data.FullName || "Demo User",
        email: data.Email || "user@fithub.com",
        age: data.Age ?? prev.age,
        weight: data.WeightKg ?? prev.weight,
        height: data.HeightCm ?? prev.height,
        gender: data.Gender || "Male",
        activityLevel: data.ActivityLevel || "Moderate",
        goal: data.Goal || "maintain",
        activities: data.ActivityCount ?? prev.activities
      }));
    } catch {
      // Backend offline fallback handled gracefully
    }
  }, []);

  // Fetch progress logs
  const fetchProgress = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:5000/api/progress/1");
      if (!response.ok) throw new Error("Failed to fetch progress");
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        setProgressLogs(data);
      }
    } catch {
      // Backend offline fallback
    }
  }, []);

  // Fetch food logs
  const fetchFood = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:5000/api/food/1");
      if (!response.ok) throw new Error("Failed to fetch food");
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        setFoodLogs(data);
      }
    } catch {
      // Backend offline fallback
    }
  }, []);

  // Fetch water logs
  const fetchWater = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:5000/api/water/1");
      if (!response.ok) throw new Error("Failed to fetch water");
      const data = await response.json();
      if (data.todayAmount !== undefined) {
        setWaterIntake(data.todayAmount);
      }
      if (data.goal !== undefined) {
        setWaterGoal(data.goal);
      }
      if (Array.isArray(data.logs)) {
        setWaterLogs(data.logs);
      }
    } catch {
      // Backend offline fallback
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchUser();
    fetchProgress();
    fetchFood();
    fetchWater();
  }, [fetchUser, fetchProgress, fetchFood, fetchWater]);

  // Update user profile
  const updateUser = async (updatedData) => {
    try {
      await fetch(`http://localhost:5000/api/profile/${user.userId || 1}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age: updatedData.age,
          weight: updatedData.weight,
          height: updatedData.height,
          goal: updatedData.goal,
          activityLevel: updatedData.activityLevel
        })
      });
    } catch {
      // Handled in state
    }
    setUser((current) => ({
      ...current,
      ...updatedData
    }));
  };

  // Add Progress log
  const addProgressLog = async (entry) => {
    const newLog = {
      ProgressID: Date.now(),
      UserID: user?.userId || 1,
      Weight: entry.weight,
      BMI: entry.height ? Number((entry.weight / Math.pow(entry.height / 100, 2)).toFixed(2)) : null,
      BodyFat: entry.bodyFat || null,
      Notes: entry.notes || "",
      Date: entry.date || new Date().toISOString().split("T")[0]
    };

    setProgressLogs((prev) => [newLog, ...prev]);

    // Also update user's current weight in profile
    setUser((prev) => ({
      ...prev,
      weight: entry.weight
    }));

    try {
      await fetch(`http://localhost:5000/api/progress/${user?.userId || 1}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry)
      });
    } catch {
      // Saved in state
    }
  };

  // Delete Progress log
  const deleteProgressLog = async (progressId) => {
    setProgressLogs((prev) => prev.filter((p) => (p.ProgressID || p.id) !== progressId));
    try {
      await fetch(`http://localhost:5000/api/progress/${user?.userId || 1}/${progressId}`, {
        method: "DELETE"
      });
    } catch {
      // Saved in state
    }
  };

  // Log water intake
  const logWater = async (amount) => {
    const addAmt = Number(amount);
    if (!addAmt || addAmt <= 0) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const newEntry = { id: Date.now(), amount: addAmt, time: timeStr };

    setWaterIntake((prev) => prev + addAmt);
    setWaterLogs((prev) => [newEntry, ...prev]);

    try {
      await fetch(`http://localhost:5000/api/water/${user?.userId || 1}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: addAmt })
      });
    } catch {
      // Saved in state
    }
  };

  // Reset water intake
  const resetWater = async () => {
    setWaterIntake(0);
    setWaterLogs([]);
    try {
      await fetch(`http://localhost:5000/api/water/${user?.userId || 1}/reset`, {
        method: "POST"
      });
    } catch {
      // Handled
    }
  };

  // Update water goal
  const updateWaterGoal = async (newGoal) => {
    const goalNum = Number(newGoal);
    if (!goalNum || goalNum <= 0) return;
    setWaterGoal(goalNum);
    try {
      await fetch(`http://localhost:5000/api/water/${user?.userId || 1}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal: goalNum })
      });
    } catch {
      // Handled
    }
  };

  // Add Food log
  const addFoodLog = async (foodItem) => {
    const newFood = {
      id: Date.now(),
      foodName: foodItem.foodName,
      category: foodItem.category || "Breakfast",
      calories: Number(foodItem.calories),
      protein: Number(foodItem.protein) || 0,
      carbs: Number(foodItem.carbs) || 0,
      fat: Number(foodItem.fat) || 0
    };

    setFoodLogs((prev) => [...prev, newFood]);

    try {
      await fetch(`http://localhost:5000/api/food/${user?.userId || 1}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(foodItem)
      });
    } catch {
      // Handled
    }
  };

  // Delete Food log
  const deleteFoodLog = async (foodId) => {
    setFoodLogs((prev) => prev.filter((f) => f.id !== foodId));
    try {
      await fetch(`http://localhost:5000/api/food/${user?.userId || 1}/${foodId}`, {
        method: "DELETE"
      });
    } catch {
      // Handled
    }
  };

  // Logout
  const logout = () => {
    setUser(null);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        fetchUser,
        updateUser,
        logout,
        progressLogs,
        addProgressLog,
        deleteProgressLog,
        waterIntake,
        waterGoal,
        waterLogs,
        logWater,
        resetWater,
        updateWaterGoal,
        foodLogs,
        addFoodLog,
        deleteFoodLog,
        allFoodLogs: foodLogs,
        allActivityLogs: []
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  return useContext(AppContext);
};