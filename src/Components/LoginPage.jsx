import React, { useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import NewNavbar from "./NewNavbar2";
import Footer from "./Footer";

function Login() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOtp = async () => {
    if (!email) {
      toast.error("Please enter a valid email.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        "https://139-59-5-56.nip.io:3443/traceSendOtp",
        { email }
      );
      toast.success("OTP sent successfully!");
      console.log("Response:", response.data);
      setOtpSent(true);
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast.error("Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!email || !otp) {
      toast.error("Please enter your email and OTP.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        "https://139-59-5-56.nip.io:3443/traceVerifyOtp",
        {
          email: email,
          otp: parseInt(otp),
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data) {
        console.log("JWT Token:", response.data.token);
        localStorage.setItem("jwt_token", response.data.token);

        // Store email in localStorage
        localStorage.setItem("userEmail", email);

        // Dispatch a custom event to notify the Navbar
        window.dispatchEvent(new Event("userLogin"));

        toast.success("OTP verified successfully!");

        setTimeout(() => {
          navigate("/");
        }, 1000);
      } else {
        toast.error("Invalid OTP. Please try again.");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      if (error.response) {
        toast.error(
          error.response.data.message || "Invalid OTP. Please try again."
        );
      } else if (error.request) {
        toast.error("No response from server. Please try again.");
      } else {
        toast.error("Failed to verify OTP. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#001938]">
      <NewNavbar />
      <div className="pb-10 shadow-lg min-h-scree font-poppin">
        <div className="w-full h-full px-2 pt-20 sm:px-5 md:px-10 lg:px-20 sm:pt-32 md:pt-40">
          <div className="flex flex-wrap justify-center w-full p-4 py-10 bg-white dark:bg-[#001938] shadow-lg rounded-2xl border">
            <div className="flex flex-col items-start justify-start w-full h-full gap-4 md:w-1/2 md:px-16">
              <p className="text-2xl text-black dark:text-white">Realtime Security</p>
              <p className="text-3xl text-green-500">Sign in</p>
            </div>
            <div className="flex items-center justify-center w-full py-4 md:w-1/2">
              <form
                onSubmit={(e) => e.preventDefault()}
                className="flex flex-col gap-6 w-full md:w-[80%] "
              >
                <div>
                  <input
                    id="email"
                    name="email"
                    value={email}
                    type="email"
                    placeholder="Email"
                    required
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 md:px-4 py-2.5 md:py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition bg-white"
                  />
                </div>
                {!otpSent && (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="px-6 py-2 ml-auto text-sm text-white transition duration-200 bg-green-600 rounded-lg ms-auto hover:bg-green-700 md:text-base"
                  >
                    {loading ? "Sending..." : "Send OTP"}
                  </button>
                )}
                {otpSent && (
                  <>
                    <div>
                      <input
                        id="otp"
                        name="otp"
                        value={otp}
                        type="text"
                        placeholder="Enter OTP"
                        required
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-full px-3 md:px-4 py-2.5 md:py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition bg-white"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      className="px-6 py-2 ml-auto text-sm text-white transition duration-200 bg-green-600 rounded-lg ms-auto hover:bg-green-700 md:text-base"
                    >
                      {loading ? "Verifying..." : "Verify OTP"}
                    </button>
                  </>
                )}
              </form>
            </div>
          </div>
        </div>
        <ToastContainer
          position="top-center"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          theme="colored"
        />
      </div>
      <Footer />
    </div>
  );
}

export default Login;


// import React, { useState, useEffect, useRef } from 'react';
// import { FaBars, FaTimes } from 'react-icons/fa';
// import { Link } from 'react-router-dom';
// // import { IoSunnyOutline } from "react-icons/io5";
// import { IoMoonOutline } from "react-icons/io5";
// import { TbBrightnessUp } from "react-icons/tb";
// import { useTheme } from './ThemeContext';

// const Navbar = () => {
//     const [isOpen, setIsOpen] = useState(false);
//     const [userEmail, setUserEmail] = useState('');
//     const [showLogout, setShowLogout] = useState(false);
//     const dropdownRef = useRef(null);
//     // const [isDarkMode, setIsDarkMode] = useState(false);
//     const { darkMode, setModeDark, setModeLight } = useTheme();

//     const toggleMenu = () => {
//         setIsOpen(!isOpen);
//     };

//     const toggleLogout = () => {
//         setShowLogout(!showLogout);
//     };
//     // const toggleTheme = () => {
//     //     setIsDarkMode(!isDarkMode); 
//     //   };

//     const toggleTheme = () => {
//         if (darkMode) {
//             setModeLight();
//         } else {
//             setModeDark();
//         }
//     };


//     const handleLogout = () => {
//         localStorage.removeItem('userEmail');
//         setUserEmail('');
//         setShowLogout(false);
//     };

//     useEffect(() => {
//         const handleClickOutside = (event) => {
//             if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//                 setShowLogout(false);
//             }
//         };

//         document.addEventListener("mousedown", handleClickOutside);

//         return () => {
//             document.removeEventListener("mousedown", handleClickOutside);
//         };
//     }, []);

//     useEffect(() => {
//         const storedEmail = localStorage.getItem('userEmail');
//         if (storedEmail) {
//             setUserEmail(storedEmail);
//         }
//     }, []);

//     // useEffect(() => {
//     //     if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
//     //         document.documentElement.classList.remove("dark");
//     //         setIsDarkMode(true);
//     //     }
//     // }, []);


//     return (
//       <nav className="bg-[#303030] p-4 rounded-full flex justify-between items-center mx-4 lg:mx-32">
//         <div className="ml-4 text-2xl font-bold text-white ">SecureTrace</div>

//         <div className="hidden space-x-8 text-white lg:flex">
//           <Link to="/" className="hover:text-gray-400">
//             Dashboard
//           </Link>
//           <Link to="/visualizer" className="hover:text-gray-400">
//             Visualizer
//           </Link>
//           <Link to="/portfoliotracker" className="hover:text-gray-400">
//             Portfolio Tracker
//           </Link>
//           <Link to="/creditscore" className="hover:text-gray-400">
//             Credit Score
//           </Link>
//         </div>
//         {/* <div className='flex justify-end text-white'>
//             <IoSunnyOutline />
//             <IoMoonOutline />
//             </div> */}
//         {userEmail ? (
//           <div className="relative hidden lg:flex" ref={dropdownRef}>
//             <div className="flex gap-4">
//               <div
//                 className="mt-2 text-2xl text-white cursor-pointer"
//                 onClick={toggleTheme}
//               >
//                 {/* <IoSunnyOutline /> */}
//                 {/* <IoMoonOutline /> */}
//                 {darkMode ? <TbBrightnessUp /> : <IoMoonOutline />}
//               </div>
//               <button
//                 onClick={toggleLogout}
//                 className="hidden px-4 py-2 text-black bg-white rounded-full lg:flex"
//               >
//                 {userEmail}
//               </button>
//             </div>
//             {showLogout && (
//               <div className="absolute right-0 py-2 mt-12 text-black bg-white rounded-md shadow-lg">
//                 <button
//                   className="block w-full px-4 py-2 text-left hover:bg-gray-200"
//                   onClick={handleLogout}
//                 >
//                   Logout
//                 </button>
//               </div>
//             )}
//           </div>
//         ) : (
//           <div className="justify-center hidden gap-4 lg:flex">
//             <div
//               className="mt-2 text-2xl text-white cursor-pointer"
//               onClick={toggleTheme}
//             >
//               {/* <IoSunnyOutline /> */}
//               {/* <IoMoonOutline /> */}
//               {darkMode ? <TbBrightnessUp /> : <IoMoonOutline />}
//             </div>
//             <Link to="/login">
//               <button className="hidden px-4 py-2 text-black bg-white rounded-full lg:flex">
//                 Login
//               </button>
//             </Link>
//           </div>
//         )}

//         <div className="flex justify-center gap-2 text-white lg:hidden">
//           <div
//             className="text-2xl text-white cursor-pointer"
//             onClick={toggleTheme}
//           >
//             {/* <IoSunnyOutline /> */}
//             {/* <IoMoonOutline /> */}
//             {darkMode ? <TbBrightnessUp /> : <IoMoonOutline />}
//           </div>
//           <div onClick={toggleMenu}>
//             {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
//           </div>
//         </div>

//         {isOpen && (
//           <div className="absolute top-16 left-0 right-0 bg-[#303030] mt-6 mx-4 text-white flex flex-col items-center space-y-4 py-4 rounded-lg md:hidden">
//             <Link to="/" className="hover:text-gray-400" onClick={toggleMenu}>
//               Dashboard
//             </Link>
//             <Link
//               to="/visualizer"
//               className="hover:text-gray-400"
//               onClick={toggleMenu}
//             >
//               Visualizer
//             </Link>
//             <Link
//               to="/portfoliotracker"
//               className="hover:text-gray-400"
//               onClick={toggleMenu}
//             >
//               Portfolio Tracker
//             </Link>
//             <Link
//               to="/creditscore"
//               className="hover:text-gray-400"
//               onClick={toggleMenu}
//             >
//               Credit Score
//             </Link>
//             {userEmail ? (
//               <div className="relative flex" ref={dropdownRef}>
//                 <button
//                   onClick={toggleLogout}
//                   className="flex px-4 py-2 text-black bg-white rounded-full"
//                 >
//                   {userEmail}
//                 </button>
//                 {showLogout && (
//                   <div className="absolute right-0 py-2 mt-12 text-black bg-white rounded-md shadow-lg">
//                     <button
//                       className="block w-full px-4 py-2 text-left hover:bg-gray-200"
//                       onClick={handleLogout}
//                     >
//                       Logout
//                     </button>
//                   </div>
//                 )}
//               </div>
//             ) : (
//               <Link to="/login">
//                 <button className="flex px-4 py-2 text-black bg-white rounded-full">
//                   Login
//                 </button>
//               </Link>
//             )}
//           </div>
//         )}
//       </nav>
//     );
// };

// export default Navbar;