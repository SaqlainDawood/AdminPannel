import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  getStaffApplications,
  getStaffStats,
  approveStaffApplication,
  rejectStaffApplication,
} from "../../../services/staffAdminAPI";

const formatDate = (value) => {
  if (!value) return "N/A";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getApplicantName = (item) =>
  item?.step1_personalInfo?.fullName || item?.email || "Unknown applicant";

const getJobTitle = (item) =>
  item?.step6_applyFor?.jobPost?.title ||
  item?.step6_applyFor?.designation ||
  "Position not specified";

const getDepartment = (item) =>
  item?.step6_applyFor?.department ||
  item?.step6_applyFor?.jobPost?.department ||
  "N/A";

const statusClassMap = {
  pending: "bg-warning text-dark",
  approved: "bg-success",
  rejected: "bg-danger",
  draft: "bg-secondary",
};

const StaffApplications = () => {
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    draft: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [rejectionReasons, setRejectionReasons] = useState({});

  const fetchStats = async () => {
    try {
      const res = await getStaffStats();
      setStats(res?.stats || {
        total: 0,
        draft: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
      });
    } catch (error) {
      console.error("Fetch staff stats error:", error);
    }
  };

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
      };

      if (statusFilter !== "all") {
        params.status = statusFilter;
      }

      if (search.trim()) {
        params.search = search.trim();
      }

      const res = await getStaffApplications(params);
      const list = Array.isArray(res?.staff)
        ? res.staff
        : Array.isArray(res?.data)
        ? res.data
        : [];

      setApplications(list);
      setTotalPages(Number(res?.totalPages || 1));
    } catch (error) {
      console.error("Fetch staff applications error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to load job applications"
      );
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [statusFilter, search, page]);

  const handleApprove = async (application) => {
    if (!application?._id) return;

    setProcessingId(application._id);

    try {
      const payload = {};
      if (application?.step6_applyFor?.roleSlug) {
        payload.roleSlug = application.step6_applyFor.roleSlug;
      }

      const res = await approveStaffApplication(application._id, payload);

      if (res?.success) {
        toast.success(`${getApplicantName(application)} approved successfully`);
        fetchStats();
        fetchApplications();
      } else {
        toast.error(res?.message || "Approval failed");
      }
    } catch (error) {
      console.error("Approve staff application error:", error);
      toast.error(
        error?.response?.data?.message || "Something went wrong while approving"
      );
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (application) => {
    if (!application?._id) return;

    const reason = (rejectionReasons[application._id] || "").trim();
    if (!reason) {
      toast.warn("Please enter a rejection reason");
      return;
    }

    setProcessingId(application._id);

    try {
      const res = await rejectStaffApplication(application._id, reason);

      if (res?.success) {
        toast.info(`${getApplicantName(application)} rejected`);
        setRejectionReasons((prev) => ({ ...prev, [application._id]: "" }));
        fetchStats();
        fetchApplications();
      } else {
        toast.error(res?.message || "Rejection failed");
      }
    } catch (error) {
      console.error("Reject staff application error:", error);
      toast.error(
        error?.response?.data?.message || "Something went wrong while rejecting"
      );
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h2 className="mb-1">Job Applications</h2>
          <small className="text-muted">Review and approve staff applications</small>
        </div>
      </div>

      <div className="row g-3 mb-4">
        {[
          { key: "total", label: "Total", color: "primary" },
          { key: "pending", label: "Pending", color: "warning" },
          { key: "approved", label: "Approved", color: "success" },
          { key: "rejected", label: "Rejected", color: "danger" },
          { key: "draft", label: "Draft", color: "secondary" },
        ].map((item) => (
          <div className="col-md-2 col-sm-6" key={item.key}>
            <div className={`card border-${item.color} shadow-sm h-100`}>
              <div className="card-body text-center">
                <div className={`text-${item.color} fw-bold fs-4`}>{stats[item.key] || 0}</div>
                <div className="text-muted small">{item.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-center">
            <div className="col-md-5">
              <input
                type="text"
                className="form-control"
                placeholder="Search by name or email"
                value={search}
                onChange={(e) => {
                  setPage(1);
                  setSearch(e.target.value);
                }}
              />
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => {
                  setPage(1);
                  setStatusFilter(e.target.value);
                }}
              >
                <option value="all">All statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : applications.length === 0 ? (
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center py-5 text-muted">
            No job applications found.
          </div>
        </div>
      ) : (
        <div className="card border-0 shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Applicant</th>
                  <th>Job</th>
                  <th>Department</th>
                  <th>Applied</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((application) => (
                  <tr key={application._id}>
                    <td>
                      <div className="fw-semibold">{getApplicantName(application)}</div>
                      <small className="text-muted">{application.email}</small>
                    </td>
                    <td>{getJobTitle(application)}</td>
                    <td>{getDepartment(application)}</td>
                    <td>{formatDate(application.createdAt)}</td>
                    <td>
                      <span className={`badge ${statusClassMap[application.applicationStatus] || "bg-secondary"}`}>
                        {application.applicationStatus || "pending"}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex flex-column gap-2">
                        {application.applicationStatus !== "approved" && (
                          <button
                            type="button"
                            className="btn btn-sm btn-success"
                            disabled={processingId === application._id}
                            onClick={() => handleApprove(application)}
                          >
                            <i className="fas fa-check me-1" />
                            {processingId === application._id ? "Processing..." : "Approve"}
                          </button>
                        )}

                        {application.applicationStatus !== "rejected" && (
                          <>
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              placeholder="Rejection reason"
                              value={rejectionReasons[application._id] || ""}
                              onChange={(e) =>
                                setRejectionReasons((prev) => ({
                                  ...prev,
                                  [application._id]: e.target.value,
                                }))
                              }
                            />
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              disabled={processingId === application._id}
                              onClick={() => handleReject(application)}
                            >
                              <i className="fas fa-times me-1" />
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4 gap-2">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
          >
            Previous
          </button>
          <span className="align-self-center text-muted">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={page >= totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default StaffApplications;
