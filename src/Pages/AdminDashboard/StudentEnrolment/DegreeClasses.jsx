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
    GraduationCap,
    Building2,
    Layers3,
    X,
    Eye,
    Sun,
    Moon,
    BookOpen,
} from "lucide-react";

import { FaSpinner } from "react-icons/fa";

import { getDepartments } from "../../../services/departmentAPI";

import {
    getDegreeClasses,
    createDegreeClass,
    updateDegreeClass,
    deleteDegreeClass,
} from "../../../services/degreeClassAPI";

import {
    getShifts,
    createShift,
} from "../../../services/shiftAPI";

import "./DegreeClasses.css";

const DegreeClasses = () => {

    const [classes, setClasses] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [shifts, setShifts] = useState([]);

    const [search, setSearch] = useState("");
    const [departmentFilter, setDepartmentFilter] =
        useState("all");

    const [showModal, setShowModal] =
        useState(false);

    const [editingClass, setEditingClass] =
        useState(null);

    const [viewingClass, setViewingClass] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [formData, setFormData] = useState({
        name: "",
        code: "",
        departmentId: "",
        programType: "",
    });

    const [selectedShifts, setSelectedShifts] =
        useState([]);

    // ===============================
    // ID HELPER
    // ===============================

    const getId = (item) => {
        return item?._id || item?.id;
    };

    // ===============================
    // FETCH DATA
    // ===============================

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);

            const [
                classesResponse,
                shiftsResponse,
                departmentsResponse,
            ] = await Promise.all([
                getDegreeClasses(),
                getShifts(),
                getDepartments(),
            ]);

            const classData =
                classesResponse?.data ||
                classesResponse ||
                [];

            const shiftData =
                shiftsResponse?.data ||
                shiftsResponse ||
                [];

            const departmentData =
                departmentsResponse?.data ||
                departmentsResponse ||
                [];

            setClasses(
                Array.isArray(classData)
                    ? classData
                    : []
            );

            setShifts(
                Array.isArray(shiftData)
                    ? shiftData
                    : []
            );

            setDepartments(
                Array.isArray(departmentData)
                    ? departmentData
                    : []
            );

        } catch (error) {

            console.error(
                "Degree Classes API Error:",
                error
            );

            setClasses([]);
            setShifts([]);
            setDepartments([]);

        } finally {
            setLoading(false);
        }
    };

    // ===============================
    // GET SHIFT CLASS ID
    // ===============================

    const getShiftClassId = (shift) => {
        return (
            shift?.degreeClassId?._id ||
            shift?.degreeClassId?.id ||
            shift?.degreeClassId ||
            null
        );
    };

    // ===============================
    // GET CLASS SHIFTS
    // ===============================

    const getClassShifts = (classItem) => {

        const classId = getId(classItem);

        if (!classId) {
            return [];
        }

        return shifts.filter((shift) => {

            const shiftClassId =
                getShiftClassId(shift);

            return (
                shiftClassId &&
                String(shiftClassId) ===
                    String(classId)
            );
        });
    };

    // ===============================
    // GET DEPARTMENT NAME
    // ===============================

    const getDepartmentName = (item) => {

        if (item?.departmentId?.name) {
            return item.departmentId.name;
        }

        if (item?.departmentName) {
            return item.departmentName;
        }

        const department =
            departments.find(
                (d) =>
                    String(
                        d._id || d.id
                    ) ===
                    String(
                        item?.departmentId?._id ||
                        item?.departmentId
                    )
            );

        return department?.name || "Unknown";
    };

    // ===============================
    // PROGRAM TYPE LABEL
    // ===============================

    const getProgramTypeLabel = (value) => {

        const labels = {
            BS: "BS",
            POST_ADP:"Post ADP",
            ADP: "ADP",
            
        };

        return labels[value] || value || "—";
    };

    // ===============================
    // SEMESTER RANGE
    // ===============================

    const getSemesterRange = (item) => {

        const start = item?.startSemester;
        const end = item?.endSemester;

        if (
            start !== undefined &&
            start !== null &&
            end !== undefined &&
            end !== null
        ) {
            return `${start} - ${end}`;
        }

        return "—";
    };

    // ===============================
    // SEARCH
    // ===============================

    const filteredClasses = useMemo(() => {

        const searchValue =
            search
                .toLowerCase()
                .trim();

        return classes.filter((item) => {

            const departmentName =
                item.departmentId?.name ||
                item.departmentName ||
                departments.find(
                    (department) =>
                        String(
                            department._id ||
                            department.id
                        ) ===
                        String(
                            item.departmentId?._id ||
                            item.departmentId
                        )
                )?.name ||
                "";

            const matchesSearch =
                !searchValue ||
                item.name
                    ?.toLowerCase()
                    .includes(searchValue) ||
                item.code
                    ?.toLowerCase()
                    .includes(searchValue) ||
                item.programType
                    ?.toLowerCase()
                    .includes(searchValue) ||
                departmentName
                    .toLowerCase()
                    .includes(searchValue);

            const itemDepartmentId =
                item.departmentId?._id ||
                item.departmentId;

            const matchesDepartment =
                departmentFilter === "all" ||
                String(itemDepartmentId) ===
                    String(departmentFilter);

            return (
                matchesSearch &&
                matchesDepartment
            );
        });

    }, [
        classes,
        departments,
        search,
        departmentFilter,
    ]);

    // ===============================
    // FORM CHANGE
    // ===============================

    const handleChange = (e) => {

        const {
            name,
            value,
        } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // ===============================
    // SHIFT CHANGE
    // ===============================

    const handleShiftChange = (
        shiftName
    ) => {

        setSelectedShifts((prev) => {

            if (
                prev.includes(shiftName)
            ) {
                return prev.filter(
                    (item) =>
                        item !== shiftName
                );
            }

            return [
                ...prev,
                shiftName,
            ];
        });
    };

    // ===============================
    // ADD
    // ===============================

    const handleAdd = () => {

        setEditingClass(null);

        setFormData({
            name: "",
            code: "",
            departmentId: "",
            programType: "",
        });

        setSelectedShifts([]);

        setShowModal(true);
    };

    // ===============================
    // EDIT
    // ===============================

    const handleEdit = (item) => {

        const classShifts =
            getClassShifts(item);

        setEditingClass(item);

        setFormData({
            name: item.name || "",
            code: item.code || "",
            departmentId:
                item.departmentId?._id ||
                item.departmentId ||
                "",
            programType:
                item.programType || "",
        });

        setSelectedShifts(
            classShifts.map(
                (shift) => shift.name
            )
        );

        setShowModal(true);
    };

    // ===============================
    // SUBMIT
    // ===============================

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (saving) {
            return;
        }

        if (
            !formData.departmentId ||
            !formData.name.trim() ||
            !formData.code.trim() ||
            !formData.programType
        ) {
            alert(
                "Please fill all required fields."
            );

            return;
        }

        const department =
            departments.find(
                (item) =>
                    String(
                        item._id ||
                        item.id
                    ) ===
                    String(
                        formData.departmentId
                    )
            );

        // ==================================
        // NEW DEGREE CLASS PAYLOAD
        // ==================================

        const payload = {
            name:
                formData.name.trim(),

            code:
                formData.code
                    .trim()
                    .toUpperCase(),

            departmentId:
                formData.departmentId,

            programType:
                formData.programType,
        };

        console.log(
            "DEGREE CLASS PAYLOAD:",
            payload
        );

        try {

            setSaving(true);

            // ===============================
            // UPDATE
            // ===============================

            if (editingClass) {

                const classId =
                    getId(editingClass);

                const response =
                    await updateDegreeClass(
                        classId,
                        payload
                    );

                const updated =
                    response?.data ||
                    response ||
                    {};

                setClasses((prev) =>
                    prev.map((item) => {

                        if (
                            String(
                                getId(item)
                            ) !==
                            String(classId)
                        ) {
                            return item;
                        }

                        return {
                            ...item,
                            ...updated,
                            ...payload,
                        };
                    })
                );

                closeModal();

                return;
            }

            // ===============================
            // CREATE CLASS
            // ===============================

            const response =
                await createDegreeClass(
                    payload
                );

            const created =
                response?.data ||
                response ||
                {};

            console.log(
                "CREATED DEGREE CLASS:",
                created
            );

            const createdClassId =
                created?._id ||
                created?.id;

            if (!createdClassId) {
                throw new Error(
                    "Degree class created but class ID was not returned."
                );
            }

            // ===============================
            // ADD CLASS LOCALLY
            // ===============================

            setClasses((prev) => [
                ...prev,
                {
                    ...created,
                    ...payload,

                    _id:
                        created?._id ||
                        createdClassId,

                    id:
                        created?.id ||
                        createdClassId,

                    departmentId:
                        created?.departmentId ||
                        payload.departmentId,

                    departmentName:
                        department?.name ||
                        "Unknown",
                },
            ]);

            // ===============================
            // CREATE SHIFTS
            // ===============================

            if (
                selectedShifts.length > 0
            ) {

                const shiftPromises =
                    selectedShifts.map(
                        (shiftName) =>
                            createShift({
                                name:
                                    shiftName,

                                degreeClassId:
                                    createdClassId,
                            })
                    );

                const responses =
                    await Promise.all(
                        shiftPromises
                    );

                const createdShifts =
                    responses
                        .map(
                            (item) =>
                                item?.data ||
                                item
                        )
                        .filter(Boolean);

                setShifts((prev) => [
                    ...prev,
                    ...createdShifts,
                ]);
            }

            closeModal();

        } catch (error) {

            console.error(
                "Degree Class Save Error:",
                error
            );

            console.error(
                "Degree Class API Response:",
                error?.response?.data
            );

            alert(
                error?.response?.data?.message ||
                error?.message ||
                "Failed to save degree class."
            );

        } finally {
            setSaving(false);
        }
    };

    // ===============================
    // DELETE
    // ===============================

    const handleDelete = async (
        item
    ) => {

        const id = getId(item);

        const confirmed =
            window.confirm(
                "Are you sure you want to delete this degree class?"
            );

        if (!confirmed) {
            return;
        }

        try {

            await deleteDegreeClass(id);

            setClasses((prev) =>
                prev.filter(
                    (classItem) =>
                        String(
                            getId(classItem)
                        ) !==
                        String(id)
                )
            );

            // Remove only shifts belonging
            // to deleted class
            setShifts((prev) =>
                prev.filter(
                    (shift) =>
                        String(
                            getShiftClassId(
                                shift
                            )
                        ) !==
                        String(id)
                )
            );

        } catch (error) {

            console.error(
                "Delete Degree Class Error:",
                error
            );

            alert(
                error?.response?.data?.message ||
                "Failed to delete degree class."
            );
        }
    };

    // ===============================
    // CLOSE
    // ===============================

    const closeModal = () => {

        setShowModal(false);

        setEditingClass(null);

        setSelectedShifts([]);

        setFormData({
            name: "",
            code: "",
            departmentId: "",
            programType: "",
        });
    };

    // ===============================
    // STATS
    // ===============================

    const totalClasses =
        classes.length;

    const totalDepartments =
        new Set(
            classes
                .map(
                    (item) =>
                        item.departmentId?._id ||
                        item.departmentId
                )
                .filter(Boolean)
        ).size;

    const totalPrograms =
        new Set(
            classes
                .map(
                    (item) =>
                        item.programType
                )
                .filter(Boolean)
        ).size;

    // ===============================
    // RENDER
    // ===============================

    return (
        <div className="degree-classes-page">

            {/* ===============================
                HEADER
            =============================== */}

            <div className="degree-classes-header">

                <div className="degree-title-section">

                    <div className="degree-main-icon">
                        <GraduationCap
                            size={26}
                        />
                    </div>

                    <div>

                        <h1>
                            Degree Classes
                        </h1>

                        <p>
                            Manage degree
                            programs, classes
                            and shifts
                        </p>

                    </div>

                </div>

                <button
                    className="add-degree-btn"
                    onClick={handleAdd}
                >
                    <Plus size={18} />
                    Add Degree Class
                </button>

            </div>

            {/* ===============================
                STATS
            =============================== */}

            <div className="degree-stats">

                <div className="degree-stat-card">

                    <div>

                        <span>
                            Total Classes
                        </span>

                        <strong>
                            {totalClasses}
                        </strong>

                    </div>

                    <div className="degree-stat-icon blue">
                        <Layers3 size={21} />
                    </div>

                </div>

                <div className="degree-stat-card">

                    <div>

                        <span>
                            Departments
                        </span>

                        <strong>
                            {totalDepartments}
                        </strong>

                    </div>

                    <div className="degree-stat-icon purple">
                        <Building2 size={21} />
                    </div>

                </div>

                <div className="degree-stat-card">

                    <div>

                        <span>
                            Program Types
                        </span>

                        <strong>
                            {totalPrograms}
                        </strong>

                    </div>

                    <div className="degree-stat-icon orange">
                        <BookOpen size={21} />
                    </div>

                </div>

            </div>

            {/* ===============================
                TOOLBAR
            =============================== */}

            <div className="degree-toolbar">

                <div className="degree-search">

                    <Search size={18} />

                    <input
                        placeholder="Search degree classes..."
                        value={search}
                        onChange={(e) =>
                            setSearch(
                                e.target.value
                            )
                        }
                    />

                </div>

                <select
                    value={departmentFilter}
                    onChange={(e) =>
                        setDepartmentFilter(
                            e.target.value
                        )
                    }
                    className="department-filter"
                >

                    <option value="all">
                        All Departments
                    </option>

                    {departments.map(
                        (department) => {

                            const id =
                                department._id ||
                                department.id;

                            return (
                                <option
                                    key={id}
                                    value={id}
                                >
                                    {
                                        department.name
                                    }
                                </option>
                            );
                        }
                    )}

                </select>

                <span className="degree-result-count">
                    {filteredClasses.length} Classes
                </span>

            </div>

            {/* ===============================
                TABLE
            =============================== */}

            <div className="degree-table-card">

                <div className="degree-table-wrapper">

                    <table className="degree-table">

                        <thead>

                            <tr>

                                <th>
                                    Degree / Class
                                </th>

                                <th>
                                    Code
                                </th>

                                <th>
                                    Department
                                </th>

                                <th>
                                    Program Type
                                </th>

                                <th>
                                    Semesters
                                </th>

                                <th>
                                    Shifts
                                </th>

                                <th>
                                    Status
                                </th>

                                <th>
                                    Actions
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            {loading ? (

                                <tr>

                                    <td
                                        colSpan="8"
                                    >

                                        <div className="degree-loading">

                                            <div className="degree-spinner-wrapper">

                                                <FaSpinner
                                                    className="degree-spinner"
                                                    size={30}
                                                />

                                            </div>

                                            <p>
                                                Loading degree classes...
                                            </p>

                                        </div>

                                    </td>

                                </tr>

                            ) : filteredClasses.length ? (

                                filteredClasses.map(
                                    (item) => {

                                        const id =
                                            getId(item);

                                        const classShifts =
                                            getClassShifts(
                                                item
                                            );

                                        return (

                                            <tr
                                                key={id}
                                            >

                                                {/* DEGREE */}

                                                <td>

                                                    <div className="degree-name-cell">

                                                        <div className="degree-avatar">

                                                            {
                                                                item.code?.substring(
                                                                    0,
                                                                    3
                                                                )
                                                            }

                                                        </div>

                                                        <div>

                                                            <strong>
                                                                {
                                                                    item.name
                                                                }
                                                            </strong>

                                                            <small>
                                                                {id}
                                                            </small>

                                                        </div>

                                                    </div>

                                                </td>

                                                {/* CODE */}

                                                <td>

                                                    <span className="degree-code">

                                                        {
                                                            item.code
                                                        }

                                                    </span>

                                                </td>

                                                {/* DEPARTMENT */}

                                                <td>

                                                    <div className="degree-department">

                                                        <Building2
                                                            size={15}
                                                        />

                                                        {
                                                            getDepartmentName(
                                                                item
                                                            )
                                                        }

                                                    </div>

                                                </td>

                                                {/* PROGRAM TYPE */}

                                                <td>

                                                    <span className="program-type-badge">

                                                        {
                                                            getProgramTypeLabel(
                                                                item.programType
                                                            )
                                                        }

                                                    </span>

                                                </td>

                                                {/* SEMESTERS */}

                                                <td>

                                                    <span className="semester-badge">

                                                        <Layers3
                                                            size={14}
                                                        />

                                                        {
                                                            getSemesterRange(
                                                                item
                                                            )
                                                        }

                                                    </span>

                                                </td>

                                                {/* SHIFTS */}

                                                <td>

                                                    {classShifts.length ? (

                                                        <div className="degree-shifts-cell">

                                                            {classShifts.map(
                                                                (
                                                                    shift
                                                                ) => {

                                                                    const shiftId =
                                                                        getId(
                                                                            shift
                                                                        );

                                                                    const morning =
                                                                        shift.name?.toLowerCase() ===
                                                                        "morning";

                                                                    return (

                                                                        <span
                                                                            key={
                                                                                shiftId
                                                                            }
                                                                            className={`shift-badge ${
                                                                                morning
                                                                                    ? "morning"
                                                                                    : "evening"
                                                                            }`}
                                                                        >

                                                                            {morning ? (

                                                                                <Sun
                                                                                    size={
                                                                                        13
                                                                                    }
                                                                                />

                                                                            ) : (

                                                                                <Moon
                                                                                    size={
                                                                                        13
                                                                                    }
                                                                                />

                                                                            )}

                                                                            {
                                                                                shift.name
                                                                            }

                                                                        </span>

                                                                    );
                                                                }
                                                            )}

                                                        </div>

                                                    ) : (

                                                        <span className="no-shift">
                                                            No Shift
                                                        </span>

                                                    )}

                                                </td>

                                                {/* STATUS */}

                                                <td>

                                                    <span
                                                        className={
                                                            item.isActive === false
                                                                ? "degree-status inactive"
                                                                : "degree-status"
                                                        }
                                                    >
                                                        {
                                                            item.isActive === false
                                                                ? "Inactive"
                                                                : "Active"
                                                        }
                                                    </span>

                                                </td>

                                                {/* ACTIONS */}

                                                <td>

                                                    <div className="degree-actions">

                                                        <button
                                                            className="view-degree-btn"
                                                            onClick={() =>
                                                                setViewingClass(
                                                                    item
                                                                )
                                                            }
                                                            title="View"
                                                        >
                                                            <Eye
                                                                size={16}
                                                            />
                                                        </button>

                                                        <button
                                                            className="edit-degree-btn"
                                                            onClick={() =>
                                                                handleEdit(
                                                                    item
                                                                )
                                                            }
                                                            title="Edit"
                                                        >
                                                            <Pencil
                                                                size={16}
                                                            />
                                                        </button>

                                                        <button
                                                            className="delete-degree-btn"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    item
                                                                )
                                                            }
                                                            title="Delete"
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
                                )

                            ) : (

                                <tr>

                                    <td
                                        colSpan="8"
                                    >

                                        <div className="degree-empty">

                                            <GraduationCap
                                                size={42}
                                            />

                                            <h3>
                                                No degree classes found
                                            </h3>

                                            <p>
                                                Add a new degree class.
                                            </p>

                                        </div>

                                    </td>

                                </tr>

                            )}

                        </tbody>

                    </table>

                </div>

            </div>

            {/* ===============================
                ADD / EDIT MODAL
            =============================== */}

            {showModal && (

                <div className="degree-modal-overlay">

                    <div className="degree-modal">

                        <div className="degree-modal-header">

                            <div>

                                <h2>
                                    {editingClass
                                        ? "Edit Degree Class"
                                        : "Add Degree Class"}
                                </h2>

                                <p>
                                    {editingClass
                                        ? "Update degree class information"
                                        : "Create a degree class and assign its shifts"}
                                </p>

                            </div>

                            <button
                                className="degree-close-btn"
                                onClick={closeModal}
                                type="button"
                            >
                                <X size={19} />
                            </button>

                        </div>

                        <form
                            onSubmit={
                                handleSubmit
                            }
                        >

                            {/* NAME */}

                            <div className="degree-form-group">

                                <label>
                                    Degree / Class Name
                                </label>

                                <input
                                    name="name"
                                    value={
                                        formData.name
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="e.g. BS Information Technology"
                                    required
                                />

                            </div>

                            {/* CODE + PROGRAM TYPE */}

                            <div className="degree-form-row">

                                <div className="degree-form-group">

                                    <label>
                                        Class Code
                                    </label>

                                    <input
                                        name="code"
                                        value={
                                            formData.code
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="e.g. BSIT"
                                        required
                                    />

                                </div>

                                <div className="degree-form-group">

                                    <label>
                                        Program Type
                                    </label>

                                    <select
                                        name="programType"
                                        value={
                                            formData.programType
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                    >

                                        <option value="">
                                            Select Program Type
                                        </option>

                                        <option value="BS">
                                            BS
                                        </option>

                                        <option value="ADP">
                                            ADP
                                        </option>

                                        <option value="POST_ADP">
                                            Post ADP
                                        </option>


                                     

                                        

                                      

                                    </select>

                                </div>

                            </div>

                            {/* DEPARTMENT */}

                            <div className="degree-form-group">

                                <label>
                                    Department
                                </label>

                                <select
                                    name="departmentId"
                                    value={
                                        formData.departmentId
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                >

                                    <option value="">
                                        Select Department
                                    </option>

                                    {departments.map(
                                        (
                                            department
                                        ) => {

                                            const id =
                                                department._id ||
                                                department.id;

                                            return (

                                                <option
                                                    key={
                                                        id
                                                    }
                                                    value={
                                                        id
                                                    }
                                                >
                                                    {
                                                        department.name
                                                    }
                                                </option>

                                            );
                                        }
                                    )}

                                </select>

                            </div>

                            {/* SEMESTER INFORMATION */}

                            {editingClass && (

                                <div className="degree-semester-info">

                                    <div className="degree-semester-info-icon">
                                        <Layers3
                                            size={18}
                                        />
                                    </div>

                                    <div>

                                        <strong>
                                            Semester Range
                                        </strong>

                                        <span>
                                            {
                                                getSemesterRange(
                                                    editingClass
                                                )
                                            }
                                        </span>

                                    </div>

                                </div>

                            )}

                            {/* ONLY CREATE - SHIFTS */}

                            {!editingClass && (

                                <div className="degree-form-group shift-form-section">

                                    <label>
                                        Shifts
                                    </label>

                                    <p className="shift-help-text">
                                        These shifts will be linked
                                        to this newly created class.
                                    </p>

                                    <div className="shift-options">

                                        {/* MORNING */}

                                        <label className="shift-option">

                                            <input
                                                type="checkbox"
                                                checked={
                                                    selectedShifts.includes(
                                                        "Morning"
                                                    )
                                                }
                                                onChange={() =>
                                                    handleShiftChange(
                                                        "Morning"
                                                    )
                                                }
                                            />

                                            <span className="shift-option-content">

                                                <Sun
                                                    size={17}
                                                />

                                                Morning

                                            </span>

                                        </label>

                                        {/* EVENING */}

                                        <label className="shift-option">

                                            <input
                                                type="checkbox"
                                                checked={
                                                    selectedShifts.includes(
                                                        "Evening"
                                                    )
                                                }
                                                onChange={() =>
                                                    handleShiftChange(
                                                        "Evening"
                                                    )
                                                }
                                            />

                                            <span className="shift-option-content">

                                                <Moon
                                                    size={17}
                                                />

                                                Evening

                                            </span>

                                        </label>

                                    </div>

                                </div>

                            )}

                            {/* ACTIONS */}

                            <div className="degree-modal-actions">

                                <button
                                    type="button"
                                    className="degree-cancel-btn"
                                    onClick={
                                        closeModal
                                    }
                                    disabled={
                                        saving
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="degree-save-btn"
                                    disabled={
                                        saving
                                    }
                                >

                                    {saving ? (

                                        <>
                                            <FaSpinner
                                                className="degree-button-spinner"
                                                size={15}
                                            />

                                            Saving...
                                        </>

                                    ) : (

                                        <>
                                            <Plus
                                                size={17}
                                            />

                                            {editingClass
                                                ? "Update Class"
                                                : "Add Class"}
                                        </>

                                    )}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

            {/* ===============================
                VIEW MODAL
            =============================== */}

            {viewingClass && (

                <div className="degree-modal-overlay">

                    <div className="degree-view-modal">

                        <div className="degree-modal-header">

                            <div>

                                <h2>
                                    Degree Class Details
                                </h2>

                                <p>
                                    Complete class information
                                </p>

                            </div>

                            <button
                                className="degree-close-btn"
                                onClick={() =>
                                    setViewingClass(
                                        null
                                    )
                                }
                                type="button"
                            >
                                <X size={19} />
                            </button>

                        </div>

                        <div className="degree-view-content">

                            {/* HERO */}

                            <div className="degree-view-hero">

                                <div className="degree-view-avatar">
                                    {
                                        viewingClass.code?.substring(
                                            0,
                                            3
                                        )
                                    }
                                </div>

                                <div>

                                    <h3>
                                        {
                                            viewingClass.name
                                        }
                                    </h3>

                                    <span>
                                        {
                                            viewingClass.code
                                        }
                                    </span>

                                </div>

                            </div>

                            {/* DETAILS */}

                            <div className="degree-detail-grid">

                                <div className="degree-detail-item">

                                    <span>
                                        Degree / Class
                                    </span>

                                    <strong>
                                        {
                                            viewingClass.name
                                        }
                                    </strong>

                                </div>

                                <div className="degree-detail-item">

                                    <span>
                                        Code
                                    </span>

                                    <strong>
                                        {
                                            viewingClass.code
                                        }
                                    </strong>

                                </div>

                                <div className="degree-detail-item">

                                    <span>
                                        Department
                                    </span>

                                    <strong>
                                        {
                                            getDepartmentName(
                                                viewingClass
                                            )
                                        }
                                    </strong>

                                </div>

                                <div className="degree-detail-item">

                                    <span>
                                        Program Type
                                    </span>

                                    <strong>
                                        {
                                            getProgramTypeLabel(
                                                viewingClass.programType
                                            )
                                        }
                                    </strong>

                                </div>

                                <div className="degree-detail-item">

                                    <span>
                                        Semester Range
                                    </span>

                                    <strong>
                                        {
                                            getSemesterRange(
                                                viewingClass
                                            )
                                        }
                                    </strong>

                                </div>

                                <div className="degree-detail-item">

                                    <span>
                                        Status
                                    </span>

                                    <strong
                                        className={
                                            viewingClass.isActive === false
                                                ? "detail-inactive"
                                                : "detail-active"
                                        }
                                    >
                                        {
                                            viewingClass.isActive === false
                                                ? "Inactive"
                                                : "Active"
                                        }
                                    </strong>

                                </div>

                            </div>

                            {/* SHIFTS */}

                            <div className="degree-view-shifts">

                                <div className="degree-view-shifts-header">

                                    <div>

                                        <h4>
                                            Assigned Shifts
                                        </h4>

                                        <p>
                                            Shifts belonging to this class
                                        </p>

                                    </div>

                                    <span>
                                        {
                                            getClassShifts(
                                                viewingClass
                                            ).length
                                        }
                                    </span>

                                </div>

                                {getClassShifts(
                                    viewingClass
                                ).length ? (

                                    <div className="degree-view-shift-list">

                                        {getClassShifts(
                                            viewingClass
                                        ).map(
                                            (shift) => {

                                                const id =
                                                    getId(
                                                        shift
                                                    );

                                                const morning =
                                                    shift.name?.toLowerCase() ===
                                                    "morning";

                                                return (

                                                    <div
                                                        key={
                                                            id
                                                        }
                                                        className="degree-view-shift"
                                                    >

                                                        <div className="degree-view-shift-icon">

                                                            {morning ? (

                                                                <Sun
                                                                    size={
                                                                        18
                                                                    }
                                                                />

                                                            ) : (

                                                                <Moon
                                                                    size={
                                                                        18
                                                                    }
                                                                />

                                                            )}

                                                        </div>

                                                        <div>

                                                            <strong>
                                                                {
                                                                    shift.name
                                                                }
                                                            </strong>

                                                            <small>
                                                                Shift
                                                            </small>

                                                        </div>

                                                    </div>

                                                );
                                            }
                                        )}

                                    </div>

                                ) : (

                                    <div className="degree-no-shifts">

                                        <Layers3
                                            size={20}
                                        />

                                        No shifts assigned

                                    </div>

                                )}

                            </div>

                            {/* FOOTER */}

                            <div className="degree-view-footer">

                                <button
                                    className="degree-cancel-btn"
                                    onClick={() =>
                                        setViewingClass(
                                            null
                                        )
                                    }
                                    type="button"
                                >
                                    Close
                                </button>

                                <button
                                    className="degree-save-btn"
                                    onClick={() => {

                                        const item =
                                            viewingClass;

                                        setViewingClass(
                                            null
                                        );

                                        handleEdit(
                                            item
                                        );
                                    }}
                                    type="button"
                                >

                                    <Pencil
                                        size={16}
                                    />

                                    Edit Class

                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
};

export default DegreeClasses;