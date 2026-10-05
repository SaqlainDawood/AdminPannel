import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Student.css";
import { toast } from "react-toastify";
import { FaSpinner } from "react-icons/fa";
import {
  getPendingApplications,
  approveApplication,
  rejectApplication,
} from "../../../services/studentAdminAPI";

const PAGE_SIZE = 9;

// =========================================================
// HELPERS
// =========================================================
const getFullName = (student) => {
  const p = student?.personalInfo || {};
  return (
    `${p.firstName || ""} ${p.lastName || ""}`.trim() ||
    `${student?.firstName || ""} ${student?.lastName || ""}`.trim() ||
    getEmail(student) ||
    "Unknown"
  );
};

const getEmail = (student) =>
  student?.email || student?.user?.email || "";

const getPhone = (student) =>
  student?.personalInfo?.phoneNo || student?.phoneNo || "N/A";

const getCnic = (student) =>
  student?.personalInfo?.cnic || student?.cnic || "N/A";

const getFatherName = (student) =>
  student?.personalInfo?.fatherName ||
  student?.familyInfo?.fatherName ||
  student?.family?.fatherName ||
  "N/A";

const getInitials = (name) =>
  String(name || "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase() || "?";

const formatDate = (value) => {
  if (!value) return "N/A";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "N/A" : d.toLocaleDateString();
};

// Photo na ho ya load fail ho to initials wala avatar dikhata hai
const Avatar = ({ url, name }) => {
  const [failed, setFailed] = useState(false);

  if (url && !failed) {
    return (
      <img
        src={url}
        alt={name}
        className="student-photo"
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div
      className="student-photo"
      aria-label={name}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#e2e8f0",
        color: "#475569",
        fontWeight: 600,
      }}
    >
      {getInitials(name)}
    </div>
  );
};

// =========================================================
// MAIN COMPONENT
// =========================================================
const StudentApprovals = () => {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState("");
  const [rejectReason, setRejectReason] = useState("");

  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("all");
  const [page, setPage] = useState(1);

  const [rollNo, setRollNo] = useState("");
  const [registrationNo, setRegistrationNo] = useState("");
  const [section, setSection] = useState("");

  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processing, setProcessing] = useState(false);

  // =========================================================
  // ERROR HANDLING
  // =========================================================
  const handleApiError = useCallback(
    (error, fallback) => {
      const status = error?.response?.status;

      if (status === 401) {
        toast.error("Session khatam ho gaya, dobara login karein");
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("adminToken");
        localStorage.removeItem("adminToken");
        navigate("/login");
        return;
      }

      if (status === 403) {
        toast.error("Aap ke paas is kaam ki permission nahi hai");
        return;
      }

      toast.error(error?.response?.data?.message || fallback);
    },
    [navigate]
  );

  // =========================================================
  // FETCH
  // =========================================================
  const fetchApplications = useCallback(
    async ({ silent = false } = {}) => {
      try {
        silent ? setRefreshing(true) : setInitialLoading(true);
        const res = await getPendingApplications();

        const list = Array.isArray(res?.applications)
          ? res.applications
          : Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
          ? res
          : [];

        setApplications(list);
      } catch (error) {
        console.error("Fetch pending applications error:", error);
        handleApiError(error, "Pending students load nahi ho sake");
        setApplications([]);
      } finally {
        setInitialLoading(false);
        setRefreshing(false);
      }
    },
    [handleApiError]
  );

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // =========================================================
  // MODAL
  // =========================================================
  const closeModal = useCallback(() => {
    if (processing) return;
    setShowModal(false);
    setSelectedApp(null);
    setRejectReason("");
  }, [processing]);

  useEffect(() => {
    if (!showModal) return;
    const onKey = (e) => e.key === "Escape" && closeModal();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showModal, closeModal]);

  const handleApprove = (app) => {
    setSelectedApp(app);
    setActionType("approve");
    setRollNo(app?.rollNo || "");
    setRegistrationNo(app?.registrationNo || "");
    setSection(app?.section || "");
    setShowModal(true);
  };

  const handleReject = (app) => {
    setSelectedApp(app);
    setActionType("rejected");
    setRejectReason("");
    setShowModal(true);
  };

  // =========================================================
  // CONFIRM
  // =========================================================
  const removeFromList = (id) =>
    setApplications((prev) => prev.filter((a) => a._id !== id));

  const confirmAction = async () => {
    if (!selectedApp || processing) return;

    if (actionType === "rejected" && !rejectReason.trim()) {
      toast.warn("Rejection ki wajah likhein");
      return;
    }

    setProcessing(true);

    try {
      const name = getFullName(selectedApp.student);

      if (actionType === "approve") {
        const payload = {};
        if (rollNo.trim()) payload.rollNo = rollNo.trim();
        if (registrationNo.trim()) payload.registrationNo = registrationNo.trim();
        if (section.trim()) payload.section = section.trim();

        const res = await approveApplication(selectedApp._id, payload);

        if (res?.success) {
          toast.success(`${name} approve ho gaya`);
          removeFromList(selectedApp._id);
          setShowModal(false);
          setSelectedApp(null);
        } else {
          toast.error(res?.message || "Approval fail ho gaya");
        }
      } else {
        const res = await rejectApplication(selectedApp._id, rejectReason.trim());

        if (res?.success) {
          toast.info(`${name} reject ho gaya`);
          removeFromList(selectedApp._id);
          setShowModal(false);
          setRejectReason("");
          setSelectedApp(null);
        } else {
          toast.error(res?.message || "Rejection fail ho gaya");
        }
      }
    } catch (error) {
      console.error("Action error:", error);
      handleApiError(error, "Kuch ghalat ho gaya, dobara koshish karein");
    } finally {
      setProcessing(false);
    }
  };

  // =========================================================
  // FILTER + PAGINATION
  // =========================================================
  const departments = useMemo(
    () =>
      [
        ...new Set(
          applications.map((a) => a?.departmentId?.name).filter(Boolean)
        ),
      ].sort(),
    [applications]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return applications.filter((app) => {
      if (department !== "all" && app?.departmentId?.name !== department) {
        return false;
      }
      if (!q) return true;

      const student = app?.student || {};
      const haystack = [
        getFullName(student),
        getEmail(student),
        getCnic(student),
        getPhone(student),
        app?.departmentId?.name,
        app?.degreeClassId?.name,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [applications, search, department]);

  useEffect(() => {
    setPage(1);
  }, [search, department]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  const hasFilters = search.trim() !== "" || department !== "all";

  // =========================================================
  // LOADING
  // =========================================================
  if (initialLoading) {
    return (
      <div className="loading-container">
        <div>
          <FaSpinner className="spinner" size={40} />
          <p className="loading-text">Loading Student Approvals...</p>
        </div>
      </div>
    );
  }

  // =========================================================
  // RENDER
  // =========================================================
  return (
    <div className="approvals-container">
      <div className="container-fluid">
        {/* HEADER */}
        <div className="page-header">
          <div>
            <h1 className="page-title">
              <i className="fas fa-clock me-3"></i>Pending Approvals
            </h1>
            <p className="page-subtitle">
              Review and approve student registration applications
            </p>
          </div>
          <div className="header-stats d-flex align-items-center gap-2">
            <div className="stat-badge">
              <i className="fas fa-hourglass-half"></i>
              <span>{applications.length} Pending</span>
            </div>
            <button
              className="btn btn-outline-light"
              onClick={() => fetchApplications({ silent: true })}
              disabled={refreshing}
              title="Refresh"
            >
              <i className={`fas fa-sync-alt ${refreshing ? "fa-spin" : ""}`}></i>
            </button>
          </div>
        </div>

        {/* FILTER */}
        <div className="filter-section">
          <div className="filter-label">Search:</div>
          <div className="filter-controls">
            <input
              type="text"
              className="search-bar"
              placeholder="Name, email, CNIC ya phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="search-bar"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              aria-label="Department filter"
            >
              <option value="all">All Departments</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            {hasFilters && (
              <button
                className="filter-btn"
                onClick={() => {
                  setSearch("");
                  setDepartment("all");
                }}
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* GRID */}
        <div className="approvals-grid">
          {pageItems.map((app) => {
            const student = app?.student || null;
            const fullName = getFullName(student);
            const email = getEmail(student);
            const profileMissing = !student;

            return (
              <div key={app._id} className="approval-card">
                <div className="card-header">
                  <div className="student-basic-info">
                    <Avatar url={student?.profileImage?.url} name={fullName} />
                    <div className="student-details">
                      <h3 className="student-name">{fullName}</h3>
                      <p className="student-email">
                        <i className="fas fa-envelope me-2"></i>
                        {email || "No Email"}
                      </p>
                      <p className="student-phone">
                        <i className="fas fa-phone me-2"></i>
                        {getPhone(student)}
                      </p>
                    </div>
                  </div>
                  <div className="time-badge">
                    <i className="far fa-clock me-2"></i>
                    Applied: {formatDate(app.createdAt)}
                  </div>
                </div>

                <div className="card-body">
                  {profileMissing && (
                    <div className="alert alert-warning py-2 mb-3">
                      <i className="fas fa-exclamation-triangle me-2"></i>
                      Student profile maujood nahi
                    </div>
                  )}
                  <div className="info-grid">
                    <div className="info-item">
                      <label>CNIC</label>
                      <span>{getCnic(student)}</span>
                    </div>
                    <div className="info-item">
                      <label>Father's Name</label>
                      <span>{getFatherName(student)}</span>
                    </div>
                    <div className="info-item">
                      <label>Department</label>
                      <span className="dept-badge">
                        {app?.departmentId?.name || "N/A"}
                      </span>
                    </div>
                    <div className="info-item">
                      <label>Program</label>
                      <span>
                        {app?.degreeClassId?.name || "N/A"} —{" "}
                        {app?.shiftId?.name || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="card-footer">
                  <button className="btn-reject" onClick={() => handleReject(app)}>
                    <i className="fas fa-times me-2"></i>
                    Reject
                  </button>
                  <button
                    className="btn-approve"
                    onClick={() => handleApprove(app)}
                    disabled={profileMissing}
                    title={
                      profileMissing
                        ? "Student profile ke baghair approve nahi ho sakta"
                        : "Approve"
                    }
                  >
                    <i className="fas fa-check me-2"></i>
                    Approve
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* EMPTY */}
        {filtered.length === 0 && (
          <div className="empty-state">
            <i
              className={`fas ${hasFilters ? "fa-search" : "fa-check-circle"}`}
            ></i>
            <h3>{hasFilters ? "Koi nateeja nahi mila" : "All Caught Up!"}</h3>
            <p>
              {hasFilters
                ? "Search ya department filter badal kar dekhein."
                : "Abhi koi pending approval nahi hai."}
            </p>
          </div>
        )}

        {/* PAGINATION */}
        {filtered.length > PAGE_SIZE && (
          <div className="pagination-section">
            <div className="pagination-info">
              Showing {(safePage - 1) * PAGE_SIZE + 1} to{" "}
              {Math.min(safePage * PAGE_SIZE, filtered.length)} of{" "}
              {filtered.length}
            </div>
            <div className="pagination-controls">
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                aria-label="Previous page"
              >
                <i className="fas fa-chevron-left"></i>
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  className={`btn btn-sm ${
                    safePage === i + 1 ? "btn-primary" : "btn-outline-primary"
                  }`}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                aria-label="Next page"
              >
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div
          className={`modal-overlay ${processing ? "processing" : ""}`}
          onClick={closeModal}
        >
          <div
            className="modal-content"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>
                {actionType === "approve" ? (
                  <>
                    <i className="fas fa-check-circle text-success me-2"></i>
                    Approve Application
                  </>
                ) : (
                  <>
                    <i className="fas fa-times-circle text-danger me-2"></i>
                    Reject Application
                  </>
                )}
              </h3>
              {!processing && (
                <button className="btn-close" onClick={closeModal}>
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>

            {processing ? (
              <div className="modal-body text-center py-5">
                <div className="spinner-border text-primary" role="status" />
                <p className="mt-3">
                  {actionType === "approve"
                    ? "Student approve ho raha hai..."
                    : "Student reject ho raha hai..."}
                </p>
              </div>
            ) : (
              <div className="modal-body">
                {actionType === "approve" ? (
                  <div>
                    <p className="mb-3">
                      Approve <strong>{getFullName(selectedApp?.student)}</strong>?
                    </p>

                    <div className="form-group mb-3">
                      <label>Roll Number (optional)</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. CS-2026-001"
                        value={rollNo}
                        onChange={(e) => setRollNo(e.target.value.toUpperCase())}
                      />
                      <small className="text-muted">
                        Khaali chhodo — backend auto-generate karega
                      </small>
                    </div>

                    <div className="form-group mb-3">
                      <label>Registration No. (optional)</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. 2026-CS-001"
                        value={registrationNo}
                        onChange={(e) =>
                          setRegistrationNo(e.target.value.toUpperCase())
                        }
                      />
                    </div>

                    <div className="form-group mb-3">
                      <label>Section (optional)</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. A"
                        value={section}
                        onChange={(e) => setSection(e.target.value.toUpperCase())}
                      />
                    </div>

                    <div className="alert alert-info">
                      <i className="fas fa-info-circle me-2"></i>
                      Student ko approval email milegi login credentials ke saath.
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="mb-3">
                      Reject <strong>{getFullName(selectedApp?.student)}</strong>?
                    </p>
                    <textarea
                      className="form-control"
                      rows="4"
                      placeholder="Rejection reason..."
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      autoFocus
                    />
                    <div className="alert alert-warning mt-3">
                      <i className="fas fa-exclamation-triangle me-2"></i>
                      Student ko rejection email jaayegi.
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={closeModal}
                disabled={processing}
              >
                Cancel
              </button>
              <button
                className={`btn ${
                  actionType === "approve" ? "btn-success" : "btn-danger"
                }`}
                onClick={confirmAction}
                disabled={
                  processing ||
                  (actionType === "rejected" && !rejectReason.trim())
                }
              >
                {processing ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                    />
                    {actionType === "approve" ? "Approving..." : "Rejecting..."}
                  </>
                ) : actionType === "approve" ? (
                  "Confirm Approval"
                ) : (
                  "Confirm Rejection"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentApprovals;