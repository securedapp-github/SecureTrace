import React from "react";
import logo from "../Assests/logodark.png";
import { FaDiscord } from "react-icons/fa";
import { FaTwitter } from "react-icons/fa";
import { FaLinkedin } from "react-icons/fa";
import { FaTelegram } from "react-icons/fa";

const Footer = () => {
  return (
    // <footer className="bg-[#001938] text-gray-700">
    <footer className="text-gray-700 overflow-x-hidden">
      <div className=" mx-10 px-4 sm:px-6 lg:px-8 py-12 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start space-y-8 sm:space-y-0">
          <div className="flex flex-col items-center sm:items-start">
            <img
              src={logo} 
              alt="SecureDApp Logo"
              className="h-12"
            />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-sm">
            <div>
              <h3 className="font-bold text-black text-lg">Product</h3>
              <ul className="mt-4 space-y-2 text-black text-md">
                <li><a href="#" className="">Solidity Shield Scan</a></li>
                <li><a href="#" className="">Secure Watch</a></li>
                <li><a href="#" className="">Audit Express</a></li>
                <li><a href="#" className="">Secure Trace</a></li>
                <li><a href="#" className="">Secure Pad</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-black text-lg">Services</h3>
              <ul className="mt-4 space-y-2 text-black text-md">
                <li><a href="#" className="">Audit</a></li>
                <li><a href="#" className="">Security</a></li>
                <li><a href="#" className="">Regulatory Solutions</a></li>
                <li><a href="#" className="">Training & Education</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-black text-lg">Company</h3>
              <ul className="mt-4 space-y-2 text-black text-md">
                <li><a href="#" className="">About Us</a></li>
                <li><a href="#" className="">Authors</a></li>
                <li><a href="#" className="">Media</a></li>
                <li><a href="#" className="">Career</a></li>
                <li><a href="#" className="">Contact Us</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-black text-lg">Resources</h3>
              <ul className="mt-4 space-y-2 text-black text-md">
                <li><a href="#" className="">Blogs</a></li>
                <li><a href="#" className="">Audits</a></li>
                <li><a href="#" className="">Vulnerabilities</a></li>
                <li><a href="#" className="">Github</a></li>
                <li><a href="#" className="">Workplace Policy</a></li>
                <li><a href="#" className="">Shipping & Delivery Policy</a></li>
                <li><a href="#" className="">Pricing Policy</a></li>
                <li><a href="#" className="">Cancellation & Refunds</a></li>
                <li><a href="#" className="">Whitepaper</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-8 flex justify-center sm:justify-start space-x-6">
          <a href="#" className="text-black text-3xl hover:text-green-500">
            <FaDiscord/>
          </a>
          <a href="#" className="text-black text-2xl mt-1 hover:text-green-500 ">
            <FaTwitter/>
          </a>
          <a href="#" className="text-black text-2xl mt-1 hover:text-green-500">
            <FaLinkedin/>
          </a>
          <a href="#" className="text-black text-2xl mt-1 hover:text-green-500">
            <FaTelegram/>
          </a>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-8 flex flex-col sm:flex-row justify-between items-center text-sm">
          <div className="flex items-center space-x-4">
            <a href="#" className=" mt-1 text-lg text-gray-500">Privacy Policy</a>
            <span className="text-4xl">•</span>
            <a href="#" className=" mt-1 text-lg text-gray-500">Terms & Conditions</a>
          </div>
          <p className="mt-5 sm:mt-0 text-gray-500 text-lg text-center">
            © 2024, Vettedcode Technologies India Pvt. Ltd. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
