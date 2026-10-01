import React, { useEffect, useMemo, useRef, useState } from "react";
import { BookOpen, Plus, X, Search, RefreshCw, ChevronRight, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
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

  return (
    <div className="space-y-5 p-1 sm:p-2">
      {/* ── Toast ── */}
      {toast && (
        <div
          className={`fixed right-5 top-5 z-50 flex items-start gap-3 rounded-xl px-4 py-3 shadow-lg text-sm font-medium transition-all ${
            toast.type === "success"
              ? "bg-emerald-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle size={17} className="mt-0.5 shrink-0" />
          ) : (
            <XCircle size={17} className="mt-0.5 shrink-0" />
          )}
          <span className="max-w-xs">{toast.text}</span>
          <button
            onClick={dismissToast}
            className="ml-2 opacity-75 hover:opacity-100"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* ── Page Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-600 text-white">
            <BookOpen size={20} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">
              Semester Subjects
            </h1>
            <p className="text-xs text-slate-500">
              Class ke semesters banayein aur subjects assign karein
            </p>
          </div>
        </div>

        {/* Class Selector */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-600">Class:</label>
          <select
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
          >
            <option value="">-- Class chunein --</option>
            {classes.map((cls) => (
              <option key={cls._id} value={cls._id}>
                {cls.name} ({cls.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Class Summary Stats ── */}
      {selectedClass && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            {
              label: "Semesters",
              val: semesters.length,
              color: "text-teal-700 bg-teal-50",
            },
            {
              label: "Total Subjects",
              val: classTotals.totalSubjects,
              color: "text-indigo-700 bg-indigo-50",
            },
            {
              label: "Assigned CH",
              val: classTotals.totalCH,
              color: "text-emerald-700 bg-emerald-50",
            },
            {
              label: "Target CH",
              val: selectedClass.totalCreditHours || "—",
              color:
                selectedClass.totalCreditHours &&
                classTotals.totalCH > selectedClass.totalCreditHours
                  ? "text-red-700 bg-red-50"
                  : "text-amber-700 bg-amber-50",
            },
          ].map((s) => (
            <div
              key={s.label}
              className={`rounded-xl border border-slate-200 px-4 py-3 ${s.color}`}
            >
              <div className="text-xs font-medium opacity-70">{s.label}</div>
              <div className="mt-1 text-2xl font-bold">{s.val}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Over-limit warning ── */}
      {selectedClass &&
        selectedClass.totalCreditHours > 0 &&
        classTotals.totalCH > selectedClass.totalCreditHours && (
          <div className="flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <AlertTriangle size={16} className="shrink-0" />
            Assigned credit hours ({classTotals.totalCH}) target (
            {selectedClass.totalCreditHours}) se zyada hain!
          </div>
        )}

      {/* ── Main Panel ── */}
      {!selectedClassId ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 py-20 text-slate-500">
          <BookOpen size={36} className="opacity-40" />
          <p className="text-sm">Pehle class chunein</p>
        </div>
      ) : semLoading ? (
        <div className="flex items-center justify-center gap-3 py-16 text-slate-500">
          <FaSpinner className="animate-spin text-2xl text-teal-600" />
          <span className="text-sm">Semesters load ho rahe hain...</span>
        </div>
      ) : (
        <div className="flex gap-4 flex-col lg:flex-row">
          {/* ─── Left: Semester List ─────────────────────────────── */}
          <div className="w-full lg:w-72 shrink-0 space-y-3">
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-4 py-3">
                <h2 className="text-sm font-semibold text-slate-700">
                  Semesters
                </h2>
              </div>

              {/* No semesters → generate UI */}
              {semesters.length === 0 ? (
                <div className="px-4 py-5 space-y-3">
                  <p className="text-xs text-slate-500">
                    Is class ke koi semester nahi hain. Neeche count daal kar
                    generate karein:
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={semCountInput}
                      onChange={(e) => setSemCountInput(e.target.value)}
                      placeholder="Kitne? (e.g. 8)"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
                    />
                    <button
                      disabled={!canCreateSem || genLoading}
                      onClick={handleGenerateSemesters}
                      className="shrink-0 rounded-lg bg-teal-600 px-3 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
                      title={!canCreateSem ? "Aapke paas permission nahi" : ""}
                    >
                      {genLoading ? (
                        <FaSpinner className="animate-spin" />
                      ) : (
                        "Generate"
                      )}
                    </button>
                  </div>
                  {!canCreateSem && (
                    <p className="text-xs text-amber-600">
                      ⚠️ Aapko programsemester:create permission chahiye
                    </p>
                  )}
                </div>
              ) : (
                <>
                  {/* Semester list */}
                  <ul className="divide-y divide-slate-100">
                    {semesters.map((sem) => {
                      const stats = semesterStats.find(
                        (s) => s.semId === sem._id
                      ) || { count: 0, totalCH: 0 };
                      const isSelected = sem._id === selectedSemesterId;
                      return (
                        <li key={sem._id}>
                          <button
                            onClick={async () => {
                              setSelectedSemesterId(sem._id);
                            }}
                            className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm transition-colors ${
                              isSelected
                                ? "bg-teal-50 text-teal-800"
                                : "text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            <div>
                              <div className="font-medium">
                                Semester {sem.semesterNo}
                              </div>
                              <div className="mt-0.5 text-xs text-slate-400">
                                {stats.count} subject
                                {stats.count !== 1 ? "s" : ""} ·{" "}
                                {stats.totalCH} CH
                              </div>
                            </div>
                            {isSelected && (
                              <ChevronRight
                                size={15}
                                className="text-teal-600"
                              />
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>

                  {/* Add next semester */}
                  <div className="border-t border-slate-100 px-4 py-3">
                    <button
                      disabled={!canCreateSem || genLoading}
                      onClick={handleAddNextSemester}
                      className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-teal-400 py-2 text-xs font-medium text-teal-600 hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-50"
                      title={
                        !canCreateSem
                          ? "programsemester:create permission chahiye"
                          : ""
                      }
                    >
                      {genLoading ? (
                        <FaSpinner className="animate-spin" />
                      ) : (
                        <>
                          <Plus size={14} /> Agla Semester Add Karein
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ─── Right: Selected Semester Subjects ───────────────── */}
          <div className="flex-1 min-w-0">
            {!selectedSemesterId ? (
              <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 py-16 text-slate-400">
                <BookOpen size={28} className="opacity-40" />
                <p className="text-sm">Semester chunein</p>
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
                  <div>
                    <h2 className="font-semibold text-slate-800">
                      Semester {selectedSemester?.semesterNo} — Subjects
                    </h2>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {currentSubjects.length} subject
                      {currentSubjects.length !== 1 ? "s" : ""} ·{" "}
                      {currentSubjects.reduce(
                        (a, ss) =>
                          a +
                          Number(
                            ss.creditHours || ss.subjectId?.creditHours || 0
                          ),
                        0
                      )}{" "}
                      total CH
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={refreshCurrentSemester}
                      className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
                      title="Refresh"
                    >
                      <RefreshCw size={15} />
                    </button>
                    {canCreateSubj && (
                      <button
                        onClick={() => setPanelOpen(true)}
                        className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-2 text-sm font-medium text-white hover:bg-teal-700"
                      >
                        <Plus size={15} /> Subject Add Karein
                      </button>
                    )}
                  </div>
                </div>

                {/* Table */}
                {currentSubjects.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-16 text-slate-400">
                    <BookOpen size={28} className="opacity-30" />
                    <p className="text-sm">Is semester mein koi subject nahi</p>
                    {canCreateSubj && (
                      <button
                        onClick={() => setPanelOpen(true)}
                        className="mt-2 flex items-center gap-1 rounded-lg bg-teal-600 px-3 py-2 text-sm text-white hover:bg-teal-700"
                      >
                        <Plus size={14} /> Subject Add Karein
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead className="bg-slate-50 text-xs font-medium uppercase tracking-wide text-slate-500">
                        <tr>
                          <th className="px-4 py-3">Subject</th>
                          <th className="px-4 py-3">Code</th>
                          <th className="px-4 py-3">Type</th>
                          <th className="px-4 py-3">Credit Hours</th>
                          <th className="px-4 py-3">Status</th>
                          {(canUpdateSubj || canDeleteSubj) && (
                            <th className="px-4 py-3 text-right">Actions</th>
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
                              className="hover:bg-slate-50 transition-colors"
                            >
                              <td className="px-4 py-3">
                                <div className="font-medium text-slate-800">
                                  {name}
                                </div>
                                {warnings && (
                                  <div className="mt-1 flex flex-wrap gap-1">
                                    {warnings.map((w, i) => (
                                      <span
                                        key={i}
                                        className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700"
                                      >
                                        <AlertTriangle size={10} />
                                        {w}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-600">
                                  {code}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                {typeBadge(ss.subjectType)}
                              </td>
                              <td className="px-4 py-3">
                                {editingCreditId === ss._id ? (
                                  <div className="flex items-center gap-1">
                                    <input
                                      type="number"
                                      min="1"
                                      value={editingCreditVal}
                                      onChange={(e) =>
                                        setEditingCreditVal(e.target.value)
                                      }
                                      className="w-16 rounded border border-teal-400 px-1.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-teal-300"
                                      autoFocus
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter")
                                          saveCreditEdit(ss);
                                        if (e.key === "Escape")
                                          setEditingCreditId(null);
                                      }}
                                    />
                                    <button
                                      onClick={() => saveCreditEdit(ss)}
                                      disabled={creditSaving}
                                      className="rounded bg-teal-600 px-1.5 py-1 text-xs text-white hover:bg-teal-700 disabled:opacity-50"
                                    >
                                      {creditSaving ? "..." : "✓"}
                                    </button>
                                    <button
                                      onClick={() => setEditingCreditId(null)}
                                      className="rounded bg-slate-200 px-1.5 py-1 text-xs text-slate-600 hover:bg-slate-300"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ) : (
                                  <span
                                    className={`font-medium text-slate-700 ${
                                      canUpdateSubj
                                        ? "cursor-pointer rounded px-1.5 py-0.5 hover:bg-slate-100"
                                        : ""
                                    }`}
                                    title={
                                      canUpdateSubj
                                        ? "Click to edit credit hours"
                                        : ""
                                    }
                                    onClick={() =>
                                      canUpdateSubj && startCreditEdit(ss)
                                    }
                                  >
                                    {ss.creditHours ||
                                      subj?.creditHours ||
                                      "—"}
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                                  Active
                                </span>
                              </td>
                              {(canUpdateSubj || canDeleteSubj) && (
                                <td className="px-4 py-3 text-right">
                                  <div className="flex justify-end gap-2">
                                    {canDeleteSubj && (
                                      <button
                                        onClick={() =>
                                          handleRemoveSubject(ss._id)
                                        }
                                        className="rounded-lg border border-red-200 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                                      >
                                        Remove
                                      </button>
                                    )}
                                  </div>
                                </td>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          ADD SUBJECT PANEL (Slide-in from right / modal on mobile)
      ═══════════════════════════════════════════════════════════ */}
      {panelOpen && (
        <div className="fixed inset-0 z-40 flex items-start justify-end bg-slate-900/40 p-4 sm:p-6">
          <div className="flex h-full w-full max-w-md flex-col rounded-xl bg-white shadow-2xl">
            {/* Panel Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h3 className="font-semibold text-slate-900">Subject Add Karein</h3>
                <p className="text-xs text-slate-400">
                  Semester {selectedSemester?.semesterNo}
                </p>
              </div>
              <button
                onClick={closePanelAndReset}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {/* Search */}
              <div className="relative">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Subject dhunein (naam ya code)..."
                  value={panelSearch}
                  onChange={(e) => setPanelSearch(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
                />
              </div>

              {/* Dept filter toggle */}
              <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showAllDepts}
                  onChange={(e) => setShowAllDepts(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-slate-300 text-teal-600"
                />
                Saare departments ke subjects dikhayein
              </label>

              {/* Subject list */}
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {filteredPanelSubjects.length === 0 ? (
                  <p className="py-6 text-center text-sm text-slate-400">
                    Koi subject nahi mila
                  </p>
                ) : (
                  filteredPanelSubjects.map((s) => {
                    const alreadyInSem = currentSubjects.some(
                      (ss) => getId(ss.subjectId) === s._id
                    );
                    const usedInSemNo = usedSubjectMap[s._id];
                    const usedElsewhere =
                      usedInSemNo !== undefined &&
                      usedInSemNo !== selectedSemester?.semesterNo;
                    const disabled = alreadyInSem || usedElsewhere;

                    return (
                      <button
                        key={s._id}
                        disabled={disabled}
                        onClick={() => !disabled && handleSelectSubject(s)}
                        className={`w-full flex items-start justify-between rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${
                          panelSubjectId === s._id
                            ? "border-teal-500 bg-teal-50 text-teal-800"
                            : disabled
                            ? "cursor-not-allowed border-slate-100 bg-slate-50 opacity-50"
                            : "border-slate-200 text-slate-700 hover:border-teal-300 hover:bg-teal-50"
                        }`}
                      >
                        <div>
                          <div className="font-medium">{s.name}</div>
                          <div className="mt-0.5 text-xs text-slate-400">
                            {s.code} · {s.creditHours} CH
                          </div>
                        </div>
                        {alreadyInSem && (
                          <span className="ml-2 shrink-0 rounded-full bg-slate-200 px-2 py-0.5 text-xs text-slate-500">
                            Is sem mein hai
                          </span>
                        )}
                        {usedElsewhere && !alreadyInSem && (
                          <span className="ml-2 shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-600">
                            Sem {usedInSemNo} mein hai
                          </span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>

              {/* Selected subject config */}
              {panelSubjectId && (
                <div className="space-y-3 rounded-lg border border-teal-200 bg-teal-50 p-4">
                  <p className="text-xs font-semibold text-teal-700">
                    Selected:{" "}
                    {
                      allSubjects.find((s) => s._id === panelSubjectId)
                        ?.name
                    }
                  </p>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700">
                      Credit Hours <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={panelCreditHours}
                      onChange={(e) => setPanelCreditHours(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700">
                      Subject Type <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      {SUBJECT_TYPE_OPTIONS.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setPanelType(opt)}
                          className={`flex-1 rounded-lg border py-2 text-xs font-medium transition-colors ${
                            panelType === opt
                              ? opt === "COMPULSORY"
                                ? "border-teal-500 bg-teal-600 text-white"
                                : "border-purple-500 bg-purple-600 text-white"
                              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          {opt === "COMPULSORY" ? "Compulsory" : "Elective"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Panel Footer */}
            <div className="border-t border-slate-100 px-5 py-4 flex justify-end gap-3">
              <button
                onClick={closePanelAndReset}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSubject}
                disabled={!panelSubjectId || !panelCreditHours || panelSaving}
                className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {panelSaving ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <Plus size={15} />
                )}
                Add Subject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
