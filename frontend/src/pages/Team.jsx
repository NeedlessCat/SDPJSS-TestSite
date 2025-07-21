import React, { useState, useEffect, useContext } from "react";
import { AppContext } from "../context/AppContext";

const Team = () => {
  const { backendUrl } = useContext(AppContext);
  const [teamMembers, setTeamMembers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Define the category order and display names
  const categoryConfig = {
    "chairman-vicechairman": { title: "Chairman and Vice-Chairman", order: 1 },
    "president-vicepresident": {
      title: "President and Vice-President",
      order: 2,
    },
    secretary: { title: "Secretary", order: 3 },
    treasurer: { title: "Treasurer", order: 4 },
    consultant: { title: "Consultant", order: 5 },
    "web-developer-advisors": { title: "Web Developer & Advisors", order: 6 },
  };

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${backendUrl}/api/c/get-team-members`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Team: ", data);

      if (data.success) {
        setTeamMembers(data.teamMembers);
      } else {
        throw new Error(data.message || "Failed to fetch team members");
      }
    } catch (err) {
      console.error("Error fetching team members:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderTeamSection = (category, members) => {
    console.log("Category: ", category, members);
    const config = categoryConfig[category];
    if (!config || !members || members.length === 0) return null;
    return (
      <div
        key={category}
        className="flex flex-col items-center gap-4 py-8 text-gray-900 md:mx-10"
        id="stepsmenu"
      >
        <h1 className="text-3xl font-medium">{config.title}</h1>
        <div className="w-full grid grid-cols-auto gap-4 pt-5 gap-y-6 px-3 sm:px-0">
          {members.map((member, index) => (
            <div
              className="border border-red-200 rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-10px] transition-all duration-500"
              key={member._id || index}
            >
              <img
                className="bg-red-50 w-full h-64 object-cover"
                src={member.image || member.photo}
                alt={member.name}
                onError={(e) => {
                  e.target.src = "/placeholder-image.jpg"; // Add a fallback image
                }}
              />
              <div className="p-4">
                <p className="text-gray-900 text-lg font-medium">
                  {member.name}
                </p>
                <p className="text-gray-600 text-sm">
                  {member.post || member.position}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4">
        <div className="text-center text-2xl pt-10 text-gray-500">
          <p>
            OUR <span className="text-gray-700 font-medium">TEAM</span>
          </p>
        </div>
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4">
        <div className="text-center text-2xl pt-10 text-gray-500">
          <p>
            OUR <span className="text-gray-700 font-medium">TEAM</span>
          </p>
        </div>
        <div className="flex flex-col justify-center items-center py-20">
          <p className="text-red-500 text-lg mb-4">
            Error loading team members
          </p>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchTeamMembers}
            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Sort categories by their defined order
  const sortedCategories = Object.keys(teamMembers).sort((a, b) => {
    const orderA = categoryConfig[a]?.order || 999;
    const orderB = categoryConfig[b]?.order || 999;
    return orderA - orderB;
  });

  console.log(sortedCategories);

  return (
    <div className="container mx-auto px-4">
      <div className="text-center text-2xl pt-10 text-gray-500">
        <p>
          OUR <span className="text-gray-700 font-medium">TEAM</span>
        </p>
      </div>

      {sortedCategories.length === 0 ? (
        <div className="flex justify-center items-center py-20">
          <p className="text-gray-600 text-lg">No team members found</p>
        </div>
      ) : (
        sortedCategories.map((category) =>
          renderTeamSection(category, teamMembers[category])
        )
      )}
    </div>
  );
};

export default Team;
