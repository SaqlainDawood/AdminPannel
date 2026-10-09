import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { X, Printer, ArrowLeft, Download, Loader2 } from "lucide-react";
import FeeAPI from "../../../services/feeService";
import "./VoucherPreview.css";

/* ---------- static labels only (NO data) ---------- */
const HEADER_TITLE = "University Management System";
const BANK_TITLE = "The Bank of the Punjab";
const COPIES = [
  "Bank Copy",
  "Bank Copy – UE Treasurer",
  "UE Division/Campus Copy",
  "Student Copy",
];
const NOTES = [
  "i) Depositors will receive the system generated deposit slip from the bank as proof of deposit. Manual deposit or a stamped/signed printout is not acceptable.",
  "ii) This voucher may be deposited into any authorized bank branch.",
  "iii) Bankers are requested to post this voucher to the university collection account.",
];

/* ---------- helpers ---------- */
const DASH = "-";
const isObj = (v) => v && typeof v === "object";

const fmtDate = (val) => {
  if (!val) return DASH;
  if (typeof val === "string" && /^\d{4}-\d{2}-\d{2}$/.test(val)) {
    const [y, m, d] = val.split("-");
    return `${d}-${m}-${y}`;
  }
  const date = new Date(val);
  if (Number.isNaN(date.getTime())) return String(val);
  return date.toLocaleDateString("en-GB").replace(/\//g, "-");
};

// first non-empty primitive, else "-"
const first = (...vals) => {
  for (const v of vals) {
    if (v !== undefined && v !== null && v !== "" && !isObj(v)) return v;
  }
  return DASH;
};
const nameOf = (o) => (isObj(o) ? o.name || o.title || o.code || o.year || null : o);

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
    if (x < 10000000) return `${three(Math.floor(x / 100000))} Lakh${x % 100000 ? ` ${conv(x % 100000)}` : ""}`;
    return `${two(Math.floor(x / 10000000))} Crore${x % 10000000 ? ` ${conv(x % 10000000)}` : ""}`;
  };
  return `${conv(n)} Only`;
};

/* ---------- API response -> { voucherDoc, items } ---------- */
const unwrapVoucher = (res) => {
  const body = res?.data ?? res;
  let voucherDoc = null;
  let items = [];

  if (body?.data?.voucher) { voucherDoc = body.data.voucher; items = body.data.items; }
  else if (body?.voucher) { voucherDoc = body.voucher; items = body.items; }
  else if (body?.data?._id) { voucherDoc = body.data; items = body.data.items; }
  else if (body?._id) { voucherDoc = body; items = body.items || body.voucherItems; }
  else voucherDoc = body?.data ?? body;

  if (!voucherDoc) throw new Error("Voucher not found.");
  return { voucherDoc, items: Array.isArray(items) ? items : [] };
};

/* ---------- build display data: everything from API ---------- */
const buildViewData = (v, items) => {
  const enrollment =
    (isObj(v.enrollmentId) && v.enrollmentId) || (isObj(v.enrollment) && v.enrollment) || {};

  const student =
    (isObj(v.studentId) && v.studentId) ||
    (isObj(v.student) && v.student) ||
    (isObj(v.selectedStudent) && v.selectedStudent) ||
    (isObj(enrollment.studentId) && enrollment.studentId) ||
    (isObj(enrollment.student) && enrollment.student) ||
    v.studentSnapshot ||
    {};
  const p = student.personalInfo || student;

  const batch =
    (isObj(enrollment.batchId) && enrollment.batchId) ||
    (isObj(v.batchId) && v.batchId) ||
    (isObj(v.batch) && v.batch) ||
    {};

  const department = v.department || batch.departmentId || batch.department || enrollment.departmentId;
  const degreeClass = v.degreeClass || batch.degreeClassId || batch.degreeClass || enrollment.degreeClassId;
  const shift = v.shift || batch.shiftId || batch.shift || enrollment.shiftId;
  const campus = v.campus || batch.campusId || batch.campus || enrollment.campusId;
  const session = v.session || batch.startSessionId || batch.sessionId || batch.session;

  const studentName =
    `${p.firstName || ""} ${p.lastName || ""}`.trim() ||
    student.name || student.fullName || v.studentName || DASH;

  const list = items.length ? items : Array.isArray(v.items) ? v.items : [];
  const itemsTotal = list.reduce((s, i) => s + Number(i?.amount || 0), 0);
  const baseAmount = Number(v.baseAmount ?? v.amount ?? v.tuitionFee?.totalAmount ?? itemsTotal);

  const fineVal = Number(v.fineAmount ?? v.fine?.amount ?? 0);
  const afterDueAmount = Number(
    v.amountAfterDueDate ?? v.afterDueAmount ?? (baseAmount + fineVal)
  );
  const fineAmount = Math.max(afterDueAmount - baseAmount, fineVal);

  const voucherNo = first(v.voucherNo, v.voucherNumber);

  return {
    voucherNo,
    challanNo: first(v.challanNo, v.challanNumber, voucherNo),
    issueDate: fmtDate(v.issueDate || v.createdAt || new Date()),
    payDueDate: fmtDate(v.payDueDate || v.dueDate),
    fineDueDate: fmtDate(v.fineDueDate || v.payDueDate || v.dueDate),

    studentName,
    cnic: first(p.cnic, p.CNIC, p.cnicNo, student.cnic),
    fatherName: first(p.fatherName, student.fatherName, p.guardianName),
    rollNo: first(v.rollNo, enrollment.rollNo, student.rollNo),
    registrationNo: first(v.registrationNo, enrollment.registrationNo, student.registrationNo),

    department: first(nameOf(department)),
    campus: first(nameOf(campus)),
    degree: first(nameOf(degreeClass)),
    shift: first(nameOf(shift)),
    session: first(nameOf(session), batch.sessionName),
    quota: first(nameOf(enrollment.quota), enrollment.quotaName, v.quota, student.quota),
    semester: first(v.semester, enrollment.currentSemester, batch.currentSemester, 1),
    feeType: first(nameOf(v.feeType), v.feeTypeName, "Semester Tuition Fee"),

    items: list.length > 0 ? list.map((i) => ({
      name: first(i?.name, i?.description, nameOf(i?.feeTypeId), nameOf(i?.feeType), "Fee Item"),
      amount: Number(i?.amount || 0),
    })) : [{ name: first(nameOf(v.feeType), v.feeTypeName, "Tuition Fee"), amount: baseAmount }],
    baseAmount,
    fineAmount,
    afterDueAmount,
  };
};

/* ---------- one copy ---------- */
const Line = ({ label, value, bold }) => (
  <div className="vp-line-info">
    <span>{label}:</span>
    <strong className={bold ? "vp-b" : ""}>{value}</strong>
  </div>
);

const VoucherCopy = ({ copyName, d }) => (
  <article className="vp-copy">
    <div className="vp-copy-name">{copyName}</div>
    <div className="vp-bank-name">{BANK_TITLE}</div>
    <div className="vp-title">{HEADER_TITLE}</div>

    <div className="vp-meta">
      <Line label="Date" value={d.issueDate} />
      <Line label="Challan#" value={d.challanNo} bold />
      <Line label="Name" value={d.studentName} />
      <Line label="Father Name" value={d.fatherName} />
      <Line label="CNIC" value={d.cnic} />
      <Line label="Roll No." value={d.rollNo} />
      <Line label="Registration No." value={d.registrationNo} />
      <Line label="Department" value={d.department} />
      <Line label="Campus" value={d.campus} />
      <Line label="Degree Program" value={d.degree} />
      <div className="vp-row-2">
        <Line label="Shift" value={d.shift} />
        <Line label="Quota" value={d.quota} />
      </div>
      <div className="vp-row-2">
        <Line label="Semester" value={d.semester === DASH ? DASH : `Semester ${d.semester}`} />
        <Line label="Session" value={d.session} />
      </div>
      <Line label="Due Date" value={d.payDueDate} />
      <Line label="Fine Due Date" value={d.fineDueDate} bold />
      <Line label="Fee Type" value={d.feeType} />
    </div>

    <table className="vp-table">
      <thead>
        <tr><th>Sr#</th><th>Description</th><th>Rs.</th></tr>
      </thead>
      <tbody>
        {d.items.map((item, i) => (
          <tr key={i}>
            <td>{i + 1}</td>
            <td>{item.name}</td>
            <td>{item.amount.toLocaleString()}</td>
          </tr>
        ))}
        <tr className="vp-total">
          <td colSpan="2">Amount (within due date)</td>
          <td>{d.baseAmount.toLocaleString()}</td>
        </tr>
      </tbody>
    </table>

    <div className="vp-words">Rs. {amountInWords(d.baseAmount)}</div>

    <div className="vp-line"><span>Fine Amount</span><strong>{d.fineAmount.toLocaleString()}</strong></div>
    <div className="vp-line vp-line-bold"><span>Amount (after due date)</span><strong>{d.afterDueAmount.toLocaleString()}</strong></div>

    <div className="vp-words">Rs. {amountInWords(d.afterDueAmount)}</div>

    <div className="vp-signatures">
      <div><span>Cashier</span></div>
      <div><span>Officer / Manager</span></div>
    </div>

    <div className="vp-notes">{NOTES.map((n, i) => <div key={i}>{n}</div>)}</div>
  </article>
);

/* ---------- main: modal (voucher + onClose) OR route page ---------- */
const VoucherPreview = ({ voucher: voucherProp, onClose }) => {
  const { voucherId: routeId } = useParams();
  const navigate = useNavigate();
  const sheetRef = useRef(null);

  const isModal = Boolean(voucherProp && onClose);
  const voucherId = routeId || voucherProp?._id || voucherProp?.id;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    // If voucherProp is passed with data, use it immediately
    if (voucherProp && (voucherProp.items || voucherProp.challanNo || voucherProp.voucherNo || voucherProp.student || voucherProp.baseAmount || voucherProp.amount)) {
      try {
        setData(buildViewData(voucherProp, voucherProp.items || []));
        setLoading(false);
        setError("");
        return;
      } catch (err) {
        console.warn("Could not build view data from prop, will try fetching", err);
      }
    }

    if (!voucherId) {
      setError("Voucher ID is missing.");
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const res = await FeeAPI.get(`/api/vouchers/${voucherId}`);
        const { voucherDoc, items } = unwrapVoucher(res);
        if (!cancelled) setData(buildViewData(voucherDoc, items));
      } catch (err) {
        if (!cancelled)
          setError(err?.response?.data?.message || err?.message || "Unable to load voucher.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [voucherId, voucherProp]);

  const handlePrint = () => window.print();

  const handleDownloadPdf = async () => {
    if (!sheetRef.current || !data) return;
    try {
      setDownloading(true);
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);
      const el = sheetRef.current;
      const canvas = await html2canvas(el, {
        scale: 2.5,
        backgroundColor: "#ffffff",
        useCORS: true,
        logging: false,
        windowWidth: 1240,
        scrollX: 0,
        scrollY: 0,
        onclone: (clonedDoc) => {
          const clonedEl = clonedDoc.querySelector(".vp-sheet");
          if (clonedEl) {
            clonedEl.style.width = "1200px";
            clonedEl.style.minWidth = "1200px";
            clonedEl.style.maxWidth = "1200px";
            clonedEl.style.display = "grid";
            clonedEl.style.gridTemplateColumns = "repeat(4, 1fr)";
            clonedEl.style.gap = "8px";
            clonedEl.style.margin = "0";
            clonedEl.style.padding = "8px";
            clonedEl.style.transform = "none";
            clonedEl.style.boxSizing = "border-box";
            clonedEl.style.background = "#ffffff";
            clonedEl.style.visibility = "visible";

            const copies = clonedEl.querySelectorAll(".vp-copy");
            copies.forEach((c) => {
              c.style.visibility = "visible";
              c.style.display = "flex";
              c.style.flexDirection = "column";
              c.style.border = "1px solid #222";
              c.style.boxSizing = "border-box";
            });
          }
        },
      });

      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth(); // 297mm
      const pageH = pdf.internal.pageSize.getHeight(); // 210mm
      const marginX = 4;
      const marginY = 4;
      const availW = pageW - marginX * 2; // 289mm
      const availH = pageH - marginY * 2; // 202mm

      const imgAspect = canvas.width / canvas.height;
      let renderW = availW;
      let renderH = renderW / imgAspect;

      if (renderH > availH) {
        renderH = availH;
        renderW = renderH * imgAspect;
      }

      const posX = (pageW - renderW) / 2;
      const posY = (pageH - renderH) / 2;

      const imgData = canvas.toDataURL("image/png");
      pdf.addImage(imgData, "PNG", posX, posY, renderW, renderH, undefined, "FAST");
      pdf.save(`voucher-${data.challanNo || data.voucherNo || "fee"}.pdf`);
    } catch (e) {
      console.error("PDF error:", e);
      alert("PDF creation failed. Please try Print → Save as PDF.");
    } finally {
      setDownloading(false);
    }
  };

  const actions = (
    <>
      <button className="vp-btn vp-btn-pdf" onClick={handleDownloadPdf} disabled={!data || downloading}>
        {downloading ? <Loader2 size={16} className="vp-spin" /> : <Download size={16} />}
        {downloading ? "Preparing..." : "Download PDF"}
      </button>
      <button className="vp-btn vp-btn-print" onClick={handlePrint} disabled={!data}>
        <Printer size={16} /> Print
      </button>
    </>
  );

  const content = loading ? (
    <div className="vp-state">Loading voucher...</div>
  ) : error || !data ? (
    <div className="vp-state vp-state-error">
      <h3>Voucher not found</h3>
      <p>{error || "Unable to load voucher."}</p>
    </div>
  ) : (
    <div className="vp-scroll">
      <div className="vp-sheet vp-print-root" ref={sheetRef}>
        {COPIES.map((name) => (
          <VoucherCopy key={name} copyName={name} d={data} />
        ))}
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="vp-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="vp-modal">
          <div className="vp-toolbar no-print">
            <h3>Voucher Preview{data ? ` — ${data.voucherNo}` : ""}</h3>
            <div className="vp-actions">
              {actions}
              <button className="vp-btn vp-btn-close" onClick={onClose} aria-label="Close">
                <X size={18} />
              </button>
            </div>
          </div>
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="vp-page">
      <div className="vp-toolbar vp-toolbar-page no-print">
        <button className="vp-btn vp-btn-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Back
        </button>
        <h3>Voucher Preview{data ? ` — ${data.voucherNo}` : ""}</h3>
        <div className="vp-actions">{actions}</div>
      </div>
      {content}
    </div>
  );
};

export default VoucherPreview;