
import React, { useState } from "react";
import {
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  Search,
  Download,
  Eye,
  FileText,
  CreditCard,
  AlertCircle,
  Users,
  Plus,
} from "lucide-react";
import "./FeeManagement.css";
import GenerateVoucherModal from "./GenerateVoucherModal";
import VoucherPreview from "./VoucherPreview";
const FeeManagement = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [showVoucherPreview, setShowVoucherPreview] = useState(false);
const [voucherData, setVoucherData] = useState(null);
  // =========================
  // STATIC DATA
  // =========================

  const stats = [
    {
      label: "Total Revenue",
      value: "PKR 2,450,000",
      icon: DollarSign,
      type: "revenue",
      change: "+12.5%",
      changeText: "from last month",
    },
    {
      label: "Pending Payments",
      value: "PKR 450,000",
      icon: Clock,
      type: "pending",
      change: "23",
      changeText: "students",
    },
    {
      label: "Verified Today",
      value: "PKR 125,000",
      icon: CheckCircle,
      type: "verified",
      change: "15",
      changeText: "payments",
    },
    {
      label: "Overdue",
      value: "PKR 85,000",
      icon: AlertCircle,
      type: "overdue",
      change: "8",
      changeText: "students",
    },
  ];

  const feeVouchers = [
    {
      id: "FV-2025-001",
      student: "Ali Ahmed",
      rollNo: "BS-CS-2021-001",
      semester: "Spring 2025",
      amount: 25000,
      dueDate: "2025-10-15",
      status: "pending",
    },
    {
      id: "FV-2025-002",
      student: "Fatima Khan",
      rollNo: "BS-IT-2022-045",
      semester: "Spring 2025",
      amount: 25000,
      dueDate: "2025-10-15",
      status: "paid",
    },
    {
      id: "FV-2025-003",
      student: "Hassan Raza",
      rollNo: "BS-SE-2021-023",
      semester: "Spring 2025",
      amount: 25000,
      dueDate: "2025-10-15",
      status: "overdue",
    },
    {
      id: "FV-2025-004",
      student: "Ayesha Malik",
      rollNo: "BS-CS-2023-067",
      semester: "Spring 2025",
      amount: 25000,
      dueDate: "2025-10-15",
      status: "pending",
    },
    {
      id: "FV-2025-005",
      student: "Usman Ali",
      rollNo: "BS-IT-2021-089",
      semester: "Spring 2025",
      amount: 25000,
      dueDate: "2025-10-15",
      status: "paid",
    },
  ];

  const pendingVerifications = [
    {
      id: "PV-001",
      student: "Sara Noor",
      rollNo: "BS-CS-2022-034",
      amount: 25000,
      submittedDate: "2025-10-05",
      challanNo: "CH-789456",
      bank: "HBL",
    },
    {
      id: "PV-002",
      student: "Ahmed Hassan",
      rollNo: "BS-IT-2021-056",
      amount: 25000,
      submittedDate: "2025-10-06",
      challanNo: "CH-789457",
      bank: "UBL",
    },
    {
      id: "PV-003",
      student: "Zainab Fatima",
      rollNo: "BS-SE-2023-012",
      amount: 25000,
      submittedDate: "2025-10-06",
      challanNo: "CH-789458",
      bank: "MCB",
    },
  ];

  // =========================
  // STATUS BADGE
  // =========================

  const getStatusBadge = (status) => {
    const statusConfig = {
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

    const config = statusConfig[status] || statusConfig.pending;

    return <span className={config.className}>{config.label}</span>;
  };

  // =========================
  // FILTER VOUCHERS
  // =========================

  const filteredVouchers = feeVouchers.filter((voucher) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      voucher.student.toLowerCase().includes(search) ||
      voucher.rollNo.toLowerCase().includes(search) ||
      voucher.id.toLowerCase().includes(search);

    const matchesStatus =
      filterStatus === "all" || voucher.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="fee-management-page">

      {/* ================= HEADER ================= */}

      <div className="fee-page-header">
        <div>
          <h2>Fee Management</h2>
          <p>
            Manage fee vouchers, payments and payment verification.
          </p>
        </div>

        <button
          className="fee-primary-btn"
          onClick={() => setShowVoucherModal(true)}
        >
          <Plus size={18} />
          Generate Voucher
        </button>
      </div>

      {/* ================= STATS ================= */}

      <div className="fee-stats-grid">
        {stats.map((stat, index) => {
          const Icon = stat.icon;

          return (
            <div className="fee-stat-card" key={index}>
              <div className="fee-stat-top">
                <div className={`fee-stat-icon ${stat.type}`}>
                  <Icon size={22} />
                </div>

                {stat.type === "revenue" && (
                  <span className="fee-growth">
                    <TrendingUp size={15} />
                    {stat.change}
                  </span>
                )}
              </div>

              <p className="fee-stat-label">{stat.label}</p>

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

      {/* ================= TABS ================= */}

      <div className="fee-main-card">

        <div className="fee-tabs">
          <button
            className={activeTab === "overview" ? "active" : ""}
            onClick={() => setActiveTab("overview")}
          >
            <FileText size={17} />
            Overview
          </button>

          <button
            className={activeTab === "vouchers" ? "active" : ""}
            onClick={() => setActiveTab("vouchers")}
          >
            <FileText size={17} />
            Fee Vouchers
          </button>

          <button
            className={activeTab === "verify" ? "active" : ""}
            onClick={() => setActiveTab("verify")}
          >
            <CheckCircle size={17} />
            Verify Payments
          </button>
        </div>

        {/* ================= OVERVIEW ================= */}

        {activeTab === "overview" && (
          <div className="fee-content">

            <div className="fee-overview-grid">

              {/* Recent Transactions */}

              <div className="fee-panel">
                <div className="fee-panel-header">
                  <div>
                    <h4>Recent Transactions</h4>
                    <p>Latest student fee activity</p>
                  </div>

                  <div className="fee-panel-icon blue">
                    <CreditCard size={19} />
                  </div>
                </div>

                <div className="fee-transaction-list">
                  {feeVouchers.slice(0, 4).map((voucher) => (
                    <div
                      className="fee-transaction"
                      key={voucher.id}
                    >
                      <div className="fee-student-avatar">
                        {voucher.student.charAt(0)}
                      </div>

                      <div className="fee-transaction-info">
                        <strong>{voucher.student}</strong>
                        <span>{voucher.rollNo}</span>
                      </div>

                      <div className="fee-transaction-right">
                        <strong>
                          PKR {voucher.amount.toLocaleString()}
                        </strong>
                        {getStatusBadge(voucher.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pending Verification */}

              <div className="fee-panel">
                <div className="fee-panel-header">
                  <div>
                    <h4>Pending Verifications</h4>
                    <p>Payments waiting for approval</p>
                  </div>

                  <div className="fee-panel-icon orange">
                    <Clock size={19} />
                  </div>
                </div>

                <div className="fee-verification-list">
                  {pendingVerifications.map((payment) => (
                    <div
                      className="fee-verification-item"
                      key={payment.id}
                    >
                      <div>
                        <strong>{payment.student}</strong>
                        <span>
                          {payment.rollNo} • {payment.bank}
                        </span>
                        <small>
                          Challan: {payment.challanNo}
                        </small>
                      </div>

                      <button className="fee-small-btn">
                        Verify
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}

            <div className="fee-section-title">
              <h4>Quick Actions</h4>
              <p>Frequently used fee management actions</p>
            </div>

            <div className="fee-actions-grid">

              <button className="fee-action-card green">
                <FileText size={25} />

                <div>
                  <strong>Generate Vouchers</strong>
                  <span>Create fee vouchers for students</span>
                </div>
              </button>

              <button className="fee-action-card blue">
                <Download size={25} />

                <div>
                  <strong>Export Report</strong>
                  <span>Download fee collection report</span>
                </div>
              </button>

              <button className="fee-action-card purple">
                <Users size={25} />

                <div>
                  <strong>Send Reminders</strong>
                  <span>Notify students about pending fees</span>
                </div>
              </button>

            </div>
          </div>
        )}

        {/* ================= VOUCHERS ================= */}

        {activeTab === "vouchers" && (
          <div className="fee-content">

            <div className="fee-table-header">
              <div>
                <h4>Fee Vouchers</h4>
                <p>View and manage generated student vouchers.</p>
              </div>

              <button
                className="fee-primary-btn"
                onClick={() => setShowVoucherModal(true)}
              >
                <Plus size={17} />
                Generate Voucher
              </button>
            </div>

            {/* Search */}

            <div className="fee-filter-bar">

              <div className="fee-search">
                <Search size={18} />

                <input
                  type="text"
                  placeholder="Search student, roll number or voucher ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>

            {/* Table */}

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
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredVouchers.length > 0 ? (
                    filteredVouchers.map((voucher) => (
                      <tr key={voucher.id}>

                        <td>
                          <strong>{voucher.id}</strong>
                        </td>

                        <td>
                          <div className="table-student">
                            <div className="table-avatar">
                              {voucher.student.charAt(0)}
                            </div>

                            <span>{voucher.student}</span>
                          </div>
                        </td>

                        <td>{voucher.rollNo}</td>

                        <td>{voucher.semester}</td>

                        <td>
                          <strong>
                            PKR {voucher.amount.toLocaleString()}
                          </strong>
                        </td>

                        <td>{voucher.dueDate}</td>

                        <td>
                          {getStatusBadge(voucher.status)}
                        </td>

                        <td>
                          <div className="fee-table-actions">

                            <button
                              className="view"
                              title="View Voucher"
                            >
                              <Eye size={17} />
                            </button>

                            <button
                              className="download"
                              title="Download Voucher"
                            >
                              <Download size={17} />
                            </button>

                          </div>
                        </td>

                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8">
                        <div className="fee-empty-state">
                          <Search size={35} />
                          <h5>No vouchers found</h5>
                          <p>
                            Try changing your search or filter.
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

        {/* ================= VERIFY ================= */}

        {activeTab === "verify" && (
          <div className="fee-content">

            <div className="fee-info-alert">
              <AlertCircle size={20} />

              <div>
                <strong>Payment Verification</strong>

                <p>
                  Review submitted payment challans carefully
                  before approving them.
                </p>
              </div>
            </div>

            <div className="fee-verification-cards">

              {pendingVerifications.map((payment) => (
                <div
                  className="fee-payment-card"
                  key={payment.id}
                >

                  <div className="fee-payment-main">

                    <div className="fee-payment-icon">
                      <FileText size={22} />
                    </div>

                    <div>
                      <h4>{payment.student}</h4>
                      <p>{payment.rollNo}</p>
                    </div>

                  </div>

                  <div className="fee-payment-details">

                    <div>
                      <span>Amount</span>
                      <strong>
                        PKR {payment.amount.toLocaleString()}
                      </strong>
                    </div>

                    <div>
                      <span>Challan Number</span>
                      <strong>{payment.challanNo}</strong>
                    </div>

                    <div>
                      <span>Bank</span>
                      <strong>{payment.bank}</strong>
                    </div>

                    <div>
                      <span>Submitted</span>
                      <strong>{payment.submittedDate}</strong>
                    </div>

                  </div>

                  <div className="fee-payment-actions">

                    <button className="view-btn">
                      <Eye size={16} />
                      View
                    </button>

                    <button className="approve-btn">
                      <CheckCircle size={16} />
                      Approve
                    </button>

                    <button className="reject-btn">
                      Reject
                    </button>

                  </div>

                </div>
              ))}

            </div>
          </div>
        )}

      </div>
     <GenerateVoucherModal
  isOpen={showVoucherModal}
  onClose={() => setShowVoucherModal(false)}
  onGenerate={(data) => {
    setVoucherData(data);
    setShowVoucherModal(false);
    setShowVoucherPreview(true);
  }}
/>

<VoucherPreview
  isOpen={showVoucherPreview}
  onClose={() => setShowVoucherPreview(false)}
  voucherData={voucherData}
/>
    </div>
  );
};

export default FeeManagement;

