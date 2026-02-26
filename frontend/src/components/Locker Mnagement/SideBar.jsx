import { useState } from 'react';
import { Menu, BarChart2, Globe, Calendar } from "lucide-react";

const SideBar = () => {

  const [open, setOpen] = useState(true);

  return (
    <div className='flex h-screen bg-gray-200'>

      {/* Sidebar */}
      <div
        className={`bg-[#0F2A43] text-[#f7f9fa] p-5 
        transition-all duration-300 
        ${open ? "w-64" : "w-20"}`}
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

          <li className="flex items-center gap-4 hover:bg-[#173B5C] p-2 rounded cursor-pointer">
            <Globe />
            {open && <span>Locker Maps</span>}
          </li>

          <li className="flex items-center gap-4 hover:bg-[#173B5C] p-2 rounded cursor-pointer">
            <Calendar />
            {open && <span>Calendar</span>}
          </li>

        </ul>
      </div>

      {/* Main Content */}
      <div className=" w-full h-100vh">
        <h1 className=" text-2xl font-bold flex justify-center p-10">LOCKER MAP</h1>
      </div>

    </div>
  )
}

export default SideBar