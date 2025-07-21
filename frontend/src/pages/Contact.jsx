import React from "react";
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from "react-icons/fa"; // Import React Icons

const Contact = () => {
  return (
    <div className="container mx-auto px-6 py-16 min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Get in Touch Section */}
        <div className="text-center lg:text-left">
          <h1 className="text-4xl font-bold text-gray-700 mb-6">
            Get in <span className="text-red-500">Touch</span> with Us.
          </h1>
          <p className="text-lg text-gray-600 mb-10 leading-relaxed">
            We’d love to hear from you! Whether you have a question, feedback,
            or need help, drop us a message, and we’ll get back to you soon.
          </p>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="text-red-500 text-3xl">
                <FaMapMarkerAlt />
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-700">Address</p>
                <p className="text-gray-600">
                  123 Farm Road, redville, AG 12345
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="text-red-500 text-3xl">
                <FaPhoneAlt />
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-700">Phone</p>
                <p className="text-gray-600">(555) 123-4567</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="text-red-500 text-3xl">
                <FaEnvelope />
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-700">Email</p>
                <p className="text-gray-600">info@sustainablefarms.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div>
          <form className="bg-white shadow-lg rounded-lg px-8 py-10">
            <div className="mb-6">
              <label
                className="block text-gray-700 text-sm font-semibold mb-2"
                htmlFor="name"
              >
                Name
              </label>
              <input
                className="w-full border border-gray-300 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-red-500"
                id="name"
                type="text"
                placeholder="Your Name"
                required
              />
            </div>
            <div className="mb-6">
              <label
                className="block text-gray-700 text-sm font-semibold mb-2"
                htmlFor="email"
              >
                Email
              </label>
              <input
                className="w-full border border-gray-300 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-red-500"
                id="email"
                type="email"
                placeholder="Your Email"
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
                className="w-full border border-gray-300 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-red-500"
                id="message"
                placeholder="Your Message"
                rows="5"
                required
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
