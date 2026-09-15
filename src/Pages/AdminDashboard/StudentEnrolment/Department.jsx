import React, { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Building2,
  Users,
  X,
} from "lucide-react";
import "./DepartmentManagement.css";

import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "../../../services/departmentAPI";

import { getCampuses } from "../../../services/campusAPI";

const Department = () => {
  const [departments, setDepartments] = useState([]);
  const [campuses, setCampuses] = useState([]);

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);

  const [formData, setFormData] = useState({
    campusId: "",
    name: "",
    code: "",
    description: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState("");

  // =========================
  // GET DEPARTMENTS
  // =========================

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      setApiError("");

      const response = await getDepartments();

      const data = response?.data || response;

      setDepartments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Get Departments Error:", error);

      setDepartments([]);

      setApiError(
        error?.response?.data?.message ||
          "Failed to load departments."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // GET CAMPUSES
  // =========================

  const fetchCampuses = async () => {
    try {
      const response = await getCampuses();

      const data = response?.data || response;

      setCampuses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Get Campuses Error:", error);

      setCampuses([]);

      setApiError(
        error?.response?.data?.message ||
          "Failed to load campuses."
      );
    }
  };

  // =========================
  // INITIAL FETCH
  // =========================

  useEffect(() => {
    fetchDepartments();
    fetchCampuses();
  }, []);

  // =========================
  // SEARCH
  // =========================

  const filteredDepartments = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) return departments;

    return departments.filter((department) => {
      const campusName =
        department.campusId?.name ||
        department.campus?.name ||
        "";

      return (
        department.name?.toLowerCase().includes(value) ||
        department.code?.toLowerCase().includes(value) ||
        department.description
          ?.toLowerCase()
          .includes(value) ||
        campusName.toLowerCase().includes(value)
      );
    });
  }, [departments, search]);

  // =========================
  // INPUT CHANGE
  // =========================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================
  // OPEN ADD MODAL
  // =========================

  const openAddModal = () => {
    setEditingDepartment(null);

    setFormData({
      campusId: "",
      name: "",
      code: "",
      description: "",
    });

    setApiError("");
    setShowModal(true);
  };

  // =========================
  // OPEN EDIT MODAL
  // =========================

  const handleEdit = (department) => {
    setEditingDepartment(department);

    const campusId =
      typeof department.campusId === "object"
        ? department.campusId?._id
        : department.campusId ||
          department.campus?._id ||
          "";

    setFormData({
      campusId,
      name: department.name || "",
      code: department.code || "",
      description: department.description || "",
    });

    setApiError("");
    setShowModal(true);
  };

  // =========================
  // CLOSE MODAL
  // =========================

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingDepartment(null);

    setFormData({
      campusId: "",
      name: "",
      code: "",
      description: "",
    });

    setApiError("");
  };

  // =========================
  // CREATE / UPDATE
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.campusId) {
      setApiError("Please select a campus.");
      return;
    }

    if (!formData.name.trim()) {
      setApiError("Department name is required.");
      return;
    }

    if (!formData.code.trim()) {
      setApiError("Department code is required.");
      return;
    }

    const departmentData = {
      campusId: formData.campusId,
      name: formData.name.trim(),
      code: formData.code.trim().toUpperCase(),
      description: formData.description.trim(),
    };

    try {
      setSaving(true);
      setApiError("");

      // =========================
      // UPDATE
      // =========================

      if (editingDepartment) {
        if (!editingDepartment._id) {
          throw new Error("Department ID is missing.");
        }

        const response = await updateDepartment(
          editingDepartment._id,
          departmentData
        );

        const updatedDepartment =
          response?.data || response;

        setDepartments((prev) =>
          prev.map((department) =>
            department._id === editingDepartment._id
              ? {
                  ...department,
                  ...updatedDepartment,
                  campusId:
                    updatedDepartment?.campusId ||
                    formData.campusId,
                  _id: editingDepartment._id,
                }
              : department
          )
        );
      }

      // =========================
      // CREATE
      // =========================

      else {
        const response = await createDepartment(
          departmentData
        );

        const newDepartment =
          response?.data || response;

        setDepartments((prev) => [
          ...prev,
          newDepartment,
        ]);
      }

      closeModal();
    } catch (error) {
      console.error("Department Save Error:", error);

      setApiError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to save department."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // DELETE
  // =========================

  const handleDelete = async (id) => {
    if (!id) {
      console.error("Department ID is missing.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this department?"
    );

    if (!confirmed) return;

    try {
      await deleteDepartment(id);

      setDepartments((prev) =>
        prev.filter(
          (department) => department._id !== id
        )
      );
    } catch (error) {
      console.error("Delete Department Error:", error);

      alert(
        error?.response?.data?.message ||
          "Failed to delete department."
      );
    }
  };

  return (
    <div className="department-page">

      {/* ================= HEADER ================= */}

      <div className="department-header">
        <div className="department-title-row">

          <div className="department-icon">
            <Building2 size={24} />
          </div>

          <div>
            <h1>Department Management</h1>

            <p>
              Manage university departments and their information
            </p>
          </div>

        </div>

        <button
          className="add-department-btn"
          onClick={openAddModal}
        >
          <Plus size={18} />
          Add Department
        </button>
      </div>

      {/* ================= ERROR ================= */}

      {apiError && (
        <div className="department-api-error">
          {apiError}
        </div>
      )}

      {/* ================= STATS ================= */}

      <div className="department-stats">

        <div className="department-stat-card">
          <div className="stat-content">
            <span>Total Departments</span>
            <strong>{departments.length}</strong>
          </div>

          <div className="stat-icon">
            <Building2 size={22} />
          </div>
        </div>

        <div className="department-stat-card">
          <div className="stat-content">
            <span>Active Departments</span>

            <strong>
              {departments.filter(
                (department) =>
                  department.isActive !== false
              ).length}
            </strong>
          </div>

          <div className="stat-icon">
            <Users size={22} />
          </div>
        </div>

      </div>

      {/* ================= TOOLBAR ================= */}

      <div className="department-toolbar">

        <div className="department-search">
          <Search size={19} />

          <input
            type="text"
            placeholder="Search departments..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />
        </div>

        <span className="department-count">
          {filteredDepartments.length} Departments
        </span>

      </div>

      {/* ================= TABLE ================= */}

      <div className="department-table-card">

        <div className="table-wrapper">

          <table className="department-table">

            <thead>
              <tr>
                <th>Department</th>
                <th>Campus</th>
                <th>Code</th>
                <th>Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {/* LOADING */}

              {loading ? (
                <tr>
                  <td colSpan="6">

                    <div className="department-loading">
                      <div className="loading-spinner"></div>
                      <p>
                        Loading departments...
                      </p>
                    </div>

                  </td>
                </tr>

              ) : filteredDepartments.length > 0 ? (

                filteredDepartments.map(
                  (department) => {

                    const campusName =
                      department.campusId?.name ||
                      department.campus?.name ||
                      (
                        typeof department.campusId ===
                        "string"
                          ? campuses.find(
                              (campus) =>
                                campus._id ===
                                department.campusId
                            )?.name
                          : null
                      ) ||
                      "—";

                    return (
                      <tr
                        key={department._id}
                      >

                        {/* DEPARTMENT */}

                        <td>
                          <div className="department-name-cell">

                            <div className="department-avatar">
                              {department.code
                                ?.substring(0, 2)
                                .toUpperCase()}
                            </div>

                            <div className="department-info">

                              <strong>
                                {department.name}
                              </strong>

                              <small>
                                ID: {department._id}
                              </small>

                            </div>

                          </div>
                        </td>

                        {/* CAMPUS */}

                        <td>
                          <span className="department-campus">
                            <Building2 size={15} />

                            {campusName}
                          </span>
                        </td>

                        {/* CODE */}

                        <td>
                          <span className="department-code">
                            {department.code}
                          </span>
                        </td>

                        {/* DESCRIPTION */}

                        <td>
                          <span className="department-description">
                            {department.description ||
                              "—"}
                          </span>
                        </td>

                        {/* STATUS */}

                        <td>
                          <span className="status-badge">
                            {department.isActive ===
                            false
                              ? "Inactive"
                              : "Active"}
                          </span>
                        </td>

                        {/* ACTIONS */}

                        <td>
                          <div className="department-actions">

                            <button
                              className="edit-btn"
                              title="Edit Department"
                              onClick={() =>
                                handleEdit(
                                  department
                                )
                              }
                            >
                              <Pencil size={17} />
                            </button>

                            <button
                              className="delete-btn"
                              title="Delete Department"
                              onClick={() =>
                                handleDelete(
                                  department._id
                                )
                              }
                            >
                              <Trash2 size={17} />
                            </button>

                          </div>
                        </td>

                      </tr>
                    );
                  }
                )

              ) : (

                /* EMPTY */

                <tr>
                  <td colSpan="6">

                    <div className="empty-departments">

                      <Building2 size={40} />

                      <h3>
                        No departments found
                      </h3>

                      <p>
                        {search
                          ? "Try changing your search."
                          : "Add your first department to get started."}
                      </p>

                    </div>

                  </td>
                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* ================= MODAL ================= */}

      {showModal && (

        <div className="modal-overlay">

          <div className="department-modal">

            {/* MODAL HEADER */}

            <div className="modal-header">

              <div>

                <h2>
                  {editingDepartment
                    ? "Edit Department"
                    : "Add Department"}
                </h2>

                <p>
                  {editingDepartment
                    ? "Update department information"
                    : "Create a new university department"}
                </p>

              </div>

              <button
                className="modal-close"
                onClick={closeModal}
                disabled={saving}
              >
                <X size={20} />
              </button>

            </div>

            {/* FORM */}

            <form onSubmit={handleSubmit}>

              {/* ================= CAMPUS ================= */}

              <div className="form-group">

                <label>
                  Campus
                </label>

                <select
                  name="campusId"
                  value={formData.campusId}
                  onChange={handleChange}
                  required
                  disabled={saving}
                >

                  <option value="">
                    Select Campus
                  </option>

                  {campuses
                    .filter(
                      (campus) =>
                        campus.isActive !== false
                    )
                    .map((campus) => (

                      <option
                        key={campus._id}
                        value={campus._id}
                      >
                        {campus.name} ({campus.code})
                      </option>

                    ))}

                </select>

                {campuses.length === 0 && (
                  <small className="form-help-error">
                    No campuses available. Please create
                    a campus first.
                  </small>
                )}

              </div>

              {/* ================= NAME ================= */}

              <div className="form-group">

                <label>
                  Department Name
                </label>

                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Computer Science"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={saving}
                  required
                />

              </div>

              {/* ================= CODE ================= */}

              <div className="form-group">

                <label>
                  Department Code
                </label>

                <input
                  type="text"
                  name="code"
                  placeholder="e.g. CS"
                  value={formData.code}
                  onChange={handleChange}
                  disabled={saving}
                  required
                />

              </div>

              {/* ================= DESCRIPTION ================= */}

              <div className="form-group">

                <label>
                  Description
                </label>

                <textarea
                  name="description"
                  placeholder="Department description..."
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  disabled={saving}
                  required
                />

              </div>

              {/* ================= ACTIONS ================= */}

              <div className="modal-actions">

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-btn"
                  disabled={
                    saving || campuses.length === 0
                  }
                >

                  {saving ? (
                    "Saving..."
                  ) : (
                    <>
                      <Plus size={18} />

                      {editingDepartment
                        ? "Update Department"
                        : "Add Department"}
                    </>
                  )}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
};

export default Department;