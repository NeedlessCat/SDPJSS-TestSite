import React from "react";
import Header from "../components/Header";
import StepsMenu from "../components/StepsMenu";
import Notice from "../components/Notice";
import AccountStatusModal from "../components/modalbox/ApprovalStatusModal";
import ServicesGallery from "../components/ServiceGallery";

const Home = () => {
  return (
    <div>
      {/* Account Status Modal - will only show if user is pending/disabled */}
      <AccountStatusModal />

      <Header />
      <Notice />
      <StepsMenu />
      <ServicesGallery />
    </div>
  );
};

export default Home;
