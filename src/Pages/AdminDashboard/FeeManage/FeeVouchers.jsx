import React, { useEffect, useState, useCallback } from "react";
import {
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  Search,
  Eye,
  FileText,
  CreditCard,
  AlertCircle,
  Users,
  Plus,
  RefreshCw,
  Loader2,
  X,
  CalendarDays,
  UserRound,
  Receipt,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { getVouchers } from "../../../services/feeService";
import "./FeeManagement.css";

const getId = (item) => item?._id || item?.id;
// const navigate = useNavigate();
const getStudent = (v) => {
  // Voucher → enrollmentId → studentId (nested)
  const enroll = v?.enrollmentId || v?.enrollment || {};
  return (
    enroll?.studentId ||
    v?.studentId ||
    v?.student ||
    {}
  );
};


const getStudentName = (v) => {
  const s = getStudent(v);
  const p = s?.personalInfo || s || {};

  return (
    `${p.firstName || ""} ${p.lastName || ""}`.trim() ||
    s?.name ||
    s?.fullName ||
    s?.email ||
    "Unknown"
  );
};

const getRollNo = (v) => {
  const s = getStudent(v);
  return (
    v?.rollNo ||
    s?.rollNo ||
    v?.enrollmentId?.rollNo ||
    s?.personalInfo?.cnic ||
    "—"
  );
};

const fmtDate = (val) => {
  if (!val) return "—";

  try {
    return new Date(val).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return val;
  }
};

const FeeManagement = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Selected voucher for View modal
  // const [selectedVoucher, setSelectedVoucher] = useState(null);

  const navigate = useNavigate();

  // ==========================================
  // LOAD VOUCHERS
  // ==========================================

  const loadVouchers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getVouchers();

      const list = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response?.vouchers)
        ? response.vouchers
        : [];

      setVouchers(list);
    } catch (err) {
      console.error("Fee management load:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load fee data."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVouchers();
  }, [loadVouchers]);

  // ==========================================
  // NORMALIZE VOUCHERS
  // ==========================================

  const feeVouchers = vouchers.map((v, index) => ({
    id:
      v?.voucherNo ||
      getId(v) ||
      `VOUCHER-${index + 1}`,

    _raw: v,

    student: getStudentName(v),

    rollNo: String(getRollNo(v)),

    semester:
      v?.semester != null
        ? `Semester ${v.semester}`
        : "—",

    amount: Number(
      v?.totalAmount ||
        v?.baseAmount ||
        v?.amount ||
        0
    ),

    dueDate: fmtDate(v?.payDueDate),

    status:
      v?.payStatus === "paid"
        ? "paid"
        : v?.payStatus === "cancelled"
        ? "overdue"
        : "pending",
  }));

  // ==========================================
  // STATISTICS
  // ==========================================

  const paidList = feeVouchers.filter(
    (v) => v.status === "paid"
  );

  const pendingList = feeVouchers.filter(
    (v) => v.status === "pending"
  );

  const overdueList = feeVouchers.filter(
    (v) => v.status === "overdue"
  );

  const totalRevenue = paidList.reduce(
    (sum, v) => sum + v.amount,
    0
  );

  const pendingAmount = pendingList.reduce(
    (sum, v) => sum + v.amount,
    0
  );

  const verifiedAmount = paidList.reduce(
    (sum, v) => sum + v.amount,
    0
  );

  const overdueAmount = overdueList.reduce(
    (sum, v) => sum + v.amount,
    0
  );

  const stats = [
    {
      label: "Total Revenue",
      value: `PKR ${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      type: "revenue",
      change: "+live",
      changeText: "collected",
    },
    {
      label: "Pending Payments",
      value: `PKR ${pendingAmount.toLocaleString()}`,
      icon: Clock,
      type: "pending",
      change: pendingList.length,
      changeText: "vouchers",
    },
    {
      label: "Verified / Paid",
      value: `PKR ${verifiedAmount.toLocaleString()}`,
      icon: CheckCircle,
      type: "verified",
      change: paidList.length,
      changeText: "vouchers",
    },
    {
      label: "Overdue",
      value: `PKR ${overdueAmount.toLocaleString()}`,
      icon: AlertCircle,
      type: "overdue",
      change: overdueList.length,
      changeText: "vouchers",
    },
  ];

  // ==========================================
  // LISTS
  // ==========================================

  const recentTransactions = feeVouchers.slice(0, 4);

  const pendingVerifications =
    pendingList.slice(0, 3);

  // ==========================================
  // FILTER
  // ==========================================

  const filteredVouchers = feeVouchers.filter(
    (v) => {
      const q = searchTerm.trim().toLowerCase();

      const matchSearch =
        String(v.student)
          .toLowerCase()
          .includes(q) ||
        String(v.rollNo)
          .toLowerCase()
          .includes(q) ||
        String(v.id)
          .toLowerCase()
          .includes(q);

      const matchStatus =
        filterStatus === "all" ||
        v.status === filterStatus;

      return matchSearch && matchStatus;
    }
  );

  // ==========================================
  // STATUS BADGE
  // ==========================================

  const badge = (status) => {
    const cfg = {
      paid: {
        className: "fee-status paid",
        label: "Paid",
      },
      pending: {
        className: "fee-status pending",
        label: "Pending",
      },
      overdue: {
        className: "fee-status overdue",
        label: "Overdue",
      },
      verified: {
        className: "fee-status verified",
        label: "Verified",
      },
    };

    const c = cfg[status] || cfg.pending;

    return (
      <span className={c.className}>
        {c.label}
      </span>
    );
  };

  // ==========================================
  // VIEW VOUCHER
  // ==========================================

const handleViewVoucher = (voucher) => {
  const mongoId = voucher?._raw?._id || voucher?._raw?.id;

  if (!mongoId) {
    setError("Voucher ID missing. Cannot open preview.");
    return;
  }

  navigate(`/admin/dashboard/fee/preview/${mongoId}`);
};

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="fee-management-page">

      {/* ======================================
          HEADER
      ====================================== */}

      <div className="fee-page-header">
        <div>
          <div className="fee-title-row">
            <div className="fee-title-icon">
              <Receipt size={22} />
            </div>

            <div>
              <h2>Fee Management</h2>

              <p>
                Manage fee vouchers, payments and
                payment verification.
              </p>
            </div>
          </div>
        </div>

        <div className="fee-header-actions">
          <button
            type="button"
            className="fee-refresh-btn"
            onClick={loadVouchers}
            disabled={loading}
          >
            <RefreshCw
              size={17}
              className={
                loading ? "fee-spin" : ""
              }
            />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            className="fee-primary-btn"
            onClick={() =>
              navigate(
                "/admin/dashboard/fee/Voucher"
              )
            }
          >
            <Plus size={18} />
            Generate Voucher
          </button>
        </div>
      </div>

      {/* ======================================
          ERROR
      ====================================== */}

      {error && (
        <div className="fee-info-alert error">
          <AlertCircle size={19} />

          <div>
            <strong>Unable to load fee data</strong>
            <p>{error}</p>
          </div>

          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Close error"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* ======================================
          STATS
      ====================================== */}

      <div className="fee-stats-grid">
        {stats.map((stat, index) => {
          const Icon = stat.icon;

          return (
            <div
              className="fee-stat-card"
              key={index}
            >
              <div className="fee-stat-top">
                <div
                  className={`fee-stat-icon ${stat.type}`}
                >
                  <Icon size={21} />
                </div>

                {stat.type === "revenue" && (
                  <span className="fee-growth">
                    <TrendingUp size={14} />
                    {stat.change}
                  </span>
                )}
              </div>

              <p className="fee-stat-label">
                {stat.label}
              </p>

              <h3>{stat.value}</h3>

              <span className="fee-stat-bottom">
                {stat.type === "revenue"
                  ? stat.changeText
                  : `${stat.change} ${stat.changeText}`}
              </span>
            </div>
          );
        })}
      </div>

      {/* ======================================
          MAIN CARD
      ====================================== */}

      <div className="fee-main-card">

        {/* TABS */}

        <div className="fee-tabs">
          <button
            type="button"
            className={
              activeTab === "overview"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveTab("overview")
            }
          >
            <FileText size={17} />
            <span>Overview</span>
          </button>

          <button
            type="button"
            className={
              activeTab === "vouchers"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveTab("vouchers")
            }
          >
            <Receipt size={17} />
            <span>Fee Vouchers</span>

            <small>
              {feeVouchers.length}
            </small>
          </button>

          <button
            type="button"
            className={
              activeTab === "verify"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveTab("verify")
            }
          >
            <CheckCircle size={17} />
            <span>Verify Payments</span>

            {pendingList.length > 0 && (
              <small className="fee-tab-alert">
                {pendingList.length}
              </small>
            )}
          </button>
        </div>

        {/* ====================================
            OVERVIEW
        ==================================== */}

        {activeTab === "overview" && (
          <div className="fee-content">

            {loading ? (
              <div className="fee-loading">
                <Loader2
                  size={24}
                  className="spin"
                />

                <span>
                  Loading fee information...
                </span>
              </div>
            ) : (
              <>
                <div className="fee-overview-grid">

                  {/* RECENT TRANSACTIONS */}

                  <div className="fee-panel">
                    <div className="fee-panel-header">
                      <div>
                        <h4>
                          Recent Transactions
                        </h4>

                        <p>
                          Latest student fee activity
                        </p>
                      </div>

                      <div className="fee-panel-icon blue">
                        <CreditCard size={19} />
                      </div>
                    </div>

                    <div className="fee-transaction-list">
                      {recentTransactions.length ===
                      0 ? (
                        <div className="fee-empty-state">
                          <Receipt size={27} />
                          <p>
                            No transactions yet.
                          </p>
                        </div>
                      ) : (
                        recentTransactions.map(
                          (v) => (
                            <div
                              className="fee-transaction"
                              key={v.id}
                            >
                              <div className="fee-student-avatar">
                                {v.student
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>

                              <div className="fee-transaction-info">
                                <strong>
                                  {v.student}
                                </strong>

                                <span>
                                  {v.rollNo}
                                </span>
                              </div>

                              <div className="fee-transaction-right">
                                <strong>
                                  PKR{" "}
                                  {v.amount.toLocaleString()}
                                </strong>

                                {badge(v.status)}
                              </div>
                            </div>
                          )
                        )
                      )}
                    </div>
                  </div>

                  {/* PENDING */}

                  <div className="fee-panel">
                    <div className="fee-panel-header">
                      <div>
                        <h4>
                          Pending Verifications
                        </h4>

                        <p>
                          Payments waiting for approval
                        </p>
                      </div>

                      <div className="fee-panel-icon orange">
                        <Clock size={19} />
                      </div>
                    </div>

                    <div className="fee-verification-list">
                      {pendingVerifications.length ===
                      0 ? (
                        <div className="fee-empty-state">
                          <CheckCircle size={27} />
                          <p>
                            No pending payments.
                          </p>
                        </div>
                      ) : (
                        pendingVerifications.map(
                          (v) => (
                            <div
                              className="fee-verification-item"
                              key={v.id}
                            >
                              <div>
                                <strong>
                                  {v.student}
                                </strong>

                                <span>
                                  {v.rollNo}
                                </span>

                                <small>
                                  Voucher: {v.id}
                                </small>
                              </div>

                              <button
                                type="button"
                                className="fee-small-btn"
                                onClick={() =>
                                  setActiveTab(
                                    "verify"
                                  )
                                }
                              >
                                Verify
                              </button>
                            </div>
                          )
                        )
                      )}
                    </div>
                  </div>
                </div>

                {/* QUICK ACTIONS */}

                <div className="fee-section-title">
                  <h4>Quick Actions</h4>

                  <p>
                    Frequently used fee management
                    actions
                  </p>
                </div>

                <div className="fee-actions-grid">

                  <button
                    type="button"
                    className="fee-action-card green"
                    onClick={() =>
                      navigate(
                        "/admin/dashboard/fee/Voucher"
                      )
                    }
                  >
                    <FileText size={24} />

                    <div>
                      <strong>
                        Generate Vouchers
                      </strong>

                      <span>
                        Create fee vouchers for
                        students
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    className="fee-action-card blue"
                    onClick={() =>
                      navigate(
                        "/admin/dashboard/fee/tuition"
                      )
                    }
                  >
                    <DollarSign size={24} />

                    <div>
                      <strong>
                        Tuition Fees
                      </strong>

                      <span>
                        Manage tuition fee
                        configuration
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    className="fee-action-card purple"
                    onClick={() =>
                      navigate(
                        "/admin/dashboard/fee/verify"
                      )
                    }
                  >
                    <CheckCircle size={24} />

                    <div>
                      <strong>
                        Verify Payments
                      </strong>

                      <span>
                        Approve or reject
                        payments
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    className="fee-action-card orange"
                    onClick={() =>
                      setActiveTab("vouchers")
                    }
                  >
                    <Receipt size={24} />

                    <div>
                      <strong>
                        View All Vouchers
                      </strong>

                      <span>
                        Browse generated fee
                        vouchers
                      </span>
                    </div>
                  </button>

                </div>
              </>
            )}
          </div>
        )}

        {/* ====================================
            VOUCHERS
        ==================================== */}

        {activeTab === "vouchers" && (
          <div className="fee-content">

            <div className="fee-table-header">
              <div>
                <h4>Fee Vouchers</h4>

                <p>
                  View generated student fee
                  vouchers.
                </p>
              </div>

              <button
                type="button"
                className="fee-primary-btn"
                onClick={() =>
                  navigate(
                    "/admin/dashboard/fee/Voucher"
                  )
                }
              >
                <Plus size={17} />
                Generate Voucher
              </button>
            </div>

            {/* FILTER BAR */}

            <div className="fee-filter-bar">

              <div className="fee-search">
                <Search size={18} />

                <input
                  type="text"
                  placeholder="Search student, roll number or voucher ID..."
                  value={searchTerm}
                  onChange={(e) =>
                    setSearchTerm(
                      e.target.value
                    )
                  }
                />

                {searchTerm && (
                  <button
                    type="button"
                    onClick={() =>
                      setSearchTerm("")
                    }
                    aria-label="Clear search"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              <select
                value={filterStatus}
                onChange={(e) =>
                  setFilterStatus(
                    e.target.value
                  )
                }
              >
                <option value="all">
                  All Status
                </option>

                <option value="paid">
                  Paid
                </option>

                <option value="pending">
                  Pending
                </option>

                <option value="overdue">
                  Overdue
                </option>
              </select>

              <span className="fee-result-count">
                {filteredVouchers.length}{" "}
                {filteredVouchers.length === 1
                  ? "voucher"
                  : "vouchers"}
              </span>
            </div>

            {/* TABLE */}

            <div className="fee-table-wrapper">
              <table className="fee-table">

                <thead>
                  <tr>
                    <th>Voucher ID</th>
                    <th>Student</th>
                    <th>Roll Number</th>
                    <th>Semester</th>
                    <th>Amount</th>
                    <th>Due Date</th>
                    <th>Status</th>
                    <th>View</th>
                  </tr>
                </thead>

                <tbody>

                  {loading ? (
                    <tr>
                      <td colSpan="8">
                        <div className="fee-loading">
                          <Loader2
                            size={22}
                            className="spin"
                          />

                          <span>
                            Loading vouchers...
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredVouchers.length > 0 ? (
                    filteredVouchers.map((v) => (
                      <tr key={v.id}>

                        <td>
                          <div className="fee-voucher-id">
                            <Receipt size={15} />
                            <strong>
                              {v.id}
                            </strong>
                          </div>
                        </td>

                        <td>
                          <div className="table-student">
                            <div className="table-avatar">
                              {v.student
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <span>
                              {v.student}
                            </span>
                          </div>
                        </td>

                        <td>
                          {v.rollNo}
                        </td>

                        <td>
                          <span className="fee-semester">
                            {v.semester}
                          </span>
                        </td>

                        <td>
                          <strong>
                            PKR{" "}
                            {v.amount.toLocaleString()}
                          </strong>
                        </td>

                        <td>
                          {v.dueDate}
                        </td>

                        <td>
                          {badge(v.status)}
                        </td>

                        {/* ONLY VIEW */}
                        <td>
                          <div className="fee-table-actions">
                            <button
                              type="button"
                              className="view"
                              title="View Voucher"
                              aria-label="View Voucher"
                              onClick={() =>
                                handleViewVoucher(
                                  v
                                )
                              }
                            >
                              <Eye size={17} />
                            </button>
                          </div>
                        </td>

                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8">
                        <div className="fee-empty-state table-empty">
                          <Search size={35} />

                          <h5>
                            No vouchers found
                          </h5>

                          <p>
                            Try changing your search
                            or filter.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}

                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ====================================
            VERIFY
        ==================================== */}

        {activeTab === "verify" && (
          <div className="fee-content">

            <div className="fee-info-alert">
              <AlertCircle size={20} />

              <div>
                <strong>
                  Payment Verification
                </strong>

                <p>
                  Go to the Fee Verify page to
                  approve or reject payments.
                </p>
              </div>
            </div>

            <button
              type="button"
              className="fee-primary-btn"
              onClick={() =>
                navigate(
                  "/admin/dashboard/fee/verify"
                )
              }
            >
              <CheckCircle size={17} />
              Open Verification Page
            </button>

          </div>
        )}
      </div>

      {/* ======================================
          VOUCHER VIEW MODAL
      ====================================== */}

    </div>
  );
};

export default FeeManagement;