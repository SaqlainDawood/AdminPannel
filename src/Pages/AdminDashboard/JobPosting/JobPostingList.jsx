import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Briefcase,
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  RefreshCw,
  MapPin,
  Users,
  Calendar,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import { getJobs, deleteJob } from "../../../services/jobPostingAPI";
import "./JobPosting.css";

const getId = (item) => item?._id || item?.id;

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

const getStatusBadge = (status) => {
  const cfg = {
    open: { className: "jp-badge open", label: "Open" },
    closed: { className: "jp-badge closed", label: "Closed" },
    draft: { className: "jp-badge draft", label: "Draft" },
  };
  const c = cfg[status] || cfg.draft;
  return <span className={c.className}>{c.label}</span>;
};

const JobPostingList = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const navigate = useNavigate();

  const loadJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getJobs();
      const list = Array.isArray(res?.jobs)
        ? res.jobs
        : Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res)
        ? res
        : [];
      setJobs(list);
    } catch (err) {
      console.error("Load jobs error:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load jobs."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const handleDelete = async (job) => {
    const id = getId(job);
    if (!id) return;
    if (!window.confirm(`Delete "${job.title}"?`)) return;

    try {
      await deleteJob(id);
      toast.success("Job deleted successfully");
      await loadJobs();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err?.message || "Delete failed."
      );
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      (job?.title || "").toLowerCase().includes(q) ||
      (job?.department || "").toLowerCase().includes(q) ||
      (job?.city || "").toLowerCase().includes(q);
    const matchStatus =
      filterStatus === "all" || job?.status === filterStatus;
    return matchSearch && matchStatus;
  });

  // Stats
  const totalJobs = jobs.length;
  const openJobs = jobs.filter((j) => j?.status === "open").length;
  const totalVacancies = jobs.reduce(
    (sum, j) => sum + Number(j?.vacancies || 0),
    0
  );

  return (
    <div className="jp-page">
      {/* HEADER */}
      <div className="jp-header">
        <div className="jp-header-left">
          <div className="jp-header-icon">
            <Briefcase size={22} />
          </div>
          <div>
            <h1>Job Postings</h1>
            <p>Manage all job openings and vacancies.</p>
          </div>
        </div>

        <div className="jp-header-actions">
          <button
            className="jp-btn-secondary"
            onClick={loadJobs}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? "spin" : ""} />
            Refresh
          </button>

          <button
            className="jp-btn-primary"
            onClick={() => navigate("/admin/dashboard/jobs/create")}
          >
            <Plus size={17} />
            Create Job
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className="jp-stats">
        <div className="jp-stat">
          <span>Total Jobs</span>
          <strong>{totalJobs}</strong>
        </div>
        <div className="jp-stat">
          <span>Open Positions</span>
          <strong>{openJobs}</strong>
        </div>
        <div className="jp-stat">
          <span>Total Vacancies</span>
          <strong>{totalVacancies}</strong>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="jp-alert error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* MAIN CARD */}
      <div className="jp-card">
        {/* FILTERS */}
        <div className="jp-filters">
          <div className="jp-search">
            <Search size={17} />
            <input
              type="text"
              placeholder="Search by title, department, city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        {/* LIST */}
        {loading ? (
          <div className="jp-loading">
            <Loader2 size={24} className="spin" />
            <span>Loading jobs...</span>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="jp-empty">
            <Briefcase size={40} />
            <h3>No jobs found</h3>
            <p>Try changing filters or create a new job posting.</p>
            <button
              className="jp-btn-primary"
              onClick={() => navigate("/admin/dashboard/jobs/create")}
            >
              <Plus size={16} /> Create First Job
            </button>
          </div>
        ) : (
          <div className="jp-table-wrap">
            <table className="jp-table">
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Department</th>
                  <th>Location</th>
                  <th>Vacancies</th>
                  <th>Deadline</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.map((job) => (
                  <tr key={getId(job)}>
                    <td>
                      <div className="jp-title-cell">
                        <strong>{job?.title || "Untitled"}</strong>
                        <span>{job?.designation || "—"}</span>
                      </div>
                    </td>
                    <td>{job?.department || "—"}</td>
                    <td>
                      <div className="jp-location">
                        <MapPin size={13} />
                        {job?.city || "—"}
                      </div>
                    </td>
                    <td>
                      <div className="jp-vacancy">
                        <Users size={13} />
                        {job?.vacancies || 0}
                      </div>
                    </td>
                    <td>
                      <div className="jp-date">
                        <Calendar size={13} />
                        {fmtDate(job?.deadline)}
                      </div>
                    </td>
                    <td>{getStatusBadge(job?.status)}</td>
                    <td>
                      <div className="jp-row-actions">
                        <button
                          className="view"
                          title="View"
                          onClick={() =>
                            navigate(
                              `/admin/dashboard/jobs/view/${getId(job)}`
                            )
                          }
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          className="edit"
                          title="Edit"
                          onClick={() =>
                            navigate(
                              `/admin/dashboard/jobs/edit/${getId(job)}`
                            )
                          }
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          className="delete"
                          title="Delete"
                          onClick={() => handleDelete(job)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobPostingList;