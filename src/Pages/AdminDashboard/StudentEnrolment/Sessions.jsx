import React, {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Search,
    Pencil,
    Trash2,
    CalendarDays,
    Clock3,
    CheckCircle2,
    Eye,
    X,
    CalendarRange,
    Sparkles,
    AlertCircle,
    RefreshCw,
} from "lucide-react";

import { FaSpinner } from "react-icons/fa";

import {
    getSessions,
    generateSessions,
    updateSession,
    deleteSessionsByDegreeClass,
    getSessionStatus,
} from "../../../services/sessionAPI";

import { getDegreeClasses } from "../../../services/degreeClassAPI";

import "./Sessions.css";


const Sessions = () => {

    // =====================================================
    // STATE
    // =====================================================

    const [sessions, setSessions] = useState([]);

    const [degreeClasses, setDegreeClasses] = useState([]);

    const [sessionStatus, setSessionStatus] =
        useState(null);

    const [loading, setLoading] = useState(true);

    const [generating, setGenerating] =
        useState(false);

    const [deletingId, setDeletingId] =
        useState(null);

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

    const [showEditModal, setShowEditModal] =
        useState(false);

    const [showViewModal, setShowViewModal] =
        useState(false);

    const [generateResult, setGenerateResult] =
        useState(null);

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
            startTerm: "Fall",
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
    // GET DEGREE CLASS
    // =====================================================

    const getDegreeClass = (session) => {

        const embedded =
            session?.degreeClassId;

        if (
            embedded &&
            typeof embedded === "object"
        ) {
            return embedded;
        }

        const id =
            embedded ||
            session?.degreeClass?._id ||
            session?.degreeClass?.id;

        if (!id) {
            return null;
        }

        return degreeClasses.find(
            (item) =>
                String(getId(item)) ===
                String(id)
        ) || null;
    };


    // =====================================================
    // FETCH DATA
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


            // ---------------------------------------------
            // SESSIONS
            // ---------------------------------------------

            const sessionData =
                sessionsResponse?.data ||
                sessionsResponse ||
                [];

            setSessions(
                Array.isArray(sessionData)
                    ? sessionData
                    : []
            );


            // ---------------------------------------------
            // STATUS
            // ---------------------------------------------

            const statusData =
                statusResponse?.data ||
                statusResponse ||
                null;

            setSessionStatus(statusData);


            // ---------------------------------------------
            // DEGREE CLASSES
            // ---------------------------------------------

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
    // SESSION STATUS
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


        if (
            session?.status &&
            [
                "ongoing",
                "completed",
                "upcoming",
            ].includes(
                String(session.status).toLowerCase()
            )
        ) {
            return String(
                session.status
            ).toLowerCase();
        }


        const start =
            session?.startDate
                ? new Date(session.startDate)
                : null;

        const end =
            session?.endDate
                ? new Date(session.endDate)
                : null;


        if (
            !start ||
            !end ||
            Number.isNaN(start.getTime()) ||
            Number.isNaN(end.getTime())
        ) {
            return session?.isActive
                ? "ongoing"
                : "upcoming";
        }


        const today = new Date();


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

                const degreeClass =
                    getDegreeClass(session);


                const status =
                    getStatus(session);


                const degreeClassName =
                    degreeClass?.name ||
                    session?.degreeClassId?.name ||
                    "";


                const degreeClassCode =
                    degreeClass?.code ||
                    session?.degreeClassId?.code ||
                    "";


                const matchesSearch =
                    !value ||
                    session?.name
                        ?.toLowerCase()
                        .includes(value) ||

                    session?.term
                        ?.toLowerCase()
                        .includes(value) ||

                    String(
                        session?.year || ""
                    ).includes(value) ||

                    degreeClassName
                        .toLowerCase()
                        .includes(value) ||

                    degreeClassCode
                        .toLowerCase()
                        .includes(value);


                const matchesTerm =
                    termFilter === "all" ||
                    session?.term ===
                        termFilter;


                const matchesYear =
                    yearFilter === "all" ||
                    String(
                        session?.year
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
        degreeClasses,
    ]);


    // =====================================================
    // GROUP BY DEGREE CLASS
    // =====================================================

    const groupedSessions = useMemo(() => {

        const groups = {};


        filteredSessions.forEach(
            (session) => {

                const degreeClass =
                    getDegreeClass(session);


                const rawId =
                    session?.degreeClassId?._id ||
                    session?.degreeClassId?.id ||
                    session?.degreeClassId ||
                    degreeClass?._id ||
                    degreeClass?.id;


                const normalizedId =
                    rawId
                        ? String(rawId)
                        : "unknown";


                if (!groups[normalizedId]) {

                    const startSemester =
                        Number(
                            degreeClass?.startSemester ||
                            session?.degreeClassId?.startSemester ||
                            1
                        );


                    const endSemester =
                        Number(
                            degreeClass?.endSemester ||
                            session?.degreeClassId?.endSemester ||
                            startSemester
                        );


                    const totalSemesters =
                        endSemester >= startSemester
                            ? endSemester -
                              startSemester +
                              1
                            : 0;


                    groups[normalizedId] = {

                        degreeClassId:
                            rawId || null,

                        degreeClassName:
                            degreeClass?.name ||
                            session?.degreeClassId?.name ||
                            "Unknown Degree Class",

                        degreeClassCode:
                            degreeClass?.code ||
                            session?.degreeClassId?.code ||
                            "",

                        programType:
                            degreeClass?.programType ||
                            session?.degreeClassId?.programType ||
                            "",

                        startSemester,

                        endSemester,

                        totalSemesters,

                        sessions: [],
                    };
                }


                groups[
                    normalizedId
                ].sessions.push(session);
            }
        );


        return Object.values(groups)
            .sort(
                (a, b) =>
                    a.degreeClassName.localeCompare(
                        b.degreeClassName
                    )
            )
            .map(
                (group) => ({

                    ...group,

                    sessions:
                        [...group.sessions].sort(
                            (a, b) => {

                                if (
                                    Number(a.year) !==
                                    Number(b.year)
                                ) {
                                    return (
                                        Number(a.year) -
                                        Number(b.year)
                                    );
                                }


                                if (
                                    a.term === "Spring" &&
                                    b.term === "Fall"
                                ) {
                                    return -1;
                                }


                                if (
                                    a.term === "Fall" &&
                                    b.term === "Spring"
                                ) {
                                    return 1;
                                }


                                return 0;
                            }
                        ),
                })
            );

    }, [
        filteredSessions,
        degreeClasses,
    ]);


    // =====================================================
    // AVAILABLE YEARS
    // =====================================================

    const availableYears = useMemo(() => {

        const years =
            sessions
                .map(
                    (session) =>
                        session?.year
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
    };


    // =====================================================
    // OPEN GENERATE MODAL
    // =====================================================

    const handleOpenGenerate = () => {

        setError("");
        setGenerateResult(null);

        setGenerateForm({
            degreeClassId:
                degreeClasses.length === 1
                    ? getId(
                          degreeClasses[0]
                      )
                    : "",

            startYear:
                new Date().getFullYear(),

            startTerm: "Fall",
        });

        setShowGenerateModal(true);
    };


    // =====================================================
    // GENERATE SESSIONS
    // =====================================================

    const handleGenerate = async (e) => {

        e.preventDefault();

        setError("");
        setGenerateResult(null);


        if (
            !generateForm.degreeClassId
        ) {

            setError(
                "Please select a degree class."
            );

            return;
        }


        if (
            !generateForm.startYear
        ) {

            setError(
                "Please enter a start year."
            );

            return;
        }


        if (
            !generateForm.startTerm
        ) {

            setError(
                "Please select the starting term."
            );

            return;
        }


        try {

            setGenerating(true);


            const payload = {

                degreeClassId:
                    generateForm.degreeClassId,

                startYear:
                    Number(
                        generateForm.startYear
                    ),

                startTerm:
                    generateForm.startTerm,
            };


            const response =
                await generateSessions(
                    payload
                );


            const result =
                response?.data ||
                response ||
                {};


            const created =
                Array.isArray(
                    result?.created
                )
                    ? result.created
                    : Array.isArray(
                          response?.created
                      )
                    ? response.created
                    : [];


            const skipped =
                Array.isArray(
                    result?.skipped
                )
                    ? result.skipped
                    : Array.isArray(
                          response?.skipped
                      )
                    ? response.skipped
                    : [];


            setGenerateResult({

                message:
                    response?.message ||
                    result?.message ||
                    `${created.length} session(s) created${
                        skipped.length
                            ? `, ${skipped.length} skipped`
                            : ""
                    }.`,

                created,

                skipped,
            });


            await fetchData();

        } catch (err) {

            console.error(
                "Generate sessions error:",
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
    // =====================================================

    const handleEdit = (session) => {

        setEditingSession(session);


        setEditForm({

            name:
                session?.name ||
                "",

            term:
                session?.term ||
                "",

            year:
                session?.year ||
                "",

            startDate:
                session?.startDate
                    ? String(
                          session.startDate
                      ).substring(
                          0,
                          10
                      )
                    : "",

            endDate:
                session?.endDate
                    ? String(
                          session.endDate
                      ).substring(
                          0,
                          10
                      )
                    : "",

            isActive:
                session?.isActive === true,
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
                    type === "checkbox"
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
                    Boolean(
                        editForm.isActive
                    ),
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


            setShowEditModal(false);

            setEditingSession(null);

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
    // DELETE ALL SESSIONS OF DEGREE CLASS
    // =====================================================

    const handleDeleteDegreeClassSessions =
        async (group) => {

            const degreeClassId =
                group?.degreeClassId;


            if (!degreeClassId) {

                alert(
                    "Degree class ID is missing."
                );

                return;
            }


            const confirmed =
                window.confirm(
                    `Are you sure you want to delete all ${group.sessions.length} session(s) of "${group.degreeClassName}"?`
                );


            if (!confirmed) {
                return;
            }


            try {

                setDeletingId(
                    String(
                        degreeClassId
                    )
                );


                await deleteSessionsByDegreeClass(
                    degreeClassId
                );


                setSessions(
                    (prev) =>
                        prev.filter(
                            (session) => {

                                const id =
                                    session?.degreeClassId?._id ||
                                    session?.degreeClassId?.id ||
                                    session?.degreeClassId;

                                return (
                                    String(id) !==
                                    String(
                                        degreeClassId
                                    )
                                );
                            }
                        )
                );


                await fetchData();

            } catch (err) {

                console.error(
                    "Bulk delete sessions error:",
                    err
                );


                alert(
                    err?.response?.data?.message ||
                    err?.message ||
                    "Failed to delete sessions."
                );

            } finally {

                setDeletingId(null);
            }
        };


    // =====================================================
    // CLOSE GENERATE MODAL
    // =====================================================

    const closeGenerateModal = () => {

        if (generating) {
            return;
        }


        setShowGenerateModal(false);

        setGenerateResult(null);

        setError("");

        setGenerateForm({

            degreeClassId: "",

            startYear:
                new Date().getFullYear(),

            startTerm: "Fall",
        });
    };


    // =====================================================
    // CLOSE EDIT MODAL
    // =====================================================

    const closeEditModal = () => {

        if (generating) {
            return;
        }


        setShowEditModal(false);

        setEditingSession(null);

        setError("");
    };


    // =====================================================
    // VIEW SESSION
    // =====================================================

    const handleView = (session) => {

        setViewingSession(session);

        setShowViewModal(true);
    };


    const closeViewModal = () => {

        setShowViewModal(false);

        setViewingSession(null);
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
            status === "ongoing"
        ) {
            return "Ongoing";
        }


        if (
            status === "completed"
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
    // SELECTED VIEW DEGREE CLASS
    // =====================================================

    const viewingDegreeClass =
        viewingSession
            ? getDegreeClass(
                  viewingSession
              )
            : null;


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
                            Manage degree class
                            academic sessions and
                            semester history
                        </p>

                    </div>

                </div>


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
                            The current session cycle
                            has been completed.
                            Generate the next sessions
                            for the required degree class.
                        </span>

                    </div>


                    <button
                        onClick={
                            handleOpenGenerate
                        }
                    >
                        Generate Sessions
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
                        placeholder="Search sessions or degree class..."
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
                DEGREE CLASS TABLE
            ================================================= */}

            <div className="sessions-table-card">

                <div className="sessions-table-wrapper">

                    <table className="sessions-table">

                        <thead>

                            <tr>

                                <th>
                                    DEGREE CLASS
                                </th>

                                <th>
                                    PROGRAM
                                </th>

                                <th>
                                    SEMESTERS
                                </th>

                                <th>
                                    CREATED SESSIONS
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
                                        colSpan="5"
                                    >

                                        <div className="session-loading">

                                            <div className="session-spinner-wrapper">

                                                <FaSpinner
                                                    className="session-spinner"
                                                    size={32}
                                                />

                                            </div>

                                            <p>
                                                Loading sessions...
                                            </p>

                                        </div>

                                    </td>

                                </tr>

                            ) : groupedSessions.length > 0 ? (

                                groupedSessions.map(
                                    (group) => {

                                        const isDeleting =
                                            deletingId ===
                                            String(
                                                group.degreeClassId
                                            );


                                        return (

                                            <tr
                                                key={
                                                    group.degreeClassId ||
                                                    group.degreeClassName
                                                }
                                            >

                                                {/* DEGREE CLASS */}

                                                <td>

                                                    <div className="session-name-cell">

                                                        <div className="session-avatar">

                                                            {group.degreeClassCode
                                                                ? group.degreeClassCode
                                                                    .substring(
                                                                        0,
                                                                        3
                                                                    )
                                                                    .toUpperCase()
                                                                : "DC"}

                                                        </div>


                                                        <div>

                                                            <strong>
                                                                {
                                                                    group.degreeClassName
                                                                }
                                                            </strong>


                                                            {group.degreeClassCode && (

                                                                <small>
                                                                    Code:{" "}
                                                                    {
                                                                        group.degreeClassCode
                                                                    }
                                                                </small>

                                                            )}

                                                        </div>

                                                    </div>

                                                </td>


                                                {/* PROGRAM TYPE */}

                                                <td>

                                                    <span className="session-year">

                                                        {group.programType ||
                                                            "-"}

                                                    </span>

                                                </td>


                                                {/* SEMESTERS */}

                                                <td>

                                                    <span className="session-year">

                                                        Sem{" "}
                                                        {
                                                            group.startSemester
                                                        }

                                                        {" - "}

                                                        {
                                                            group.endSemester
                                                        }

                                                        <small
                                                            style={{
                                                                display:
                                                                    "block",
                                                                marginTop:
                                                                    4,
                                                                opacity:
                                                                    0.7,
                                                            }}
                                                        >

                                                            {
                                                                group.totalSemesters
                                                            }{" "}
                                                            {group.totalSemesters ===
                                                            1
                                                                ? "Semester"
                                                                : "Semesters"}

                                                        </small>

                                                    </span>

                                                </td>


                                                {/* CREATED SESSIONS */}

                                                <td>

                                                    <div className="created-sessions-list">

                                                        {group.sessions.length >
                                                        0 ? (

                                                            group.sessions.map(
                                                                (
                                                                    session
                                                                ) => (

                                                                    <span
                                                                        key={getId(
                                                                            session
                                                                        )}
                                                                        className={`created-session-badge ${
                                                                            session?.term?.toLowerCase() ===
                                                                            "spring"
                                                                                ? "spring"
                                                                                : "fall"
                                                                        }`}
                                                                    >

                                                                        {session?.name ||
                                                                            `${session?.term || ""} ${session?.year || ""}`}

                                                                    </span>

                                                                )
                                                            )

                                                        ) : (

                                                            <span>
                                                                No sessions
                                                            </span>

                                                        )}

                                                    </div>

                                                </td>


                                                {/* ACTIONS */}

                                                <td>

                                                    <div className="session-actions">

                                                        {group.sessions.length >
                                                            0 && (

                                                            <button
                                                                className="view-session-btn"
                                                                title="View session"
                                                                onClick={() =>
                                                                    handleView(
                                                                        group.sessions[
                                                                            0
                                                                        ]
                                                                    )
                                                                }
                                                            >

                                                                <Eye
                                                                    size={16}
                                                                />

                                                            </button>

                                                        )}


                                                        {group.sessions.length >
                                                            0 && (

                                                            <button
                                                                className="edit-session-btn"
                                                                title="Edit session"
                                                                onClick={() =>
                                                                    handleEdit(
                                                                        group.sessions[
                                                                            group.sessions.length -
                                                                                1
                                                                        ]
                                                                    )
                                                                }
                                                            >

                                                                <Pencil
                                                                    size={16}
                                                                />

                                                            </button>

                                                        )}


                                                        {group.degreeClassId && (

                                                            <button
                                                                className="delete-session-btn"
                                                                title="Delete all sessions"
                                                                disabled={
                                                                    isDeleting
                                                                }
                                                                onClick={() =>
                                                                    handleDeleteDegreeClassSessions(
                                                                        group
                                                                    )
                                                                }
                                                            >

                                                                {isDeleting ? (

                                                                    <FaSpinner
                                                                        className="session-button-spinner"
                                                                        size={15}
                                                                    />

                                                                ) : (

                                                                    <Trash2
                                                                        size={16}
                                                                    />

                                                                )}

                                                            </button>

                                                        )}

                                                    </div>

                                                </td>

                                            </tr>

                                        );

                                    }
                                )

                            ) : (

                                <tr>

                                    <td
                                        colSpan="5"
                                    >

                                        <div className="session-empty">

                                            <CalendarDays
                                                size={42}
                                            />

                                            <h3>
                                                No sessions found
                                            </h3>

                                            <p>
                                                Select a degree class
                                                and generate its
                                                academic sessions.
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


            {/* =================================================
                GENERATE MODAL
            ================================================= */}

            {showGenerateModal && (

                <div className="session-modal-overlay">

                    <div className="session-modal generate-session-modal">


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
                                            Generate all semester
                                            sessions for a degree class
                                        </p>

                                    </div>

                                </div>

                            </div>


                            <button
                                className="session-close-btn"
                                onClick={
                                    closeGenerateModal
                                }
                                disabled={
                                    generating
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

                            {error && (

                                <div className="session-form-error">

                                    <AlertCircle
                                        size={17}
                                    />

                                    {error}

                                </div>

                            )}


                            {!generateResult ? (

                                <>

                                    {/* INFO BOX */}

                                    <div className="generate-info-box">

                                        <strong>
                                            Degree Class Based Generation
                                        </strong>

                                        <p>

                                            The system will use the
                                            selected degree class's
                                            start and end semesters
                                            to generate the complete
                                            academic session sequence.

                                        </p>

                                    </div>


                                    {/* DEGREE CLASS */}

                                    <div className="session-form-group">

                                        <label>

                                            Degree Class{" "}
                                            <span>*</span>

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
                                                        item?.departmentId
                                                            ?.name ||
                                                        item?.departmentName ||
                                                        "";


                                                    return (

                                                        <option
                                                            key={id}
                                                            value={id}
                                                        >

                                                            {item?.name}

                                                            {item?.code
                                                                ? ` — ${item.code}`
                                                                : ""}

                                                            {department
                                                                ? ` — ${department}`
                                                                : ""}

                                                        </option>

                                                    );

                                                }
                                            )}

                                        </select>

                                    </div>


                                    {/* PROGRAM PREVIEW */}

                                    {generateForm.degreeClassId && (

                                        (() => {

                                            const selected =
                                                degreeClasses.find(
                                                    (item) =>
                                                        String(
                                                            getId(
                                                                item
                                                            )
                                                        ) ===
                                                        String(
                                                            generateForm.degreeClassId
                                                        )
                                                );


                                            if (!selected) {
                                                return null;
                                            }


                                            const start =
                                                Number(
                                                    selected.startSemester ||
                                                    1
                                                );


                                            const end =
                                                Number(
                                                    selected.endSemester ||
                                                    start
                                                );


                                            const total =
                                                end >= start
                                                    ? end -
                                                      start +
                                                      1
                                                    : 0;


                                            return (

                                                <div
                                                    className="generate-info-box"
                                                    style={{
                                                        marginTop:
                                                            -4,
                                                    }}
                                                >

                                                    <div>

                                                        <strong>
                                                            {
                                                                selected.name
                                                            }
                                                        </strong>

                                                    </div>


                                                    <p
                                                        style={{
                                                            marginBottom:
                                                                0,
                                                        }}
                                                    >

                                                        Program Type:{" "}
                                                        <strong>
                                                            {
                                                                selected.programType ||
                                                                "-"
                                                            }
                                                        </strong>

                                                        {" • "}

                                                        Semesters:{" "}
                                                        <strong>
                                                            {
                                                                start
                                                            }
                                                            {" - "}
                                                            {
                                                                end
                                                            }
                                                        </strong>

                                                        {" • "}

                                                        Total:{" "}
                                                        <strong>
                                                            {
                                                                total
                                                            }
                                                        </strong>

                                                    </p>

                                                </div>

                                            );

                                        })()

                                    )}


                                    {/* START YEAR */}

                                    <div className="session-form-group">

                                        <label>

                                            Start Year{" "}
                                            <span>*</span>

                                        </label>


                                        <input
                                            type="number"
                                            name="startYear"
                                            min="2020"
                                            max="2100"
                                            value={
                                                generateForm.startYear
                                            }
                                            onChange={
                                                handleGenerateChange
                                            }
                                            required
                                        />

                                    </div>


                                    {/* START TERM */}

                                    <div className="session-form-group">

                                        <label>

                                            Starting Term{" "}
                                            <span>*</span>

                                        </label>


                                        <select
                                            name="startTerm"
                                            value={
                                                generateForm.startTerm
                                            }
                                            onChange={
                                                handleGenerateChange
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

                                                    <FaSpinner
                                                        className="session-button-spinner"
                                                        size={15}
                                                    />

                                                    Generating...

                                                </>

                                            ) : (

                                                <>

                                                    <Sparkles
                                                        size={17}
                                                    />

                                                    Generate Sessions

                                                </>

                                            )}

                                        </button>

                                    </div>

                                </>

                            ) : (

                                /* =================================================
                                   GENERATE RESULT
                                ================================================= */

                                <div className="generate-result-panel">

                                    <div
                                        className="session-form-success"
                                        style={{
                                            display:
                                                "flex",
                                            alignItems:
                                                "center",
                                            gap: 8,
                                            padding:
                                                "10px 12px",
                                            borderRadius:
                                                8,
                                            background:
                                                "#ecfdf5",
                                            color:
                                                "#065f46",
                                            fontWeight:
                                                600,
                                            marginBottom:
                                                14,
                                        }}
                                    >

                                        <CheckCircle2
                                            size={17}
                                        />

                                        {
                                            generateResult.message
                                        }

                                    </div>


                                    {generateResult.created?.length >
                                        0 && (

                                        <div
                                            className="generate-result-group"
                                            style={{
                                                marginBottom:
                                                    14,
                                            }}
                                        >

                                            <h4
                                                style={{
                                                    margin:
                                                        "0 0 6px",
                                                }}
                                            >

                                                Created (
                                                {
                                                    generateResult.created.length
                                                }
                                                )

                                            </h4>


                                            <ul
                                                style={{
                                                    margin:
                                                        0,
                                                    paddingLeft:
                                                        18,
                                                }}
                                            >

                                                {generateResult.created.map(
                                                    (
                                                        item,
                                                        index
                                                    ) => {

                                                        const session =
                                                            item?.session ||
                                                            item;


                                                        return (

                                                            <li
                                                                key={
                                                                    getId(
                                                                        session
                                                                    ) ||
                                                                    `${session?.name}-${index}`
                                                                }
                                                                style={{
                                                                    color:
                                                                        "#065f46",
                                                                    marginBottom:
                                                                        4,
                                                                }}
                                                            >

                                                                {
                                                                    session?.name ||
                                                                    `${session?.term || ""} ${session?.year || ""}`
                                                                }

                                                            </li>

                                                        );

                                                    }
                                                )}

                                            </ul>

                                        </div>

                                    )}


                                    {generateResult.skipped?.length >
                                        0 && (

                                        <div
                                            className="generate-result-group"
                                            style={{
                                                marginBottom:
                                                    14,
                                            }}
                                        >

                                            <h4
                                                style={{
                                                    margin:
                                                        "0 0 6px",
                                                }}
                                            >

                                                Already Exists (
                                                {
                                                    generateResult.skipped.length
                                                }
                                                )

                                            </h4>


                                            <ul
                                                style={{
                                                    margin:
                                                        0,
                                                    paddingLeft:
                                                        18,
                                                }}
                                            >

                                                {generateResult.skipped.map(
                                                    (
                                                        item,
                                                        index
                                                    ) => (

                                                        <li
                                                            key={`${item}-${index}`}
                                                            style={{
                                                                color:
                                                                    "#92400e",
                                                                marginBottom:
                                                                    4,
                                                            }}
                                                        >

                                                            {typeof item ===
                                                            "string"
                                                                ? item
                                                                : item?.name ||
                                                                  `${item?.term || ""} ${item?.year || ""}`}

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
                                        Update existing session
                                        information
                                    </p>

                                </div>


                                <button
                                    className="session-close-btn"
                                    onClick={
                                        closeEditModal
                                    }
                                    disabled={
                                        generating
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

                                        <AlertCircle
                                            size={17}
                                        />

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
                                            min="2020"
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


                                    <div className="session-form-group">

                                        <label>
                                            End Date
                                        </label>

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


                                <div className="session-form-group">

                                    <label className="session-toggle-label">

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

                                        Active session

                                    </label>

                                </div>


                                <div className="session-modal-footer">

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

                                                <FaSpinner
                                                    className="session-button-spinner"
                                                    size={15}
                                                />

                                                Saving...

                                            </>

                                        ) : (

                                            "Update Session"

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

            {showViewModal &&
                viewingSession && (

                    <div className="session-modal-overlay">

                        <div className="session-modal">

                            <div className="session-modal-header">

                                <div>

                                    <h2>
                                        Session Details
                                    </h2>

                                    <p>
                                        Academic session
                                        information
                                    </p>

                                </div>


                                <button
                                    className="session-close-btn"
                                    onClick={
                                        closeViewModal
                                    }
                                >

                                    <X
                                        size={19}
                                    />

                                </button>

                            </div>


                            <div
                                style={{
                                    display:
                                        "grid",
                                    gap: 14,
                                }}
                            >

                                <div
                                    className="generate-info-box"
                                >

                                    <strong>
                                        {
                                            viewingSession.name ||
                                            "-"
                                        }
                                    </strong>

                                    <p
                                        style={{
                                            marginBottom:
                                                0,
                                        }}
                                    >

                                        Term:{" "}
                                        <strong>
                                            {
                                                viewingSession.term ||
                                                "-"
                                            }
                                        </strong>

                                        {" • "}

                                        Year:{" "}
                                        <strong>
                                            {
                                                viewingSession.year ||
                                                "-"
                                            }
                                        </strong>

                                    </p>

                                </div>


                                <div
                                    style={{
                                        display:
                                            "grid",
                                        gridTemplateColumns:
                                            "repeat(2, minmax(0, 1fr))",
                                        gap: 12,
                                    }}
                                >

                                    <div>

                                        <small>
                                            Degree Class
                                        </small>

                                        <strong
                                            style={{
                                                display:
                                                    "block",
                                                marginTop:
                                                    4,
                                            }}
                                        >
                                            {
                                                viewingDegreeClass?.name ||
                                                viewingSession?.degreeClassId?.name ||
                                                "-"
                                            }
                                        </strong>

                                    </div>


                                    <div>

                                        <small>
                                            Program Type
                                        </small>

                                        <strong
                                            style={{
                                                display:
                                                    "block",
                                                marginTop:
                                                    4,
                                            }}
                                        >
                                            {
                                                viewingDegreeClass?.programType ||
                                                viewingSession?.degreeClassId?.programType ||
                                                "-"
                                            }
                                        </strong>

                                    </div>


                                    <div>

                                        <small>
                                            Start Date
                                        </small>

                                        <strong
                                            style={{
                                                display:
                                                    "block",
                                                marginTop:
                                                    4,
                                            }}
                                        >
                                            {
                                                formatDate(
                                                    viewingSession.startDate
                                                )
                                            }
                                        </strong>

                                    </div>


                                    <div>

                                        <small>
                                            End Date
                                        </small>

                                        <strong
                                            style={{
                                                display:
                                                    "block",
                                                marginTop:
                                                    4,
                                            }}
                                        >
                                            {
                                                formatDate(
                                                    viewingSession.endDate
                                                )
                                            }
                                        </strong>

                                    </div>

                                </div>


                                <div>

                                    <small>
                                        Status
                                    </small>

                                    <strong
                                        style={{
                                            display:
                                                "block",
                                            marginTop:
                                                4,
                                        }}
                                    >
                                        {
                                            getStatusLabel(
                                                getStatus(
                                                    viewingSession
                                                )
                                            )
                                        }
                                    </strong>

                                </div>


                                <div className="session-modal-footer">

                                    <button
                                        type="button"
                                        className="session-cancel-btn"
                                        onClick={
                                            closeViewModal
                                        }
                                    >
                                        Close
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