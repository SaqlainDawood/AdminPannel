import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Briefcase,
  MapPin,
  Users,
  Calendar,
  DollarSign,
  GraduationCap,
  Clock,
  Building2,
  Loader2,
  Pencil,
} from "lucide-react";
import { getJobById } from "../../../services/jobPostingAPI";
import "./JobPosting.css";

const fmtDate = (val) => {
  if (!val) return "—";
  try {
    return new Date(val).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return val;
  }
};

const fmtSalary = (range) => {
  if (!range) return "—";
  const min = Number(range.min || 0);
  const max = Number(range.max || 0);
  if (!min && !max) return "—";

  const minStr = `PKR ${min.toLocaleString()}`;
  const maxStr = `PKR ${max.toLocaleString()}`;
  const neg = range.negotiable ? " (Negotiable)" : "";

  if (min && max) return `${minStr} - ${maxStr}${neg}`;
  if (min) return `From ${minStr}${neg}`;
  return `Up to ${maxStr}${neg}`;
};

const JobPostingView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await getJobById(id);
        setJob(res?.job || res?.data || res);
      } catch (err) {
        console.error(err);
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load job."
        );
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  if (loading) {
    return (
      <div className="jp-loading-page">
        <Loader2 size={26} className="spin" />
        <span>Loading job details...</span>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="jp-page">
        <div className="jp-alert error">
          {error || "Job not found."}
        </div>
        <button
          className="jp-btn-secondary"
          onClick={() => navigate("/admin/dashboard/jobs")}
        >
          <ArrowLeft size={16} /> Back to Jobs
        </button>
      </div>
    );
  }

  const statusClass = `jp-badge ${job?.status || "draft"}`;

  return (
    <div className="jp-page">
      {/* HEADER */}
      <div className="jp-header">
        <div className="jp-header-left">
          <div className="jp-header-icon">
            <Briefcase size={22} />
          </div>
          <div>
            <h1>{job.title}</h1>
            <p>{job.designation || "Position details"}</p>
          </div>
        </div>

        <div className="jp-header-actions">
          <button
            className="jp-btn-secondary"
            onClick={() => navigate("/admin/dashboard/jobs")}
          >
            <ArrowLeft size={16} /> Back
          </button>
          <button
            className="jp-btn-primary"
            onClick={() => navigate(`/admin/dashboard/jobs/edit/${id}`)}
          >
            <Pencil size={16} /> Edit
          </button>
        </div>
      </div>

      {/* HERO */}
      <div className="jp-view-hero">
        <div>
          <span className={statusClass}>
            {job.status?.toUpperCase() || "DRAFT"}
          </span>
        </div>
        <div className="jp-view-meta">
          <div>
            <span>Employment Type</span>
            <strong>{job.employmentType || "—"}</strong>
          </div>
          <div>
            <span>Vacancies</span>
            <strong>{job.vacancies || 0}</strong>
          </div>
          <div>
            <span>Experience</span>
            <strong>
              {job.experienceRequired
                ? `${job.experienceRequired}+ years`
                : "Fresh"}
            </strong>
          </div>
        </div>
      </div>

      {/* CARDS */}
      <div className="jp-view-grid">
        {/* LEFT */}
        <div className="jp-view-main">
          <div className="jp-view-card">
            <h3>Description</h3>
            <p className="jp-view-desc">
              {job.description || "No description provided."}
            </p>
          </div>

          <div className="jp-view-card">
            <h3>Requirements</h3>
            <div className="jp-view-row">
              <GraduationCap size={17} />
              <div>
                <span>Qualification</span>
                <strong>{job.qualification || "—"}</strong>
              </div>
            </div>
            <div className="jp-view-row">
              <Clock size={17} />
              <div>
                <span>Experience Required</span>
                <strong>
                  {job.experienceRequired
                    ? `${job.experienceRequired} years`
                    : "Fresh / No experience"}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="jp-view-side">
          <div className="jp-view-card">
            <h3>Job Info</h3>

            <div className="jp-view-row">
              <Building2 size={17} />
              <div>
                <span>Department</span>
                <strong>{job.department || "—"}</strong>
              </div>
            </div>

            <div className="jp-view-row">
              <MapPin size={17} />
              <div>
                <span>Location</span>
                <strong>
                  {job.city || "—"}
                  {job.campus ? ` — ${job.campus}` : ""}
                </strong>
              </div>
            </div>

            <div className="jp-view-row">
              <Users size={17} />
              <div>
                <span>Vacancies</span>
                <strong>{job.vacancies || 0}</strong>
              </div>
            </div>

            <div className="jp-view-row">
              <DollarSign size={17} />
              <div>
                <span>Salary</span>
                <strong>{fmtSalary(job.salaryRange)}</strong>
              </div>
            </div>

            <div className="jp-view-row">
              <Calendar size={17} />
              <div>
                <span>Deadline</span>
                <strong>{fmtDate(job.deadline)}</strong>
              </div>
            </div>

            <div className="jp-view-row">
              <Calendar size={17} />
              <div>
                <span>Joining Date</span>
                <strong>{fmtDate(job.joiningDate)}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobPostingView;