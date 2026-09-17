import React, { useEffect, useState } from "react";
import {
  getCampuses,
  createCampus,
  updateCampus,
  deleteCampus,
} from "../../../services/campusAPI";
import { toast } from "react-toastify";
import {
  FaSpinner,
  FaUniversity,
  FaCheckCircle,
  FaPauseCircle,
  FaMapMarkerAlt,
  FaEye,
  FaEdit,
  FaTrash,
  FaTimes,
  FaPlus,
} from "react-icons/fa";
import "./Campus.css";

const initialFormData = {
  name: "",
  code: "",
  location: "",
  description: "",
  isActive: true,
};

export default function Campus() {
  const [campuses, setCampuses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  const [editingCampus, setEditingCampus] = useState(null);
  const [viewingCampus, setViewingCampus] = useState(null);

  const [formData, setFormData] = useState(initialFormData);
  const [submitting, setSubmitting] = useState(false);

  // ==========================================
  // FETCH CAMPUSES
  // ==========================================

  const fetchCampuses = async () => {
    try {
      setLoading(true);

      const response = await getCampuses();

      if (response?.success) {
        setCampuses(response.data || []);
      } else {
        toast.error(response?.message || "Failed to fetch campuses");
      }
    } catch (error) {
      console.error("Fetch campuses error:", error);

      toast.error(
        error?.response?.data?.message || "Failed to fetch campuses"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampuses();
  }, []);

  // ==========================================
  // HANDLE INPUT
  // ==========================================

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ==========================================
  // OPEN ADD MODAL
  // ==========================================

  const handleAdd = () => {
    setEditingCampus(null);
    setFormData({ ...initialFormData });
    setShowModal(true);
  };

  // ==========================================
  // OPEN EDIT MODAL
  // ==========================================

  const handleEdit = (campus) => {
    setEditingCampus(campus);

    setFormData({
      name: campus.name || "",
      code: campus.code || "",
      location: campus.location || "",
      description: campus.description || "",
      isActive: campus.isActive ?? true,
    });

    setShowModal(true);
  };

  // ==========================================
  // CLOSE MODAL
  // ==========================================

  const handleCloseModal = () => {
    if (submitting) return;

    setShowModal(false);
    setEditingCampus(null);
    setFormData({ ...initialFormData });
  };

  // ==========================================
  // SUBMIT FORM
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Campus name is required");
      return;
    }

    if (!formData.code.trim()) {
      toast.error("Campus code is required");
      return;
    }

    if (!formData.location.trim()) {
      toast.error("Campus location is required");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        location: formData.location.trim(),
        description: formData.description.trim(),
        isActive: formData.isActive,
      };

      let response;

      // UPDATE
      if (editingCampus) {
        response = await updateCampus(editingCampus._id, payload);
      }

      // CREATE
      else {
        response = await createCampus(payload);
      }

      if (response?.success) {
        toast.success(
          editingCampus
            ? "Campus updated successfully"
            : "Campus created successfully"
        );

        handleCloseModal();
        await fetchCampuses();
      } else {
        toast.error(
          response?.message ||
            (editingCampus
              ? "Failed to update campus"
              : "Failed to create campus")
        );
      }
    } catch (error) {
      console.error("Campus submit error:", error);

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Something went wrong";

      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================
  // DELETE CAMPUS
  // ==========================================

  const handleDelete = async (campus) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${campus.name}"?`
    );

    if (!confirmed) return;

    try {
      const response = await deleteCampus(campus._id);

      if (response?.success) {
        toast.success("Campus deleted successfully");
        await fetchCampuses();
      } else {
        toast.error(response?.message || "Failed to delete campus");
      }
    } catch (error) {
      console.error("Delete campus error:", error);

      toast.error(
        error?.response?.data?.message || "Failed to delete campus"
      );
    }
  };

  // ==========================================
  // VIEW CAMPUS
  // ==========================================

  const handleView = (campus) => {
    setViewingCampus(campus);
    setShowViewModal(true);
  };

  // ==========================================
  // CLOSE VIEW MODAL
  // ==========================================

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setViewingCampus(null);
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="campus-page">
      {/* ======================================
          HEADER
      ====================================== */}

      <div className="campus-header">
        <div>
          <h1>Campus Management</h1>

          <p>Manage university campuses and their information</p>
        </div>

        <button className="campus-add-btn" onClick={handleAdd}>
          <FaPlus />
          <span>Add Campus</span>
        </button>
      </div>

      {/* ======================================
          STATS
      ====================================== */}

      <div className="campus-stats">
        {/* Total */}
        <div className="campus-stat-card">
          <div className="campus-stat-icon total">
            <FaUniversity />
          </div>

          <div>
            <span>Total Campuses</span>
            <strong>{campuses.length}</strong>
          </div>
        </div>

        {/* Active */}
        <div className="campus-stat-card">
          <div className="campus-stat-icon active">
            <FaCheckCircle />
          </div>

          <div>
            <span>Active Campuses</span>

            <strong>
              {campuses.filter((campus) => campus.isActive).length}
            </strong>
          </div>
        </div>

        {/* Inactive */}
        <div className="campus-stat-card">
          <div className="campus-stat-icon inactive">
            <FaPauseCircle />
          </div>

          <div>
            <span>Inactive Campuses</span>

            <strong>
              {campuses.filter((campus) => !campus.isActive).length}
            </strong>
          </div>
        </div>
      </div>

      {/* ======================================
          TABLE CARD
      ====================================== */}

      <div className="campus-card">
        <div className="campus-card-header">
          <div>
            <h2>All Campuses</h2>

            <p>View and manage all registered campuses</p>
          </div>

          <div className="campus-count">
            {campuses.length}{" "}
            {campuses.length === 1 ? "Campus" : "Campuses"}
          </div>
        </div>

        <div className="campus-table-wrapper">
          {/* ==================================
              LOADING
          ================================== */}

          {loading ? (
            <div className="campus-loading">
              <FaSpinner className="spinner" size={40} />

              <p className="loading-text">Loading campuses...</p>
            </div>
          ) : campuses.length === 0 ? (
            /* ==================================
               EMPTY STATE
            ================================== */

            <div className="campus-empty">
              <div className="campus-empty-icon">
                <FaUniversity />
              </div>

              <h3>No campuses found</h3>

              <p>Add your first campus to get started.</p>

              <button className="campus-add-btn" onClick={handleAdd}>
                <FaPlus />
                <span>Add Campus</span>
              </button>
            </div>
          ) : (
            /* ==================================
               TABLE
            ================================== */

            <table className="campus-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Campus Name</th>
                  <th>Code</th>
                  <th>Location</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {campuses.map((campus, index) => (
                  <tr key={campus._id}>
                    {/* Number */}

                    <td>
                      <span className="campus-number">{index + 1}</span>
                    </td>

                    {/* Campus Name */}

                    <td>
                      <div className="campus-name-cell">
                        <div className="campus-avatar">
                          {campus.name
                            ?.charAt(0)
                            ?.toUpperCase()}
                        </div>

                        <div>
                          <strong>{campus.name}</strong>

                          <small>Campus</small>
                        </div>
                      </div>
                    </td>

                    {/* Code */}

                    <td>
                      <span className="campus-code">
                        {campus.code}
                      </span>
                    </td>

                    {/* Location */}

                    <td>
                      <div className="campus-location">
                        <FaMapMarkerAlt />
                        <span>{campus.location}</span>
                      </div>
                    </td>

                    {/* Description */}

                    <td>
                      <span className="campus-description">
                        {campus.description || "—"}
                      </span>
                    </td>

                    {/* Status */}

                    <td>
                      <span
                        className={`campus-status ${
                          campus.isActive ? "active" : "inactive"
                        }`}
                      >
                        <span className="status-dot"></span>

                        {campus.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                   
{/* Actions */}

<td>
  <div className="campus-actions">
    <button
      type="button"
      className="action-btn view"
      onClick={() => handleView(campus)}
      title="View Campus"
      aria-label={`View ${campus.name}`}
    >
      <FaEye size={16} />
    </button>

    <button
      type="button"
      className="action-btn edit"
      onClick={() => handleEdit(campus)}
      title="Edit Campus"
      aria-label={`Edit ${campus.name}`}
    >
      <FaEdit size={16} />
    </button>

    <button
      type="button"
      className="action-btn delete"
      onClick={() => handleDelete(campus)}
      title="Delete Campus"
      aria-label={`Delete ${campus.name}`}
    >
      <FaTrash size={16} />
    </button>
  </div>
</td>


                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ======================================
          ADD / EDIT MODAL
      ====================================== */}

      {showModal && (
        <div
          className="campus-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseModal();
            }
          }}
        >
          <div className="campus-modal">
            {/* Modal Header */}

            <div className="campus-modal-header">
              <div>
                <h2>
                  {editingCampus ? "Edit Campus" : "Add New Campus"}
                </h2>

                <p>
                  {editingCampus
                    ? "Update campus information"
                    : "Enter campus information below"}
                </p>
              </div>

              <button
                className="campus-close-btn"
                onClick={handleCloseModal}
                disabled={submitting}
                type="button"
                title="Close"
              >
                <FaTimes />
              </button>
            </div>

            {/* Form */}

            <form className="campus-form" onSubmit={handleSubmit}>
              {/* Name */}

              <div className="campus-form-group">
                <label>
                  Campus Name
                  <span>*</span>
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter campus name"
                  disabled={submitting}
                  required
                />
              </div>

              {/* Code */}

              <div className="campus-form-group">
                <label>
                  Campus Code
                  <span>*</span>
                </label>

                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  placeholder="e.g. MC"
                  maxLength={10}
                  disabled={submitting}
                  required
                />

                <small>
                  A unique short code for this campus.
                </small>
              </div>

              {/* Location */}

              <div className="campus-form-group">
                <label>
                  Location
                  <span>*</span>
                </label>

                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Multan"
                  disabled={submitting}
                  required
                />
              </div>

              {/* Description */}

              <div className="campus-form-group">
                <label>Description</label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter campus description"
                  rows="4"
                  disabled={submitting}
                />
              </div>

              {/* Status */}

              <div className="campus-status-field">
                <div>
                  <label className="status-label">
                    Campus Status
                  </label>

                  <p>
                    Set whether this campus is currently active.
                  </p>
                </div>

                <label className="campus-switch">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    disabled={submitting}
                  />

                  <span className="campus-slider"></span>
                </label>

                <span
                  className={`switch-text ${
                    formData.isActive ? "active" : "inactive"
                  }`}
                >
                  {formData.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              {/* Buttons */}

              <div className="campus-modal-footer">
                <button
                  type="button"
                  className="campus-cancel-btn"
                  onClick={handleCloseModal}
                  disabled={submitting}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="campus-submit-btn"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <FaSpinner className="button-spinner-icon" />

                      {editingCampus
                        ? "Updating..."
                        : "Creating..."}
                    </>
                  ) : (
                    <>
                      {editingCampus ? (
                        <>
                          <FaEdit />
                          Update Campus
                        </>
                      ) : (
                        <>
                          <FaPlus />
                          Create Campus
                        </>
                      )}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================
          VIEW MODAL
      ====================================== */}

      {showViewModal && viewingCampus && (
        <div
          className="campus-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseViewModal();
            }
          }}
        >
          <div className="campus-view-modal">
            {/* Header */}

            <div className="campus-modal-header">
              <div>
                <h2>Campus Details</h2>

                <p>View complete campus information</p>
              </div>

              <button
                className="campus-close-btn"
                onClick={handleCloseViewModal}
                type="button"
                title="Close"
              >
                <FaTimes />
              </button>
            </div>

            <div className="campus-view-content">
              {/* Profile */}

              <div className="campus-profile">
                <div className="campus-profile-avatar">
                  {viewingCampus.name
                    ?.charAt(0)
                    ?.toUpperCase()}
                </div>

                <div>
                  <h3>{viewingCampus.name}</h3>

                  <span className="campus-code">
                    {viewingCampus.code}
                  </span>
                </div>
              </div>

              {/* Details */}

              <div className="campus-details-grid">
                <div className="campus-detail-item">
                  <span className="detail-label">
                    Campus Name
                  </span>

                  <strong>
                    {viewingCampus.name || "—"}
                  </strong>
                </div>

                <div className="campus-detail-item">
                  <span className="detail-label">
                    Campus Code
                  </span>

                  <strong>
                    {viewingCampus.code || "—"}
                  </strong>
                </div>

                <div className="campus-detail-item">
                  <span className="detail-label">
                    Location
                  </span>

                  <strong>
                    {viewingCampus.location || "—"}
                  </strong>
                </div>

                <div className="campus-detail-item">
                  <span className="detail-label">
                    Status
                  </span>

                  <span
                    className={`campus-status ${
                      viewingCampus.isActive
                        ? "active"
                        : "inactive"
                    }`}
                  >
                    <span className="status-dot"></span>

                    {viewingCampus.isActive
                      ? "Active"
                      : "Inactive"}
                  </span>
                </div>
              </div>

              {/* Description */}

              <div className="campus-description-box">
                <span className="detail-label">
                  Description
                </span>

                <p>
                  {viewingCampus.description ||
                    "No description available."}
                </p>
              </div>

              {/* Dates */}

              <div className="campus-dates">
                <div>
                  <span>Created</span>

                  <strong>
                    {viewingCampus.createdAt
                      ? new Date(
                          viewingCampus.createdAt
                        ).toLocaleDateString()
                      : "—"}
                  </strong>
                </div>

                <div>
                  <span>Last Updated</span>

                  <strong>
                    {viewingCampus.updatedAt
                      ? new Date(
                          viewingCampus.updatedAt
                        ).toLocaleDateString()
                      : "—"}
                  </strong>
                </div>
              </div>
            </div>

            {/* Footer */}

            <div className="campus-view-footer">
              <button
                className="campus-cancel-btn"
                onClick={handleCloseViewModal}
                type="button"
              >
                Close
              </button>

              <button
                className="campus-submit-btn"
                onClick={() => {
                  handleCloseViewModal();
                  handleEdit(viewingCampus);
                }}
                type="button"
              >
                <FaEdit />
                Edit Campus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}