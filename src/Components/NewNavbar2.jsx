import React, { useState } from "react";
import { BsHeadset, BsTelephone, BsEnvelope } from "react-icons/bs";
import { TbBrightnessUp } from "react-icons/tb";
import { IoMoonOutline } from "react-icons/io5";

export default function NewNavbar({ email }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const handleDarkModeToggle = () => {
    setDarkMode((prev) => !prev);
    document.documentElement.classList.toggle("dark", !darkMode);
  };

  return (
    <div className="z-50 flex items-center justify-between w-full px-4 py-5 bg-white dark:bg-[#001938] fixed">
      <h1 className="font-bold text-black lg:text-4xl dark:text-white sm:text-3xl md:text-xl">
        SecureTrace
      </h1>

      <div className="flex items-center gap-7">
        {/* Dark Mode Toggle */}
        <button
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          onClick={handleDarkModeToggle}
          aria-label="Toggle Dark Mode"
        >
          {darkMode ? (
            <TbBrightnessUp className="text-2xl text-black dark:text-white" />
          ) : (
            <IoMoonOutline className="text-2xl text-black dark:text-white" />
          )}
        </button>

        {/* Headset Button */}
        <div className="relative">
          <button
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            onClick={toggleDropdown}
            aria-expanded={isDropdownOpen}
            aria-label="Toggle Support Dropdown"
          >
            <BsHeadset className="text-[#535252] dark:text-white text-2xl" />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#001938] shadow-lg rounded-lg text-sm">
              <ul className="p-2">
                {/* Phone Number */}
                <li className="flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                  <BsTelephone className="text-gray-500" />
                  <a
                    href="tel:9606015868"
                    className="block text-black dark:text-white"
                  >
                    9606015868
                  </a>
                </li>
                {/* Email */}
                <li className="flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                  <BsEnvelope className="text-gray-500" />
                  <a
                    href="mailto:hello@securedapp.in"
                    className="block text-black dark:text-white"
                  >
                    hello@securedapp.in
                  </a>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
