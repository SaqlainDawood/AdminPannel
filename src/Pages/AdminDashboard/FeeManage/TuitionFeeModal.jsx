import React, { useEffect, useState } from "react";
import {
  X,
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  DollarSign,
  AlertCircle,
} from "lucide-react";

import "./TuitionFeeModal.css";

import {
  createTuitionFee,
//   getTuitionFeeById,
} from "../../../services/feeService";

import {
  getDepartments,
} from "../../../services/departmentAPI";

import {
  getDegreeClasses,
} from "../../../services/degreeClassAPI";

import {
  getShifts,
} from "../../../services/shiftAPI";

const TuitionFeeModal = ({ isOpen, onClose }) => {
  const [tuitionFees, setTuitionFees] = useState([]);

  const [departments, setDepartments] = useState([]);
  const [degreeClasses, setDegreeClasses] = useState([]);
  const [shifts, setShifts] = useState([]);

  const [departmentId, setDepartmentId] = useState("");
  const [degreeClassId, setDegreeClassId] = useState("");
  const [shiftId, setShiftId] = useState("");
  const [amount, setAmount] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =====================================================
  // LOAD DATA
  // =====================================================

  useEffect(() => {
    if (!isOpen) return;

    loadInitialData();
  }, [isOpen]);

  const loadInitialData = async () => {
    try {
      setLoadingData(true);
      setError("");

      const [
        departmentsResponse,
        classesResponse,
        shiftsResponse,
      ] = await Promise.all([
        getDepartments(),
        getDegreeClasses(),
        getShifts(),
      ]);

      const departmentsList =
        Array.isArray(departmentsResponse)
          ? departmentsResponse
          : Array.isArray(departmentsResponse?.data)
          ? departmentsResponse.data
          : [];

      const classesList =
        Array.isArray(classesResponse)
          ? classesResponse
          : Array.isArray(classesResponse?.data)
          ? classesResponse.data
          : [];

      const shiftsList =
        Array.isArray(shiftsResponse)
          ? shiftsResponse
          : Array.isArray(shiftsResponse?.data)
          ? shiftsResponse.data
          : [];

      setDepartments(departmentsList);
      setDegreeClasses(classesList);
      setShifts(shiftsList);

    } catch (err) {
      console.error(
        "Tuition fee initial data error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load fee data."
      );
    } finally {
      setLoadingData(false);
    }
  };

  // =====================================================
  // RESET FORM
  // =====================================================

  const resetForm = () => {
    setDepartmentId("");
    setDegreeClassId("");
    setShiftId("");
    setAmount("");
    setEditingId(null);
    setError("");
  };

  // =====================================================
  // CLOSE
  // =====================================================

  const handleClose = () => {
    resetForm();
    setSuccess("");
    setError("");
    onClose();
  };

  // =====================================================
  // DEPARTMENT CHANGE
  // =====================================================

  const handleDepartmentChange = (value) => {
    setDepartmentId(value);

    setDegreeClassId("");
    setShiftId("");

    setError("");
  };

  // =====================================================
  // DEGREE CLASS CHANGE
  // =====================================================

  const handleDegreeClassChange = (value) => {
    setDegreeClassId(value);

    setShiftId("");

    setError("");
  };

  // =====================================================
  // FILTER CLASSES
  // =====================================================

  const filteredDegreeClasses =
    degreeClasses.filter((item) => {
      const itemDepartmentId =
        item?.departmentId?._id ||
        item?.departmentId?.id ||
        item?.departmentId;

      return (
        String(itemDepartmentId) ===
        String(departmentId)
      );
    });

  // =====================================================
  // FILTER SHIFTS
  // =====================================================

  const filteredShifts =
    shifts.filter((item) => {
      const itemDegreeClassId =
        item?.degreeClassId?._id ||
        item?.degreeClassId?.id ||
        item?.degreeClassId;

      return (
        String(itemDegreeClassId) ===
        String(degreeClassId)
      );
    });

  // =====================================================
  // GET NAME HELPERS
  // =====================================================

  const getDepartmentName = (id) => {
    const department = departments.find(
      (item) =>
        String(item?._id || item?.id) ===
        String(id)
    );

    return (
      department?.name ||
      department?.title ||
      department?.code ||
      "-"
    );
  };

  const getDegreeClassName = (id) => {
    const item = degreeClasses.find(
      (classItem) =>
        String(
          classItem?._id ||
            classItem?.id
        ) === String(id)
    );

    return (
      item?.name ||
      item?.title ||
      item?.code ||
      "-"
    );
  };

  const getShiftName = (id) => {
    const item = shifts.find(
      (shift) =>
        String(shift?._id || shift?.id) ===
        String(id)
    );

    return (
      item?.name ||
      item?.title ||
      "-"
    );
  };

  // =====================================================
  // CREATE TUITION FEE
  // =====================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!departmentId) {
      setError("Please select a department.");
      return;
    }

    if (!degreeClassId) {
      setError("Please select a degree class.");
      return;
    }

    if (!shiftId) {
      setError("Please select a shift.");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      setError(
        "Please enter a valid tuition fee amount."
      );
      return;
    }

    try {
      setLoading(true);

      const payload = {
        departmentId,
        degreeClassId,
        shiftId,
        amount: Number(amount),
      };

      console.log(
        "TUITION FEE PAYLOAD:",
        payload
      );

      if (editingId) {
        // =================================================
        // UPDATE
        // =================================================

        const response =
          await fetch(
            `${import.meta.env.VITE_API_URL}/api/tuition-fees/${editingId}`,
            {
              method: "PUT",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify(payload),
            }
          ).then(async (res) => {
            const data = await res.json();

            if (!res.ok) {
              throw new Error(
                data?.message ||
                  "Failed to update tuition fee."
              );
            }

            return data;
          });

        console.log(
          "TUITION FEE UPDATE:",
          response
        );

        setSuccess(
          "Tuition fee updated successfully."
        );
      } else {
        // =================================================
        // CREATE
        // =================================================

        const response =
          await createTuitionFee(payload);

        console.log(
          "TUITION FEE CREATE:",
          response
        );

        setSuccess(
          "Tuition fee added successfully."
        );
      }

      resetForm();

    } catch (err) {
      console.error(
        "Tuition fee save error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to save tuition fee."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // EDIT
  // =====================================================

  const handleEdit = async (fee) => {
    try {
      setError("");
      setSuccess("");

      const id =
        fee?._id ||
        fee?.id;

      if (!id) {
        setError(
          "Tuition fee ID not found."
        );
        return;
      }

      setEditingId(id);

      setDepartmentId(
        fee?.departmentId?._id ||
          fee?.departmentId ||
          ""
      );

      setDegreeClassId(
        fee?.degreeClassId?._id ||
          fee?.degreeClassId ||
          ""
      );

      setShiftId(
        fee?.shiftId?._id ||
          fee?.shiftId ||
          ""
      );

      setAmount(
        fee?.amount != null
          ? String(fee.amount)
          : ""
      );

    } catch (err) {
      console.error(
        "Edit tuition fee error:",
        err
      );

      setError(
        "Failed to load tuition fee."
      );
    }
  };

  // =====================================================
  // DELETE
  // =====================================================

  const handleDelete = async (id) => {
    if (!id) return;

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this tuition fee?"
      );

    if (!confirmed) return;

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const response =
        await fetch(
          `${import.meta.env.VITE_API_URL}/api/tuition-fees/${id}`,
          {
            method: "DELETE",
          }
        ).then(async (res) => {
          const data = await res.json();

          if (!res.ok) {
            throw new Error(
              data?.message ||
                "Failed to delete tuition fee."
            );
          }

          return data;
        });

      console.log(
        "TUITION FEE DELETE:",
        response
      );

      setTuitionFees((prev) =>
        prev.filter(
          (item) =>
            String(
              item?._id || item?.id
            ) !== String(id)
        )
      );

      setSuccess(
        "Tuition fee deleted successfully."
      );

    } catch (err) {
      console.error(
        "Delete tuition fee error:",
        err
      );

      setError(
        err?.message ||
          "Failed to delete tuition fee."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD TUITION FEES
  // =====================================================

  const loadTuitionFees = async () => {
    try {
      setLoadingData(true);
      setError("");

      const response =
        await fetch(
          `${import.meta.env.VITE_API_URL}/api/tuition-fees`
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Failed to load tuition fees."
        );
      }

      const list =
        Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
          ? data.data
          : [];

      setTuitionFees(list);

    } catch (err) {
      console.error(
        "Load tuition fees error:",
        err
      );

      setError(
        err?.message ||
          "Failed to load tuition fees."
      );
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    loadTuitionFees();
  }, [isOpen]);

  // =====================================================
  // RENDER
  // =====================================================

  if (!isOpen) {
    return null;
  }

  return (
    <div className="tuition-modal-overlay">

      <div className="tuition-modal">

        {/* HEADER */}

        <div className="tuition-modal-header">

          <div>
            <div className="tuition-title-icon">
              <DollarSign size={20} />
            </div>

            <div>
              <h3>
                Tuition Fee Management
              </h3>

              <p>
                Add and manage tuition fees
                for department, class and shift.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="tuition-close-btn"
            onClick={handleClose}
          >
            <X size={20} />
          </button>

        </div>

        {/* BODY */}

        <div className="tuition-modal-body">

          {error && (
            <div className="tuition-alert error">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="tuition-alert success">
              {success}
            </div>
          )}

          {/* FORM */}

          <form
            className="tuition-form"
            onSubmit={handleSubmit}
          >

            {/* DEPARTMENT */}

            <div className="tuition-field">

              <label>
                Department <span>*</span>
              </label>

              <select
                value={departmentId}
                onChange={(e) =>
                  handleDepartmentChange(
                    e.target.value
                  )
                }
                disabled={
                  loading ||
                  loadingData
                }
              >

                <option value="">
                  Select Department
                </option>

                {departments.map(
                  (department) => {

                    const id =
                      department?._id ||
                      department?.id;

                    if (!id) {
                      return null;
                    }

                    return (
                      <option
                        key={id}
                        value={id}
                      >
                        {department?.name ||
                          department?.title ||
                          department?.code ||
                          "Department"}
                      </option>
                    );
                  }
                )}

              </select>

            </div>

            {/* DEGREE CLASS */}

            <div className="tuition-field">

              <label>
                Degree Class <span>*</span>
              </label>

              <select
                value={degreeClassId}
                onChange={(e) =>
                  handleDegreeClassChange(
                    e.target.value
                  )
                }
                disabled={
                  !departmentId ||
                  loading
                }
              >

                <option value="">
                  {departmentId
                    ? "Select Degree Class"
                    : "Select Department First"}
                </option>

                {filteredDegreeClasses.map(
                  (item) => {

                    const id =
                      item?._id ||
                      item?.id;

                    if (!id) {
                      return null;
                    }

                    return (
                      <option
                        key={id}
                        value={id}
                      >
                        {item?.name ||
                          item?.title ||
                          item?.code ||
                          "Degree Class"}
                      </option>
                    );
                  }
                )}

              </select>

            </div>

            {/* SHIFT */}

            <div className="tuition-field">

              <label>
                Shift <span>*</span>
              </label>

              <select
                value={shiftId}
                onChange={(e) =>
                  setShiftId(
                    e.target.value
                  )
                }
                disabled={
                  !degreeClassId ||
                  loading
                }
              >

                <option value="">
                  {degreeClassId
                    ? "Select Shift"
                    : "Select Degree Class First"}
                </option>

                {filteredShifts.map(
                  (shift) => {

                    const id =
                      shift?._id ||
                      shift?.id;

                    if (!id) {
                      return null;
                    }

                    return (
                      <option
                        key={id}
                        value={id}
                      >
                        {shift?.name ||
                          shift?.title ||
                          "Shift"}
                      </option>
                    );
                  }
                )}

              </select>

            </div>

            {/* AMOUNT */}

            <div className="tuition-field">

              <label>
                Tuition Fee Amount (PKR)
                <span>*</span>
              </label>

              <input
                type="number"
                min="1"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) =>
                  setAmount(
                    e.target.value
                  )
                }
                disabled={loading}
              />

            </div>

            {/* ACTIONS */}

            <div className="tuition-form-actions">

              {editingId && (
                <button
                  type="button"
                  className="tuition-cancel-edit"
                  onClick={resetForm}
                  disabled={loading}
                >
                  Cancel Edit
                </button>
              )}

              <button
                type="submit"
                className="tuition-submit-btn"
                disabled={
                  loading ||
                  loadingData
                }
              >

                {loading ? (
                  <>
                    <RefreshCw
                      size={17}
                      className="spin"
                    />
                    Saving...
                  </>
                ) : (
                  <>
                    {editingId ? (
                      <Pencil size={17} />
                    ) : (
                      <Plus size={17} />
                    )}

                    {editingId
                      ? "Update Tuition Fee"
                      : "Add Tuition Fee"}
                  </>
                )}

              </button>

            </div>

          </form>

          {/* LIST */}

          <div className="tuition-list-section">

            <div className="tuition-list-header">

              <div>
                <h4>
                  Existing Tuition Fees
                </h4>

                <p>
                  Manage configured tuition fees.
                </p>
              </div>

              <button
                type="button"
                onClick={loadTuitionFees}
                disabled={loadingData}
                className="tuition-refresh-btn"
              >
                <RefreshCw size={16} />
              </button>

            </div>

            {loadingData ? (

              <div className="tuition-empty">
                Loading tuition fees...
              </div>

            ) : tuitionFees.length === 0 ? (

              <div className="tuition-empty">
                No tuition fees found.
              </div>

            ) : (

              <div className="tuition-table-wrapper">

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

                    {tuitionFees.map(
                      (fee) => {

                        const id =
                          fee?._id ||
                          fee?.id;

                        return (
                          <tr key={id}>

                            <td>
                              {getDepartmentName(
                                fee?.departmentId?._id ||
                                  fee?.departmentId
                              )}
                            </td>

                            <td>
                              {getDegreeClassName(
                                fee?.degreeClassId?._id ||
                                  fee?.degreeClassId
                              )}
                            </td>

                            <td>
                              {getShiftName(
                                fee?.shiftId?._id ||
                                  fee?.shiftId
                              )}
                            </td>

                            <td>
                              <strong>
                                PKR{" "}
                                {Number(
                                  fee?.amount || 0
                                ).toLocaleString()}
                              </strong>
                            </td>

                            <td>

                              <div className="tuition-row-actions">

                                <button
                                  type="button"
                                  className="edit"
                                  onClick={() =>
                                    handleEdit(
                                      fee
                                    )
                                  }
                                  disabled={loading}
                                >
                                  <Pencil
                                    size={16}
                                  />
                                </button>

                                <button
                                  type="button"
                                  className="delete"
                                  onClick={() =>
                                    handleDelete(
                                      id
                                    )
                                  }
                                  disabled={loading}
                                >
                                  <Trash2
                                    size={16}
                                  />
                                </button>

                              </div>

                            </td>

                          </tr>
                        );
                      }
                    )}

                  </tbody>

                </table>

              </div>

            )}

          </div>

        </div>

      </div>

    </div>
  );
};

export default TuitionFeeModal;