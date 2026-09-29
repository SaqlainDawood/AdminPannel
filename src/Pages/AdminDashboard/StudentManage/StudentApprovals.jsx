import React, { useEffect, useState, useCallback } from "react";
import "./Student.css";
import { toast } from "react-toastify";
import { FaSpinner } from "react-icons/fa";
import {
  getPendingApplications,
  approveApplication,
  rejectApplication,
} from "../../../services/studentAdminAPI";

// =========================================================
// HELPERS
// =========================================================
const getFullName = (student) => {
  const p = student?.personalInfo || {};
  return (
    `${p.firstName || ""} ${p.lastName || ""}`.trim() ||
    student?.email ||
    "Unknown"
  );
};

const getEmail = (student) => student?.email || "No Email";

const getPhone = (student) =>
  student?.personalInfo?.phoneNo || student?.phoneNo || "N/A";

const getCnic = (student) =>
  student?.personalInfo?.cnic || student?.cnic || "N/A";

const getFatherName = (student) =>
  student?.personalInfo?.fatherName ||
  student?.family?.fatherName ||
  "N/A";

// =========================================================
// MAIN COMPONENT
// =========================================================
const StudentApprovals = () => {
  const [pendingStudents, setPendingStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [filter, setFilter] = useState("all");

  const [rollNo, setRollNo] = useState("");
  const [registrationNo, setRegistrationNo] = useState("");
  const [section, setSection] = useState("");

  const [initialLoading, setInitialLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // =========================================================
  // FETCH
  // =========================================================
  const fetchPendingStudents = useCallback(async () => {
    try {
      setInitialLoading(true);
      const res = await getPendingApplications();

      const list = Array.isArray(res?.applications)
        ? res.applications
        : Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res)
        ? res
        : [];

      setPendingStudents(list);
    } catch (error) {
      console.error("Fetch pending applications error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to load pending students"
      );
      setPendingStudents([]);
    } finally {
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingStudents();
  }, [fetchPendingStudents]);

  // =========================================================
  // OPEN MODAL
  // =========================================================
  const handleApprove = (application) => {
    setSelectedStudent(application);
    setActionType("approve");
    setRollNo(application?.rollNo || "");
    setRegistrationNo(application?.registrationNo || "");
    setSection(application?.section || "");
    setShowModal(true);
  };

  const handleReject = (application) => {
    setSelectedStudent(application);
    setActionType("rejected");
    setRejectReason("");
    setShowModal(true);
  };

  // =========================================================
  // CONFIRM
  // =========================================================
  const confirmAction = async () => {
    if (!selectedStudent || processing) return;

    setProcessing(true);

    try {
      if (actionType === "approve") {
        const payload = {};
        if (rollNo.trim()) payload.rollNo = rollNo.trim();
        if (registrationNo.trim())
          payload.registrationNo = registrationNo.trim();
        if (section.trim()) payload.section = section.trim();

        const res = await approveApplication(selectedStudent._id, payload);

        if (res?.success) {
          toast.success(
            `${getFullName(selectedStudent.student)} has been approved!`
          );
          setPendingStudents((prev) =>
            prev.filter((s) => s._id !== selectedStudent._id)
          );
          setShowModal(false);
          setSelectedStudent(null);
        } else {
          toast.error(res?.message || "Approval failed");
        }
      } else if (actionType === "rejected") {
        if (!rejectReason.trim()) {
          toast.warn("Please enter a rejection reason");
          setProcessing(false);
          return;
        }

        const res = await rejectApplication(
          selectedStudent._id,
          rejectReason.trim()
        );

        if (res?.success) {
          toast.info(
            `${getFullName(selectedStudent.student)} has been rejected`
          );
          setPendingStudents((prev) =>
            prev.filter((s) => s._id !== selectedStudent._id)
          );
          setShowModal(false);
          setRejectReason("");
          setSelectedStudent(null);
        } else {
          toast.error(res?.message || "Rejection failed");
        }
      }
    } catch (error) {
      console.error("Action error:", error);
      toast.error(
        error?.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setProcessing(false);
    }
  };

  // =========================================================
  // FILTER
  // =========================================================
  const filteredStudents =
    filter === "all"
      ? pendingStudents
      : pendingStudents.filter((s) =>
          (s?.departmentId?.name || "")
            .toLowerCase()
            .includes(filter.toLowerCase())
        );

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
          <div className="header-stats">
            <div className="stat-badge">
              <i className="fas fa-hourglass-half"></i>
              <span>{pendingStudents.length} Pending</span>
            </div>
          </div>
        </div>

        {/* FILTER */}
        <div className="filter-section">
          <div className="filter-label">Search by Department:</div>
          <div className="filter-controls">
            <button
              className={`filter-btn ${filter === "all" ? "active" : ""}`}
              onClick={() => setFilter("all")}
            >
              All Departments
            </button>
            <input
              type="text"
              className="search-bar"
              placeholder="Type department name..."
              value={filter === "all" ? "" : filter}
              onChange={(e) => {
                const value = e.target.value;
                setFilter(value === "" ? "all" : value);
              }}
            />
          </div>
        </div>

        {/* GRID */}
        <div className="approvals-grid">
          {filteredStudents.map((app) => {
            const student = app?.student || {};
            const fullName = getFullName(student);

            return (
              <div key={app._id} className="approval-card">
                <div className="card-header">
                  <div className="student-basic-info">
                    <img
                      src={student?.profileImage?.url || "/default-avatar.png"}
                      alt={fullName}
                      className="student-photo"
                    />
                    <div className="student-details">
                      <h3 className="student-name">{fullName}</h3>
                      <p className="student-email">
                        <i className="fas fa-envelope me-2"></i>
                        {getEmail(student)}
                      </p>
                      <p className="student-phone">
                        <i className="fas fa-phone me-2"></i>
                        {getPhone(student)}
                      </p>
                    </div>
                  </div>
                  <div className="time-badge">
                    <i className="far fa-clock me-2"></i>
                    Applied:{" "}
                    {new Date(app.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="card-body">
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
                  <button
                    className="btn-reject"
                    onClick={() => handleReject(app)}
                  >
                    <i className="fas fa-times me-2"></i>
                    Reject
                  </button>
                  <button
                    className="btn-approve"
                    onClick={() => handleApprove(app)}
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
        {filteredStudents.length === 0 && (
          <div className="empty-state">
            <i className="fas fa-check-circle"></i>
            <h3>All Caught Up!</h3>
            <p>There are no pending approvals at the moment.</p>
          </div>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div
          className={`modal-overlay ${processing ? "processing" : ""}`}
          onClick={() => !processing && setShowModal(false)}
        >
          <div
            className="modal-content"
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
                <button
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                >
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>

            {processing ? (
              <div className="modal-body text-center py-5">
                <div className="spinner-border text-primary" role="status" />
                <p className="mt-3">
                  {actionType === "approve"
                    ? "Approving student..."
                    : "Rejecting student..."}
                </p>
              </div>
            ) : (
              <div className="modal-body">
                {actionType === "approve" ? (
                  <div>
                    <p className="mb-3">
                      Approve{" "}
                      <strong>
                        {getFullName(selectedStudent?.student)}
                      </strong>
                      ?
                    </p>

                    <div className="form-group mb-3">
                      <label>Roll Number (optional)</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. CS-2026-001"
                        value={rollNo}
                        onChange={(e) =>
                          setRollNo(e.target.value.toUpperCase())
                        }
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
                        onChange={(e) =>
                          setSection(e.target.value.toUpperCase())
                        }
                      />
                    </div>

                    <div className="alert alert-info">
                      <i className="fas fa-info-circle me-2"></i>
                      Student ko approval email milegi login credentials ke
                      saath.
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="mb-3">
                      Reject{" "}
                      <strong>
                        {getFullName(selectedStudent?.student)}
                      </strong>
                      ?
                    </p>
                    <textarea
                      className="form-control"
                      rows="4"
                      placeholder="Rejection reason..."
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
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
                onClick={() => setShowModal(false)}
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
                    {actionType === "approve"
                      ? "Approving..."
                      : "Rejecting..."}
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