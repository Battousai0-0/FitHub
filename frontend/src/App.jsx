import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./layout.jsx";
import Profile from "./Profile.jsx";
import Home from "./Home.jsx";
import Activity from "./Activity.jsx";
import Food from "./Food.jsx";
import Progress from "./Progress.jsx";
import Admin from "./Admin.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="activity" element={<Activity />} />
          <Route path="food" element={<Food />} />
          <Route path="progress" element={<Progress />} />
          <Route path="profile" element={<Profile />} />
          <Route path="admin" element={<Admin />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;