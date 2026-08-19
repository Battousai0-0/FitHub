import { createContext, useContext, useEffect, useState } from "react";

const AppContext = createContext(null);
export const API_BASE = "http://localhost:5000";
const STORAGE_KEY = "fithub_userId";

const mapProfileToUser = (data) => ({
  userId: data.UserID,
  fullName: data.Username,
  email: data.Email,
  createdAt: data.CreatedAt,
  age: data.Age,
  weight: data.WeightKg,
  height: data.HeightCm,
  gender: data.Gender,
  activityLevel: data.ActivityLevel,
  goal: data.Goal,
  dailyCaloriesIntake: Number(data.DailyCalorieIntake ?? 2000),
  dailyCalorieBurnTarget: Number(data.DailyCalorieBurn ?? 0),
  dailyCaloriesConsumed: Number(data.DailyCaloriesConsumed ?? 0),
  dailyCaloriesBurned: Number(data.DailyCaloriesBurned ?? 0),
  dailyWorkoutMinutes: Number(data.DailyWorkoutMinutes ?? 0),
  foodEntries: Number(data.FoodEntryCount ?? 0),
  activities: Number(data.ActivityCount ?? 0),
  netCalories: Number(data.DailyCaloriesConsumed ?? 0) - Number(data.DailyCaloriesBurned ?? 0),
  onboarded: !!data.Onboarded
});

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authStatus, setAuthStatus] = useState("checking");

  const fetchUser = async (userId) => {
    const response = await fetch(`${API_BASE}/api/profile/${userId}`);
    if (!response.ok) throw new Error("Failed to fetch user");
    const userData = mapProfileToUser(await response.json());
    setUser(userData);
    setAuthStatus(userData.onboarded ? "ready" : "onboarding");
    return userData;
  };

  useEffect(() => {
    const storedUserId = localStorage.getItem(STORAGE_KEY);
    if (!storedUserId) {
      setAuthStatus("guest");
      return;
    }
    fetchUser(storedUserId).catch((error) => {
      console.error("FETCH USER ERROR:", error);
      localStorage.removeItem(STORAGE_KEY);
      setUser(null);
      setAuthStatus("guest");
    });
  }, []);

  const signup = async (username, email, password) => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), email: email.trim().toLowerCase(), password })
      });
      const data = await response.json();
      if (!response.ok) return { success: false, message: data.message || "Sign up failed" };

      localStorage.setItem(STORAGE_KEY, String(data.userId));
      setUser({ userId: data.userId, fullName: data.username, email: data.email, onboarded: false });
      setAuthStatus("onboarding");
      return { success: true };
    } catch (error) {
      console.error("SIGNUP ERROR:", error);
      return { success: false, message: "Could not reach the server" };
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password })
      });
      const data = await response.json();
      if (!response.ok) return { success: false, message: data.message || "Login failed" };

      localStorage.setItem(STORAGE_KEY, String(data.userId));
      await fetchUser(data.userId);
      return { success: true };
    } catch (error) {
      console.error("LOGIN ERROR:", error);
      return { success: false, message: "Could not reach the server. Make sure the backend is running." };
    }
  };

  const completeOnboarding = async (onboardingData) => {
    try {
      const response = await fetch(`${API_BASE}/api/onboarding/${user.userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(onboardingData)
      });
      const data = await response.json();
      if (!response.ok) return { success: false, message: data.message || "Failed to save your info" };
      await fetchUser(user.userId);
      return { success: true };
    } catch (error) {
      console.error("ONBOARDING ERROR:", error);
      return { success: false, message: "Could not reach the server" };
    }
  };

  const updateUser = async (updatedData) => {
    try {
      const response = await fetch(`${API_BASE}/api/profile/${user.userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to update profile");
      await fetchUser(user.userId);
      return { success: true };
    } catch (error) {
      console.error("UPDATE USER ERROR:", error);
      return { success: false, message: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
    setAuthStatus("guest");
  };

  const refreshUser = () => user?.userId ? fetchUser(user.userId) : Promise.resolve(null);

  return (
    <AppContext.Provider value={{
      user, authStatus, setUser, fetchUser, refreshUser,
      signup, login, completeOnboarding, updateUser, logout
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
