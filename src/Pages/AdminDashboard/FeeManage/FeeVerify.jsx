import React, { useEffect, useState, useCallback } from "react";
import {
  Search,
  Eye,
  CheckCircle,
  XCircle,
  FileText,
  Clock,
  DollarSign,
  AlertCircle,
  RefreshCw,
  Loader2,
} from "lucide-react";

import { getVouchers, updateVoucherStatus } from "../../../services/feeService";
import "./FeeVerify.css";

// ============================================
// STATUS MAPPING (backend <-> UI)
// ============================================
const TO_UI = { unpaid: "pending", paid: "verified", cancelled: "rejected" };
const TO_API = { pending: "unpaid", verified: "paid", rejected: "cancelled" };

// ============================================
// HELPERS
// ============================================
const getList = (response) => {
  const data = response?.data ?? response;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.vouchers)) return data.vouchers;
  return [];
};

const getId = (item) => item?._id || item?.id;

const getStudent = (v) =>
  v?.enrollmentId?.studentId || v?.studentId || v?.student || {};

const getStudentName = (v) => {
  const s = getStudent(v);
  return (
    s?.name ||
    s?.fullName ||
    `${s?.firstName || ""} ${s?.lastName || ""}`.trim() ||
    "Unknown"
  );
};

const getRollNo = (v) => {
  const s = getStudent(v);
  return s?.rollNo || s?.registrationNo || s?.studentId || "—";
};

const fmtDate = (val) => {
  if (!val) return "—";
  try {
    return new Date(val).toISOString().split("T")[0];
  } catch {
    return val;
  }
};

const FeeVerify = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("pending");
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");

  // ============================================
  // LOAD VOUCHERS
  // ============================================
  const loadPayments = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getVouchers();
      const list = getList(response);

      const mapped = list.map((v) => ({
        id: v?.voucherNo || getId(v),
        _raw: v,
        student: getStudentName(v),
        rollNo: getRollNo(v),
        amount: Number(v?.totalAmount || v?.baseAmount || 0),
        submittedDate: fmtDate(v?.createdAt || v?.issueDate),
        payDueDate: fmtDate(v?.payDueDate),
        fineDueDate: fmtDate(v?.fineDueDate),
        challanNo: v?.voucherNo || "—",
        bank: v?.bank || "—",
        status: TO_UI[v?.payStatus] || "pending",
      }));

      setPayments(mapped);
    } catch (err) {
      console.error("Fee verify load:", err);
      setError(
        err?.response?.data?.message || err?.message || "Failed to load payments."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  // ============================================
  // FILTER
  // ============================================
  const filtered = payments.filter((p) => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      p.student.toLowerCase().includes(q) ||
      p.rollNo.toLowerCase().includes(q) ||
      p.challanNo.toLowerCase().includes(q);
    const matchStatus = filterStatus === "all" || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  // ============================================
  // UPDATE STATUS
  // ============================================
  const handleUpdate = async (payment, newUiStatus) => {
    const student = getStudent(payment._raw);
    const studentId = getId(student);
    const voucherId = getId(payment._raw);

    if (!studentId || !voucherId) {
      setError("Student or voucher ID missing.");
      return;
    }

    try {
      setActionLoading(payment.id);
      setError("");

      await updateVoucherStatus(studentId, voucherId, TO_API[newUiStatus]);

      setPayments((prev) =>
        prev.map((p) =>
          p.id === payment.id ? { ...p, status: newUiStatus } : p
        )
      );
    } catch (err) {
      console.error("Update status:", err);
      setError(
        err?.response?.data?.message || err?.message || "Failed to update."
      );
    } finally {
      setActionLoading(null);
    }
  };

  // ============================================
  // BADGE
  // ============================================
  const badge = (status) => {
    const cfg = {
      pending: { className: "fee-verify-status pending", label: "Pending" },
      verified: { className: "fee-verify-status verified", label: "Verified" },
      rejected: { className: "fee-verify-status rejected", label: "Rejected" },
    };
    const c = cfg[status] || cfg.pending;
    return <span className={c.className}>{c.label}</span>;
  };

  // ============================================
  // SUMMARY
  // ============================================
  const pendingCount = payments.filter((p) => p.status === "pending").length;
  const verifiedCount = payments.filter((p) => p.status === "verified").length;
  const rejectedCount = payments.filter((p) => p.status === "rejected").length;
  const pendingAmount = payments
    .filter((p) => p.status === "pending")
    .reduce((s, p) => s + p.amount, 0);

  return (
    <div className="fee-verify-page">
      {/* HEADER */}
      <div className="fee-verify-header">
        <div>
          <div className="fee-verify-title-row">
            <div className="fee-verify-title-icon">
              <CheckCircle size={25} />
            </div>
            <div>
              <h2>Payment Verification</h2>
              <p>Review and verify student fee payment submissions.</p>
            </div>
          </div>
        </div>

        <button
          className="fee-verify-refresh"
          onClick={loadPayments}
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? "spin" : ""} />
          Refresh
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="fee-verify-alert error">
          <AlertCircle size={20} />
          <div>
            <strong>Something went wrong</strong>
            <p>{error}</p>
          </div>
          <button onClick={() => setError("")}>×</button>
        </div>
      )}

      {/* INFO */}
      <div className="fee-verify-alert">
        <AlertCircle size={21} />
        <div>
          <strong>Verification Required</strong>
          <p>
            Please carefully review the submitted challan details before
            approving or rejecting a payment.
          </p>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="fee-verify-summary">
        <div className="fee-verify-summary-card">
          <div className="summary-icon orange">
            <Clock size={21} />
          </div>
          <div>
            <span>Pending Verification</span>
            <h3>{pendingCount}</h3>
          </div>
        </div>

        <div className="fee-verify-summary-card">
          <div className="summary-icon blue">
            <DollarSign size={21} />
          </div>
          <div>
            <span>Pending Amount</span>
            <h3>PKR {pendingAmount.toLocaleString()}</h3>
          </div>
        </div>

        <div className="fee-verify-summary-card">
          <div className="summary-icon green">
            <CheckCircle size={21} />
          </div>
          <div>
            <span>Verified Payments</span>
            <h3>{verifiedCount}</h3>
          </div>
        </div>

        <div className="fee-verify-summary-card">
          <div className="summary-icon red">
            <XCircle size={21} />
          </div>
          <div>
            <span>Rejected Payments</span>
            <h3>{rejectedCount}</h3>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div className="fee-verify-card">
        <div className="fee-verify-card-header">
          <div>
            <h3>Submitted Payments</h3>
            <p>Review student payment challans and update their status.</p>
          </div>
          <div className="fee-verify-count">{filtered.length} Payments</div>
        </div>

        {/* FILTER */}
        <div className="fee-verify-filter">
          <div className="fee-verify-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search student, roll number or challan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Payments</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* LIST */}
        <div className="fee-verify-list">
          {loading ? (
            <div className="fee-verify-empty">
              <Loader2 size={45} className="spin" />
              <h4>Loading payments...</h4>
            </div>
          ) : filtered.length > 0 ? (
            filtered.map((payment) => (
              <div className="fee-verify-payment" key={payment.id}>
                <div className="fee-verify-student">
                  <div className="fee-verify-avatar">
                    {payment.student.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4>{payment.student}</h4>
                    <p>{payment.rollNo}</p>
                    <div className="fee-verify-payment-id">
                      Voucher: {payment.challanNo}
                    </div>
                  </div>
                </div>

                <div className="fee-verify-details">
                  <div>
                    <span>Amount</span>
                    <strong>PKR {payment.amount.toLocaleString()}</strong>
                  </div>
                  <div>
                    <span>Pay Due</span>
                    <strong>{payment.payDueDate}</strong>
                  </div>
                  <div>
                    <span>Fine Due</span>
                    <strong>{payment.fineDueDate}</strong>
                  </div>
                  <div>
                    <span>Issued</span>
                    <strong>{payment.submittedDate}</strong>
                  </div>
                </div>

                <div className="fee-verify-status-wrapper">
                  {badge(payment.status)}
                </div>

                <div className="fee-verify-actions">
                  <button className="fee-verify-view" title="View Voucher">
                    <Eye size={16} />
                    View
                  </button>

                  {payment.status === "pending" && (
                    <>
                      <button
                        className="fee-verify-approve"
                        disabled={actionLoading === payment.id}
                        onClick={() => handleUpdate(payment, "verified")}
                      >
                        {actionLoading === payment.id ? (
                          <Loader2 size={16} className="spin" />
                        ) : (
                          <CheckCircle size={16} />
                        )}
                        Approve
                      </button>

                      <button
                        className="fee-verify-reject"
                        disabled={actionLoading === payment.id}
                        onClick={() => handleUpdate(payment, "rejected")}
                      >
                        <XCircle size={16} />
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="fee-verify-empty">
              <FileText size={45} />
              <h4>No payments found</h4>
              <p>Try changing your search or filter.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeeVerify;