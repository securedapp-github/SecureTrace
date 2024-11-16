import React from 'react';
import { FaRegCopy, } from 'react-icons/fa';
import img from '../Assests/person.png';
import { FaShareNodes } from 'react-icons/fa6';
import { useState, useEffect, useRef } from 'react';
import Port from "../Assests/Portfolio.png";
import { TiArrowSortedDown } from "react-icons/ti";
import axios from "axios";
import btc from '../Assests/Bitcoin.png';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { DevUrl } from '../Constants';

const AddressCard = () => {

  // const defaultCardData = {
  //   address: "0x04b21735E93Fa3f8df70e2Da89e6922616891a88",
  //             0xa2311e75bebdCa24A3dFAb4c50aAe4988De1aCE8
  //   amount: "$10,491.48",
  //   greenAmount: "$10,491.48",
  // };

  const [cardData, setCardData] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [isPortfolioVisible, setIsPortfolioVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  // const chains = ['Ethereum', 'Binance Smart Chain', 'Polygon', 'Avalanche'];
  const [loading, setLoading] = useState(false);
  const [portfolioData, SetPortfolioData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalValue, setTotalValue] = useState(0);
  const [selectedChain, setSelectedChain] = useState(null);


  const transferData = [
    {
      icon: btc,
      time: '0 day ago',
      from: '0xD78...35Cx',
      to: '0xD78...35Cx',
      value: '0.00K',
      token: 'USDT',
      usd: '$0.00K',
    },

  ];

  const [currentPage1, setCurrentPage1] = useState(1);
  const rowsPerPage1 = 10;
  const [transfers, setTransfers] = useState([]);

  const totalPages1 = Math.ceil(transfers.length / rowsPerPage1);
  const currentRows1 = transfers.slice((currentPage1 - 1) * rowsPerPage1, currentPage1 * rowsPerPage1);
  const handlePageChange1 = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages1) {
      setCurrentPage1(pageNumber);
    }
  };


  const jsonData = {
    "0x04b21735E93Fa3f8df70e2Da89e6922616891a88": {
      amount: `$${totalValue}`,
      greenAmount: `$${totalValue}`,
    },

  };

  const isValidEthereumAddressOrTxHash = (value) => {
    const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/; // For Ethereum address (42 characters, starts with 0x)
    const txHashRegex = /^0x([A-Fa-f0-9]{64})$/;  // For Transaction hash (66 characters, starts with 0x)

    return ethAddressRegex.test(value) || txHashRegex.test(value);
  };


  const copyToClipboard = () => {
    navigator.clipboard.writeText(localStorage.getItem('inputValue'));
    toast.success('You Have Copied the Address');
  };

  const handleScanNow = async () => {
    setLoading(true);
    setSelectedChain(null);

    if (!inputValue) {
      toast.error('Please enter a contract address.');
      setLoading(false);
      return;
    }


    if (!isValidEthereumAddressOrTxHash(inputValue)) {
      toast.error('Invalid Ethereum address. Please enter a valid input.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        // `https://caiman-wanted-fox.ngrok-free.app/fetch-address-details/`,
        `${DevUrl}/fetch-address-details/`,
        { address: inputValue }, // This is the request body
        {
          headers: {
            "ngrok-skip-browser-warning": "true",
            "Content-Type": "application/json",
          }
        }
      );

      SetPortfolioData(response.data.tokens);
      console.log("Portfolio data:", response.data.tokens);

      const tokens = response.data.tokens;
      // setPortfolioData(tokens);

      // Calculate total value
      const total = tokens.reduce((sum, item) => {
        const price = parseFloat(item.tokenPrice);
        const holdings = parseFloat(item.tokenBalance);
        return sum + (price * holdings);
      }, 0);

      setTotalValue(total.toFixed(2));
      setIsPortfolioVisible(true);

      setLoading(false);

      localStorage.setItem('inputValue', inputValue);

    } catch (error) {
      console.log("error", error);

      setLoading(false);
    }

    try {
      const response1 = await axios.post(
        // `https://caiman-wanted-fox.ngrok-free.app/token-transfers/`,
        `${DevUrl}/token-transfers/`,

        { address: inputValue }, // This is the request body
        {
          headers: {
            "ngrok-skip-browser-warning": "true",

            "Content-Type": "application/json",
          },
        }
      );
      const combinedTransfers = response1.data.from.concat(response1.data.to);
      setTransfers(combinedTransfers);
      // console.log("Transfres Data:", combinedTransfers);

      setLoading(false);
    } catch (error) {
      console.log("error", error);

      setLoading(false);
    }

    // const foundData = jsonData[inputValue];
    // if (foundData) {
    //   setCardData({
    //     address: inputValue,
    //     amount: foundData.amount,
    //     greenAmount: foundData.greenAmount,
    //   });
    //   setIsPortfolioVisible(true);
    // } else {
    //   alert('Data not found for the given address value.');
    // }
    setInputValue('');


  };

  // useEffect(() => {
  //   const storedInputValue = localStorage.getItem('inputValue');
  //   if (storedInputValue) {
  //     setInputValue(storedInputValue);
  //   }
  // }, []);

  const data = [
    { asset: 'Btc', price: '$00.00K', change: '+0.00', holdings: '00.000 Btc', value: '$00.00K' },
  ];

  const rowsPerPage = 10;

  const filteredData = selectedChain
  ? portfolioData.filter(item => item.chain === selectedChain)
  : portfolioData;

  const validData = filteredData.filter(item => {
    const price = parseFloat(item.tokenPrice);
    const holdings = parseFloat(item.tokenBalance);
    const value = price * holdings;
    return value >= 0.01;
  });
  const totalPages = Math.ceil(validData.length / rowsPerPage);

// Slice data for the current page
const currentRows = validData.slice(
  (currentPage - 1) * rowsPerPage,
  currentPage * rowsPerPage
);

  console.log("Filtered Data:", filteredData);
  console.log("Current Rows:", currentRows);
  console.log("validdata", validData);


  // const handleChainSelect = (chain) => {
  //   setSelectedChain(chain);
  //   setCurrentPage(1); 
  //   setIsOpen(false);
  //   toast.info(`Selected chain: ${chain.charAt(0).toUpperCase() + chain.slice(1)}`);
  // };

  const handleChainSelect = (chain) => {
    setSelectedChain(chain);
    setCurrentPage(1);
    setIsOpen(false);
    const chainName = chain ? chain.charAt(0).toUpperCase() + chain.slice(1) : "All";
    toast.info(`Selected chain: ${chainName}`);
  };

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false); // Close dropdown if click is outside
    }
  };

  useEffect(() => {
    // Add event listener for clicks outside the dropdown
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      // Clean up the event listener on component unmount
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div>
      <div className='flex items-center justify-center'>
        <div className=' mt-10 md:mt-20'>
          <h1 className="text-3xl font-bold text-center mb-4">
            SecureTrace PortfolioTracker
          </h1>

          <p className="text-center text-gray-600 mb-6 max-w-2xl font-semibold">
            SecureTrace analyzes transaction data using specialized blockchain
            forensic techniques, enhancing the detection of intricate patterns
            and potential vulnerabilities.
          </p>
        </div>
      </div>
      <div className='flex items-center justify-center mt-6 mb-6'>
        <div className="flex flex-col sm:flex-row items-center w-80 md:w-full md:max-w-3xl ">
          <input
            type="text"
            value={inputValue}
            disabled={loading}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter address value"
            className="py-3 px-4 rounded-xl border border-gray-300 shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent mb-4 sm:mb-0 mx-2 w-full"
          />
          <button onClick={handleScanNow} disabled={loading} className="bg-green-500 w-56 lg:w-40 text-black font-semibold py-3 px-8 rounded-xl shadow-md hover:bg-green-600 transition-all duration-300">
            Scan Now
          </button>
        </div>
      </div>
      {loading && (
        <div className="flex items-center justify-center mt-6">
          <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-green-700"></div>
        </div>
      )}


      {isPortfolioVisible && !loading && (
        <div className="mx-4 md:mx-32 my-10 border border-black rounded-lg shadow-lg shadow-gray-500 p-4 bg-white flex flex-col lg:flex-row items-center gap-4">
          <div className="flex-1 ml-0 md:ml-4">
            <div className="flex items-center">
              <span className='text-sm md:text-xl text-black font-semibold'>{localStorage.getItem('inputValue')}</span>
              <button onClick={copyToClipboard} className="ml-2 text-sm md:text-xl text-black hover:text-gray-600">
                <FaRegCopy />
              </button>
            </div>
            <div className=" mt-2 md:flex items-center">
              <h1 className='ml-2 lg:ml-0 text-4xl'>{`$${totalValue}`}</h1>
              <span className="text-green-500 text-2xl ml-2 mt-2">{`$${totalValue}`}</span>
              <button className="ml-2 mt-2 text-md md:text-xl text-black hover:text-gray-600">
                <FaShareNodes />
              </button>
            </div>
            <p className="text-gray-400 text-xl mt-1 ml-2 lg:ml-0">
              Ethereum First Funder: <span className='text-black font-semibold text-sm md:text-xl'>{localStorage.getItem('inputValue')}</span>
            </p>
          </div>
          <img src={img} alt='img' />
        </div>
      )
      }


      {
        isPortfolioVisible && !loading && (
          <div className='mx-4 md:mx-32 mt-10'>
            {/* <div className="">
            <Portfolio />
          </div> */}
            <div>
              <div className="bg-white p-6  w-full xl:w-[100%] rounded-xl border border-black shadow-md shadow-gray-500">
                <div className='md:flex gap-1 lg:flex-row justify-between items-start lg:items-center'>
                  <div className='flex gap-2 items-center mb-4 lg:mb-0'>
                    <img className='h-8 w-8' src={Port} alt='portfolio' />
                    <h3 className="text-xl lg:text-2xl font-semibold">Portfolio</h3>
                    <div className="flex items-center">
                      <button
                        className={`px-4 py-2 font-bold ${currentPage === 1 ? 'cursor-not-allowed opacity-50 ' : 'cursor-pointer'}`}
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 1024 1024"><path fill="black" d="M685.248 104.704a64 64 0 0 1 0 90.496L368.448 512l316.8 316.8a64 64 0 0 1-90.496 90.496L232.704 557.248a64 64 0 0 1 0-90.496l362.048-362.048a64 64 0 0 1 90.496 0" /></svg>
                      </button>
                      <span className='font-bold text-xl'>
                        {currentPage} / {totalPages}
                      </span>
                      <button
                        className={`px-4 py-2 font-bold ${currentPage === totalPages ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 12 24"><path fill="black" fill-rule="evenodd" d="M10.157 12.711L4.5 18.368l-1.414-1.414l4.95-4.95l-4.95-4.95L4.5 5.64l5.657 5.657a1 1 0 0 1 0 1.414" /></svg>
                      </button>
                    </div>
                  </div>

                  <div className='flex justify-end'>
                    <button onClick={() => setIsOpen(!isOpen)} className="flex gap-2 md:gap-6 items-center px-3 py-2 bg-gradient-to-t from-[#d3d3d3] to-white text-black rounded-lg border border-black shadow-md hover:bg-gray-300 transition">
                      <span className="font-semibold">Filter by Chain</span>
                      <TiArrowSortedDown />
                    </button>
                    {/* {isOpen && (
                      <div className="absolute mt-12 bg-white border border-gray-300 rounded-lg shadow-lg" ref={dropdownRef} >
                        {[...new Set(portfolioData.map(item => item.chain))].map((chain, index) => (
                          <div
                            key={index}
                            className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                            onClick={() => handleChainSelect(chain)}
                          >
                            {chain.charAt(0).toUpperCase() + chain.slice(1)}
                          </div>
                        ))}
                      </div>
                    )} */}
                    {isOpen && (
                      <div className="absolute mt-12 bg-white border border-gray-300 rounded-lg shadow-lg" ref={dropdownRef}>
                        <div
                          className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                          onClick={() => handleChainSelect(null)}  // Null or an empty string to indicate "All"
                        >
                          All
                        </div>
                        {[...new Set(portfolioData.map(item => item.chain))].map((chain, index) => (
                          <div
                            key={index}
                            className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                            onClick={() => handleChainSelect(chain)}
                          >
                            {chain.charAt(0).toUpperCase() + chain.slice(1)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full mt-2 text-center">
                    <thead>
                      <tr className="h-10">
                        <th className=' px-4'>Asset</th>
                        <th className=' px-4'>
                          <div className="flex justify-center items-center space-x-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 512 512"><path fill="none" stroke="black" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M32 144h448M112 256h288M208 368h96" /></svg>
                            <h1>Price</h1>
                          </div>
                        </th>
                        <th className=' px-4'>
                          <div className="flex justify-center items-center space-x-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 512 512"><path fill="none" stroke="black" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M32 144h448M112 256h288M208 368h96" /></svg>
                            <h1>Holdings</h1>
                          </div>
                        </th>
                        <th className=' px-4'>
                          <div className="flex justify-center items-center space-x-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 512 512"><path fill="none" stroke="black" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M32 144h448M112 256h288M208 368h96" /></svg>
                            <h1>Value</h1>
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentRows && currentRows.length > 0 ? (
                        currentRows.map((item, index) => {
                          const logo = item.logo;
                          const asset = item.tokenName;
                          const price = parseFloat(item.tokenPrice).toFixed(2);
                          const holdings = parseFloat(item.tokenBalance).toFixed(2);
                          const value = (price * holdings).toFixed(2);


                          return (
                            <tr key={index} className="border-t h-12 odd:bg-[#F4F4F4] even:bg-white">
                              <td className=' flex items-center justify-center'>
                                <div className='flex items-center gap-5  w-48'>
                                  <img src={logo} alt={asset} className='mt-2 h-7 w-7 ' />
                                  <p className='text-nowrap'> {asset}</p>
                                </div>

                              </td>
                              <td className='px-4'>${price}</td>
                              <td className='px-4'>{holdings}</td>
                              <td className='px-4'>${value}</td>
                            </tr>
                          );
                        })
                      ) : (
                        data.map((item, index) => (
                          <tr key={index} className="border-t h-12 odd:bg-[#F4F4F4] even:bg-white">
                            <td>{item.asset}</td>
                            <td>{item.price} <span className="text-green-500">{item.change}</span></td>
                            <td>{item.holdings}</td>
                            <td>{item.value}</td>
                          </tr>
                        ))
                      )}
                    </tbody>

                  </table>
                </div>
              </div>
            </div>
            <div className="mt-10 ">
              <div className="overflow-x-hidden bg-white p-6 rounded-xl border border-black shadow-md shadow-gray-500" id="hide-scrollbar">
                <div className="">
                  <div className='flex'>
                    <h3 className="text-2xl font-semibold mt-1 mb-4">Transfers</h3>
                    <div className="flex items-center mb-4">
                      <button
                        className={`px-4 py-2 font-bold ${currentPage1 === 1 ? 'cursor-not-allowed opacity-50 ' : 'cursor-pointer'}`}
                        onClick={() => handlePageChange1(currentPage1 - 1)}
                        disabled={currentPage1 === 1}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 1024 1024"><path fill="black" d="M685.248 104.704a64 64 0 0 1 0 90.496L368.448 512l316.8 316.8a64 64 0 0 1-90.496 90.496L232.704 557.248a64 64 0 0 1 0-90.496l362.048-362.048a64 64 0 0 1 90.496 0" /></svg>
                      </button>
                      <span className='font-bold text-xl'>
                        {currentPage1} / {totalPages1}
                      </span>
                      <button
                        className={`px-4 py-2 font-bold ${currentPage1 === totalPages1 ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                        onClick={() => handlePageChange1(currentPage1 + 1)}
                        disabled={currentPage1 === totalPages1}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 12 24"><path fill="black" fill-rule="evenodd" d="M10.157 12.711L4.5 18.368l-1.414-1.414l4.95-4.95l-4.95-4.95L4.5 5.64l5.657 5.657a1 1 0 0 1 0 1.414" /></svg>
                      </button>
                    </div>
                  </div>
                  <div className="overflow-x-scroll" id="hide-scrollbar">
                    <table className="w-full text-center">
                      <thead className=''>
                        <tr className="text-gray-500 h-10">
                          <th className='flex justify-center items-center space-x-2 px-4'><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 512 512"><path fill="none" stroke="black" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M32 144h448M112 256h288M208 368h96" /></svg><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="black" d="M14.78 3.653a3.936 3.936 0 1 1 5.567 5.567l-3.627 3.627a3.936 3.936 0 0 1-5.88-.353a.75.75 0 0 0-1.18.928a5.436 5.436 0 0 0 8.12.486l3.628-3.628a5.436 5.436 0 1 0-7.688-7.688l-3 3a.75.75 0 0 0 1.06 1.061z" /><path fill="black" d="M7.28 11.153a3.936 3.936 0 0 1 5.88.353a.75.75 0 0 0 1.18-.928a5.436 5.436 0 0 0-8.12-.486L2.592 13.72a5.436 5.436 0 1 0 7.688 7.688l3-3a.75.75 0 1 0-1.06-1.06l-3 3a3.936 3.936 0 0 1-5.567-5.568z" /></svg></th>
                          <th className=' px-4'>
                            <div className="flex justify-center items-center space-x-2"><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="black" fill-rule="evenodd" d="m12.6 11.503l3.891 3.891l-.848.849L11.4 12V6h1.2zM12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10s-4.477 10-10 10m0-1.2a8.8 8.8 0 1 0 0-17.6a8.8 8.8 0 0 0 0 17.6" /></svg>
                              <h1>Time</h1>
                            </div>
                          </th>
                          <th className=' px-6'>
                            <div className="flex justify-center items-center space-x-2">
                              <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 512 512"><path fill="none" stroke="black" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M32 144h448M112 256h288M208 368h96" /></svg>
                              <h1>From</h1>
                            </div>
                          </th>
                          <th className='px-6'>
                            <div className="flex justify-center items-center space-x-2">
                              <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 512 512"><path fill="none" stroke="black" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M32 144h448M112 256h288M208 368h96" /></svg>
                              <h1>To</h1>
                            </div>
                          </th>
                          <th className=' px-4'>
                            <div className="flex justify-center items-center space-x-2">
                              <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 512 512"><path fill="none" stroke="black" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M32 144h448M112 256h288M208 368h96" /></svg>
                              <h1>Value</h1>
                            </div>
                          </th>
                          <th className=' px-4'>
                            <div className="flex justify-center items-center space-x-2">
                              <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 512 512"><path fill="none" stroke="black" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M32 144h448M112 256h288M208 368h96" /></svg>
                              <h1>Token</h1>
                            </div>
                          </th>
                          <th className=' px-4'>
                            <div className="flex justify-center items-center space-x-2">
                              <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 512 512"><path fill="none" stroke="black" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M32 144h448M112 256h288M208 368h96" /></svg>
                              <h1>Amount</h1>
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody className=" text-center">
                        {currentRows1 && currentRows1.length > 0 ?
                          (currentRows1.map((transfer, index) => {
                            const { logo, timestamp, from, to, value, tokenName, tokenPrice } = transfer;
                            return (
                              <tr key={index} className="border-t  h-12  text-center bg-red-600 odd:bg-[#F4F4F4] even:bg-white px-2 py-2">
                                <td className='flex justify-center items-center mt-2 px-4'><img src={logo} alt={tokenName} /></td>
                                {/* <td className="text-green-500 me-3 px-4">{timestamp}</td> */}
                                <td className="text-green-500 me-3 px-4">{new Date(timestamp).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</td>
                                {/* <td className="me-3 px-4">{from}</td>
                                            <td className="me-3 px-4">{to}</td> */}
                                <td className="me-3 px-4">{from.slice(0, 5) + "..." + from.slice(-4)}</td>
                                <td className="me-3 px-4">{to.slice(0, 5) + "..." + to.slice(-4)}</td>
                                {/* <td className='text-green-500'>{transfer.value}</td> */}
                                <td className="text-green-500 px-4">
                                  {parseFloat(tokenPrice).toFixed(2)}
                                </td>
                                <td className="px-4">{tokenName}</td>
                                <td className="px-4">{parseFloat(value).toFixed(2)}</td>
                              </tr>
                            );
                          }))
                          :
                          (
                            <tr className="border-t h-12 odd:bg-[#F4F4F4] even:bg-white ">
                              <td className='flex justify-center items-center mt-2'><img src={btc} alt="Token Name" /></td>
                              <td className="text-green-500 text-center">0 days ago</td>
                              <td className="text-center">0000....000</td>
                              <td className="text-center">0000....000</td>
                              <td className='text-green-500'>0.00</td>
                              {/* <td className="text-green-500">
                                            0.00
                                        </td> */}
                              <td>BTC</td>
                              <td>$0.00</td>
                            </tr>
                          )
                        }


                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      }

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
    </div >
  );
};

export default AddressCard;
