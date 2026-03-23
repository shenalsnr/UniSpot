import { useState } from 'react';
import { Menu, BarChart2, Globe, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import LockerMap from './LockerMap';

const SideBar = () => {

  const [open, setOpen] = useState(true);

  return (
    <div >

      {/* Sidebar */}
      <div
        className={`bg-[#0F2A43] text-[#f7f9fa] min-h-screen p-5
        transition-all duration-300
        ${open ? "w-50" : "w-20"}`}
      >

        {/* Hamburger */}
        <Menu
          className="cursor-pointer mb-8"
          onClick={() => setOpen(!open)}
        />

        {/* Menu List */}
        <ul className="space-y-6">

          <li className="flex items-center gap-4 hover:bg-[#173B5C] p-2 rounded cursor-pointer">
            <BarChart2 />
            {open && <span>Charts</span>}
          </li>
           
          <Link to="/lockers">
          <li className="flex items-center gap-4 hover:bg-[#173B5C] p-2 rounded cursor-pointer">
            <Globe />
            {open && <span>Locker Maps</span>}
          </li>
          </Link>

          <li className="flex items-center gap-4 hover:bg-[#173B5C] p-2 rounded cursor-pointer">
            <Calendar />
            {open && <span>Calendar</span>}
          </li>

        </ul>
      </div>

      

    </div>
  )
}

export default SideBar