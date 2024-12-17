import React, { useState } from 'react';
import axios from 'axios';
import Footer from './Footer';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { DevUrl } from '../Constants';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: DevUrl,
  headers: {
    "ngrok-skip-browser-warning": "true",
    "Content-Type": "application/json",
  },
});

const CreditScore = () => {
  const [activeTab, setActiveTab] = useState("wallet");
  const [inputValue, setInputValue] = useState("");
  const [validatedData, setValidatedData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [creditScore, setCreditScore] = useState(null);

  const fetchCreditScore = async (address) => {
    setIsLoading(true);
    try {
      const endpoint = activeTab === "wallet" ? '/wallet-credit-score' : '/sc-credit-score';
      const { data } = await apiClient.post(endpoint, { address });

      console.log("score:", data);

      if (activeTab === "wallet") {
        setCreditScore(data);
      } else {
        setCreditScore({
          creditScore: Math.round(data.creditScore),
          successPc: Math.round(data.successPc),
          verificationStatus: data.verificationStatus,
          diversityScore: parseFloat(data.diversityScore.toFixed(2)), // Keeps diversity score to 2 decimal places
        });
      }

      return true;
    } catch (error) {
      console.error('Error fetching credit score:', error);

      let errorMessage = "Failed to fetch credit score. Please try again.";

      if (error.response) {
        switch (error.response.status) {
          case 404:
            errorMessage = "Credit score endpoint not found.";
            break;
          case 400:
            errorMessage = error.response.data.message || "Invalid request. Please check your input.";
            break;
          case 500:
            errorMessage = "Server error. Please try again later.";
            break;
          default:
            errorMessage = error.response.data.message || "An unexpected error occurred.";
        }
      } else if (error.request) {
        errorMessage = "Could not connect to the server. Please check your connection.";
      }

      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const validateInput = async () => {
    const walletRegex = /^0x[a-fA-F0-9]{40}$/;
    const isValid = walletRegex.test(inputValue);

    if (!isValid) {
      toast.error("Invalid address. Please enter a valid value.");
      setInputValue("");
      return;
    }

    const scoresFetched = await fetchCreditScore(inputValue);

    if (scoresFetched) {
      toast.success(
        `${activeTab === "wallet" ? "Wallet address" : "Smart Contract"} is valid!`
      );
      setValidatedData({
        type: activeTab,
        value: inputValue,
      });
      setInputValue("");
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setValidatedData(null);
    setCreditScore(null);
  };

  return (
    <div className="bg-white dark:bg-[#001938] min-h-screen">
      <div className="flex justify-center py-10">
        <div>
          <button
            className={`py-6 px-6 md:px-32 border border-green-500 dark:border-white/70 rounded-l-xl shadow-xl text-2xl ${
              activeTab === "wallet"
                ? "bg-green-500 text-black"
                : "hover:text-gray-500 dark:text-white"
            } hover:scale-90 hover:rounded-xl`}
            onClick={() => handleTabChange("wallet")}
          >
            Wallet
          </button>
        </div>
        <div>
          <button
            className={`py-6 px-6 md:px-32 border border-green-500 dark:border-white/70 rounded-r-xl shadow-xl text-2xl ${
              activeTab === "smartContract"
                ? "bg-green-500 text-black"
                : "hover:text-gray-300 dark:text-white"
            } hover:scale-90 hover:rounded-xl`}
            onClick={() => handleTabChange("smartContract")}
          >
            Smart Contract
          </button>
        </div>
      </div>

      <div>
        {validatedData ? (
          <div className="my-20">
            <p className="text-lg text-start ml-10 font-semibold text-gray-700 dark:text-gray-200">
              {validatedData.type === "wallet" ? "Wallet Address" : "Smart Contract Address"}
              : <span className="text-green-500">
                {`${validatedData.value.slice(0, 5)}...${validatedData.value.slice(-4)}`}
              </span>
            </p>
            <div className="text-center">
              {isLoading ? (
                <div className="animate-pulse text-green-500 text-3xl font-bold">
                  Loading...
                </div>
              ) : activeTab === "wallet" ? (
                <div>
                <h1 className="text-black dark:text-white text-2xl">Credit Score</h1>
                <h1 className="text-green-500 text-3xl font-bold">{creditScore}</h1>
                </div>
              ) : (
                creditScore && (
                  <div className="mt-10 text-center">
                    <h1 className="text-lg font-bold text-gray-700 dark:text-white">
                      Smart Contract Analysis
                    </h1>
                    <p className="text-green-500 text-3xl font-bold mt-4">
                      Credit Score: {creditScore.creditScore}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 mt-2">
                      Transaction Success Percentage: {creditScore.successPc} %
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 mt-2">
                      Verification Status: {creditScore.verificationStatus}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 mt-2">
                      Diversity Score: {creditScore.diversityScore}
                    </p>
                  </div>
                )
              )}
            </div>
            <p className="text-gray-500 mt-4 text-center">
              Your {validatedData.type} is valid. Analysis is available.
            </p>
          </div>
        ) : (
          <div className="flex justify-center my-20">
            <div className="items-center w-80 md:w-full md:max-w-3xl">
              <input
                type="text"
                placeholder={`Enter ${
                  activeTab === "wallet" ? "Wallet Address" : "Smart Contract Address"
                }`}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="py-3 px-4 rounded-xl border border-gray-300 shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent mb-4 sm:mb-0 mx-2 w-full"
                disabled={isLoading}
              />
              <div className="flex justify-center my-5">
                <button
                  onClick={validateInput}
                  disabled={isLoading}
                  className={`bg-green-500 w-56 lg:w-40 text-center text-black font-semibold py-3 px-8 rounded-xl shadow-md transition-all duration-300 ${
                    isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-green-600"
                  }`}
                >
                  {isLoading ? "Loading..." : "Scan Now"}
                </button>
              </div>
            </div>
          </div>
        )}
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
      <Footer />
    </div>
  );
};

export default CreditScore;
