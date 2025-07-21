import React from "react";
import Header from "../components/Header";
import StepsMenu from "../components/StepsMenu";
import Notice from "../components/Notice";
import AccountStatusModal from "../components/modalbox/ApprovalStatusModal";

const Home = () => {
  return (
    <div>
      {/* Account Status Modal - will only show if user is pending/disabled */}
      <AccountStatusModal />

      <Header />
      <Notice />
      <StepsMenu />
    </div>
  );
};

export default Home;
