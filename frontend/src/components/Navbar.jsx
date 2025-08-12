import React, { useContext, useState } from "react";
import { assets } from "../assets/assets";
import { NavLink, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { state, setState, token, utoken, setUToken, userData } =
    useContext(AppContext);

  const [showMenu, setShowMenu] = useState(false);
  // const [token, setToken] = useState(true);

  const logout = () => {
    setUToken(false);
    localStorage.removeItem("utoken");
    navigate("/");
  };

  return (
    <div className="flex items-center justify-between text-sm py-4 mb-5 border-b border-b-gray-400">
      <img
        onClick={() => navigate("/")}
        className="w-44 cursor-pointer"
        src={assets.logo}
        alt=""
      />

      <div className="hidden md:inline-flex bg-[#f5f5f0] py-2 px-4 rounded-full gap-6 text-sm">
        <NavLink
          to="/"
          className="text-gray-600 hover:text-[#CC5500] transition-colors"
        >
          HOME
        </NavLink>
        <NavLink
          to={"/about"}
          className="text-gray-600 hover:text-[#CC5500] transition-colors"
        >
          ABOUT
        </NavLink>
        <NavLink
          to="/team"
          className="text-gray-600 hover:text-[#CC5500] transition-colors"
        >
          TEAM
        </NavLink>
        <NavLink
          to="/contact"
          className="text-gray-600 hover:text-[#CC5500] transition-colors"
        >
          CONTACT US
        </NavLink>
      </div>

      <div className="flex items-center">
        <div>
          {token || utoken ? (
            <div className="flex items-center gap-2 cursor-pointer group relative">
              <img
                className="w-8 h-8 rounded-full border-2 border-purple-200"
                src={userData.image}
                alt=""
              />
              <img className="w-2.5" src={assets.dropdown_icon} alt="" />
              <div className="absolute top-0 right-0 pt-14 text-base font-medium text-gray-600 z-20 hidden group-hover:block">
                <div className="min-w-48 bg-stone-100 rounded flex flex-col gap-4 p-4">
                  {utoken && (
                    <p
                      onClick={() => navigate("/user-portal/profile")}
                      className="hover:text-black cursor-pointer"
                    >
                      My Portal
                    </p>
                  )}
                  {token && (
                    <p
                      onClick={() => navigate("/family-portal")}
                      className="hover:text-black cursor-pointer"
                    >
                      Family Portal
                    </p>
                  )}
                  <p
                    onClick={logout}
                    className="hover:text-black cursor-pointer"
                  >
                    Logout
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => {
                setState("Login");
                navigate("/login");
              }}
              className="bg-primary text-white px-8 py-3 rounded-full font-light hidden md:block"
            >
              Login
            </button>
          )}
        </div>
        <img
          onClick={() => setShowMenu(true)}
          className="w-6 md:hidden"
          src={assets.menu_icon}
          alt=""
        />
        {/* Mobile Menu */}
        <div
          className={`${
            showMenu ? "fixed w-full" : "h-0 w-0"
          } md:hidden right-0 top-0 bottom-0 z-20 overflow-hidden bg-white transition-all`}
        >
          <div className="flex items-center justify-between px-5 py-6">
            <img className="w-36" src={assets.logo} alt="" />
            <img
              className="w-7"
              onClick={() => setShowMenu(false)}
              src={assets.cross_icon}
              alt=""
            />
          </div>
          <ul className="flex flex-col items-center gap-2 mt-5 px-5 text-lg font-medium">
            <NavLink onClick={() => setShowMenu(false)} to="/">
              <p className="px-4 py-2 rounded inline-block">HOME</p>
            </NavLink>
            <NavLink onClick={() => setShowMenu(false)} to="/about">
              <p className="px-4 py-2 rounded inline-block">ABOUT</p>
            </NavLink>
            <NavLink onClick={() => setShowMenu(false)} to="/team">
              <p className="px-4 py-2 rounded inline-block">TEAM</p>
            </NavLink>
            <NavLink onClick={() => setShowMenu(false)} to="/contact">
              <p className="px-4 py-2 rounded inline-block">CONTACT US</p>
            </NavLink>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
