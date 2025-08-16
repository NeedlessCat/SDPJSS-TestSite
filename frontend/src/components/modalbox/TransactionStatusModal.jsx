import React from "react";
import { CheckCircle, XCircle, Download, Scissors } from "lucide-react";

// Helper function to convert numbers to words (simplified version)
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
  const teens = [
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

  if (num === 0) return "Zero Rupees Only";

  let words = "";

  // Handle thousands
  if (Math.floor(num / 1000) > 0) {
    words += toWords(Math.floor(num / 1000)) + " Thousand ";
    num %= 1000;
  }

  // Handle hundreds
  if (Math.floor(num / 100) > 0) {
    words += ones[Math.floor(num / 100)] + " Hundred ";
    num %= 100;
  }

  // Handle tens and ones
  if (num >= 20) {
    words += tens[Math.floor(num / 10)] + " ";
    words += ones[num % 10] + " ";
  } else if (num >= 10) {
    words += teens[num - 10] + " ";
  } else if (num > 0) {
    words += ones[num] + " ";
  }

  return words.trim() + " Rupees Only";
};

// Receipt Template Component
const ReceiptTemplate = ({ receiptData }) => {
  const { donation, user, childUser } = receiptData;

  // Use childUser if available, otherwise use user
  const donorName = childUser ? childUser.fullname : user.fullname;
  const fatherName = childUser ? user.fullname : user.fatherName;

  const finalTotalAmount = donation.amount;
  const totalWeight = donation.list.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
  const totalPackets = donation.list.filter((item) => item.isPacket).length;

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
        {`@media print { 
          body { -webkit-print-color-adjust: exact; }  
          .bill-container { box-shadow: none !important; border: none !important;} 
        }`}
      </style>

      {/* Main Watermark */}
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
      />

      {/* Main Receipt Container */}
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
          backgroundColor: "white",
        }}
      >
        {/* Header */}
        <div
          className="header"
          style={{
            textAlign: "center",
            borderBottom: "2px solid #d32f2f",
            paddingBottom: "10px",
            marginBottom: "10px",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
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

        {/* Receipt Title */}
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

        {/* Receipt Details */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "10px",
            fontSize: "12px",
          }}
        >
          <div>
            <strong>Receipt No:</strong> {donation.receiptId}
          </div>
          <div>
            <strong>Date:</strong>{" "}
            {new Date(donation.createdAt).toLocaleDateString("en-IN", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>

        {/* Donor Details */}
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
            <strong>Name:</strong> {donorName}
          </p>
          <p style={{ fontSize: "12px", margin: "4px 0" }}>
            <strong>Father's Name:</strong> {fatherName}
          </p>
          <p style={{ fontSize: "12px", margin: "4px 0" }}>
            <strong>Mobile:</strong> {user.contact?.mobileno?.code}{" "}
            {user.contact?.mobileno?.number}
          </p>
          <p style={{ fontSize: "12px", margin: "4px 0" }}>
            <strong>Address:</strong>{" "}
            {donation.postalAddress === "Will collect from Durga Sthan" ||
            donation.postalAddress === "" ? (
              <>
                {user.address?.room ? `Room-${user.address.room}, ` : ""}
                {user.address?.floor ? `Floor-${user.address.floor}, ` : ""}
                {user.address?.apartment ? `${user.address.apartment}, ` : ""}
                {user.address?.landmark ? `${user.address.landmark}, ` : ""}
                {user.address?.street ? `${user.address.street}, ` : ""}
                {user.address?.postoffice
                  ? `PO: ${user.address.postoffice}, `
                  : ""}
                {user.address?.city ? `${user.address.city}, ` : ""}
                {user.address?.district ? `${user.address.district}, ` : ""}
                {user.address?.state ? `${user.address.state}, ` : ""}
                {user.address?.country ? `${user.address.country} ` : ""}
                {user.address?.pin ? `- ${user.address.pin}` : ""}
              </>
            ) : (
              donation.postalAddress
            )}
          </p>
        </div>

        {/* Donation Items Table */}
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
            {donation.list.map((item, index) => (
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

            {/* Courier Charges Row (if applicable) */}
            {donation.courierCharge > 0 && (
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
                  ₹{donation.courierCharge.toLocaleString("en-IN")}
                </td>
                <td
                  colSpan={2}
                  style={{ ...bodyCellStyle, borderTop: "2px solid #ddd" }}
                />
              </tr>
            )}

            {/* Total Amount Row */}
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
              />
            </tr>
          </tbody>
        </table>

        {/* Amount in Words */}
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

        {/* Payment Details */}
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
              <strong>Payment Method:</strong> {donation.method}
            </p>
            <p style={{ margin: "0" }}>
              <strong>Transaction ID:</strong> {donation.transactionId || "N/A"}
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

        {/* Footer */}
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
            Generated on {new Date().toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      {/* Donation Summary Slip - Only show if courier charge is 0 */}
      {donation.courierCharge === 0 && (
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

          {/* Slip Watermark */}
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
          />

          {/* Slip Container */}
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
            {/* Slip Header */}
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

            {/* Slip Content */}
            <div
              style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}
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
                        {donation.receiptId}
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
                        {donorName}
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
                        {user.address?.city || "N/A"},{" "}
                        {user.address?.state || "N/A"}
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
                        {user.contact?.mobileno?.number || "N/A"}
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

            {/* Slip Footer */}
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
              Generated on {new Date().toLocaleDateString("en-IN")} • Thank you
              for your donation
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const TransactionStatusModal = ({
  isOpen,
  onClose,
  status,
  message,
  receiptData,
}) => {
  if (!isOpen) return null;

  const isSuccess = status === "success";

  const handleDownload = () => {
    if (receiptData) {
      // Create a new window for printing
      const printWindow = window.open("", "_blank");
      const receiptHTML = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Donation Receipt-${receiptData.donation.receiptId}</title>
            <style>
              body { 
                margin: 0; 
                padding: 20px; 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: white;
              }
              @media print {
                body { 
                  -webkit-print-color-adjust: exact; 
                  margin: 0;
                  padding: 0;
                }
              }
            </style>
          </head>
          <body>
            <div id="receipt-content"></div>
            <script>
              window.onload = function() {
                window.print();
                setTimeout(function() {
                  window.close();
                }, 100);
              };
            </script>
          </body>
        </html>
      `;

      printWindow.document.write(receiptHTML);
      printWindow.document.close();

      // Render the receipt content
      const receiptContent =
        printWindow.document.getElementById("receipt-content");
      receiptContent.innerHTML =
        document.querySelector(".receipt-template").innerHTML;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md text-center p-8 transform transition-all scale-100">
        {isSuccess ? (
          <CheckCircle className="mx-auto h-20 w-20 text-green-500" />
        ) : (
          <XCircle className="mx-auto h-20 w-20 text-red-500" />
        )}

        <h2
          className={`text-2xl font-bold mt-6 ${
            isSuccess ? "text-gray-800" : "text-red-600"
          }`}
        >
          {isSuccess ? "Donation Successful!" : "Payment Failed"}
        </h2>

        <p className="text-gray-600 mt-2">{message}</p>

        {isSuccess && receiptData && (
          <div className="bg-gray-50 border rounded-lg p-4 mt-6 text-left text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Transaction ID:</span>
              <span className="font-mono text-gray-700">
                {receiptData.donation.transactionId}
              </span>
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-gray-500">Amount Paid:</span>
              <span className="font-bold text-gray-800">
                ₹{receiptData.donation.amount.toFixed(2)}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              A detailed receipt can be downloaded below.
            </p>
          </div>
        )}

        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          {isSuccess && receiptData && (
            <button
              onClick={handleDownload}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
            >
              <Download size={18} />
              Download Receipt
            </button>
          )}
          <button
            onClick={onClose}
            className="w-full py-3 px-6 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-semibold"
          >
            Close
          </button>
        </div>
      </div>

      {/* Hidden receipt template for printing */}
      {isSuccess && receiptData && (
        <div className="receipt-template" style={{ display: "none" }}>
          <ReceiptTemplate receiptData={receiptData} />
        </div>
      )}
    </div>
  );
};

export default TransactionStatusModal;
