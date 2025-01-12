import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
// import { baseUrl } from "../Constants/data";
import NewNavbar2 from "./NewNavbar2";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
// import { FaGithub } from "react-icons/fa";
import { IoIosArrowForward } from "react-icons/io";
// import Google from "../images/google.png";
// import Metamask from "../images/metamask-icon.png";
import SecureDapp from "../Assests/SecureDapp.jpeg";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const u_name = event.target.name.value;
      const u_password = event.target.password.value;
      if (u_name === "" || u_password === "") {
        //setErrorMessage("Enter the userame and password");
        showErrorAlert("Invalid email or password.");
      } else {
        const response = await axios.post(`/login_securewatch`, {
          email,
          password,
        });

        console.log("Login Successful:", response.data);
        const userId = response.data.user.id;
        console.log("userId", userId);
        localStorage.setItem("userId", userId);
        const token = response.data.token;
        const monitor = response.data.monitors;
        console.log("token", token);
        const Email = response.data.user.email;
        const credits = response.data.user.credits;
        const planexpiry = response.data.user.planexpiry;
        console.log("credits", credits);
        console.log("planexpiry", planexpiry);
        let login = localStorage.setItem("login", true);
        // console.log(login);
        let Token = localStorage.setItem("token", token);
        let Monitor = localStorage.setItem("moniter", monitor);
        let userEmail = localStorage.setItem("email", Email);
        let userCredits = localStorage.setItem("credits", credits);
        let userPlanexpiry = localStorage.setItem("planexpiry", planexpiry);

        showSuccessAlert("Login Successful");
        navigate("/dashboard", { state: { userId, email, monitor, token } });
      }
    } catch (error) {
      // setErrorMessage("Invalid email or password.");
      toast.error("Invalid email or password.");
    }
  };

  useEffect(() => {
    const login = localStorage.getItem("login");
    if (login) {
      navigate("/dashboard");
    }
  }, []);

  return (
    <div className="font-poppin bg-[#FAFAFA] min-h-screen pb-10">
      <NewNavbar2 />
      <div className="w-full h-full px-2 pt-20 sm:px-5 md:px-10 lg:px-20 sm:pt-32 md:pt-40">
        <div className="flex flex-wrap justify-center w-full p-4 py-10 bg-white shadow rounded-2xl">
          <div className="flex flex-col items-start justify-start w-full h-full gap-4 md:w-1/2 md:px-16">
            <p className="text-black">Realtime Security</p>
            <p className="text-2xl text-blue-700">Sign in</p>
            <Link
              to="/signup"
              className="flex items-center gap-2 text-blue-700"
            >
              <IoIosArrowForward /> Create Account
            </Link>
          </div>
          <div className="flex items-center justify-center w-full py-4 md:w-1/2">
            <form
              onSubmit={handleSubmit}
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
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  id="password"
                  name="password"
                  value={password}
                  required
                  onChange={(e) => setPassword(e.target.value)}
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

              <div className="flex flex-col flex-wrap justify-between gap-2 md:flex-row md:items-center">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-5 h-5 text-blue-600 bg-white border-2 rounded checkbox focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 md:text-base text-nowrap">
                    Remember me
                  </span>
                </label>
                <Link
                  to="/forgotpassword"
                  className="text-sm text-blue-600 md:text-base hover:text-blue-700 text-nowrap"
                >
                  Forgot Password?
                </Link>
              </div>

              <button
                type="submit"
                className="px-6 py-2 ml-auto text-sm text-white transition duration-200 bg-blue-600 rounded-lg ms-auto hover:bg-blue-700 md:text-base"
              >
                Sign in
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

export default Login;