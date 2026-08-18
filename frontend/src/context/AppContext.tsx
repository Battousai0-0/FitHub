import {
  createContext,
  useContext,
  useState,
  useEffect
} from "react";

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {

  const [user, setUser] = useState(null);

  // Get user from backend
  const fetchUser = async () => {
    try {
      console.log("Fetching user...");

      const response = await fetch(
        "http://localhost:5000/api/profile/1"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch user");
      }

      const data = await response.json();

      console.log("API DATA:", data);

      const userData = {
        userId: data.UserID,
        fullName: data.FullName,
        email: data.Email,

        age: data.Age,
        weight: data.WeightKg,
        height: data.HeightCm,
        gender: data.Gender,

        activityLevel: data.ActivityLevel,
        goal: data.Goal,

        dailyCaloriesIntake: 2000,
        dailyCalorieBurn: 400,

        foodEntries: 0,
        activities:  data.ActivityCount,
      };

      console.log("USER DATA:", userData);

      setUser(userData);

    } catch (error) {
      console.error("FETCH USER ERROR:", error);
    }
  };


  // Fetch user once when AppProvider loads
  useEffect(() => {
    fetchUser();
  }, []);


  // Update frontend state
  const updateUser = async (updatedData) => {
    try {
        console.log("Updating user...", updatedData);

        const response = await fetch(
            `http://localhost:5000/api/profile/${user.userId}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    age: updatedData.age,
                    weight: updatedData.weight,
                    height: updatedData.height,
                    goal: updatedData.goal
                })
            }
        );

        if (!response.ok) {
            throw new Error("Failed to update profile");
        }

        const data = await response.json();

        console.log("UPDATE RESPONSE:", data);

        // Update React state after database update succeeds
        setUser((currentUser) => ({
            ...currentUser,
            ...updatedData
        }));

    } catch (error) {
        console.error("UPDATE USER ERROR:", error);
    }
};


  // Logout
  const logout = () => {
    setUser(null);
  };


  // Temporary frontend arrays
  const allFoodLogs = [];

  const allActivityLogs = [];


  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        fetchUser,
        updateUser,
        logout,
        allFoodLogs,
        allActivityLogs
      }}
    >
      {children}
    </AppContext.Provider>
  );
};


export const useAppContext = () => {
  return useContext(AppContext);
};