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

  if (!isOpen || !voucherData) {
    return null;
  }

  // ==========================================
  // DATA
  // ==========================================

  const {
    generationType,
    batchId,
    departmentId,
    semester,
    payDueDate,
    fineDueDate,
    fineTypeId,
    includeTransport,
    apiResponse,
  } = voucherData;

  // ==========================================
  // NORMALIZE API RESPONSE
  // ==========================================

  const responseData =
    apiResponse?.data ||
    apiResponse?.voucher ||
    apiResponse?.result ||
    apiResponse;

  // ==========================================
  // VOUCHER NUMBER
  // ==========================================

  const voucherNumber =
    responseData?.voucherNumber ||
    responseData?.voucherNo ||
    responseData?.challanNo ||
    responseData?.challanNumber ||
    "-";

  // ==========================================
  // BILL NUMBER
  // ==========================================

  const billNumber =
    responseData?.billNo ||
    responseData?.billNumber ||
    "-";

  // ==========================================
  // STUDENT
  // ==========================================

  const student =
    responseData?.student ||
    responseData?.studentData ||
    {};

  // ==========================================
  // ITEMS
  // ==========================================

  const feeItems =
    responseData?.items ||
    responseData?.feeItems ||
    responseData?.fees ||
    [];

  const normalizedItems = Array.isArray(feeItems)
    ? feeItems.map((item) => ({
        description:
          item?.description ||
          item?.name ||
          item?.title ||
          item?.feeName ||
          "Fee",

        amount: Number(
          item?.amount ||
          item?.total ||
          item?.value ||
          0
        ),
      }))
    : [];

  // ==========================================
  // TOTAL
  // ==========================================

  const totalAmount =
    responseData?.totalAmount != null
      ? Number(responseData.totalAmount)
      : responseData?.total != null
      ? Number(responseData.total)
      : normalizedItems.reduce(
          (total, item) =>
            total + item.amount,
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

  // ==========================================
  // COPY NAMES
  // ==========================================

  const copies = [
    "Bank Copy",
    "Bank Copy (UE Treasurer)",
    "UE Division/Campus Copy",
    "Student Copy",
  ];

  // ==========================================
  // SINGLE VOUCHER COPY
  // ==========================================

  const VoucherCopy = ({
    copyName,
    index,
  }) => (
    <div
      className="voucher-paper"
      key={`${copyName}-${index}`}
    >

      {/* COPY NAME */}

      <div className="voucher-copy-title">
        {copyName}
      </div>

      {/* HEADER */}

      <div className="voucher-university-header">

        <div className="voucher-bank-name">
          THE BANK OF PUNJAB
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

          <strong>
            {voucherNumber}
          </strong>
        </div>

        <div>
          <span>Bill No.</span>

          <strong>
            {billNumber}
          </strong>
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

            <strong>
              {student?.name ||
                responseData?.studentName ||
                "-"}
            </strong>
          </div>

          <div>
            <span>Student ID</span>

            <strong>
              {student?.studentId ||
                responseData?.studentId ||
                "-"}
            </strong>
          </div>

          <div>
            <span>Roll Number</span>

            <strong>
              {student?.rollNo ||
                responseData?.rollNo ||
                "-"}
            </strong>
          </div>

          <div>
            <span>Campus</span>

            <strong>
              {student?.campus ||
                responseData?.campus ||
                "-"}
            </strong>
          </div>

          <div>
            <span>Degree Program</span>

            <strong>
              {student?.program ||
                responseData?.program ||
                "-"}
            </strong>
          </div>

          <div>
            <span>Shift</span>

            <strong>
              {student?.shift ||
                responseData?.shift ||
                "-"}
            </strong>
          </div>

          <div>
            <span>Semester</span>

            <strong>
              {semester
                ? `Semester ${semester}`
                : "-"}
            </strong>
          </div>

          <div>
            <span>Generation</span>

            <strong>
              {generationType === "batch"
                ? "Batch"
                : "Department"}
            </strong>
          </div>

        </div>

      </div>

      {/* PAYMENT */}

      <div className="voucher-section">

        <div className="voucher-section-heading">
          Payment Information
        </div>

        <div className="voucher-payment-info">

          <div>
            <span>Payment Due Date</span>

            <strong>
              {payDueDate || "-"}
            </strong>
          </div>

          <div>
            <span>Fine Due Date</span>

            <strong>
              {fineDueDate || "-"}
            </strong>
          </div>

          <div>
            <span>Fine Type</span>

            <strong>
              {fineTypeId || "No Fine"}
            </strong>
          </div>

          <div>
            <span>Transport</span>

            <strong>
              {includeTransport
                ? "Included"
                : "Not Included"}
            </strong>
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

            {normalizedItems.length > 0 ? (

              normalizedItems.map(
                (item, itemIndex) => (
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
                )
              )

            ) : (

              <tr>

                <td>1</td>

                <td>Fee Voucher</td>

                <td>
                  {totalAmount.toLocaleString()}
                </td>

              </tr>

            )}

            <tr className="voucher-total-row">

              <td colSpan="2">
                Total Amount
              </td>

              <td>
                PKR{" "}
                {totalAmount.toLocaleString()}
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
          PKR{" "}
          {totalAmount.toLocaleString()}
        </strong>

      </div>

      {/* INSTRUCTIONS */}

      <div className="voucher-instructions">

        <h4>
          Important Instructions
        </h4>

        <ul>

          <li>
            Please pay the voucher before
            the due date.
          </li>

          <li>
            Keep the paid challan safely
            for future reference.
          </li>

          <li>
            Late payment may be subject
            to applicable fines.
          </li>

          <li>
            Payment verification will be
            completed by the university.
          </li>

        </ul>

      </div>

      {/* SIGNATURES */}

      <div className="voucher-signatures">

        <div>
          <span></span>
          <p>Bank Officer Signature</p>
        </div>

        <div>
          <span></span>
          <p>University Authorized Signature</p>
        </div>

      </div>

      {/* FOOTER */}

      <div className="voucher-footer">

        <p>
          This is a computer-generated
          fee voucher.
        </p>

        <strong>
          University of Education, Lahore
        </strong>

      </div>

    </div>
  );

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="voucher-preview-overlay">

      <div className="voucher-preview-modal">

        {/* HEADER */}

        <div className="voucher-preview-header no-print">

          <div>

            <h3>
              <FileText size={20} />
              Voucher Preview
            </h3>

            <p>
              Four voucher copies are ready
              for printing.
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

        {/* ACTIONS */}

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

        {/* FOUR COPIES */}

        <div className="voucher-preview-vouchers">

          {copies.map((copyName, index) => (
            <VoucherCopy
              key={`${copyName}-${index}`}
              copyName={copyName}
              index={index}
            />
          ))}

        </div>

      </div>

    </div>
  );
};

export default VoucherPreview;