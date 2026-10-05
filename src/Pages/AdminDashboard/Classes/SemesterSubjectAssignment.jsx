import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpen,
  Plus,
  X,
  Search,
  RefreshCw,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  XCircle,
  GraduationCap,
  Layers3,
  BookMarked,
  CreditCard,
  Target,
  Trash2,
  Pencil,
  Check,
  SlidersHorizontal,
  ChevronDown,
  CircleCheck,
  Sparkles,
} from "lucide-react";
import { FaSpinner } from "react-icons/fa";
import { getDegreeClasses } from "../../../services/degreeClassAPI";
import {
  getSemesters,
  createProgramSemester,
  getSemesterSubjects,
  addSemesterSubject,
  updateSemesterSubject,
  removeSemesterSubject,
  getAllSubjects,
} from "../../../services/semesterSubjectService";

/* ─── helpers ─────────────────────────────────────────────────── */

const getId = (x) => {
  if (!x) return "";
  if (typeof x === "string") return x;
  return x._id || x.id || "";
};

const getErrMsg = (err) =>
  err?.response?.data?.message || err?.message || "Something went wrong";

/** user ki permissions sessionStorage se lo */
const getUserPermissions = () => {
  try {
    const raw =
      sessionStorage.getItem("user") || localStorage.getItem("user");
    if (!raw) return [];
    const user = JSON.parse(raw);
    // role.permissions can be array of objects {key} or strings
    const perms = user?.role?.permissions || [];
    return perms.map((p) => (typeof p === "string" ? p : p?.key || ""));
  } catch {
    return [];
  }
};

const can = (action) => {
  const perms = getUserPermissions();
  // super-admin slug check
  try {
    const raw =
      sessionStorage.getItem("user") || localStorage.getItem("user");
    if (raw) {
      const u = JSON.parse(raw);
      if (u?.roleSlug === "super-admin" || u?.role?.slug === "super-admin")
        return true;
    }
  } catch {}
  return perms.includes(action);
};

const SUBJECT_TYPE_OPTIONS = ["COMPULSORY", "ELECTIVE"];

const typeBadge = (type) => {
  if (type === "ELECTIVE")
    return (
      <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-700">
        Elective
      </span>
    );
  return (
    <span className="inline-flex items-center rounded-full bg-teal-100 px-2 py-0.5 text-xs font-semibold text-teal-700">
      Compulsory
    </span>
  );
};

/* ─── Toast helper (auto-dismiss) ─────────────────────────────── */
const useToast = () => {
  const [msg, setMsg] = useState(null); // { text, type: 'success'|'error' }
  const timerRef = useRef(null);

  const show = (text, type = "success") => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setMsg({ text, type });
    timerRef.current = setTimeout(() => setMsg(null), 4500);
  };
  const dismiss = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setMsg(null);
  };

  return { msg, show, dismiss };
};

/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════ */
export default function SemesterSubjectAssignment() {
  /* ── data states ── */
  const [classes, setClasses] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]); // full catalog

  /* ── selection ── */
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSemesterId, setSelectedSemesterId] = useState("");

  /* ── per-class data ── */
  const [semesters, setSemesters] = useState([]);
  /** subjectsMap: { [semesterId]: SemesterSubject[] } */
  const [subjectsMap, setSubjectsMap] = useState({});

  /* ── UI states ── */
  const [pageLoading, setPageLoading] = useState(true);
  const [semLoading, setSemLoading] = useState(false);
  const [genLoading, setGenLoading] = useState(false);

  /* ── semester generation input ── */
  const [semCountInput, setSemCountInput] = useState("");

  /* ── add-subject panel ── */
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelSearch, setPanelSearch] = useState("");
  const [showAllDepts, setShowAllDepts] = useState(false);
  const [panelSubjectId, setPanelSubjectId] = useState("");
  const [panelCreditHours, setPanelCreditHours] = useState("");
  const [panelType, setPanelType] = useState("COMPULSORY");
  const [panelSaving, setPanelSaving] = useState(false);

  /* ── inline credit edit ── */
  const [editingCreditId, setEditingCreditId] = useState(null);
  const [editingCreditVal, setEditingCreditVal] = useState("");
  const [creditSaving, setCreditSaving] = useState(false);

  /* ── toast ── */
  const { msg: toast, show: showToast, dismiss: dismissToast } = useToast();

  /* ── permissions ── */
  const canCreateSem = can("programsemester:create");
  const canDeleteSem = can("programsemester:delete");
  const canCreateSubj = can("semestersubject:create");
  const canUpdateSubj = can("semestersubject:update");
  const canDeleteSubj = can("semestersubject:delete");

  /* ─── initial load ──────────────────────────────────────────── */
  useEffect(() => {
    const init = async () => {
      setPageLoading(true);
      try {
        const [classesRes, subjRes] = await Promise.all([
          getDegreeClasses(),
          getAllSubjects({ isActive: true }),
        ]);

        // getDegreeClasses returns response.data (object with data array)
        const classList = Array.isArray(classesRes)
          ? classesRes
          : Array.isArray(classesRes?.data)
          ? classesRes.data
          : [];

        setClasses(classList);
        setAllSubjects(Array.isArray(subjRes) ? subjRes : []);
      } catch (err) {
        showToast(getErrMsg(err), "error");
      } finally {
        setPageLoading(false);
      }
    };
    init();
    // eslint-disable-next-line
  }, []);

  /* ─── class selection → load semesters ─────────────────────── */
  useEffect(() => {
    if (!selectedClassId) {
      setSemesters([]);
      setSelectedSemesterId("");
      setSubjectsMap({});
      setSemCountInput("");
      return;
    }
    loadSemesters(selectedClassId);
    // eslint-disable-next-line
  }, [selectedClassId]);

  const loadSemesters = async (classId) => {
    setSemLoading(true);
    try {
      const data = await getSemesters(classId);
      const list = Array.isArray(data) ? data : [];
      setSemesters(list);

      // auto-select first
      if (list.length > 0) {
        const firstId = list[0]._id;
        setSelectedSemesterId(firstId);
        await loadSubjectsForSemester(firstId);
      } else {
        setSelectedSemesterId("");
      }

      // set default count from class
      const cls = classes.find((c) => c._id === classId);
      if (cls) {
        const defaultCount =
          cls.endSemester ||
          (cls.duration ? cls.duration * 2 : null) ||
          8;
        setSemCountInput(String(defaultCount));
      }
    } catch (err) {
      showToast(getErrMsg(err), "error");
    } finally {
      setSemLoading(false);
    }
  };

  /* ─── semester selection → load its subjects ───────────────── */
  useEffect(() => {
    if (!selectedSemesterId) return;
    if (subjectsMap[selectedSemesterId] !== undefined) return; // already loaded
    loadSubjectsForSemester(selectedSemesterId);
    // eslint-disable-next-line
  }, [selectedSemesterId]);

  const loadSubjectsForSemester = async (semId) => {
    try {
      const data = await getSemesterSubjects(semId);
      setSubjectsMap((prev) => ({
        ...prev,
        [semId]: Array.isArray(data) ? data : [],
      }));
    } catch (err) {
      showToast(getErrMsg(err), "error");
    }
  };

  const refreshCurrentSemester = async () => {
    if (!selectedSemesterId) return;
    // force reload
    setSubjectsMap((prev) => {
      const copy = { ...prev };
      delete copy[selectedSemesterId];
      return copy;
    });
    await loadSubjectsForSemester(selectedSemesterId);
  };

  /* ─── generate semesters ────────────────────────────────────── */
  const handleGenerateSemesters = async () => {
    const n = parseInt(semCountInput, 10);
    if (!n || n < 1 || n > 20) {
      showToast("Valid semester count likhein (1-20)", "error");
      return;
    }
    if (!selectedClassId) return;

    setGenLoading(true);
    let created = 0;
    let skipped = 0;
    const newSemesters = [];

    for (let i = 1; i <= n; i++) {
      try {
        const res = await createProgramSemester({
          degreeClassId: selectedClassId,
          semesterNo: i,
          name: `Semester ${i}`,
        });
        if (res?.data) newSemesters.push(res.data);
        created++;
      } catch (err) {
        if (err?.response?.status === 409) {
          skipped++; // already exists
        } else {
          showToast(`Semester ${i}: ${getErrMsg(err)}`, "error");
        }
      }
    }

    setGenLoading(false);
    // reload semesters
    await loadSemesters(selectedClassId);
    showToast(
      `${created} semester${created !== 1 ? "s" : ""} create ho gaye${
        skipped > 0 ? `, ${skipped} already existed (skip kiye)` : ""
      }`,
      "success"
    );
  };

  /* ─── add next semester ─────────────────────────────────────── */
  const handleAddNextSemester = async () => {
    if (!selectedClassId) return;
    const nextNo = semesters.length > 0
      ? Math.max(...semesters.map((s) => s.semesterNo)) + 1
      : 1;
    setGenLoading(true);
    try {
      await createProgramSemester({
        degreeClassId: selectedClassId,
        semesterNo: nextNo,
        name: `Semester ${nextNo}`,
      });
      await loadSemesters(selectedClassId);
      showToast(`Semester ${nextNo} add ho gaya`, "success");
    } catch (err) {
      if (err?.response?.status === 409) {
        showToast("Yeh semester pehle se exist karta hai", "error");
      } else {
        showToast(getErrMsg(err), "error");
      }
    } finally {
      setGenLoading(false);
    }
  };

  /* ─── computed data ─────────────────────────────────────────── */
  const selectedClass = classes.find((c) => c._id === selectedClassId) || null;

  /** All subjectIds already used anywhere in this class */
  const usedSubjectMap = useMemo(() => {
    // { subjectId: semesterNo }
    const map = {};
    semesters.forEach((sem) => {
      const list = subjectsMap[sem._id] || [];
      list.forEach((ss) => {
        const sid = getId(ss.subjectId);
        if (sid && !map[sid]) map[sid] = sem.semesterNo;
      });
    });
    return map;
  }, [semesters, subjectsMap]);

  const currentSubjects = subjectsMap[selectedSemesterId] || [];
  const selectedSemester = semesters.find((s) => s._id === selectedSemesterId) || null;

  /** Semester stats for left sidebar */
  const semesterStats = useMemo(() => {
    return semesters.map((sem) => {
      const list = subjectsMap[sem._id] || [];
      const totalCH = list.reduce(
        (acc, ss) => acc + Number(ss.creditHours || ss.subjectId?.creditHours || 0),
        0
      );
      return { semId: sem._id, count: list.length, totalCH };
    });
  }, [semesters, subjectsMap]);

  /** Class-level totals */
  const classTotals = useMemo(() => {
    let totalSubjects = 0;
    let totalCH = 0;
    semesters.forEach((sem) => {
      const list = subjectsMap[sem._id] || [];
      totalSubjects += list.length;
      totalCH += list.reduce(
        (acc, ss) => acc + Number(ss.creditHours || ss.subjectId?.creditHours || 0),
        0
      );
    });
    return { totalSubjects, totalCH };
  }, [semesters, subjectsMap]);

  /* ─── subject panel ─────────────────────────────────────────── */
  const classDeptId = selectedClass
    ? getId(selectedClass.departmentId)
    : "";

  const filteredPanelSubjects = useMemo(() => {
    let list = allSubjects;
    // By default only class department
    if (!showAllDepts && classDeptId) {
      list = list.filter((s) => getId(s.departmentId) === classDeptId);
    }
    if (panelSearch.trim()) {
      const q = panelSearch.toLowerCase();
      list = list.filter(
        (s) =>
          s.name?.toLowerCase().includes(q) ||
          s.code?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [allSubjects, showAllDepts, classDeptId, panelSearch]);

  const handleSelectSubject = (subject) => {
    setPanelSubjectId(subject._id);
    setPanelCreditHours(String(subject.creditHours || "3"));
  };

  const handleAddSubject = async () => {
    if (!panelSubjectId || !panelCreditHours || !selectedSemesterId) return;
    setPanelSaving(true);
    try {
      await addSemesterSubject({
        programSemesterId: selectedSemesterId,
        subjectId: panelSubjectId,
        creditHours: Number(panelCreditHours),
        subjectType: panelType,
      });
      showToast("Subject add ho gaya!", "success");
      closePanelAndReset();
      await refreshCurrentSemester();
    } catch (err) {
      if (err?.response?.status === 409) {
        showToast("Yeh subject is semester mein pehle se hai", "error");
      } else {
        showToast(getErrMsg(err), "error");
      }
    } finally {
      setPanelSaving(false);
    }
  };

  const closePanelAndReset = () => {
    setPanelOpen(false);
    setPanelSearch("");
    setPanelSubjectId("");
    setPanelCreditHours("");
    setPanelType("COMPULSORY");
    setShowAllDepts(false);
  };

  /* ─── remove subject ────────────────────────────────────────── */
  const handleRemoveSubject = async (id) => {
    if (!window.confirm("Is subject ko semester se hatayen?")) return;
    try {
      const res = await removeSemesterSubject(id);
      showToast(res?.message || "Subject hata diya gaya", "success");
      await refreshCurrentSemester();
    } catch (err) {
      showToast(getErrMsg(err), "error");
    }
  };

  /* ─── inline credit hour edit ───────────────────────────────── */
  const startCreditEdit = (ss) => {
    setEditingCreditId(ss._id);
    setEditingCreditVal(
      String(ss.creditHours || ss.subjectId?.creditHours || "")
    );
  };

  const saveCreditEdit = async (ss) => {
    if (!editingCreditVal || Number(editingCreditVal) <= 0) {
      setEditingCreditId(null);
      return;
    }
    setCreditSaving(true);
    try {
      await updateSemesterSubject(ss._id, {
        creditHours: Number(editingCreditVal),
      });
      showToast("Credit hours update ho gaye", "success");
      await refreshCurrentSemester();
    } catch (err) {
      showToast(getErrMsg(err), "error");
    } finally {
      setCreditSaving(false);
      setEditingCreditId(null);
    }
  };

  /* ─── prerequisite warning check ────────────────────────────── */
  const getPrereqWarning = (ss) => {
    // subject model prerequisites array
    const subjectObj =
      typeof ss.subjectId === "object" ? ss.subjectId : null;
    if (!subjectObj) return null;
    const prereqs = subjectObj.prerequisites || [];
    if (!prereqs.length) return null;

    const currentSemNo = selectedSemester?.semesterNo || 0;
    const warnings = [];

    prereqs.forEach((p) => {
      const pid = getId(p.subjectId || p);
      const inSemNo = usedSubjectMap[pid];
      if (inSemNo === undefined) {
        warnings.push("Prerequisite class mein nahi hai");
      } else if (inSemNo >= currentSemNo) {
        warnings.push(`Prerequisite Sem ${inSemNo} mein hai (baad mein ya saath mein)`);
      }
    });

    return warnings.length > 0 ? warnings : null;
  };

  /* ══════════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════════ */

  if (pageLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-slate-500">
        <FaSpinner className="animate-spin text-4xl text-teal-600" />
        <p className="text-sm">Loading...</p>
      </div>
    );
  }

  if (pageLoading) {
  return (
    <div className="min-h-[70vh] bg-[#F5F7FA] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF3FA]">
          <FaSpinner className="animate-spin text-2xl text-[#2F76B8]" />
        </div>

        <div className="text-center">
          <p className="font-semibold text-[#1F2937]">
            Loading Semester Subjects
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Please wait while data is loading...
          </p>
        </div>
      </div>
    </div>
  );
}

return (
  <div className="min-h-screen bg-[#F5F7FA] p-3 sm:p-5 lg:p-6">

    {/* =========================================================
        TOAST
    ========================================================== */}
    {toast && (
      <div
        className={`fixed right-4 top-4 z-[100] flex w-[calc(100%-2rem)] max-w-sm items-start gap-3 rounded-2xl border px-4 py-3.5 shadow-xl backdrop-blur ${
          toast.type === "success"
            ? "border-emerald-200 bg-white"
            : "border-red-200 bg-white"
        }`}
      >
        <div
          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
            toast.type === "success"
              ? "bg-emerald-100 text-emerald-600"
              : "bg-red-100 text-red-600"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle size={17} />
          ) : (
            <XCircle size={17} />
          )}
        </div>

        <div className="flex-1">
          <p
            className={`text-sm font-semibold ${
              toast.type === "success"
                ? "text-emerald-700"
                : "text-red-700"
            }`}
          >
            {toast.type === "success" ? "Success" : "Error"}
          </p>

          <p className="mt-0.5 text-xs leading-5 text-slate-500">
            {toast.text}
          </p>
        </div>

        <button
          onClick={dismissToast}
          className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <X size={15} />
        </button>
      </div>
    )}

    {/* =========================================================
        PAGE HEADER
    ========================================================== */}
    <div className="mb-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

      <div className="relative overflow-hidden bg-gradient-to-r from-[#214B78] to-[#2F76B8] px-5 py-6 sm:px-7">

        {/* decorative circles */}
        <div className="absolute -right-10 -top-16 h-44 w-44 rounded-full bg-white/10" />
        <div className="absolute -bottom-20 right-32 h-36 w-36 rounded-full bg-white/5" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white ring-1 ring-white/20 backdrop-blur">
              <GraduationCap size={28} />
            </div>

            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-[0.16em] text-blue-100">
                Academic Management
              </p>

              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Semester Subjects
              </h1>

              <p className="mt-1 text-sm text-blue-100">
                Manage semesters and assign subjects to each semester.
              </p>
            </div>
          </div>

          {/* Class Selector */}
          <div className="w-full lg:w-[330px]">
            <label className="mb-1.5 block text-xs font-semibold text-blue-100">
              SELECT CLASS
            </label>

            <div className="relative">
              <GraduationCap
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2F76B8]"
              />

              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full appearance-none rounded-xl border border-white/20 bg-white py-3 pl-10 pr-10 text-sm font-semibold text-[#1F2937] shadow-lg outline-none transition focus:ring-4 focus:ring-white/20"
              >
                <option value="">-- Select Class --</option>

                {classes.map((cls) => (
                  <option key={cls._id} value={cls._id}>
                    {cls.name} {cls.code ? `(${cls.code})` : ""}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={17}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* selected class mini info */}
      {selectedClass && (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-slate-100 px-5 py-3.5 sm:px-7">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-400">
              CLASS
            </span>
            <span className="text-sm font-semibold text-[#214B78]">
              {selectedClass.name}
            </span>
          </div>

          {selectedClass.code && (
            <>
              <div className="hidden h-4 w-px bg-slate-200 sm:block" />

              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-400">
                  CODE
                </span>

                <span className="rounded-md bg-[#EAF3FA] px-2 py-1 font-mono text-xs font-semibold text-[#2F76B8]">
                  {selectedClass.code}
                </span>
              </div>
            </>
          )}

          {selectedClass.totalCreditHours && (
            <>
              <div className="hidden h-4 w-px bg-slate-200 sm:block" />

              <div className="flex items-center gap-2">
                <Target size={14} className="text-[#2F76B8]" />

                <span className="text-xs text-slate-500">
                  Target Credit Hours:
                </span>

                <span className="text-sm font-bold text-slate-700">
                  {selectedClass.totalCreditHours}
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </div>

    {/* =========================================================
        NO CLASS SELECTED
    ========================================================== */}
    {!selectedClassId ? (
      <div className="rounded-2xl border border-slate-200 bg-white px-6 py-20 shadow-sm">
        <div className="mx-auto flex max-w-md flex-col items-center text-center">

          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-[#EAF3FA] text-[#2F76B8]">
            <BookMarked size={36} strokeWidth={1.7} />
          </div>

          <h2 className="text-lg font-bold text-slate-800">
            Select a Class
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Select a degree class from the dropdown above to manage its
            semesters and assign subjects.
          </p>

          <div className="mt-5 flex items-center gap-2 rounded-lg bg-slate-50 px-4 py-2.5 text-xs text-slate-500">
            <Sparkles size={14} className="text-[#2F76B8]" />
            Start by selecting a class
          </div>
        </div>
      </div>
    ) : (
      <>
        {/* =====================================================
            STATISTICS
        ====================================================== */}
        <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">

          {/* Semesters */}
          <div className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">
                  Total Semesters
                </p>

                <p className="mt-2 text-2xl font-bold text-[#214B78]">
                  {semesters.length}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAF3FA] text-[#2F76B8]">
                <Layers3 size={19} />
              </div>
            </div>

            <div className="mt-3 h-1 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full w-2/3 rounded-full bg-[#2F76B8]" />
            </div>
          </div>

          {/* Subjects */}
          <div className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">
                  Assigned Subjects
                </p>

                <p className="mt-2 text-2xl font-bold text-indigo-700">
                  {classTotals.totalSubjects}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <BookOpen size={19} />
              </div>
            </div>

            <p className="mt-3 text-[11px] text-slate-400">
              Across all semesters
            </p>
          </div>

          {/* Credit Hours */}
          <div className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">
                  Assigned Credit Hours
                </p>

                <p className="mt-2 text-2xl font-bold text-emerald-700">
                  {classTotals.totalCH}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <CreditCard size={19} />
              </div>
            </div>

            <p className="mt-3 text-[11px] text-slate-400">
              Total assigned workload
            </p>
          </div>

          {/* Target */}
          <div className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">
                  Target Credit Hours
                </p>

                <p
                  className={`mt-2 text-2xl font-bold ${
                    selectedClass.totalCreditHours &&
                    classTotals.totalCH > selectedClass.totalCreditHours
                      ? "text-red-600"
                      : "text-amber-600"
                  }`}
                >
                  {selectedClass.totalCreditHours || "—"}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Target size={19} />
              </div>
            </div>

            <p className="mt-3 text-[11px] text-slate-400">
              Program requirement
            </p>
          </div>
        </div>

        {/* =====================================================
            OVER LIMIT WARNING
        ====================================================== */}
        {selectedClass.totalCreditHours > 0 &&
          classTotals.totalCH > selectedClass.totalCreditHours && (
            <div className="mb-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                <AlertTriangle size={17} />
              </div>

              <div>
                <p className="text-sm font-semibold text-amber-800">
                  Credit hour limit exceeded
                </p>

                <p className="mt-0.5 text-xs text-amber-700">
                  Assigned credit hours ({classTotals.totalCH}) are higher
                  than the target ({selectedClass.totalCreditHours}).
                </p>
              </div>
            </div>
          )}

        {/* =====================================================
            MAIN CONTENT
        ====================================================== */}
        {semLoading ? (
          <div className="rounded-2xl border border-slate-200 bg-white py-20 shadow-sm">
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EAF3FA]">
                <FaSpinner className="animate-spin text-xl text-[#2F76B8]" />
              </div>

              <p className="text-sm font-medium text-slate-600">
                Loading semesters...
              </p>

              <p className="text-xs text-slate-400">
                Please wait
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[290px_minmax(0,1fr)]">

            {/* =================================================
                SEMESTER SIDEBAR
            ================================================== */}
            <div className="h-fit overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="border-b border-slate-100 px-4 py-4">
                <div className="flex items-center justify-between">

                  <div>
                    <h2 className="text-sm font-bold text-slate-800">
                      Semesters
                    </h2>

                    <p className="mt-0.5 text-xs text-slate-400">
                      Select semester to manage subjects
                    </p>
                  </div>

                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EAF3FA] text-[#2F76B8]">
                    <Layers3 size={16} />
                  </div>
                </div>
              </div>

              {/* NO SEMESTERS */}
              {semesters.length === 0 ? (
                <div className="p-4">

                  <div className="mb-4 rounded-xl bg-[#F5F7FA] p-4">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-white text-[#2F76B8] shadow-sm">
                      <Layers3 size={19} />
                    </div>

                    <p className="text-sm font-semibold text-slate-700">
                      No semesters found
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Generate semesters for this class using the number
                      below.
                    </p>
                  </div>

                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    NUMBER OF SEMESTERS
                  </label>

                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={semCountInput}
                    onChange={(e) => setSemCountInput(e.target.value)}
                    placeholder="e.g. 8"
                    className="mb-3 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none transition focus:border-[#2F76B8] focus:bg-white focus:ring-4 focus:ring-blue-50"
                  />

                  <button
                    disabled={!canCreateSem || genLoading}
                    onClick={handleGenerateSemesters}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#214B78] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#193c62] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {genLoading ? (
                      <FaSpinner className="animate-spin" />
                    ) : (
                      <>
                        <Plus size={16} />
                        Generate Semesters
                      </>
                    )}
                  </button>

                  {!canCreateSem && (
                    <p className="mt-3 rounded-lg bg-amber-50 p-2.5 text-[11px] leading-4 text-amber-700">
                      You don't have permission to create semesters.
                    </p>
                  )}
                </div>
              ) : (
                <>
                  <div className="max-h-[540px] overflow-y-auto p-2">

                    {semesters.map((sem) => {
                      const stats =
                        semesterStats.find(
                          (s) => s.semId === sem._id
                        ) || {
                          count: 0,
                          totalCH: 0,
                        };

                      const isSelected =
                        sem._id === selectedSemesterId;

                      return (
                        <button
                          key={sem._id}
                          onClick={() =>
                            setSelectedSemesterId(sem._id)
                          }
                          className={`group mb-1.5 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${
                            isSelected
                              ? "bg-[#214B78] text-white shadow-md"
                              : "text-slate-700 hover:bg-[#EAF3FA]"
                          }`}
                        >
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                              isSelected
                                ? "bg-white/15 text-white"
                                : "bg-slate-100 text-[#214B78] group-hover:bg-white"
                            }`}
                          >
                            {sem.semesterNo}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p
                              className={`truncate text-sm font-semibold ${
                                isSelected
                                  ? "text-white"
                                  : "text-slate-700"
                              }`}
                            >
                              Semester {sem.semesterNo}
                            </p>

                            <p
                              className={`mt-0.5 text-[11px] ${
                                isSelected
                                  ? "text-blue-100"
                                  : "text-slate-400"
                              }`}
                            >
                              {stats.count} subject
                              {stats.count !== 1 ? "s" : ""}{" "}
                              · {stats.totalCH} CH
                            </p>
                          </div>

                          {isSelected && (
                            <ChevronRight
                              size={17}
                              className="shrink-0 text-white"
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* ADD NEXT SEMESTER */}
                  <div className="border-t border-slate-100 p-3">
                    <button
                      disabled={!canCreateSem || genLoading}
                      onClick={handleAddNextSemester}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#2F76B8] bg-[#EAF3FA] py-2.5 text-xs font-semibold text-[#214B78] transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {genLoading ? (
                        <FaSpinner className="animate-spin" />
                      ) : (
                        <>
                          <Plus size={15} />
                          Add Next Semester
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* =================================================
                SUBJECT AREA
            ================================================== */}
            <div className="min-w-0">

              {!selectedSemesterId ? (
                <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">

                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EAF3FA] text-[#2F76B8]">
                    <BookOpen size={28} />
                  </div>

                  <h3 className="mt-4 text-base font-bold text-slate-700">
                    Select a Semester
                  </h3>

                  <p className="mt-1 max-w-sm text-center text-xs leading-5 text-slate-400">
                    Choose a semester from the left panel to view and
                    manage assigned subjects.
                  </p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                  {/* SUBJECT HEADER */}
                  <div className="border-b border-slate-100 px-5 py-4 sm:px-6">

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                      <div className="flex items-center gap-3">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EAF3FA] text-[#2F76B8]">
                          <BookOpen size={20} />
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-base font-bold text-slate-800">
                              Semester{" "}
                              {selectedSemester?.semesterNo}
                            </h2>

                            <span className="rounded-full bg-[#EAF3FA] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#2F76B8]">
                              Active
                            </span>
                          </div>

                          <p className="mt-1 text-xs text-slate-400">
                            {currentSubjects.length} subject
                            {currentSubjects.length !== 1
                              ? "s"
                              : ""}{" "}
                            ·{" "}
                            {currentSubjects.reduce(
                              (a, ss) =>
                                a +
                                Number(
                                  ss.creditHours ||
                                    ss.subjectId?.creditHours ||
                                    0
                                ),
                              0
                            )}{" "}
                            credit hours
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">

                        <button
                          onClick={refreshCurrentSemester}
                          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-[#2F76B8] hover:bg-[#EAF3FA] hover:text-[#2F76B8]"
                          title="Refresh subjects"
                        >
                          <RefreshCw size={16} />
                        </button>

                        {canCreateSubj && (
                          <button
                            onClick={() => setPanelOpen(true)}
                            className="flex items-center gap-2 rounded-xl bg-[#214B78] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#193c62]"
                          >
                            <Plus size={16} />
                            <span className="hidden sm:inline">
                              Add Subject
                            </span>
                            <span className="sm:hidden">Add</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* SUBJECT EMPTY */}
                  {currentSubjects.length === 0 ? (
                    <div className="flex min-h-[400px] flex-col items-center justify-center px-5 text-center">

                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-300">
                        <BookOpen size={30} />
                      </div>

                      <h3 className="mt-4 text-sm font-bold text-slate-700">
                        No subjects assigned
                      </h3>

                      <p className="mt-1 max-w-sm text-xs leading-5 text-slate-400">
                        This semester doesn't have any subjects yet.
                        Add subjects from your subject catalog.
                      </p>

                      {canCreateSubj && (
                        <button
                          onClick={() => setPanelOpen(true)}
                          className="mt-5 flex items-center gap-2 rounded-xl bg-[#214B78] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#193c62]"
                        >
                          <Plus size={15} />
                          Add First Subject
                        </button>
                      )}
                    </div>
                  ) : (
                    <>
                      {/* TABLE */}
                      <div className="overflow-x-auto">
                        <table className="min-w-[760px] w-full text-left">

                          <thead>
                            <tr className="border-b border-slate-100 bg-[#F8FAFC]">
                              <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Subject
                              </th>

                              <th className="px-4 py-3.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Code
                              </th>

                              <th className="px-4 py-3.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Type
                              </th>

                              <th className="px-4 py-3.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Credit Hours
                              </th>

                              <th className="px-4 py-3.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Status
                              </th>

                              {(canUpdateSubj || canDeleteSubj) && (
                                <th className="px-5 py-3.5 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                  Actions
                                </th>
                              )}
                            </tr>
                          </thead>

                          <tbody className="divide-y divide-slate-100">

                            {currentSubjects.map((ss) => {
                              const subj =
                                typeof ss.subjectId === "object"
                                  ? ss.subjectId
                                  : null;

                              const name = subj?.name || "—";
                              const code = subj?.code || "—";
                              const warnings = getPrereqWarning(ss);

                              return (
                                <tr
                                  key={ss._id}
                                  className="group transition hover:bg-[#F8FBFE]"
                                >
                                  {/* SUBJECT */}
                                  <td className="px-5 py-4">

                                    <div className="flex items-start gap-3">

                                      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EAF3FA] text-[#2F76B8]">
                                        <BookOpen size={16} />
                                      </div>

                                      <div className="min-w-0">
                                        <p className="font-semibold text-slate-700">
                                          {name}
                                        </p>

                                        {warnings && (
                                          <div className="mt-2 flex flex-wrap gap-1">
                                            {warnings.map((w, i) => (
                                              <span
                                                key={i}
                                                className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1 text-[10px] font-medium text-amber-700"
                                              >
                                                <AlertTriangle size={10} />
                                                {w}
                                              </span>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </td>

                                  {/* CODE */}
                                  <td className="px-4 py-4">
                                    <span className="inline-flex rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-[11px] font-semibold text-slate-600">
                                      {code}
                                    </span>
                                  </td>

                                  {/* TYPE */}
                                  <td className="px-4 py-4">
                                    {ss.subjectType === "ELECTIVE" ? (
                                      <span className="inline-flex items-center rounded-full bg-purple-50 px-2.5 py-1 text-[10px] font-bold text-purple-700">
                                        Elective
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center rounded-full bg-[#EAF3FA] px-2.5 py-1 text-[10px] font-bold text-[#2F76B8]">
                                        Compulsory
                                      </span>
                                    )}
                                  </td>

                                  {/* CREDIT HOURS */}
                                  <td className="px-4 py-4">
                                    {editingCreditId === ss._id ? (
                                      <div className="flex items-center gap-1.5">
                                        <input
                                          type="number"
                                          min="1"
                                          value={editingCreditVal}
                                          onChange={(e) =>
                                            setEditingCreditVal(
                                              e.target.value
                                            )
                                          }
                                          className="w-16 rounded-lg border border-[#2F76B8] px-2 py-1.5 text-xs font-semibold outline-none ring-4 ring-blue-50"
                                          autoFocus
                                          onKeyDown={(e) => {
                                            if (e.key === "Enter")
                                              saveCreditEdit(ss);

                                            if (e.key === "Escape")
                                              setEditingCreditId(null);
                                          }}
                                        />

                                        <button
                                          onClick={() =>
                                            saveCreditEdit(ss)
                                          }
                                          disabled={creditSaving}
                                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                                        >
                                          {creditSaving ? (
                                            <FaSpinner className="animate-spin text-[11px]" />
                                          ) : (
                                            <Check size={13} />
                                          )}
                                        </button>

                                        <button
                                          onClick={() =>
                                            setEditingCreditId(null)
                                          }
                                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200"
                                        >
                                          <X size={13} />
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        disabled={!canUpdateSubj}
                                        onClick={() =>
                                          canUpdateSubj &&
                                          startCreditEdit(ss)
                                        }
                                        className={`group/credit inline-flex items-center gap-1.5 rounded-lg px-2 py-1 transition ${
                                          canUpdateSubj
                                            ? "hover:bg-[#EAF3FA]"
                                            : ""
                                        }`}
                                        title={
                                          canUpdateSubj
                                            ? "Edit credit hours"
                                            : ""
                                        }
                                      >
                                        <span className="font-bold text-slate-700">
                                          {ss.creditHours ||
                                            subj?.creditHours ||
                                            "—"}
                                        </span>

                                        {canUpdateSubj && (
                                          <Pencil
                                            size={11}
                                            className="text-slate-300 transition group-hover/credit:text-[#2F76B8]"
                                          />
                                        )}
                                      </button>
                                    )}
                                  </td>

                                  {/* STATUS */}
                                  <td className="px-4 py-4">
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                      Active
                                    </span>
                                  </td>

                                  {/* ACTIONS */}
                                  {(canUpdateSubj || canDeleteSubj) && (
                                    <td className="px-5 py-4 text-right">
                                      {canDeleteSubj && (
                                        <button
                                          onClick={() =>
                                            handleRemoveSubject(ss._id)
                                          }
                                          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-red-100 bg-white text-red-500 opacity-70 transition hover:border-red-200 hover:bg-red-50 hover:opacity-100"
                                          title="Remove subject"
                                        >
                                          <Trash2 size={15} />
                                        </button>
                                      )}
                                    </td>
                                  )}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* TABLE FOOTER */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-[#F8FAFC] px-5 py-3">

                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <CircleCheck
                            size={14}
                            className="text-emerald-500"
                          />

                          <span>
                            {currentSubjects.length} subject
                            {currentSubjects.length !== 1
                              ? "s"
                              : ""}{" "}
                            assigned
                          </span>
                        </div>

                        <div className="flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 shadow-sm ring-1 ring-slate-100">
                          <CreditCard
                            size={13}
                            className="text-[#2F76B8]"
                          />

                          <span className="text-xs text-slate-500">
                            Semester Total:
                          </span>

                          <strong className="text-xs text-[#214B78]">
                            {currentSubjects.reduce(
                              (a, ss) =>
                                a +
                                Number(
                                  ss.creditHours ||
                                    ss.subjectId?.creditHours ||
                                    0
                                ),
                              0
                            )}{" "}
                            CH
                          </strong>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </>
    )}

    {/* =========================================================
        ADD SUBJECT DRAWER
    ========================================================== */}
    {panelOpen && (
  <div className="fixed inset-0 z-[9999]">

    {/* Backdrop */}
    <div
      className="absolute inset-0 bg-[#0F2742]/50 backdrop-blur-[2px]"
      onClick={closePanelAndReset}
    />

    {/* Drawer */}
    <div className="absolute right-0 top-0 z-[10000] flex h-[100dvh] w-full max-w-xl flex-col overflow-hidden bg-white shadow-2xl">

      {/* =========================================================
          DRAWER HEADER
      ========================================================= */}
      <div className="relative shrink-0 overflow-hidden bg-gradient-to-r from-[#214B78] to-[#2F76B8] px-5 py-5 sm:px-6">

        {/* Decorative Circle */}
        <div className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/10" />

        <div className="relative flex items-start justify-between">

          {/* Header Left */}
          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white ring-1 ring-white/20">
              <BookOpen size={20} />
            </div>

            <div>
              <p className="text-xs font-medium text-blue-100">
                Semester {selectedSemester?.semesterNo}
              </p>

              <h3 className="mt-0.5 text-lg font-bold text-white">
                Add Subject
              </h3>

              <p className="mt-0.5 text-xs text-blue-100">
                Select a subject and configure its details.
              </p>
            </div>

          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={closePanelAndReset}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20"
          >
            <X size={18} />
          </button>

        </div>
      </div>

      {/* =========================================================
          DRAWER BODY
      ========================================================= */}
      <div className="min-h-0 flex-1 overflow-y-auto bg-[#F8FAFC] px-5 py-5 sm:px-6">

        {/* =======================================================
            SEARCH CARD
        ======================================================= */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

          {/* Card Header */}
          <div className="mb-3 flex items-center justify-between">

            <div>
              <h4 className="text-sm font-bold text-slate-700">
                Subject Catalog
              </h4>

              <p className="mt-0.5 text-[11px] text-slate-400">
                Search by subject name or code
              </p>
            </div>

            <SlidersHorizontal
              size={17}
              className="text-[#2F76B8]"
            />

          </div>

          {/* Search Input */}
          <div className="relative">

            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search subject..."
              value={panelSearch}
              onChange={(e) => setPanelSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#2F76B8] focus:bg-white focus:ring-4 focus:ring-blue-50"
            />

          </div>

          {/* Department Filter */}
          <label className="mt-3 flex cursor-pointer items-center gap-2 rounded-lg bg-slate-50 px-3 py-2.5">

            <input
              type="checkbox"
              checked={showAllDepts}
              onChange={(e) =>
                setShowAllDepts(e.target.checked)
              }
              className="h-4 w-4 rounded border-slate-300 text-[#2F76B8] focus:ring-[#2F76B8]"
            />

            <span className="text-xs font-medium text-slate-600">
              Show subjects from all departments
            </span>

          </label>

        </div>

        {/* =======================================================
            AVAILABLE SUBJECTS
        ======================================================= */}
        <div className="mt-4">

          {/* Section Header */}
          <div className="mb-2 flex items-center justify-between">

            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Available Subjects
            </p>

            <span className="text-[11px] text-slate-400">
              {filteredPanelSubjects.length} found
            </span>

          </div>

          {/* Subject List */}
          <div className="space-y-2">

            {filteredPanelSubjects.length === 0 ? (

              /* Empty State */
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center">

                <Search
                  size={25}
                  className="mx-auto text-slate-300"
                />

                <p className="mt-3 text-sm font-semibold text-slate-600">
                  No subjects found
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Try another search term.
                </p>

              </div>

            ) : (

              /* Subjects */
              filteredPanelSubjects.map((s) => {

                const alreadyInSem = currentSubjects.some(
                  (ss) => getId(ss.subjectId) === s._id
                );

                const usedInSemNo = usedSubjectMap[s._id];

                const usedElsewhere =
                  usedInSemNo !== undefined &&
                  usedInSemNo !==
                    selectedSemester?.semesterNo;

                const disabled =
                  alreadyInSem || usedElsewhere;

                return (
                  <button
                    key={s._id}
                    type="button"
                    disabled={disabled}
                    onClick={() =>
                      !disabled && handleSelectSubject(s)
                    }
                    className={`w-full rounded-xl border p-3.5 text-left transition ${
                      panelSubjectId === s._id
                        ? "border-[#2F76B8] bg-[#EAF3FA] ring-2 ring-blue-50"
                        : disabled
                        ? "cursor-not-allowed border-slate-100 bg-slate-50 opacity-55"
                        : "border-slate-200 bg-white hover:border-[#8BB9DB] hover:bg-[#F8FBFE]"
                    }`}
                  >

                    <div className="flex items-center gap-3">

                      {/* Subject Icon */}
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                          panelSubjectId === s._id
                            ? "bg-[#2F76B8] text-white"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        <BookOpen size={17} />
                      </div>

                      {/* Subject Information */}
                      <div className="min-w-0 flex-1">

                        <p className="truncate text-sm font-semibold text-slate-700">
                          {s.name}
                        </p>

                        <div className="mt-1 flex items-center gap-2">

                          <span className="font-mono text-[10px] text-slate-400">
                            {s.code}
                          </span>

                          <span className="text-slate-300">
                            •
                          </span>

                          <span className="text-[10px] text-slate-400">
                            {s.creditHours} CH
                          </span>

                        </div>

                      </div>

                      {/* Status */}
                      <div className="shrink-0">

                        {alreadyInSem ? (

                          <span className="rounded-full bg-slate-200 px-2 py-1 text-[9px] font-bold text-slate-500">
                            Already Added
                          </span>

                        ) : usedElsewhere ? (

                          <span className="rounded-full bg-amber-50 px-2 py-1 text-[9px] font-bold text-amber-600">
                            Sem {usedInSemNo}
                          </span>

                        ) : panelSubjectId === s._id ? (

                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#2F76B8] text-white">
                            <Check size={14} />
                          </div>

                        ) : null}

                      </div>

                    </div>

                  </button>
                );
              })

            )}

          </div>

        </div>

        {/* =======================================================
            SELECTED SUBJECT CONFIGURATION
        ======================================================= */}
        {panelSubjectId && (
          <div className="mt-5 rounded-2xl border border-[#B9D7EB] bg-[#EAF3FA] p-4">

            {/* Selected Subject Header */}
            <div className="mb-4 flex items-center gap-3">

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#2F76B8] text-white">
                <Check size={17} />
              </div>

              <div className="min-w-0">

                <p className="text-[10px] font-bold uppercase tracking-wider text-[#2F76B8]">
                  Selected Subject
                </p>

                <p className="mt-0.5 truncate text-sm font-bold text-[#214B78]">
                  {
                    allSubjects.find(
                      (s) => s._id === panelSubjectId
                    )?.name
                  }
                </p>

              </div>

            </div>

            {/* Configuration Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

              {/* Credit Hours */}
              <div>

                <label className="mb-1.5 block text-xs font-bold text-slate-600">
                  Credit Hours
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>

                <input
                  type="number"
                  min="1"
                  max="10"
                  value={panelCreditHours}
                  onChange={(e) =>
                    setPanelCreditHours(e.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-[#2F76B8] focus:ring-4 focus:ring-blue-50"
                />

              </div>

              {/* Subject Type */}
              <div>

                <label className="mb-1.5 block text-xs font-bold text-slate-600">
                  Subject Type
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>

                <div className="grid grid-cols-2 gap-2">

                  {SUBJECT_TYPE_OPTIONS.map((opt) => (

                    <button
                      key={opt}
                      type="button"
                      onClick={() => setPanelType(opt)}
                      className={`rounded-xl border px-2 py-2.5 text-xs font-bold transition ${
                        panelType === opt
                          ? opt === "COMPULSORY"
                            ? "border-[#2F76B8] bg-[#214B78] text-white"
                            : "border-purple-500 bg-purple-600 text-white"
                          : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                      }`}
                    >
                      {opt === "COMPULSORY"
                        ? "Compulsory"
                        : "Elective"}
                    </button>

                  ))}

                </div>

              </div>

            </div>

          </div>
        )}

      </div>

      {/* =========================================================
          DRAWER FOOTER
      ========================================================= */}
      <div className="shrink-0 border-t border-slate-200 bg-white px-5 py-4 sm:px-6">

        <div className="flex items-center justify-between gap-3">

          {/* Cancel */}
          <button
            type="button"
            onClick={closePanelAndReset}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Cancel
          </button>

          {/* Add Subject */}
          <button
            type="button"
            onClick={handleAddSubject}
            disabled={
              !panelSubjectId ||
              !panelCreditHours ||
              panelSaving
            }
            className="flex items-center gap-2 rounded-xl bg-[#214B78] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#193c62] disabled:cursor-not-allowed disabled:opacity-50"
          >

            {panelSaving ? (
              <FaSpinner className="animate-spin" />
            ) : (
              <Plus size={16} />
            )}

            Add Subject

          </button>

        </div>

      </div>

    </div>
  </div>
)}
  </div>
);
}
