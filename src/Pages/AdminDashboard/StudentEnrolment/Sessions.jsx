import React, { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  CalendarDays,
  CheckCircle2,
  XCircle,
  Eye,
  X,
  RefreshCw,
  Sparkles,
  AlertCircle,
} from "lucide-react";

import {
  getSessions,
  createSession,
  generateSessions,
  updateSession,
  deleteSession,
} from "../../../services/sessionAPI";

import { getDegreeClasses } from "../../../services/degreeClassAPI";

import "./Sessions.css";

const getId = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value._id || value.id || "";
};

const getDegreeClassName = (degreeClass) => {
  if (!degreeClass) return "Unknown";

  if (typeof degreeClass === "string") {
    return degreeClass;
  }

  return (
    degreeClass.name ||
    degreeClass.code ||
    "Unknown Degree Class"
  );
};

const getDegreeClassCode = (degreeClass) => {
  if (!degreeClass || typeof degreeClass === "string") {
    return "";
  }

  return degreeClass.code || "";
};

const getDuration = (degreeClass) => {
  if (!degreeClass || typeof degreeClass === "string") {
    return 0;
  }

  return Number(degreeClass.duration) || 0;
};

const getTotalSemesters = (degreeClass) => {
  return getDuration(degreeClass) * 2;
};

const getTermOrder = (term) => {
  if (term === "Spring") return 1;
  if (term === "Fall") return 2;
  return 3;
};

const sortSessions = (sessionList = []) => {
  return [...sessionList].sort((a, b) => {
    const yearDifference =
      Number(a.year || 0) - Number(b.year || 0);

    if (yearDifference !== 0) {
      return yearDifference;
    }

    return getTermOrder(a.term) - getTermOrder(b.term);
  });
};

const getSessionLabel = (session) => {
  if (!session) return "Unknown Session";

  if (session.name) {
    return session.name;
  }

  return `${session.term || ""} ${session.year || ""}`.trim();
};

const normalizeApiResponse = (response) => {
  if (!response) return {};

  if (response.data && typeof response.data === "object") {
    return response.data;
  }

  return response;
};

const Sessions = () => {
  const [sessions, setSessions] = useState([]);
  const [degreeClasses, setDegreeClasses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [termFilter, setTermFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [viewingSession, setViewingSession] = useState(null);
  const [editingSession, setEditingSession] = useState(null);

  const [generateResult, setGenerateResult] = useState(null);

  const [generateForm, setGenerateForm] = useState({
    degreeClassId: "",
    startYear: new Date().getFullYear(),
  });

  const [addForm, setAddForm] = useState({
    degreeClassId: "",
    name: "",
    term: "",
    year: new Date().getFullYear(),
    isActive: true,
  });

  const [editForm, setEditForm] = useState({
    degreeClassId: "",
    name: "",
    term: "",
    year: new Date().getFullYear(),
    isActive: false,
  });

  // =========================================================
  // FETCH DATA
  // =========================================================

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [sessionsResponse, degreeClassesResponse] =
        await Promise.all([
          getSessions(),
          getDegreeClasses(),
        ]);

      const sessionsData = normalizeApiResponse(sessionsResponse);
      const degreeClassesData =
        normalizeApiResponse(degreeClassesResponse);

      const sessionList =
        sessionsData?.data?.sessions ||
        sessionsData?.sessions ||
        sessionsData?.data ||
        [];

      const degreeClassList =
        degreeClassesData?.data?.degreeClasses ||
        degreeClassesData?.degreeClasses ||
        degreeClassesData?.data ||
        [];

      setSessions(Array.isArray(sessionList) ? sessionList : []);
      setDegreeClasses(
        Array.isArray(degreeClassList) ? degreeClassList : []
      );
    } catch (err) {
      console.error("Failed to fetch session data:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load session data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // =========================================================
  // AVAILABLE YEARS
  // =========================================================

  const availableYears = useMemo(() => {
    const years = sessions
      .map((session) => Number(session.year))
      .filter((year) => Number.isFinite(year));

    return [...new Set(years)].sort((a, b) => a - b);
  }, [sessions]);

  // =========================================================
  // FILTER SESSIONS
  // =========================================================

  const filteredSessions = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return sessions.filter((session) => {
      const degreeClass = session.degreeClassId;

      const degreeClassName =
        getDegreeClassName(degreeClass).toLowerCase();

      const degreeClassCode =
        getDegreeClassCode(degreeClass).toLowerCase();

      const sessionName =
        String(session.name || "").toLowerCase();

      const term =
        String(session.term || "").toLowerCase();

      const year =
        String(session.year || "").toLowerCase();

      const matchesSearch =
        !searchValue ||
        degreeClassName.includes(searchValue) ||
        degreeClassCode.includes(searchValue) ||
        sessionName.includes(searchValue) ||
        term.includes(searchValue) ||
        year.includes(searchValue);

      const matchesTerm =
        !termFilter ||
        session.term === termFilter;

      const matchesYear =
        !yearFilter ||
        String(session.year) === String(yearFilter);

      return (
        matchesSearch &&
        matchesTerm &&
        matchesYear
      );
    });
  }, [sessions, search, termFilter, yearFilter]);

  // =========================================================
  // GROUP SESSIONS DEGREE CLASS-WISE
  // =========================================================

  const groupedSessions = useMemo(() => {
    const groups = {};

    /*
      First create groups from Degree Classes.
      This means even a Degree Class with zero sessions
      can still appear in the table.
    */

    degreeClasses.forEach((degreeClass) => {
      const degreeClassId = getId(degreeClass);

      if (!degreeClassId) return;

      groups[degreeClassId] = {
        degreeClassId,
        degreeClass,
        degreeClassName: getDegreeClassName(degreeClass),
        degreeClassCode: getDegreeClassCode(degreeClass),
        duration: getDuration(degreeClass),
        totalSemesters: getTotalSemesters(degreeClass),
        sessions: [],
      };
    });

    /*
      Add sessions to their respective Degree Class.
    */

    filteredSessions.forEach((session) => {
      const degreeClass = session.degreeClassId;

      const degreeClassId = getId(degreeClass);

      if (!degreeClassId) return;

      if (!groups[degreeClassId]) {
        groups[degreeClassId] = {
          degreeClassId,
          degreeClass:
            typeof degreeClass === "object"
              ? degreeClass
              : null,
          degreeClassName:
            getDegreeClassName(degreeClass),
          degreeClassCode:
            getDegreeClassCode(degreeClass),
          duration:
            getDuration(degreeClass),
          totalSemesters:
            getTotalSemesters(degreeClass),
          sessions: [],
        };
      }

      groups[degreeClassId].sessions.push(session);
    });

    return Object.values(groups)
      .map((group) => ({
        ...group,
        sessions: sortSessions(group.sessions),
      }))
      .filter((group) => {
        /*
          Search/filter should not show completely empty
          Degree Classes when a search/filter is being used.
        */

        const hasActiveFilter =
          Boolean(search.trim()) ||
          Boolean(termFilter) ||
          Boolean(yearFilter);

        if (!hasActiveFilter) {
          return true;
        }

        return group.sessions.length > 0;
      })
      .sort((a, b) =>
        a.degreeClassName.localeCompare(
          b.degreeClassName
        )
      );
  }, [
    degreeClasses,
    filteredSessions,
    search,
    termFilter,
    yearFilter,
  ]);

  // =========================================================
  // RESET FILTERS
  // =========================================================

  const handleResetFilters = () => {
    setSearch("");
    setTermFilter("");
    setYearFilter("");
  };

  // =========================================================
  // ADD SESSION
  // =========================================================

  const handleOpenAddSession = () => {
    setError("");

    setAddForm({
      degreeClassId: "",
      name: "",
      term: "",
      year: new Date().getFullYear(),
      isActive: true,
    });

    setShowAddModal(true);
  };

  const handleAddSession = async (event) => {
    event.preventDefault();

    try {
      setError("");

      if (!addForm.degreeClassId) {
        setError("Please select a Degree Class.");
        return;
      }

      if (!addForm.term) {
        setError("Please select a term.");
        return;
      }

      if (!addForm.year) {
        setError("Please enter a year.");
        return;
      }

      const payload = {
        degreeClassId: addForm.degreeClassId,
        name: addForm.name.trim(),
        term: addForm.term,
        year: Number(addForm.year),
        isActive: Boolean(addForm.isActive),
      };

      await createSession(payload);

      setShowAddModal(false);

      setAddForm({
        degreeClassId: "",
        name: "",
        term: "",
        year: new Date().getFullYear(),
        isActive: true,
      });

      await fetchData();
    } catch (err) {
      console.error("Failed to create session:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to create session."
      );
    }
  };

  // =========================================================
  // GENERATE SESSIONS
  // =========================================================

  const handleOpenGenerate = () => {
    setError("");
    setGenerateResult(null);

    setGenerateForm({
      degreeClassId: "",
      startYear: new Date().getFullYear(),
    });

    setShowGenerateModal(true);
  };

  const handleGenerate = async (event) => {
    event.preventDefault();

    try {
      setGenerating(true);
      setError("");
      setGenerateResult(null);

      if (!generateForm.degreeClassId) {
        setError("Please select a Degree Class.");
        return;
      }

      if (!generateForm.startYear) {
        setError("Please enter the start year.");
        return;
      }

      const payload = {
        degreeClassId: generateForm.degreeClassId,
        startYear: Number(generateForm.startYear),
      };

      const response = await generateSessions(payload);

      const result = normalizeApiResponse(response);

      const actualResult =
        result?.data &&
        typeof result.data === "object" &&
        !Array.isArray(result.data)
          ? result.data
          : result;

      const created = Array.isArray(actualResult?.created)
        ? actualResult.created
        : [];

      const skipped = Array.isArray(actualResult?.skipped)
        ? actualResult.skipped
        : [];

      setGenerateResult({
        message:
          actualResult?.message ||
          result?.message ||
          `${created.length} session(s) created, ${skipped.length} skipped`,
        created,
        skipped,
        totalSemesters:
          actualResult?.totalSemesters ||
          actualResult?.degreeClass?.duration * 2 ||
          0,
        degreeClass:
          actualResult?.degreeClass || null,
      });

      await fetchData();
    } catch (err) {
      console.error("Failed to generate sessions:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to generate sessions."
      );
    } finally {
      setGenerating(false);
    }
  };

  // =========================================================
  // VIEW SESSION
  // =========================================================

  const handleView = (session) => {
    setViewingSession(session);
    setShowViewModal(true);
  };

  // =========================================================
  // EDIT SESSION
  // =========================================================

  const handleEdit = (session) => {
    setEditingSession(session);

    setEditForm({
      degreeClassId: getId(session.degreeClassId),
      name: session.name || "",
      term: session.term || "",
      year: Number(session.year) || new Date().getFullYear(),
      isActive: Boolean(session.isActive),
    });

    setError("");
    setShowEditModal(true);
  };

  const handleUpdate = async (event) => {
    event.preventDefault();

    if (!editingSession) return;

    try {
      setError("");

      if (!editForm.degreeClassId) {
        setError("Please select a Degree Class.");
        return;
      }

      if (!editForm.term) {
        setError("Please select a term.");
        return;
      }

      if (!editForm.year) {
        setError("Please enter a year.");
        return;
      }

      const payload = {
        degreeClassId: editForm.degreeClassId,
        name: editForm.name.trim(),
        term: editForm.term,
        year: Number(editForm.year),
        isActive: Boolean(editForm.isActive),
      };

      await updateSession(
        getId(editingSession),
        payload
      );

      setShowEditModal(false);
      setEditingSession(null);

      await fetchData();
    } catch (err) {
      console.error("Failed to update session:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update session."
      );
    }
  };

  // =========================================================
  // DELETE SESSION
  // =========================================================

  const handleDelete = async (session) => {
    const sessionId = getId(session);

    if (!sessionId) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${getSessionLabel(
        session
      )}"?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(sessionId);
      setError("");

      await deleteSession(sessionId);

      await fetchData();
    } catch (err) {
      console.error("Failed to delete session:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to delete session."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // =========================================================
  // DEGREE CLASS SELECTED INFO
  // =========================================================

  const selectedGenerateClass = useMemo(() => {
    return degreeClasses.find(
      (degreeClass) =>
        getId(degreeClass) ===
        generateForm.degreeClassId
    );
  }, [
    degreeClasses,
    generateForm.degreeClassId,
  ]);

  const selectedAddClass = useMemo(() => {
    return degreeClasses.find(
      (degreeClass) =>
        getId(degreeClass) ===
        addForm.degreeClassId
    );
  }, [
    degreeClasses,
    addForm.degreeClassId,
  ]);

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="sessions-page">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="page-header">
        <div>
          <div className="page-title-wrapper">
            <CalendarDays size={28} />

            <div>
              <h1>Academic Sessions</h1>

              <p>
                Manage academic sessions degree class-wise.
              </p>
            </div>
          </div>
        </div>

        <div className="page-header-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={fetchData}
            disabled={loading}
          >
            <RefreshCw
              size={16}
              className={
                loading ? "spin-animation" : ""
              }
            />

            Refresh
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleOpenGenerate}
          >
            <Sparkles size={16} />

            Generate Sessions
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleOpenAddSession}
          >
            <Plus size={16} />

            Add Session
          </button>
        </div>
      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />

          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
            className="alert-close"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* =====================================================
          FILTERS
      ===================================================== */}

      <div className="filters-card">
        <div className="search-box">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search degree class or session..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="clear-search"
            >
              <X size={15} />
            </button>
          )}
        </div>

        <select
          value={termFilter}
          onChange={(event) =>
            setTermFilter(event.target.value)
          }
          className="filter-select"
        >
          <option value="">All Terms</option>
          <option value="Spring">Spring</option>
          <option value="Fall">Fall</option>
        </select>

        <select
          value={yearFilter}
          onChange={(event) =>
            setYearFilter(event.target.value)
          }
          className="filter-select"
        >
          <option value="">All Years</option>

          {availableYears.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>

        {(search || termFilter || yearFilter) && (
          <button
            type="button"
            className="btn btn-light"
            onClick={handleResetFilters}
          >
            <X size={15} />

            Clear
          </button>
        )}
      </div>

      {/* =====================================================
          TABLE
      ===================================================== */}

      <div className="table-card">
        <div className="table-card-header">
          <div>
            <h2>Degree Class Sessions</h2>

            <p>
              Each degree class contains all its generated
              academic sessions.
            </p>
          </div>

          <div className="table-count">
            {groupedSessions.length} Degree Class
            {groupedSessions.length !== 1 ? "es" : ""}
          </div>
        </div>

        {loading ? (
          <div className="empty-state">
            <RefreshCw
              size={28}
              className="spin-animation"
            />

            <p>Loading sessions...</p>
          </div>
        ) : groupedSessions.length === 0 ? (
          <div className="empty-state">
            <CalendarDays size={42} />

            <h3>No Degree Classes Found</h3>

            <p>
              No degree class or session matches your
              current filters.
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="sessions-table">
              <thead>
                <tr>
                  <th>DEGREE CLASS</th>
                  <th>TOTAL SEMESTERS</th>
                  <th>CREATED SESSIONS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>

              <tbody>
                {groupedSessions.map((group) => (
                  <tr key={group.degreeClassId}>
                    {/* DEGREE CLASS */}
                    <td>
                      <div className="degree-class-cell">
                        <div className="degree-class-icon">
                          <CalendarDays size={19} />
                        </div>

                        <div>
                          <strong>
                            {group.degreeClassName}
                          </strong>

                          {group.degreeClassCode &&
                            group.degreeClassCode !==
                              group.degreeClassName && (
                              <span className="sub-text">
                                {group.degreeClassCode}
                              </span>
                            )}
                        </div>
                      </div>
                    </td>

                    {/* TOTAL SEMESTERS */}
                    <td>
                      <div className="semester-count">
                        <strong>
                          {group.totalSemesters}
                        </strong>

                        <span>
                          {group.duration} Year
                          {group.duration !== 1
                            ? "s"
                            : ""}
                        </span>
                      </div>
                    </td>

                    {/* CREATED SESSIONS */}
                    <td>
                      {group.sessions.length === 0 ? (
                        <div className="no-sessions">
                          <XCircle size={16} />

                          <span>
                            No sessions created
                          </span>
                        </div>
                      ) : (
                        <div className="created-sessions">
                          {group.sessions.map(
                            (session, index) => (
                              <div
                                className={`session-chip ${
                                  session.isActive
                                    ? "session-chip-active"
                                    : ""
                                }`}
                                key={
                                  getId(session) ||
                                  `${group.degreeClassId}-${session.term}-${session.year}`
                                }
                              >
                                <div className="session-chip-number">
                                  {index + 1}
                                </div>

                                <div className="session-chip-content">
                                  <strong>
                                    {session.term}{" "}
                                    {session.year}
                                  </strong>

                                  {session.name && (
                                    <span>
                                      {session.name}
                                    </span>
                                  )}

                                  {session.isActive && (
                                    <small>
                                      Active
                                    </small>
                                  )}
                                </div>

                                <div className="session-chip-actions">
                                  <button
                                    type="button"
                                    title="View Session"
                                    onClick={() =>
                                      handleView(session)
                                    }
                                  >
                                    <Eye size={14} />
                                  </button>

                                  <button
                                    type="button"
                                    title="Edit Session"
                                    onClick={() =>
                                      handleEdit(session)
                                    }
                                  >
                                    <Pencil size={14} />
                                  </button>

                                  <button
                                    type="button"
                                    title="Delete Session"
                                    className="danger-action"
                                    disabled={
                                      deletingId ===
                                      getId(session)
                                    }
                                    onClick={() =>
                                      handleDelete(session)
                                    }
                                  >
                                    {deletingId ===
                                    getId(session) ? (
                                      <RefreshCw
                                        size={14}
                                        className="spin-animation"
                                      />
                                    ) : (
                                      <Trash2
                                        size={14}
                                      />
                                    )}
                                  </button>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      )}
                    </td>

                    {/* ACTIONS */}
                    <td>
                      <div className="class-actions">
                        {group.sessions.length > 0 ? (
                          <>
                            <span className="session-total-badge">
                              {group.sessions.length}/
                              {group.totalSemesters}{" "}
                              Created
                            </span>
                          </>
                        ) : (
                          <span className="session-total-badge">
                            0/{group.totalSemesters}{" "}
                            Created
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* =====================================================
          ADD SESSION MODAL
      ===================================================== */}

      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <div>
                <h2>Add Session</h2>

                <p>
                  Create an academic session manually.
                </p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() =>
                  setShowAddModal(false)
                }
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleAddSession}
              className="modal-body"
            >
              <div className="form-group">
                <label>
                  Degree Class{" "}
                  <span className="required">*</span>
                </label>

                <select
                  value={addForm.degreeClassId}
                  onChange={(event) =>
                    setAddForm((prev) => ({
                      ...prev,
                      degreeClassId:
                        event.target.value,
                    }))
                  }
                  required
                >
                  <option value="">
                    Select Degree Class
                  </option>

                  {degreeClasses.map(
                    (degreeClass) => (
                      <option
                        key={getId(degreeClass)}
                        value={getId(degreeClass)}
                      >
                        {getDegreeClassName(
                          degreeClass
                        )}
                        {getDegreeClassCode(
                          degreeClass
                        )
                          ? ` (${getDegreeClassCode(
                              degreeClass
                            )})`
                          : ""}
                      </option>
                    )
                  )}
                </select>
              </div>

              {selectedAddClass && (
                <div className="info-box">
                  <div>
                    <strong>
                      {getDegreeClassName(
                        selectedAddClass
                      )}
                    </strong>

                    <span>
                      Total Semesters:{" "}
                      {getTotalSemesters(
                        selectedAddClass
                      )}
                    </span>
                  </div>
                </div>
              )}

              <div className="form-group">
                <label>
                  Session Name
                </label>

                <input
                  type="text"
                  placeholder="e.g. Spring 2026"
                  value={addForm.name}
                  onChange={(event) =>
                    setAddForm((prev) => ({
                      ...prev,
                      name: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    Term{" "}
                    <span className="required">
                      *
                    </span>
                  </label>

                  <select
                    value={addForm.term}
                    onChange={(event) =>
                      setAddForm((prev) => ({
                        ...prev,
                        term: event.target.value,
                      }))
                    }
                    required
                  >
                    <option value="">
                      Select Term
                    </option>

                    <option value="Spring">
                      Spring
                    </option>

                    <option value="Fall">
                      Fall
                    </option>
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    Year{" "}
                    <span className="required">
                      *
                    </span>
                  </label>

                  <input
                    type="number"
                    min="2000"
                    max="2100"
                    value={addForm.year}
                    onChange={(event) =>
                      setAddForm((prev) => ({
                        ...prev,
                        year: event.target.value,
                      }))
                    }
                    required
                  />
                </div>
              </div>

              <div className="checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={addForm.isActive}
                    onChange={(event) =>
                      setAddForm((prev) => ({
                        ...prev,
                        isActive:
                          event.target.checked,
                      }))
                    }
                  />

                  <span>
                    Set as active session
                  </span>
                </label>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() =>
                    setShowAddModal(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  <Plus size={16} />

                  Create Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          GENERATE SESSION MODAL
      ===================================================== */}

      {showGenerateModal && (
        <div className="modal-overlay">
          <div className="modal modal-large">
            <div className="modal-header">
              <div>
                <h2>
                  <Sparkles size={20} />

                  Generate Sessions
                </h2>

                <p>
                  Automatically generate all sessions
                  according to the degree duration.
                </p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() =>
                  setShowGenerateModal(false)
                }
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleGenerate}
              className="modal-body"
            >
              <div className="form-group">
                <label>
                  Degree Class{" "}
                  <span className="required">*</span>
                </label>

                <select
                  value={generateForm.degreeClassId}
                  onChange={(event) =>
                    setGenerateForm((prev) => ({
                      ...prev,
                      degreeClassId:
                        event.target.value,
                    }))
                  }
                  required
                >
                  <option value="">
                    Select Degree Class
                  </option>

                  {degreeClasses.map(
                    (degreeClass) => (
                      <option
                        key={getId(degreeClass)}
                        value={getId(degreeClass)}
                      >
                        {getDegreeClassName(
                          degreeClass
                        )}
                        {getDegreeClassCode(
                          degreeClass
                        )
                          ? ` (${getDegreeClassCode(
                              degreeClass
                            )})`
                          : ""}
                      </option>
                    )
                  )}
                </select>
              </div>

              {selectedGenerateClass && (
                <div className="generate-info">
                  <div className="generate-info-item">
                    <span>Degree Class</span>

                    <strong>
                      {getDegreeClassName(
                        selectedGenerateClass
                      )}
                    </strong>
                  </div>

                  <div className="generate-info-item">
                    <span>Duration</span>

                    <strong>
                      {getDuration(
                        selectedGenerateClass
                      )}{" "}
                      Year
                      {getDuration(
                        selectedGenerateClass
                      ) !== 1
                        ? "s"
                        : ""}
                    </strong>
                  </div>

                  <div className="generate-info-item">
                    <span>Total Semesters</span>

                    <strong>
                      {getTotalSemesters(
                        selectedGenerateClass
                      )}
                    </strong>
                  </div>
                </div>
              )}

              <div className="form-group">
                <label>
                  Start Year{" "}
                  <span className="required">
                    *
                  </span>
                </label>

                <input
                  type="number"
                  min="2000"
                  max="2100"
                  value={generateForm.startYear}
                  onChange={(event) =>
                    setGenerateForm((prev) => ({
                      ...prev,
                      startYear:
                        event.target.value,
                    }))
                  }
                  required
                />

                <small className="form-help">
                  Sessions will alternate between
                  Spring and Fall.
                </small>
              </div>

              {selectedGenerateClass && (
                <div className="generation-preview">
                  <h4>Session Sequence</h4>

                  <div className="preview-sessions">
                    {Array.from(
                      {
                        length:
                          getTotalSemesters(
                            selectedGenerateClass
                          ),
                      },
                      (_, index) => {
                        const year =
                          Number(
                            generateForm.startYear
                          ) +
                          Math.floor(index / 2);

                        const term =
                          index % 2 === 0
                            ? "Spring"
                            : "Fall";

                        return (
                          <span
                            key={`${term}-${year}`}
                            className="preview-session-chip"
                          >
                            {index + 1}. {term}{" "}
                            {year}
                          </span>
                        );
                      }
                    )}
                  </div>
                </div>
              )}

              {generateResult && (
                <div className="generation-result">
                  <div className="result-header">
                    <CheckCircle2 size={20} />

                    <strong>
                      Generation Result
                    </strong>
                  </div>

                  <p className="result-message">
                    {generateResult.message}
                  </p>

                  {generateResult.created
                    ?.length > 0 && (
                    <div className="result-section">
                      <h4>
                        Created Sessions (
                        {
                          generateResult.created
                            .length
                        }
                        )
                      </h4>

                      <ul>
                        {generateResult.created.map(
                          (item, index) => {
                            const session =
                              item?.session ||
                              item;

                            return (
                              <li
                                key={
                                  getId(session) ||
                                  `${index}-${session?.year}`
                                }
                              >
                                <CheckCircle2
                                  size={15}
                                />

                                <span>
                                  Semester{" "}
                                  {item?.semester ||
                                    index + 1}
                                  :{" "}
                                  {session?.name ||
                                    `${session?.term || ""} ${
                                      session?.year ||
                                      ""
                                    }`}
                                </span>
                              </li>
                            );
                          }
                        )}
                      </ul>
                    </div>
                  )}

                  {generateResult.skipped
                    ?.length > 0 && (
                    <div className="result-section">
                      <h4>
                        Skipped Sessions (
                        {
                          generateResult.skipped
                            .length
                        }
                        )
                      </h4>

                      <ul>
                        {generateResult.skipped.map(
                          (item, index) => (
                            <li
                              key={
                                item?.sessionId ||
                                `${item?.semester}-${index}`
                              }
                            >
                              <AlertCircle
                                size={15}
                              />

                              <span>
                                Semester{" "}
                                {item?.semester ||
                                  index + 1}
                                :{" "}
                                {item?.name ||
                                  item?.sessionName ||
                                  "Already exists"}
                              </span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() =>
                    setShowGenerateModal(false)
                  }
                >
                  Close
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={generating}
                >
                  {generating ? (
                    <>
                      <RefreshCw
                        size={16}
                        className="spin-animation"
                      />

                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />

                      Generate Sessions
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          VIEW SESSION MODAL
      ===================================================== */}

      {showViewModal && viewingSession && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <div>
                <h2>Session Details</h2>

                <p>
                  View academic session information.
                </p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() => {
                  setShowViewModal(false);
                  setViewingSession(null);
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="details-grid">
                <div className="detail-item">
                  <span>Degree Class</span>

                  <strong>
                    {getDegreeClassName(
                      viewingSession.degreeClassId
                    )}
                  </strong>
                </div>

                <div className="detail-item">
                  <span>Degree Code</span>

                  <strong>
                    {getDegreeClassCode(
                      viewingSession.degreeClassId
                    ) || "—"}
                  </strong>
                </div>

                <div className="detail-item">
                  <span>Total Semesters</span>

                  <strong>
                    {getTotalSemesters(
                      viewingSession.degreeClassId
                    )}
                  </strong>
                </div>

                <div className="detail-item">
                  <span>Session</span>

                  <strong>
                    {getSessionLabel(
                      viewingSession
                    )}
                  </strong>
                </div>

                <div className="detail-item">
                  <span>Term</span>

                  <strong>
                    {viewingSession.term || "—"}
                  </strong>
                </div>

                <div className="detail-item">
                  <span>Year</span>

                  <strong>
                    {viewingSession.year || "—"}
                  </strong>
                </div>

                <div className="detail-item">
                  <span>Status</span>

                  <strong
                    className={
                      viewingSession.isActive
                        ? "status-active"
                        : "status-inactive"
                    }
                  >
                    {viewingSession.isActive
                      ? "Active"
                      : "Inactive"}
                  </strong>
                </div>

                <div className="detail-item">
                  <span>Session ID</span>

                  <strong className="id-text">
                    {getId(viewingSession) ||
                      "—"}
                  </strong>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowViewModal(false);
                    setViewingSession(null);
                  }}
                >
                  Close
                </button>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    setShowViewModal(false);
                    handleEdit(viewingSession);
                  }}
                >
                  <Pencil size={16} />

                  Edit Session
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          EDIT SESSION MODAL
      ===================================================== */}

      {showEditModal && editingSession && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <div>
                <h2>Edit Session</h2>

                <p>
                  Update academic session information.
                </p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingSession(null);
                }}
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleUpdate}
              className="modal-body"
            >
              <div className="form-group">
                <label>
                  Degree Class{" "}
                  <span className="required">
                    *
                  </span>
                </label>

                <select
                  value={editForm.degreeClassId}
                  onChange={(event) =>
                    setEditForm((prev) => ({
                      ...prev,
                      degreeClassId:
                        event.target.value,
                    }))
                  }
                  required
                >
                  <option value="">
                    Select Degree Class
                  </option>

                  {degreeClasses.map(
                    (degreeClass) => (
                      <option
                        key={getId(degreeClass)}
                        value={getId(degreeClass)}
                      >
                        {getDegreeClassName(
                          degreeClass
                        )}
                        {getDegreeClassCode(
                          degreeClass
                        )
                          ? ` (${getDegreeClassCode(
                              degreeClass
                            )})`
                          : ""}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="form-group">
                <label>Session Name</label>

                <input
                  type="text"
                  placeholder="e.g. Spring 2026"
                  value={editForm.name}
                  onChange={(event) =>
                    setEditForm((prev) => ({
                      ...prev,
                      name: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    Term{" "}
                    <span className="required">
                      *
                    </span>
                  </label>

                  <select
                    value={editForm.term}
                    onChange={(event) =>
                      setEditForm((prev) => ({
                        ...prev,
                        term: event.target.value,
                      }))
                    }
                    required
                  >
                    <option value="">
                      Select Term
                    </option>

                    <option value="Spring">
                      Spring
                    </option>

                    <option value="Fall">
                      Fall
                    </option>
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    Year{" "}
                    <span className="required">
                      *
                    </span>
                  </label>

                  <input
                    type="number"
                    min="2000"
                    max="2100"
                    value={editForm.year}
                    onChange={(event) =>
                      setEditForm((prev) => ({
                        ...prev,
                        year: event.target.value,
                      }))
                    }
                    required
                  />
                </div>
              </div>

              <div className="checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={editForm.isActive}
                    onChange={(event) =>
                      setEditForm((prev) => ({
                        ...prev,
                        isActive:
                          event.target.checked,
                      }))
                    }
                  />

                  <span>
                    Set as active session
                  </span>
                </label>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingSession(null);
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  <CheckCircle2 size={16} />

                  Update Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sessions;