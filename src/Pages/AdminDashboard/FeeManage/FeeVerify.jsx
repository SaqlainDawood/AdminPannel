import React, { useState } from "react";
import {
  Search,
  Eye,
  CheckCircle,
  XCircle,
  FileText,
  Clock,
  DollarSign,
  AlertCircle,
} from "lucide-react";
import "./FeeVerify.css";

const FeeVerify = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("pending");

  // =========================
  // STATIC PAYMENT DATA
  // =========================

  const [payments, setPayments] = useState([
    {
      id: "PV-001",
      student: "Sara Noor",
      rollNo: "BS-CS-2022-034",
      amount: 25000,
      submittedDate: "2025-10-05",
      challanNo: "CH-789456",
      bank: "HBL",
      status: "pending",
    },
    {
      id: "PV-002",
      student: "Ahmed Hassan",
      rollNo: "BS-IT-2021-056",
      amount: 25000,
      submittedDate: "2025-10-06",
      challanNo: "CH-789457",
      bank: "UBL",
      status: "pending",
    },
    {
      id: "PV-003",
      student: "Zainab Fatima",
      rollNo: "BS-SE-2023-012",
      amount: 25000,
      submittedDate: "2025-10-06",
      challanNo: "CH-789458",
      bank: "MCB",
      status: "pending",
    },
    {
      id: "PV-004",
      student: "Bilal Khan",
      rollNo: "BS-CS-2022-078",
      amount: 30000,
      submittedDate: "2025-10-07",
      challanNo: "CH-789459",
      bank: "Meezan Bank",
      status: "verified",
    },
  ]);

  // =========================
  // FILTER PAYMENTS
  // =========================

  const filteredPayments = payments.filter((payment) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      payment.student.toLowerCase().includes(search) ||
      payment.rollNo.toLowerCase().includes(search) ||
      payment.challanNo.toLowerCase().includes(search);

    const matchesStatus =
      filterStatus === "all" || payment.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // =========================
  // APPROVE PAYMENT
  // =========================

  const handleApprove = (id) => {
    setPayments((prev) =>
      prev.map((payment) =>
        payment.id === id
          ? { ...payment, status: "verified" }
          : payment
      )
    );
  };

  // =========================
  // REJECT PAYMENT
  // =========================

  const handleReject = (id) => {
    setPayments((prev) =>
      prev.map((payment) =>
        payment.id === id
          ? { ...payment, status: "rejected" }
          : payment
      )
    );
  };

  // =========================
  // STATUS BADGE
  // =========================

  const getStatusBadge = (status) => {
    const config = {
      pending: {
        className: "fee-verify-status pending",
        label: "Pending",
      },
      verified: {
        className: "fee-verify-status verified",
        label: "Verified",
      },
      rejected: {
        className: "fee-verify-status rejected",
        label: "Rejected",
      },
    };

    const current = config[status] || config.pending;

    return (
      <span className={current.className}>
        {current.label}
      </span>
    );
  };

  // =========================
  // SUMMARY
  // =========================

  const pendingCount = payments.filter(
    (payment) => payment.status === "pending"
  ).length;

  const verifiedCount = payments.filter(
    (payment) => payment.status === "verified"
  ).length;

  const rejectedCount = payments.filter(
    (payment) => payment.status === "rejected"
  ).length;

  const pendingAmount = payments
    .filter((payment) => payment.status === "pending")
    .reduce((total, payment) => total + payment.amount, 0);

  return (
    <div className="fee-verify-page">

      {/* ================= HEADER ================= */}

      <div className="fee-verify-header">
        <div>
          <div className="fee-verify-title-row">
            <div className="fee-verify-title-icon">
              <CheckCircle size={25} />
            </div>

            <div>
              <h2>Payment Verification</h2>
              <p>
                Review and verify student fee payment submissions.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ================= INFO ALERT ================= */}

      <div className="fee-verify-alert">
        <AlertCircle size={21} />

        <div>
          <strong>Verification Required</strong>

          <p>
            Please carefully review the submitted challan details
            before approving or rejecting a payment.
          </p>
        </div>
      </div>

      {/* ================= SUMMARY CARDS ================= */}

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
            <h3>
              PKR {pendingAmount.toLocaleString()}
            </h3>
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

      {/* ================= MAIN CARD ================= */}

      <div className="fee-verify-card">

        {/* CARD HEADER */}

        <div className="fee-verify-card-header">
          <div>
            <h3>Submitted Payments</h3>
            <p>
              Review student payment challans and update their status.
            </p>
          </div>

          <div className="fee-verify-count">
            {filteredPayments.length} Payments
          </div>
        </div>

        {/* ================= FILTER BAR ================= */}

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

        {/* ================= PAYMENTS ================= */}

        <div className="fee-verify-list">

          {filteredPayments.length > 0 ? (
            filteredPayments.map((payment) => (
              <div
                className="fee-verify-payment"
                key={payment.id}
              >

                {/* STUDENT */}

                <div className="fee-verify-student">

                  <div className="fee-verify-avatar">
                    {payment.student.charAt(0)}
                  </div>

                  <div>
                    <h4>{payment.student}</h4>
                    <p>{payment.rollNo}</p>

                    <div className="fee-verify-payment-id">
                      Payment ID: {payment.id}
                    </div>
                  </div>

                </div>

                {/* DETAILS */}

                <div className="fee-verify-details">

                  <div>
                    <span>Amount</span>

                    <strong>
                      PKR {payment.amount.toLocaleString()}
                    </strong>
                  </div>

                  <div>
                    <span>Challan Number</span>

                    <strong>
                      {payment.challanNo}
                    </strong>
                  </div>

                  <div>
                    <span>Bank</span>

                    <strong>
                      {payment.bank}
                    </strong>
                  </div>

                  <div>
                    <span>Submitted</span>

                    <strong>
                      {payment.submittedDate}
                    </strong>
                  </div>

                </div>

                {/* STATUS */}

                <div className="fee-verify-status-wrapper">
                  {getStatusBadge(payment.status)}
                </div>

                {/* ACTIONS */}

                <div className="fee-verify-actions">

                  <button
                    className="fee-verify-view"
                    title="View Challan"
                  >
                    <Eye size={16} />
                    View
                  </button>

                  {payment.status === "pending" && (
                    <>
                      <button
                        className="fee-verify-approve"
                        onClick={() => handleApprove(payment.id)}
                      >
                        <CheckCircle size={16} />
                        Approve
                      </button>

                      <button
                        className="fee-verify-reject"
                        onClick={() => handleReject(payment.id)}
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

              <p>
                Try changing your search or filter.
              </p>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default FeeVerify;