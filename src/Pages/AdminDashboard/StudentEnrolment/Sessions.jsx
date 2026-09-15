import React, {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Plus,
    Search,
    Pencil,
    Trash2,
    CalendarDays,
    Clock3,
    CheckCircle2,
    XCircle,
    Eye,
    X,
    CalendarRange,
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
    getSessionStatus,
} from "../../../services/sessionAPI";

import { getDegreeClasses } from "../../../services/degreeClassAPI";

import {
    getBatches,
    getBatchSemesters,
} from "../../../services/batchAPI";

import "./Sessions.css";


const Sessions = () => {

    // =====================================================
    // STATE
    // =====================================================

    const [sessions, setSessions] = useState([]);

    const [degreeClasses, setDegreeClasses] = useState([]);

    const [sessionStatus, setSessionStatus] = useState(null);

    const [loading, setLoading] = useState(true);

    const [generating, setGenerating] = useState(false);

    const [deletingId, setDeletingId] = useState(null);

    const [error, setError] = useState("");

    const [search, setSearch] = useState("");

    const [termFilter, setTermFilter] =
        useState("all");

    const [yearFilter, setYearFilter] =
        useState("all");

    const [statusFilter, setStatusFilter] =
        useState("all");

    const [showGenerateModal, setShowGenerateModal] =
        useState(false);

    const [showAddModal, setShowAddModal] =
        useState(false);

    // Holds { message, created, skipped } after a successful Generate
    // call, so we can show the user exactly which sessions were made
    // vs already existed — cleared when the modal is closed.
    const [generateResult, setGenerateResult] =
        useState(null);

    // Info panel shown when a Degree Class is picked in the Generate
    // form: which sessions its batch(es) have used, which is current,
    // which is next expected. Purely informational — does not affect
    // what gets generated.
    const [classSessionInfo, setClassSessionInfo] =
        useState(null);

    const [loadingClassInfo, setLoadingClassInfo] =
        useState(false);

    const [showEditModal, setShowEditModal] =
        useState(false);

    const [viewingSession, setViewingSession] =
        useState(null);

    const [editingSession, setEditingSession] =
        useState(null);


    // =====================================================
    // GENERATE FORM
    // =====================================================

    const [generateForm, setGenerateForm] =
        useState({
            degreeClassId: "",
            startYear: new Date().getFullYear(),
        });

    const [addForm, setAddForm] = useState({
        name: "",
        term: "",
        year: new Date().getFullYear(),
        isActive: true,
    });


    // =====================================================
    // EDIT FORM
    // =====================================================

    const [editForm, setEditForm] =
        useState({
            name: "",
            term: "",
            year: "",
            startDate: "",
            endDate: "",
            isActive: false,
        });


    // =====================================================
    // ID HELPER
    // =====================================================

    const getId = (item) => {
        return item?._id || item?.id;
    };


    // =====================================================
    // FETCH ALL DATA
    // =====================================================

    const fetchData = async () => {

        try {

            setLoading(true);

            setError("");

            const [
                sessionsResponse,
                statusResponse,
                degreeClassesResponse,
            ] = await Promise.all([
                getSessions(),
                getSessionStatus(),
                getDegreeClasses(),
            ]);


            // -------------------------------
            // Sessions
            // -------------------------------

            const sessionData =
                sessionsResponse?.data ||
                sessionsResponse ||
                [];


            setSessions(
                Array.isArray(sessionData)
                    ? sessionData
                    : []
            );


            // -------------------------------
            // Status
            // -------------------------------

            const statusData =
                statusResponse?.data ||
                statusResponse ||
                null;


            setSessionStatus(statusData);


            // -------------------------------
            // Degree Classes
            // -------------------------------

            const degreeClassData =
                degreeClassesResponse?.data ||
                degreeClassesResponse ||
                [];


            setDegreeClasses(
                Array.isArray(degreeClassData)
                    ? degreeClassData
                    : []
            );

        } catch (err) {

            console.error(
                "Session fetch error:",
                err
            );

            setError(
                err?.response?.data?.message ||
                err?.message ||
                "Failed to load sessions."
            );

        } finally {

            setLoading(false);
        }
    };


    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {

        fetchData();

    }, []);


    // =====================================================
    // GET STATUS FOR SESSION
    //
    // Uses backend status response.
    // If not found, calculates fallback.
    // =====================================================

    const getStatus = (session) => {

        const backendSession =
            sessionStatus?.sessions?.find(
                (item) =>
                    String(getId(item)) ===
                    String(getId(session))
            );

        if (backendSession?.status) {
            return backendSession.status;
        }


        const today = new Date();

        const start = new Date(
            session.startDate
        );

        const end = new Date(
            session.endDate
        );


        if (today > end) {
            return "completed";
        }

        if (
            today >= start &&
            today <= end
        ) {
            return "ongoing";
        }

        return "upcoming";
    };


    // =====================================================
    // SEARCH + FILTER
    // =====================================================

    const filteredSessions = useMemo(() => {

        const value =
            search
                .toLowerCase()
                .trim();


        return sessions.filter(
            (session) => {

                const status =
                    getStatus(session);


                const matchesSearch =
                    !value ||
                    session.name
                        ?.toLowerCase()
                        .includes(value) ||
                    session.term
                        ?.toLowerCase()
                        .includes(value) ||
                    String(
                        session.year || ""
                    ).includes(value);


                const matchesTerm =
                    termFilter === "all" ||
                    session.term ===
                        termFilter;


                const matchesYear =
                    yearFilter === "all" ||
                    String(
                        session.year
                    ) ===
                        String(
                            yearFilter
                        );


                const matchesStatus =
                    statusFilter === "all" ||
                    status ===
                        statusFilter;


                return (
                    matchesSearch &&
                    matchesTerm &&
                    matchesYear &&
                    matchesStatus
                );
            }
        );

    }, [
        sessions,
        search,
        termFilter,
        yearFilter,
        statusFilter,
        sessionStatus,
    ]);


    // =====================================================
    // AVAILABLE YEARS
    // =====================================================

    const availableYears = useMemo(() => {

        const years =
            sessions
                .map(
                    (session) =>
                        session.year
                )
                .filter(Boolean);


        return [
            ...new Set(years),
        ].sort(
            (a, b) =>
                Number(b) -
                Number(a)
        );

    }, [sessions]);


    // =====================================================
    // GENERATE FORM CHANGE
    // =====================================================

    const handleGenerateChange = (e) => {

        const {
            name,
            value,
        } = e.target;


        setGenerateForm(
            (prev) => ({
                ...prev,
                [name]: value,
            })
        );

        if (name === "degreeClassId") {
            fetchClassSessionInfo(value);
        }
    };


    // =====================================================
    // CLASS SESSION INFO
    //
    // Informational only — for the selected Degree Class,
    // find its batch(es), and for each show which sessions
    // it has used so far (history), which one is current,
    // and which one is next expected (from batch advance logic).
    // =====================================================

    const fetchClassSessionInfo = async (
        degreeClassId
    ) => {

        if (!degreeClassId) {

            setClassSessionInfo(null);

            return;
        }

        try {

            setLoadingClassInfo(true);

            setClassSessionInfo(null);

            const batchesResponse =
                await getBatches();

            const allBatches =
                batchesResponse?.data ||
                batchesResponse ||
                [];

            const classBatches = (
                Array.isArray(allBatches)
                    ? allBatches
                    : []
            ).filter((batch) => {

                const batchClassId =
                    batch.degreeClassId?._id ||
                    batch.degreeClassId?.id ||
                    batch.degreeClassId;

                return (
                    String(batchClassId) ===
                    String(degreeClassId)
                );
            });

            if (classBatches.length === 0) {

                setClassSessionInfo({
                    batches: [],
                });

                return;
            }

            const batchSummaries =
                await Promise.all(
                    classBatches.map(
                        async (batch) => {

                            const batchId =
                                getId(batch);

                            try {

                                const semResponse =
                                    await getBatchSemesters(
                                        batchId
                                    );

                                const semData =
                                    semResponse?.data ||
                                    semResponse ||
                                    {};

                                const history =
                                    Array.isArray(
                                        semData.history
                                    )
                                        ? semData.history
                                        : [];

                                const currentLog =
                                    history.find(
                                        (log) =>
                                            log.semester ===
                                            semData.current
                                    );

                                return {
                                    batchId,

                                    batchName:
                                        batch.name ||
                                        `${
                                            batch.degreeClassId
                                                ?.code ||
                                            "Batch"
                                        }-${
                                            batch
                                                .startSessionId
                                                ?.year || ""
                                        }`,

                                    status: semData.status,

                                    usedSessions:
                                        history.map(
                                            (log) => ({
                                                semester:
                                                    log.semester,
                                                sessionName:
                                                    log.sessionId
                                                        ?.name ||
                                                    "-",
                                            })
                                        ),

                                    currentSessionName:
                                        currentLog
                                            ?.sessionId
                                            ?.name ||
                                        null,

                                    currentSemester:
                                        semData.current ||
                                        null,

                                    nextExpectedSessionName:
                                        semData
                                            .nextExpectedSession
                                            ?.name ||
                                        null,
                                };

                            } catch (err) {

                                return {
                                    batchId,

                                    batchName:
                                        batch.name ||
                                        "Batch",

                                    error:
                                        "Could not load semester history for this batch.",
                                };
                            }
                        }
                    )
                );

            setClassSessionInfo({
                batches: batchSummaries,
            });

        } catch (err) {

            console.error(
                "Class session info fetch error:",
                err
            );

            setClassSessionInfo({
                error:
                    "Could not load session info for this class.",
            });

        } finally {

            setLoadingClassInfo(false);
        }
    };


    // =====================================================
    // OPEN GENERATE MODAL
    // =====================================================

    const handleOpenGenerate = () => {

        setError("");

        setClassSessionInfo(null);

        setGenerateForm({
            degreeClassId:
                degreeClasses.length === 1
                    ? getId(
                          degreeClasses[0]
                      )
                    : "",
            startYear: new Date().getFullYear(),
        });

        setShowGenerateModal(true);
    };

    const handleOpenAddSession = () => {
        setError("");
        setAddForm({
            name: "",
            term: "",
            year: new Date().getFullYear(),
            isActive: true,
        });
        setShowAddModal(true);
    };

    const handleAddSession = async (e) => {
        e.preventDefault();
        setError("");

        if (!addForm.name.trim()) {
            setError("Session name is required.");
            return;
        }

        if (!addForm.term) {
            setError("Please select a term.");
            return;
        }

        if (!addForm.year) {
            setError("Year is required.");
            return;
        }

        try {
            setGenerating(true);

            const payload = {
                name: addForm.name.trim(),
                term: addForm.term,
                year: Number(addForm.year),
                isActive: Boolean(addForm.isActive),
            };

            await createSession(payload);
            setShowAddModal(false);
            await fetchData();
        } catch (err) {
            console.error("Create session error:", err);
            setError(
                err?.response?.data?.message ||
                err?.message ||
                "Failed to create session."
            );
        } finally {
            setGenerating(false);
        }
    };


    // =====================================================
    // GENERATE SESSIONS
    // =====================================================

    const handleGenerate = async (e) => {

        e.preventDefault();

        setError("");

        if (!generateForm.degreeClassId) {
            setError("Please select a degree class.");
            return;
        }

        if (!generateForm.startYear) {
            setError("Please enter a start year.");
            return;
        }

        try {

            setGenerating(true);

            const payload = {
                degreeClassId: generateForm.degreeClassId,
                startYear: Number(generateForm.startYear),
            };

            const response = await generateSessions(payload);

            const result = response?.data || response || {};

            setGenerateResult({
                message:
                    response?.message ||
                    `${result?.created?.length || 0} session(s) created, ${
                        result?.skipped?.length || 0
                    } skipped`,

                created:
                    Array.isArray(result?.created)
                        ? result.created
                        : [],

                skipped:
                    Array.isArray(result?.skipped)
                        ? result.skipped
                        : [],
            });

            await fetchData();

        } catch (err) {

            console.error(
                "Generate session error:",
                err
            );

            setError(
                err?.response?.data?.message ||
                err?.message ||
                "Failed to generate sessions."
            );

        } finally {

            setGenerating(false);
        }
    };


    // =====================================================
    // EDIT SESSION
    //
    // This is only for correction/admin maintenance.
    // Normal creation should use Generate.
    // =====================================================

    const handleEdit = (session) => {

        setEditingSession(session);

        setEditForm({

            name:
                session.name ||
                "",

            term:
                session.term ||
                "",

            year:
                session.year ||
                "",

            startDate:
                session.startDate
                    ? session.startDate.substring(
                          0,
                          10
                      )
                    : "",

            endDate:
                session.endDate
                    ? session.endDate.substring(
                          0,
                          10
                      )
                    : "",

            isActive:
                session.isActive === true,
        });


        setError("");

        setShowEditModal(true);
    };


    // =====================================================
    // EDIT FORM CHANGE
    // =====================================================

    const handleEditChange = (e) => {

        const {
            name,
            value,
            type,
            checked,
        } = e.target;


        setEditForm(
            (prev) => ({
                ...prev,

                [name]:
                    type ===
                    "checkbox"
                        ? checked
                        : value,
            })
        );
    };


    // =====================================================
    // UPDATE SESSION
    // =====================================================

    const handleUpdate = async (e) => {

        e.preventDefault();

        setError("");


        if (
            !editForm.name.trim()
        ) {

            setError(
                "Session name is required."
            );

            return;
        }


        if (!editForm.term) {

            setError(
                "Term is required."
            );

            return;
        }


        if (!editForm.year) {

            setError(
                "Year is required."
            );

            return;
        }


        if (!editForm.startDate) {

            setError(
                "Start date is required."
            );

            return;
        }


        if (!editForm.endDate) {

            setError(
                "End date is required."
            );

            return;
        }


        if (
            new Date(
                editForm.endDate
            ) <
            new Date(
                editForm.startDate
            )
        ) {

            setError(
                "End date cannot be before start date."
            );

            return;
        }


        try {

            setGenerating(true);


            const sessionId =
                getId(
                    editingSession
                );


            const payload = {

                name:
                    editForm.name.trim(),

                term:
                    editForm.term,

                year:
                    Number(
                        editForm.year
                    ),

                startDate:
                    editForm.startDate,

                endDate:
                    editForm.endDate,

                isActive:
                    editForm.isActive,
            };


            const response =
                await updateSession(
                    sessionId,
                    payload
                );


            const updated =
                response?.data ||
                response ||
                {};


            setSessions(
                (prev) =>
                    prev.map(
                        (item) =>
                            String(
                                getId(item)
                            ) ===
                            String(
                                sessionId
                            )
                                ? {
                                      ...item,
                                      ...updated,
                                      ...payload,
                                  }
                                : item
                    )
            );


            setShowEditModal(
                false
            );

            setEditingSession(
                null
            );


            await fetchData();

        } catch (err) {

            console.error(
                "Update session error:",
                err
            );


            setError(
                err?.response?.data?.message ||
                err?.message ||
                "Failed to update session."
            );

        } finally {

            setGenerating(false);
        }
    };


    // =====================================================
    // DELETE
    // =====================================================

    const handleDelete = async (
        session
    ) => {

        const sessionId =
            getId(session);


        const confirmed =
            window.confirm(
                `Are you sure you want to delete "${session.name}"?`
            );


        if (!confirmed) {
            return;
        }


        try {

            setDeletingId(
                sessionId
            );


            await deleteSession(
                sessionId
            );


            setSessions(
                (prev) =>
                    prev.filter(
                        (item) =>
                            String(
                                getId(item)
                            ) !==
                            String(
                                sessionId
                            )
                    )
            );


            await fetchData();

        } catch (err) {

            console.error(
                "Delete session error:",
                err
            );


            alert(
                err?.response?.data?.message ||
                "Failed to delete session."
            );

        } finally {

            setDeletingId(
                null
            );
        }
    };


    // =====================================================
    // CLOSE GENERATE
    // =====================================================

    const closeGenerateModal = () => {

        if (generating) {
            return;
        }


        setShowGenerateModal(
            false
        );

        setGenerateResult(
            null
        );

        setClassSessionInfo(
            null
        );

        setGenerateForm({
            degreeClassId: "",
            startYear: new Date().getFullYear(),
        });
    };

    const closeAddModal = () => {
        if (generating) {
            return;
        }

        setShowAddModal(false);
        setError("");
        setAddForm({
            name: "",
            term: "",
            year: new Date().getFullYear(),
            isActive: true,
        });
    };


    // =====================================================
    // CLOSE EDIT
    // =====================================================

    const closeEditModal = () => {

        if (generating) {
            return;
        }


        setShowEditModal(
            false
        );

        setEditingSession(
            null
        );
    };


    // =====================================================
    // FORMAT DATE
    // =====================================================

    const formatDate = (date) => {

        if (!date) {
            return "-";
        }


        const parsed =
            new Date(date);


        if (
            Number.isNaN(
                parsed.getTime()
            )
        ) {

            return "-";
        }


        return parsed.toLocaleDateString(
            "en-US",
            {
                month: "short",
                day: "2-digit",
                year: "numeric",
            }
        );
    };


    // =====================================================
    // STATUS LABEL
    // =====================================================

    const getStatusLabel = (
        status
    ) => {

        if (
            status ===
            "ongoing"
        ) {
            return "Ongoing";
        }

        if (
            status ===
            "completed"
        ) {
            return "Completed";
        }

        return "Upcoming";
    };


    // =====================================================
    // STATS
    // =====================================================

    const totalSessions =
        sessions.length;


    const completedSessions =
        sessionStatus?.completedCount ??
        sessions.filter(
            (session) =>
                getStatus(session) ===
                "completed"
        ).length;


    const ongoingSessions =
        sessionStatus?.ongoingCount ??
        sessions.filter(
            (session) =>
                getStatus(session) ===
                "ongoing"
        ).length;


    const upcomingSessions =
        sessionStatus?.upcomingCount ??
        sessions.filter(
            (session) =>
                getStatus(session) ===
                "upcoming"
        ).length;


    const needsNextSession =
        sessionStatus?.needsNextSession ||
        false;


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <div className="sessions-page">


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="sessions-header">

                <div className="session-title-section">

                    <div className="session-main-icon">
                        <CalendarDays
                            size={27}
                        />
                    </div>

                    <div>

                        <h1>
                            Academic Sessions
                        </h1>

                        <p>
                            Manage Spring, Fall,
                            academic years and
                            session history
                        </p>

                    </div>

                </div>


                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <button
                        className="add-session-btn"
                        onClick={
                            handleOpenAddSession
                        }
                        style={{ background: "#3b82f6" }}
                    >
                        <Plus size={18} />
                        Add Session
                    </button>

                    <button
                        className="add-session-btn"
                        onClick={
                            handleOpenGenerate
                        }
                    >

                        <Sparkles
                            size={18}
                        />

                        Generate Sessions

                    </button>
                </div>

            </div>


            {/* =================================================
                NEXT SESSION WARNING
            ================================================= */}

            {needsNextSession && (

                <div className="next-session-alert">

                    <div className="next-session-alert-icon">

                        <AlertCircle
                            size={21}
                        />

                    </div>

                    <div className="next-session-alert-content">

                        <strong>
                            Next academic session required
                        </strong>

                        <span>
                            The last available session
                            has been completed. Create
                            the next Spring + Fall cycle
                            when the new academic year
                            is ready.
                        </span>

                    </div>

                    <button
                        onClick={
                            handleOpenGenerate
                        }
                    >
                        Generate Next Session
                    </button>

                </div>

            )}


            {/* =================================================
                PAGE ERROR
            ================================================= */}

            {error &&
                !showGenerateModal &&
                !showEditModal && (

                    <div className="session-page-error">

                        <span>
                            {error}
                        </span>

                        <button
                            onClick={
                                fetchData
                            }
                        >
                            Retry
                        </button>

                    </div>
                )}


            {/* =================================================
                STATS
            ================================================= */}

            <div className="session-stats">


                <div className="session-stat-card">

                    <div>

                        <span>
                            Total Sessions
                        </span>

                        <strong>
                            {totalSessions}
                        </strong>

                    </div>

                    <div className="session-stat-icon blue">

                        <CalendarRange
                            size={21}
                        />

                    </div>

                </div>


                <div className="session-stat-card">

                    <div>

                        <span>
                            Completed
                        </span>

                        <strong>
                            {completedSessions}
                        </strong>

                    </div>

                    <div className="session-stat-icon gray">

                        <CheckCircle2
                            size={21}
                        />

                    </div>

                </div>


                <div className="session-stat-card">

                    <div>

                        <span>
                            Ongoing
                        </span>

                        <strong>
                            {ongoingSessions}
                        </strong>

                    </div>

                    <div className="session-stat-icon green">

                        <Clock3
                            size={21}
                        />

                    </div>

                </div>


                <div className="session-stat-card">

                    <div>

                        <span>
                            Upcoming
                        </span>

                        <strong>
                            {upcomingSessions}
                        </strong>

                    </div>

                    <div className="session-stat-icon purple">

                        <CalendarDays
                            size={21}
                        />

                    </div>

                </div>

            </div>


            {/* =================================================
                TOOLBAR
            ================================================= */}

            <div className="sessions-toolbar">


                <div className="session-search">

                    <Search
                        size={18}
                    />

                    <input
                        type="text"
                        placeholder="Search sessions..."
                        value={
                            search
                        }
                        onChange={(e) =>
                            setSearch(
                                e.target.value
                            )
                        }
                    />

                </div>


                <select
                    className="session-filter"
                    value={
                        termFilter
                    }
                    onChange={(e) =>
                        setTermFilter(
                            e.target.value
                        )
                    }
                >

                    <option value="all">
                        All Terms
                    </option>

                    <option value="Spring">
                        Spring
                    </option>

                    <option value="Fall">
                        Fall
                    </option>

                </select>


                <select
                    className="session-filter"
                    value={
                        yearFilter
                    }
                    onChange={(e) =>
                        setYearFilter(
                            e.target.value
                        )
                    }
                >

                    <option value="all">
                        All Years
                    </option>

                    {availableYears.map(
                        (year) => (

                            <option
                                key={year}
                                value={year}
                            >
                                {year}
                            </option>

                        )
                    )}

                </select>


                <select
                    className="session-filter"
                    value={
                        statusFilter
                    }
                    onChange={(e) =>
                        setStatusFilter(
                            e.target.value
                        )
                    }
                >

                    <option value="all">
                        All Status
                    </option>

                    <option value="ongoing">
                        Ongoing
                    </option>

                    <option value="upcoming">
                        Upcoming
                    </option>

                    <option value="completed">
                        Completed
                    </option>

                </select>


                <span className="session-result-count">

                    {filteredSessions.length}
                    {" "}
                    Sessions

                </span>

            </div>


            {/* =================================================
                TABLE
            ================================================= */}

            <div className="sessions-table-card">

                <div className="sessions-table-wrapper">

                    <table className="sessions-table">

                        <thead>

                            <tr>

                                <th>
                                    SESSION
                                </th>

                                <th>
                                    TERM
                                </th>

                                <th>
                                    YEAR
                                </th>

                                <th>
                                    START DATE
                                </th>

                                <th>
                                    END DATE
                                </th>

                                <th>
                                    STATUS
                                </th>

                                <th>
                                    ACTIONS
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {loading ? (

                                <tr>

                                    <td
                                        colSpan="7"
                                    >

                                        <div className="session-loading">

                                            <div className="session-spinner" />

                                            <p>
                                                Loading sessions...
                                            </p>

                                        </div>

                                    </td>

                                </tr>

                            ) : filteredSessions.length >
                              0 ? (

                                filteredSessions.map(
                                    (session) => {

                                        const sessionId =
                                            getId(
                                                session
                                            );

                                        const status =
                                            getStatus(
                                                session
                                            );


                                        return (

                                            <tr
                                                key={
                                                    sessionId
                                                }
                                            >

                                                {/* SESSION */}

                                                <td>

                                                    <div className="session-name-cell">

                                                        <div
                                                            className={`session-avatar ${
                                                                session.term?.toLowerCase()
                                                            }`}
                                                        >

                                                            {session.term ===
                                                            "Spring"
                                                                ? "SP"
                                                                : "FA"}

                                                        </div>

                                                        <div>

                                                            <strong>
                                                                {
                                                                    session.name
                                                                }
                                                            </strong>

                                                            <small>
                                                                {
                                                                    sessionId
                                                                }
                                                            </small>

                                                        </div>

                                                    </div>

                                                </td>


                                                {/* TERM */}

                                                <td>

                                                    <span
                                                        className={`term-badge ${
                                                            session.term ===
                                                            "Spring"
                                                                ? "spring"
                                                                : "fall"
                                                        }`}
                                                    >
                                                        {
                                                            session.term
                                                        }
                                                    </span>

                                                </td>


                                                {/* YEAR */}

                                                <td>

                                                    <span className="session-year">

                                                        {
                                                            session.year
                                                        }

                                                    </span>

                                                </td>


                                                {/* START */}

                                                <td>

                                                    <div className="session-date">

                                                        <CalendarDays
                                                            size={14}
                                                        />

                                                        <span>
                                                            {formatDate(
                                                                session.startDate
                                                            )}
                                                        </span>

                                                    </div>

                                                </td>


                                                {/* END */}

                                                <td>

                                                    <div className="session-date">

                                                        <CalendarDays
                                                            size={14}
                                                        />

                                                        <span>
                                                            {formatDate(
                                                                session.endDate
                                                            )}
                                                        </span>

                                                    </div>

                                                </td>


                                                {/* STATUS */}

                                                <td>

                                                    <span
                                                        className={`session-status ${status}`}
                                                    >

                                                        {status ===
                                                            "ongoing" && (
                                                            <span className="status-dot" />
                                                        )}

                                                        {getStatusLabel(
                                                            status
                                                        )}

                                                    </span>

                                                </td>


                                                {/* ACTIONS */}

                                                <td>

                                                    <div className="session-actions">

                                                        <button
                                                            className="view-session-btn"
                                                            title="View"
                                                            onClick={() =>
                                                                setViewingSession(
                                                                    session
                                                                )
                                                            }
                                                        >

                                                            <Eye
                                                                size={
                                                                    16
                                                                }
                                                            />

                                                        </button>


                                                        <button
                                                            className="edit-session-btn"
                                                            title="Edit"
                                                            onClick={() =>
                                                                handleEdit(
                                                                    session
                                                                )
                                                            }
                                                        >

                                                            <Pencil
                                                                size={
                                                                    16
                                                                }
                                                            />

                                                        </button>


                                                        <button
                                                            className="delete-session-btn"
                                                            title="Delete"
                                                            disabled={
                                                                deletingId ===
                                                                sessionId
                                                            }
                                                            onClick={() =>
                                                                handleDelete(
                                                                    session
                                                                )
                                                            }
                                                        >

                                                            {deletingId ===
                                                            sessionId ? (

                                                                <span className="mini-spinner" />

                                                            ) : (

                                                                <Trash2
                                                                    size={
                                                                        16
                                                                    }
                                                                />

                                                            )}

                                                        </button>

                                                    </div>

                                                </td>

                                            </tr>

                                        );
                                    }
                                )

                            ) : (

                                <tr>

                                    <td
                                        colSpan="7"
                                    >

                                        <div className="session-empty">

                                            <CalendarDays
                                                size={42}
                                            />

                                            <h3>
                                                No sessions found
                                            </h3>

                                            <p>
                                                Generate a Spring
                                                + Fall academic
                                                session cycle.
                                            </p>

                                            <button
                                                onClick={
                                                    handleOpenGenerate
                                                }
                                            >
                                                Generate Sessions
                                            </button>

                                        </div>

                                    </td>

                                </tr>

                            )}

                        </tbody>

                    </table>

                </div>

            </div>


            {showAddModal && (
                <div className="session-modal-overlay">
                    <div className="session-modal generate-session-modal">
                        <div className="session-modal-header">
                            <div>
                                <div className="generate-modal-title">
                                    <div className="generate-icon">
                                        <Plus size={20} />
                                    </div>
                                    <div>
                                        <h2>Add Session</h2>
                                        <p>Create a single session manually</p>
                                    </div>
                                </div>
                            </div>

                            <button
                                className="session-close-btn"
                                onClick={closeAddModal}
                            >
                                <X size={19} />
                            </button>
                        </div>

                        <form onSubmit={handleAddSession}>
                            {error && (
                                <div className="session-form-error">
                                    <AlertCircle size={17} />
                                    {error}
                                </div>
                            )}

                            <div className="session-form-group">
                                <label>
                                    Session Name <span>*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={addForm.name}
                                    onChange={(e) =>
                                        setAddForm((prev) => ({
                                            ...prev,
                                            name: e.target.value,
                                        }))
                                    }
                                    placeholder="Spring 2026"
                                    required
                                />
                            </div>

                            <div className="session-form-group">
                                <label>
                                    Term <span>*</span>
                                </label>
                                <select
                                    name="term"
                                    value={addForm.term}
                                    onChange={(e) =>
                                        setAddForm((prev) => ({
                                            ...prev,
                                            term: e.target.value,
                                        }))
                                    }
                                    required
                                >
                                    <option value="">Select Term</option>
                                    <option value="Spring">Spring</option>
                                    <option value="Fall">Fall</option>
                                </select>
                            </div>

                            <div className="session-form-group">
                                <label>
                                    Year <span>*</span>
                                </label>
                                <input
                                    type="number"
                                    name="year"
                                    min="2020"
                                    max="2100"
                                    value={addForm.year}
                                    onChange={(e) =>
                                        setAddForm((prev) => ({
                                            ...prev,
                                            year: e.target.value,
                                        }))
                                    }
                                    required
                                />
                            </div>

                            <div className="session-form-group">
                                <label className="session-toggle-label">
                                    <input
                                        type="checkbox"
                                        checked={addForm.isActive}
                                        onChange={(e) =>
                                            setAddForm((prev) => ({
                                                ...prev,
                                                isActive: e.target.checked,
                                            }))
                                        }
                                    />
                                    Active session
                                </label>
                            </div>

                            <div className="session-modal-footer">
                                <button
                                    type="button"
                                    className="session-cancel-btn"
                                    onClick={closeAddModal}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="session-save-btn"
                                    disabled={generating}
                                >
                                    {generating ? "Saving..." : "Create Session"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* =================================================
                GENERATE MODAL
            ================================================= */}

            {showGenerateModal && (

                <div className="session-modal-overlay">

                    <div className="session-modal generate-session-modal">


                        {/* HEADER */}

                        <div className="session-modal-header">

                            <div>

                                <div className="generate-modal-title">

                                    <div className="generate-icon">

                                        <Sparkles
                                            size={20}
                                        />

                                    </div>

                                    <div>

                                        <h2>
                                            Generate Academic Sessions
                                        </h2>

                                        <p>
                                            Create Spring + Fall
                                            automatically
                                        </p>

                                    </div>

                                </div>

                            </div>


                            <button
                                className="session-close-btn"
                                onClick={
                                    closeGenerateModal
                                }
                            >

                                <X
                                    size={19}
                                />

                            </button>

                        </div>


                        <form
                            onSubmit={
                                handleGenerate
                            }
                        >

                        {!generateResult && (
                        <>

                            {error && (

                                <div className="session-form-error">

                                    <AlertCircle
                                        size={17}
                                    />

                                    {error}

                                </div>

                            )}


                            {/* INFO */}

                            <div className="generate-info-box">

                                <strong>
                                    Bulk generation
                                </strong>

                                <p>
                                    Select a degree class and enter the
                                    start year. The backend will generate
                                    the related session records for that class.
                                </p>

                            </div>


                            {/* DEGREE CLASS */}

                            <div className="session-form-group">

                                <label>
                                    Degree Class <span>*</span>
                                </label>

                                <select
                                    name="degreeClassId"
                                    value={
                                        generateForm.degreeClassId
                                    }
                                    onChange={
                                        handleGenerateChange
                                    }
                                    required
                                >

                                    <option value="">
                                        Select Degree Class
                                    </option>

                                    {degreeClasses.map(
                                        (item) => {

                                            const id =
                                                getId(
                                                    item
                                                );

                                            const department =
                                                item.departmentId?.name ||
                                                item.departmentName ||
                                                "";

                                            return (

                                                <option
                                                    key={id}
                                                    value={id}
                                                >

                                                    {item.name}

                                                    {department
                                                        ? ` — ${department}`
                                                        : ""}

                                                </option>

                                            );
                                        }
                                    )}

                                </select>

                            </div>

                            <div className="session-form-group">
                                <label>
                                    Start Year <span>*</span>
                                </label>
                                <input
                                    type="number"
                                    name="startYear"
                                    min="2020"
                                    max="2100"
                                    value={generateForm.startYear}
                                    onChange={handleGenerateChange}
                                    required
                                />
                            </div>


                            {/* CLASS SESSION INFO — informational only */}

                            {generateForm.degreeClassId && (

                                <div
                                    className="class-session-info"
                                    style={{
                                        border: "1px solid #e5e7eb",
                                        borderRadius: 8,
                                        padding: "10px 12px",
                                        marginBottom: 16,
                                        background: "#f9fafb",
                                    }}
                                >

                                    {loadingClassInfo && (

                                        <div style={{ fontSize: 13, opacity: 0.7 }}>
                                            Loading session info for this class...
                                        </div>

                                    )}


                                    {!loadingClassInfo &&
                                        classSessionInfo?.error && (

                                        <div style={{ fontSize: 13, color: "#b91c1c" }}>
                                            {classSessionInfo.error}
                                        </div>

                                    )}


                                    {!loadingClassInfo &&
                                        classSessionInfo &&
                                        !classSessionInfo.error &&
                                        classSessionInfo.batches.length === 0 && (

                                        <div style={{ fontSize: 13, opacity: 0.7 }}>
                                            No batches exist yet for this class — nothing to check.
                                        </div>

                                    )}


                                    {!loadingClassInfo &&
                                        classSessionInfo?.batches?.map(
                                            (summary) => (

                                                <div
                                                    key={summary.batchId}
                                                    style={{
                                                        marginBottom: 10,
                                                        paddingBottom: 10,
                                                        borderBottom:
                                                            "1px dashed #e5e7eb",
                                                    }}
                                                >

                                                    <strong style={{ fontSize: 13 }}>
                                                        {summary.batchName}
                                                    </strong>

                                                    {summary.error ? (

                                                        <div
                                                            style={{
                                                                fontSize: 12,
                                                                color: "#b91c1c",
                                                                marginTop: 4,
                                                            }}
                                                        >
                                                            {summary.error}
                                                        </div>

                                                    ) : (

                                                        <>

                                                            <div
                                                                style={{
                                                                    fontSize: 12,
                                                                    marginTop: 4,
                                                                }}
                                                            >
                                                                <span style={{ opacity: 0.7 }}>
                                                                    Sessions used so far:
                                                                </span>{" "}
                                                                {summary.usedSessions
                                                                    .length > 0
                                                                    ? summary.usedSessions
                                                                          .map(
                                                                              (u) =>
                                                                                  `Sem ${u.semester} → ${u.sessionName}`
                                                                          )
                                                                          .join(
                                                                              "  •  "
                                                                          )
                                                                    : "None yet"}
                                                            </div>

                                                            <div
                                                                style={{
                                                                    fontSize: 12,
                                                                    marginTop: 4,
                                                                }}
                                                            >
                                                                <span style={{ opacity: 0.7 }}>
                                                                    Current:
                                                                </span>{" "}
                                                                {summary.status ===
                                                                "completed"
                                                                    ? "Completed"
                                                                    : summary.currentSessionName
                                                                    ? `Semester ${summary.currentSemester} — ${summary.currentSessionName}`
                                                                    : "-"}
                                                            </div>

                                                            {summary.status !==
                                                                "completed" && (

                                                                <div
                                                                    style={{
                                                                        fontSize: 12,
                                                                        marginTop: 4,
                                                                    }}
                                                                >
                                                                    <span style={{ opacity: 0.7 }}>
                                                                        Next needed:
                                                                    </span>{" "}
                                                                    {summary.nextExpectedSessionName ||
                                                                        "Not created yet — generate it below"}
                                                                </div>

                                                            )}

                                                        </>

                                                    )}

                                                </div>

                                            )
                                        )}

                                </div>

                            )}


                            <div className="session-form-group">
                                <label>
                                    Start Year <span>*</span>
                                </label>
                                <input
                                    type="number"
                                    name="startYear"
                                    min="2020"
                                    max="2100"
                                    value={generateForm.startYear}
                                    onChange={handleGenerateChange}
                                    required
                                />
                            </div>

                                    </div>

                                </div>


                                <div className="preview-line" />


                                <div className="preview-item">

                                    <span>
                                        02
                                    </span>

                                    <div>

                                        <strong>
                                            Fall
                                        </strong>

                                        <small>
                                            Starts after Spring
                                        </small>

                                    </div>

                                </div>

                            </div>


                            {/* ACTIONS */}

                            <div className="session-modal-actions">

                                <button
                                    type="button"
                                    className="session-cancel-btn"
                                    onClick={
                                        closeGenerateModal
                                    }
                                    disabled={
                                        generating
                                    }
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    className="session-save-btn"
                                    disabled={
                                        generating
                                    }
                                >

                                    {generating ? (

                                        <>
                                            <span className="mini-spinner" />
                                            Generating...
                                        </>

                                    ) : (

                                        <>
                                            <Sparkles
                                                size={17}
                                            />

                                            Generate Spring + Fall
                                        </>

                                    )}

                                </button>

                            </div>

                        </>
                        )}


                        {/* =====================================================
                            RESULT SUMMARY — shown after a successful Generate
                        ===================================================== */}

                        {generateResult && (

                            <div
                                className="generate-result-panel"
                                style={{
                                    padding: "4px 2px 2px",
                                }}
                            >

                                <div
                                    className="session-form-success"
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 8,
                                        padding: "10px 12px",
                                        borderRadius: 8,
                                        background: "#ecfdf5",
                                        color: "#065f46",
                                        fontWeight: 600,
                                        marginBottom: 14,
                                    }}
                                >

                                    <CheckCircle2
                                        size={17}
                                    />

                                    {generateResult.message}

                                </div>


                                {generateResult.created.length > 0 && (

                                    <div
                                        className="generate-result-group"
                                        style={{ marginBottom: 14 }}
                                    >

                                        <h4 style={{ margin: "0 0 6px" }}>
                                            Newly Created (
                                            {generateResult.created.length}
                                            )
                                        </h4>

                                        <ul style={{ margin: 0, paddingLeft: 18 }}>
                                            {generateResult.created.map(
                                                (session) => (
                                                    <li
                                                        key={
                                                            getId(session) ||
                                                            session.name
                                                        }
                                                        className="generate-result-created"
                                                        style={{ color: "#065f46" }}
                                                    >
                                                        {session.name}
                                                        {" — "}
                                                        {session.term}{" "}
                                                        {session.year}
                                                    </li>
                                                )
                                            )}
                                        </ul>

                                    </div>

                                )}


                                {generateResult.skipped.length > 0 && (

                                    <div
                                        className="generate-result-group"
                                        style={{ marginBottom: 14 }}
                                    >

                                        <h4 style={{ margin: "0 0 6px" }}>
                                            Already Existed — Skipped (
                                            {generateResult.skipped.length}
                                            )
                                        </h4>

                                        <ul style={{ margin: 0, paddingLeft: 18 }}>
                                            {generateResult.skipped.map(
                                                (name) => (
                                                    <li
                                                        key={name}
                                                        className="generate-result-skipped"
                                                        style={{ color: "#92400e" }}
                                                    >
                                                        {name}
                                                    </li>
                                                )
                                            )}
                                        </ul>

                                    </div>

                                )}


                                <div className="session-modal-actions">

                                    <button
                                        type="button"
                                        className="session-save-btn"
                                        onClick={
                                            closeGenerateModal
                                        }
                                    >
                                        Done
                                    </button>

                                </div>

                            </div>

                        )}

                        </form>

                    </div>

                </div>

            )}


            {/* =================================================
                EDIT MODAL
            ================================================= */}

            {showEditModal &&
                editingSession && (

                    <div className="session-modal-overlay">

                        <div className="session-modal">

                            <div className="session-modal-header">

                                <div>

                                    <h2>
                                        Edit Academic Session
                                    </h2>

                                    <p>
                                        Update session information
                                    </p>

                                </div>

                                <button
                                    className="session-close-btn"
                                    onClick={
                                        closeEditModal
                                    }
                                >
                                    <X
                                        size={19}
                                    />
                                </button>

                            </div>


                            <form
                                onSubmit={
                                    handleUpdate
                                }
                            >

                                {error && (

                                    <div className="session-form-error">
                                        {error}
                                    </div>

                                )}


                                <div className="session-form-group">

                                    <label>
                                        Session Name
                                    </label>

                                    <input
                                        type="text"
                                        name="name"
                                        value={
                                            editForm.name
                                        }
                                        onChange={
                                            handleEditChange
                                        }
                                        required
                                    />

                                </div>


                                <div className="session-form-row">

                                    <div className="session-form-group">

                                        <label>
                                            Term
                                        </label>

                                        <select
                                            name="term"
                                            value={
                                                editForm.term
                                            }
                                            onChange={
                                                handleEditChange
                                            }
                                            required
                                        >

                                            <option value="Spring">
                                                Spring
                                            </option>

                                            <option value="Fall">
                                                Fall
                                            </option>

                                        </select>

                                    </div>


                                    <div className="session-form-group">

                                        <label>
                                            Year
                                        </label>

                                        <input
                                            type="number"
                                            name="year"
                                            min="2000"
                                            max="2100"
                                            value={
                                                editForm.year
                                            }
                                            onChange={
                                                handleEditChange
                                            }
                                            required
                                        />

                                    </div>

                                </div>


                                <div className="session-form-row">

                                    <div className="session-form-group">

                                        <label>
                                            Start Date
                                        </label>

                                        <div className="session-date-input">

                                            <CalendarDays
                                                size={16}
                                            />

                                            <input
                                                type="date"
                                                name="startDate"
                                                value={
                                                    editForm.startDate
                                                }
                                                onChange={
                                                    handleEditChange
                                                }
                                                required
                                            />

                                        </div>

                                    </div>


                                    <div className="session-form-group">

                                        <label>
                                            End Date
                                        </label>

                                        <div className="session-date-input">

                                            <CalendarDays
                                                size={16}
                                            />

                                            <input
                                                type="date"
                                                name="endDate"
                                                value={
                                                    editForm.endDate
                                                }
                                                onChange={
                                                    handleEditChange
                                                }
                                                required
                                            />

                                        </div>

                                    </div>

                                </div>


                                <div className="session-active-box">

                                    <label className="session-checkbox">

                                        <input
                                            type="checkbox"
                                            name="isActive"
                                            checked={
                                                editForm.isActive
                                            }
                                            onChange={
                                                handleEditChange
                                            }
                                        />

                                        <div>

                                            <strong>
                                                Active Session
                                            </strong>

                                            <small>
                                                Mark this session
                                                as currently active
                                            </small>

                                        </div>

                                    </label>

                                </div>


                                <div className="session-modal-actions">

                                    <button
                                        type="button"
                                        className="session-cancel-btn"
                                        onClick={
                                            closeEditModal
                                        }
                                        disabled={
                                            generating
                                        }
                                    >
                                        Cancel
                                    </button>


                                    <button
                                        type="submit"
                                        className="session-save-btn"
                                        disabled={
                                            generating
                                        }
                                    >

                                        {generating ? (

                                            <>
                                                <span className="mini-spinner" />
                                                Updating...
                                            </>

                                        ) : (

                                            <>
                                                <Pencil
                                                    size={17}
                                                />
                                                Update Session
                                            </>

                                        )}

                                    </button>

                                </div>

                            </form>

                        </div>

                    </div>
                )}


            {/* =================================================
                VIEW MODAL
            ================================================= */}

            {viewingSession && (

                <div className="session-modal-overlay">

                    <div className="session-view-modal">

                        <div className="session-modal-header">

                            <div>

                                <h2>
                                    Session Details
                                </h2>

                                <p>
                                    Complete academic
                                    session information
                                </p>

                            </div>

                            <button
                                className="session-close-btn"
                                onClick={() =>
                                    setViewingSession(
                                        null
                                    )
                                }
                            >
                                <X
                                    size={19}
                                />
                            </button>

                        </div>


                        <div className="session-view-content">


                            {/* HERO */}

                            <div className="session-view-hero">

                                <div className="session-view-avatar">

                                    {viewingSession.term ===
                                    "Spring"
                                        ? "SP"
                                        : "FA"}

                                </div>


                                <div>

                                    <h3>
                                        {
                                            viewingSession.name
                                        }
                                    </h3>

                                    <span>
                                        {
                                            viewingSession.term
                                        }
                                        {" • "}
                                        {
                                            viewingSession.year
                                        }
                                    </span>

                                </div>

                            </div>


                            {/* DETAILS */}

                            <div className="session-detail-grid">


                                <div className="session-detail-item">

                                    <span>
                                        Session
                                    </span>

                                    <strong>
                                        {
                                            viewingSession.name
                                        }
                                    </strong>

                                </div>


                                <div className="session-detail-item">

                                    <span>
                                        Term
                                    </span>

                                    <strong>
                                        {
                                            viewingSession.term
                                        }
                                    </strong>

                                </div>


                                <div className="session-detail-item">

                                    <span>
                                        Year
                                    </span>

                                    <strong>
                                        {
                                            viewingSession.year
                                        }
                                    </strong>

                                </div>


                                <div className="session-detail-item">

                                    <span>
                                        Start Date
                                    </span>

                                    <strong>
                                        {formatDate(
                                            viewingSession.startDate
                                        )}
                                    </strong>

                                </div>


                                <div className="session-detail-item">

                                    <span>
                                        End Date
                                    </span>

                                    <strong>
                                        {formatDate(
                                            viewingSession.endDate
                                        )}
                                    </strong>

                                </div>


                                <div className="session-detail-item">

                                    <span>
                                        Status
                                    </span>

                                    <strong
                                        className={`detail-${getStatus(
                                            viewingSession
                                        )}`}
                                    >
                                        {getStatusLabel(
                                            getStatus(
                                                viewingSession
                                            )
                                        )}
                                    </strong>

                                </div>

                            </div>


                            {/* ID */}

                            <div className="session-id-box">

                                <span>
                                    Session ID
                                </span>

                                <strong>
                                    {
                                        getId(
                                            viewingSession
                                        )
                                    }
                                </strong>

                            </div>


                            {/* FOOTER */}

                            <div className="session-view-footer">

                                <button
                                    className="session-cancel-btn"
                                    onClick={() =>
                                        setViewingSession(
                                            null
                                        )
                                    }
                                >
                                    Close
                                </button>


                                <button
                                    className="session-save-btn"
                                    onClick={() => {

                                        const session =
                                            viewingSession;

                                        setViewingSession(
                                            null
                                        );

                                        handleEdit(
                                            session
                                        );

                                    }}
                                >

                                    <Pencil
                                        size={16}
                                    />

                                    Edit Session

                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
};


export default Sessions;