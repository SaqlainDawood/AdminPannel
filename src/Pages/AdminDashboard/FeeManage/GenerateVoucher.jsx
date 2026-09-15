import React, { useEffect, useMemo, useState } from "react";
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

const FeeManagement = () => {
  // =========================================================
  // ACTIVE TAB
  // =========================================================

  const [activeTab, setActiveTab] = useState("tuition");

  // =========================================================
  // DATA
  // =========================================================

  const [departments, setDepartments] = useState([]);
  const [degreeClasses, setDegreeClasses] = useState([]);
  const [shifts, setShifts] = useState([]);

  const [tuitionFees, setTuitionFees] = useState([]);
  const [feeTypes, setFeeTypes] = useState([]);
  const [fineTypes, setFineTypes] = useState([]);

  // =========================================================
  // UI STATES
  // =========================================================

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");

  // =========================================================
  // MODALS
  // =========================================================

  const [showTuitionModal, setShowTuitionModal] =
    useState(false);

  const [showFeeTypeModal, setShowFeeTypeModal] =
    useState(false);

  const [showFineTypeModal, setShowFineTypeModal] =
    useState(false);

  const [editingTuitionFee, setEditingTuitionFee] =
    useState(null);

  const [editingFeeType, setEditingFeeType] =
    useState(null);

  const [editingFineType, setEditingFineType] =
    useState(null);

  // =========================================================
  // TUITION FORM
  // =========================================================

  const [departmentId, setDepartmentId] = useState("");
  const [degreeClassId, setDegreeClassId] =
    useState("");
  const [shiftId, setShiftId] = useState("");
  const [tuitionAmount, setTuitionAmount] =
    useState("");

  // =========================================================
  // FEE TYPE FORM
  // =========================================================

  const [feeTypeName, setFeeTypeName] = useState("");
  const [feeTypeAmount, setFeeTypeAmount] =
    useState("");

  // =========================================================
  // FINE TYPE FORM
  // =========================================================

  const [fineTypeName, setFineTypeName] =
    useState("");

  const [fineType, setFineType] =
    useState("perDay");

  const [fineTypeAmount, setFineTypeAmount] =
    useState("");

  // =========================================================
  // HELPERS
  // =========================================================

  const normalizeList = (response) => {
    if (Array.isArray(response)) {
      return response;
    }

    if (Array.isArray(response?.data)) {
      return response.data;
    }

    if (Array.isArray(response?.result)) {
      return response.result;
    }

    return [];
  };

  const getId = (item) => {
    return item?._id || item?.id || "";
  };

  const getName = (item, fallback = "-") => {
    if (!item) return fallback;

    return (
      item?.name ||
      item?.title ||
      item?.code ||
      fallback
    );
  };

  const getRelationId = (value) => {
    if (!value) return "";

    if (typeof value === "object") {
      return value?._id || value?.id || "";
    }

    return value;
  };

  // =========================================================
  // LOAD ALL DATA
  // =========================================================

 const loadData = async () => {
  try {
    setLoading(true);
    setError("");

    console.log("========== FEE MANAGEMENT API CHECK ==========");

    try {
      const response = await getDepartments();
      console.log("✅ DEPARTMENTS:", response);
      setDepartments(normalizeList(response));
    } catch (err) {
      console.error("❌ DEPARTMENTS ERROR:", err?.response?.status, err?.response?.data);
    }

    try {
      const response = await getDegreeClasses();
      console.log("✅ DEGREE CLASSES:", response);
      setDegreeClasses(normalizeList(response));
    } catch (err) {
      console.error("❌ DEGREE CLASSES ERROR:", err?.response?.status, err?.response?.data);
    }

    try {
      const response = await getShifts();
      console.log("✅ SHIFTS:", response);
      setShifts(normalizeList(response));
    } catch (err) {
      console.error("❌ SHIFTS ERROR:", err?.response?.status, err?.response?.data);
    }

    try {
      const response = await getTuitionFees();
      console.log("✅ TUITION FEES:", response);
      setTuitionFees(normalizeList(response));
    } catch (err) {
      console.error("❌ TUITION FEES ERROR:", err?.response?.status, err?.response?.data);
    }

    try {
      const response = await getFeeTypes();
      console.log("✅ FEE TYPES:", response);
      setFeeTypes(normalizeList(response));
    } catch (err) {
      console.error("❌ FEE TYPES ERROR:", err?.response?.status, err?.response?.data);
    }

    try {
      const response = await getFineTypes();
      console.log("✅ FINE TYPES:", response);
      setFineTypes(normalizeList(response));
    } catch (err) {
      console.error("❌ FINE TYPES ERROR:", err?.response?.status, err?.response?.data);
    }

    console.log("========== API CHECK END ==========");

  } catch (err) {
    console.error("Fee Management loading error:", err);
    setError(
      err?.response?.data?.message ||
      err?.message ||
      "Failed to load fee management data."
    );
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    loadData();
  }, []);

  // =========================================================
  // FILTER DEGREE CLASSES
  // =========================================================

  const filteredDegreeClasses = useMemo(() => {
    if (!departmentId) {
      return [];
    }

    return degreeClasses.filter((item) => {
      const itemDepartmentId =
        item?.departmentId?._id ||
        item?.departmentId?.id ||
        item?.departmentId;

      return (
        String(itemDepartmentId) ===
        String(departmentId)
      );
    });
  }, [
    degreeClasses,
    departmentId,
  ]);

  // =========================================================
  // FILTER SHIFTS
  // =========================================================

  const filteredShifts = useMemo(() => {
    if (!degreeClassId) {
      return [];
    }

    return shifts.filter((item) => {
      const itemDegreeClassId =
        item?.degreeClassId?._id ||
        item?.degreeClassId?.id ||
        item?.degreeClassId;

      return (
        String(itemDegreeClassId) ===
        String(degreeClassId)
      );
    });
  }, [
    shifts,
    degreeClassId,
  ]);

  // =========================================================
  // SEARCH TUITION
  // =========================================================

  const filteredTuitionFees = useMemo(() => {
    const keyword = search
      .trim()
      .toLowerCase();

    if (!keyword) {
      return tuitionFees;
    }

    return tuitionFees.filter((fee) => {
      const departmentName =
        getDepartmentName(fee);

      const degreeClassName =
        getDegreeClassName(fee);

      const shiftName =
        getShiftName(fee);

      const text = [
        departmentName,
        degreeClassName,
        shiftName,
        fee?.amount,
      ]
        .join(" ")
        .toLowerCase();

      return text.includes(keyword);
    });
  }, [
    tuitionFees,
    search,
    departments,
    degreeClasses,
    shifts,
  ]);

  // =========================================================
  // SEARCH FEE TYPES
  // =========================================================

  const filteredFeeTypes = useMemo(() => {
    const keyword = search
      .trim()
      .toLowerCase();

    if (!keyword) {
      return feeTypes;
    }

    return feeTypes.filter((fee) => {
      const text = [
        fee?.name,
        fee?.amount,
      ]
        .join(" ")
        .toLowerCase();

      return text.includes(keyword);
    });
  }, [feeTypes, search]);

  // =========================================================
  // SEARCH FINE TYPES
  // =========================================================

  const filteredFineTypes = useMemo(() => {
    const keyword = search
      .trim()
      .toLowerCase();

    if (!keyword) {
      return fineTypes;
    }

    return fineTypes.filter((fine) => {
      const text = [
        fine?.name,
        fine?.type,
        fine?.amount,
      ]
        .join(" ")
        .toLowerCase();

      return text.includes(keyword);
    });
  }, [fineTypes, search]);

  // =========================================================
  // TAB CHANGE
  // =========================================================

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearch("");
    setError("");
    setSuccess("");
  };

  // =========================================================
  // TUITION MODAL
  // =========================================================

  const openAddTuitionModal = () => {
    setEditingTuitionFee(null);

    setDepartmentId("");
    setDegreeClassId("");
    setShiftId("");
    setTuitionAmount("");

    setError("");
    setSuccess("");

    setShowTuitionModal(true);
  };

  const openEditTuitionModal = (fee) => {
    setEditingTuitionFee(fee);

    setDepartmentId(
      String(
        getRelationId(fee?.departmentId)
      )
    );

    setDegreeClassId(
      String(
        getRelationId(fee?.degreeClassId)
      )
    );

    setShiftId(
      String(
        getRelationId(fee?.shiftId)
      )
    );

    setTuitionAmount(
      fee?.amount !== undefined &&
        fee?.amount !== null
        ? String(fee.amount)
        : ""
    );

    setError("");
    setSuccess("");

    setShowTuitionModal(true);
  };

  const closeTuitionModal = () => {
    if (saving) return;

    setShowTuitionModal(false);
    setEditingTuitionFee(null);
  };

  // =========================================================
  // DEPARTMENT CHANGE
  // =========================================================

  const handleDepartmentChange = (value) => {
    setDepartmentId(value);
    setDegreeClassId("");
    setShiftId("");
    setError("");
  };

  // =========================================================
  // DEGREE CLASS CHANGE
  // =========================================================

  const handleDegreeClassChange = (value) => {
    setDegreeClassId(value);
    setShiftId("");
    setError("");
  };

  // =========================================================
  // SAVE TUITION
  // =========================================================

  const handleTuitionSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!departmentId) {
      setError(
        "Please select a department."
      );
      return;
    }

    if (!degreeClassId) {
      setError(
        "Please select a degree class."
      );
      return;
    }

    if (!shiftId) {
      setError(
        "Please select a shift."
      );
      return;
    }

    if (!tuitionAmount) {
      setError(
        "Please enter tuition fee amount."
      );
      return;
    }

    const numericAmount =
      Number(tuitionAmount);

    if (
      Number.isNaN(numericAmount) ||
      numericAmount <= 0
    ) {
      setError(
        "Tuition fee amount must be greater than 0."
      );
      return;
    }

    const payload = {
      departmentId,
      degreeClassId,
      shiftId,
      amount: numericAmount,
    };

    try {
      setSaving(true);

      if (editingTuitionFee) {
        await updateTuitionFee(
          getId(editingTuitionFee),
          payload
        );

        setSuccess(
          "Tuition fee updated successfully."
        );
      } else {
        await createTuitionFee(payload);

        setSuccess(
          "Tuition fee added successfully."
        );
      }

      await loadData();

      closeTuitionModal();
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
      setSaving(false);
    }
  };

  // =========================================================
  // DELETE TUITION
  // =========================================================

  const handleDeleteTuition = async (fee) => {
    const id = getId(fee);

    if (!id) {
      setError(
        "Tuition fee ID is missing."
      );
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this tuition fee?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await deleteTuitionFee(id);

      setSuccess(
        "Tuition fee deleted successfully."
      );

      await loadData();
    } catch (err) {
      console.error(
        "Delete tuition fee error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to delete tuition fee."
      );
    }
  };

  // =========================================================
  // FEE TYPE MODAL
  // =========================================================

  const openAddFeeTypeModal = () => {
    setEditingFeeType(null);
    setFeeTypeName("");
    setFeeTypeAmount("");

    setError("");
    setSuccess("");

    setShowFeeTypeModal(true);
  };

  const openEditFeeTypeModal = (fee) => {
    setEditingFeeType(fee);

    setFeeTypeName(
      fee?.name || ""
    );

    setFeeTypeAmount(
      fee?.amount !== undefined &&
        fee?.amount !== null
        ? String(fee.amount)
        : ""
    );

    setError("");
    setSuccess("");

    setShowFeeTypeModal(true);
  };

  const closeFeeTypeModal = () => {
    if (saving) return;

    setShowFeeTypeModal(false);
    setEditingFeeType(null);
  };

  // =========================================================
  // SAVE FEE TYPE
  // =========================================================

  const handleFeeTypeSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!feeTypeName.trim()) {
      setError(
        "Please enter fee type name."
      );
      return;
    }

    if (!feeTypeAmount) {
      setError(
        "Please enter fee type amount."
      );
      return;
    }

    const numericAmount =
      Number(feeTypeAmount);

    if (
      Number.isNaN(numericAmount) ||
      numericAmount <= 0
    ) {
      setError(
        "Fee type amount must be greater than 0."
      );
      return;
    }

    const payload = {
      name: feeTypeName.trim(),
      amount: numericAmount,
    };

    try {
      setSaving(true);

      if (editingFeeType) {
        await updateFeeType(
          getId(editingFeeType),
          payload
        );

        setSuccess(
          "Fee type updated successfully."
        );
      } else {
        await createFeeType(payload);

        setSuccess(
          "Fee type added successfully."
        );
      }

      await loadData();

      closeFeeTypeModal();
    } catch (err) {
      console.error(
        "Fee type save error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to save fee type."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // DELETE FEE TYPE
  // =========================================================

  const handleDeleteFeeType = async (fee) => {
    const id = getId(fee);

    if (!id) {
      setError(
        "Fee type ID is missing."
      );
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this fee type?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await deleteFeeType(id);

      setSuccess(
        "Fee type deleted successfully."
      );

      await loadData();
    } catch (err) {
      console.error(
        "Delete fee type error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to delete fee type."
      );
    }
  };

  // =========================================================
  // FINE TYPE MODAL
  // =========================================================

  const openAddFineTypeModal = () => {
    setEditingFineType(null);

    setFineTypeName("");
    setFineType("perDay");
    setFineTypeAmount("");

    setError("");
    setSuccess("");

    setShowFineTypeModal(true);
  };

  const openEditFineTypeModal = (fine) => {
    setEditingFineType(fine);

    setFineTypeName(
      fine?.name || ""
    );

    setFineType(
      fine?.type || "perDay"
    );

    setFineTypeAmount(
      fine?.amount !== undefined &&
        fine?.amount !== null
        ? String(fine.amount)
        : ""
    );

    setError("");
    setSuccess("");

    setShowFineTypeModal(true);
  };

  const closeFineTypeModal = () => {
    if (saving) return;

    setShowFineTypeModal(false);
    setEditingFineType(null);
  };

  // =========================================================
  // SAVE FINE TYPE
  // =========================================================

  const handleFineTypeSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!fineTypeName.trim()) {
      setError(
        "Please enter fine type name."
      );
      return;
    }

    if (!fineTypeAmount) {
      setError(
        "Please enter fine amount."
      );
      return;
    }

    const numericAmount =
      Number(fineTypeAmount);

    if (
      Number.isNaN(numericAmount) ||
      numericAmount <= 0
    ) {
      setError(
        "Fine amount must be greater than 0."
      );
      return;
    }

    const payload = {
      name: fineTypeName.trim(),
      type: fineType,
      amount: numericAmount,
    };

    try {
      setSaving(true);

      if (editingFineType) {
        await updateFineType(
          getId(editingFineType),
          payload
        );

        setSuccess(
          "Fine type updated successfully."
        );
      } else {
        await createFineType(payload);

        setSuccess(
          "Fine type added successfully."
        );
      }

      await loadData();

      closeFineTypeModal();
    } catch (err) {
      console.error(
        "Fine type save error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to save fine type."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // DELETE FINE TYPE
  // =========================================================

  const handleDeleteFineType = async (fine) => {
    const id = getId(fine);

    if (!id) {
      setError(
        "Fine type ID is missing."
      );
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this fine type?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await deleteFineType(id);

      setSuccess(
        "Fine type deleted successfully."
      );

      await loadData();
    } catch (err) {
      console.error(
        "Delete fine type error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to delete fine type."
      );
    }
  };

  // =========================================================
  // RELATION NAMES
  // =========================================================

  const getDepartmentName = (fee) => {
    if (
      fee?.departmentId &&
      typeof fee.departmentId ===
        "object"
    ) {
      return getName(
        fee.departmentId
      );
    }

    const department =
      departments.find(
        (item) =>
          String(getId(item)) ===
          String(
            getRelationId(
              fee?.departmentId
            )
          )
      );

    return getName(department);
  };

  const getDegreeClassName = (fee) => {
    if (
      fee?.degreeClassId &&
      typeof fee.degreeClassId ===
        "object"
    ) {
      return getName(
        fee.degreeClassId
      );
    }

    const degreeClass =
      degreeClasses.find(
        (item) =>
          String(getId(item)) ===
          String(
            getRelationId(
              fee?.degreeClassId
            )
          )
      );

    return getName(degreeClass);
  };

  const getShiftName = (fee) => {
    if (
      fee?.shiftId &&
      typeof fee.shiftId ===
        "object"
    ) {
      return getName(
        fee.shiftId
      );
    }

    const shift =
      shifts.find(
        (item) =>
          String(getId(item)) ===
          String(
            getRelationId(
              fee?.shiftId
            )
          )
      );

    return getName(shift);
  };

  // =========================================================
  // TAB TITLE
  // =========================================================

  const getActiveTitle = () => {
    if (activeTab === "tuition") {
      return "Tuition Fees";
    }

    if (activeTab === "feeTypes") {
      return "Fee Types";
    }

    return "Fine Types";
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="fee-management-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="fee-page-header">

        <div className="fee-title-row">

          <div className="fee-title-icon">
            <DollarSign size={22} />
          </div>

          <div>
            <h1>Fee Management</h1>

            <p>
              Manage tuition fees, additional
              fee types and fine types.
            </p>
          </div>

        </div>

        {/* ADD BUTTON */}

        {activeTab === "tuition" && (
          <button
            type="button"
            className="fee-primary-btn"
            onClick={
              openAddTuitionModal
            }
          >
            <Plus size={18} />
            Add Tuition Fee
          </button>
        )}

        {activeTab === "feeTypes" && (
          <button
            type="button"
            className="fee-primary-btn"
            onClick={
              openAddFeeTypeModal
            }
          >
            <Plus size={18} />
            Add Fee Type
          </button>
        )}

        {activeTab === "fineTypes" && (
          <button
            type="button"
            className="fee-primary-btn"
            onClick={
              openAddFineTypeModal
            }
          >
            <Plus size={18} />
            Add Fine Type
          </button>
        )}

      </div>

      {/* =====================================================
          ALERTS
      ===================================================== */}

      {error &&
        !showTuitionModal &&
        !showFeeTypeModal &&
        !showFineTypeModal && (
          <div className="fee-alert error">

            <AlertCircle size={18} />

            <span>{error}</span>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
            >
              <X size={16} />
            </button>

          </div>
        )}

      {success && (
        <div className="fee-alert success">

          <span>{success}</span>

          <button
            type="button"
            onClick={() =>
              setSuccess("")
            }
          >
            <X size={16} />
          </button>

        </div>
      )}

      {/* =====================================================
          TABS
      ===================================================== */}

      <div className="fee-tabs">

        <button
          type="button"
          className={
            activeTab === "tuition"
              ? "fee-tab active"
              : "fee-tab"
          }
          onClick={() =>
            handleTabChange("tuition")
          }
        >
          <GraduationCap size={18} />

          <span>
            Tuition Fees
          </span>

          <b>
            {tuitionFees.length}
          </b>
        </button>

        <button
          type="button"
          className={
            activeTab === "feeTypes"
              ? "fee-tab active"
              : "fee-tab"
          }
          onClick={() =>
            handleTabChange(
              "feeTypes"
            )
          }
        >
          <Receipt size={18} />

          <span>
            Fee Types
          </span>

          <b>
            {feeTypes.length}
          </b>
        </button>

        <button
          type="button"
          className={
            activeTab === "fineTypes"
              ? "fee-tab active"
              : "fee-tab"
          }
          onClick={() =>
            handleTabChange(
              "fineTypes"
            )
          }
        >
          <Clock3 size={18} />

          <span>
            Fine Types
          </span>

          <b>
            {fineTypes.length}
          </b>
        </button>

      </div>

      {/* =====================================================
          MAIN CARD
      ===================================================== */}

      <div className="fee-card">

        <div className="fee-card-top">

          <div>
            <h2>
              {getActiveTitle()}
            </h2>

            <p>
              {activeTab ===
                "tuition" &&
                "Configure tuition amount according to academic structure."}

              {activeTab ===
                "feeTypes" &&
                "Manage additional fees that can be added to vouchers."}

              {activeTab ===
                "fineTypes" &&
                "Manage late payment fines and their charging rules."}
            </p>
          </div>

          <button
            type="button"
            className="fee-refresh-btn"
            onClick={loadData}
            disabled={loading}
          >
            <RefreshCw
              size={17}
              className={
                loading
                  ? "fee-spin"
                  : ""
              }
            />

            Refresh
          </button>

        </div>

        {/* ===================================================
            SEARCH
        =================================================== */}

        <div className="fee-toolbar">

          <div className="fee-search">

            <Search size={18} />

            <input
              type="text"
              value={search}
              placeholder={
                activeTab ===
                "tuition"
                  ? "Search department, class or shift..."
                  : activeTab ===
                    "feeTypes"
                  ? "Search fee type..."
                  : "Search fine type..."
              }
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
            />

          </div>

          <div className="fee-count">

            {activeTab ===
              "tuition" &&
              filteredTuitionFees.length}

            {activeTab ===
              "feeTypes" &&
              filteredFeeTypes.length}

            {activeTab ===
              "fineTypes" &&
              filteredFineTypes.length}

            {" "}Records

          </div>

        </div>

        {/* ===================================================
            LOADING
        =================================================== */}

        {loading ? (

          <div className="fee-loading">

            <RefreshCw
              size={22}
              className="fee-spin"
            />

            <span>
              Loading fee data...
            </span>

          </div>

        ) : (

          <>
            {/* =================================================
                TUITION TABLE
            ================================================= */}

            {activeTab ===
              "tuition" && (

              filteredTuitionFees.length ===
              0 ? (

                <div className="fee-empty">

                  <div className="fee-empty-icon">
                    <DollarSign size={25} />
                  </div>

                  <h3>
                    No Tuition Fees Found
                  </h3>

                  <p>
                    Add your first tuition
                    fee configuration.
                  </p>

                  <button
                    type="button"
                    className="fee-primary-btn"
                    onClick={
                      openAddTuitionModal
                    }
                  >
                    <Plus size={17} />
                    Add Tuition Fee
                  </button>

                </div>

              ) : (

                <div className="fee-table-wrapper">

                  <table className="fee-table">

                    <thead>
                      <tr>
                        <th>
                          Department
                        </th>

                        <th>
                          Degree Class
                        </th>

                        <th>
                          Shift
                        </th>

                        <th>
                          Amount
                        </th>

                        <th>
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody>

                      {filteredTuitionFees.map(
                        (fee) => {

                          const id =
                            getId(fee);

                          return (
                            <tr key={id}>

                              <td>
                                <div className="fee-table-name">
                                  <Building2
                                    size={16}
                                  />

                                  <span>
                                    {getDepartmentName(
                                      fee
                                    )}
                                  </span>
                                </div>
                              </td>

                              <td>
                                <div className="fee-table-name">
                                  <GraduationCap
                                    size={16}
                                  />

                                  <span>
                                    {getDegreeClassName(
                                      fee
                                    )}
                                  </span>
                                </div>
                              </td>

                              <td>
                                <div className="fee-table-name">
                                  <Layers3
                                    size={16}
                                  />

                                  <span>
                                    {getShiftName(
                                      fee
                                    )}
                                  </span>
                                </div>
                              </td>

                              <td>
                                <strong className="fee-amount">
                                  PKR{" "}
                                  {Number(
                                    fee?.amount ||
                                      0
                                  ).toLocaleString()}
                                </strong>
                              </td>

                              <td>
                                <div className="fee-actions">

                                  <button
                                    type="button"
                                    className="fee-action edit"
                                    onClick={() =>
                                      openEditTuitionModal(
                                        fee
                                      )
                                    }
                                  >
                                    <Pencil
                                      size={16}
                                    />

                                    Edit
                                  </button>

                                  <button
                                    type="button"
                                    className="fee-action delete"
                                    onClick={() =>
                                      handleDeleteTuition(
                                        fee
                                      )
                                    }
                                  >
                                    <Trash2
                                      size={16}
                                    />

                                    Delete
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

              )
            )}

            {/* =================================================
                FEE TYPES TABLE
            ================================================= */}

            {activeTab ===
              "feeTypes" && (

              filteredFeeTypes.length ===
              0 ? (

                <div className="fee-empty">

                  <div className="fee-empty-icon">
                    <Receipt size={25} />
                  </div>

                  <h3>
                    No Fee Types Found
                  </h3>

                  <p>
                    Add your first additional
                    fee type.
                  </p>

                  <button
                    type="button"
                    className="fee-primary-btn"
                    onClick={
                      openAddFeeTypeModal
                    }
                  >
                    <Plus size={17} />
                    Add Fee Type
                  </button>

                </div>

              ) : (

                <div className="fee-table-wrapper">

                  <table className="fee-table">

                    <thead>
                      <tr>
                        <th>
                          Fee Name
                        </th>

                        <th>
                          Amount
                        </th>

                        <th>
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody>

                      {filteredFeeTypes.map(
                        (fee) => {

                          const id =
                            getId(fee);

                          return (
                            <tr key={id}>

                              <td>
                                <div className="fee-table-name">
                                  <Receipt
                                    size={16}
                                  />

                                  <span>
                                    {getName(
                                      fee,
                                      "Fee"
                                    )}
                                  </span>
                                </div>
                              </td>

                              <td>
                                <strong className="fee-amount">
                                  PKR{" "}
                                  {Number(
                                    fee?.amount ||
                                      0
                                  ).toLocaleString()}
                                </strong>
                              </td>

                              <td>
                                <div className="fee-actions">

                                  <button
                                    type="button"
                                    className="fee-action edit"
                                    onClick={() =>
                                      openEditFeeTypeModal(
                                        fee
                                      )
                                    }
                                  >
                                    <Pencil
                                      size={16}
                                    />

                                    Edit
                                  </button>

                                  <button
                                    type="button"
                                    className="fee-action delete"
                                    onClick={() =>
                                      handleDeleteFeeType(
                                        fee
                                      )
                                    }
                                  >
                                    <Trash2
                                      size={16}
                                    />

                                    Delete
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

              )
            )}

            {/* =================================================
                FINE TYPES TABLE
            ================================================= */}

            {activeTab ===
              "fineTypes" && (

              filteredFineTypes.length ===
              0 ? (

                <div className="fee-empty">

                  <div className="fee-empty-icon">
                    <Clock3 size={25} />
                  </div>

                  <h3>
                    No Fine Types Found
                  </h3>

                  <p>
                    Add your first fine
                    configuration.
                  </p>

                  <button
                    type="button"
                    className="fee-primary-btn"
                    onClick={
                      openAddFineTypeModal
                    }
                  >
                    <Plus size={17} />
                    Add Fine Type
                  </button>

                </div>

              ) : (

                <div className="fee-table-wrapper">

                  <table className="fee-table">

                    <thead>
                      <tr>
                        <th>
                          Fine Name
                        </th>

                        <th>
                          Type
                        </th>

                        <th>
                          Amount
                        </th>

                        <th>
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody>

                      {filteredFineTypes.map(
                        (fine) => {

                          const id =
                            getId(fine);

                          return (
                            <tr key={id}>

                              <td>
                                <div className="fee-table-name">
                                  <Clock3
                                    size={16}
                                  />

                                  <span>
                                    {getName(
                                      fine,
                                      "Fine"
                                    )}
                                  </span>
                                </div>
                              </td>

                              <td>
                                <span className="fee-type-badge">
                                  {fine?.type ===
                                  "perDay"
                                    ? "Per Day"
                                    : "One Time"}
                                </span>
                              </td>

                              <td>
                                <strong className="fee-amount">
                                  PKR{" "}
                                  {Number(
                                    fine?.amount ||
                                      0
                                  ).toLocaleString()}
                                </strong>
                              </td>

                              <td>
                                <div className="fee-actions">

                                  <button
                                    type="button"
                                    className="fee-action edit"
                                    onClick={() =>
                                      openEditFineTypeModal(
                                        fine
                                      )
                                    }
                                  >
                                    <Pencil
                                      size={16}
                                    />

                                    Edit
                                  </button>

                                  <button
                                    type="button"
                                    className="fee-action delete"
                                    onClick={() =>
                                      handleDeleteFineType(
                                        fine
                                      )
                                    }
                                  >
                                    <Trash2
                                      size={16}
                                    />

                                    Delete
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

              )
            )}

          </>

        )}

      </div>

      {/* =====================================================
          TUITION FEE MODAL
      ===================================================== */}

      {showTuitionModal && (

        <div
          className="fee-modal-overlay"
          onMouseDown={(e) => {
            if (
              e.target ===
              e.currentTarget
            ) {
              closeTuitionModal();
            }
          }}
        >

          <div className="fee-modal">

            <div className="fee-modal-header">

              <div>
                <h2>
                  {editingTuitionFee
                    ? "Edit Tuition Fee"
                    : "Add Tuition Fee"}
                </h2>

                <p>
                  Configure tuition fee
                  according to academic
                  structure.
                </p>
              </div>

              <button
                type="button"
                className="fee-modal-close"
                onClick={
                  closeTuitionModal
                }
                disabled={saving}
              >
                <X size={19} />
              </button>

            </div>

            {error && (
              <div className="fee-modal-error">
                <AlertCircle size={17} />
                <span>{error}</span>
              </div>
            )}

            <form
              className="fee-modal-form"
              onSubmit={
                handleTuitionSubmit
              }
            >

              {/* DEPARTMENT */}

              <div className="fee-form-field">

                <label>
                  Department{" "}
                  <span>*</span>
                </label>

                <select
                  value={departmentId}
                  onChange={(e) =>
                    handleDepartmentChange(
                      e.target.value
                    )
                  }
                  disabled={saving}
                >

                  <option value="">
                    Select Department
                  </option>

                  {departments.map(
                    (department) => {

                      const id =
                        getId(
                          department
                        );

                      return (
                        <option
                          key={id}
                          value={id}
                        >
                          {getName(
                            department
                          )}
                        </option>
                      );
                    }
                  )}

                </select>

              </div>

              {/* DEGREE CLASS */}

              <div className="fee-form-field">

                <label>
                  Degree Class{" "}
                  <span>*</span>
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
                    saving
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
                        getId(item);

                      return (
                        <option
                          key={id}
                          value={id}
                        >
                          {getName(item)}
                        </option>
                      );
                    }
                  )}

                </select>

              </div>

              {/* SHIFT */}

              <div className="fee-form-field">

                <label>
                  Shift{" "}
                  <span>*</span>
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
                    saving
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
                        getId(shift);

                      return (
                        <option
                          key={id}
                          value={id}
                        >
                          {getName(shift)}
                        </option>
                      );
                    }
                  )}

                </select>

              </div>

              {/* AMOUNT */}

              <div className="fee-form-field">

                <label>
                  Tuition Fee Amount{" "}
                  <span>*</span>
                </label>

                <div className="fee-amount-input">

                  <span>PKR</span>

                  <input
                    type="number"
                    min="1"
                    step="1"
                    placeholder="25000"
                    value={
                      tuitionAmount
                    }
                    onChange={(e) =>
                      setTuitionAmount(
                        e.target.value
                      )
                    }
                    disabled={saving}
                  />

                </div>

              </div>

              <div className="fee-modal-actions">

                <button
                  type="button"
                  className="fee-cancel-btn"
                  onClick={
                    closeTuitionModal
                  }
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="fee-primary-btn"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <RefreshCw
                        size={17}
                        className="fee-spin"
                      />

                      Saving...
                    </>
                  ) : (
                    <>
                      <Plus size={17} />

                      {editingTuitionFee
                        ? "Update Tuition Fee"
                        : "Add Tuition Fee"}
                    </>
                  )}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* =====================================================
          FEE TYPE MODAL
      ===================================================== */}

      {showFeeTypeModal && (

        <div
          className="fee-modal-overlay"
          onMouseDown={(e) => {
            if (
              e.target ===
              e.currentTarget
            ) {
              closeFeeTypeModal();
            }
          }}
        >

          <div className="fee-modal">

            <div className="fee-modal-header">

              <div>
                <h2>
                  {editingFeeType
                    ? "Edit Fee Type"
                    : "Add Fee Type"}
                </h2>

                <p>
                  Create an additional fee
                  that can be added to a
                  voucher.
                </p>
              </div>

              <button
                type="button"
                className="fee-modal-close"
                onClick={
                  closeFeeTypeModal
                }
                disabled={saving}
              >
                <X size={19} />
              </button>

            </div>

            {error && (
              <div className="fee-modal-error">
                <AlertCircle size={17} />
                <span>{error}</span>
              </div>
            )}

            <form
              className="fee-modal-form"
              onSubmit={
                handleFeeTypeSubmit
              }
            >

              <div className="fee-form-field">

                <label>
                  Fee Name{" "}
                  <span>*</span>
                </label>

                <input
                  type="text"
                  placeholder="e.g. Hostel Fee"
                  value={feeTypeName}
                  onChange={(e) =>
                    setFeeTypeName(
                      e.target.value
                    )
                  }
                  disabled={saving}
                />

              </div>

              <div className="fee-form-field">

                <label>
                  Amount{" "}
                  <span>*</span>
                </label>

                <div className="fee-amount-input">

                  <span>PKR</span>

                  <input
                    type="number"
                    min="1"
                    step="1"
                    placeholder="30000"
                    value={
                      feeTypeAmount
                    }
                    onChange={(e) =>
                      setFeeTypeAmount(
                        e.target.value
                      )
                    }
                    disabled={saving}
                  />

                </div>

              </div>

              <div className="fee-modal-actions">

                <button
                  type="button"
                  className="fee-cancel-btn"
                  onClick={
                    closeFeeTypeModal
                  }
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="fee-primary-btn"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <RefreshCw
                        size={17}
                        className="fee-spin"
                      />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Plus size={17} />

                      {editingFeeType
                        ? "Update Fee Type"
                        : "Add Fee Type"}
                    </>
                  )}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* =====================================================
          FINE TYPE MODAL
      ===================================================== */}

      {showFineTypeModal && (

        <div
          className="fee-modal-overlay"
          onMouseDown={(e) => {
            if (
              e.target ===
              e.currentTarget
            ) {
              closeFineTypeModal();
            }
          }}
        >

          <div className="fee-modal">

            <div className="fee-modal-header">

              <div>
                <h2>
                  {editingFineType
                    ? "Edit Fine Type"
                    : "Add Fine Type"}
                </h2>

                <p>
                  Configure the fine charging
                  rule for late payments.
                </p>
              </div>

              <button
                type="button"
                className="fee-modal-close"
                onClick={
                  closeFineTypeModal
                }
                disabled={saving}
              >
                <X size={19} />
              </button>

            </div>

            {error && (
              <div className="fee-modal-error">
                <AlertCircle size={17} />
                <span>{error}</span>
              </div>
            )}

            <form
              className="fee-modal-form"
              onSubmit={
                handleFineTypeSubmit
              }
            >

              {/* NAME */}

              <div className="fee-form-field">

                <label>
                  Fine Name{" "}
                  <span>*</span>
                </label>

                <input
                  type="text"
                  placeholder="e.g. Late Payment Fine"
                  value={
                    fineTypeName
                  }
                  onChange={(e) =>
                    setFineTypeName(
                      e.target.value
                    )
                  }
                  disabled={saving}
                />

              </div>

              {/* TYPE */}

              <div className="fee-form-field">

                <label>
                  Fine Type{" "}
                  <span>*</span>
                </label>

                <select
                  value={fineType}
                  onChange={(e) =>
                    setFineType(
                      e.target.value
                    )
                  }
                  disabled={saving}
                >

                  <option value="perDay">
                    Per Day
                  </option>

                  <option value="onetime">
                    One Time
                  </option>

                </select>

              </div>

              {/* AMOUNT */}

              <div className="fee-form-field">

                <label>
                  Fine Amount{" "}
                  <span>*</span>
                </label>

                <div className="fee-amount-input">

                  <span>PKR</span>

                  <input
                    type="number"
                    min="1"
                    step="1"
                    placeholder="50"
                    value={
                      fineTypeAmount
                    }
                    onChange={(e) =>
                      setFineTypeAmount(
                        e.target.value
                      )
                    }
                    disabled={saving}
                  />

                </div>

              </div>

              <div className="fee-modal-actions">

                <button
                  type="button"
                  className="fee-cancel-btn"
                  onClick={
                    closeFineTypeModal
                  }
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="fee-primary-btn"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <RefreshCw
                        size={17}
                        className="fee-spin"
                      />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Plus size={17} />

                      {editingFineType
                        ? "Update Fine Type"
                        : "Add Fine Type"}
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

export default FeeManagement;