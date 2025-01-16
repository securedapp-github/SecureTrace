import React, { useState, useEffect, useRef } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';
import { Link } from 'react-router-dom';
// import { IoSunnyOutline } from "react-icons/io5";
import { IoMoonOutline } from "react-icons/io5";
import { TbBrightnessUp } from "react-icons/tb";
import { useTheme } from './ThemeContext';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const [showLogout, setShowLogout] = useState(false);
    const dropdownRef = useRef(null);
    // const [isDarkMode, setIsDarkMode] = useState(false);
    const { darkMode, setModeDark, setModeLight } = useTheme();

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const toggleLogout = () => {
        setShowLogout(!showLogout);
    };
    // const toggleTheme = () => {
    //     setIsDarkMode(!isDarkMode); 
    //   };

    const toggleTheme = () => {
        if (darkMode) {
            setModeLight();
        } else {
            setModeDark();
        }
    };


    const handleLogout = () => {
        localStorage.removeItem('userEmail');
        setUserEmail('');
        setShowLogout(false);
    };

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

    useEffect(() => {
        const storedEmail = localStorage.getItem('userEmail');
        if (storedEmail) {
            setUserEmail(storedEmail);
        }
    }, []);

    // useEffect(() => {
    //     if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    //         document.documentElement.classList.remove("dark");
    //         setIsDarkMode(true);
    //     }
    // }, []);


    return (
      <nav className="bg-[#303030] p-4 rounded-full flex justify-between items-center mx-4 lg:mx-32">
        <div className="ml-4 text-2xl font-bold text-white ">SecureTrace</div>

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
        {/* <div className='flex justify-end text-white'>
            <IoSunnyOutline />
            <IoMoonOutline />
            </div> */}
        {userEmail ? (
          <div className="relative hidden lg:flex" ref={dropdownRef}>
            <div className="flex gap-4">
              <div
                className="mt-2 text-2xl text-white cursor-pointer"
                onClick={toggleTheme}
              >
                {/* <IoSunnyOutline /> */}
                {/* <IoMoonOutline /> */}
                {darkMode ? <TbBrightnessUp /> : <IoMoonOutline />}
              </div>
              <button
                onClick={toggleLogout}
                className="hidden px-4 py-2 text-black bg-white rounded-full lg:flex"
              >
                {userEmail}
              </button>
            </div>
            {showLogout && (
              <div className="absolute right-0 py-2 mt-12 text-black bg-white rounded-md shadow-lg">
                <button
                  className="block w-full px-4 py-2 text-left hover:bg-gray-200"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="justify-center hidden gap-4 lg:flex">
            <div
              className="mt-2 text-2xl text-white cursor-pointer"
              onClick={toggleTheme}
            >
              {/* <IoSunnyOutline /> */}
              {/* <IoMoonOutline /> */}
              {darkMode ? <TbBrightnessUp /> : <IoMoonOutline />}
            </div>
            <Link to="/login">
              <button className="hidden px-4 py-2 text-black bg-white rounded-full lg:flex">
                Login
              </button>
            </Link>
          </div>
        )}

        <div className="flex justify-center gap-2 text-white lg:hidden">
          <div
            className="text-2xl text-white cursor-pointer"
            onClick={toggleTheme}
          >
            {/* <IoSunnyOutline /> */}
            {/* <IoMoonOutline /> */}
            {darkMode ? <TbBrightnessUp /> : <IoMoonOutline />}
          </div>
          <div onClick={toggleMenu}>
            {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </div>
        </div>

        {isOpen && (
          <div className="absolute top-16 left-0 right-0 bg-[#303030] mt-6 mx-4 text-white flex flex-col items-center space-y-4 py-4 rounded-lg md:hidden">
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
              <div className="relative flex" ref={dropdownRef}>
                <button
                  onClick={toggleLogout}
                  className="flex px-4 py-2 text-black bg-white rounded-full"
                >
                  {userEmail}
                </button>
                {showLogout && (
                  <div className="absolute right-0 py-2 mt-12 text-black bg-white rounded-md shadow-lg">
                    <button
                      className="block w-full px-4 py-2 text-left hover:bg-gray-200"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login">
                <button className="flex px-4 py-2 text-black bg-white rounded-full">
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
