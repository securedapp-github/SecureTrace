import React, { useState } from 'react'
import { BsHeadset } from "react-icons/bs";

export default function NewNavbar({ email }) {
  const [toggleMenu, setToggleMenu] = useState(false);
  const [expandRealtimeSecurity, setExpandRealtimeSecurity] = useState(false);
  
  return (
    <div className="z-50 flex items-center justify-between w-full px-4 py-5 bg-white dark:bg-[#001938]">
      <h1 className="text-xl text-black dark:text-white sm:text-3xl">SecureTrace</h1>

      <div className="flex items-center gap-7 ">
        <button className="p-0">
          <BsHeadset className="text-[#535252] dark:text-white text-2xl" />
        </button>
      </div>
    </div>
  );
}