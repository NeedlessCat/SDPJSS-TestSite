import React from "react";
import { assets } from "../assets/assets";

const Footer = () => {
  return (
    <div className="md:mx-10">
      <div className="flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm">
        {/* Left Section */}
        <div>
          <img className="mb-5 w-40" src={assets.logo} alt="" />
          <p className="w-full md:w-2/3 text-gray-600 leading-6">
            Our objective is to inspire giving by transforming religious
            donations into impactful initiatives that support education,
            healthcare, and community development, uplifting underprivileged
            communities and fostering lasting change.
          </p>
        </div>
        {/* Center Section */}
        <div>
          <p className="text-xl font-medium mb-5">COMPANY</p>
          <ul className="flex flex-col gap-2 text-gray-600">
            <li>Home</li>
            <li>About us</li>
            <li>Contact us</li>
            <li>Privacy Policy</li>
          </ul>
        </div>
        {/* Right Section */}
        <div>
          <p className="text-xl font-medium mb-5">GET IN TOUCH</p>
          <ul className="flex flex-col gap-2 text-gray-600">
            <li>+91 82135 61478</li>
            <li>needlesscat9763@gmail.com</li>
          </ul>
        </div>
      </div>
      <hr />
      <div className="flex flex-col sm:grid grid-cols-[1fr_3fr_1fr] gap-14 my-10">
        <p className=" text-sm text-center">Estd. 1939</p>
        <p className=" text-sm text-center">
          Copyright 2024@ SDPJSS - All Right Reserved | NeedlessCat
        </p>
        <p className="text-sm text-center">Reg.No. 272/2020</p>
      </div>
    </div>
  );
};

export default Footer;
