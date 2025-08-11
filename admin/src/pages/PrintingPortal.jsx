import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import html2pdf from "html2pdf.js";
import { useContext } from "react";
import { AdminContext } from "../context/AdminContext";

// A new, hidden component specifically for formatting the PDF output.
// It's hidden from the user's view but present in the DOM for html2pdf to capture.
const PrintableAddresses = React.forwardRef(({ addresses }, ref) => {
  if (!addresses || addresses.length === 0) {
    return null;
  }

  // Basic styling for the PDF content. Tailwind classes won't apply here,
  // so we use inline styles. 'page-break-inside' is crucial for printing.
  return (
    <div ref={ref} style={{ padding: "1rem", fontFamily: "Arial, sans-serif" }}>
      {addresses.map((addr) => (
        <div
          key={addr.id}
          style={{
            display: "flex",
            border: "1px solid #333",
            padding: "1rem",
            marginBottom: "1rem",
            pageBreakInside: "avoid",
          }}
        >
          <div
            style={{
              width: "50%",
              paddingRight: "1rem",
              borderRight: "1px dashed #999",
            }}
          >
            <h4
              style={{
                marginTop: 0,
                marginBottom: "0.5rem",
                fontSize: "14px",
                fontWeight: "bold",
              }}
            >
              FROM:
            </h4>
            <p style={{ margin: 0, fontSize: "12px" }}>{addr.fromAddress}</p>
          </div>
          <div style={{ width: "50%", paddingLeft: "1rem" }}>
            <h4
              style={{
                marginTop: 0,
                marginBottom: "0.5rem",
                fontSize: "14px",
                fontWeight: "bold",
              }}
            >
              TO:
            </h4>
            <p style={{ margin: 0, fontSize: "12px", fontWeight: "bold" }}>
              {addr.toName}
            </p>
            <p style={{ margin: 0, fontSize: "12px" }}>{addr.toAddress}</p>
            <p style={{ margin: 0, fontSize: "12px" }}>
              <strong>Phone:</strong> {addr.toPhone}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
});

// Main component
const PrintingPortal = () => {
  const [printType, setPrintType] = useState("courier_addresses");
  const [year, setYear] = useState(new Date().getFullYear());
  const [location, setLocation] = useState("all");
  const [availableYears, setAvailableYears] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);

  const { backendUrl, aToken } = useContext(AdminContext);

  const printRef = useRef(null); // Ref for the hidden printable component

  // Fetch available years on mount (no changes here)
  useEffect(() => {
    const fetchYears = async () => {
      try {
        const response = await axios.get(
          backendUrl + "/api/admin/available-years",
          {
            headers: { aToken },
          }
        );
        if (response.data.success) {
          setAvailableYears(response.data.years);
        }
      } catch (err) {
        console.error("Failed to fetch years:", err);
        setError("Could not load available years.");
      }
    };
    fetchYears();
  }, []);

  // Fetch address data when filters change (no changes here)
  const fetchAddresses = useCallback(async () => {
    if (!year) return;
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(
        backendUrl + "/api/admin/courier-addresses",
        {
          params: { year, location },
          headers: { aToken },
        }
      );
      if (response.data.success) {
        setAddresses(response.data.addresses);
        setCount(response.data.count);
      } else {
        setError(response.data.message || "Failed to fetch addresses.");
        setAddresses([]);
        setCount(0);
      }
    } catch (err) {
      console.error("Failed to fetch addresses:", err);
      setError("An error occurred while fetching data.");
      setAddresses([]);
      setCount(0);
    } finally {
      setLoading(false);
    }
  }, [year, location]);

  useEffect(() => {
    if (printType === "courier_addresses") {
      fetchAddresses();
    }
  }, [fetchAddresses, printType]);

  // UPDATED PDF Handler: Uses html2pdf.js on the client side
  const handleDownloadPDF = () => {
    if (downloading || addresses.length === 0) return;

    setDownloading(true);
    setError("");

    const element = printRef.current; // Get the hidden DOM element via ref
    if (!element) {
      setError("Could not find printable content. Please refresh.");
      setDownloading(false);
      return;
    }

    const opt = {
      margin: 0.5,
      filename: `courier-addresses-${year}-${location}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };

    // Use the html2pdf library to generate and save the file
    html2pdf()
      .from(element)
      .set(opt)
      .save()
      .then(() => {
        setDownloading(false);
      })
      .catch((err) => {
        setError("An error occurred while generating the PDF.");
        console.error("PDF generation error:", err);
        setDownloading(false);
      });
  };

  return (
    <div className="p-5 bg-slate-100 rounded-lg shadow-lg font-sans">
      {/* VISIBLE UI: Header, Filters, etc. (No changes here) */}
      <div className="flex justify-between items-center border-b-2 border-gray-200 pb-4 mb-5">
        <h2 className="text-2xl font-bold text-gray-800 m-0">
          🖨️ Printing Portal
        </h2>
        <div>
          <button
            onClick={handleDownloadPDF}
            className="py-2 px-4 bg-blue-600 text-white text-sm font-medium rounded-md cursor-pointer transition-colors duration-200 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
            disabled={downloading || addresses.length === 0}
          >
            {downloading ? "Generating PDF..." : "Download as PDF"}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-5 mb-5">
        <div className="flex flex-col">
          <label
            htmlFor="printType"
            className="text-xs font-semibold text-gray-600 mb-1"
          >
            Print What
          </label>
          <select
            id="printType"
            value={printType}
            onChange={(e) => setPrintType(e.target.value)}
            className="p-2 border border-gray-300 rounded bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="courier_addresses">Courier Addresses</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label
            htmlFor="year"
            className="text-xs font-semibold text-gray-600 mb-1"
          >
            Year
          </label>
          <select
            id="year"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="p-2 border border-gray-300 rounded bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {availableYears.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label
            htmlFor="location"
            className="text-xs font-semibold text-gray-600 mb-1"
          >
            Location
          </label>
          <select
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="p-2 border border-gray-300 rounded bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All</option>
            <option value="in_india">In India</option>
            <option value="outside_india">Outside India</option>
          </select>
        </div>
      </div>

      {error && (
        <p className="text-center p-4 text-red-700 bg-red-100 border border-red-300 rounded-md">
          {error}
        </p>
      )}

      {/* VISIBLE Address List for preview */}
      <div className="mt-5">
        {loading ? (
          <p className="text-center p-10 text-base text-gray-500">
            Loading Addresses...
          </p>
        ) : (
          <>
            <div className="max-h-[60vh] overflow-y-auto border border-gray-200 rounded-md p-3 bg-white">
              {addresses.length > 0 ? (
                addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="flex border border-gray-300 p-4 mb-4 rounded-md bg-white"
                  >
                    <div className="w-1/2 pr-4 border-r border-dashed border-gray-400">
                      <h4 className="mt-0 mb-2 text-sm font-bold text-gray-700">
                        FROM:
                      </h4>
                      <p className="m-0 mb-1 leading-relaxed text-sm text-gray-600">
                        {addr.fromAddress}
                      </p>
                    </div>
                    <div className="w-1/2 pl-4">
                      <h4 className="mt-0 mb-2 text-sm font-bold text-gray-700">
                        TO:
                      </h4>
                      <p className="m-0 mb-1 leading-relaxed text-sm text-gray-600 font-semibold">
                        {addr.toName}
                      </p>
                      <p className="m-0 mb-1 leading-relaxed text-sm text-gray-600">
                        {addr.toAddress}
                      </p>
                      <p className="m-0 mb-1 leading-relaxed text-sm text-gray-600">
                        <strong>Phone:</strong> {addr.toPhone}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center p-10 text-base text-gray-500">
                  No addresses found for the selected filters.
                </p>
              )}
            </div>
            <div className="mt-5 pt-4 border-t-2 border-gray-200 text-right font-bold text-base text-gray-800">
              Total Addresses Found: {count}
            </div>
          </>
        )}
      </div>

      {/* HIDDEN component used only for PDF generation */}
      <div className="absolute -left-full top-0">
        <PrintableAddresses ref={printRef} addresses={addresses} />
      </div>
    </div>
  );
};

export default PrintingPortal;
