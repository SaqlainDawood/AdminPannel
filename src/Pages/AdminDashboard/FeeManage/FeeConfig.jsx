import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Plus, Search, Pencil, Trash2, RefreshCw, GraduationCap,
  Building2, Layers3, AlertCircle, X, DollarSign, Receipt, Clock3,
} from "lucide-react";

import "./GenerateVoucher.css";

import { getDepartments } from "../../../services/departmentAPI";
import { getDegreeClasses } from "../../../services/degreeClassAPI";
import { getShifts } from "../../../services/shiftAPI";

import {
  getTuitionFees, createTuitionFee, updateTuitionFee, deleteTuitionFee,
  getFeeTypes, createFeeType, updateFeeType, deleteFeeType,
  getFineTypes, createFineType, updateFineType, deleteFineType,
} from "../../../services/feeService";

// ---------- HELPERS ----------
const normalizeList = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.result)) return response.result;
  return [];
};

const getId = (item) => item?._id || item?.id || "";
const getName = (item, fallback = "-") =>
  item?.name || item?.title || item?.code || fallback;

const getRelationId = (value) => {
  if (!value) return "";
  if (typeof value === "object") return value?._id || value?.id || "";
  return value;
};

// ---------- COMPONENT ----------
const FeeConfig = () => {
  const [activeTab, setActiveTab] = useState("tuition");

  const [departments, setDepartments] = useState([]);
  const [degreeClasses, setDegreeClasses] = useState([]);
  const [shifts, setShifts] = useState([]);

  const [tuitionFees, setTuitionFees] = useState([]);
  const [feeTypes, setFeeTypes] = useState([]);
  const [fineTypes, setFineTypes] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");

  const [showTuitionModal, setShowTuitionModal] = useState(false);
  const [showFeeTypeModal, setShowFeeTypeModal] = useState(false);
  const [showFineTypeModal, setShowFineTypeModal] = useState(false);

  const [editingTuitionFee, setEditingTuitionFee] = useState(null);
  const [editingFeeType, setEditingFeeType] = useState(null);
  const [editingFineType, setEditingFineType] = useState(null);

  const [departmentId, setDepartmentId] = useState("");
  const [degreeClassId, setDegreeClassId] = useState("");
  const [shiftId, setShiftId] = useState("");
  const [tuitionAmount, setTuitionAmount] = useState("");

  const [feeTypeName, setFeeTypeName] = useState("");
  const [feeTypeAmount, setFeeTypeAmount] = useState("");

  const [fineTypeName, setFineTypeName] = useState("");
  const [fineType, setFineType] = useState("perDay");
  const [fineTypeAmount, setFineTypeAmount] = useState("");

  // ---------- LOAD ----------
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const results = await Promise.allSettled([
        getDepartments(), getDegreeClasses(), getShifts(),
        getTuitionFees(), getFeeTypes(), getFineTypes(),
      ]);

      const [d, c, s, t, f, fi] = results;
      if (d.status === "fulfilled") setDepartments(normalizeList(d.value));
      if (c.status === "fulfilled") setDegreeClasses(normalizeList(c.value));
      if (s.status === "fulfilled") setShifts(normalizeList(s.value));
      if (t.status === "fulfilled") setTuitionFees(normalizeList(t.value));
      if (f.status === "fulfilled") setFeeTypes(normalizeList(f.value));
      if (fi.status === "fulfilled") setFineTypes(normalizeList(fi.value));

      const fails = results
        .filter((r) => r.status === "rejected")
        .map((r) => r.reason?.response?.data?.message || r.reason?.message)
        .filter(Boolean);
      if (fails.length) setError(fails.join(" | "));
    } catch (err) {
      setError(err?.message || "Failed to load.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ---------- FILTERS ----------
  const filteredDegreeClasses = useMemo(() => {
    if (!departmentId) return [];
    return degreeClasses.filter((i) => {
      const id = i?.departmentId?._id || i?.departmentId?.id || i?.departmentId;
      return String(id) === String(departmentId);
    });
  }, [degreeClasses, departmentId]);

  const filteredShifts = useMemo(() => {
    if (!degreeClassId) return [];
    return shifts.filter((i) => {
      const id = i?.degreeClassId?._id || i?.degreeClassId?.id || i?.degreeClassId;
      return String(id) === String(degreeClassId);
    });
  }, [shifts, degreeClassId]);

  const getDepartmentName = (fee) => {
    if (fee?.departmentId && typeof fee.departmentId === "object")
      return getName(fee.departmentId);
    const d = departments.find(
      (x) => String(getId(x)) === String(getRelationId(fee?.departmentId))
    );
    return getName(d);
  };
  const getDegreeClassName = (fee) => {
    if (fee?.degreeClassId && typeof fee.degreeClassId === "object")
      return getName(fee.degreeClassId);
    const c = degreeClasses.find(
      (x) => String(getId(x)) === String(getRelationId(fee?.degreeClassId))
    );
    return getName(c);
  };
  const getShiftName = (fee) => {
    if (fee?.shiftId && typeof fee.shiftId === "object") return getName(fee.shiftId);
    const s = shifts.find(
      (x) => String(getId(x)) === String(getRelationId(fee?.shiftId))
    );
    return getName(s);
  };

  const filteredTuition = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return tuitionFees;
    return tuitionFees.filter((fee) =>
      [getDepartmentName(fee), getDegreeClassName(fee), getShiftName(fee), fee?.amount]
        .join(" ").toLowerCase().includes(q)
    );
    // eslint-disable-next-line
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

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearch("");
    setError("");
    setSuccess("");
  };

  // ---------- TUITION MODAL ----------
  const openAddTuition = () => {
    setEditingTuitionFee(null);
    setDepartmentId(""); setDegreeClassId(""); setShiftId(""); setTuitionAmount("");
    setError(""); setSuccess("");
    setShowTuitionModal(true);
  };

  const openEditTuition = (fee) => {
    setEditingTuitionFee(fee);
    setDepartmentId(String(getRelationId(fee?.departmentId)));
    setDegreeClassId(String(getRelationId(fee?.degreeClassId)));
    setShiftId(String(getRelationId(fee?.shiftId)));
    setTuitionAmount(fee?.amount != null ? String(fee.amount) : "");
    setError(""); setSuccess("");
    setShowTuitionModal(true);
  };

  const closeTuitionModal = () => {
    if (saving) return;
    setShowTuitionModal(false);
    setEditingTuitionFee(null);
  };

  const submitTuition = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!departmentId) return setError("Select department.");
    if (!degreeClassId) return setError("Select degree class.");
    if (!shiftId) return setError("Select shift.");
    if (!tuitionAmount || Number(tuitionAmount) <= 0) return setError("Enter valid amount.");

    const payload = { departmentId, degreeClassId, shiftId, amount: Number(tuitionAmount) };
    try {
      setSaving(true);
      if (editingTuitionFee) {
        await updateTuitionFee(getId(editingTuitionFee), payload);
        setSuccess("Tuition updated.");
      } else {
        await createTuitionFee(payload);
        setSuccess("Tuition added.");
      }
      await loadData();
      closeTuitionModal();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTuition = async (fee) => {
    const id = getId(fee);
    if (!id) return;
    if (!window.confirm("Delete this tuition fee?")) return;
    try {
      setError(""); setSuccess("");
      await deleteTuitionFee(id);
      setSuccess("Deleted.");
      await loadData();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Delete failed.");
    }
  };

  // ---------- FEE TYPE MODAL ----------
  const openAddFeeType = () => {
    setEditingFeeType(null); setFeeTypeName(""); setFeeTypeAmount("");
    setError(""); setSuccess("");
    setShowFeeTypeModal(true);
  };
  const openEditFeeType = (fee) => {
    setEditingFeeType(fee);
    setFeeTypeName(fee?.name || "");
    setFeeTypeAmount(fee?.amount != null ? String(fee.amount) : "");
    setError(""); setSuccess("");
    setShowFeeTypeModal(true);
  };
  const closeFeeTypeModal = () => {
    if (saving) return;
    setShowFeeTypeModal(false);
    setEditingFeeType(null);
  };
  const submitFeeType = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!feeTypeName.trim()) return setError("Enter name.");
    if (!feeTypeAmount || Number(feeTypeAmount) <= 0) return setError("Enter valid amount.");
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
      closeFeeTypeModal();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  };
  const handleDeleteFeeType = async (fee) => {
    const id = getId(fee);
    if (!id) return;
    if (!window.confirm("Delete this fee type?")) return;
    try {
      setError(""); setSuccess("");
      await deleteFeeType(id);
      setSuccess("Deleted.");
      await loadData();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Delete failed.");
    }
  };

  // ---------- FINE TYPE MODAL ----------
  const openAddFineType = () => {
    setEditingFineType(null); setFineTypeName(""); setFineType("perDay"); setFineTypeAmount("");
    setError(""); setSuccess("");
    setShowFineTypeModal(true);
  };
  const openEditFineType = (f) => {
    setEditingFineType(f);
    setFineTypeName(f?.name || "");
    setFineType(f?.type || "perDay");
    setFineTypeAmount(f?.amount != null ? String(f.amount) : "");
    setError(""); setSuccess("");
    setShowFineTypeModal(true);
  };
  const closeFineTypeModal = () => {
    if (saving) return;
    setShowFineTypeModal(false);
    setEditingFineType(null);
  };
  const submitFineType = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!fineTypeName.trim()) return setError("Enter name.");
    if (!fineTypeAmount || Number(fineTypeAmount) <= 0) return setError("Enter valid amount.");
    const payload = { name: fineTypeName.trim(), type: fineType, amount: Number(fineTypeAmount) };
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
      closeFineTypeModal();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  };
  const handleDeleteFineType = async (f) => {
    const id = getId(f);
    if (!id) return;
    if (!window.confirm("Delete this fine type?")) return;
    try {
      setError(""); setSuccess("");
      await deleteFineType(id);
      setSuccess("Deleted.");
      await loadData();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Delete failed.");
    }
  };

  const title =
    activeTab === "tuition" ? "Tuition Fees" :
    activeTab === "feeTypes" ? "Fee Types" : "Fine Types";

  // ---------- RENDER ----------
  return (
    <div className="fee-management-page">
      {/* HEADER */}
      <div className="fee-page-header">
        <div className="fee-title-row">
          <div className="fee-title-icon"><DollarSign size={22} /></div>
          <div>
            <h1>Fee Configuration</h1>
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

      {error && !showTuitionModal && !showFeeTypeModal && !showFineTypeModal && (
        <div className="fee-alert error">
          <AlertCircle size={18} /><span>{error}</span>
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
        <button className={activeTab === "tuition" ? "fee-tab active" : "fee-tab"} onClick={() => handleTabChange("tuition")}>
          <GraduationCap size={18} /><span>Tuition Fees</span><b>{tuitionFees.length}</b>
        </button>
        <button className={activeTab === "feeTypes" ? "fee-tab active" : "fee-tab"} onClick={() => handleTabChange("feeTypes")}>
          <Receipt size={18} /><span>Fee Types</span><b>{feeTypes.length}</b>
        </button>
        <button className={activeTab === "fineTypes" ? "fee-tab active" : "fee-tab"} onClick={() => handleTabChange("fineTypes")}>
          <Clock3 size={18} /><span>Fine Types</span><b>{fineTypes.length}</b>
        </button>
      </div>

      {/* MAIN CARD */}
      <div className="fee-card">
        <div className="fee-card-top">
          <div>
            <h2>{title}</h2>
            <p>
              {activeTab === "tuition" && "Configure tuition according to academic structure."}
              {activeTab === "feeTypes" && "Manage additional fees for vouchers."}
              {activeTab === "fineTypes" && "Manage late payment fines."}
            </p>
          </div>
          <button className="fee-refresh-btn" onClick={loadData} disabled={loading}>
            <RefreshCw size={17} className={loading ? "fee-spin" : ""} /> Refresh
          </button>
        </div>

        <div className="fee-toolbar">
          <div className="fee-search">
            <Search size={18} />
            <input
              type="text"
              value={search}
              placeholder="Search..."
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="fee-count">
            {activeTab === "tuition" && filteredTuition.length}
            {activeTab === "feeTypes" && filteredFeeTypes.length}
            {activeTab === "fineTypes" && filteredFineTypes.length} Records
          </div>
        </div>

        {loading ? (
          <div className="fee-loading">
            <RefreshCw size={22} className="fee-spin" /><span>Loading...</span>
          </div>
        ) : (
          <>
            {/* TUITION */}
            {activeTab === "tuition" && filteredTuition.length === 0 && (
              <div className="fee-empty">
                <div className="fee-empty-icon"><DollarSign size={25} /></div>
                <h3>No Tuition Fees</h3>
                <p>Add your first tuition fee.</p>
                <button className="fee-primary-btn" onClick={openAddTuition}>
                  <Plus size={17} /> Add Tuition Fee
                </button>
              </div>
            )}
            {activeTab === "tuition" && filteredTuition.length > 0 && (
              <div className="fee-table-wrapper">
                <table className="fee-table">
                  <thead><tr>
                    <th>Department</th><th>Degree Class</th><th>Shift</th>
                    <th>Amount</th><th>Actions</th>
                  </tr></thead>
                  <tbody>
                    {filteredTuition.map((fee) => (
                      <tr key={getId(fee)}>
                        <td><div className="fee-table-name"><Building2 size={16} /><span>{getDepartmentName(fee)}</span></div></td>
                        <td><div className="fee-table-name"><GraduationCap size={16} /><span>{getDegreeClassName(fee)}</span></div></td>
                        <td><div className="fee-table-name"><Layers3 size={16} /><span>{getShiftName(fee)}</span></div></td>
                        <td><strong className="fee-amount">PKR {Number(fee?.amount || 0).toLocaleString()}</strong></td>
                        <td>
                          <div className="fee-actions">
                            <button className="fee-action edit" onClick={() => openEditTuition(fee)}>
                              <Pencil size={16} /> Edit
                            </button>
                            <button className="fee-action delete" onClick={() => handleDeleteTuition(fee)}>
                              <Trash2 size={16} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* FEE TYPES */}
            {activeTab === "feeTypes" && filteredFeeTypes.length === 0 && (
              <div className="fee-empty">
                <div className="fee-empty-icon"><Receipt size={25} /></div>
                <h3>No Fee Types</h3>
                <p>Add your first fee type.</p>
                <button className="fee-primary-btn" onClick={openAddFeeType}>
                  <Plus size={17} /> Add Fee Type
                </button>
              </div>
            )}
            {activeTab === "feeTypes" && filteredFeeTypes.length > 0 && (
              <div className="fee-table-wrapper">
                <table className="fee-table">
                  <thead><tr><th>Fee Name</th><th>Amount</th><th>Actions</th></tr></thead>
                  <tbody>
                    {filteredFeeTypes.map((fee) => (
                      <tr key={getId(fee)}>
                        <td><div className="fee-table-name"><Receipt size={16} /><span>{getName(fee, "Fee")}</span></div></td>
                        <td><strong className="fee-amount">PKR {Number(fee?.amount || 0).toLocaleString()}</strong></td>
                        <td>
                          <div className="fee-actions">
                            <button className="fee-action edit" onClick={() => openEditFeeType(fee)}>
                              <Pencil size={16} /> Edit
                            </button>
                            <button className="fee-action delete" onClick={() => handleDeleteFeeType(fee)}>
                              <Trash2 size={16} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* FINE TYPES */}
            {activeTab === "fineTypes" && filteredFineTypes.length === 0 && (
              <div className="fee-empty">
                <div className="fee-empty-icon"><Clock3 size={25} /></div>
                <h3>No Fine Types</h3>
                <p>Add your first fine type.</p>
                <button className="fee-primary-btn" onClick={openAddFineType}>
                  <Plus size={17} /> Add Fine Type
                </button>
              </div>
            )}
            {activeTab === "fineTypes" && filteredFineTypes.length > 0 && (
              <div className="fee-table-wrapper">
                <table className="fee-table">
                  <thead><tr><th>Fine Name</th><th>Type</th><th>Amount</th><th>Actions</th></tr></thead>
                  <tbody>
                    {filteredFineTypes.map((f) => (
                      <tr key={getId(f)}>
                        <td><div className="fee-table-name"><Clock3 size={16} /><span>{getName(f, "Fine")}</span></div></td>
                        <td><span className="fee-type-badge">{f?.type === "perDay" ? "Per Day" : "One Time"}</span></td>
                        <td><strong className="fee-amount">PKR {Number(f?.amount || 0).toLocaleString()}</strong></td>
                        <td>
                          <div className="fee-actions">
                            <button className="fee-action edit" onClick={() => openEditFineType(f)}>
                              <Pencil size={16} /> Edit
                            </button>
                            <button className="fee-action delete" onClick={() => handleDeleteFineType(f)}>
                              <Trash2 size={16} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {/* TUITION MODAL */}
      {showTuitionModal && (
        <div className="fee-modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && closeTuitionModal()}>
          <div className="fee-modal">
            <div className="fee-modal-header">
              <div>
                <h2>{editingTuitionFee ? "Edit" : "Add"} Tuition Fee</h2>
                <p>Configure by department, class, shift.</p>
              </div>
              <button className="fee-modal-close" onClick={closeTuitionModal}><X size={19} /></button>
            </div>
            {error && <div className="fee-modal-error"><AlertCircle size={17} /><span>{error}</span></div>}
            <form className="fee-modal-form" onSubmit={submitTuition}>
              <div className="fee-form-field">
                <label>Department <span>*</span></label>
                <select value={departmentId} onChange={(e) => { setDepartmentId(e.target.value); setDegreeClassId(""); setShiftId(""); }} disabled={saving}>
                  <option value="">Select Department</option>
                  {departments.map((d) => <option key={getId(d)} value={getId(d)}>{getName(d)}</option>)}
                </select>
              </div>
              <div className="fee-form-field">
                <label>Degree Class <span>*</span></label>
                <select value={degreeClassId} onChange={(e) => { setDegreeClassId(e.target.value); setShiftId(""); }} disabled={!departmentId || saving}>
                  <option value="">{departmentId ? "Select Class" : "Select Dept First"}</option>
                  {filteredDegreeClasses.map((c) => <option key={getId(c)} value={getId(c)}>{getName(c)}</option>)}
                </select>
              </div>
              <div className="fee-form-field">
                <label>Shift <span>*</span></label>
                <select value={shiftId} onChange={(e) => setShiftId(e.target.value)} disabled={!degreeClassId || saving}>
                  <option value="">{degreeClassId ? "Select Shift" : "Select Class First"}</option>
                  {filteredShifts.map((s) => <option key={getId(s)} value={getId(s)}>{getName(s)}</option>)}
                </select>
              </div>
              <div className="fee-form-field">
                <label>Amount (PKR) <span>*</span></label>
                <div className="fee-amount-input">
                  <span>PKR</span>
                  <input type="number" min="1" placeholder="25000" value={tuitionAmount} onChange={(e) => setTuitionAmount(e.target.value)} disabled={saving} />
                </div>
              </div>
              <div className="fee-modal-actions">
                <button type="button" className="fee-cancel-btn" onClick={closeTuitionModal}>Cancel</button>
                <button type="submit" className="fee-primary-btn" disabled={saving}>
                  {saving ? <><RefreshCw size={17} className="fee-spin" /> Saving...</> : <><Plus size={17} /> {editingTuitionFee ? "Update" : "Add"}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FEE TYPE MODAL */}
      {showFeeTypeModal && (
        <div className="fee-modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && closeFeeTypeModal()}>
          <div className="fee-modal">
            <div className="fee-modal-header">
              <div><h2>{editingFeeType ? "Edit" : "Add"} Fee Type</h2></div>
              <button className="fee-modal-close" onClick={closeFeeTypeModal}><X size={19} /></button>
            </div>
            {error && <div className="fee-modal-error"><AlertCircle size={17} /><span>{error}</span></div>}
            <form className="fee-modal-form" onSubmit={submitFeeType}>
              <div className="fee-form-field">
                <label>Name <span>*</span></label>
                <input type="text" placeholder="Hostel Fee" value={feeTypeName} onChange={(e) => setFeeTypeName(e.target.value)} disabled={saving} />
              </div>
              <div className="fee-form-field">
                <label>Amount (PKR) <span>*</span></label>
                <div className="fee-amount-input">
                  <span>PKR</span>
                  <input type="number" min="1" placeholder="30000" value={feeTypeAmount} onChange={(e) => setFeeTypeAmount(e.target.value)} disabled={saving} />
                </div>
              </div>
              <div className="fee-modal-actions">
                <button type="button" className="fee-cancel-btn" onClick={closeFeeTypeModal}>Cancel</button>
                <button type="submit" className="fee-primary-btn" disabled={saving}>
                  {saving ? "Saving..." : <><Plus size={17} /> {editingFeeType ? "Update" : "Add"}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FINE TYPE MODAL */}
      {showFineTypeModal && (
        <div className="fee-modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && closeFineTypeModal()}>
          <div className="fee-modal">
            <div className="fee-modal-header">
              <div><h2>{editingFineType ? "Edit" : "Add"} Fine Type</h2></div>
              <button className="fee-modal-close" onClick={closeFineTypeModal}><X size={19} /></button>
            </div>
            {error && <div className="fee-modal-error"><AlertCircle size={17} /><span>{error}</span></div>}
            <form className="fee-modal-form" onSubmit={submitFineType}>
              <div className="fee-form-field">
                <label>Name <span>*</span></label>
                <input type="text" placeholder="Late Fee" value={fineTypeName} onChange={(e) => setFineTypeName(e.target.value)} disabled={saving} />
              </div>
              <div className="fee-form-field">
                <label>Type <span>*</span></label>
                <select value={fineType} onChange={(e) => setFineType(e.target.value)} disabled={saving}>
                  <option value="perDay">Per Day</option>
                  <option value="onetime">One Time</option>
                </select>
              </div>
              <div className="fee-form-field">
                <label>Amount (PKR) <span>*</span></label>
                <div className="fee-amount-input">
                  <span>PKR</span>
                  <input type="number" min="1" placeholder="50" value={fineTypeAmount} onChange={(e) => setFineTypeAmount(e.target.value)} disabled={saving} />
                </div>
              </div>
              <div className="fee-modal-actions">
                <button type="button" className="fee-cancel-btn" onClick={closeFineTypeModal}>Cancel</button>
                <button type="submit" className="fee-primary-btn" disabled={saving}>
                  {saving ? "Saving..." : <><Plus size={17} /> {editingFineType ? "Update" : "Add"}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeeConfig;