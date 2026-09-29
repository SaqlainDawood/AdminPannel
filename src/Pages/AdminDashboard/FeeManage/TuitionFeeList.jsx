import React, { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  Search,
  WalletCards,
  Building2,
  GraduationCap,
  Layers3,
  AlertCircle,
  X,
} from "lucide-react";

import "./TuitionFeeList.css";

import {
  getTuitionFees,
  deleteTuitionFee,
} from "../../../services/feeService";

import TuitionFeeModal from "./TuitionFeeModal";

const TuitionFeeList = () => {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editFee, setEditFee] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");

  const loadFees = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getTuitionFees();

      console.log("Tuition Fees Response:", response);

      const list = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
        ? response.data
        : [];

      setFees(list);
    } catch (err) {
      console.error("Tuition fees loading error:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load tuition fees."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFees();
  }, []);

  const handleAdd = () => {
    setEditFee(null);
    setShowModal(true);
  };

  const handleEdit = (fee) => {
    setEditFee(fee);
    setShowModal(true);
  };

  const handleDelete = async (fee) => {
    const id = fee?._id || fee?.id;

    if (!id) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this tuition fee?"
    );

    if (!confirmed) return;

    try {
      setError("");

      await deleteTuitionFee(id);
      await loadFees();
    } catch (err) {
      console.error("Delete tuition fee error:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to delete tuition fee."
      );
    }
  };

  const handleSuccess = async () => {
    setShowModal(false);
    setEditFee(null);
    await loadFees();
  };

  const closeError = () => {
    setError("");
  };

  const getDepartmentName = (fee) => {
    const department = fee?.departmentId;

    if (typeof department === "object" && department !== null) {
      return (
        department?.name ||
        department?.title ||
        department?.code ||
        "-"
      );
    }

    return "-";
  };

  const getDegreeClassName = (fee) => {
    const degreeClass = fee?.degreeClassId;

    if (typeof degreeClass === "object" && degreeClass !== null) {
      return (
        degreeClass?.name ||
        degreeClass?.title ||
        degreeClass?.code ||
        "-"
      );
    }

    return "-";
  };

  const getShiftName = (fee) => {
    const shift = fee?.shiftId;

    if (typeof shift === "object" && shift !== null) {
      return shift?.name || shift?.title || "-";
    }

    return "-";
  };

  const filteredFees = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) return fees;

    return fees.filter((fee) => {
      const department = getDepartmentName(fee).toLowerCase();
      const degreeClass = getDegreeClassName(fee).toLowerCase();
      const shift = getShiftName(fee).toLowerCase();
      const amount = String(fee?.amount || "").toLowerCase();

      return (
        department.includes(query) ||
        degreeClass.includes(query) ||
        shift.includes(query) ||
        amount.includes(query)
      );
    });
  }, [fees, searchTerm]);

  const totalAmount = fees.reduce(
    (sum, fee) => sum + Number(fee?.amount || 0),
    0
  );

  const departmentsCount = new Set(
    fees
      .map((fee) => getDepartmentName(fee))
      .filter((name) => name !== "-")
  ).size;

  const degreeClassesCount = new Set(
    fees
      .map((fee) => getDegreeClassName(fee))
      .filter((name) => name !== "-")
  ).size;

  return (
    <div className="tuition-fee-page">
      {/* HEADER */}
      <div className="tuition-list-header">
        <div className="tuition-header-content">
          <div className="tuition-title-icon">
            <WalletCards size={24} />
          </div>

          <div>
            <h3>Tuition Fees</h3>
            <p>
              Manage tuition fees according to department, degree class
              and shift.
            </p>
          </div>
        </div>

        <div className="tuition-list-actions">
          <button
            type="button"
            className="tuition-refresh-btn"
            onClick={loadFees}
            disabled={loading}
          >
            <RefreshCw
              size={16}
              className={loading ? "tuition-spin" : ""}
            />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            className="tuition-add-btn"
            onClick={handleAdd}
          >
            <Plus size={17} />
            <span>Add Tuition Fee</span>
          </button>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="tuition-list-error">
          <div className="tuition-error-icon">
            <AlertCircle size={19} />
          </div>

          <div className="tuition-error-content">
            <strong>Something went wrong</strong>
            <span>{error}</span>
          </div>

          <button
            type="button"
            className="tuition-error-close"
            onClick={closeError}
            aria-label="Close error"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {/* SUMMARY CARDS */}
      {!loading && (
        <div className="tuition-summary-grid">
          <div className="tuition-summary-card">
            <div className="tuition-summary-icon blue">
              <WalletCards size={20} />
            </div>

            <div>
              <span>Total Fee Records</span>
              <strong>{fees.length}</strong>
            </div>
          </div>

          <div className="tuition-summary-card">
            <div className="tuition-summary-icon green">
              <Building2 size={20} />
            </div>

            <div>
              <span>Departments</span>
              <strong>{departmentsCount}</strong>
            </div>
          </div>

          <div className="tuition-summary-card">
            <div className="tuition-summary-icon purple">
              <GraduationCap size={20} />
            </div>

            <div>
              <span>Degree Classes</span>
              <strong>{degreeClassesCount}</strong>
            </div>
          </div>

          <div className="tuition-summary-card">
            <div className="tuition-summary-icon orange">
              <Layers3 size={20} />
            </div>

            <div>
              <span>Total Configured Amount</span>
              <strong>
                PKR {totalAmount.toLocaleString()}
              </strong>
            </div>
          </div>
        </div>
      )}

      {/* TABLE CARD */}
      <div className="tuition-table-card">
        <div className="tuition-table-top">
          <div>
            <h4>Fee Configuration</h4>
            <p>
              {filteredFees.length}{" "}
              {filteredFees.length === 1 ? "record" : "records"} displayed
            </p>
          </div>

          <div className="tuition-search-box">
            <Search size={18} />

            <input
              type="text"
              placeholder="Search department, degree class or shift..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="tuition-search-clear"
                aria-label="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>

        <div className="tuition-table-wrapper">
          {loading ? (
            <div className="tuition-list-loading">
              <div className="tuition-loader"></div>
              <strong>Loading tuition fees</strong>
              <span>Please wait while the records are fetched.</span>
            </div>
          ) : fees.length === 0 ? (
            <div className="tuition-empty">
              <div className="tuition-empty-icon">
                <WalletCards size={28} />
              </div>

              <h4>No Tuition Fees Found</h4>

              <p>
                There are no tuition fee configurations yet.
                Add your first tuition fee to get started.
              </p>

              <button
                type="button"
                onClick={handleAdd}
                className="tuition-empty-btn"
              >
                <Plus size={16} />
                Add Tuition Fee
              </button>
            </div>
          ) : filteredFees.length === 0 ? (
            <div className="tuition-empty">
              <div className="tuition-empty-icon">
                <Search size={28} />
              </div>

              <h4>No Matching Fees</h4>

              <p>
                No tuition fee record matches your search.
              </p>

              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="tuition-empty-btn secondary"
              >
                Clear Search
              </button>
            </div>
          ) : (
            <table className="tuition-table">
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Degree Class</th>
                  <th>Shift</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredFees.map((fee, index) => {
                  const id = fee?._id || fee?.id || index;

                  return (
                    <tr key={id}>
                      <td>
                        <div className="tuition-primary-cell">
                          <div className="tuition-row-icon department">
                            <Building2 size={17} />
                          </div>

                          <div>
                            <strong>
                              {getDepartmentName(fee)}
                            </strong>
                            <span>Department</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="tuition-primary-cell">
                          <div className="tuition-row-icon degree">
                            <GraduationCap size={17} />
                          </div>

                          <div>
                            <strong>
                              {getDegreeClassName(fee)}
                            </strong>
                            <span>Degree Class</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="tuition-shift-badge">
                          {getShiftName(fee)}
                        </span>
                      </td>

                      <td>
                        <div className="tuition-amount">
                          <span>PKR</span>
                          <strong>
                            {Number(
                              fee?.amount || 0
                            ).toLocaleString()}
                          </strong>
                        </div>
                      </td>

                      <td>
                        <div className="tuition-actions">
                          <button
                            type="button"
                            className="tuition-edit-btn"
                            onClick={() => handleEdit(fee)}
                            title="Edit tuition fee"
                            aria-label="Edit tuition fee"
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            type="button"
                            className="tuition-delete-btn"
                            onClick={() => handleDelete(fee)}
                            title="Delete tuition fee"
                            aria-label="Delete tuition fee"
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
          )}
        </div>
      </div>

      {/* MODAL */}
      <TuitionFeeModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditFee(null);
        }}
        onSuccess={handleSuccess}
        editFee={editFee}
      />
    </div>
  );
};

export default TuitionFeeList;