import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  RefreshCw,
  GraduationCap,
  Building2,
  Layers3,
  AlertCircle,
  X,
  DollarSign,
  Receipt,
  Clock3,
} from "lucide-react";

import "./GenerateVoucher.css";

import { getDepartments } from "../../../services/departmentAPI";
import { getDegreeClasses } from "../../../services/degreeClassAPI";
import { getShifts } from "../../../services/shiftAPI";

import {
  getTuitionFees,
  createTuitionFee,
  updateTuitionFee,
  deleteTuitionFee,
  getFeeTypes,
  createFeeType,
  updateFeeType,
  deleteFeeType,
  getFineTypes,
  createFineType,
  updateFineType,
  deleteFineType,
} from "../../../services/feeService";

const GenerateVoucher = () => {
  const [activeTab, setActiveTab] = useState("tuition");

  // Data
  const [departments, setDepartments] = useState([]);
  const [degreeClasses, setDegreeClasses] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [tuitionFees, setTuitionFees] = useState([]);
  const [feeTypes, setFeeTypes] = useState([]);
  const [fineTypes, setFineTypes] = useState([]);

  // UI
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");

  // Modals
  const [showTuitionModal, setShowTuitionModal] = useState(false);
  const [showFeeTypeModal, setShowFeeTypeModal] = useState(false);
  const [showFineTypeModal, setShowFineTypeModal] = useState(false);

  const [editingTuitionFee, setEditingTuitionFee] = useState(null);
  const [editingFeeType, setEditingFeeType] = useState(null);
  const [editingFineType, setEditingFineType] = useState(null);

  // Tuition form
  const [departmentId, setDepartmentId] = useState("");
  const [degreeClassId, setDegreeClassId] = useState("");
  const [shiftId, setShiftId] = useState("");
  const [tuitionAmount, setTuitionAmount] = useState("");

  // Fee type form
  const [feeTypeName, setFeeTypeName] = useState("");
  const [feeTypeAmount, setFeeTypeAmount] = useState("");

  // Fine type form
  const [fineTypeName, setFineTypeName] = useState("");
  const [fineType, setFineType] = useState("perDay");
  const [fineTypeAmount, setFineTypeAmount] = useState("");

  // Helpers
  const normalizeList = (response) => {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.result)) return response.result;
    return [];
  };

  const getId = (item) => item?._id || item?.id || "";

  const getName = (item, fallback = "-") => {
    if (!item) return fallback;
    return item?.name || item?.title || item?.code || fallback;
  };

  const getRelationId = (value) => {
    if (!value) return "";
    if (typeof value === "object") return value?._id || value?.id || "";
    return value;
  };

  // Load all data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [
        deptRes,
        classRes,
        shiftRes,
        tuitionRes,
        feeRes,
        fineRes,
      ] = await Promise.allSettled([
        getDepartments(),
        getDegreeClasses(),
        getShifts(),
        getTuitionFees(),
        getFeeTypes(),
        getFineTypes(),
      ]);

      if (deptRes.status === "fulfilled")
        setDepartments(normalizeList(deptRes.value));
      if (classRes.status === "fulfilled")
        setDegreeClasses(normalizeList(classRes.value));
      if (shiftRes.status === "fulfilled")
        setShifts(normalizeList(shiftRes.value));
      if (tuitionRes.status === "fulfilled")
        setTuitionFees(normalizeList(tuitionRes.value));
      if (feeRes.status === "fulfilled")
        setFeeTypes(normalizeList(feeRes.value));
      if (fineRes.status === "fulfilled")
        setFineTypes(normalizeList(fineRes.value));

      const failed = [deptRes, classRes, shiftRes, tuitionRes, feeRes, fineRes]
        .filter((r) => r.status === "rejected")
        .map((r) => r.reason?.message)
        .filter(Boolean);

      if (failed.length) {
        setError(`Some data failed to load: ${failed.join(", ")}`);
      }
    } catch (err) {
      console.error("Load error:", err);
      setError(err?.message || "Failed to load fee data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filtered classes/shifts
  const filteredDegreeClasses = useMemo(() => {
    if (!departmentId) return [];
    return degreeClasses.filter((item) => {
      const itemDeptId =
        item?.departmentId?._id ||
        item?.departmentId?.id ||
        item?.departmentId;
      return String(itemDeptId) === String(departmentId);
    });
  }, [degreeClasses, departmentId]);

  const filteredShifts = useMemo(() => {
    if (!degreeClassId) return [];
    return shifts.filter((item) => {
      const itemClassId =
        item?.degreeClassId?._id ||
        item?.degreeClassId?.id ||
        item?.degreeClassId;
      return String(itemClassId) === String(degreeClassId);
    });
  }, [shifts, degreeClassId]);

  // Names
  const getDepartmentName = (fee) => {
    if (fee?.departmentId && typeof fee.departmentId === "object")
      return getName(fee.departmentId);
    const dep = departments.find(
      (d) => String(getId(d)) === String(getRelationId(fee?.departmentId))
    );
    return getName(dep);
  };

  const getDegreeClassName = (fee) => {
    if (fee?.degreeClassId && typeof fee.degreeClassId === "object")
      return getName(fee.degreeClassId);
    const dc = degreeClasses.find(
      (d) => String(getId(d)) === String(getRelationId(fee?.degreeClassId))
    );
    return getName(dc);
  };

  const getShiftName = (fee) => {
    if (fee?.shiftId && typeof fee.shiftId === "object")
      return getName(fee.shiftId);
    const s = shifts.find(
      (item) => String(getId(item)) === String(getRelationId(fee?.shiftId))
    );
    return getName(s);
  };

  // Search
  const filteredTuitionFees = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return tuitionFees;
    return tuitionFees.filter((fee) =>
      [getDepartmentName(fee), getDegreeClassName(fee), getShiftName(fee), fee?.amount]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [tuitionFees, search, departments, degreeClasses, shifts]);

  const filteredFeeTypes = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return feeTypes;
    return feeTypes.filter((f) =>
      [f?.name, f?.amount].join(" ").toLowerCase().includes(q)
    );
  }, [feeTypes, search]);

  const filteredFineTypes = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return fineTypes;
    return fineTypes.filter((f) =>
      [f?.name, f?.type, f?.amount].join(" ").toLowerCase().includes(q)
    );
  }, [fineTypes, search]);

  // Tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearch("");
    setError("");
    setSuccess("");
  };

  // ---- Tuition Modal ----
  const openAddTuition = () => {
    setEditingTuitionFee(null);
    setDepartmentId("");
    setDegreeClassId("");
    setShiftId("");
    setTuitionAmount("");
    setError("");
    setSuccess("");
    setShowTuitionModal(true);
  };

  const openEditTuition = (fee) => {
    setEditingTuitionFee(fee);
    setDepartmentId(String(getRelationId(fee?.departmentId)));
    setDegreeClassId(String(getRelationId(fee?.degreeClassId)));
    setShiftId(String(getRelationId(fee?.shiftId)));
    setTuitionAmount(fee?.amount != null ? String(fee.amount) : "");
    setError("");
    setSuccess("");
    setShowTuitionModal(true);
  };

  const closeTuition = () => {
    if (saving) return;
    setShowTuitionModal(false);
    setEditingTuitionFee(null);
  };

  const submitTuition = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!departmentId) return setError("Select department.");
    if (!degreeClassId) return setError("Select degree class.");
    if (!shiftId) return setError("Select shift.");
    if (!tuitionAmount || Number(tuitionAmount) <= 0)
      return setError("Enter valid amount.");

    const payload = {
      departmentId,
      degreeClassId,
      shiftId,
      amount: Number(tuitionAmount),
    };

    try {
      setSaving(true);
      if (editingTuitionFee) {
        await updateTuitionFee(getId(editingTuitionFee), payload);
        setSuccess("Tuition fee updated.");
      } else {
        await createTuitionFee(payload);
        setSuccess("Tuition fee added.");
      }
      await loadData();
      closeTuition();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTuition = async (fee) => {
    const id = getId(fee);
    if (!id) return setError("ID missing.");
    if (!window.confirm("Delete this tuition fee?")) return;

    try {
      setError("");
      setSuccess("");
      await deleteTuitionFee(id);
      setSuccess("Deleted.");
      await loadData();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Delete failed.");
    }
  };

  // ---- Fee Type ----
  const openAddFeeType = () => {
    setEditingFeeType(null);
    setFeeTypeName("");
    setFeeTypeAmount("");
    setError("");
    setSuccess("");
    setShowFeeTypeModal(true);
  };

  const openEditFeeType = (fee) => {
    setEditingFeeType(fee);
    setFeeTypeName(fee?.name || "");
    setFeeTypeAmount(fee?.amount != null ? String(fee.amount) : "");
    setError("");
    setSuccess("");
    setShowFeeTypeModal(true);
  };

  const closeFeeType = () => {
    if (saving) return;
    setShowFeeTypeModal(false);
    setEditingFeeType(null);
  };

  const submitFeeType = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!feeTypeName.trim()) return setError("Enter fee name.");
    if (!feeTypeAmount || Number(feeTypeAmount) <= 0)
      return setError("Enter valid amount.");

    const payload = { name: feeTypeName.trim(), amount: Number(feeTypeAmount) };

    try {
      setSaving(true);
      if (editingFeeType) {
        await updateFeeType(getId(editingFeeType), payload);
        setSuccess("Fee type updated.");
      } else {
        await createFeeType(payload);
        setSuccess("Fee type added.");
      }
      await loadData();
      closeFeeType();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteFeeType = async (fee) => {
    const id = getId(fee);
    if (!id) return setError("ID missing.");
    if (!window.confirm("Delete this fee type?")) return;
    try {
      setError("");
      setSuccess("");
      await deleteFeeType(id);
      setSuccess("Deleted.");
      await loadData();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Delete failed.");
    }
  };

  // ---- Fine Type ----
  const openAddFineType = () => {
    setEditingFineType(null);
    setFineTypeName("");
    setFineType("perDay");
    setFineTypeAmount("");
    setError("");
    setSuccess("");
    setShowFineTypeModal(true);
  };

  const openEditFineType = (fine) => {
    setEditingFineType(fine);
    setFineTypeName(fine?.name || "");
    setFineType(fine?.type || "perDay");
    setFineTypeAmount(fine?.amount != null ? String(fine.amount) : "");
    setError("");
    setSuccess("");
    setShowFineTypeModal(true);
  };

  const closeFineType = () => {
    if (saving) return;
    setShowFineTypeModal(false);
    setEditingFineType(null);
  };

  const submitFineType = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!fineTypeName.trim()) return setError("Enter fine name.");
    if (!fineTypeAmount || Number(fineTypeAmount) <= 0)
      return setError("Enter valid amount.");

    const payload = {
      name: fineTypeName.trim(),
      type: fineType,
      amount: Number(fineTypeAmount),
    };

    try {
      setSaving(true);
      if (editingFineType) {
        await updateFineType(getId(editingFineType), payload);
        setSuccess("Fine type updated.");
      } else {
        await createFineType(payload);
        setSuccess("Fine type added.");
      }
      await loadData();
      closeFineType();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteFineType = async (fine) => {
    const id = getId(fine);
    if (!id) return setError("ID missing.");
    if (!window.confirm("Delete this fine type?")) return;
    try {
      setError("");
      setSuccess("");
      await deleteFineType(id);
      setSuccess("Deleted.");
      await loadData();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Delete failed.");
    }
  };

  const getActiveTitle = () =>
    activeTab === "tuition" ? "Tuition Fees" :
    activeTab === "feeTypes" ? "Fee Types" : "Fine Types";

  return (
    <div className="fee-management-page">
      {/* HEADER */}
      <div className="fee-page-header">
        <div className="fee-title-row">
          <div className="fee-title-icon">
            <DollarSign size={22} />
          </div>
          <div>
            <h1>Fee Management</h1>
            <p>Manage tuition fees, additional fee types and fine types.</p>
          </div>
        </div>

        {activeTab === "tuition" && (
          <button className="fee-primary-btn" onClick={openAddTuition}>
            <Plus size={18} /> Add Tuition Fee
          </button>
        )}
        {activeTab === "feeTypes" && (
          <button className="fee-primary-btn" onClick={openAddFeeType}>
            <Plus size={18} /> Add Fee Type
          </button>
        )}
        {activeTab === "fineTypes" && (
          <button className="fee-primary-btn" onClick={openAddFineType}>
            <Plus size={18} /> Add Fine Type
          </button>
        )}
      </div>

      {/* ALERTS */}
      {error && !showTuitionModal && !showFeeTypeModal && !showFineTypeModal && (
        <div className="fee-alert error">
          <AlertCircle size={18} />
          <span>{error}</span>
          <button onClick={() => setError("")}><X size={16} /></button>
        </div>
      )}
      {success && (
        <div className="fee-alert success">
          <span>{success}</span>
          <button onClick={() => setSuccess("")}><X size={16} /></button>
        </div>
      )}

      {/* TABS */}
      <div className="fee-tabs">
        <button
          className={activeTab === "tuition" ? "fee-tab active" : "fee-tab"}
          onClick={() => handleTabChange("tuition")}
        >
          <GraduationCap size={18} />
          <span>Tuition Fees</span>
          <b>{tuitionFees.length}</b>
        </button>
        <button
          className={activeTab === "feeTypes" ? "fee-tab active" : "fee-tab"}
          onClick={() => handleTabChange("feeTypes")}
        >
          <Receipt size={18} />
          <span>Fee Types</span>
          <b>{feeTypes.length}</b>
        </button>
        <button
          className={activeTab === "fineTypes" ? "fee-tab active" : "fee-tab"}
          onClick={() => handleTabChange("fineTypes")}
        >
          <Clock3 size={18} />
          <span>Fine Types</span>
          <b>{fineTypes.length}</b>
        </button>
      </div>

      {/* MAIN CARD */}
      <div className="fee-card">
        <div className="fee-card-top">
          <div>
            <h2>{getActiveTitle()}</h2>
            <p>
              {activeTab === "tuition" &&
                "Configure tuition amount according to academic structure."}
              {activeTab === "feeTypes" &&
                "Manage additional fees that can be added to vouchers."}
              {activeTab === "fineTypes" &&
                "Manage late payment fines and their charging rules."}
            </p>
          </div>

          <button
            className="fee-refresh-btn"
            onClick={loadData}
            disabled={loading}
          >
            <RefreshCw size={17} className={loading ? "fee-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* SEARCH */}
        <div className="fee-toolbar">
          <div className="fee-search">
            <Search size={18} />
            <input
              type="text"
              value={search}
              placeholder={
                activeTab === "tuition"
                  ? "Search department, class or shift..."
                  : activeTab === "feeTypes"
                  ? "Search fee type..."
                  : "Search fine type..."
              }
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="fee-count">
            {activeTab === "tuition" && filteredTuitionFees.length}
            {activeTab === "feeTypes" && filteredFeeTypes.length}
            {activeTab === "fineTypes" && filteredFineTypes.length} Records
          </div>
        </div>

        {/* LOADING */}
        {loading ? (
          <div className="fee-loading">
            <RefreshCw size={22} className="fee-spin" />
            <span>Loading fee data...</span>
          </div>
        ) : (
          <>
            {/* TUITION */}
            {activeTab === "tuition" && (
              filteredTuitionFees.length === 0 ? (
                <div className="fee-empty">
                  <div className="fee-empty-icon"><DollarSign size={25} /></div>
                  <h3>No Tuition Fees Found</h3>
                  <p>Add your first tuition fee configuration.</p>
                  <button className="fee-primary-btn" onClick={openAddTuition}>
                    <Plus size={17} /> Add Tuition Fee
                  </button>
                </div>
              ) : (
                <div className="fee-table-wrapper">
                  <table className="fee-table">
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
                      {filteredTuitionFees.map((fee) => {
                        const id = getId(fee);
                        return (
                          <tr key={id}>
                            <td>
                              <div className="fee-table-name">
                                <Building2 size={16} />
                                <span>{getDepartmentName(fee)}</span>
                              </div>
                            </td>
                            <td>
                              <div className="fee-table-name">
                                <GraduationCap size={16} />
                                <span>{getDegreeClassName(fee)}</span>
                              </div>
                            </td>
                            <td>
                              <div className="fee-table-name">
                                <Layers3 size={16} />
                                <span>{getShiftName(fee)}</span>
                              </div>
                            </td>
                            <td>
                              <strong className="fee-amount">
                                PKR {Number(fee?.amount || 0).toLocaleString()}
                              </strong>
                            </td>
                            <td>
                              <div className="fee-actions">
                                <button
                                  className="fee-action edit"
                                  onClick={() => openEditTuition(fee)}
                                >
                                  <Pencil size={16} /> Edit
                                </button>
                                <button
                                  className="fee-action delete"
                                  onClick={() => handleDeleteTuition(fee)}
                                >
                                  <Trash2 size={16} /> Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )
            )}

            {/* FEE TYPES */}
            {activeTab === "feeTypes" && (
              filteredFeeTypes.length === 0 ? (
                <div className="fee-empty">
                  <div className="fee-empty-icon"><Receipt size={25} /></div>
                  <h3>No Fee Types Found</h3>
                  <p>Add your first additional fee type.</p>
                  <button className="fee-primary-btn" onClick={openAddFeeType}>
                    <Plus size={17} /> Add Fee Type
                  </button>
                </div>
              ) : (
                <div className="fee-table-wrapper">
                  <table className="fee-table">
                    <thead>
                      <tr>
                        <th>Fee Name</th>
                        <th>Amount</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredFeeTypes.map((fee) => {
                        const id = getId(fee);
                        return (
                          <tr key={id}>
                            <td>
                              <div className="fee-table-name">
                                <Receipt size={16} />
                                <span>{getName(fee, "Fee")}</span>
                              </div>
                            </td>
                            <td>
                              <strong className="fee-amount">
                                PKR {Number(fee?.amount || 0).toLocaleString()}
                              </strong>
                            </td>
                            <td>
                              <div className="fee-actions">
                                <button
                                  className="fee-action edit"
                                  onClick={() => openEditFeeType(fee)}
                                >
                                  <Pencil size={16} /> Edit
                                </button>
                                <button
                                  className="fee-action delete"
                                  onClick={() => handleDeleteFeeType(fee)}
                                >
                                  <Trash2 size={16} /> Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )
            )}

            {/* FINE TYPES */}
            {activeTab === "fineTypes" && (
              filteredFineTypes.length === 0 ? (
                <div className="fee-empty">
                  <div className="fee-empty-icon"><Clock3 size={25} /></div>
                  <h3>No Fine Types Found</h3>
                  <p>Add your first fine configuration.</p>
                  <button className="fee-primary-btn" onClick={openAddFineType}>
                    <Plus size={17} /> Add Fine Type
                  </button>
                </div>
              ) : (
                <div className="fee-table-wrapper">
                  <table className="fee-table">
                    <thead>
                      <tr>
                        <th>Fine Name</th>
                        <th>Type</th>
                        <th>Amount</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredFineTypes.map((fine) => {
                        const id = getId(fine);
                        return (
                          <tr key={id}>
                            <td>
                              <div className="fee-table-name">
                                <Clock3 size={16} />
                                <span>{getName(fine, "Fine")}</span>
                              </div>
                            </td>
                            <td>
                              <span className="fee-type-badge">
                                {fine?.type === "perDay" ? "Per Day" : "One Time"}
                              </span>
                            </td>
                            <td>
                              <strong className="fee-amount">
                                PKR {Number(fine?.amount || 0).toLocaleString()}
                              </strong>
                            </td>
                            <td>
                              <div className="fee-actions">
                                <button
                                  className="fee-action edit"
                                  onClick={() => openEditFineType(fine)}
                                >
                                  <Pencil size={16} /> Edit
                                </button>
                                <button
                                  className="fee-action delete"
                                  onClick={() => handleDeleteFineType(fine)}
                                >
                                  <Trash2 size={16} /> Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )
            )}
          </>
        )}
      </div>

      {/* ============ TUITION MODAL ============ */}
      {showTuitionModal && (
        <div
          className="fee-modal-overlay"
          onMouseDown={(e) => e.target === e.currentTarget && closeTuition()}
        >
          <div className="fee-modal">
            <div className="fee-modal-header">
              <div>
                <h2>{editingTuitionFee ? "Edit Tuition Fee" : "Add Tuition Fee"}</h2>
                <p>Configure tuition fee according to academic structure.</p>
              </div>
              <button className="fee-modal-close" onClick={closeTuition} disabled={saving}>
                <X size={19} />
              </button>
            </div>

            {error && (
              <div className="fee-modal-error">
                <AlertCircle size={17} />
                <span>{error}</span>
              </div>
            )}

            <form className="fee-modal-form" onSubmit={submitTuition}>
              <div className="fee-form-field">
                <label>Department <span>*</span></label>
                <select
                  value={departmentId}
                  onChange={(e) => {
                    setDepartmentId(e.target.value);
                    setDegreeClassId("");
                    setShiftId("");
                    setError("");
                  }}
                  disabled={saving}
                >
                  <option value="">Select Department</option>
                  {departments.map((d) => {
                    const id = getId(d);
                    return <option key={id} value={id}>{getName(d)}</option>;
                  })}
                </select>
              </div>

              <div className="fee-form-field">
                <label>Degree Class <span>*</span></label>
                <select
                  value={degreeClassId}
                  onChange={(e) => {
                    setDegreeClassId(e.target.value);
                    setShiftId("");
                    setError("");
                  }}
                  disabled={!departmentId || saving}
                >
                  <option value="">
                    {departmentId ? "Select Degree Class" : "Select Department First"}
                  </option>
                  {filteredDegreeClasses.map((item) => {
                    const id = getId(item);
                    return <option key={id} value={id}>{getName(item)}</option>;
                  })}
                </select>
              </div>

              <div className="fee-form-field">
                <label>Shift <span>*</span></label>
                <select
                  value={shiftId}
                  onChange={(e) => setShiftId(e.target.value)}
                  disabled={!degreeClassId || saving}
                >
                  <option value="">
                    {degreeClassId ? "Select Shift" : "Select Degree Class First"}
                  </option>
                  {filteredShifts.map((s) => {
                    const id = getId(s);
                    return <option key={id} value={id}>{getName(s)}</option>;
                  })}
                </select>
              </div>

              <div className="fee-form-field">
                <label>Tuition Fee Amount <span>*</span></label>
                <div className="fee-amount-input">
                  <span>PKR</span>
                  <input
                    type="number"
                    min="1"
                    placeholder="25000"
                    value={tuitionAmount}
                    onChange={(e) => setTuitionAmount(e.target.value)}
                    disabled={saving}
                  />
                </div>
              </div>

              <div className="fee-modal-actions">
                <button
                  type="button"
                  className="fee-cancel-btn"
                  onClick={closeTuition}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button type="submit" className="fee-primary-btn" disabled={saving}>
                  {saving ? (
                    <><RefreshCw size={17} className="fee-spin" /> Saving...</>
                  ) : (
                    <><Plus size={17} /> {editingTuitionFee ? "Update" : "Add"}</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============ FEE TYPE MODAL ============ */}
      {showFeeTypeModal && (
        <div
          className="fee-modal-overlay"
          onMouseDown={(e) => e.target === e.currentTarget && closeFeeType()}
        >
          <div className="fee-modal">
            <div className="fee-modal-header">
              <div>
                <h2>{editingFeeType ? "Edit Fee Type" : "Add Fee Type"}</h2>
                <p>Create an additional fee that can be added to a voucher.</p>
              </div>
              <button className="fee-modal-close" onClick={closeFeeType} disabled={saving}>
                <X size={19} />
              </button>
            </div>

            {error && (
              <div className="fee-modal-error">
                <AlertCircle size={17} />
                <span>{error}</span>
              </div>
            )}

            <form className="fee-modal-form" onSubmit={submitFeeType}>
              <div className="fee-form-field">
                <label>Fee Name <span>*</span></label>
                <input
                  type="text"
                  placeholder="e.g. Hostel Fee"
                  value={feeTypeName}
                  onChange={(e) => setFeeTypeName(e.target.value)}
                  disabled={saving}
                />
              </div>

              <div className="fee-form-field">
                <label>Amount <span>*</span></label>
                <div className="fee-amount-input">
                  <span>PKR</span>
                  <input
                    type="number"
                    min="1"
                    placeholder="30000"
                    value={feeTypeAmount}
                    onChange={(e) => setFeeTypeAmount(e.target.value)}
                    disabled={saving}
                  />
                </div>
              </div>

              <div className="fee-modal-actions">
                <button
                  type="button"
                  className="fee-cancel-btn"
                  onClick={closeFeeType}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button type="submit" className="fee-primary-btn" disabled={saving}>
                  {saving ? (
                    <><RefreshCw size={17} className="fee-spin" /> Saving...</>
                  ) : (
                    <><Plus size={17} /> {editingFeeType ? "Update" : "Add"}</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============ FINE TYPE MODAL ============ */}
      {showFineTypeModal && (
        <div
          className="fee-modal-overlay"
          onMouseDown={(e) => e.target === e.currentTarget && closeFineType()}
        >
          <div className="fee-modal">
            <div className="fee-modal-header">
              <div>
                <h2>{editingFineType ? "Edit Fine Type" : "Add Fine Type"}</h2>
                <p>Configure the fine charging rule for late payments.</p>
              </div>
              <button className="fee-modal-close" onClick={closeFineType} disabled={saving}>
                <X size={19} />
              </button>
            </div>

            {error && (
              <div className="fee-modal-error">
                <AlertCircle size={17} />
                <span>{error}</span>
              </div>
            )}

            <form className="fee-modal-form" onSubmit={submitFineType}>
              <div className="fee-form-field">
                <label>Fine Name <span>*</span></label>
                <input
                  type="text"
                  placeholder="e.g. Late Payment Fine"
                  value={fineTypeName}
                  onChange={(e) => setFineTypeName(e.target.value)}
                  disabled={saving}
                />
              </div>

              <div className="fee-form-field">
                <label>Fine Type <span>*</span></label>
                <select
                  value={fineType}
                  onChange={(e) => setFineType(e.target.value)}
                  disabled={saving}
                >
                  <option value="perDay">Per Day</option>
                  <option value="onetime">One Time</option>
                </select>
              </div>

              <div className="fee-form-field">
                <label>Fine Amount <span>*</span></label>
                <div className="fee-amount-input">
                  <span>PKR</span>
                  <input
                    type="number"
                    min="1"
                    placeholder="50"
                    value={fineTypeAmount}
                    onChange={(e) => setFineTypeAmount(e.target.value)}
                    disabled={saving}
                  />
                </div>
              </div>

              <div className="fee-modal-actions">
                <button
                  type="button"
                  className="fee-cancel-btn"
                  onClick={closeFineType}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button type="submit" className="fee-primary-btn" disabled={saving}>
                  {saving ? (
                    <><RefreshCw size={17} className="fee-spin" /> Saving...</>
                  ) : (
                    <><Plus size={17} /> {editingFineType ? "Update" : "Add"}</>
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

export default GenerateVoucher;