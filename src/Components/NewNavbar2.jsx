import React, { useState } from 'react'
import { BsHeadset } from "react-icons/bs";
import { IoClose } from "react-icons/io5";
import {HiMenuAlt4} from 'react-icons/hi';
import {AiOutlineClose} from 'react-icons/ai';
import { LuClock9 } from "react-icons/lu";
import { FaPlus } from "react-icons/fa6";
import { GrDocumentText } from "react-icons/gr";
import { FaRegCalendarAlt } from "react-icons/fa";
import { PiSquaresFourBold } from "react-icons/pi";
import { RiPieChartLine } from "react-icons/ri";
import { IoPersonSharp } from "react-icons/io5";
import { LuNetwork } from "react-icons/lu";
import SecureDapp from "../Assests/SecureDapp.jpeg";
import { Link } from 'react-router-dom';

export default function NewNavbar({ email }) {
  const [toggleMenu, setToggleMenu] = useState(false);
  const [expandRealtimeSecurity, setExpandRealtimeSecurity] = useState(false);
  
  return (
    <div className="z-50 flex items-center justify-between w-full px-4 py-5 bg-white ">
      
      <h1 className="text-xl text-black logo sm:text-3xl">SecureTrace</h1>
     
      <div className="flex items-center gap-7 ">
        <button className="p-0">
          <BsHeadset className="text-[#535252] text-2xl" />
        </button>
      </div>

    </div>
  );
}
