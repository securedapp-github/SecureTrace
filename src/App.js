import React from "react";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Home from "./Components/Home";
import PortfolioTracker from "./Components/PortfolioTracker";
import Visualizer from "./Components/Visualizer";
import LoginPage from "./Components/LoginPage";
import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";
import CreditScore from "./Components/CreditScore";
// import SecureTransaction from "./Components/SecureTransaction";


function App() {
  return (
    <Router>
      {/* <Navbar /> */}
      <div className="py-4 bg-white dark:bg-[#001938]">
        <Navbar />
      </div>
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<Home />} />
        <Route path="/portfoliotracker" element={<PortfolioTracker />} />
        <Route path="/visualizer/:txHash" component={<Visualizer />} />
        <Route path="/visualizer" element={<Visualizer />} />
        <Route path="/creditscore" element={<CreditScore />} />
      </Routes>
    </Router>
  );
}

export default App;