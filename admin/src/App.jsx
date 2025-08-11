import React, { useState } from "react";
import { Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useContext } from "react";
import { AdminContext } from "./context/AdminContext";

import Login from "./pages/Login";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

import Dashboard from "./pages/Dashboard";
import AddAdmin from "./pages/AddAdmin";
import KhandanList from "./pages/KhandanList";
import UserList from "./pages/UserList";
import StaffRequirementList from "./pages/StaffRequirementList";
import JobOpeningList from "./pages/JobOpeningList";
import AdvertisementList from "./pages/AdvertisementList";
import DonationList from "./pages/DonationList";
import NoticeBoard from "./pages/NoticeBoard";
import ManageTeam from "./pages/ManageTeam";
import ScrollToTop from "./components/ScrollToTop";
import DonationCategory from "./pages/DonationCategory";
import Receipt from "./pages/Receipt";
import FamilyTree from "./pages/FamilyTree";
import GuestReceipt from "./pages/GuestReceipt";
import ManageFeatures from "./pages/ManageFeatures";
import ManageAdmins from "./pages/ManageAdmins";
import GuestList from "./pages/GuestList";
import PrintingPortal from "./pages/PrintingPortal";

const App = () => {
  const { aToken } = useContext(AdminContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return aToken ? (
    <div className="bg-[#F8F9FD] min-h-screen">
      <ToastContainer />
      <Navbar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      <div className="relative pt-16">
        {" "}
        {/* Add top padding for fixed navbar */}
        <ScrollToTop />
        <Sidebar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />
        {/* Main content area with responsive left margin */}
        <div className="lg:ml-80 min-h-[calc(100vh-4rem)] p-4 sm:p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/khandan-list" element={<KhandanList />} />
            <Route path="/user-list" element={<UserList />} />
            <Route
              path="/staff-requirement-list"
              element={<StaffRequirementList />}
            />
            <Route path="/job-opening-list" element={<JobOpeningList />} />
            <Route path="/advertisement-list" element={<AdvertisementList />} />
            <Route path="/donation-list" element={<DonationList />} />
            <Route path="/notice-board" element={<NoticeBoard />} />
            <Route path="/manage-team" element={<ManageTeam />} />
            <Route path="/donation-categories" element={<DonationCategory />} />
            <Route path="/receipt" element={<Receipt />} />
            <Route path="/family-tree" element={<FamilyTree />} />
            <Route path="/guest-donations" element={<GuestReceipt />} />
            <Route path="/manage-features" element={<ManageFeatures />} />
            <Route path="/manage-admins" element={<ManageAdmins />} />
            <Route path="/guest-list" element={<GuestList />} />
            <Route path="/printing-portal" element={<PrintingPortal />} />
          </Routes>
        </div>
      </div>
    </div>
  ) : (
    <>
      <Login />
      <ToastContainer />
    </>
  );
};

export default App;
