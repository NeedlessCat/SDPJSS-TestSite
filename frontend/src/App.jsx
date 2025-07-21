import React from "react";
import { Route, Routes } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Contact from "./pages/Contact";
import About from "./pages/About";
import Team from "./pages/Team";
// import FamilyPortal from "./pages/FamilyPortal";
import UserPortal from "./pages/UserPortal";
import LoginPage from "./pages/LoginPage";
import JobPage from "./pages/JobPage";
import StaffPage from "./pages/StaffPage";
import HelpButton from "./components/HelpButton";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  return (
    <div className="mx-4 sm:mx-[10%]">
      <ToastContainer />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/team" element={<Team />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<LoginPage />} />
        {/* <Route path="/family-portal" element={<FamilyPortal />} /> */}

        <Route path="/user-portal/*" element={<UserPortal />} />
        {/* 
          user-portal/donations          --->  donation page accessed after user login
          user-portal/staff-requirement  --->  staff req adding page handled by user
          user-portal/job-opening        --->  job opening adding page handled by user
        */}

        {/* Staff Requirements visible to all the web accessors */}
        <Route path="/staffs-page" element={<StaffPage />} />
        {/* Job Openings visible to all the web accessors */}
        <Route path="/jobs-page" element={<JobPage />} />
      </Routes>
      <Footer />

      {/* Help Button */}
      <HelpButton />
    </div>
  );
};

export default App;
