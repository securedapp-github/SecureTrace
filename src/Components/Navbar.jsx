import React, { useState, useEffect, useRef } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { IoMoonOutline } from "react-icons/io5";
import { TbBrightnessUp } from "react-icons/tb";
import { useTheme } from './ThemeContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [showLogout, setShowLogout] = useState(false);
  const dropdownRef = useRef(null);
  const { darkMode, setModeDark, setModeLight } = useTheme();
  const navigate = useNavigate();

  // Update this useEffect in your Navbar component
  useEffect(() => {
    const checkUserEmail = () => {
      const storedEmail = localStorage.getItem("userEmail");
      setUserEmail(storedEmail || "");
    };

    // Check initially
    checkUserEmail();

    // Add event listeners for both storage and custom userLogin event
    window.addEventListener("storage", checkUserEmail);
    window.addEventListener("userLogin", checkUserEmail);

    return () => {
      window.removeEventListener("storage", checkUserEmail);
      window.removeEventListener("userLogin", checkUserEmail);
    };
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const toggleLogout = () => {
    setShowLogout(!showLogout);
  };

  const toggleTheme = () => {
    if (darkMode) {
      setModeLight();
    } else {
      setModeDark();
    }
  };

  const handleLogout = () => {
    // Clear all auth related items from localStorage
    localStorage.removeItem("userEmail");
    localStorage.removeItem("jwt_token");
    setUserEmail("");
    setShowLogout(false);
    setIsOpen(false); // Close mobile menu if open
    navigate("/login"); // Redirect to login page after logout
  };

  // Handle clicks outside logout dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowLogout(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="bg-[#303030] p-4 rounded-full flex justify-between items-center mx-4 lg:mx-32">
      <div className="ml-4 text-2xl font-bold text-white">SecureTrace</div>

      <div className="hidden space-x-8 text-white lg:flex">
        <Link to="/" className="hover:text-gray-400">
          Dashboard
        </Link>
        <Link to="/visualizer" className="hover:text-gray-400">
          Visualizer
        </Link>
        <Link to="/portfoliotracker" className="hover:text-gray-400">
          Portfolio Tracker
        </Link>
        <Link to="/creditscore" className="hover:text-gray-400">
          Credit Score
        </Link>
      </div>

      {/* Desktop Menu */}
      <div className="relative hidden lg:flex" ref={dropdownRef}>
        <div className="flex items-center gap-4">
          <div
            className="text-2xl text-white cursor-pointer"
            onClick={toggleTheme}
          >
            {darkMode ? <TbBrightnessUp /> : <IoMoonOutline />}
          </div>
          {userEmail ? (
            <>
              <button
                onClick={toggleLogout}
                className="px-4 py-2 text-black bg-white rounded-full"
              >
                {userEmail}
              </button>
              {showLogout && (
                <div className="absolute right-0 py-2 mt-12 text-black bg-white rounded-md shadow-lg top-full">
                  <button
                    className="block w-full px-4 py-2 text-left hover:bg-gray-200"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              )}
            </>
          ) : (
            <Link to="/login">
              <button className="px-4 py-2 text-black bg-white rounded-full">
                Login
              </button>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Menu Button */}
      <div className="flex items-center gap-2 lg:hidden">
        <div
          className="text-2xl text-white cursor-pointer"
          onClick={toggleTheme}
        >
          {darkMode ? <TbBrightnessUp /> : <IoMoonOutline />}
        </div>
        <button className="text-white" onClick={toggleMenu}>
          {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="absolute top-16 left-0 right-0 bg-[#303030] mt-6 mx-4 text-white flex flex-col items-center space-y-4 py-4 rounded-lg lg:hidden">
          <Link to="/" className="hover:text-gray-400" onClick={toggleMenu}>
            Dashboard
          </Link>
          <Link
            to="/visualizer"
            className="hover:text-gray-400"
            onClick={toggleMenu}
          >
            Visualizer
          </Link>
          <Link
            to="/portfoliotracker"
            className="hover:text-gray-400"
            onClick={toggleMenu}
          >
            Portfolio Tracker
          </Link>
          <Link
            to="/creditscore"
            className="hover:text-gray-400"
            onClick={toggleMenu}
          >
            Credit Score
          </Link>
          {userEmail ? (
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-black bg-white rounded-full"
            >
              Logout ({userEmail})
            </button>
          ) : (
            <Link to="/login" onClick={toggleMenu}>
              <button className="px-4 py-2 text-black bg-white rounded-full">
                Login
              </button>
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;