import React from "react";
import { NavLink } from "react-router-dom";
import { assets } from "../assets/assets";

const Sidebar = () => {
  return (
    <div className="min-h-screen bg-white border-r">
      <ul className="text-[#515151] mt-5">
        <NavLink
          className={({ isActive }) =>
            `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
              isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
            }`
          }
          to={"/dashboard"}
        >
          <img src={assets.home_icon} alt="" />
          <p className="hidden md:block">Dashboard</p>
        </NavLink>
        <NavLink
          className={({ isActive }) =>
            `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
              isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
            }`
          }
          to={"/khandan-list"}
        >
          <img src={assets.family_list} alt="" className="w-[23px] h-[23px]" />
          <p className="hidden md:block">Khandan List</p>
        </NavLink>
        <NavLink
          className={({ isActive }) =>
            `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
              isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
            }`
          }
          to={"/donation-categories"}
        >
          <img
            src={assets.advertisement_list}
            alt=""
            className="w-[23px] h-[23px]"
          />
          <p className="hidden md:block">Categories</p>
        </NavLink>
        <NavLink
          className={({ isActive }) =>
            `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
              isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
            }`
          }
          to={"/receipt"}
        >
          <img
            src={assets.advertisement_list}
            alt=""
            className="w-[23px] h-[23px]"
          />
          <p className="hidden md:block">Receipt</p>
        </NavLink>
        <NavLink
          className={({ isActive }) =>
            `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
              isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
            }`
          }
          to={"/user-list"}
        >
          <img src={assets.user_list} alt="" className="w-[23px] h-[23px]" />
          <p className="hidden md:block">User List</p>
        </NavLink>
        <NavLink
          className={({ isActive }) =>
            `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
              isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
            }`
          }
          to={"/staff-requirement-list"}
        >
          <img
            src={assets.staff_requirement_list}
            alt=""
            className="w-[23px] h-[23px]"
          />
          <p className="hidden md:block">Staff Requirement</p>
        </NavLink>
        <NavLink
          className={({ isActive }) =>
            `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
              isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
            }`
          }
          to={"/job-opening-list"}
        >
          <img
            src={assets.job_opening_list}
            alt=""
            className="w-[23px] h-[23px]"
          />
          <p className="hidden md:block">Job Opening</p>
        </NavLink>
        <NavLink
          className={({ isActive }) =>
            `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
              isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
            }`
          }
          to={"/advertisement-list"}
        >
          <img
            src={assets.advertisement_list}
            alt=""
            className="w-[23px] h-[23px]"
          />
          <p className="hidden md:block">Advertisement</p>
        </NavLink>
        <NavLink
          className={({ isActive }) =>
            `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
              isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
            }`
          }
          to={"/notice-board"}
        >
          <img src={assets.notice_board} alt="" className="w-[23px] h-[23px]" />
          <p className="hidden md:block">Notice Board</p>
        </NavLink>
        <NavLink
          className={({ isActive }) =>
            `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
              isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
            }`
          }
          to={"/donation-list"}
        >
          <img
            src={assets.donation_list}
            alt=""
            className="w-[23px] h-[23px]"
          />
          <p className="hidden md:block">Donation</p>
        </NavLink>
        <NavLink
          className={({ isActive }) =>
            `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
              isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
            }`
          }
          to={"/manage-team"}
        >
          <img src={assets.manage_team} alt="" className="w-[23px] h-[23px]" />
          <p className="hidden md:block">Manage Team</p>
        </NavLink>
        <NavLink
          className={({ isActive }) =>
            `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
              isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
            }`
          }
          to={"/family-tree"}
        >
          <img src={assets.manage_team} alt="" className="w-[23px] h-[23px]" />
          <p className="hidden md:block">Family Tree</p>
        </NavLink>
      </ul>
    </div>
  );
};

export default Sidebar;
