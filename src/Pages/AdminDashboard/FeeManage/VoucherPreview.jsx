import React from "react";
import {
  X,
  Printer,
  Download,
  FileText,
} from "lucide-react";
import "./VoucherPreview.css";

const VoucherPreview = ({
  isOpen,
  onClose,
  voucherData,
}) => {
  if (!isOpen || !voucherData) return null;

  const {
    studentId,
    semester,
    session,
    payDueDate,
    items = [],
  } = voucherData;

  // ==========================================
  // STATIC STUDENT DATA - FOR TESTING ONLY
  // ==========================================

  const students = {
    "6a79767720153a5d213edc56": {
      name: "Muhammad Mubashir Yaseen",
      studentId: "bsf2205888",
      rollNo: "BSF2205888",
      campus: "UE Multan Campus",
      program: "BS Information Technology",
      shift: "Morning",
      quota: "Open Merit",
    },

    "student-002": {
      name: "Ali Ahmed",
      studentId: "BS-CS-2021-001",
      rollNo: "BS-CS-2021-001",
      campus: "UE Multan Campus",
      program: "BS Computer Science",
      shift: "Morning",
      quota: "Open Merit",
    },

    "student-003": {
      name: "Fatima Khan",
      studentId: "BS-IT-2022-045",
      rollNo: "BS-IT-2022-045",
      campus: "UE Multan Campus",
      program: "BS Information Technology",
      shift: "Morning",
      quota: "Open Merit",
    },
  };

  const student = students[studentId] || {
    name: "Unknown Student",
    studentId: studentId || "-",
    rollNo: "-",
    campus: "UE Multan Campus",
    program: "-",
    shift: "-",
    quota: "-",
  };

  // ==========================================
  // STATIC FEE DATA - FOR TESTING ONLY
  // ==========================================

  const tuitionAmount = 25000;

  const feeTypes = {
    "6a7967cd9c680dac971ac36d": {
      name: "Admission Processing Fee",
      amount: 500,
    },

    "fee-002": {
      name: "Examination Fee",
      amount: 2500,
    },

    "fee-003": {
      name: "Registration Fee",
      amount: 1000,
    },
  };

  // ==========================================
  // PREPARE VOUCHER ITEMS
  // ==========================================

  const voucherItems = items.map((item) => {

    // Tuition Fee
    if (item.type === "tuition") {
      return {
        description: "Tuition Fee",
        amount: tuitionAmount,
      };
    }

    // Fee Type
    if (item.type === "feeType") {
      const fee = feeTypes[item.refId];

      return {
        description: fee?.name || "Fee",
        amount: fee?.amount || 0,
      };
    }

    // Custom Fee
    if (item.type === "custom") {
      return {
        description: item.name,
        amount: Number(item.amount || 0),
      };
    }

    return {
      description: "Other Fee",
      amount: Number(item.amount || 0),
    };
  });

  // ==========================================
  // TOTAL AMOUNT
  // ==========================================

  const totalAmount = voucherItems.reduce(
    (total, item) => total + item.amount,
    0
  );

  // ==========================================
  // PRINT
  // ==========================================

  const handlePrint = () => {
    window.print();
  };

  // ==========================================
  // DOWNLOAD
  // ==========================================

  const handleDownload = () => {
    window.print();
  };

  return (
    <div className="voucher-preview-overlay">

      <div className="voucher-preview-modal">

        {/* ================= HEADER ================= */}

        <div className="voucher-preview-header no-print">

          <div>
            <h3>
              <FileText size={20} />
              Voucher Preview
            </h3>

            <p>
              Review the fee voucher before printing or downloading.
            </p>
          </div>

          <button
            type="button"
            className="voucher-preview-close"
            onClick={onClose}
          >
            <X size={20} />
          </button>

        </div>

        {/* ================= ACTION BUTTONS ================= */}

        <div className="voucher-preview-actions no-print">

          <button
            type="button"
            className="voucher-print-btn"
            onClick={handlePrint}
          >
            <Printer size={17} />
            Print
          </button>

          <button
            type="button"
            className="voucher-download-btn"
            onClick={handleDownload}
          >
            <Download size={17} />
            Download
          </button>

        </div>

        {/* ================= VOUCHER PAPER ================= */}
       <div className="voucher-preview-vouchers">
  {[
    "Bank Copy",
    "Bank Copy (UE Treasurer)",
    "UE Division/Campus Copy",
    "UE Division/Campus Copy",
    "Student Copy",
  ].map((copyName, index) => (
    <div className="voucher-paper" key={`${copyName}-${index}`}>

      {/* COPY TITLE */}
      <div className="voucher-copy-title">
        {copyName}
      </div>

      {/* UNIVERSITY HEADER */}
      <div className="voucher-university-header">

        <div className="voucher-bank-name">
          The Bank of the Punjab
        </div>

        <h1>
          University of Education, Lahore
        </h1>

        <p>
          Fee Challan / Voucher
        </p>

      </div>

      {/* META */}
      <div className="voucher-meta">

        <div>
          <span>Challan #</span>
          <strong>20329601</strong>
        </div>

        <div>
          <span>Bill No.</span>
          <strong>2672002242032960</strong>
        </div>

        <div>
          <span>Date</span>
          <strong>
            {new Date().toLocaleDateString()}
          </strong>
        </div>

      </div>

      {/* STUDENT INFORMATION */}
      <div className="voucher-section">

        <div className="voucher-section-heading">
          Student Information
        </div>

        <div className="voucher-info-grid">

          <div>
            <span>Name</span>
            <strong>{student.name}</strong>
          </div>

          <div>
            <span>Student ID</span>
            <strong>{student.studentId}</strong>
          </div>

          <div>
            <span>Roll Number</span>
            <strong>{student.rollNo}</strong>
          </div>

          <div>
            <span>Campus</span>
            <strong>{student.campus}</strong>
          </div>

          <div>
            <span>Degree Program</span>
            <strong>{student.program}</strong>
          </div>

          <div>
            <span>Shift</span>
            <strong>{student.shift}</strong>
          </div>

          <div>
            <span>Quota</span>
            <strong>{student.quota}</strong>
          </div>

          <div>
            <span>Semester</span>
            <strong>
              Semester {semester}
            </strong>
          </div>

        </div>

      </div>

      {/* PAYMENT INFORMATION */}
      <div className="voucher-section">

        <div className="voucher-section-heading">
          Payment Information
        </div>

        <div className="voucher-payment-info">

          <div>
            <span>Session</span>
            <strong>{session}</strong>
          </div>

          <div>
            <span>Due Date</span>
            <strong>{payDueDate}</strong>
          </div>

        </div>

      </div>

      {/* FEE DETAILS */}
      <div className="voucher-section">

        <div className="voucher-section-heading">
          Fee Details
        </div>

        <table className="voucher-fee-table">

          <thead>
            <tr>
              <th>Sr#</th>
              <th>Description</th>
              <th>Amount (PKR)</th>
            </tr>
          </thead>

          <tbody>

            {voucherItems.length > 0 ? (

              voucherItems.map((item, itemIndex) => (
                <tr key={itemIndex}>

                  <td>
                    {itemIndex + 1}
                  </td>

                  <td>
                    {item.description}
                  </td>

                  <td>
                    {item.amount.toLocaleString()}
                  </td>

                </tr>
              ))

            ) : (

              <tr>
                <td>1</td>

                <td>
                  No fee item selected
                </td>

                <td>
                  0
                </td>
              </tr>

            )}

            {/* TOTAL */}

            <tr className="voucher-total-row">

              <td colSpan="2">
                Total Amount
              </td>

              <td>
                PKR {totalAmount.toLocaleString()}
              </td>

            </tr>

          </tbody>

        </table>

      </div>

      {/* AMOUNT */}
      <div className="voucher-amount-box">

        <span>
          Amount Payable Within Due Date
        </span>

        <strong>
          PKR {totalAmount.toLocaleString()}
        </strong>

      </div>

      {/* INSTRUCTIONS */}
      <div className="voucher-instructions">

        <h4>
          Important Instructions
        </h4>

        <ul>

          <li>
            Please pay the voucher before the due date.
          </li>

          <li>
            Keep the paid challan safely for future reference.
          </li>

          <li>
            Late payment may be subject to applicable fines.
          </li>

          <li>
            Payment verification will be completed by the university.
          </li>

        </ul>

      </div>

      {/* SIGNATURES */}
      <div className="voucher-signatures">

        <div>
          <span></span>
          <p>
            Bank Officer Signature
          </p>
        </div>

        <div>
          <span></span>
          <p>
            University Authorized Signature
          </p>
        </div>

      </div>

      {/* FOOTER */}
      <div className="voucher-footer">

        <p>
          This is a computer-generated fee voucher.
        </p>

        <strong>
          University of Education, Lahore
        </strong>

      </div>

    </div>
  ))}
</div>
      </div>

    </div>
    
  );
};

export default VoucherPreview;