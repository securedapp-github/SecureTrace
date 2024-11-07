import React, { useState, useEffect, useRef } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const [showLogout, setShowLogout] = useState(false);
    const dropdownRef = useRef(null);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const toggleLogout = () => {
        setShowLogout(!showLogout);
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


    return (
        <nav className="bg-[#303030] p-4 rounded-full flex justify-between items-center mx-4 lg:mx-32 my-4">
            <div className="text-white font-bold text-2xl ml-4 ">
                SecureTrace
            </div>


            <div className="hidden md:flex space-x-8 text-white">
                <Link to="/" className="hover:text-gray-400">Dashboard</Link>
                <Link to="/visualizer" className="hover:text-gray-400">Visualizer</Link>
                <Link to="/portfoliotracker" className="hover:text-gray-400">Portfolio Tracker</Link>
            </div>
            {userEmail ? (
                <div className="relative hidden md:flex" ref={dropdownRef}>
                    <button onClick={toggleLogout} className="hidden md:flex bg-white text-black rounded-full px-4 py-2">{userEmail}</button>
                    {showLogout && (
                        <div className="absolute right-0 mt-12 bg-white text-black rounded-md shadow-lg py-2">
                            <button
                                className="block px-4 py-2 hover:bg-gray-200 w-full text-left"
                                onClick={handleLogout}
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <Link to='/loginpage'>
                    <button className="hidden md:flex bg-white text-black rounded-full px-4 py-2">
                        Login
                    </button>
                </Link>
            )}

            <div className="md:hidden text-white" onClick={toggleMenu}>
                {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </div>

            {isOpen && (
                <div className="absolute top-16 left-0 right-0 bg-[#303030] mt-6 mx-4 text-white flex flex-col items-center space-y-4 py-4 rounded-lg">
                    <Link to="/" className="hover:text-gray-400" onClick={toggleMenu}>Dashboard</Link>
                    <Link to="/visualizer" className="hover:text-gray-400" onClick={toggleMenu}>Visualizer</Link>
                    <Link to="/portfoliotracker" className="hover:text-gray-400" onClick={toggleMenu}>Portfolio Tracker</Link>
                    {userEmail ? (
                        <div className="relative flex md:hidden" ref={dropdownRef}>
                            <button onClick={toggleLogout} className="md:hidden flex bg-white text-black rounded-full px-4 py-2">{userEmail}</button>
                            {showLogout && (
                                <div className="absolute right-0 mt-12 bg-white text-black rounded-md shadow-lg py-2">
                                    <button
                                        className="block px-4 py-2 hover:bg-gray-200 w-full text-left"
                                        onClick={handleLogout}
                                    >
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link to='/loginpage'>
                            <button className="md:hidden flex bg-white text-black rounded-full px-4 py-2">
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
