import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { X, Printer, ArrowLeft } from "lucide-react";
import FeeAPI from "../../../services/feeService";
import "./VoucherPreview.css";

/* =========================================================
   HELPERS
========================================================= */

const fmtMoney = (val) => `PKR ${Number(val || 0).toLocaleString()}`;

const fmtDate = (val) => {
  if (!val) return "-";

  if (typeof val === "string" && /^\d{4}-\d{2}-\d{2}$/.test(val)) {
    const [y, m, d] = val.split("-");
    return `${d}-${m}-${y}`;
  }

  try {
    const date = new Date(val);
    if (Number.isNaN(date.getTime())) return String(val);
    return date
      .toLocaleDateString("en-GB")
      .replace(/\//g, "-");
  } catch {
    return String(val);
  }
};

const buildName = (student) => {
  if (!student) return "-";
  const p = student.personalInfo || student;
  const f = p.firstName || "";
  const l = p.lastName || "";
  return (
    student.name ||
    student.fullName ||
    `${f} ${l}`.trim() ||
    student.email ||
    "-"
  );
};

const amountInWords = (value) => {
  const n = Math.floor(Number(value || 0));
  if (!n) return "Zero Only";

  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
  const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  const two = (x) =>
    x < 10 ? ones[x] : x < 20 ? teens[x - 10] : `${tens[Math.floor(x / 10)]}${x % 10 ? `-${ones[x % 10]}` : ""}`;

  const three = (x) =>
    x < 100 ? two(x) : `${ones[Math.floor(x / 100)]} Hundred${x % 100 ? ` ${two(x % 100)}` : ""}`;

  const conv = (x) => {
    if (x < 1000) return three(x);
    if (x < 100000) return `${two(Math.floor(x / 1000))} Thousand${x % 1000 ? ` ${three(x % 1000)}` : ""}`;
    if (x < 10000000)
      return `${three(Math.floor(x / 100000))} Lakh${x % 100000 ? ` ${conv(x % 100000)}` : ""}`;
    return `${two(Math.floor(x / 10000000))} Crore${x % 10000000 ? ` ${conv(x % 10000000)}` : ""}`;
  };

  return `${conv(n)} Only`;
};

/* =========================================================
   MAIN COMPONENT — WORKS AS MODAL + PAGE
========================================================= */

const VoucherPreview = ({
  voucher: voucherProp,
  onClose,
}) => {
  const { voucherId } = useParams();
  const navigate = useNavigate();

  const [voucher, setVoucher] = useState(voucherProp || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isModal = Boolean(voucherProp && onClose);

  // =========================================================
  // PAGE MODE — FETCH FROM API
  // =========================================================
  useEffect(() => {
    if (isModal) return;
    if (!voucherId) {
      setError("Voucher ID is missing in URL.");
      return;
    }

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await FeeAPI.get(`/api/vouchers/${voucherId}`);

        // Backend shape: { success, data: { voucher, items } }
        const payload = res?.data?.data || res?.data;

        const voucherDoc = payload?.voucher || payload;
        const itemsArr = Array.isArray(payload?.items) ? payload.items : [];

        if (!voucherDoc) throw new Error("Voucher not found.");

        // Flatten so voucherNo, baseAmount, enrollmentId, items etc.
        // are all readable straight off the top-level object below.
        setVoucher({ ...voucherDoc, items: itemsArr });
      } catch (err) {
        console.error("Voucher fetch error:", err);
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Unable to load voucher."
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [voucherId, isModal]);

  // Sync prop → state in modal mode
  useEffect(() => {
    if (isModal && voucherProp) setVoucher(voucherProp);
  }, [voucherProp, isModal]);

  const handlePrint = () => window.print();

  // =========================================================
  // LOADING / ERROR (page mode)
  // =========================================================
  if (!isModal && loading) {
    return (
      <div className="vp-page-state">
        <div className="vp-loader">Loading voucher...</div>
      </div>
    );
  }

  if (!isModal && (error || !voucher)) {
    return (
      <div className="vp-page-state">
        <div className="vp-error">
          <h3>Voucher Not Found</h3>
          <p>{error || "Unable to load voucher."}</p>
          <button onClick={() => navigate(-1)}>
            <ArrowLeft size={17} /> Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!voucher) return null;

  // =========================================================
  // DATA NORMALIZATION — BASED ON YOUR API RESPONSE
  // =========================================================

  // enrollmentId is a populated object in your response
  const enrollment = voucher?.enrollmentId || voucher?.enrollment || {};

  // student is inside enrollment.studentId
  const student =
    enrollment?.studentId ||
    voucher?.student ||
    voucher?.selectedStudent ||
    {};

  // batch is inside enrollment.batchId
  const batch =
    enrollment?.batchId ||
    voucher?.batch ||
    {};

  // batch has departmentId, degreeClassId, shiftId (as objects)
  const department =
    batch?.departmentId ||
    batch?.department ||
    {};
    console.log("Enrollment:", enrollment);
console.log("Batch:", enrollment?.batchId);

  const degreeClass =
    batch?.degreeClassId ||
    batch?.degreeClass ||
    {};

  const shift =
    batch?.shiftId ||
    batch?.shift ||
    {};

  const campus =
    batch?.campusId ||
    batch?.campus ||
    enrollment?.campusId ||
    {};

  const session =
    batch?.startSessionId ||
    batch?.sessionId ||
    batch?.session ||
    enrollment?.sessionId ||
    {};

  // =========================================================
  // STUDENT FIELDS
  // =========================================================

 const p = student?.personalInfo || student || {};

const studentName =
  `${p.firstName || ""} ${p.lastName || ""}`.trim() ||
  student?.name ||
  student?.fullName ||
  voucher?.studentName ||
  "—";

  const registrationNo =
    student?.registrationNo ||
    student?.registrationNumber ||
    "-";

 const studentId =
  student?._id ||
  student?.personalInfo?.studentId ||
  voucher?.studentId ||
  "—";

const cnic =
  student?.personalInfo?.cnic ||
  student?.cnic ||
  student?.CNIC ||
  "—";

  const fatherName =
    student?.fatherName ||
    student?.father?.name ||
    student?.guardianName ||
    "-";

  const quota =
    enrollment?.quota?.name ||
    enrollment?.quotaName ||
    enrollment?.quota ||
    student?.quota?.name ||
    student?.quota ||
    "Open Merit";

  // =========================================================
  // PROGRAM / SEMESTER
  // =========================================================

  const departmentName =
    department?.name ||
    department?.title ||
    department?.departmentName ||
    "-";

  const degreeName =
    degreeClass?.name ||
    degreeClass?.title ||
    degreeClass?.code ||
    "-";

  const shiftName =
    shift?.name ||
    shift?.title ||
    shift?.code ||
    "-";

  const campusName =
    campus?.name ||
    campus?.title ||
    campus?.campusName ||
    "UE Multan Campus";

  const sessionName =
    session?.name ||
    session?.year ||
    session?.session ||
    batch?.sessionName ||
    "-";

  const semester =
    voucher?.semester ??
    batch?.currentSemester ??
    enrollment?.currentSemester ??
    "-";

  // =========================================================
  // VOUCHER NUMBERS
  // =========================================================

  const voucherNo =
    voucher?.voucherNo ||
    voucher?.voucherNumber ||
    voucher?._id ||
    "-";

  const challanNo =
    voucher?.challanNo ||
    voucher?.challanNumber ||
    voucherNo;

  const billNo =
    voucher?.billNo ||
    voucher?.billNumber ||
    voucherNo;

  // =========================================================
  // AMOUNTS
  // =========================================================

  const items = Array.isArray(voucher?.items)
    ? voucher.items
    : Array.isArray(voucher?.voucherItems)
    ? voucher.voucherItems
    : [];

  const itemsTotal = items.reduce(
    (sum, item) => sum + Number(item?.amount || 0),
    0
  );

  const baseAmount = Number(
    voucher?.baseAmount ??
      voucher?.amount ??
      (items.length ? itemsTotal : 0)
  );

  const fineAmount = Number(
    voucher?.fineAmount ??
      voucher?.fine?.amount ??
      0
  );

  const afterDueAmount = Number(
    voucher?.amountAfterDueDate ??
      voucher?.afterDueAmount ??
      baseAmount + fineAmount
  );

  const feeTypeName =
    voucher?.feeType?.name ||
    voucher?.feeTypeName ||
    "Semester wise";

  const issueDate = fmtDate(
    voucher?.issueDate || voucher?.createdAt
  );

  const dueDate = fmtDate(voucher?.payDueDate);
  const fineDueDate = fmtDate(voucher?.fineDueDate);

  // =========================================================
  // COPIES
  // =========================================================

  const copies = [
    "Bank Copy",
    "Bank Copy (UE Treasurer)",
    "UE Division/Campus Copy",
    "Student Copy",
  ];

  // =========================================================
  // SINGLE COPY RENDER
  // =========================================================

  const VoucherCopy = ({ copyName, index }) => (
    <article className="vp-copy" key={`${copyName}-${index}`}>
      <div className="vp-copy-name">{copyName}</div>

      <div className="vp-bank">The Bank of the Punjab</div>
      <div className="vp-university">
        University of Education, Lahore
      </div>

    <div className="vp-meta">
  <div>
    <span>Date:</span>
    <strong>{issueDate}</strong>
  </div>

  <div>
    <span>Challan#:</span>
    <strong>{challanNo}</strong>
  </div>

  <div>
    <span>Name:</span>
    <strong>{studentName}</strong>
  </div>

  <div>
    <span>CNIC:</span>
    <strong>{cnic}</strong>
  </div>

  <div>
    <span>Department:</span>
    <strong>{departmentName}</strong>
  </div>

  <div>
    <span>Division/Campus:</span>
    <strong>{campusName}</strong>
  </div>

  <div>
    <span>Degree Program:</span>
    <strong>{degreeName}</strong>
  </div>

  <div className="vp-row-2">
    <div>
      <span>Shift:</span>
      <strong>{shiftName}</strong>
    </div>
    <div>
      <span>Quota:</span>
      <strong>{quota}</strong>
    </div>
  </div>

  <div>
    <span>Semester:</span>
    <strong>
      {semester !== "-" ? `Semester ${semester}` : "-"}
    </strong>
  </div>

  <div>
    <span>Due Date:</span>
    <strong>{dueDate}</strong>
  </div>

  <div>
    <span>Fine Due Date:</span>
    <strong>{fineDueDate}</strong>
  </div>

  <div>
    <span>Fee Type:</span>
    <strong>{feeTypeName}</strong>
  </div>
</div>

      <table className="vp-table">
        <thead>
          <tr>
            <th>Sr#</th>
            <th>Description</th>
            <th>Rs.</th>
          </tr>
        </thead>

        <tbody>
          {items.length > 0 ? (
            items.map((item, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>
                  {item?.name ||
                    item?.description ||
                    item?.feeTypeId?.name ||
                    "Fee Item"}
                </td>
                <td>
                  {Number(item?.amount || 0).toLocaleString()}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td>1</td>
              <td>Tuition Fee</td>
              <td>{baseAmount.toLocaleString()}</td>
            </tr>
          )}

          <tr className="vp-total">
            <td colSpan="2">Amount (within due date)</td>
            <td>{baseAmount.toLocaleString()}</td>
          </tr>
        </tbody>
      </table>

      <div className="vp-words">
        Rs. {amountInWords(baseAmount)}
      </div>

      <div className="vp-line">
        <span>Fine Amount</span>
        <strong>{fineAmount.toLocaleString()}</strong>
      </div>

      <div className="vp-line vp-line-bold">
        <span>Amount (after due date)</span>
        <strong>{afterDueAmount.toLocaleString()}</strong>
      </div>

      <div className="vp-words">
        Rs. {amountInWords(afterDueAmount)}
      </div>

      <div className="vp-notes">
        <div>
          i) Depositors will receive the system generated
          deposit slip from the bank as proof of deposit.
          Sign and stamp on downloaded challan forms or
          manual deposit is not acceptable to UE authority.
        </div>
        <div>
          ii) This Voucher may please be deposited into
          any Branch of BOP.
        </div>
        <div>
          iii) All Bankers are requested to post this
          Voucher to the (University of Education New
          Collection Account).
        </div>
      </div>
    </article>
  );

  // =========================================================
  // BODY (shared by modal + page)
  // =========================================================

  const body = (
    <div className="vp-sheet">
      {copies.map((name, i) => (
        <VoucherCopy key={`${name}-${i}`} copyName={name} index={i} />
      ))}
    </div>
  );

  // =========================================================
  // MODAL MODE
  // =========================================================

  if (isModal) {
    return (
      <div
        className="vp-overlay"
        onClick={(e) =>
          e.target === e.currentTarget && onClose()
        }
      >
        <div className="vp-modal">
          <div className="vp-toolbar no-print">
            <h3>Voucher Preview</h3>
            <div>
              <button
                className="vp-btn-print"
                onClick={handlePrint}
              >
                <Printer size={16} /> Print
              </button>

              <button
                className="vp-btn-close"
                onClick={onClose}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {body}
        </div>
      </div>
    );
  }

  // =========================================================
  // PAGE MODE
  // =========================================================

  return (
    <div className="vp-page">
      <div className="vp-toolbar vp-toolbar-page no-print">
        <button
          className="vp-btn-back"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={16} /> Back
        </button>

        <h3>
          Voucher Preview — {voucherNo}
        </h3>

        <button
          className="vp-btn-print"
          onClick={handlePrint}
        >
          <Printer size={16} /> Print
        </button>
      </div>

      {body}
    </div>
  );
};

export default VoucherPreview;