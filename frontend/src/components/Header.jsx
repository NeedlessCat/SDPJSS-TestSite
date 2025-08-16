import React, { useContext, useState } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import DonationModal from "../components/modalbox/DonationModal"; // Import the DonationModal component
import { useEffect } from "react";

import TransactionStatusModal from "../components/modalbox/TransactionStatusModal";

const Header = () => {
  const { state, setState, utoken, backendUrl, userData } =
    useContext(AppContext);
  const navigate = useNavigate();

  // Modal state for DonationModal
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [showWave, setShowWave] = useState(false);

  const [transaction, setTransaction] = useState({
    isOpen: false,
    status: "",
    message: "",
    receiptData: null,
  });

  useEffect(() => {
    if (utoken) {
      setTimeout(() => setShowWave(true), 500);
    }
  }, [utoken]);

  // Handle donation button click
  const handleDonationClick = () => {
    if (utoken) {
      setShowDonationModal(true);
    } else {
      // If user is not logged in, redirect to login page
      setState("Login");
      navigate("/login");
    }
  };
  const handleTransactionComplete = (result) => {
    setTransaction({
      isOpen: true,
      status: result.status,
      message: result.message,
      receiptData: result.receiptData,
    });
  };

  // Close donation modal
  const closeDonationModal = () => {
    setShowDonationModal(false);
  };
  const closeTransactionModal = () => {
    setTransaction({ ...transaction, isOpen: false });
  };

  return (
    <div
      style={{
        backgroundImage: `url(${assets.heroImg})`,
      }}
      className="bg-cover bg-center rounded-lg"
    >
      <div className="flex flex-col md:flex-row flex-wrap backdrop-filter shadow-[0_10px_20px_-5px_rgba(255,223,0,0.3)] bg-primary bg-opacity-70 rounded-lg px-6 md:px-10 lg:px-20">
        <div className="md:w-4/5 flex flex-col items-center justify-center text-center gap-4 py-10 m-auto md:py-[10vw] ">
          {utoken && (
            <>
              <div className="flex items-center gap-1 mb-[-10px] border-b pb-2 md:pl-2 md:pr-2">
                <p className="text-md md:text-lg lg:text-2xl text-white font-semibold leading-tight md:leading-tight lg:leading-tight">
                  Hey! {userData.fullname}
                </p>
                <span
                  className={` text-lg md:text-2xl transition-transform duration-700 ${
                    showWave ? "animate-bounce" : ""
                  }`}
                  style={{
                    animationDuration: "1s",
                    animationIterationCount: "3",
                  }}
                >
                  👋
                </span>
              </div>
            </>
          )}
          <p className="text-3xl md:text-4xl lg-text-5xl text-white font-semibold leading-tight md:leading-tight lg:leading-tight">
            Welcome to SDPJSS <br />
          </p>
          <div className="flex flex-col md:flex-row items-center gap-3 text-white text-sm font-light">
            <p>
              {" "}
              A community-driven platform where members can connect, donate,
              share advertisements,
              <br className="hidden sm:block" /> and engage in meaningful
              interactions to support and uplift one another
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            {!utoken && (
              <button
                className="px-6 py-3 bg-white text-primary hover:bg-white/90 rounded-full font-medium text-lg flex items-center justify-center transition-all duration-300"
                onClick={() => {
                  setState("Register");
                  navigate("/login");
                }}
              >
                Register to SDPJSS
                <img className="ml-2 w-3" src={assets.arrow_icon} alt="" />
              </button>
            )}
            <button
              className="px-6 py-3 bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary rounded-full font-medium text-lg flex items-center justify-center transition-all duration-300"
              onClick={handleDonationClick}
            >
              Donate Now{" "}
              <img className=" ml-2 w-3" src={assets.arrow_icon} alt="" />
            </button>
          </div>
        </div>
      </div>

      {/* DonationModal Component */}
      <DonationModal
        isOpen={showDonationModal}
        onClose={closeDonationModal}
        backendUrl={backendUrl} // You may need to get this from context or props
        userToken={utoken}
        onTransactionComplete={handleTransactionComplete}
      />

      {/* Render the TransactionStatusModal here */}
      <TransactionStatusModal
        isOpen={transaction.isOpen}
        onClose={closeTransactionModal}
        status={transaction.status}
        message={transaction.message}
        receiptData={transaction.receiptData}
      />
    </div>
  );
};

export default Header;
