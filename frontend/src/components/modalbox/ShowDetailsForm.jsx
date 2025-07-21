import React from "react";
import {
  User,
  Phone,
  Mail,
  MapPin,
  GraduationCap,
  Briefcase,
  Heart,
  Calendar,
  Droplet,
} from "lucide-react";

const ShowDetailsForm = ({ member, onClose }) => {
  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Not specified";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const DetailSection = ({ icon: Icon, title, children }) => (
    <div className="bg-white border-l-4 border-red-500 shadow-lg rounded-r-lg overflow-hidden mb-6">
      <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 border-b border-red-200">
        <div className="flex items-center gap-3">
          <div className="bg-red-500 p-2 rounded-full">
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-red-800">{title}</h3>
            <div className="h-0.5 w-12 bg-red-500 mt-1"></div>
          </div>
        </div>
      </div>
      <div className="p-4 space-y-3 bg-white">{children}</div>
    </div>
  );

  const InfoItem = ({ label, value }) => (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 py-1 border-b border-gray-100 last:border-b-0">
      <span className="font-semibold text-red-700 min-w-36 text-sm uppercase tracking-wide">
        {label}:
      </span>
      <span className="text-gray-800 font-medium">
        {value || "Not specified"}
      </span>
    </div>
  );

  return (
    <div className="max-h-96 overflow-y-auto space-y-4 bg-gray-50 p-2 rounded-lg">
      {/* Basic Information */}
      <DetailSection icon={User} title="Basic Information">
        <InfoItem label="Full Name" value={member.fullname} />
        <InfoItem label="Father ID" value={member.fatherid} />
        <InfoItem label="Mother" value={member.mother} />
        <InfoItem
          label="Gender"
          value={
            member.gender?.charAt(0).toUpperCase() + member.gender?.slice(1)
          }
        />
        <InfoItem label="Date of Birth" value={formatDate(member.dob)} />

        <InfoItem label="Username" value={member.username} />
      </DetailSection>

      {/* Contact Information */}
      {member.contact && (
        <DetailSection icon={Phone} title="Contact Information">
          <InfoItem label="Email" value={member.contact.email} />
          <InfoItem
            label="Mobile"
            value={
              member.contact.mobileno
                ? `${member.contact.mobileno.code} ${member.contact.mobileno.number}`
                : "Not specified"
            }
          />
          <InfoItem label="WhatsApp" value={member.contact.whatsappno} />
        </DetailSection>
      )}

      {/* Address Information */}
      {member.address && (
        <DetailSection icon={MapPin} title="Address">
          <InfoItem
            label="Current Location"
            value={member.address.currlocation}
          />
          <InfoItem label="Country" value={member.address.country} />
          <InfoItem label="State" value={member.address.state} />
          <InfoItem label="District" value={member.address.district} />
          <InfoItem label="City" value={member.address.city} />
          <InfoItem label="Post Office" value={member.address.postoffice} />
          <InfoItem label="PIN Code" value={member.address.pin} />
          <InfoItem label="Landmark" value={member.address.landmark} />
          <InfoItem label="Street" value={member.address.street} />
          <InfoItem label="Apartment" value={member.address.apartment} />
          <InfoItem label="Floor" value={member.address.floor} />
          <InfoItem label="Room" value={member.address.room} />
        </DetailSection>
      )}

      {/* Education */}
      {member.education && (
        <DetailSection icon={GraduationCap} title="Education">
          <InfoItem label="Education Level" value={member.education.upto} />
          <InfoItem
            label="Qualification"
            value={member.education.qualification}
          />
        </DetailSection>
      )}

      {/* Profession */}
      {member.profession && (
        <DetailSection icon={Briefcase} title="Profession">
          <InfoItem label="Category" value={member.profession.category} />
          <InfoItem label="Job Title" value={member.profession.job} />
          <InfoItem
            label="Specialization"
            value={member.profession.specialization}
          />
        </DetailSection>
      )}

      {/* Marriage Information */}
      {member.marriage && (
        <DetailSection icon={Heart} title="Marriage Status">
          <InfoItem
            label="Marital Status"
            value={
              member.marriage.maritalstatus?.charAt(0).toUpperCase() +
              member.marriage.maritalstatus?.slice(1)
            }
          />
          <InfoItem label="Marriage Number" value={member.marriage.number} />
          {member.marriage.spouse && member.marriage.spouse.length > 0 && (
            <InfoItem
              label="Spouse(s)"
              value={member.marriage.spouse.join(", ")}
            />
          )}
        </DetailSection>
      )}

      {/* Health Information */}
      <DetailSection icon={Droplet} title="Health Information">
        <InfoItem label="Health Issues" value={member.healthissue || "None"} />
        <InfoItem label="Blood Group" value={member.bloodgroup} />
        <InfoItem
          label="Living Status"
          value={member.islive ? "Alive" : "Deceased"}
        />
      </DetailSection>

      {/* Close Button */}
      <div className="flex justify-end pt-6 pb-2">
        <button
          onClick={onClose}
          className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-lg hover:from-red-700 hover:to-red-800 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ShowDetailsForm;
