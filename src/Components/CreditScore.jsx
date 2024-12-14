import React from 'react';
import { useState } from 'react';
import Footer from './Footer';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CreditScore = () => {
  const [activeTab, setActiveTab] = useState("wallet");
  const [inputValue, setInputValue] = useState("");
  const [validatedData, setValidatedData] = useState(null);



  const validateInput = () => {
    const walletRegex = /^0x[a-fA-F0-9]{40}$/; // Ethereum wallet address regex
    const isValid = walletRegex.test(inputValue);

    if (!isValid) {
      toast.error("Invalid address. Please enter a valid value.");
      setInputValue("");
    } else {
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
            onClick={() => {
              setActiveTab("wallet");
              setValidatedData(null); // Reset validated data when switching tabs
            }}
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
            onClick={() => {
              setActiveTab("smartContract");
              setValidatedData(null); // Reset validated data when switching tabs
            }}
          >
            Smart Contract
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div>
        {validatedData ? (
          <div className="my-20">
            <p className="text-lg text-start ml-10 font-semibold text-gray-700 dark:text-gray-200">
              {validatedData.type === "wallet" ? "Wallet Address" : "Smart Contract Address"}
              : <span className="text-green-500">
                {/* {validatedData.value} */}
                {`${validatedData.value.slice(0, 5)}...${validatedData.value.slice(-4)}`}
                </span>
            </p>
            <div className='text-center'>
            <h1 className='text-black dark:text-white text-2xl'>
              Credit Score
            </h1>
            <h1 className='text-green-500 text-3xl font-bold'>
              96
            </h1>
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
              />
              <div className="flex justify-center my-5">
                <button
                  onClick={validateInput}
                  className="bg-green-500 w-56 lg:w-40 text-center text-black font-semibold py-3 px-8 rounded-xl shadow-md hover:bg-green-600 transition-all duration-300"
                >
                  Scan Now
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Toast Notifications */}
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
      <div>
        <Footer/>
      </div>
    </div>
  );
};

export default CreditScore
