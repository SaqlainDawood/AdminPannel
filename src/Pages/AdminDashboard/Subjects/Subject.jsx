import React, { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  X,
  BookOpen,
  Building2,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Link2,
} from "lucide-react";

import { FaSpinner } from "react-icons/fa";

import {
  getSubjects,
  createSubject,
  updateSubject,
  deactivateSubject,
} from "../../../services/subjectAPI";

import { getDepartments } from "../../../services/departmentAPI";

import "./Subject.css";

const emptyForm = {
  name: "",
  code: "",
  departmentId: "",
  creditHours: 3,
  description: "",
  prerequisites: [], // [{ subjectId, name, code, isMandatory }]
  isActive: true,
};

/* ================= HELPERS ================= */

const getId = (item) => {
  if (!item) return "";
  if (typeof item === "string") return item;
  return item._id || item.id || "";
};

const unwrap = (response) => {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  if (Array.isArray(response.data)) return response.data;
  if (Array.isArray(response.data?.data)) return response.data.data;
  return [];
};

const getErrorMessage = (error) =>
  error?.response?.data?.message ||
  error?.message ||
  "Something went wrong. Please try again.";

const getDepartmentId = (subject) => getId(subject?.departmentId);

const getDepartmentName = (subject, departments) => {
  if (subject?.departmentId?.name) return subject.departmentId.name;
  const dept = departments.find((d) => getId(d) === getDepartmentId(subject));
  return dept?.name || "—";
};

// subject.prerequisites -> [{ subjectId, name, code, isMandatory }]
const normalizePrerequisites = (subject, allSubjects) =>
  (subject?.prerequisites || []).map((p) => {
    const id = getId(p.subjectId);
    const populated = typeof p.subjectId === "object" ? p.subjectId : null;
    const found = populated || allSubjects.find((s) => getId(s) === id);
    return {
      subjectId: id,
      name: found?.name || "Unknown subject",
      code: found?.code || "",
      isMandatory: p.isMandatory !== false,
    };
  });

/* ================= COMPONENT ================= */

export default function Subject() {
  const [subjects, setSubjects] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  const [editingSubject, setEditingSubject] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const [formData, setFormData] = useState(emptyForm);

  // prerequisite picker
  const [showPicker, setShowPicker] = useState(false);
  const [pickerSubjectId, setPickerSubjectId] = useState("");
  const [pickerMandatory, setPickerMandatory] = useState(true);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  /* ---------- FETCH ---------- */

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [subjectsRes, departmentsRes] = await Promise.all([
        getSubjects(),
        getDepartments(),
      ]);

      setSubjects(unwrap(subjectsRes));
      setDepartments(unwrap(departmentsRes));
    } catch (err) {
      console.error("Subject fetch error:", err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ---------- FILTERED LIST ---------- */

  const filteredSubjects = useMemo(() => {
    let result = [...subjects];

    if (statusFilter === "active")
      result = result.filter((s) => s.isActive !== false);
    if (statusFilter === "inactive")
      result = result.filter((s) => s.isActive === false);

    if (departmentFilter !== "all")
      result = result.filter((s) => getDepartmentId(s) === departmentFilter);

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter(
        (s) =>
          s.name?.toLowerCase().includes(q) ||
          s.code?.toLowerCase().includes(q) ||
          getDepartmentName(s, departments).toLowerCase().includes(q)
      );
    }

    return result;
  }, [subjects, searchTerm, statusFilter, departmentFilter, departments]);

  /* ---------- PREREQUISITE OPTIONS (same department only) ---------- */

  const availablePrerequisites = useMemo(() => {
    if (!formData.departmentId) return [];

    const currentId = getId(editingSubject);

    return subjects.filter((s) => {
      const id = getId(s);

      if (getDepartmentId(s) !== formData.departmentId) return false; // same department
      if (s.isActive === false) return false;
      if (id === currentId) return false; // khud apni prerequisite nahi
      if (formData.prerequisites.some((p) => p.subjectId === id)) return false; // already added

      // circular: agar us subject ki apni prerequisite me ye subject hai to skip
      if (
        currentId &&
        (s.prerequisites || []).some((p) => getId(p.subjectId) === currentId)
      )
        return false;

      return true;
    });
  }, [subjects, formData.departmentId, formData.prerequisites, editingSubject]);

  /* ---------- FORM HANDLERS ---------- */

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;

    // department badalne par prerequisites clear (kyunke wo usi department ke hone chahiye)
    if (name === "departmentId") {
      setFormData((prev) => ({
        ...prev,
        departmentId: value,
        prerequisites: [],
      }));
      closePicker();
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const closePicker = () => {
    setShowPicker(false);
    setPickerSubjectId("");
    setPickerMandatory(true);
  };

  const handleAddPrerequisite = () => {
    if (!pickerSubjectId) return;

    const subject = subjects.find((s) => getId(s) === pickerSubjectId);
    if (!subject) return;

    setFormData((prev) => ({
      ...prev,
      prerequisites: [
        ...prev.prerequisites,
        {
          subjectId: pickerSubjectId,
          name: subject.name,
          code: subject.code,
          isMandatory: pickerMandatory,
        },
      ],
    }));

    closePicker();
  };

  const handleRemovePrerequisite = (subjectId) => {
    setFormData((prev) => ({
      ...prev,
      prerequisites: prev.prerequisites.filter((p) => p.subjectId !== subjectId),
    }));
  };

  const handleTogglePrerequisiteType = (subjectId) => {
    setFormData((prev) => ({
      ...prev,
      prerequisites: prev.prerequisites.map((p) =>
        p.subjectId === subjectId ? { ...p, isMandatory: !p.isMandatory } : p
      ),
    }));
  };

  /* ---------- MODALS ---------- */

  const openAddModal = () => {
    setEditingSubject(null);
    setFormData(emptyForm);
    closePicker();
    setError("");
    setSuccessMessage("");
    setShowModal(true);
  };

  const handleEdit = (subject) => {
    setEditingSubject(subject);

    setFormData({
      name: subject.name || "",
      code: subject.code || "",
      departmentId: getDepartmentId(subject),
      creditHours: subject.creditHours ?? 3,
      description: subject.description || "",
      prerequisites: normalizePrerequisites(subject, subjects),
      isActive: subject.isActive !== false,
    });

    closePicker();
    setError("");
    setSuccessMessage("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (formLoading) return;
    setShowModal(false);
    setEditingSubject(null);
    setFormData(emptyForm);
    closePicker();
    setError("");
  };

  const handleView = (subject) => {
    setSelectedSubject(subject);
    setShowViewModal(true);
  };

  /* ---------- VALIDATION ---------- */

  const validateForm = () => {
    if (!formData.name.trim()) return "Subject name is required.";
    if (!formData.code.trim()) return "Subject code is required.";
    if (!formData.departmentId) return "Please select a department.";
    if (!formData.creditHours || Number(formData.creditHours) <= 0)
      return "Credit hours must be greater than 0.";
    return "";
  };

  /* ---------- CREATE / UPDATE ---------- */

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setFormLoading(true);
      setError("");

      const payload = {
        departmentId: formData.departmentId,
        code: formData.code.trim().toUpperCase(),
        name: formData.name.trim(),
        creditHours: Number(formData.creditHours),
        description: formData.description.trim(),
        prerequisites: formData.prerequisites.map((p) => ({
          subjectId: p.subjectId,
          isMandatory: p.isMandatory,
        })),
        isActive: Boolean(formData.isActive),
      };

      if (editingSubject) {
        await updateSubject(getId(editingSubject), payload);
        setSuccessMessage("Subject updated successfully.");
      } else {
        await createSubject(payload);
        setSuccessMessage("Subject created successfully.");
      }

      await fetchData();

      setShowModal(false);
      setEditingSubject(null);
      setFormData(emptyForm);
      closePicker();
    } catch (err) {
      console.error("Subject save error:", err);
      setError(getErrorMessage(err));
    } finally {
      setFormLoading(false);
    }
  };

  /* ---------- DEACTIVATE (soft delete) ---------- */

  const handleDelete = async (subject) => {
    const id = getId(subject);
    if (!id) return;

    if (!window.confirm(`Deactivate "${subject.name}"?`)) return;

    try {
      setError("");
      await deactivateSubject(id);
      setSuccessMessage("Subject deactivated successfully.");
      await fetchData();
    } catch (err) {
      console.error("Subject deactivate error:", err);
      setError(getErrorMessage(err));
    }
  };

  /* ---------- STATS ---------- */

  const totalSubjects = subjects.length;
  const activeSubjects = subjects.filter((s) => s.isActive !== false).length;
  const inactiveSubjects = subjects.filter((s) => s.isActive === false).length;

  /* ================= RENDER ================= */

  return (
    <div className="subject-page">
      {/* HEADER */}
      <div className="subject-header">
        <div className="subject-title-row">
          <div className="subject-title-icon">
            <BookOpen size={24} />
          </div>
          <div>
            <h1>Subjects</h1>
            <p>Manage university subjects, prerequisites and academic information.</p>
          </div>
        </div>

        <button className="subject-add-btn" onClick={openAddModal}>
          <Plus size={18} />
          Add Subject
        </button>
      </div>

      {/* ALERTS */}
      {error && !showModal && (
        <div className="subject-alert subject-alert-error">
          <XCircle size={18} />
          <span>{error}</span>
          <button onClick={() => setError("")}>
            <X size={16} />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="subject-alert subject-alert-success">
          <CheckCircle2 size={18} />
          <span>{successMessage}</span>
          <button onClick={() => setSuccessMessage("")}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* STATS */}
      <div className="subject-stats">
        <div className="subject-stat-card">
          <div className="subject-stat-icon">
            <BookOpen size={21} />
          </div>
          <div>
            <span>Total Subjects</span>
            <strong>{totalSubjects}</strong>
          </div>
        </div>

        <div className="subject-stat-card">
          <div className="subject-stat-icon active">
            <CheckCircle2 size={21} />
          </div>
          <div>
            <span>Active Subjects</span>
            <strong>{activeSubjects}</strong>
          </div>
        </div>

        <div className="subject-stat-card">
          <div className="subject-stat-icon inactive">
            <XCircle size={21} />
          </div>
          <div>
            <span>Inactive Subjects</span>
            <strong>{inactiveSubjects}</strong>
          </div>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="subject-toolbar">
        <div className="subject-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by subject, code, department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm("")}>
              <X size={16} />
            </button>
          )}
        </div>

        <div className="subject-filter">
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
          >
            <option value="all">All Departments</option>
            {departments.map((d) => (
              <option key={getId(d)} value={getId(d)}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <div className="subject-filter">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Subjects</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <button
          className="subject-refresh-btn"
          onClick={fetchData}
          disabled={loading}
          title="Refresh"
        >
          <RefreshCw size={17} className={loading ? "subject-spin" : ""} />
        </button>
      </div>

      {/* TABLE */}
      <div className="subject-table-card">
        <div className="subject-table-header">
          <div>
            <h2>Subject List</h2>
            <span>
              {filteredSubjects.length} subject
              {filteredSubjects.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="subject-loading">
            <div className="subject-spinner-wrapper">
              <FaSpinner className="subject-spinner" size={34} />
            </div>
            <p>Loading subjects...</p>
          </div>
        ) : filteredSubjects.length === 0 ? (
          <div className="subject-empty">
            <div className="subject-empty-icon">
              <BookOpen size={30} />
            </div>
            <h3>No subjects found</h3>
            <p>
              {searchTerm || departmentFilter !== "all"
                ? "Try changing your search or filter."
                : "Start by adding your first subject."}
            </p>
            {!searchTerm && departmentFilter === "all" && (
              <button className="subject-empty-btn" onClick={openAddModal}>
                <Plus size={17} />
                Add Subject
              </button>
            )}
          </div>
        ) : (
          <div className="subject-table-wrapper">
            <table className="subject-table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Code</th>
                  <th>Department</th>
                  <th>Prerequisites</th>
                  <th>Credit Hours</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredSubjects.map((subject) => {
                  const prereqs = normalizePrerequisites(subject, subjects);

                  return (
                    <tr key={getId(subject)}>
                      <td>
                        <div className="subject-name-cell">
                          <div className="subject-row-icon">
                            <BookOpen size={17} />
                          </div>
                          <strong>{subject.name || "—"}</strong>
                        </div>
                      </td>

                      <td>
                        <span className="subject-code">{subject.code || "—"}</span>
                      </td>

                      <td>{getDepartmentName(subject, departments)}</td>

                      <td>
                        {prereqs.length === 0 ? (
                          "—"
                        ) : (
                          <div className="subject-prereq-chips">
                            {prereqs.map((p) => (
                              <span
                                key={p.subjectId}
                                className={`subject-prereq-chip ${
                                  p.isMandatory ? "mandatory" : "optional"
                                }`}
                                title={p.isMandatory ? "Mandatory" : "Recommended"}
                              >
                                {p.code || p.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>

                      <td>
                        <span className="subject-credit">
                          {subject.creditHours ?? "—"}
                        </span>
                      </td>

                      <td>
                        {subject.isActive !== false ? (
                          <span className="subject-status active">
                            <CheckCircle2 size={14} />
                            Active
                          </span>
                        ) : (
                          <span className="subject-status inactive">
                            <XCircle size={14} />
                            Inactive
                          </span>
                        )}
                      </td>

                      <td>
                        <div className="subject-actions">
                          <button
                            className="subject-action-btn view"
                            title="View"
                            onClick={() => handleView(subject)}
                          >
                            <Eye size={16} />
                          </button>

                          <button
                            className="subject-action-btn edit"
                            title="Edit"
                            onClick={() => handleEdit(subject)}
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            className="subject-action-btn delete"
                            title="Deactivate"
                            onClick={() => handleDelete(subject)}
                            disabled={subject.isActive === false}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ================= ADD / EDIT MODAL ================= */}
      {showModal && (
        <div className="subject-modal-overlay">
          <div className="subject-modal">
            <div className="subject-modal-header">
              <div className="subject-modal-title">
                <div className="subject-modal-icon">
                  <BookOpen size={20} />
                </div>
                <div>
                  <h2>{editingSubject ? "Edit Subject" : "Add Subject"}</h2>
                  <p>
                    {editingSubject
                      ? "Update subject information."
                      : "Create a new academic subject."}
                  </p>
                </div>
              </div>

              <button
                className="subject-modal-close"
                onClick={closeModal}
                disabled={formLoading}
              >
                <X size={20} />
              </button>
            </div>

            {error && (
              <div className="subject-form-error">
                <XCircle size={17} />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="subject-modal-body">
                {/* BASIC INFORMATION */}
                <div className="subject-form-section">
                  <div className="subject-section-heading">
                    <BookOpen size={17} />
                    <span>Basic Information</span>
                  </div>

                  <div className="subject-form-grid">
                    <div className="subject-form-group full">
                      <label>
                        Subject Name <span>*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        placeholder="e.g. Data Structures"
                        value={formData.name}
                        onChange={handleFormChange}
                        required
                      />
                    </div>

                    <div className="subject-form-group">
                      <label>
                        Subject Code <span>*</span>
                      </label>
                      <input
                        type="text"
                        name="code"
                        placeholder="e.g. CS-201"
                        value={formData.code}
                        onChange={handleFormChange}
                        required
                      />
                    </div>

                    <div className="subject-form-group">
                      <label>
                        Credit Hours <span>*</span>
                      </label>
                      <input
                        type="number"
                        name="creditHours"
                        min="1"
                        max="10"
                        step="1"
                        value={formData.creditHours}
                        onChange={handleFormChange}
                        required
                      />
                    </div>

                    <div className="subject-form-group full">
                      <label>Description</label>
                      <textarea
                        name="description"
                        rows={3}
                        placeholder="Short description of the subject"
                        value={formData.description}
                        onChange={handleFormChange}
                      />
                    </div>
                  </div>
                </div>

                {/* DEPARTMENT */}
                <div className="subject-form-section">
                  <div className="subject-section-heading">
                    <Building2 size={17} />
                    <span>Department</span>
                  </div>

                  <div className="subject-form-group full">
                    <label>
                      Department <span>*</span>
                    </label>

                    <div className="subject-select-wrapper">
                      <Building2 size={17} />
                      <select
                        name="departmentId"
                        value={formData.departmentId}
                        onChange={handleFormChange}
                        required
                      >
                        <option value="">Select Department</option>
                        {departments
                          .filter((d) => d.isActive !== false)
                          .map((d) => (
                            <option key={getId(d)} value={getId(d)}>
                              {d.name}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* PREREQUISITES */}
                <div className="subject-form-section">
                  <div className="subject-section-heading subject-prereq-heading">
                    <div className="subject-prereq-heading-left">
                      <Link2 size={17} />
                      <span>Prerequisites</span>
                    </div>

                    <button
                      type="button"
                      className="subject-prereq-add-btn"
                      onClick={() => setShowPicker(true)}
                      disabled={!formData.departmentId || showPicker}
                      title={
                        formData.departmentId
                          ? "Add prerequisite"
                          : "Select a department first"
                      }
                    >
                      <Plus size={15} />
                      Add
                    </button>
                  </div>

                  {!formData.departmentId && (
                    <p className="subject-prereq-hint">
                      Select a department first. Only subjects from the same
                      department can be added as prerequisites.
                    </p>
                  )}

                  {/* PICKER */}
                  {showPicker && (
                    <div className="subject-prereq-picker">
                      {availablePrerequisites.length === 0 ? (
                        <p className="subject-prereq-hint">
                          No more subjects available in this department.
                        </p>
                      ) : (
                        <>
                          <select
                            value={pickerSubjectId}
                            onChange={(e) => setPickerSubjectId(e.target.value)}
                          >
                            <option value="">Select subject</option>
                            {availablePrerequisites.map((s) => (
                              <option key={getId(s)} value={getId(s)}>
                                {s.name} ({s.code})
                              </option>
                            ))}
                          </select>

                          <label className="subject-prereq-check">
                            <input
                              type="checkbox"
                              checked={pickerMandatory}
                              onChange={(e) => setPickerMandatory(e.target.checked)}
                            />
                            Mandatory
                          </label>
                        </>
                      )}

                      <div className="subject-prereq-picker-actions">
                        <button
                          type="button"
                          className="subject-cancel-btn"
                          onClick={closePicker}
                        >
                          Cancel
                        </button>

                        <button
                          type="button"
                          className="subject-save-btn"
                          onClick={handleAddPrerequisite}
                          disabled={!pickerSubjectId}
                        >
                          <Plus size={15} />
                          Add
                        </button>
                      </div>
                    </div>
                  )}

                  {/* SELECTED LIST */}
                  {formData.prerequisites.length > 0 && (
                    <ul className="subject-prereq-list">
                      {formData.prerequisites.map((p) => (
                        <li key={p.subjectId}>
                          <div className="subject-prereq-info">
                            <strong>{p.name}</strong>
                            {p.code && <span className="subject-code">{p.code}</span>}
                          </div>

                          <button
                            type="button"
                            className={`subject-prereq-type ${
                              p.isMandatory ? "mandatory" : "optional"
                            }`}
                            onClick={() => handleTogglePrerequisiteType(p.subjectId)}
                            title="Click to toggle"
                          >
                            {p.isMandatory ? "Mandatory" : "Recommended"}
                          </button>

                          <button
                            type="button"
                            className="subject-prereq-remove"
                            onClick={() => handleRemovePrerequisite(p.subjectId)}
                            title="Remove"
                          >
                            <X size={15} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}

                  {formData.departmentId &&
                    formData.prerequisites.length === 0 &&
                    !showPicker && (
                      <p className="subject-prereq-hint">No prerequisites added.</p>
                    )}
                </div>

                {/* STATUS */}
                <div className="subject-form-section">
                  <div className="subject-section-heading">
                    <CheckCircle2 size={17} />
                    <span>Status</span>
                  </div>

                  <label className="subject-toggle">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleFormChange}
                    />
                    <span className="subject-toggle-slider"></span>
                    <span className="subject-toggle-content">
                      <strong>
                        {formData.isActive ? "Active Subject" : "Inactive Subject"}
                      </strong>
                      <small>
                        {formData.isActive
                          ? "This subject is currently active."
                          : "This subject is currently inactive."}
                      </small>
                    </span>
                  </label>
                </div>
              </div>

              {/* FOOTER */}
              <div className="subject-modal-footer">
                <button
                  type="button"
                  className="subject-cancel-btn"
                  onClick={closeModal}
                  disabled={formLoading}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="subject-save-btn"
                  disabled={formLoading}
                >
                  {formLoading ? (
                    <>
                      <FaSpinner size={18} className="subject-button-spinner" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={17} />
                      {editingSubject ? "Update Subject" : "Create Subject"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= VIEW MODAL ================= */}
      {showViewModal && selectedSubject && (
        <div className="subject-modal-overlay">
          <div className="subject-view-modal">
            <div className="subject-modal-header">
              <div className="subject-modal-title">
                <div className="subject-modal-icon">
                  <Eye size={20} />
                </div>
                <div>
                  <h2>Subject Details</h2>
                  <p>View complete subject information.</p>
                </div>
              </div>

              <button
                className="subject-modal-close"
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedSubject(null);
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="subject-view-body">
              <div className="subject-profile-card">
                <div className="subject-profile-icon">
                  <BookOpen size={28} />
                </div>

                <div>
                  <h3>{selectedSubject.name}</h3>
                  <span className="subject-code large">{selectedSubject.code}</span>
                </div>

                <div className="subject-profile-status">
                  {selectedSubject.isActive !== false ? (
                    <span className="subject-status active">
                      <CheckCircle2 size={14} />
                      Active
                    </span>
                  ) : (
                    <span className="subject-status inactive">
                      <XCircle size={14} />
                      Inactive
                    </span>
                  )}
                </div>
              </div>

              <div className="subject-details-grid">
                <div className="subject-detail-card">
                  <Building2 size={19} />
                  <div>
                    <span>Department</span>
                    <strong>{getDepartmentName(selectedSubject, departments)}</strong>
                  </div>
                </div>

                <div className="subject-detail-card">
                  <BookOpen size={19} />
                  <div>
                    <span>Credit Hours</span>
                    <strong>{selectedSubject.creditHours ?? "—"}</strong>
                  </div>
                </div>
              </div>

              {selectedSubject.description && (
                <div className="subject-view-block">
                  <span>Description</span>
                  <p>{selectedSubject.description}</p>
                </div>
              )}

              <div className="subject-view-block">
                <span>Prerequisites</span>

                {normalizePrerequisites(selectedSubject, subjects).length === 0 ? (
                  <p>No prerequisites.</p>
                ) : (
                  <ul className="subject-prereq-list">
                    {normalizePrerequisites(selectedSubject, subjects).map((p) => (
                      <li key={p.subjectId}>
                        <div className="subject-prereq-info">
                          <strong>{p.name}</strong>
                          {p.code && <span className="subject-code">{p.code}</span>}
                        </div>
                        <span
                          className={`subject-prereq-type static ${
                            p.isMandatory ? "mandatory" : "optional"
                          }`}
                        >
                          {p.isMandatory ? "Mandatory" : "Recommended"}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="subject-modal-footer">
              <button
                className="subject-cancel-btn"
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedSubject(null);
                }}
              >
                Close
              </button>

              <button
                className="subject-save-btn"
                onClick={() => {
                  setShowViewModal(false);
                  handleEdit(selectedSubject);
                }}
              >
                <Pencil size={17} />
                Edit Subject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}