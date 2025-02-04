import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import NewNavbar2 from "./NewNavbar2";
import SecureDapp from "../Assests/SecureTracelogo.png";
import { toast, ToastContainer } from "react-toastify";


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

    // Check if the response contains the expected data
    if (response.data && response.data.token) {
      console.log("JWT Token:", response.data.token);
      localStorage.setItem("jwt_token", response.data.token);

      // Store email in localStorage
      localStorage.setItem("userEmail", email);

      // Dispatch a custom event to notify the Navbar
      window.dispatchEvent(new Event("userLogin"));

      toast.success("OTP verified successfully!");

      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } else {
      toast.error("Invalid OTP. Please try again.");
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    if (error.response) {
      // Check if the server returned a specific error message
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
    <div className="font-poppin bg-[#FAFAFA] dark:bg-[#001938] min-h-screen pb-10 dark:shadow-lg">
      <NewNavbar2 />
      <div className="w-full h-full px-2 pt-20 sm:px-5 md:px-10 lg:px-20 sm:pt-32 md:pt-40">
        <div className="flex flex-wrap justify-center w-full p-4 py-20 bg-white shadow rounded-2xl dark:border dark:bg-[#001938]">
          <div className="flex flex-col items-start justify-start w-full h-full gap-4 md:w-1/2 md:px-16">
            <p className="font-semibold text-black dark:text-white">
              Blockchain Forensic
            </p>
            <p className="text-2xl font-semibold text-green-600">Sign in</p>
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
                  className="w-full px-3 md:px-4 py-2.5 md:py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-500 outline-none transition bg-white"
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
        <div className="flex items-center justify-center gap-1 mx-auto mt-5">
          <img src={SecureDapp} alt="SecureTrace logo" className="w-14" />
          <span className="text-lg text-black dark:text-white logo">
            SecureTrace
          </span>
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
  );
}

export default Login;
