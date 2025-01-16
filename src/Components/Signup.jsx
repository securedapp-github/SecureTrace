import React, { useEffect, useState } from "react";
// import c1 from "../images/backg.png";
// import c2 from "../images/ellipse.png";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
// import { showErrorAlert, showSuccessAlert } from "./toastifyalert";
import NewNavbar2 from "./NewNavbar2";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { FaGithub } from "react-icons/fa";
import { IoIosArrowForward } from "react-icons/io";
// import Google from "../images/google.png";
// import Metamask from "../images/metamask-icon.png";
import SecureDapp from "../Assests/SecureDapp.jpeg";
import { toast, ToastContainer } from "react-toastify";

function Signup() {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [email, setEmail] = useState("");

  const navigate = useNavigate();

  function isValidEmail(email) {
    // Regular expression for validating email addresses
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  function handleClick(e) {
    setLoading(true);
    e.preventDefault();
    if (!isValidEmail(email)) {
      //setErrorMessage("Please enter a valid email address.");
      toast.error("Please enter a valid email address.");
      setLoading(false);
    } else {
      navigate("/login1", { state: { email } });
    }
  }

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
            <p className="text-2xl text-blue-700">Create Account</p>
            <div className="flex flex-col">
              <p className="text-black">Already have an account?</p>
              <Link
                to="/login"
                className="flex items-center gap-2 text-blue-700 underline"
              >
                Sign in now
              </Link>
            </div>
          </div>
          <div className="flex items-center justify-center w-full py-4 md:w-1/2">
            <form className="flex flex-col gap-6 w-full md:w-[80%] ">
              <p className="text-black">Use your email or signup with google</p>
              <div>
                <input
                  value={email}
                  name="email"
                  required
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full px-3 md:px-4 py-2.5 md:py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition bg-white"
                />
              </div>

              <button
                onClick={handleClick}
                className="px-6 py-2 ml-auto text-sm text-white transition duration-200 bg-blue-600 rounded-lg ms-auto hover:bg-blue-700 md:text-base"
              >
                {loading ? "Please wait..." : "Sign up"}
              </button>

              {errorMessage && (
                <p className="mb-3 text-red-500">{errorMessage}</p>
              )}
            </form>
          </div>
        </div>
        <div className="flex items-center justify-center gap-1 mx-auto mt-5 ">
          <img src={SecureDapp} alt="SecureDapp logo" className="w-14" />
          <span className="text-lg text-black logo">SecureTrace</span>
        </div>
      </div>
    </div>
  );
}

export default Signup;
