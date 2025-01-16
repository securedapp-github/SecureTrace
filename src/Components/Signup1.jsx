import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { showErrorAlert, showSuccessAlert } from "./toastifyalert";
import { baseUrl } from "../Constants/data";
import NewNavbar2 from "./NewNavabr2";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { FaGithub } from "react-icons/fa";
import { IoIosArrowForward } from "react-icons/io";
import Google from "../images/google.png";
import Metamask from "../images/metamask-icon.png";
import SecureDapp from "../images/SecureDapp.png";

function Signup1() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({});
  const [email1, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const email = location.state ? location.state.email : null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value.trim() });
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const u_name = formData.name;
      const u_password = formData.password;
      if (
        !email ||
        email === "" ||
        u_name === "" ||
        u_password === "" ||
        !u_name ||
        !u_password
      ) {
        // setErrorMessage("Enter the Email, userame and password");
        showErrorAlert("Enter the Email, userame and password");
      } else {
        const response = await axios.post(`${baseUrl}/signup_securewatch`, {
          name: u_name,
          email,
          password: u_password,
        });
        console.log("response", response);
        if (response.status === 400) {
          //setErrorMessage("User already exists. Please login.");
          showErrorAlert("User already exists. Please login.");
          setLoading(false);
        }
        showSuccessAlert("You are signed up successfully.");
        navigate("/login");
      }
    } catch (error) {
      if (error.response.status === 400) {
        showErrorAlert("User already exists. Please login.");
        setLoading(false);
        return;
      }
      console.log("Error signing up:", error);
      setLoading(false);
      //setErrorMessage("Error signing up. Please try again.");
      showErrorAlert("Error signing up. Please try again.");
    }
  };

  useEffect(() => {
    const login = localStorage.getItem("login");
    if (login) {
      navigate("/dashboard");
    }
  }, []);

  const [vis, setVis] = useState("password");
  const handleToggle = () => {
    if (vis === "password") setVis("text");
    else setVis("password");
  };
  const [enabled, setEnabled] = useState(false);
  return (
    <div className="font-poppin bg-[#FAFAFA] min-h-screen pb-10">
      <NewNavbar2 />
      <div className="w-full h-full px-2 pt-20 sm:px-5 md:px-10 lg:px-20 sm:pt-32 md:pt-40">
        <div className="flex flex-wrap justify-center w-full p-4 py-10 bg-white shadow rounded-2xl">
          <div className="flex flex-col items-start justify-start w-full h-full gap-4 md:w-1/2 md:px-16">
            <p className="text-black">Realtime Security</p>
            <p className="text-2xl text-blue-700">
              Welcome to <br />
              SecureWatch
            </p>
            <p className="text-black">
              You have taken first step towards secure. <br /> to get started,
              enter your name and set a <br /> passward
            </p>
          </div>
          <div className="flex items-center justify-center w-full py-4 md:w-1/2">
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-6 w-full md:w-[80%] "
            >
              <div>
                <input
                  type="text"
                  placeholder="Enter your name"
                  id="name"
                  name="name"
                  onChange={handleChange}
                  autoComplete="off"
                  required
                  className="w-full px-3 md:px-4 py-2.5 md:py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition bg-white"
                />
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  id="password"
                  name="password"
                  onChange={handleChange}
                  autoComplete="off"
                  required
                  className="w-full px-3 md:px-4 py-2.5 md:py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute text-gray-500 transform -translate-y-1/2 right-3 top-1/2"
                >
                  {showPassword ? (
                    <AiOutlineEyeInvisible className="w-5 h-5" />
                  ) : (
                    <AiOutlineEye className="w-5 h-5" />
                  )}
                </button>
              </div>

              <button
                type="submit"
                className="px-6 py-2 ml-auto text-sm text-white transition duration-200 bg-blue-600 rounded-lg ms-auto hover:bg-blue-700 md:text-base"
              >
                {loading ? "Please wait..." : "Sign up"}
              </button>

              {errorMessage && (
                <p className="mb-3 text-red-500">{errorMessage}</p>
              )}

              {/* <div className="grid grid-cols-3 gap-3 md:gap-4 ">
                <button className="flex items-center justify-center p-2.5 md:p-3 border-2 rounded-lg hover:bg-gray-50 transition">
                  <img src={Google} alt="Google Logo" />
                </button>
                <button className="flex items-center justify-center p-2.5 md:p-3 border-2 rounded-lg hover:bg-gray-50 transition">
                  <img src={Metamask} alt="Metamask Logo" className="w-6 h-6" />
                </button>
                <button className="flex items-center justify-center p-2.5 md:p-3 border-2 rounded-lg hover:bg-gray-50 transition">
                  <FaGithub className="w-5 h-5 text-black md:w-6 md:h-6" />
                </button>
              </div> */}
            </form>
          </div>
        </div>
        <div className="flex items-center justify-center gap-1 mx-auto mt-5 ">
          <img src={SecureDapp} alt="SecureDapp logo" className="w-14" />
          <span className="text-lg text-black logo">SecureDapp</span>
        </div>
      </div>
    </div>
  );
}

export default Signup1;
