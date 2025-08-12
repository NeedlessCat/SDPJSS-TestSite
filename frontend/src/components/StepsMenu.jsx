import React, { useContext, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";

// It's good practice to map icons to feature names or links for dynamic rendering
import { Briefcase, ScrollText, Heart } from "lucide-react"; // Assuming you use lucide-react

const iconMap = {
  "Staff Requirement": Briefcase,
  "Job Requirement": ScrollText,
  Advertisement: Heart,
};

const gradientMap = {
  "Staff Requirements": "from-red-600 to-red-300",
  "Job Openings": "from-red-900 to-red-600",
  Advertisements: "from-red-700 to-red-400",
};

const StepsMenu = () => {
  // 1. Get publicFeatures directly from AppContext
  const { publicFeatures } = useContext(AppContext);
  const navigate = useNavigate();
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const handleClick = (feature) => {
    // The feature object from the backend should have the page link
    navigate(feature.link);
    window.scrollTo(0, 0);
  };

  return (
    <div
      className="flex flex-col items-center gap-4 py-16 text-gray-800"
      id="stepsmenu"
    >
      <h1 className="text-3xl font-medium">Choose Your Step</h1>
      <p className="sm:w-1/3 text-center text-sm">
        Explore the range of services we offer below, including community
        interactions, donations, advertisements, and networking opportunities.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {/* 2. Map directly over the publicFeatures array */}
        {publicFeatures.map((feature, index) => {
          // Dynamically get the Icon and gradient based on the feature name
          const Icon = iconMap[feature.featureName] || Briefcase; // Default icon
          const gradient =
            gradientMap[feature.featureName] || "from-gray-600 to-gray-400";

          return (
            <motion.div
              onClick={() => handleClick(feature)}
              key={feature._id || index} // Use a unique id from the feature if available
              className="relative overflow-hidden rounded-2xl cursor-pointer group"
              onHoverStart={() => setHoveredIndex(index)}
              onHoverEnd={() => setHoveredIndex(null)}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-90 group-hover:opacity-100 transition-opacity`}
              />
              <div className="relative p-8 h-full min-h-[200px] flex flex-col items-center justify-center text-center gap-4">
                <div className="p-3 bg-white/10 rounded-full">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white">
                  {feature.featureName}
                </h3>
                <p
                  className={`text-white/80 text-sm transition-opacity duration-300 ${
                    hoveredIndex === index ? "opacity-100" : "opacity-0"
                  }`}
                >
                  {/* Assuming your feature object has a description */}
                  {feature.description ||
                    `Explore our latest ${feature.featureName}.`}
                </p>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-yellow-200 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default StepsMenu;
