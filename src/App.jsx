import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

// Pages
import Home from "./pages/Home";
import Register from "./pages/Auth/Register";
import Login from "./pages/Auth/Login";
import User from "./pages/user/User";
import FriendProfile from "./pages/Friend/FriendProfile";
import Group from "./pages/Group/Group";

// Components
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "./components/Navbar";

import "./App.css";

// hooks
import { useAuth } from "./hook/useAuth";
import ButtonMenu from "./components/ButtonMenu";
import { useState } from "react";

function App() {
  const { isAuthenticated } = useAuth();

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleToggleMenu = () => {
    setIsMenuOpen((prevIsMenuOpen) => !prevIsMenuOpen);
  };

  return (
    <div className="app">
      <BrowserRouter>
      
        <div className="button-navbar-container">
          {isAuthenticated && <Navbar isOpen={isMenuOpen} />}
          <ButtonMenu onClick={handleToggleMenu} isOpen={isMenuOpen} />
        </div>

        <Routes>
          <Route
            path="/"
            element={isAuthenticated ? <Home /> : <Navigate to="/register" />}
          />
          <Route
            path="/user/:id"
            element={isAuthenticated ? <User /> : <Navigate to="/register" />}
          />
          <Route
            path="/friend/:id"
            element={
              isAuthenticated ? <FriendProfile /> : <Navigate to="/register" />
            }
          />
          <Route
            path="/group/:id"
            element={isAuthenticated ? <Group /> : <Navigate to="/register" />}
          />

          <Route
            path="/register"
            element={isAuthenticated ? <Navigate to="/" /> : <Register />}
          />
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/" /> : <Login />}
          />
        </Routes>

        <ToastContainer theme="dark" />
      </BrowserRouter>
    </div>
  );
}

export default App;
