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
  GraduationCap,
  Clock3,
  CalendarDays,
  CheckCircle2,
  XCircle,
  RefreshCw,
} from "lucide-react";

import {
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
} from "../../../services/subjectAPI";

import { getDepartments } from "../../../services/departmentAPI";
import { getDegreeClasses } from "../../../services/degreeClassAPI";
import { getShifts } from "../../../services/shiftAPI";

import "./Subject.css";

const emptyForm = {
  name: "",
  code: "",
  departmentId: "",
  degreeClassId: "",
  semester: "",
  shiftId: "",
  creditHours: 3,
  isActive: true,
};

const getId = (item) => {
  if (!item) return "";
  return item._id || item.id || "";
};

const unwrap = (response) => {
  if (!response) return [];

  if (Array.isArray(response)) return response;

  if (Array.isArray(response.data)) {
    return response.data;
  }

  if (response.data?.data && Array.isArray(response.data.data)) {
    return response.data.data;
  }

  return [];
};

const getErrorMessage = (error) => {
  return (
    error?.response?.data?.message ||
    error?.message ||
    "Something went wrong. Please try again."
  );
};

const getDepartmentId = (subject) => {
  if (!subject) return "";

  if (typeof subject.departmentId === "object") {
    return getId(subject.departmentId);
  }

  if (subject.departmentId) {
    return subject.departmentId;
  }

  if (subject.department) {
    return getId(subject.department);
  }

  return "";
};

const getDegreeClassId = (subject) => {
  if (!subject) return "";

  if (typeof subject.degreeClassId === "object") {
    return getId(subject.degreeClassId);
  }

  if (subject.degreeClassId) {
    return subject.degreeClassId;
  }

  if (subject.degreeClass) {
    return getId(subject.degreeClass);
  }

  return "";
};

const getShiftId = (subject) => {
  if (!subject) return "";

  if (typeof subject.shiftId === "object") {
    return getId(subject.shiftId);
  }

  if (subject.shiftId) {
    return subject.shiftId;
  }

  if (subject.shift) {
    return getId(subject.shift);
  }

  return "";
};

const getDepartmentName = (subject, departments) => {
  if (subject?.departmentId?.name) {
    return subject.departmentId.name;
  }

  if (subject?.department?.name) {
    return subject.department.name;
  }

  const department = departments.find(
    (item) => getId(item) === getDepartmentId(subject)
  );

  return department?.name || "—";
};

const getDegreeClassName = (subject, degreeClasses) => {
  if (subject?.degreeClassId?.name) {
    return subject.degreeClassId.name;
  }

  if (subject?.degreeClass?.name) {
    return subject.degreeClass.name;
  }

  const degreeClass = degreeClasses.find(
    (item) => getId(item) === getDegreeClassId(subject)
  );

  return degreeClass?.name || "—";
};

const getShiftName = (subject, shifts) => {
  if (subject?.shiftId?.name) {
    return subject.shiftId.name;
  }

  if (subject?.shift?.name) {
    return subject.shift.name;
  }

  const shift = shifts.find(
    (item) => getId(item) === getShiftId(subject)
  );

  return shift?.name || "—";
};

export default function Subject() {
  const [subjects, setSubjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [degreeClasses, setDegreeClasses] = useState([]);
  const [shifts, setShifts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  const [editingSubject, setEditingSubject] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const [formData, setFormData] = useState(emptyForm);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // ==========================================
  // FETCH DATA
  // ==========================================

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        subjectsResponse,
        departmentsResponse,
        degreeClassesResponse,
        shiftsResponse,
      ] = await Promise.all([
        getSubjects(),
        getDepartments(),
        getDegreeClasses(),
        getShifts(),
      ]);

      setSubjects(unwrap(subjectsResponse));
      setDepartments(unwrap(departmentsResponse));
      setDegreeClasses(unwrap(degreeClassesResponse));
      setShifts(unwrap(shiftsResponse));
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

  // ==========================================
  // FILTERED DATA
  // ==========================================

  const filteredDegreeClasses = useMemo(() => {
    if (!formData.departmentId) return [];

    return degreeClasses.filter((degreeClass) => {
      if (typeof degreeClass.departmentId === "object") {
        return (
          getId(degreeClass.departmentId) === formData.departmentId
        );
      }

      return degreeClass.departmentId === formData.departmentId;
    });
  }, [degreeClasses, formData.departmentId]);

  const filteredShifts = useMemo(() => {
    if (!formData.degreeClassId) return [];

    return shifts.filter((shift) => {
      if (typeof shift.degreeClassId === "object") {
        return (
          getId(shift.degreeClassId) === formData.degreeClassId
        );
      }

      return shift.degreeClassId === formData.degreeClassId;
    });
  }, [shifts, formData.degreeClassId]);

  const filteredSubjects = useMemo(() => {
    let result = [...subjects];

    if (statusFilter === "active") {
      result = result.filter((subject) => subject.isActive !== false);
    }

    if (statusFilter === "inactive") {
      result = result.filter((subject) => subject.isActive === false);
    }

    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase().trim();

      result = result.filter((subject) => {
        const departmentName = getDepartmentName(
          subject,
          departments
        );

        const degreeClassName = getDegreeClassName(
          subject,
          degreeClasses
        );

        const shiftName = getShiftName(subject, shifts);

        return (
          subject.name?.toLowerCase().includes(search) ||
          subject.code?.toLowerCase().includes(search) ||
          departmentName.toLowerCase().includes(search) ||
          degreeClassName.toLowerCase().includes(search) ||
          shiftName.toLowerCase().includes(search)
        );
      });
    }

    return result;
  }, [
    subjects,
    searchTerm,
    statusFilter,
    departments,
    degreeClasses,
    shifts,
  ]);

  // ==========================================
  // FORM
  // ==========================================

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "departmentId") {
      setFormData((prev) => ({
        ...prev,
        departmentId: value,
        degreeClassId: "",
        shiftId: "",
      }));

      return;
    }

    if (name === "degreeClassId") {
      setFormData((prev) => ({
        ...prev,
        degreeClassId: value,
        shiftId: "",
      }));

      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ==========================================
  // OPEN ADD MODAL
  // ==========================================

  const openAddModal = () => {
    setEditingSubject(null);
    setFormData(emptyForm);
    setError("");
    setSuccessMessage("");
    setShowModal(true);
  };

  // ==========================================
  // OPEN EDIT MODAL
  // ==========================================

  const handleEdit = (subject) => {
    setEditingSubject(subject);

    setFormData({
      name: subject.name || "",
      code: subject.code || "",
      departmentId: getDepartmentId(subject),
      degreeClassId: getDegreeClassId(subject),
      semester: subject.semester ?? "",
      shiftId: getShiftId(subject),
      creditHours: subject.creditHours ?? 3,
      isActive: subject.isActive !== false,
    });

    setError("");
    setSuccessMessage("");
    setShowModal(true);
  };

  // ==========================================
  // CLOSE MODAL
  // ==========================================

  const closeModal = () => {
    if (formLoading) return;

    setShowModal(false);
    setEditingSubject(null);
    setFormData(emptyForm);
    setError("");
  };

  // ==========================================
  // VALIDATION
  // ==========================================

  const validateForm = () => {
    if (!formData.name.trim()) {
      return "Subject name is required.";
    }

    if (!formData.code.trim()) {
      return "Subject code is required.";
    }

    if (!formData.departmentId) {
      return "Please select a department.";
    }

    if (!formData.degreeClassId) {
      return "Please select a degree class.";
    }

    if (!formData.semester) {
      return "Please select a semester.";
    }

    if (!formData.shiftId) {
      return "Please select a shift.";
    }

    if (!formData.creditHours || Number(formData.creditHours) <= 0) {
      return "Credit hours must be greater than 0.";
    }

    return "";
  };

  // ==========================================
  // CREATE / UPDATE
  // ==========================================

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
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        departmentId: formData.departmentId,
        degreeClassId: formData.degreeClassId,
        semester: Number(formData.semester),
        shift: formData.shiftId,
        creditHours: Number(formData.creditHours),
        isActive: Boolean(formData.isActive),
      };

      console.log("Subject payload:", payload);

      if (editingSubject) {
        const id = getId(editingSubject);

        await updateSubject(id, payload);

        setSuccessMessage("Subject updated successfully.");
      } else {
        await createSubject(payload);

        setSuccessMessage("Subject created successfully.");
      }

      await fetchData();

      setShowModal(false);
      setEditingSubject(null);
      setFormData(emptyForm);
    } catch (err) {
      console.error("Subject save error:", err);
      setError(getErrorMessage(err));
    } finally {
      setFormLoading(false);
    }
  };

  // ==========================================
  // DELETE
  // ==========================================

  const handleDelete = async (subject) => {
    const id = getId(subject);

    if (!id) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${subject.name}"?`
    );

    if (!confirmed) return;

    try {
      setError("");

      await deleteSubject(id);

      setSuccessMessage("Subject deleted successfully.");

      await fetchData();
    } catch (err) {
      console.error("Subject delete error:", err);
      setError(getErrorMessage(err));
    }
  };

  // ==========================================
  // VIEW
  // ==========================================

  const handleView = (subject) => {
    setSelectedSubject(subject);
    setShowViewModal(true);
  };

  // ==========================================
  // STATS
  // ==========================================

  const totalSubjects = subjects.length;

  const activeSubjects = subjects.filter(
    (subject) => subject.isActive !== false
  ).length;

  const inactiveSubjects = subjects.filter(
    (subject) => subject.isActive === false
  ).length;

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="subject-page">
      {/* HEADER */}
      <div className="subject-header">
        <div>
          <div className="subject-title-row">
            <div className="subject-title-icon">
              <BookOpen size={24} />
            </div>

            <div>
              <h1>Subjects</h1>
              <p>
                Manage university subjects, courses and academic
                information.
              </p>
            </div>
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
          <RefreshCw
            size={17}
            className={loading ? "subject-spin" : ""}
          />
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
            <RefreshCw size={28} className="subject-spin" />
            <p>Loading subjects...</p>
          </div>
        ) : filteredSubjects.length === 0 ? (
          <div className="subject-empty">
            <div className="subject-empty-icon">
              <BookOpen size={30} />
            </div>

            <h3>No subjects found</h3>

            <p>
              {searchTerm
                ? "Try changing your search or filter."
                : "Start by adding your first subject."}
            </p>

            {!searchTerm && (
              <button
                className="subject-empty-btn"
                onClick={openAddModal}
              >
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
                  <th>Degree Class</th>
                  <th>Semester</th>
                  <th>Shift</th>
                  <th>Credit Hours</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredSubjects.map((subject) => (
                  <tr key={getId(subject)}>
                    <td>
                      <div className="subject-name-cell">
                        <div className="subject-row-icon">
                          <BookOpen size={17} />
                        </div>

                        <div>
                          <strong>{subject.name || "—"}</strong>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="subject-code">
                        {subject.code || "—"}
                      </span>
                    </td>

                    <td>
                      {getDepartmentName(subject, departments)}
                    </td>

                    <td>
                      {getDegreeClassName(subject, degreeClasses)}
                    </td>

                    <td>
                      <span className="subject-semester">
                        Semester {subject.semester || "—"}
                      </span>
                    </td>

                    <td>
                      <span className="subject-shift">
                        {getShiftName(subject, shifts)}
                      </span>
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
                          title="Delete"
                          onClick={() => handleDelete(subject)}
                        >
                          <Trash2 size={16} />
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

      {/* ==========================================
          ADD / EDIT MODAL
      ========================================== */}

      {showModal && (
        <div className="subject-modal-overlay">
          <div className="subject-modal">
            <div className="subject-modal-header">
              <div>
                <div className="subject-modal-title">
                  <div className="subject-modal-icon">
                    <BookOpen size={20} />
                  </div>

                  <div>
                    <h2>
                      {editingSubject
                        ? "Edit Subject"
                        : "Add Subject"}
                    </h2>

                    <p>
                      {editingSubject
                        ? "Update subject information."
                        : "Create a new academic subject."}
                    </p>
                  </div>
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
                        placeholder="e.g. Database Management Systems"
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
                        placeholder="e.g. CS-302"
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
                  </div>
                </div>

                {/* ACADEMIC INFORMATION */}
                <div className="subject-form-section">
                  <div className="subject-section-heading">
                    <GraduationCap size={17} />
                    <span>Academic Information</span>
                  </div>

                  <div className="subject-form-grid">
                    <div className="subject-form-group">
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
                          <option value="">
                            Select Department
                          </option>

                          {departments
                            .filter(
                              (department) =>
                                department.isActive !== false
                            )
                            .map((department) => (
                              <option
                                key={getId(department)}
                                value={getId(department)}
                              >
                                {department.name}
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>

                    <div className="subject-form-group">
                      <label>
                        Degree Class <span>*</span>
                      </label>

                      <div className="subject-select-wrapper">
                        <GraduationCap size={17} />

                        <select
                          name="degreeClassId"
                          value={formData.degreeClassId}
                          onChange={handleFormChange}
                          disabled={!formData.departmentId}
                          required
                        >
                          <option value="">
                            {formData.departmentId
                              ? "Select Degree Class"
                              : "Select Department First"}
                          </option>

                          {filteredDegreeClasses
                            .filter(
                              (degreeClass) =>
                                degreeClass.isActive !== false
                            )
                            .map((degreeClass) => (
                              <option
                                key={getId(degreeClass)}
                                value={getId(degreeClass)}
                              >
                                {degreeClass.name}
                                {degreeClass.code
                                  ? ` (${degreeClass.code})`
                                  : ""}
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>

                    <div className="subject-form-group">
                      <label>
                        Semester <span>*</span>
                      </label>

                      <div className="subject-select-wrapper">
                        <CalendarDays size={17} />

                        <select
                          name="semester"
                          value={formData.semester}
                          onChange={handleFormChange}
                          required
                        >
                          <option value="">
                            Select Semester
                          </option>

                          {Array.from(
                            { length: 12 },
                            (_, index) => index + 1
                          ).map((semester) => (
                            <option
                              key={semester}
                              value={semester}
                            >
                              Semester {semester}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="subject-form-group">
                      <label>
                        Shift <span>*</span>
                      </label>

                      <div className="subject-select-wrapper">
                        <Clock3 size={17} />

                        <select
                          name="shiftId"
                          value={formData.shiftId}
                          onChange={handleFormChange}
                          disabled={!formData.degreeClassId}
                          required
                        >
                          <option value="">
                            {formData.degreeClassId
                              ? "Select Shift"
                              : "Select Degree Class First"}
                          </option>

                          {filteredShifts
                            .filter(
                              (shift) =>
                                shift.isActive !== false
                            )
                            .map((shift) => (
                              <option
                                key={getId(shift)}
                                value={getId(shift)}
                              >
                                {shift.name}
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>
                  </div>
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
                        {formData.isActive
                          ? "Active Subject"
                          : "Inactive Subject"}
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

              {/* MODAL FOOTER */}
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
                      <RefreshCw
                        size={17}
                        className="subject-spin"
                      />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={17} />
                      {editingSubject
                        ? "Update Subject"
                        : "Create Subject"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          VIEW MODAL
      ========================================== */}

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

                  <span className="subject-code large">
                    {selectedSubject.code}
                  </span>
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
                    <strong>
                      {getDepartmentName(
                        selectedSubject,
                        departments
                      )}
                    </strong>
                  </div>
                </div>

                <div className="subject-detail-card">
                  <GraduationCap size={19} />
                  <div>
                    <span>Degree Class</span>
                    <strong>
                      {getDegreeClassName(
                        selectedSubject,
                        degreeClasses
                      )}
                    </strong>
                  </div>
                </div>

                <div className="subject-detail-card">
                  <CalendarDays size={19} />
                  <div>
                    <span>Semester</span>
                    <strong>
                      Semester {selectedSubject.semester || "—"}
                    </strong>
                  </div>
                </div>

                <div className="subject-detail-card">
                  <Clock3 size={19} />
                  <div>
                    <span>Shift</span>
                    <strong>
                      {getShiftName(selectedSubject, shifts)}
                    </strong>
                  </div>
                </div>

                <div className="subject-detail-card">
                  <BookOpen size={19} />
                  <div>
                    <span>Credit Hours</span>
                    <strong>
                      {selectedSubject.creditHours ?? "—"}
                    </strong>
                  </div>
                </div>
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