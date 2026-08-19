import { Navigate, BrowserRouter, Routes, Route } from "react-router-dom";
import { useAppContext } from "./context/AppContext";
import Layout from "./Layout.jsx";
import Profile from "./Profile.jsx";
import Home from "./Home.jsx";
import Activity from "./Activity.jsx";
import Food from "./Food.jsx";
import Login from "./Login.jsx";
import Signup from "./Signup.jsx";
import Onboarding from "./Onboarding.jsx";

// Full-page loading state while we check for a saved session
function AuthLoading() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#020617",
      color: "#94a3b8"
    }}>
      Loading...
    </div>
  );
}

// Guards the main app: must be logged in AND finished onboarding
function RequireApp({ children }) {
  const { authStatus } = useAppContext();

  if (authStatus === "checking") return <AuthLoading />;
  if (authStatus === "guest") return <Navigate to="/login" replace />;
  if (authStatus === "onboarding") return <Navigate to="/onboarding" replace />;

  return children;
}

// Guards the onboarding page: must be logged in but not yet onboarded
function RequireOnboardingInProgress({ children }) {
  const { authStatus } = useAppContext();

  if (authStatus === "checking") return <AuthLoading />;
  if (authStatus === "guest") return <Navigate to="/login" replace />;
  if (authStatus === "ready") return <Navigate to="/" replace />;

  return children;
}

// Guards login/signup: only for logged-out visitors
function RequireGuest({ children }) {
  const { authStatus } = useAppContext();

  if (authStatus === "checking") return <AuthLoading />;
  if (authStatus === "onboarding") return <Navigate to="/onboarding" replace />;
  if (authStatus === "ready") return <Navigate to="/" replace />;

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/login"
          element={
            <RequireGuest>
              <Login />
            </RequireGuest>
          }
        />

        <Route
          path="/signup"
          element={
            <RequireGuest>
              <Signup />
            </RequireGuest>
          }
        />

        <Route
          path="/onboarding"
          element={
            <RequireOnboardingInProgress>
              <Onboarding />
            </RequireOnboardingInProgress>
          }
        />

        <Route
          path="/"
          element={
            <RequireApp>
              <Layout />
            </RequireApp>
          }
        >

          <Route index element={<Home />} />
          <Route path="activity" element={<Activity />} />
          <Route path="profile" element={<Profile />} />
          <Route path="food" element={<Food />} />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
