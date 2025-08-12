import React, { useState, useEffect, useRef, useContext, useMemo } from "react";
import {
  Search,
  Plus,
  X,
  Download,
  XCircle,
  Printer,
  ChevronLeft,
  ChevronRight,
  Users,
  Trash2,
  Clock,
  Scissors,
} from "lucide-react";
import axios from "axios";
import { AdminContext } from "../context/AdminContext";
import html2pdf from "html2pdf.js";
import { toast } from "react-toastify";

// Helper function to convert number to Indian currency words
const toWords = (num) => {
  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];
  const numToWords = (n) => {
    let word = "";
    if (n === 0) return word;
    if (n < 20) {
      word = ones[n];
    } else {
      word =
        tens[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + ones[n % 10] : "");
    }
    return word;
  };
  const number = Math.round(num);
  if (number === 0) return "Zero Rupees Only";
  if (number > 999999999) return "Number is too large";
  let result = "";
  const crore = Math.floor(number / 10000000);
  const lakh = Math.floor((number % 10000000) / 100000);
  const thousand = Math.floor((number % 100000) / 1000);
  const hundred = Math.floor((number % 1000) / 100);
  const rest = number % 100;
  if (crore) result += numToWords(crore) + " Crore ";
  if (lakh) result += numToWords(lakh) + " Lakh ";
  if (thousand) result += numToWords(thousand) + " Thousand ";
  if (hundred) result += numToWords(hundred) + " Hundred ";
  if (rest) result += numToWords(rest);
  return result.trim().replace(/\s+/g, " ") + " Rupees Only";
};

// =================================================================
// MODAL COMPONENT
// =================================================================
const ReceiptModal = ({
  data,
  isGroup,
  onClose,
  courierCharge,
  adminName,
  totals,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const receiptRef = useRef(null);

  const currentReceipt = isGroup ? data[currentIndex] : data;
  if (!currentReceipt) return null;

  const { donationData, guestData } = currentReceipt;

  // For group receipts, we need to find the matching totals
  const currentTotals = isGroup
    ? totals.find((t) => t.receiptId === donationData.receiptId) || {
        totalWeight: 0,
        totalPackets: 0,
      }
    : totals;

  const handleDownloadClick = (receiptNode, filename) => {
    const opt = {
      margin: 0.5,
      filename: filename,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };
    html2pdf().from(receiptNode).set(opt).save();
  };

  const handleDownloadCurrent = () => {
    handleDownloadClick(
      receiptRef.current,
      `Receipt-${donationData.receiptId}.pdf`
    );
  };

  const handleDownloadAllSeparately = () => {
    if (!isGroup) return;
    toast.info(`Starting download of ${data.length} separate PDFs...`);
    data.forEach((receipt, index) => {
      setTimeout(() => {
        const element = document.getElementById(`receipt-preview-${index}`);
        if (element) {
          handleDownloadClick(
            element,
            `Receipt-${receipt.donationData.receiptId}.pdf`
          );
        }
      }, index * 1000);
    });
  };

  const handleDownloadAllCombined = async () => {
    if (!isGroup) return;
    const combinedContainer = document.createElement("div");
    document.body.appendChild(combinedContainer);
    data.forEach((receipt, index) => {
      const receiptHtml = document.getElementById(
        `receipt-preview-${index}`
      ).innerHTML;
      const pageBreak =
        index < data.length - 1
          ? '<div style="page-break-after: always;"></div>'
          : "";
      combinedContainer.innerHTML += receiptHtml + pageBreak;
    });
    const opt = {
      margin: 0.5,
      filename: `Group-Donation-Receipts-${Date.now()}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };
    toast.info("Generating combined PDF... please wait.");
    await html2pdf().from(combinedContainer).set(opt).save();
    document.body.removeChild(combinedContainer);
    toast.success("Combined PDF has been downloaded.");
  };

  const AllReceiptsContainer = () => (
    <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
      {isGroup &&
        data.map((receipt, index) => {
          const receiptTotals = totals.find(
            (t) => t.receiptId === receipt.donationData.receiptId
          ) || { totalWeight: 0, totalPackets: 0 };
          return (
            <div
              id={`receipt-preview-${index}`}
              key={receipt.donationData.receiptId}
            >
              <ReceiptTemplate
                donationData={receipt.donationData}
                guestData={receipt.guestData}
                courierCharge={courierCharge}
                adminName={adminName}
                totalWeight={receiptTotals.totalWeight}
                totalPackets={receiptTotals.totalPackets}
              />
            </div>
          );
        })}
    </div>
  );

  return (
    <>
      <AllReceiptsContainer />
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col">
          <div className="p-4 border-b flex justify-between items-center flex-wrap gap-2">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Receipt Preview
              </h2>
              {isGroup && (
                <span className="text-sm text-gray-500">
                  Showing {currentIndex + 1} of {data.length}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {isGroup && (
                <>
                  <button
                    onClick={handleDownloadAllCombined}
                    className="flex items-center gap-2 bg-purple-600 text-white px-3 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors text-sm"
                  >
                    <Download size={16} /> All (Combined)
                  </button>
                  <button
                    onClick={handleDownloadAllSeparately}
                    className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm"
                  >
                    <Download size={16} /> All (Separate)
                  </button>
                </>
              )}
              <button
                onClick={handleDownloadCurrent}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                <Download size={18} /> {isGroup ? "This One" : "Download PDF"}
              </button>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-red-600"
              >
                <XCircle size={24} />
              </button>
            </div>
          </div>
          <div className="p-2 md:p-6 overflow-y-auto relative">
            {isGroup && (
              <>
                <button
                  onClick={() => setCurrentIndex((p) => Math.max(0, p - 1))}
                  disabled={currentIndex === 0}
                  className="absolute left-0 sm:left-2 top-1/2 -translate-y-1/2 bg-white/70 rounded-full p-1 shadow-md hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed z-10"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={() =>
                    setCurrentIndex((p) => Math.min(data.length - 1, p + 1))
                  }
                  disabled={currentIndex === data.length - 1}
                  className="absolute right-0 sm:right-2 top-1/2 -translate-y-1/2 bg-white/70 rounded-full p-1 shadow-md hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed z-10"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
            <div ref={receiptRef}>
              <ReceiptTemplate
                donationData={donationData}
                guestData={guestData}
                courierCharge={courierCharge}
                adminName={adminName}
                totalWeight={currentTotals.totalWeight}
                totalPackets={currentTotals.totalPackets}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// =================================================================
// RECEIPT TEMPLATE COMPONENT
// =================================================================
const ReceiptTemplate = ({
  donationData,
  guestData,
  courierCharge = 0,
  adminName,
  totalWeight,
  totalPackets,
}) => {
  const finalTotalAmount = donationData.amount + courierCharge;

  const headerCellStyle = {
    padding: "8px",
    textAlign: "left",
    borderBottom: "1px solid #eee",
    backgroundColor: "#f2f2f2",
    fontWeight: 600,
    fontSize: "12px",
  };
  const bodyCellStyle = {
    padding: "8px",
    textAlign: "left",
    borderBottom: "1px solid #eee",
    fontSize: "12px",
  };
  const bodyCellRightAlign = { ...bodyCellStyle, textAlign: "right" };

  return (
    <>
      <style>
        {`@media print { body { -webkit-print-color-adjust: exact; }  .bill-container { box-shadow: none !important; border: none !important;} }`}
      </style>
      <div
        style={{
          position: "absolute",
          top: "35%",
          left: "50%",
          width: "60%",
          height: "60%",
          transform: "translate(-50%, -50%)",
          backgroundImage:
            "url(https://res.cloudinary.com/needlesscat/image/upload/v1754307740/logo_unr2rc.jpg)",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center center",
          backgroundSize: "contain",
          opacity: 0.08,
          zIndex: 10,
          pointerEvents: "none",
        }}
      ></div>
      <div
        className="bill-container"
        style={{
          maxWidth: "800px",
          margin: "auto",
          border: "1px solid #ccc",
          padding: "10px 20px",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          color: "#333",
          position: "relative",
        }}
      >
        <div
          className="header"
          style={{
            textAlign: "center",
            borderBottom: "2px solid #d32f2f",
            paddingBottom: "10px",
            marginBottom: "10px",
          }}
        >
          <div className="text-xs flex justify-between">
            <span>
              <b>Estd. 1939</b>
            </span>
            <span>
              <b>Reg. No. 2020/272</b>
            </span>
          </div>
          <div
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              color: "#d32f2f",
              marginBottom: "1px",
            }}
          >
            SHREE DURGAJI PATWAY JATI SUDHAR SAMITI
          </div>
          <div style={{ marginBottom: "1px", fontSize: "14px" }}>
            Shree Durga Sthan, Patwatoli, Manpur, P.O. Buniyadganj, Gaya Ji -
            823003
          </div>
          <div style={{ fontSize: "12px", color: "#444" }}>
            <strong>PAN:</strong> ABBTS1301C | <strong>Contact:</strong> 0631
            2952160, +91 9472030916 | <strong>Email:</strong>{" "}
            sdpjssmanpur@gmail.com
          </div>
        </div>
        <div
          style={{
            fontSize: "16px",
            fontWeight: 600,
            textAlign: "center",
            margin: "10px 0",
            letterSpacing: "1px",
          }}
        >
          DONATION RECEIPT
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "10px",
            fontSize: "12px",
          }}
        >
          <div>
            <strong>Receipt No:</strong> {donationData.receiptId}
          </div>
          <div>
            <strong>Date:</strong>{" "}
            {new Date(donationData.createdAt).toLocaleDateString("en-IN", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>
        <div
          style={{
            backgroundColor: "#f9f9f9",
            padding: "10px",
            border: "1px dashed #ddd",
            borderRadius: "8px",
            marginBottom: "12px",
          }}
        >
          <h3
            style={{
              marginTop: 0,
              color: "#d32f2f",
              borderBottom: "1px solid #eee",
              paddingBottom: "5px",
              fontSize: "14px",
              marginBottom: "8px",
            }}
          >
            Donor Details
          </h3>
          <p style={{ fontSize: "12px", margin: "4px 0" }}>
            <strong>Name:</strong> {guestData.fullname}
          </p>
          <p style={{ fontSize: "12px", margin: "4px 0" }}>
            <strong>Father's Name:</strong> {guestData.father}
          </p>
          <p style={{ fontSize: "12px", margin: "4px 0" }}>
            <strong>Mobile:</strong> {guestData.contact.mobileno.code}{" "}
            {guestData.contact.mobileno.number}
          </p>
          <p style={{ fontSize: "12px", margin: "4px 0" }}>
            <strong>Address:</strong> {guestData.address.street},{" "}
            {guestData.address.city}, {guestData.address.state} -{" "}
            {guestData.address.pin}
          </p>
        </div>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: "15px",
          }}
        >
          <thead>
            <tr>
              {["Item", "Quantity", "Amount (₹)", "Weight (g)", "Packet"].map(
                (header) => (
                  <th
                    key={header}
                    style={{
                      ...headerCellStyle,
                      textAlign: [
                        "Quantity",
                        "Amount (₹)",
                        "Weight (g)",
                        "Packet",
                      ].includes(header)
                        ? "right"
                        : "left",
                    }}
                  >
                    {header}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {donationData.list.map((item, index) => (
              <tr key={index}>
                <td style={bodyCellStyle}>{item.category}</td>
                <td style={bodyCellRightAlign}>
                  {item.number.toLocaleString("en-IN")}
                </td>
                <td style={bodyCellRightAlign}>
                  ₹{item.amount.toLocaleString("en-IN")}
                </td>
                <td style={bodyCellRightAlign}>
                  {item.quantity.toLocaleString("en-IN")}
                </td>
                <td style={bodyCellRightAlign}>
                  {item.isPacket ? "Yes" : "No"}
                </td>
              </tr>
            ))}
            {courierCharge > 0 && (
              <tr>
                <td
                  colSpan={2}
                  style={{
                    ...bodyCellStyle,
                    borderTop: "2px solid #ddd",
                    fontWeight: "bold",
                  }}
                >
                  Courier Charges
                </td>
                <td
                  style={{
                    ...bodyCellRightAlign,
                    borderTop: "2px solid #ddd",
                    fontWeight: "bold",
                  }}
                >
                  ₹{courierCharge.toLocaleString("en-IN")}
                </td>
                <td
                  colSpan={2}
                  style={{ ...bodyCellStyle, borderTop: "2px solid #ddd" }}
                ></td>
              </tr>
            )}
            <tr
              style={{
                fontWeight: "bold",
                fontSize: "12px",
                backgroundColor: "#f2f2f2",
              }}
            >
              <td
                colSpan={2}
                style={{
                  padding: "10px 8px",
                  textAlign: "left",
                  borderTop: "2px solid #ddd",
                }}
              >
                TOTAL AMOUNT
              </td>
              <td
                style={{
                  ...bodyCellRightAlign,
                  padding: "10px 8px",
                  borderTop: "2px solid #ddd",
                }}
              >
                ₹{finalTotalAmount.toLocaleString("en-IN")}
              </td>
              <td
                colSpan={2}
                style={{ padding: "10px 8px", borderTop: "2px solid #ddd" }}
              ></td>
            </tr>
          </tbody>
        </table>
        <div
          style={{
            padding: "8px",
            backgroundColor: "#f9f9f9",
            borderLeft: "4px solid #d32f2f",
            marginTop: "15px",
            fontWeight: "bold",
            fontSize: "12px",
          }}
        >
          Amount in Words: {toWords(finalTotalAmount)}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "#f9f9f9",
            padding: "12px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            marginTop: "15px",
            fontSize: "12px",
          }}
        >
          <div>
            <p style={{ margin: "0 0 5px 0" }}>
              <strong>Payment Method:</strong> {donationData.method}
            </p>
            <p style={{ margin: "0" }}>
              <strong>Transaction ID:</strong>{" "}
              {donationData.transactionId || "N/A"}
            </p>
          </div>
          <div
            style={{
              backgroundColor: "#077e13ff",
              color: "white",
              padding: "6px 12px",
              borderRadius: "4px",
              fontWeight: "bold",
              border: "1px solid #044202ff",
              fontSize: "14px",
            }}
          >
            PAID
          </div>
        </div>

        <div
          style={{
            textAlign: "center",
            marginTop: "25px",
            paddingTop: "10px",
            borderTop: "1px solid #ccc",
            fontSize: "10px",
            color: "#777",
          }}
        >
          <p>
            Thank you for your generous contribution. This is a
            computer-generated receipt.
          </p>
          <p style={{ marginTop: "2px", fontStyle: "italic" }}>
            Generated by: <strong>{adminName}</strong> on{" "}
            {new Date().toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      {/* --- TEAR-OFF SLIP START --- */}
      <div
        style={{
          marginTop: "10px",
          position: "relative",
          borderTop: "2px dashed #333",
        }}
      >
        <Scissors
          size={18}
          style={{
            position: "absolute",
            top: "-12px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "white",
            padding: "0 5px",
          }}
        />

        {/* Watermark background */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "40%",
            height: "60%",
            transform: "translate(-50%, -40%)",
            backgroundImage:
              "url(https://res.cloudinary.com/needlesscat/image/upload/v1754307740/logo_unr2rc.jpg)",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center center",
            backgroundSize: "contain",
            opacity: 0.06,
            zIndex: 10,
            pointerEvents: "none",
          }}
        ></div>

        {/* Main slip container */}
        <div
          style={{
            maxWidth: "800px",
            margin: "auto",
            marginTop: "10px",
            border: "2px solid #d32f2f",
            borderRadius: "8px",
            padding: "15px 20px",
            backgroundColor: "#fefefe",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            color: "#333",
            position: "relative",
            zIndex: 2,
          }}
        >
          {/* Header */}
          <div
            style={{
              textAlign: "center",
              marginBottom: "15px",
              borderBottom: "1px solid #e0e0e0",
              paddingBottom: "8px",
            }}
          >
            <h4
              style={{
                margin: "0",
                fontSize: "14px",
                fontWeight: "700",
                color: "#d32f2f",
                letterSpacing: "1px",
                textTransform: "uppercase",
              }}
            >
              Donation Summary Slip
            </h4>
            <div
              style={{
                fontSize: "12px",
                color: "#666",
                marginTop: "2px",
                fontStyle: "italic",
              }}
            >
              Keep this slip for your records
            </div>
          </div>

          {/* Main content area */}
          <div
            style={{
              display: "flex",
              gap: "20px",
              alignItems: "flex-start",
            }}
          >
            {/* Left side - Donor Information */}
            <div
              style={{
                flex: "1",
                backgroundColor: "#f8f9ff",
                padding: "12px",
                borderRadius: "6px",
                border: "1px solid #e8e8ff",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "#4a4a9a",
                  marginBottom: "8px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Donor Details
              </div>
              <table
                style={{
                  width: "100%",
                  fontSize: "12px",
                  borderCollapse: "collapse",
                }}
              >
                <tbody>
                  <tr>
                    <td
                      style={{
                        padding: "3px 0",
                        fontWeight: "600",
                        color: "#555",
                        width: "70px",
                        verticalAlign: "top",
                      }}
                    >
                      Receipt No:
                    </td>
                    <td
                      style={{
                        padding: "3px 0 0 8px",
                        fontWeight: "700",
                        color: "#d32f2f",
                      }}
                    >
                      {donationData.receiptId}
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        padding: "3px 0",
                        fontWeight: "600",
                        color: "#555",
                        verticalAlign: "top",
                      }}
                    >
                      Name:
                    </td>
                    <td style={{ padding: "3px 0 0 8px", color: "#333" }}>
                      {guestData.fullname}
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        padding: "3px 0",
                        fontWeight: "600",
                        color: "#555",
                        verticalAlign: "top",
                      }}
                    >
                      Location:
                    </td>
                    <td style={{ padding: "3px 0 0 8px", color: "#333" }}>
                      {guestData.address.city}, {guestData.address.state}
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        padding: "3px 0",
                        fontWeight: "600",
                        color: "#555",
                        verticalAlign: "top",
                      }}
                    >
                      Mobile:
                    </td>
                    <td style={{ padding: "3px 0 0 8px", color: "#333" }}>
                      {guestData.contact.mobileno.number}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Right side - Summary Totals */}
            <div
              style={{
                flex: "0 0 180px",
                backgroundColor: "#f0f8f0",
                padding: "5px",
                borderRadius: "6px",
                border: "2px solid #d4edda",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "#155724",
                  marginBottom: "10px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  textAlign: "center",
                }}
              >
                Summary Totals
              </div>

              <div style={{ marginBottom: "5px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0px 8px 6px 8px",
                    backgroundColor: "white",
                    borderRadius: "4px",
                    marginBottom: "2px",
                    border: "1px solid #e8f5e8",
                  }}
                >
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#555",
                    }}
                  >
                    Weights:
                  </span>
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: "700",
                      color: "#155724",
                      backgroundColor: "#d4edda",
                      marginTop: "6px",
                      padding: "0px 8px 6px 8px",
                      borderRadius: "3px",
                    }}
                  >
                    {totalWeight?.toLocaleString("en-IN")}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0px 8px 6px 8px",
                    backgroundColor: "white",
                    borderRadius: "4px",
                    marginBottom: "2px",
                    border: "1px solid #e8f5e8",
                  }}
                >
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#555",
                    }}
                  >
                    Packets:
                  </span>
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: "700",
                      color: "#155724",
                      backgroundColor: "#d4edda",
                      marginTop: "6px",
                      padding: "0px 8px 6px 8px",
                      borderRadius: "3px",
                    }}
                  >
                    {totalPackets?.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Total Amount - Highlighted */}
              <div
                style={{
                  backgroundColor: "#d32f2f",
                  color: "white",
                  padding: "2px 8px",
                  borderRadius: "6px",
                  textAlign: "center",
                  border: "2px solid #b71c1c",
                  boxShadow: "0 2px 4px rgba(211,47,47,0.3)",
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: "600",
                    marginBottom: "2px",
                    opacity: 0.9,
                  }}
                >
                  TOTAL AMOUNT:{" "}
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      letterSpacing: "0.5px",
                    }}
                  >
                    ₹{finalTotalAmount.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              marginTop: "12px",
              paddingTop: "8px",
              borderTop: "1px solid #e0e0e0",
              textAlign: "center",
              fontSize: "8px",
              color: "#888",
              fontStyle: "italic",
            }}
          >
            Generated by {adminName} on {new Date().toLocaleDateString("en-IN")}{" "}
            • Thank you for your donation
          </div>
        </div>
      </div>
      {/* --- TEAR-OFF SLIP END --- */}
    </>
  );
};

// =================================================================
// PREVIOUS DONATIONS COMPONENT
// =================================================================
const PreviousDonations = ({ donations, isLoading }) => {
  if (isLoading) {
    return (
      <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-md text-center text-gray-600">
        Loading previous donations...
      </div>
    );
  }

  if (donations.length === 0) {
    return (
      <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-md text-gray-600">
        No previous donations found for this guest.
      </div>
    );
  }

  return (
    <div className="mt-6 p-4 bg-gray-100 border border-gray-200 rounded-lg">
      <h3 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <Clock size={18} className="text-gray-500" />
        Previous Donations
      </h3>
      <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
        {donations.map((donation) => (
          <div
            key={donation._id}
            className="bg-white p-3 rounded-lg shadow-sm border"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-bold text-blue-600">
                Date: {new Date(donation.createdAt).toLocaleDateString("en-GB")}
              </span>
              <span className="text-sm font-bold text-gray-800">
                Total: ₹{donation.amount.toLocaleString("en-IN")}
              </span>
            </div>
            <hr />
            <table className="w-full text-xs mt-2">
              <thead>
                <tr className="text-left text-gray-500">
                  <th className="py-1 font-medium">Category</th>
                  <th className="py-1 font-medium text-center">Qty</th>
                  <th className="py-1 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {donation.list.map((item, index) => (
                  <tr key={index}>
                    <td className="py-1">{item.category}</td>
                    <td className="py-1 text-center">{item.number}</td>
                    <td className="py-1 text-right">
                      ₹{item.amount.toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
};

// =================================================================
// MAIN COMPONENT
// =================================================================
const GuestReceipt = () => {
  const { backendUrl, aToken, guestUserList, adminName, capitalizeEachWord } =
    useContext(AdminContext);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [receiptTotals, setReceiptTotals] = useState(null);
  const [donationType, setDonationType] = useState("individual");
  const [groupDonations, setGroupDonations] = useState([]);
  const [totalGroupAmount, setTotalGroupAmount] = useState(0);
  const [isPayingGroup, setIsPayingGroup] = useState(false);
  const [groupPaymentMethod, setGroupPaymentMethod] = useState("Cash");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [previousDonations, setPreviousDonations] = useState([]);
  const [isFetchingPreviousDonations, setIsFetchingPreviousDonations] =
    useState(false);
  const [showNewDonorForm, setShowNewDonorForm] = useState(true);
  const [donorInfo, setDonorInfo] = useState({
    fullname: "",
    father: "",
    mobile: "",
    address: {
      street: "",
      city: "Gaya",
      state: "Bihar",
      pin: "823003",
      country: "India",
    },
  });
  const [allCategories, setAllCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedCategoryDetails, setSelectedCategoryDetails] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [dynamicAmount, setDynamicAmount] = useState(""); // State for dynamic amount input
  const [donations, setDonations] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [remarks, setRemarks] = useState("");

  const searchRef = useRef(null);
  const courierCharge = 0;

  useEffect(() => {
    const fetchCategories = async () => {
      if (!aToken) return;
      try {
        const response = await axios.get(`${backendUrl}/api/admin/categories`, {
          headers: { aToken },
        });
        if (response.data.success) {
          setAllCategories(
            response.data.categories.filter((cat) => cat.isActive) || []
          );
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Failed to load donation categories.");
      }
    };
    fetchCategories();
  }, [aToken, backendUrl]);

  useEffect(() => {
    if (donationType === "group") {
      setPaymentMethod("Cash"); // Individual form method is irrelevant
    }
  }, [donationType]);

  useEffect(() => {
    if (!guestUserList || searchQuery.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    const lowercasedQuery = searchQuery.toLowerCase();
    const filtered = (guestUserList || []).filter(
      (donor) =>
        donor.fullname?.toLowerCase().includes(lowercasedQuery) ||
        donor.contact?.mobileno?.number.includes(lowercasedQuery) ||
        donor.father?.toLowerCase().includes(lowercasedQuery)
    );
    setSearchResults(filtered);
    setShowDropdown(filtered.length > 0);
  }, [searchQuery, guestUserList]);

  // ** UPDATED useEffect to handle dynamic categories **
  useEffect(() => {
    if (selectedCategoryId) {
      const details = allCategories.find((c) => c._id === selectedCategoryId);
      setSelectedCategoryDetails(details);
      if (details?.dynamic?.isDynamic) {
        setDynamicAmount(details.rate.toString()); // Pre-fill with base rate
        setQuantity(1); // Lock quantity for dynamic items
      } else {
        setDynamicAmount(""); // Clear dynamic amount for standard items
        setQuantity(1); // Reset quantity for standard items
      }
    } else {
      setSelectedCategoryDetails(null);
      setQuantity(1);
      setDynamicAmount("");
    }
  }, [selectedCategoryId, allCategories]);

  const availableCategories = useMemo(() => {
    const donatedCategoryNames = donations.map((d) => d.category);
    return allCategories.filter(
      (cat) => !donatedCategoryNames.includes(cat.categoryName)
    );
  }, [allCategories, donations]);

  const { totalAmount, totalWeight, totalPackets } = useMemo(() => {
    const result = donations.reduce(
      (acc, d) => {
        acc.amount += d.amount;
        acc.weight += d.quantity; // 'quantity' in donation list is weight
        acc.packets += d.isPacket ? d.number : 0; // 'number' is the item count
        return acc;
      },
      { amount: 0, weight: 0, packets: 0 }
    );
    return {
      totalAmount: result.amount,
      totalWeight: result.weight,
      totalPackets: result.packets,
    };
  }, [donations]);

  const calculatedAmountForStandard =
    selectedCategoryDetails && !selectedCategoryDetails.dynamic?.isDynamic
      ? selectedCategoryDetails.rate * (Number(quantity) || 0)
      : 0;

  const handleMobileChange = (e) => {
    const value = e.target.value.replace(/\D/g, ""); // Remove non-digits
    if (value.length <= 10) {
      setDonorInfo({ ...donorInfo, mobile: value });
    }
  };

  const handleSelectDonor = async (donor) => {
    setSelectedDonor(donor);
    setSearchQuery("");
    setShowDropdown(false);
    setShowNewDonorForm(false);
    setPreviousDonations([]);

    if (!donor?._id) return;

    setIsFetchingPreviousDonations(true);
    try {
      const response = await axios.get(
        `${backendUrl}/api/additional/guest-donations/${donor._id}`,
        { headers: { aToken } }
      );
      if (response.data.success) {
        setPreviousDonations(response.data.donations);
      } else {
        toast.error(response.data.message || "Could not fetch history.");
      }
    } catch (error) {
      console.error("Error fetching previous donations:", error);
      toast.error("Failed to load donation history.");
    } finally {
      setIsFetchingPreviousDonations(false);
    }
  };

  // ** UPDATED handleAddDonation function **
  const handleAddDonation = () => {
    if (!selectedCategoryId) {
      toast.warn("Please select a category.");
      return;
    }

    const isDynamic = selectedCategoryDetails.dynamic?.isDynamic;
    let newDonation;

    if (isDynamic) {
      const amount = Number(dynamicAmount) || 0;
      if (amount <= 0) {
        toast.warn("Please enter a valid amount for the dynamic donation.");
        return;
      }
      let weight = 0;
      if (amount < selectedCategoryDetails.rate) {
        weight = selectedCategoryDetails.dynamic.minvalue;
      } else {
        weight =
          Math.floor(amount / selectedCategoryDetails.rate) *
          selectedCategoryDetails.weight;
      }
      newDonation = {
        id: Date.now(),
        category: selectedCategoryDetails.categoryName,
        number: 1, // Quantity is always 1 for dynamic items
        amount: amount,
        isPacket: false, // Dynamic items are weight-based
        quantity: weight, // 'quantity' field holds the calculated weight
      };
    } else {
      // Standard donation logic
      if (!quantity || parseInt(quantity, 10) < 1) {
        toast.warn("Please enter a valid quantity.");
        return;
      }
      const calculatedAmount =
        selectedCategoryDetails.rate * parseInt(quantity, 10);
      newDonation = {
        id: Date.now(),
        category: selectedCategoryDetails.categoryName,
        number: parseInt(quantity, 10),
        amount: calculatedAmount,
        isPacket: selectedCategoryDetails.packet,
        quantity: selectedCategoryDetails.weight * parseInt(quantity, 10),
      };
    }

    setDonations([...donations, newDonation]);
    // Reset form fields after adding
    setSelectedCategoryId("");
    setSelectedCategoryDetails(null);
    setQuantity(1);
    setDynamicAmount("");
  };

  const removeDonation = (id) => {
    setDonations(donations.filter((d) => d.id !== id));
  };

  const resetForm = () => {
    setSearchQuery("");
    setSearchResults([]);
    setSelectedDonor(null);
    setShowNewDonorForm(true);
    setDonorInfo({
      fullname: "",
      father: "",
      mobile: "",
      address: {
        street: "",
        city: "Gaya",
        state: "Bihar",
        pin: "823003",
        country: "India",
      },
    });
    setDonations([]);
    setPaymentMethod("Cash");
    setRemarks("");
    setSelectedCategoryId("");
    setQuantity(1);
    setDynamicAmount("");
    setPreviousDonations([]);
  };

  const validateForm = () => {
    const isNewDonor = !selectedDonor;
    if (
      isNewDonor &&
      (!donorInfo.fullname || !donorInfo.father || !donorInfo.mobile)
    ) {
      toast.error(
        "Please fill in the new donor's Fullname, Father's name, and Mobile."
      );
      return false;
    }
    if (isNewDonor && donorInfo.mobile.length !== 10) {
      toast.error("Mobile number must be exactly 10 digits.");
      return false;
    }
    if (donations.length === 0) {
      toast.error("Please add at least one donation item.");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    const payload = {
      list: donations.map(({ id, ...rest }) => rest),
      method: paymentMethod,
      remarks,
      donorInfo: selectedDonor
        ? {
            fullname: selectedDonor.fullname,
            father: selectedDonor.father,
            mobile: selectedDonor.contact.mobileno.number,
            guestId: selectedDonor._id,
          }
        : donorInfo,
    };

    try {
      const response = await axios.post(
        `${backendUrl}/api/additional/record-guest-donation`,
        payload,
        { headers: { aToken } }
      );

      if (response.data.success) {
        setReceiptData(response.data.data);
        setReceiptTotals({ totalWeight, totalPackets });
        setShowReceiptModal(true);
        toast.success(`${payload.method} donation recorded successfully!`);
      } else {
        toast.error(
          response.data.message || "An unknown server error occurred."
        );
      }
    } catch (error) {
      console.error("Error creating guest donation:", error);
      toast.error(
        error.response?.data?.message || "Failed to submit donation."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddToGroup = () => {
    if (!validateForm()) return;

    const newGroupEntry = {
      localId: Date.now(),
      donorDisplay: selectedDonor
        ? `${selectedDonor.fullname}`
        : `${donorInfo.fullname} (New)`,
      totalAmount: totalAmount,
      totalWeight: totalWeight,
      totalPackets: totalPackets,
      payload: {
        list: donations.map(({ id, ...rest }) => rest),
        remarks,
        donorInfo: selectedDonor
          ? {
              fullname: selectedDonor.fullname,
              father: selectedDonor.father,
              mobile: selectedDonor.contact.mobileno.number,
              guestId: selectedDonor._id,
            }
          : donorInfo,
      },
    };
    setGroupDonations((prev) => [...prev, newGroupEntry]);
    setTotalGroupAmount((prev) => prev + totalAmount);
    toast.success(`${newGroupEntry.donorDisplay}'s receipt added to group.`);
    resetForm();
  };

  const handleDeleteFromGroup = (localId) => {
    const receiptToRemove = groupDonations.find((g) => g.localId === localId);
    if (receiptToRemove) {
      setTotalGroupAmount((prev) => prev - receiptToRemove.totalAmount);
      setGroupDonations((prev) => prev.filter((g) => g.localId !== localId));
    }
  };

  const handlePayGroup = async () => {
    if (groupDonations.length === 0) {
      toast.warn("No receipts in the group to process.");
      return;
    }
    if (
      !window.confirm(
        `This will process ${groupDonations.length} donations via ${groupPaymentMethod}. Continue?`
      )
    ) {
      return;
    }
    setIsPayingGroup(true);
    const successfulReceipts = [];
    const successfulReceiptTotals = [];
    const failedReceipts = [];

    for (const receipt of groupDonations) {
      const payloadWithMethod = {
        ...receipt.payload,
        method: groupPaymentMethod,
      };
      try {
        const response = await axios.post(
          `${backendUrl}/api/additional/record-guest-donation`,
          payloadWithMethod,
          { headers: { aToken } }
        );
        if (response.data.success) {
          successfulReceipts.push(response.data.data);
          successfulReceiptTotals.push({
            receiptId: response.data.data.donationData.receiptId,
            totalWeight: receipt.totalWeight,
            totalPackets: receipt.totalPackets,
          });
        } else {
          failedReceipts.push({
            name: receipt.donorDisplay,
            reason: response.data.message,
          });
        }
      } catch (error) {
        failedReceipts.push({
          name: receipt.donorDisplay,
          reason: error.response?.data?.message || error.message,
        });
      }
    }

    toast.success(
      `Batch complete! Successful: ${successfulReceipts.length}, Failed: ${failedReceipts.length}`
    );
    if (failedReceipts.length > 0) {
      const errorDetails = failedReceipts
        .map((f) => `${f.name}: ${f.reason}`)
        .join("\n");
      toast.error(`Failures:\n${errorDetails}`, { autoClose: 10000 });
    }
    if (successfulReceipts.length > 0) {
      setReceiptData(successfulReceipts);
      setReceiptTotals(successfulReceiptTotals);
      setShowReceiptModal(true);
    }
    setGroupDonations([]);
    setTotalGroupAmount(0);
    setIsPayingGroup(false);
  };

  const handleEndGroup = () => {
    if (
      groupDonations.length > 0 &&
      !window.confirm("Clear the current group without payment?")
    ) {
      return;
    }
    setGroupDonations([]);
    setTotalGroupAmount(0);
    resetForm();
  };

  const handleCloseModal = () => {
    setShowReceiptModal(false);
    setReceiptData(null);
    setReceiptTotals(null);
    resetForm();
  };

  return (
    <>
      {showReceiptModal && receiptData && (
        <ReceiptModal
          data={receiptData}
          isGroup={Array.isArray(receiptData)}
          onClose={handleCloseModal}
          courierCharge={courierCharge}
          adminName={adminName}
          totals={receiptTotals}
        />
      )}
      <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Guest Donation Receipt
          </h1>
          <div className="flex items-center bg-gray-200 rounded-full p-1 self-start md:self-center">
            <button
              onClick={() => setDonationType("individual")}
              className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${
                donationType === "individual"
                  ? "bg-white text-indigo-600 shadow-md"
                  : "text-gray-600 hover:bg-gray-300"
              }`}
            >
              Individual
            </button>
            <button
              onClick={() => setDonationType("group")}
              className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${
                donationType === "group"
                  ? "bg-white text-blue-600 shadow-md"
                  : "text-gray-600 hover:bg-gray-300"
              }`}
            >
              Group
            </button>
          </div>
        </div>

        {donationType === "group" && (
          <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-6 mb-6 max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
              <h2 className="text-2xl font-bold text-blue-800">
                Group Summary
              </h2>
              <div className="flex items-center gap-2 flex-wrap">
                <select
                  className="px-3 py-2 border rounded-lg bg-white text-sm"
                  value={groupPaymentMethod}
                  onChange={(e) => setGroupPaymentMethod(e.target.value)}
                  disabled={isPayingGroup}
                >
                  <option value="Cash">Pay via Cash</option>
                  <option value="QR Code">Pay via QR Code</option>
                </select>
                <button
                  onClick={handlePayGroup}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 text-sm disabled:bg-green-400"
                  disabled={isPayingGroup || groupDonations.length === 0}
                >
                  {isPayingGroup
                    ? "Processing..."
                    : `Pay All (${groupDonations.length})`}
                </button>
                <button
                  onClick={handleEndGroup}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 text-sm"
                  disabled={isPayingGroup}
                >
                  {" "}
                  End & Reset{" "}
                </button>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow max-h-60 overflow-y-auto">
              <div className="flex justify-between items-center border-b pb-2 mb-2">
                <span className="text-lg font-semibold text-gray-700">
                  Total Group Amount:
                </span>
                <span className="text-2xl font-bold text-blue-600">
                  ₹{totalGroupAmount.toLocaleString("en-IN")}
                </span>
              </div>
              {groupDonations.length > 0 ? (
                <ul className="space-y-2 mt-2">
                  {groupDonations.map((item, index) => (
                    <li
                      key={item.localId}
                      className="flex justify-between items-center p-2 bg-gray-50 rounded group"
                    >
                      <span className="text-sm text-gray-800">
                        {index + 1}. {item.donorDisplay} -{" "}
                        <b>₹{item.totalAmount.toLocaleString("en-IN")}</b>
                      </span>
                      <button
                        onClick={() => handleDeleteFromGroup(item.localId)}
                        className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-gray-500 text-sm py-4">
                  Add receipts to the group using the form below.
                </p>
              )}
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-4 md:p-6 max-w-6xl mx-auto space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-gray-700 mb-3">
              1. Find or Add Guest Donor
            </h2>
            <div className="relative" ref={searchRef}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search existing guests by name, father, or mobile..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              {showDropdown && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                  {searchResults.map((donor) => (
                    <div
                      key={donor._id}
                      className="p-3 hover:bg-indigo-50 cursor-pointer border-b"
                      onClick={() => handleSelectDonor(donor)}
                    >
                      <p className="font-medium text-gray-800">
                        {donor.fullname}
                      </p>
                      <div className="text-sm text-gray-500">
                        <span>
                          S/O: {donor.father} | Mobile:{" "}
                          {donor.contact?.mobileno?.number || "N/A"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {selectedDonor && (
              <div className="mt-4 bg-indigo-50 border border-indigo-200 p-3 rounded-lg flex justify-between items-center">
                <div>
                  <p className="font-semibold text-indigo-800">
                    Selected: {selectedDonor.fullname}
                  </p>
                  <p className="text-sm text-gray-600">
                    ID: <span className="font-medium">{selectedDonor.id}</span>
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedDonor(null);
                    setShowNewDonorForm(true);
                    setSearchQuery("");
                  }}
                  className="text-gray-500 hover:text-red-600"
                >
                  <X size={18} />
                </button>
              </div>
            )}

            {selectedDonor && (
              <PreviousDonations
                donations={previousDonations}
                isLoading={isFetchingPreviousDonations}
              />
            )}

            {showNewDonorForm && !selectedDonor && (
              <div className="mt-4 border-t-2 border-dashed border-gray-200 pt-4 space-y-4">
                <h3 className="text-lg font-medium text-gray-600">
                  Enter New Donor Details:
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Full Name *"
                    value={donorInfo.fullname}
                    onChange={(e) =>
                      setDonorInfo({
                        ...donorInfo,
                        fullname: capitalizeEachWord(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Father's Name *"
                    value={donorInfo.father}
                    onChange={(e) =>
                      setDonorInfo({
                        ...donorInfo,
                        father: capitalizeEachWord(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                  <input
                    type="tel"
                    placeholder="Mobile Number (10 digits) *"
                    value={donorInfo.mobile}
                    onChange={handleMobileChange}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Street Address"
                    value={donorInfo.address.street}
                    onChange={(e) =>
                      setDonorInfo({
                        ...donorInfo,
                        address: {
                          ...donorInfo.address,
                          street: capitalizeEachWord(e.target.value),
                        },
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="City"
                    value={donorInfo.address.city}
                    onChange={(e) =>
                      setDonorInfo({
                        ...donorInfo,
                        address: {
                          ...donorInfo.address,
                          city: capitalizeEachWord(e.target.value),
                        },
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={donorInfo.address.state}
                    onChange={(e) =>
                      setDonorInfo({
                        ...donorInfo,
                        address: {
                          ...donorInfo.address,
                          state: capitalizeEachWord(e.target.value),
                        },
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="PIN Code"
                    value={donorInfo.address.pin}
                    onChange={(e) =>
                      setDonorInfo({
                        ...donorInfo,
                        address: { ...donorInfo.address, pin: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    maxLength="6"
                  />
                </div>
              </div>
            )}
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-700 mb-3">
              2. Add Donation Items
            </h2>
            {/* ** UPDATED JSX for Donation Form ** */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end bg-gray-50 p-4 rounded-lg">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                >
                  <option value="">Select Category</option>
                  {availableCategories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.categoryName}
                    </option>
                  ))}
                </select>
              </div>

              {selectedCategoryDetails?.dynamic?.isDynamic ? (
                // DYNAMIC CATEGORY VIEW
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="Enter custom amount"
                    className="w-full px-3 py-2 border rounded-lg"
                    value={dynamicAmount}
                    onChange={(e) => setDynamicAmount(e.target.value)}
                    disabled={!selectedCategoryDetails}
                  />
                </div>
              ) : (
                // STANDARD CATEGORY VIEW
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity
                    </label>
                    <input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      className="w-full px-3 py-2 border rounded-lg"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      disabled={
                        !selectedCategoryDetails ||
                        selectedCategoryDetails.packet
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount (₹)
                    </label>
                    <input
                      type="text"
                      placeholder="Amount"
                      className="w-full px-3 py-2 border rounded-lg bg-gray-200"
                      value={calculatedAmountForStandard.toLocaleString(
                        "en-IN"
                      )}
                      disabled
                    />
                  </div>
                </>
              )}

              <button
                onClick={handleAddDonation}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-indigo-300 flex items-center justify-center gap-2 h-10"
              >
                <Plus size={18} /> Add
              </button>
            </div>

            {selectedCategoryDetails && (
              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 text-sm text-yellow-800 rounded-lg">
                <div className="pl-1 pb-1">
                  <b>Details: </b>
                </div>
                <hr />
                <div className="flex justify-between p-1">
                  <p>Category: {selectedCategoryDetails.categoryName} </p>
                  <p>Rate: ₹{selectedCategoryDetails.rate} </p>
                  <p>Weight: {selectedCategoryDetails.weight}g </p>
                  <p>Packet: {selectedCategoryDetails.packet ? "Yes" : "No"}</p>
                </div>
              </div>
            )}
            {donations.length > 0 && (
              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="p-3 text-left font-semibold text-slate-700">
                        Category
                      </th>
                      <th className="p-3 text-left font-semibold text-slate-700">
                        Quantity
                      </th>
                      <th className="p-3 text-left font-semibold text-slate-700">
                        Amount
                      </th>
                      <th className="p-3 text-left font-semibold text-slate-700">
                        Weight (g)
                      </th>
                      <th className="p-3 text-left font-semibold text-slate-700">
                        Packet
                      </th>
                      <th className="p-3 text-left font-semibold text-slate-700">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {donations.map((d) => (
                      <tr key={d.id} className="border-b border-slate-200">
                        <td className="p-3 text-slate-800 font-medium">
                          {d.category}
                        </td>
                        <td className="p-3 text-slate-700">{d.number}</td>
                        <td className="p-3 text-slate-700">
                          ₹{d.amount.toLocaleString("en-IN")}
                        </td>
                        <td className="p-3 text-slate-700">{d.quantity}</td>
                        <td className="p-3 text-slate-700">
                          {d.isPacket ? "Yes" : "No"}
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => removeDonation(d.id)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <XCircle size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-700 mb-3">
              3. Payment & Finalize
            </h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h4 className="font-semibold text-purple-800 mb-2">
                    Mahaprasad Summary
                  </h4>
                  <p className="text-sm flex justify-between pr-1">
                    Total Weight (g):{" "}
                    <span className="font-bold">
                      {totalWeight.toLocaleString("en-IN")}
                    </span>
                  </p>
                  <p className="text-sm flex justify-between pr-1">
                    Total Packets:{" "}
                    <span className="font-bold">
                      {totalPackets.toLocaleString("en-IN")}
                    </span>
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-2">
                    Donation Summary
                  </h4>
                  <p className="text-sm flex justify-between">
                    Sub-Total:{" "}
                    <span>₹{totalAmount.toLocaleString("en-IN")}</span>
                  </p>
                  <p className="text-sm flex justify-between">
                    Courier:{" "}
                    <span>₹{courierCharge.toLocaleString("en-IN")}</span>
                  </p>
                  <hr className="my-1 border-green-200" />
                  <p className="font-bold flex justify-between">
                    Grand Total:{" "}
                    <span>
                      ₹{(totalAmount + courierCharge).toLocaleString("en-IN")}
                    </span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Method
                  </label>
                  <select
                    className="w-full px-3 py-2 border rounded-lg bg-white"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    disabled={donationType === "group"}
                  >
                    <option value="Cash">Cash</option>
                    <option value="QR Code">QR Code</option>
                  </select>
                  {donationType === "group" && (
                    <p className="text-xs text-gray-500 mt-1">
                      Payment method for the group is selected in the summary
                      section above.
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Remarks (Optional)
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border rounded-lg"
                    rows="2"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Any notes..."
                  ></textarea>
                </div>
              </div>
            </div>
          </section>

          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              onClick={resetForm}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 disabled:bg-gray-100"
              disabled={isSubmitting}
            >
              Clear Form
            </button>
            {donationType === "individual" ? (
              <button
                onClick={handleSubmit}
                className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 disabled:bg-green-300 w-52 flex items-center justify-center gap-2"
                disabled={isSubmitting || donations.length === 0}
              >
                {isSubmitting ? (
                  "Submitting..."
                ) : (
                  <>
                    <Printer size={18} /> Generate Receipt
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleAddToGroup}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-300 w-52 flex items-center justify-center gap-2"
                disabled={isPayingGroup || donations.length === 0}
              >
                <Users size={18} /> Add to Group
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default GuestReceipt;
