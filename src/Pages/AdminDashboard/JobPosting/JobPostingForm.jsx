
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Save,
  X,
  Loader2,
  AlertCircle,
  Briefcase,
} from "lucide-react";
import { toast } from "react-toastify";

import {
  createJob,
  updateJob,
  getJobById,
} from "../../../services/jobPostingAPI";

import { getRoles } from "../../../services/roleService";

import "./JobPosting.css";

const EMPLOYMENT_TYPES = [
  "Full-time",
  "Part-time",
  "Contract",
  "Internship",
];

const STATUS_OPTIONS = ["draft", "open", "closed"];

const initialForm = {
  title: "",
  description: "",
  roleSlug: "",
  department: "",
  designation: "",
  vacancies: 1,
  employmentType: "Full-time",
  experienceRequired: 0,
  qualification: "",
  salaryRange: {
    min: "",
    max: "",
    negotiable: false,
  },
  city: "",
  campus: "",
  deadline: "",
  joiningDate: "",
  status: "draft",
};

const JobPostingForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const isEdit = Boolean(id);

  const [form, setForm] = useState(initialForm);

  const [roles, setRoles] = useState([]);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [rolesLoading, setRolesLoading] = useState(true);

  const [error, setError] = useState("");

  // --------------------------------------------------
  // LOAD ROLES
  // --------------------------------------------------

  useEffect(() => {
    const loadRoles = async () => {
      try {
        setRolesLoading(true);

        const data = await getRoles();

        console.log("ROLES:", data);

        setRoles(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Load roles error:", err);

        toast.error("Failed to load roles");
        setRoles([]);
      } finally {
        setRolesLoading(false);
      }
    };

    loadRoles();
  }, []);

  // --------------------------------------------------
  // LOAD JOB FOR EDIT
  // --------------------------------------------------

  useEffect(() => {
    if (!isEdit) {
      setFetching(false);
      return;
    }

    const load = async () => {
      try {
        setFetching(true);

        const res = await getJobById(id);

        console.log("JOB RESPONSE:", res);

        const data =
          res?.jobPost ||
          res?.job ||
          res?.data?.jobPost ||
          res?.data?.job ||
          res?.data ||
          res;

        console.log("JOB DATA:", data);

        setForm({
          ...initialForm,
          ...data,

          salaryRange: {
            min: data?.salaryRange?.min ?? "",
            max: data?.salaryRange?.max ?? "",
            negotiable: data?.salaryRange?.negotiable ?? false,
          },

          deadline: data?.deadline
            ? new Date(data.deadline).toISOString().slice(0, 10)
            : "",

          joiningDate: data?.joiningDate
            ? new Date(data.joiningDate).toISOString().slice(0, 10)
            : "",
        });
      } catch (err) {
        console.error(err);

        toast.error("Failed to load job data");
        setError("Failed to load job data");
      } finally {
        setFetching(false);
      }
    };

    load();
  }, [id, isEdit]);

  // --------------------------------------------------
  // NORMAL FIELD CHANGE
  // --------------------------------------------------

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // --------------------------------------------------
  // SALARY CHANGE
  // --------------------------------------------------

  const handleSalaryChange = (field, value) => {
    setForm((prev) => ({
      ...prev,

      salaryRange: {
        ...prev.salaryRange,
        [field]: value,
      },
    }));
  };

  // --------------------------------------------------
  // SUBMIT
  // --------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    // Validation
    if (!form.title.trim()) {
      return setError("Title is required");
    }

    if (!form.description.trim()) {
      return setError("Description is required");
    }

    if (!form.department.trim()) {
      return setError("Department is required");
    }

    if (!form.roleSlug) {
      return setError("Role is required");
    }

    if (!form.deadline) {
      return setError("Deadline is required");
    }

    const payload = {
      ...form,

      vacancies: Number(form.vacancies),

      experienceRequired: Number(form.experienceRequired),

      salaryRange: {
        min: form.salaryRange.min
          ? Number(form.salaryRange.min)
          : 0,

        max: form.salaryRange.max
          ? Number(form.salaryRange.max)
          : 0,

        negotiable: Boolean(
          form.salaryRange.negotiable
        ),
      },

      deadline: new Date(
        form.deadline
      ).toISOString(),

      joiningDate: form.joiningDate
        ? new Date(
            form.joiningDate
          ).toISOString()
        : null,
    };

    try {
      setLoading(true);

      if (isEdit) {
        await updateJob(id, payload);

        toast.success(
          "Job updated successfully"
        );
      } else {
        await createJob(payload);

        toast.success(
          "Job created successfully"
        );
      }

      navigate("/admin/dashboard/jobs");
    } catch (err) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Save failed."
      );

      toast.error("Save failed");
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // FETCHING JOB
  // --------------------------------------------------

  if (fetching) {
    return (
      <div className="jp-loading-page">
        <Loader2
          size={26}
          className="spin"
        />

        <span>
          Loading job details...
        </span>
      </div>
    );
  }

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="jp-page">

      {/* HEADER */}

      <div className="jp-header">

        <div className="jp-header-left">

          <div className="jp-header-icon">
            <Briefcase size={22} />
          </div>

          <div>

            <h1>
              {isEdit
                ? "Edit Job Posting"
                : "Create Job Posting"}
            </h1>

            <p>
              {isEdit
                ? "Update the job details below."
                : "Fill in the details to post a new job."}
            </p>

          </div>

        </div>

        <button
          className="jp-btn-secondary"
          onClick={() =>
            navigate(
              "/admin/dashboard/jobs"
            )
          }
        >
          <X size={16} />

          Cancel
        </button>

      </div>

      {/* ERROR */}

      {error && (
        <div className="jp-alert error">

          <AlertCircle size={18} />

          <span>
            {error}
          </span>

        </div>
      )}

      {/* FORM */}

      <form
        className="jp-form"
        onSubmit={handleSubmit}
      >

        {/* BASIC INFORMATION */}

        <section className="jp-section">

          <h2>
            Basic Information
          </h2>

          <div className="jp-grid-2">

            {/* TITLE */}

            <div className="jp-field">

              <label>
                Job Title <span>*</span>
              </label>

              <input
                type="text"
                value={form.title}
                onChange={(e) =>
                  handleChange(
                    "title",
                    e.target.value
                  )
                }
                placeholder="e.g. Exam Hall Invigilator"
              />

            </div>

            {/* ROLE */}

            <div className="jp-field">

              <label>
                Role <span>*</span>
              </label>

              <select
                value={form.roleSlug}
                onChange={(e) =>
                  handleChange(
                    "roleSlug",
                    e.target.value
                  )
                }
                disabled={rolesLoading}
              >

                <option value="">
                  {rolesLoading
                    ? "Loading roles..."
                    : "Select Role"}
                </option>

                {roles.map((role) => {

                  const roleId =
                    role?._id ||
                    role?.id;

                  const roleSlug =
                    role?.slug ||
                    role?.roleSlug ||
                    role?.name;

                  const roleName =
                    role?.name ||
                    role?.title ||
                    role?.slug;

                  return (
                    <option
                      key={roleId || roleSlug}
                      value={roleSlug}
                    >
                      {roleName}
                    </option>
                  );
                })}

              </select>

            </div>

          </div>

          {/* DESCRIPTION */}

          <div className="jp-field">

            <label>
              Description <span>*</span>
            </label>

            <textarea
              rows="5"
              value={form.description}
              onChange={(e) =>
                handleChange(
                  "description",
                  e.target.value
                )
              }
              placeholder="Describe the job responsibilities..."
            />

          </div>

        </section>

        {/* POSITION */}

        <section className="jp-section">

          <h2>
            Position Details
          </h2>

          <div className="jp-grid-3">

            {/* DEPARTMENT */}

            <div className="jp-field">

              <label>
                Department <span>*</span>
              </label>

              <input
                type="text"
                value={form.department}
                onChange={(e) =>
                  handleChange(
                    "department",
                    e.target.value
                  )
                }
                placeholder="e.g. Examination"
              />

            </div>

            {/* DESIGNATION */}

            <div className="jp-field">

              <label>
                Designation
              </label>

              <input
                type="text"
                value={form.designation}
                onChange={(e) =>
                  handleChange(
                    "designation",
                    e.target.value
                  )
                }
                placeholder="e.g. Invigilator"
              />

            </div>

            {/* VACANCIES */}

            <div className="jp-field">

              <label>
                Vacancies
              </label>

              <input
                type="number"
                min="0"
                value={form.vacancies}
                onChange={(e) =>
                  handleChange(
                    "vacancies",
                    e.target.value
                  )
                }
              />

            </div>

            {/* EMPLOYMENT TYPE */}

            <div className="jp-field">

              <label>
                Employment Type
              </label>

              <select
                value={form.employmentType}
                onChange={(e) =>
                  handleChange(
                    "employmentType",
                    e.target.value
                  )
                }
              >

                {EMPLOYMENT_TYPES.map(
                  (type) => (
                    <option
                      key={type}
                      value={type}
                    >
                      {type}
                    </option>
                  )
                )}

              </select>

            </div>

            {/* EXPERIENCE */}

            <div className="jp-field">

              <label>
                Experience Required (years)
              </label>

              <input
                type="number"
                min="0"
                value={
                  form.experienceRequired
                }
                onChange={(e) =>
                  handleChange(
                    "experienceRequired",
                    e.target.value
                  )
                }
              />

            </div>

            {/* QUALIFICATION */}

            <div className="jp-field">

              <label>
                Qualification
              </label>

              <input
                type="text"
                value={form.qualification}
                onChange={(e) =>
                  handleChange(
                    "qualification",
                    e.target.value
                  )
                }
                placeholder="e.g. Bachelor's degree minimum"
              />

            </div>

          </div>

        </section>

        {/* SALARY */}

        <section className="jp-section">

          <h2>
            Salary Range
          </h2>

          <div className="jp-grid-3">

            <div className="jp-field">

              <label>
                Minimum (PKR)
              </label>

              <input
                type="number"
                min="0"
                value={
                  form.salaryRange.min
                }
                onChange={(e) =>
                  handleSalaryChange(
                    "min",
                    e.target.value
                  )
                }
              />

            </div>

            <div className="jp-field">

              <label>
                Maximum (PKR)
              </label>

              <input
                type="number"
                min="0"
                value={
                  form.salaryRange.max
                }
                onChange={(e) =>
                  handleSalaryChange(
                    "max",
                    e.target.value
                  )
                }
              />

            </div>

            <div className="jp-field jp-checkbox-field">

              <label className="jp-checkbox">

                <input
                  type="checkbox"
                  checked={
                    form.salaryRange
                      .negotiable
                  }
                  onChange={(e) =>
                    handleSalaryChange(
                      "negotiable",
                      e.target.checked
                    )
                  }
                />

                <span>
                  Negotiable
                </span>

              </label>

            </div>

          </div>

        </section>

        {/* LOCATION & DATES */}

        <section className="jp-section">

          <h2>
            Location & Dates
          </h2>

          <div className="jp-grid-2">

            {/* CITY */}

            <div className="jp-field">

              <label>
                City
              </label>

              <input
                type="text"
                value={form.city}
                onChange={(e) =>
                  handleChange(
                    "city",
                    e.target.value
                  )
                }
                placeholder="e.g. Lahore"
              />

            </div>

            {/* CAMPUS */}

            <div className="jp-field">

              <label>
                Campus
              </label>

              <input
                type="text"
                value={form.campus}
                onChange={(e) =>
                  handleChange(
                    "campus",
                    e.target.value
                  )
                }
                placeholder="e.g. Main Campus"
              />

            </div>

            {/* DEADLINE */}

            <div className="jp-field">

              <label>
                Deadline <span>*</span>
              </label>

              <input
                type="date"
                value={form.deadline}
                onChange={(e) =>
                  handleChange(
                    "deadline",
                    e.target.value
                  )
                }
              />

            </div>

            {/* JOINING DATE */}

            <div className="jp-field">

              <label>
                Joining Date
              </label>

              <input
                type="date"
                value={
                  form.joiningDate
                }
                onChange={(e) =>
                  handleChange(
                    "joiningDate",
                    e.target.value
                  )
                }
              />

            </div>

            {/* STATUS */}

            <div className="jp-field">

              <label>
                Status
              </label>

              <select
                value={form.status}
                onChange={(e) =>
                  handleChange(
                    "status",
                    e.target.value
                  )
                }
              >

                {STATUS_OPTIONS.map(
                  (status) => (
                    <option
                      key={status}
                      value={status}
                    >
                      {status
                        .charAt(0)
                        .toUpperCase() +
                        status.slice(1)}
                    </option>
                  )
                )}

              </select>

            </div>

          </div>

        </section>

        {/* ACTIONS */}

        <div className="jp-form-actions">

          <button
            type="button"
            className="jp-btn-secondary"
            onClick={() =>
              navigate(
                "/admin/dashboard/jobs"
              )
            }
          >
            Cancel
          </button>

          <button
            type="submit"
            className="jp-btn-primary"
            disabled={
              loading ||
              rolesLoading
            }
          >

            {loading ? (
              <>
                <Loader2
                  size={16}
                  className="spin"
                />

                Saving...
              </>
            ) : (
              <>
                <Save size={16} />

                {isEdit
                  ? "Update Job"
                  : "Create Job"}
              </>
            )}

          </button>

        </div>

      </form>
    </div>
  );
};

export default JobPostingForm;
