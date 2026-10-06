import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpen,
  Plus,
  Minus,
  X,
  Search,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Trash2,
  Pencil,
  Check,
  GraduationCap,
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

const readUser = () => {
  try {
    const raw = sessionStorage.getItem("user") || localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const can = (action) => {
  const u = readUser();
  if (!u) return false;
  if (u.roleSlug === "super-admin" || u.role?.slug === "super-admin") return true;
  const perms = (u.role?.permissions || []).map((p) =>
    typeof p === "string" ? p : p?.key || ""
  );
  return perms.includes(action);
};

const chOf = (ss) => Number(ss.creditHours || ss.subjectId?.creditHours || 0);

const SUBJECT_TYPE_OPTIONS = ["COMPULSORY", "ELECTIVE"];

const TypeBadge = ({ type }) =>
  type === "ELECTIVE" ? (
    <span className="inline-flex items-center rounded-md bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-700 ring-1 ring-inset ring-violet-200">
      Elective
    </span>
  ) : (
    <span className="inline-flex items-center rounded-md bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-700 ring-1 ring-inset ring-teal-200">
      Compulsory
    </span>
  );

/* ─── Toast ───────────────────────────────────────────────────── */
const useToast = () => {
  const [msg, setMsg] = useState(null);
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

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */
export default function SemesterSubjectAssignment() {
  const [classes, setClasses] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);

  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSemesterId, setSelectedSemesterId] = useState("");

  const [semesters, setSemesters] = useState([]);
  const [subjectsMap, setSubjectsMap] = useState({});

  const [pageLoading, setPageLoading] = useState(true);
  const [semLoading, setSemLoading] = useState(false);
  const [genLoading, setGenLoading] = useState(false);
  const [semCountInput, setSemCountInput] = useState("");

  const [panelOpen, setPanelOpen] = useState(false);
  const [panelSearch, setPanelSearch] = useState("");
  const [showAllDepts, setShowAllDepts] = useState(false);
  const [panelSubjectId, setPanelSubjectId] = useState("");
  const [panelCreditHours, setPanelCreditHours] = useState("");
  const [panelType, setPanelType] = useState("COMPULSORY");
  const [panelSaving, setPanelSaving] = useState(false);

  const [editingCreditId, setEditingCreditId] = useState(null);
  const [editingCreditVal, setEditingCreditVal] = useState("");
  const [creditSaving, setCreditSaving] = useState(false);

  const { msg: toast, show: showToast, dismiss: dismissToast } = useToast();

  const canCreateSem = can("programsemester:create");
  const canCreateSubj = can("semestersubject:create");
  const canUpdateSubj = can("semestersubject:update");
  const canDeleteSubj = can("semestersubject:delete");

  /* ─── initial load ─── */
  useEffect(() => {
    (async () => {
      setPageLoading(true);
      try {
        const [classesRes, subjRes] = await Promise.all([
          getDegreeClasses(),
          getAllSubjects({ isActive: true }),
        ]);
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
    })();
    // eslint-disable-next-line
  }, []);

  /* ─── class → semesters ─── */
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

      if (list.length > 0) {
        const firstId = list[0]._id;
        setSelectedSemesterId(firstId);
        await loadSubjectsForSemester(firstId);
        // preload the rest so sidebar stats + prerequisite checks are accurate
        list.slice(1).forEach((s) => loadSubjectsForSemester(s._id));
      } else {
        setSelectedSemesterId("");
      }

      const cls = classes.find((c) => c._id === classId);
      if (cls) {
        const defaultCount =
          cls.endSemester || (cls.duration ? cls.duration * 2 : null) || 8;
        setSemCountInput(String(defaultCount));
      }
    } catch (err) {
      showToast(getErrMsg(err), "error");
    } finally {
      setSemLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedSemesterId) return;
    if (subjectsMap[selectedSemesterId] !== undefined) return;
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
    await loadSubjectsForSemester(selectedSemesterId);
  };

  /* ─── generate semesters ─── */
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

    for (let i = 1; i <= n; i++) {
      try {
        await createProgramSemester({
          degreeClassId: selectedClassId,
          semesterNo: i,
          name: `Semester ${i}`,
        });
        created++;
      } catch (err) {
        if (err?.response?.status === 409) skipped++;
        else showToast(`Semester ${i}: ${getErrMsg(err)}`, "error");
      }
    }

    setGenLoading(false);
    await loadSemesters(selectedClassId);
    showToast(
      `${created} semester${created !== 1 ? "s" : ""} created successfully${
        skipped > 0 ? `, ${skipped} already existed and were skipped` : ""
      }`,
      "success"
    );
  };

  const handleAddNextSemester = async () => {
    if (!selectedClassId) return;
    const nextNo =
      semesters.length > 0 ? Math.max(...semesters.map((s) => s.semesterNo)) + 1 : 1;
    setGenLoading(true);
    try {
      await createProgramSemester({
        degreeClassId: selectedClassId,
        semesterNo: nextNo,
        name: `Semester ${nextNo}`,
      });
      await loadSemesters(selectedClassId);
      showToast(`Semester ${nextNo} added successfully`, "success");
    } catch (err) {
      showToast(
        err?.response?.status === 409
          ? "This semester already exists"
          : getErrMsg(err),
        "error"
      );
    } finally {
      setGenLoading(false);
    }
  };

  /* ─── computed ─── */
  const selectedClass = classes.find((c) => c._id === selectedClassId) || null;
  const selectedSemester = semesters.find((s) => s._id === selectedSemesterId) || null;
  const currentSubjects = subjectsMap[selectedSemesterId] || [];
  const currentCH = currentSubjects.reduce((a, ss) => a + chOf(ss), 0);

  const usedSubjectMap = useMemo(() => {
    const map = {};
    semesters.forEach((sem) => {
      (subjectsMap[sem._id] || []).forEach((ss) => {
        const sid = getId(ss.subjectId);
        if (sid && !map[sid]) map[sid] = sem.semesterNo;
      });
    });
    return map;
  }, [semesters, subjectsMap]);

  const semesterStats = useMemo(
    () =>
      semesters.map((sem) => {
        const list = subjectsMap[sem._id] || [];
        return {
          semId: sem._id,
          count: list.length,
          totalCH: list.reduce((a, ss) => a + chOf(ss), 0),
        };
      }),
    [semesters, subjectsMap]
  );

  const classTotals = useMemo(
    () =>
      semesterStats.reduce(
        (a, s) => ({
          totalSubjects: a.totalSubjects + s.count,
          totalCH: a.totalCH + s.totalCH,
        }),
        { totalSubjects: 0, totalCH: 0 }
      ),
    [semesterStats]
  );

  const target = Number(selectedClass?.totalCreditHours || 0);
  const overLimit = target > 0 && classTotals.totalCH > target;
  const progress = target > 0 ? Math.min(100, (classTotals.totalCH / target) * 100) : 0;
  const maxSemCH = Math.max(1, ...semesterStats.map((s) => s.totalCH));

  const classDeptId = selectedClass ? getId(selectedClass.departmentId) : "";

  const filteredPanelSubjects = useMemo(() => {
    let list = allSubjects;
    if (!showAllDepts && classDeptId) {
      list = list.filter((s) => getId(s.departmentId) === classDeptId);
    }
    if (panelSearch.trim()) {
      const q = panelSearch.toLowerCase();
      list = list.filter(
        (s) => s.name?.toLowerCase().includes(q) || s.code?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [allSubjects, showAllDepts, classDeptId, panelSearch]);

  /* ─── panel actions ─── */
  const closePanelAndReset = () => {
    setPanelOpen(false);
    setPanelSearch("");
    setPanelSubjectId("");
    setPanelCreditHours("");
    setPanelType("COMPULSORY");
    setShowAllDepts(false);
  };

  useEffect(() => {
    if (!panelOpen) return;
    const onKey = (e) => e.key === "Escape" && closePanelAndReset();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [panelOpen]);

  const handleSelectSubject = (subject) => {
    setPanelSubjectId(subject._id);
    setPanelCreditHours(String(subject.creditHours || "3"));
  };

  const bumpCredit = (d) =>
    setPanelCreditHours((v) => String(Math.min(10, Math.max(1, (Number(v) || 0) + d))));

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
      showToast("Subject added successfully!", "success");
      closePanelAndReset();
      await refreshCurrentSemester();
    } catch (err) {
      showToast(
        err?.response?.status === 409
          ? "This subject is already assigned in this semester"
          : getErrMsg(err),
        "error"
      );
    } finally {
      setPanelSaving(false);
    }
  };

  const handleRemoveSubject = async (id) => {
    if (!window.confirm("Remove this subject from the semester?")) return;
    try {
      const res = await removeSemesterSubject(id);
      showToast(res?.message || "Subject removed successfully", "success");
      await refreshCurrentSemester();
    } catch (err) {
      showToast(getErrMsg(err), "error");
    }
  };

  const startCreditEdit = (ss) => {
    setEditingCreditId(ss._id);
    setEditingCreditVal(String(ss.creditHours || ss.subjectId?.creditHours || ""));
  };

  const saveCreditEdit = async (ss) => {
    if (!editingCreditVal || Number(editingCreditVal) <= 0) {
      setEditingCreditId(null);
      return;
    }
    setCreditSaving(true);
    try {
      await updateSemesterSubject(ss._id, { creditHours: Number(editingCreditVal) });
      showToast("Credit hours updated successfully", "success");
      await refreshCurrentSemester();
    } catch (err) {
      showToast(getErrMsg(err), "error");
    } finally {
      setCreditSaving(false);
      setEditingCreditId(null);
    }
  };

  const getPrereqWarning = (ss) => {
    const subjectObj = typeof ss.subjectId === "object" ? ss.subjectId : null;
    const prereqs = subjectObj?.prerequisites || [];
    if (!prereqs.length) return null;
    const currentSemNo = selectedSemester?.semesterNo || 0;
    const warnings = [];
    prereqs.forEach((p) => {
      const inSemNo = usedSubjectMap[getId(p.subjectId || p)];
      if (inSemNo === undefined) warnings.push("Prerequisite not found in any class");
      else if (inSemNo >= currentSemNo)
        warnings.push(`Prerequisite is in Semester ${inSemNo} (later or same period)`);
    });
    return warnings.length ? warnings : null;
  };

  /* ══════════════ RENDER ══════════════ */

  if (pageLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-slate-500">
        <FaSpinner className="animate-spin text-3xl text-teal-600" />
        <p className="text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 p-1 sm:p-2">
      <style>{`
        @keyframes ssa-slide { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes ssa-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes ssa-toast { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        @media (prefers-reduced-motion: reduce) { .ssa-anim { animation: none !important; } }
      `}</style>

      {/* ── Toast ── */}
      {toast && (
        <div
          role="status"
          className={`ssa-anim fixed right-5 top-5 z-[60] flex max-w-sm items-start gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-xl ${
            toast.type === "success" ? "bg-emerald-600" : "bg-red-600"
          }`}
          style={{ animation: "ssa-toast .2s ease-out" }}
        >
          {toast.type === "success" ? (
            <CheckCircle size={18} className="mt-0.5 shrink-0" />
          ) : (
            <XCircle size={18} className="mt-0.5 shrink-0" />
          )}
          <span className="flex-1">{toast.text}</span>
          <button
            onClick={dismissToast}
            aria-label="Close"
            className="opacity-75 transition hover:opacity-100"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* ── Header ── */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 text-white shadow-sm shadow-teal-200">
            <GraduationCap size={22} />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-900">
              Semester Subjects
            </h1>
            <p className="text-sm text-slate-500">
              Create semesters for the class and assign subjects
            </p>
          </div>
        </div>

        <select
          aria-label="Class"
          className="min-w-[14rem] rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 shadow-sm transition focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-100"
          value={selectedClassId}
          onChange={(e) => setSelectedClassId(e.target.value)}
        >
          <option value="">Select a class</option>
          {classes.map((cls) => (
            <option key={cls._id} value={cls._id}>
              {cls.name} ({cls.code})
            </option>
          ))}
        </select>
      </header>

      {/* ── Class summary ── */}
      {selectedClass && (
        <section
          className={`rounded-2xl border bg-white p-5 shadow-sm ${
            overLimit ? "border-red-200" : "border-slate-200"
          }`}
        >
          <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
            <div>
              <p className="text-sm text-slate-500">{selectedClass.name}</p>
              <p className="mt-1 flex items-baseline gap-2">
                <span
                  className={`text-4xl font-semibold tabular-nums tracking-tight ${
                    overLimit ? "text-red-600" : "text-slate-900"
                  }`}
                >
                  {classTotals.totalCH}
                </span>
                <span className="text-sm text-slate-500">
                  {target > 0 ? `/ ${target} credit hours assigned` : "credit hours assigned"}
                </span>
              </p>
            </div>

            <dl className="flex gap-8 text-sm">
              <div>
                <dt className="text-slate-500">Semesters</dt>
                <dd className="mt-0.5 text-lg font-semibold tabular-nums text-slate-800">
                  {semesters.length}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Subjects</dt>
                <dd className="mt-0.5 text-lg font-semibold tabular-nums text-slate-800">
                  {classTotals.totalSubjects}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Remaining</dt>
                <dd
                  className={`mt-0.5 text-lg font-semibold tabular-nums ${
                    overLimit ? "text-red-600" : "text-slate-800"
                  }`}
                >
                  {target > 0 ? target - classTotals.totalCH : "—"}
                </dd>
              </div>
            </dl>
          </div>

          {target > 0 && (
            <div className="mt-4">
              <div
                className="h-2 overflow-hidden rounded-full bg-slate-100"
                role="progressbar"
                aria-valuenow={Math.round(progress)}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    overLimit ? "bg-red-500" : "bg-teal-500"
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              {overLimit && (
                <p className="mt-2 flex items-center gap-1.5 text-sm text-red-700">
                  <AlertTriangle size={15} className="shrink-0" />
                  Assigned credit hours ({classTotals.totalCH}) exceed the target ({target}).
                </p>
              )}
            </div>
          )}
        </section>
      )}

      {/* ── Main ── */}
      {!selectedClassId ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white py-24 text-slate-500">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
            <BookOpen size={26} className="text-slate-400" />
          </div>
          <p className="text-sm font-medium text-slate-700">Select a class first</p>
          <p className="text-xs text-slate-400">The semesters and subjects for that class will appear here</p>
        </div>
      ) : semLoading ? (
        <div className="flex items-center justify-center gap-3 py-20 text-slate-500">
          <FaSpinner className="animate-spin text-2xl text-teal-600" />
          <span className="text-sm">Loading semesters...</span>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[17rem_minmax(0,1fr)]">
          {/* ─── Semester list ─── */}
          <aside className="lg:sticky lg:top-4 lg:self-start">
            {semesters.length === 0 ? (
              <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-sm font-semibold text-slate-800">Create semesters</h2>
                <p className="text-xs leading-relaxed text-slate-500">
                  No semesters exist for this class yet. Generate them by entering a count.
                </p>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={semCountInput}
                    onChange={(e) => setSemCountInput(e.target.value)}
                    placeholder="How many? (e.g. 8)"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-100"
                  />
                  <button
                    disabled={!canCreateSem || genLoading}
                    onClick={handleGenerateSemesters}
                    className="shrink-0 rounded-lg bg-teal-600 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {genLoading ? <FaSpinner className="animate-spin" /> : "Generate"}
                  </button>
                </div>
                {!canCreateSem && (
                  <p className="flex items-center gap-1.5 text-xs text-amber-700">
                    <AlertTriangle size={13} /> programsemester:create permission chahiye
                  </p>
                )}
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                  <h2 className="text-sm font-semibold text-slate-800">Semesters</h2>
                  <button
                    disabled={!canCreateSem || genLoading}
                    onClick={handleAddNextSemester}
                    title={!canCreateSem ? "programsemester:create permission is required" : "Add the next semester"}
                    className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-teal-700 transition hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {genLoading ? <FaSpinner className="animate-spin" /> : <Plus size={14} />}
                    Add next
                  </button>
                </div>

                <ul className="flex gap-1.5 overflow-x-auto p-2 lg:flex-col lg:overflow-visible">
                  {semesters.map((sem) => {
                    const st = semesterStats.find((s) => s.semId === sem._id) || { count: 0, totalCH: 0 };
                    const active = sem._id === selectedSemesterId;
                    return (
                      <li key={sem._id} className="shrink-0 lg:shrink">
                        <button
                          onClick={() => setSelectedSemesterId(sem._id)}
                          aria-current={active ? "true" : undefined}
                          className={`group relative w-40 overflow-hidden rounded-xl px-3.5 py-2.5 text-left transition lg:w-full ${
                            active
                              ? "bg-teal-600 text-white shadow-sm"
                              : "text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-baseline justify-between">
                            <span className="text-sm font-semibold">Semester {sem.semesterNo}</span>
                            <span
                              className={`text-xs tabular-nums ${
                                active ? "text-teal-100" : "text-slate-400"
                              }`}
                            >
                              {st.totalCH} CH
                            </span>
                          </div>
                          <div
                            className={`mt-1.5 h-1 overflow-hidden rounded-full ${
                              active ? "bg-teal-500" : "bg-slate-100"
                            }`}
                          >
                            <div
                              className={`h-full rounded-full ${active ? "bg-white" : "bg-teal-400"}`}
                              style={{ width: `${(st.totalCH / maxSemCH) * 100}%` }}
                            />
                          </div>
                          <div
                            className={`mt-1.5 text-xs ${active ? "text-teal-100" : "text-slate-400"}`}
                          >
                            {st.count} subject{st.count !== 1 ? "s" : ""}
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </aside>

          {/* ─── Subjects ─── */}
          <main className="min-w-0">
            {!selectedSemesterId ? (
              <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-slate-400">
                <BookOpen size={28} className="opacity-40" />
                <p className="text-sm">Select a semester</p>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                      Semester {selectedSemester?.semesterNo}
                    </h2>
                    <p className="mt-0.5 text-sm text-slate-500">
                      {currentSubjects.length} subject{currentSubjects.length !== 1 ? "s" : ""},{" "}
                      {currentCH} credit hours
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={refreshCurrentSemester}
                      aria-label="Refresh"
                      title="Refresh"
                      className="rounded-lg border border-slate-200 p-2.5 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
                    >
                      <RefreshCw size={16} />
                    </button>
                    {canCreateSubj && (
                      <button
                        onClick={() => setPanelOpen(true)}
                        className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-3.5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-teal-700"
                      >
                        <Plus size={16} /> Add subject
                      </button>
                    )}
                  </div>
                </div>

                {currentSubjects.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-20 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                      <BookOpen size={24} className="text-slate-400" />
                    </div>
                    <p className="text-sm font-medium text-slate-700">
                      No subjects assigned in this semester
                    </p>
                    {canCreateSubj && (
                      <button
                        onClick={() => setPanelOpen(true)}
                        className="mt-2 flex items-center gap-1.5 rounded-lg bg-teal-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-teal-700"
                      >
                        <Plus size={15} /> Add first subject
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-slate-100 text-xs font-medium text-slate-500">
                          <th className="px-5 py-3 font-medium">Subject</th>
                          <th className="px-4 py-3 font-medium">Type</th>
                          <th className="px-4 py-3 font-medium">Credit hours</th>
                          {canDeleteSubj && <th className="px-5 py-3 text-right font-medium">Actions</th>}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {currentSubjects.map((ss) => {
                          const subj = typeof ss.subjectId === "object" ? ss.subjectId : null;
                          const warnings = getPrereqWarning(ss);
                          const editing = editingCreditId === ss._id;

                          return (
                            <tr key={ss._id} className="transition-colors hover:bg-slate-50/70">
                              <td className="px-5 py-3.5">
                                <div className="flex items-center gap-3">
                                  <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs text-slate-600">
                                    {subj?.code || "—"}
                                  </span>
                                  <span className="font-medium text-slate-900">{subj?.name || "—"}</span>
                                </div>
                                {warnings && (
                                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                                    {warnings.map((w, i) => (
                                      <span
                                        key={i}
                                        className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-xs text-amber-800 ring-1 ring-inset ring-amber-200"
                                      >
                                        <AlertTriangle size={11} />
                                        {w}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </td>

                              <td className="px-4 py-3.5">
                                <TypeBadge type={ss.subjectType} />
                              </td>

                              <td className="px-4 py-3.5">
                                {editing ? (
                                  <div className="flex items-center gap-1">
                                    <input
                                      type="number"
                                      min="1"
                                      value={editingCreditVal}
                                      onChange={(e) => setEditingCreditVal(e.target.value)}
                                      autoFocus
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") saveCreditEdit(ss);
                                        if (e.key === "Escape") setEditingCreditId(null);
                                      }}
                                      className="w-16 rounded-lg border border-teal-400 px-2 py-1 text-sm tabular-nums focus:outline-none focus:ring-4 focus:ring-teal-100"
                                    />
                                    <button
                                      onClick={() => saveCreditEdit(ss)}
                                      disabled={creditSaving}
                                      aria-label="Save"
                                      className="rounded-lg bg-teal-600 p-1.5 text-white hover:bg-teal-700 disabled:opacity-50"
                                    >
                                      {creditSaving ? <FaSpinner className="animate-spin" size={13} /> : <Check size={14} />}
                                    </button>
                                    <button
                                      onClick={() => setEditingCreditId(null)}
                                      aria-label="Cancel"
                                      className="rounded-lg bg-slate-100 p-1.5 text-slate-600 hover:bg-slate-200"
                                    >
                                      <X size={14} />
                                    </button>
                                  </div>
                                ) : canUpdateSubj ? (
                                  <button
                                    onClick={() => startCreditEdit(ss)}
                                    title="Edit credit hours"
                                    className="group inline-flex items-center gap-1.5 rounded-lg px-2 py-1 font-medium tabular-nums text-slate-800 transition hover:bg-slate-100"
                                  >
                                    {ss.creditHours || subj?.creditHours || "—"}
                                    <Pencil size={12} className="text-slate-300 transition group-hover:text-slate-500" />
                                  </button>
                                ) : (
                                  <span className="px-2 font-medium tabular-nums text-slate-800">
                                    {ss.creditHours || subj?.creditHours || "—"}
                                  </span>
                                )}
                              </td>

                              {canDeleteSubj && (
                                <td className="px-5 py-3.5 text-right">
                                  <button
                                    onClick={() => handleRemoveSubject(ss._id)}
                                    aria-label="Remove subject"
                                    title="Remove"
                                    className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                                  >
                                    <Trash2 size={16} />
                                  </button>
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
          </main>
        </div>
      )}

      {/* ═════════ ADD SUBJECT DRAWER ═════════ */}
      {panelOpen && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <div
            className="ssa-anim absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
            style={{ animation: "ssa-fade .2s ease-out" }}
            onClick={closePanelAndReset}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Add subject"
            className="ssa-anim relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
            style={{ animation: "ssa-slide .25s ease-out" }}
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h3 className="font-semibold text-slate-900">Add subject</h3>
                <p className="text-sm text-slate-500">Semester {selectedSemester?.semesterNo}</p>
              </div>
              <button
                onClick={closePanelAndReset}
                aria-label="Close"
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Search subject (name or code)"
                  value={panelSearch}
                  onChange={(e) => setPanelSearch(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 py-2.5 pl-9 pr-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-100"
                />
              </div>

              <label className="flex cursor-pointer select-none items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={showAllDepts}
                  onChange={(e) => setShowAllDepts(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-200"
                />
                Show subjects from all departments
              </label>

              <div className="max-h-72 space-y-1.5 overflow-y-auto pr-1">
                {filteredPanelSubjects.length === 0 ? (
                  <p className="py-8 text-center text-sm text-slate-400">No subjects found</p>
                ) : (
                  filteredPanelSubjects.map((s) => {
                    const alreadyInSem = currentSubjects.some((ss) => getId(ss.subjectId) === s._id);
                    const usedInSemNo = usedSubjectMap[s._id];
                    const usedElsewhere =
                      usedInSemNo !== undefined && usedInSemNo !== selectedSemester?.semesterNo;
                    const disabled = alreadyInSem || usedElsewhere;
                    const selected = panelSubjectId === s._id;

                    return (
                      <button
                        key={s._id}
                        disabled={disabled}
                        onClick={() => !disabled && handleSelectSubject(s)}
                        className={`flex w-full items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 text-left text-sm transition ${
                          selected
                            ? "border-teal-500 bg-teal-50 ring-2 ring-teal-100"
                            : disabled
                            ? "cursor-not-allowed border-slate-100 bg-slate-50 opacity-60"
                            : "border-slate-200 hover:border-teal-300 hover:bg-teal-50/50"
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="truncate font-medium text-slate-900">{s.name}</div>
                          <div className="mt-0.5 text-xs text-slate-500">
                            {s.code}, {s.creditHours} CH
                          </div>
                        </div>
                        {alreadyInSem && (
                          <span className="shrink-0 rounded-md bg-slate-200 px-2 py-0.5 text-xs text-slate-600">
                            Already in this semester
                          </span>
                        )}
                        {usedElsewhere && !alreadyInSem && (
                          <span className="shrink-0 rounded-md bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
                            In Semester {usedInSemNo}
                          </span>
                        )}
                        {selected && <Check size={16} className="shrink-0 text-teal-600" />}
                      </button>
                    );
                  })
                )}
              </div>

              {panelSubjectId && (
                <div className="space-y-4 rounded-xl bg-slate-50 p-4 ring-1 ring-inset ring-slate-200">
                  <p className="text-sm font-semibold text-slate-800">
                    {allSubjects.find((s) => s._id === panelSubjectId)?.name}
                  </p>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-600">Credit hours</label>
                    <div className="inline-flex items-center overflow-hidden rounded-lg border border-slate-300 bg-white">
                      <button
                        type="button"
                        onClick={() => bumpCredit(-1)}
                        aria-label="Decrease"
                        className="p-2.5 text-slate-500 transition hover:bg-slate-100"
                      >
                        <Minus size={15} />
                      </button>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={panelCreditHours}
                        onChange={(e) => setPanelCreditHours(e.target.value)}
                        className="w-14 border-x border-slate-200 py-2 text-center text-sm font-semibold tabular-nums focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => bumpCredit(1)}
                        aria-label="Increase"
                        className="p-2.5 text-slate-500 transition hover:bg-slate-100"
                      >
                        <Plus size={15} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-600">Subject type</label>
                    <div className="grid grid-cols-2 gap-1 rounded-lg bg-slate-200/70 p-1">
                      {SUBJECT_TYPE_OPTIONS.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setPanelType(opt)}
                          className={`rounded-md py-1.5 text-sm font-medium transition ${
                            panelType === opt
                              ? opt === "COMPULSORY"
                                ? "bg-white text-teal-700 shadow-sm"
                                : "bg-white text-violet-700 shadow-sm"
                              : "text-slate-600 hover:text-slate-900"
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

            <div className="flex justify-end gap-3 border-t border-slate-100 px-5 py-4">
              <button
                onClick={closePanelAndReset}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSubject}
                disabled={!panelSubjectId || !panelCreditHours || panelSaving}
                className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {panelSaving ? <FaSpinner className="animate-spin" /> : <Plus size={15} />}
                Add subject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}