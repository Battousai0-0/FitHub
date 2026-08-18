import {createContext,useContext,useState,useEffect} from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./Layout.jsx";
import Profile from "./Profile.jsx";
import Home from "./Home.jsx";
import Activity from "./Activity.jsx";
import Food from "./Food.jsx";
function App() {
  return (
    <BrowserRouter>
      <Routes>

    <Route path="/" element={<Layout />}>

        <Route
          index
          element={<Home />}
        />
        <Route
          path="activity"
          element={<Activity />}
        />

        <Route
            path="profile"
            element={<Profile />}
        />

        <Route
            path="food"
            element={<Food />}
        />

    </Route>

</Routes>
    </BrowserRouter>
  );
}

export default App;