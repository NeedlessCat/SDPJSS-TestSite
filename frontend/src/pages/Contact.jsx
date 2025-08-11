import React, { useState } from "react";
// Using lucide-react for modern and clean icons
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { useContext } from "react";
import { AppContext } from "../context/AppContext";

const Contact = () => {
  const { backendUrl } = useContext(AppContext);
  // State to hold form data
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  // State to handle loading and submission status
  const [status, setStatus] = useState({
    submitting: false,
    message: "",
    error: false,
  });

  // Handle input changes and update state
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setStatus({ submitting: true, message: "", error: false });

    try {
      // NOTE: Replace 'http://localhost:3001' with your actual backend URL in a production environment
      const response = await fetch(`${backendUrl}/api/c/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Something went wrong");
      }

      // Handle success
      setStatus({
        submitting: false,
        message: "Message sent successfully!",
        error: false,
      });
      setFormData({ name: "", email: "", message: "" }); // Clear form
    } catch (error) {
      // Handle error
      setStatus({
        submitting: false,
        message: `Failed to send message. ${error.message}`,
        error: true,
      });
    }
  };

  // Reusable component for contact info items
  const ContactInfoItem = ({ icon, title, children }) => (
    <div className="flex items-start gap-4">
      <div className="text-red-500 mt-1">{icon}</div>
      <div>
        <p className="text-lg font-semibold text-gray-800">{title}</p>
        <div className="text-gray-600">{children}</div>
      </div>
    </div>
  );

  return (
    <div className="font-sans bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left Side: "Get in Touch" and Contact Details */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Get in <span className="text-red-500">Touch</span>
            </h1>
            <p className="text-lg text-gray-600 mb-10 leading-relaxed max-w-lg mx-auto lg:mx-0">
              We'd love to hear from you! Whether you have a question, feedback,
              or need assistance, our team is ready to help.
            </p>

            <div className="space-y-6">
              <ContactInfoItem icon={<MapPin size={24} />} title="Our Office">
                <p>Shree Durga Sthan, Manpur, Patwatoli</p>
                <p>P.O. Buniyadganj, Gaya - 823003, Bihar, India</p>
                <p className="text-sm text-gray-500 mt-1">
                  <strong>Landmark:</strong> Near UCO Bank, Manpur, Durga Sthan
                </p>
              </ContactInfoItem>

              <ContactInfoItem
                icon={<Phone size={24} />}
                title="Mobile Numbers"
              >
                <a href="tel:+919031859588" className="hover:text-red-500">
                  +91 9031859588
                </a>
                <br />
                <a href="tel:+919472030916" className="hover:text-red-500">
                  +91 9472030916
                </a>
              </ContactInfoItem>

              <ContactInfoItem icon={<Mail size={24} />} title="Email Address">
                <a
                  href="mailto:sdpjssmanpur@gmail.com"
                  className="hover:text-red-500"
                >
                  sdpjssmanpur@gmail.com
                </a>
              </ContactInfoItem>

              <ContactInfoItem icon={<Clock size={24} />} title="Office Hours">
                <p>Monday to Friday: 9:00 AM - 6:00 PM</p>
              </ContactInfoItem>
            </div>
          </div>

          {/* Right Side: Contact Form */}
          <div>
            <div className="bg-white shadow-2xl rounded-xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Send us a Message
              </h2>
              <form onSubmit={handleSubmit} noValidate>
                <div className="mb-5">
                  <label
                    className="block text-gray-700 text-sm font-semibold mb-2"
                    htmlFor="name"
                  >
                    Full Name
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-lg py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-red-500 transition duration-200"
                    id="name"
                    type="text"
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-5">
                  <label
                    className="block text-gray-700 text-sm font-semibold mb-2"
                    htmlFor="email"
                  >
                    Email Address
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-lg py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-red-500 transition duration-200"
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-6">
                  <label
                    className="block text-gray-700 text-sm font-semibold mb-2"
                    htmlFor="message"
                  >
                    Message
                  </label>
                  <textarea
                    className="w-full border border-gray-300 rounded-lg py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-red-500 transition duration-200"
                    id="message"
                    placeholder="Your Message"
                    rows="5"
                    value={formData.message}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>
                <button
                  type="submit"
                  disabled={status.submitting}
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-300 ease-in-out disabled:bg-red-300 disabled:cursor-not-allowed"
                >
                  {status.submitting ? "Sending..." : "Send Message"}
                </button>
              </form>
              {status.message && (
                <p
                  className={`mt-4 text-sm text-center font-medium ${
                    status.error ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {status.message}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
