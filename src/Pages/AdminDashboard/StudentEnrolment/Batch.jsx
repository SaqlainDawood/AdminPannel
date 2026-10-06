import React, { useEffect, useMemo, useState } from "react";
import { FaSpinner } from "react-icons/fa";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  X,
  GraduationCap,
  Building2,
  Clock3,
  CalendarDays,
  Layers3,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

import {
  getBatches,
  createBatch,
  updateBatch,
  deleteBatch,
  getBatchSemesters,
  advanceBatch,
} from "../../../services/batchAPI";

import { getDepartments } from "../../../services/departmentAPI";
import { getDegreeClasses } from "../../../services/degreeClassAPI";
import { getSessions } from "../../../services/sessionAPI";
import { getCampuses } from "../../../services/campusAPI";

import "./Batch.css";

const Batch = () => {
  /* =====================================================
     HELPERS
  ===================================================== */

  const getId = (item) => {
    if (!item) return "";
    if (typeof item === "string") return item;
    return item._id || item.id || "";
  };

  const unwrap = (response) => {
    if (!response) return null;
    // API service methods already return response.data.
    // So for { success: true, data: [...] }, return the actual array.
    if (response.data !== undefined) return response.data;
    return response;
  };

  const getErrorMessage = (err) =>
    err?.response?.data?.message || err?.message || "Something went wrong.";

  const getDepartmentId = (item) =>
    item?.departmentId?._id ||
    item?.departmentId?.id ||
    item?.departmentId ||
    "";

  const getDegreeClassId = (item) =>
    item?.degreeClassId?._id ||
    item?.degreeClassId?.id ||
    item?.degreeClassId ||
    "";

  const getCampusId = (item) =>
    item?.campusId?._id ||
    item?.campusId?.id ||
    item?.campusId ||
    item?.campus?._id ||
    item?.campus?.id ||
    item?.campus ||
    "";

  /* Batch -> campus (batch.departmentId.campusId se bhi) */
  const getBatchCampusId = (batch) =>
    getCampusId(batch) || getCampusId(batch?.departmentId);

  const getBatchCampusName = (batch) =>
    batch?.campusId?.name ||
    batch?.campus?.name ||
    batch?.departmentId?.campusId?.name ||
    "";

  const termOrder = { Spring: 0, Fall: 1 };

  const sortSessions = (list) =>
    [...list].sort(
      (a, b) =>
        Number(a.year) - Number(b.year) ||
        (termOrder[a.term] ?? 0) - (termOrder[b.term] ?? 0)
    );

  /* =====================================================
     MAIN DATA
  ===================================================== */

  const [batches, setBatches] = useState([]);
  const [campuses, setCampuses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [degreeClasses, setDegreeClasses] = useState([]);
  const [sessions, setSessions] = useState([]);

  /* =====================================================
     LOADING
  ===================================================== */

  const [loading, setLoading] = useState(true);
  const [loadingFormData, setLoadingFormData] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [advancingId, setAdvancingId] = useState(null);

  /* =====================================================
     SEARCH / FILTER
  ===================================================== */

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  /* =====================================================
     MODALS
  ===================================================== */

  const [showModal, setShowModal] = useState(false);
  const [viewingBatch, setViewingBatch] = useState(null);
  const [editingBatch, setEditingBatch] = useState(null);
  const [advancingBatch, setAdvancingBatch] = useState(null);

  /* =====================================================
     ERRORS
  ===================================================== */

  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");

  /* =====================================================
     ADD / EDIT FORM

     Campus -> Department -> Degree Class -> Starting Session (auto)
  ===================================================== */

  const emptyForm = {
    campusId: "",
    departmentId: "",
    degreeClassId: "",
    startSessionId: "",
  };

  const [formData, setFormData] = useState(emptyForm);

  /* =====================================================
     ADVANCE FORM
  ===================================================== */

  const [advanceForm, setAdvanceForm] = useState({ sessionId: "" });
  const [semesterInfo, setSemesterInfo] = useState(null);
  const [loadingSemesterInfo, setLoadingSemesterInfo] = useState(false);

  /* =====================================================
     FETCH BATCHES
  ===================================================== */

  const fetchBatches = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getBatches();
      const data = unwrap(response);

      setBatches(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch batches error:", err);
      setError(getErrorMessage(err));
      setBatches([]);
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     FETCH FORM DATA
  ===================================================== */

  const fetchFormData = async () => {
    try {
      setLoadingFormData(true);
      setFormError("");

      const [campusResponse, departmentResponse, classResponse, sessionResponse] =
        await Promise.all([
          getCampuses(),
          getDepartments(),
          getDegreeClasses(),
          getSessions(),
        ]);

      const campusData = Array.isArray(campusResponse?.data)
        ? campusResponse.data
        : [];

      const departmentData = Array.isArray(departmentResponse?.data)
        ? departmentResponse.data
        : [];

      const classData = Array.isArray(classResponse?.data)
        ? classResponse.data
        : [];

      const sessionData = Array.isArray(sessionResponse?.data)
        ? sessionResponse.data
        : [];

      setCampuses(campusData);
      setDepartments(departmentData);
      setDegreeClasses(classData);
      setSessions(sessionData);
    } catch (err) {
      console.error("Fetch batch form data error:", err);
      setFormError(getErrorMessage(err));
    } finally {
      setLoadingFormData(false);
    }
  };

  /* =====================================================
     INITIAL LOAD
  ===================================================== */

  useEffect(() => {
    fetchBatches();
    fetchFormData();
  }, []);

  /* =====================================================
     DEPARTMENTS BY CAMPUS
  ===================================================== */

  const filteredDepartments = useMemo(() => {
    if (!formData.campusId) return [];

    return departments.filter((department) => {
      const campusId = getCampusId(department);
      return String(campusId) === String(formData.campusId);
    });
  }, [departments, formData.campusId]);

  /* =====================================================
     DEGREE CLASSES BY DEPARTMENT
  ===================================================== */

  const filteredDegreeClasses = useMemo(() => {
    if (!formData.departmentId) return [];

    return degreeClasses.filter((item) => {
      const departmentId = getDepartmentId(item);
      return String(departmentId) === String(formData.departmentId);
    });
  }, [degreeClasses, formData.departmentId]);

  /* =====================================================
     SESSIONS (ADD / EDIT FORM)
     Sirf selected degree class ke sessions
  ===================================================== */

  const availableSessions = useMemo(() => {
    if (!formData.degreeClassId) return [];

    return sortSessions(
      sessions.filter(
        (s) => String(getDegreeClassId(s)) === String(formData.degreeClassId)
      )
    );
  }, [sessions, formData.degreeClassId]);

  /* =====================================================
     SESSIONS (ADVANCE MODAL)
     Sirf batch ki degree class ke sessions
  ===================================================== */

  const advanceSessions = useMemo(() => {
    if (!advancingBatch) return [];

    const classId = getDegreeClassId(advancingBatch);

    return sortSessions(
      sessions.filter(
        (s) => String(getDegreeClassId(s)) === String(classId)
      )
    );
  }, [sessions, advancingBatch]);

  /* =====================================================
     SELECTED ITEMS
  ===================================================== */

  const selectedClass = degreeClasses.find(
    (item) => String(getId(item)) === String(formData.degreeClassId)
  );

  const selectedSession = sessions.find(
    (item) => String(getId(item)) === String(formData.startSessionId)
  );

  const selectedCampus = campuses.find(
    (item) => String(getId(item)) === String(formData.campusId)
  );

  const selectedDepartment = departments.find(
    (item) => String(getId(item)) === String(formData.departmentId)
  );

  /* =====================================================
     AUTO SELECT STARTING SESSION
     Class select hote hi earliest session khud select ho jaye
     (backend bhi earliest hi auto-pick karta hai)
  ===================================================== */

  useEffect(() => {
    if (editingBatch) return;
    if (!formData.degreeClassId || formData.startSessionId) return;

    if (availableSessions.length > 0) {
      setFormData((prev) => ({
        ...prev,
        startSessionId: getId(availableSessions[0]),
      }));
    }
  }, [
    formData.degreeClassId,
    formData.startSessionId,
    availableSessions,
    editingBatch,
  ]);

  /* =====================================================
     BATCH NAME PREVIEW
  ===================================================== */

  const batchNamePreview =
    selectedClass && selectedSession
      ? `${selectedClass.code || selectedClass.name || "BATCH"}-${
          selectedSession.year || ""
        }`
      : "";

  /* =====================================================
     FORM CHANGE
  ===================================================== */

  const handleFormChange = (e) => {
    const { name, value } = e.target;

    if (name === "campusId") {
      setFormData((prev) => ({
        ...prev,
        campusId: value,
        departmentId: "",
        degreeClassId: "",
        startSessionId: "",
      }));
      return;
    }

    if (name === "departmentId") {
      setFormData((prev) => ({
        ...prev,
        departmentId: value,
        degreeClassId: "",
        startSessionId: "",
      }));
      return;
    }

    if (name === "degreeClassId") {
      setFormData((prev) => ({
        ...prev,
        degreeClassId: value,
        startSessionId: "",
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /* =====================================================
     OPEN ADD
  ===================================================== */

  const handleAdd = () => {
    setEditingBatch(null);
    setFormData({ ...emptyForm });
    setFormError("");
    setShowModal(true);
  };

  /* =====================================================
     OPEN EDIT
  ===================================================== */

  const handleEdit = (batch) => {
    const campusId = getBatchCampusId(batch);
    const departmentId = getDepartmentId(batch);
    const degreeClassId = getDegreeClassId(batch);
    const startSessionId = getId(batch.startSessionId);

    setEditingBatch(batch);
    setFormData({ campusId, departmentId, degreeClassId, startSessionId });
    setFormError("");
    setShowModal(true);
  };

  /* =====================================================
     VALIDATE FORM
  ===================================================== */

  const validateForm = () => {
    if (!formData.campusId) return "Please select a campus.";
    if (!formData.departmentId) return "Please select a department.";
    if (!formData.degreeClassId) return "Please select a degree class.";
    if (!formData.startSessionId) {
      return "No starting session found for this class. Please create a session first.";
    }
    return "";
  };

  /* =====================================================
     SUBMIT ADD / EDIT
  ===================================================== */

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    const payload = {
      campusId: formData.campusId,
      departmentId: formData.departmentId,
      degreeClassId: formData.degreeClassId,
      startSessionId: formData.startSessionId,
    };

    try {
      setSubmitting(true);

      if (editingBatch) {
        const batchId = getId(editingBatch);
        await updateBatch(batchId, payload);
        await fetchBatches();
        closeModal();
        return;
      }

      await createBatch(payload);
      await fetchBatches();
      closeModal();
    } catch (err) {
      console.error("Save batch error:", err);
      setFormError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  /* =====================================================
     CLOSE ADD / EDIT
  ===================================================== */

  const closeModal = () => {
    if (submitting) return;

    setShowModal(false);
    setEditingBatch(null);
    setFormData({ ...emptyForm });
    setFormError("");
  };

  /* =====================================================
     BATCH NAME
  ===================================================== */

  const getBatchName = (batch) => {
    if (batch?.name) return batch.name;

    const classCode = batch?.degreeClassId?.code || "Batch";
    const year = batch?.startSessionId?.year || "";

    return `${classCode}-${year}`;
  };

  /* =====================================================
     DELETE
  ===================================================== */

  const handleDelete = async (batch) => {
    const batchId = getId(batch);
    if (!batchId) return;

    const name = getBatchName(batch);

    const confirmed = window.confirm(
      `Are you sure you want to delete "${name}"?\n\nThis will also delete all semester history.`
    );

    if (!confirmed) return;

    try {
      setDeletingId(batchId);
      await deleteBatch(batchId);

      setBatches((prev) =>
        prev.filter((item) => String(getId(item)) !== String(batchId))
      );
    } catch (err) {
      console.error("Delete batch error:", err);
      alert(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  /* =====================================================
     GET SEMESTER INFO
  ===================================================== */

  const loadSemesterInfo = async (batchId) => {
    try {
      setLoadingSemesterInfo(true);

      const response = await getBatchSemesters(batchId);
      const data = unwrap(response);

      setSemesterInfo(data || null);
    } catch (err) {
      console.error("Semester info error:", err);
      setSemesterInfo(null);
    } finally {
      setLoadingSemesterInfo(false);
    }
  };

  /* =====================================================
     OPEN / CLOSE ADVANCE
  ===================================================== */

  const handleOpenAdvance = async (batch) => {
    setAdvancingBatch(batch);
    setAdvanceForm({ sessionId: "" });
    setSemesterInfo(null);

    await loadSemesterInfo(getId(batch));
  };

  const closeAdvance = () => {
    if (advancingId) return;

    setAdvancingBatch(null);
    setAdvanceForm({ sessionId: "" });
    setSemesterInfo(null);
  };

  /* =====================================================
     ADVANCE SUBMIT
  ===================================================== */

  const handleAdvance = async (e) => {
    e.preventDefault();

    if (!advancingBatch) return;

    const batchId = getId(advancingBatch);

    try {
      setAdvancingId(batchId);

      const payload = {};

      if (advanceForm.sessionId) {
        payload.sessionId = advanceForm.sessionId;
      }

      await advanceBatch(batchId, payload);
      await fetchBatches();
      await loadSemesterInfo(batchId);
    } catch (err) {
      console.error("Advance batch error:", err);
      alert(getErrorMessage(err));
    } finally {
      setAdvancingId(null);
    }
  };

  /* =====================================================
     VIEW
  ===================================================== */

  const handleView = async (batch) => {
    setViewingBatch(batch);
  };

  /* =====================================================
     FILTER BATCHES
  ===================================================== */

  const filteredBatches = useMemo(() => {
    const value = search.toLowerCase().trim();

    return batches.filter((batch) => {
      const name = getBatchName(batch);
      const campusName = getBatchCampusName(batch);
      const departmentName = batch?.departmentId?.name || "";
      const className = batch?.degreeClassId?.name || "";
      const shiftName = batch?.shiftId?.name || "";

      const matchesSearch =
        !value ||
        name.toLowerCase().includes(value) ||
        campusName.toLowerCase().includes(value) ||
        departmentName.toLowerCase().includes(value) ||
        className.toLowerCase().includes(value) ||
        shiftName.toLowerCase().includes(value);

      const matchesStatus =
        statusFilter === "all" || batch.status === statusFilter;

      const batchDepartmentId = getDepartmentId(batch);

      const matchesDepartment =
        departmentFilter === "all" ||
        String(batchDepartmentId) === String(departmentFilter);

      return matchesSearch && matchesStatus && matchesDepartment;
    });
  }, [batches, search, statusFilter, departmentFilter]);

  /* =====================================================
     FORMAT DATE
  ===================================================== */

  const formatDate = (date) => {
    if (!date) return "-";

    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return "-";

    return parsed.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  /* =====================================================
     STATS
  ===================================================== */

  const totalBatches = batches.length;
  const activeBatches = batches.filter(
    (batch) => batch.status === "active"
  ).length;
  const completedBatches = batches.filter(
    (batch) => batch.status === "completed"
  ).length;

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="batches-page">
      {/* HEADER */}

      <div className="batches-header">
        <div className="batch-title-section">
          <div className="batch-main-icon">
            <GraduationCap size={28} />
          </div>

          <div>
            <h1>Student Batches</h1>
            <p>Manage academic batches, cohorts and semester progression</p>
          </div>
        </div>

        <button className="add-batch-btn" onClick={handleAdd}>
          <Plus size={18} />
          Add Batch
        </button>
      </div>

      {/* ERROR */}

      {error && (
        <div className="batch-page-error">
          <span>{error}</span>
          <button onClick={fetchBatches}>
            <RefreshCw size={15} />
            Retry
          </button>
        </div>
      )}

      {/* STATS */}

      <div className="batch-stats">
        <div className="batch-stat-card">
          <div>
            <span>Total Batches</span>
            <strong>{totalBatches}</strong>
          </div>

          <div className="batch-stat-icon blue">
            <Layers3 size={21} />
          </div>
        </div>

        <div className="batch-stat-card">
          <div>
            <span>Active Batches</span>
            <strong>{activeBatches}</strong>
          </div>

          <div className="batch-stat-icon green">
            <CheckCircle2 size={21} />
          </div>
        </div>

        <div className="batch-stat-card">
          <div>
            <span>Completed</span>
            <strong>{completedBatches}</strong>
          </div>

          <div className="batch-stat-icon purple">
            <GraduationCap size={21} />
          </div>
        </div>
      </div>

      {/* TOOLBAR */}

      <div className="batches-toolbar">
        <div className="batch-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search batches..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="batch-filter"
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
        >
          <option value="all">All Departments</option>
          {departments.map((department) => (
            <option key={getId(department)} value={getId(department)}>
              {department.name}
            </option>
          ))}
        </select>

        <select
          className="batch-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="active">Ongoing</option>
          <option value="completed">Completed</option>
        </select>

        <span className="batch-result-count">
          {filteredBatches.length} Batches
        </span>
      </div>

      {/* TABLE */}

     {/* TABLE */}

<div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
  <div className="overflow-x-auto">
    <table className="w-full min-w-[1000px] border-collapse text-left">
      <thead>
        <tr className="border-b border-slate-200 bg-slate-50">
          {[
            "Batch",
            "Department",
            "Degree Class",
            "Shift",
            "Start Session",
            "Semester",
            "Status",
            "Actions",
          ].map((head) => (
            <th
              key={head}
              className={`whitespace-nowrap px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 ${
                head === "Actions" ? "text-right" : ""
              }`}
            >
              {head}
            </th>
          ))}
        </tr>
      </thead>

      <tbody className="divide-y divide-slate-100">
        {loading ? (
          <tr>
            <td colSpan="8" className="px-5 py-16">
              <div className="flex flex-col items-center justify-center gap-3 text-slate-500">
                <FaSpinner className="animate-spin text-indigo-600" size={32} />
                <p className="text-sm">Loading batches...</p>
              </div>
            </td>
          </tr>
        ) : filteredBatches.length > 0 ? (
          filteredBatches.map((batch) => {
            const batchId = getId(batch);
            const isCompleted = batch.status === "completed";

            const startSem = Number(batch?.degreeClassId?.startSemester) || 1;
            const total = Number(batch.totalSemesters) || 0;
            const current = Number(batch.currentSemester) || startSem;
            const done = Math.min(Math.max(current - startSem + 1, 0), total || 1);
            const percent = total ? Math.round((done / total) * 100) : 0;

            return (
              <tr key={batchId} className="transition-colors hover:bg-slate-50/70">
                {/* BATCH */}
                <td className="whitespace-nowrap px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-sm font-bold text-indigo-600">
                      {(batch?.degreeClassId?.code || "BA")
                        .substring(0, 2)
                        .toUpperCase()}
                    </div>
                    <span className="text-sm font-semibold text-slate-900">
                      {getBatchName(batch)}
                    </span>
                  </div>
                </td>

                {/* DEPARTMENT */}
                <td className="whitespace-nowrap px-5 py-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Building2 size={15} className="shrink-0 text-slate-400" />
                    <span>{batch?.departmentId?.name || "-"}</span>
                  </div>
                </td>

                {/* DEGREE CLASS */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <span className="whitespace-nowrap text-sm font-medium text-slate-800">
                      {batch?.degreeClassId?.name || "-"}
                    </span>
                    {batch?.degreeClassId?.code && (
                      <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-semibold text-slate-500">
                        {batch.degreeClassId.code}
                      </span>
                    )}
                  </div>
                </td>

                {/* SHIFT */}
                <td className="whitespace-nowrap px-5 py-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                    <Clock3 size={13} />
                    {batch?.shiftId?.name || "-"}
                  </span>
                </td>

                {/* START SESSION */}
                <td className="whitespace-nowrap px-5 py-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <CalendarDays size={15} className="shrink-0 text-slate-400" />
                    <span>{batch?.startSessionId?.name || "-"}</span>
                  </div>
                </td>

                {/* SEMESTER */}
                <td className="whitespace-nowrap px-5 py-4">
                  <div className="w-36">
                    <div className="mb-1.5 flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">
                        Semester {current}
                      </span>
                      <span className="text-slate-400">
                        {done}/{total || "-"}
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isCompleted ? "bg-purple-500" : "bg-indigo-500"
                        }`}
                        style={{ width: `${isCompleted ? 100 : percent}%` }}
                      />
                    </div>
                  </div>
                </td>

                {/* STATUS */}
                <td className="whitespace-nowrap px-5 py-4">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                      isCompleted
                        ? "bg-purple-50 text-purple-700"
                        : "bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        isCompleted ? "bg-purple-500" : "bg-emerald-500"
                      }`}
                    />
                    {isCompleted ? "Completed" : "Ongoing"}
                  </span>
                </td>

                {/* ACTIONS */}
                <td className="whitespace-nowrap px-5 py-4">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      title="View"
                      onClick={() => handleView(batch)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                    >
                      <Eye size={16} />
                    </button>

                    <button
                      title="Advance"
                      disabled={isCompleted}
                      onClick={() => handleOpenAdvance(batch)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-emerald-50 hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-500"
                    >
                      <ArrowRight size={16} />
                    </button>

                    <button
                      title="Edit"
                      onClick={() => handleEdit(batch)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-indigo-50 hover:text-indigo-600"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      title="Delete"
                      disabled={deletingId === batchId}
                      onClick={() => handleDelete(batch)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                    >
                      {deletingId === batchId ? (
                        <FaSpinner className="animate-spin" size={15} />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            );
          })
        ) : (
          <tr>
            <td colSpan="8" className="px-5 py-16">
              <div className="flex flex-col items-center justify-center gap-2 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <GraduationCap size={28} />
                </div>
                <h3 className="text-base font-semibold text-slate-800">
                  No batches found
                </h3>
                <p className="text-sm text-slate-500">
                  Create a batch to get started.
                </p>
              </div>
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
</div>

      {/* =================================================
          ADD / EDIT MODAL
      ================================================= */}

      {showModal && (
        <div className="batch-modal-overlay">
          <div className="batch-modal">
            <div className="batch-modal-header">
              <div>
                <h2>{editingBatch ? "Edit Batch" : "Add Batch"}</h2>
                <p>
                  {editingBatch
                    ? "Update batch information"
                    : "Create a new student batch"}
                </p>
              </div>

              <button
                className="batch-close-btn"
                onClick={closeModal}
                disabled={submitting}
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {formError && (
                <div className="batch-form-error">{formError}</div>
              )}

              {loadingFormData ? (
                <div className="batch-form-loading">
                  <FaSpinner className="batch-spinner-icon" size={28} />
                  <span>Loading form data...</span>
                </div>
              ) : (
                <>
                  {/* CAMPUS */}

                  <div className="batch-form-group">
                    <label>Campus</label>

                    <div className="batch-input-with-icon">
                      <Building2 size={17} />

                      <select
                        name="campusId"
                        value={formData.campusId}
                        onChange={handleFormChange}
                        disabled={submitting}
                        required
                      >
                        <option value="">Select Campus</option>

                        {campuses
                          .filter((campus) => campus.isActive !== false)
                          .map((campus) => (
                            <option key={campus._id} value={campus._id}>
                              {campus.name}
                              {campus.code ? ` (${campus.code})` : ""}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>

                  {/* DEPARTMENT */}

                  <div className="batch-form-group">
                    <label>Department</label>

                    <div className="batch-input-with-icon">
                      <Building2 size={17} />

                      <select
                        name="departmentId"
                        value={formData.departmentId}
                        onChange={handleFormChange}
                        disabled={!formData.campusId || submitting}
                        required
                      >
                        <option value="">
                          {!formData.campusId
                            ? "Select campus first"
                            : filteredDepartments.length === 0
                            ? "No departments found"
                            : "Select Department"}
                        </option>

                        {filteredDepartments.map((department) => (
                          <option key={department._id} value={department._id}>
                            {department.name}
                            {department.code ? ` (${department.code})` : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* DEGREE CLASS */}

                  <div className="batch-form-group">
                    <label>Degree Class</label>

                    <div className="batch-input-with-icon">
                      <GraduationCap size={17} />

                      <select
                        name="degreeClassId"
                        value={formData.degreeClassId}
                        onChange={handleFormChange}
                        disabled={!formData.departmentId || submitting}
                        required
                      >
                        <option value="">
                          {!formData.departmentId
                            ? "Select department first"
                            : filteredDegreeClasses.length === 0
                            ? "No classes found"
                            : "Select Degree Class"}
                        </option>

                        {filteredDegreeClasses.map((item) => (
                          <option key={item._id} value={item._id}>
                            {item.name}
                            {item.code ? ` (${item.code})` : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* STARTING SESSION (AUTO) */}

                  <div className="batch-form-group">
                    <label>
                      Starting Session
                      <span className="optional-label">Auto</span>
                    </label>

                    <div className="batch-input-with-icon">
                      <CalendarDays size={17} />

                      <select
                        name="startSessionId"
                        value={formData.startSessionId}
                        onChange={handleFormChange}
                        disabled={!formData.degreeClassId || submitting}
                        required
                      >
                        <option value="">
                          {!formData.degreeClassId
                            ? "Select degree class first"
                            : availableSessions.length === 0
                            ? "No sessions found for this class"
                            : "Select Starting Session"}
                        </option>

                        {availableSessions.map((session) => (
                          <option key={session._id} value={session._id}>
                            {session.name} — {session.term} {session.year}
                          </option>
                        ))}
                      </select>
                    </div>

                    <small className="batch-field-help">
                      {formData.degreeClassId && availableSessions.length === 0
                        ? "Is class ka koi session nahi hai. Pehle Session create karo."
                        : "Class select karne par starting session automatic select hota hai. Zaroorat ho to change kar sakte ho."}
                    </small>
                  </div>

                  {/* NAME PREVIEW */}

                  <div className="batch-preview-box">
                    <div>
                      <span>Batch Name</span>
                      <strong>
                        {batchNamePreview || "Select class and session"}
                      </strong>
                    </div>

                    <small>
                      Automatically generated from Degree Class code and
                      starting Session year.
                    </small>
                  </div>

                  {/* HIERARCHY SUMMARY */}

                  {formData.campusId &&
                    formData.departmentId &&
                    formData.degreeClassId &&
                    formData.startSessionId && (
                      <div className="batch-selection-summary">
                        <div>
                          <span>Campus</span>
                          <strong>{selectedCampus?.name || "-"}</strong>
                        </div>

                        <div>
                          <span>Department</span>
                          <strong>{selectedDepartment?.name || "-"}</strong>
                        </div>

                        <div>
                          <span>Class</span>
                          <strong>{selectedClass?.name || "-"}</strong>
                        </div>

                        <div>
                          <span>Starting Session</span>
                          <strong>{selectedSession?.name || "-"}</strong>
                        </div>
                      </div>
                    )}

                  {/* ACTIONS */}

                  <div className="batch-modal-actions">
                    <button
                      type="button"
                      className="batch-cancel-btn"
                      onClick={closeModal}
                      disabled={submitting}
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="batch-save-btn"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <FaSpinner
                            className="button-spinner-icon"
                            size={15}
                          />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Plus size={17} />
                          {editingBatch ? "Update Batch" : "Create Batch"}
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}

      {/* =================================================
          VIEW MODAL
      ================================================= */}

      {viewingBatch && (
        <div className="batch-modal-overlay">
          <div className="batch-view-modal">
            <div className="batch-modal-header">
              <div>
                <h2>Batch Details</h2>
                <p>Complete batch information</p>
              </div>

              <button
                className="batch-close-btn"
                onClick={() => setViewingBatch(null)}
              >
                <X size={19} />
              </button>
            </div>

            <div className="batch-view-content">
              {/* HERO */}

              <div className="batch-view-hero">
                <div className="batch-view-avatar">
                  {getBatchName(viewingBatch).substring(0, 2).toUpperCase()}
                </div>

                <div>
                  <h3>{getBatchName(viewingBatch)}</h3>
                  <span>
                    {viewingBatch?.degreeClassId?.name || "-"}
                    {" • "}
                    {viewingBatch?.shiftId?.name || "-"}
                  </span>
                </div>
              </div>

              {/* DETAILS */}

              <div className="batch-detail-grid">
                <div className="batch-detail-item">
                  <span>Campus</span>
                  <strong>{getBatchCampusName(viewingBatch) || "-"}</strong>
                </div>

                <div className="batch-detail-item">
                  <span>Department</span>
                  <strong>{viewingBatch?.departmentId?.name || "-"}</strong>
                </div>

                <div className="batch-detail-item">
                  <span>Degree Class</span>
                  <strong>{viewingBatch?.degreeClassId?.name || "-"}</strong>
                </div>

                <div className="batch-detail-item">
                  <span>Class Code</span>
                  <strong>{viewingBatch?.degreeClassId?.code || "-"}</strong>
                </div>

                <div className="batch-detail-item">
                  <span>Shift</span>
                  <strong>{viewingBatch?.shiftId?.name || "-"}</strong>
                </div>

                <div className="batch-detail-item">
                  <span>Starting Session</span>
                  <strong>{viewingBatch?.startSessionId?.name || "-"}</strong>
                </div>

                <div className="batch-detail-item">
                  <span>Total Semesters</span>
                  <strong>{viewingBatch?.totalSemesters || "-"}</strong>
                </div>

                <div className="batch-detail-item">
                  <span>Current Semester</span>
                  <strong>{viewingBatch?.currentSemester || 1}</strong>
                </div>

                <div className="batch-detail-item">
                  <span>Status</span>
                  <strong
                    className={
                      viewingBatch.status === "completed"
                        ? "detail-completed"
                        : "detail-active"
                    }
                  >
                    {viewingBatch.status === "completed"
                      ? "Completed"
                      : "Active"}
                  </strong>
                </div>
              </div>

              {/* SESSION DATES */}

              {viewingBatch?.startSessionId && (
                <div className="batch-session-box">
                  <div>
                    <CalendarDays size={18} />
                    <span>Session Period</span>
                  </div>

                  <strong>
                    {formatDate(viewingBatch.startSessionId.startDate)}
                    {" — "}
                    {formatDate(viewingBatch.startSessionId.endDate)}
                  </strong>
                </div>
              )}

              {/* ID */}

              <div className="batch-id-box">
                <span>Batch ID</span>
                <strong>{getId(viewingBatch)}</strong>
              </div>

              {/* FOOTER */}

              <div className="batch-view-footer">
                <button
                  className="batch-cancel-btn"
                  onClick={() => setViewingBatch(null)}
                >
                  Close
                </button>

                <button
                  className="batch-save-btn"
                  onClick={() => {
                    const batch = viewingBatch;
                    setViewingBatch(null);
                    handleEdit(batch);
                  }}
                >
                  <Pencil size={16} />
                  Edit Batch
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================
          ADVANCE MODAL
      ================================================= */}

      {advancingBatch && (
        <div className="batch-modal-overlay">
          <div className="batch-advance-modal">
            <div className="batch-modal-header">
              <div>
                <h2>Advance Batch</h2>
                <p>Move the batch to the next semester</p>
              </div>

              <button
                className="batch-close-btn"
                onClick={closeAdvance}
                disabled={!!advancingId}
              >
                <X size={19} />
              </button>
            </div>

            <div className="batch-advance-content">
              {/* BATCH */}

              <div className="advance-batch-card">
                <div className="advance-batch-icon">
                  <GraduationCap size={22} />
                </div>

                <div>
                  <strong>{getBatchName(advancingBatch)}</strong>
                  <span>
                    Semester {advancingBatch.currentSemester || 1}
                    {" / "}
                    {advancingBatch.totalSemesters || "-"}
                  </span>
                </div>
              </div>

              {/* SEMESTER INFO */}

              {loadingSemesterInfo ? (
                <div className="advance-loading">
                  <FaSpinner className="batch-spinner-icon" size={28} />
                  <span>Loading semester history...</span>
                </div>
              ) : semesterInfo ? (
                <div className="advance-semester-info">
                  <div className="advance-info-card">
                    <span>Current</span>
                    <strong>{semesterInfo.currentSemester || "-"}</strong>
                  </div>

                  <div className="advance-info-card">
                    <span>Total</span>
                    <strong>{advancingBatch.totalSemesters || "-"}</strong>
                  </div>

                  <div className="advance-info-card">
                    <span>Status</span>
                    <strong>
                      {semesterInfo.status || advancingBatch.status}
                    </strong>
                  </div>
                </div>
              ) : null}

              {/* NEXT SESSION */}

              {semesterInfo?.nextExpectedSession && (
                <div className="next-session-box">
                  <ArrowRight size={18} />

                  <div>
                    <span>Automatic next session</span>
                    <strong>{semesterInfo.nextExpectedSession.name}</strong>
                  </div>
                </div>
              )}

              {/* ADVANCE FORM */}

              <form onSubmit={handleAdvance}>
                <div className="batch-form-group">
                  <label>
                    Session
                    <span className="optional-label">Optional</span>
                  </label>

                  <select
                    value={advanceForm.sessionId}
                    onChange={(e) =>
                      setAdvanceForm({ sessionId: e.target.value })
                    }
                  >
                    <option value="">
                      Automatic — use next chronological session
                    </option>

                    {advanceSessions.map((session) => (
                      <option key={getId(session)} value={getId(session)}>
                        {session.name} — {session.term} {session.year}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="advance-warning">
                  <strong>How advance works</strong>
                  <p>
                    Leave Session empty to let the backend automatically find
                    the next session (Spring → Fall → Spring). Select a session
                    only when you want manual advancement.
                  </p>
                </div>

                <div className="batch-modal-actions">
                  <button
                    type="button"
                    className="batch-cancel-btn"
                    onClick={closeAdvance}
                    disabled={!!advancingId}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="batch-save-btn"
                    disabled={
                      !!advancingId || semesterInfo?.status === "completed"
                    }
                  >
                    {advancingId ? (
                      <>
                        <FaSpinner
                          className="button-spinner-icon"
                          size={15}
                        />
                        Advancing...
                      </>
                    ) : (
                      <>
                        <ArrowRight size={17} />
                        Advance Batch
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Batch;