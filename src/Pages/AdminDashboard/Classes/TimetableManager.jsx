import React, { useEffect, useMemo, useState } from "react";
import { getBatches, getBatchById } from "../../../services/batchAPI";
import {
  getTeachers,
  getTimetableForBatch,
  assignTeacher,
  createTimetableEntry,
  deleteTimetableEntry,
  generateTimetable,
  getTimetableAvailability,
} from "../../../services/academicApi";

const DAYS_FALLBACK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/* ---------- helpers ---------- */

const getId = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") return value._id || value.id || "";
  return value;
};

const formatBatchName = (batch) => {
  if (!batch) return "Select batch";
  if (batch.name) return batch.name;
  const degreeClassCode = batch.degreeClassId?.code || batch.degreeClassId || "Batch";
  const year = batch.startSessionId?.year || "";
  return year ? `${degreeClassCode}-${year}` : degreeClassCode;
};

const slotLabel = (slot) => {
  if (slot.label) return slot.label;
  if (slot.startTime && slot.endTime) {
    return `Period ${slot.periodNo} (${slot.startTime}–${slot.endTime})`;
  }
  return `Period ${slot.periodNo}`;
};

const errText = (error, fallback) => error?.response?.data?.message || error?.message || fallback;

/* ---------- styles ---------- */

const card = { background: "#fff", borderRadius: "14px", padding: "18px", boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)" };
const labelStyle = { display: "block", marginBottom: "6px", fontSize: "12px", color: "#6b7280" };
const inputStyle = { width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #d1d5db" };
const bannerColors = {
  error: { bg: "#fef2f2", border: "#fecaca", text: "#991b1b" },
  success: { bg: "#ecfdf5", border: "#a7f3d0", text: "#065f46" },
  warning: { bg: "#fffbeb", border: "#fde68a", text: "#92400e" },
};

export default function TimetableManager() {
  const [batches, setBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [summary, setSummary] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [assignmentForm, setAssignmentForm] = useState({ semesterSubjectId: "", teacherId: "" });
  const [entryForm, setEntryForm] = useState({
    semesterSubjectId: "",
    lectureType: "theory",
    roomId: "",
    day: "Monday",
    periodNo: "",
  });

  // rooms that are free for the chosen day + period (null = not loaded, use all rooms)
  const [freeRooms, setFreeRooms] = useState(null);

  // auto generation
  const [allowPartial, setAllowPartial] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [genResult, setGenResult] = useState(null);

  /* ---------- loaders ---------- */

  const loadBatches = async () => {
    try {
      const response = await getBatches();
      const list = Array.isArray(response) ? response : response?.data || [];
      setBatches(list);
      if (list.length && !selectedBatchId) setSelectedBatchId(getId(list[0]));
    } catch (error) {
      setMessage({ type: "error", text: errText(error, "Unable to load batches.") });
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        await loadBatches();
      } finally {
        setLoading(false);
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadBatchDetail = async (batchId, { keepMessage = false } = {}) => {
    if (!batchId) {
      setSelectedBatch(null);
      setSummary(null);
      return;
    }

    setSummaryLoading(true);
    if (!keepMessage) setMessage({ type: "", text: "" });

    try {
      const batchData = await getBatchById(batchId);
      const batch = batchData?.data || batchData;
      setSelectedBatch(batch);

      const summaryData = await getTimetableForBatch(batchId);
      setSummary(summaryData);

      const deptId =
        batch?.departmentId?._id || batch?.departmentId || batch?.degreeClassId?.departmentId;

      if (deptId) {
        const teachersData = await getTeachers({ departmentId: deptId, isActive: true });
        setTeachers(Array.isArray(teachersData) ? teachersData : []);
      }

      const subjects = summaryData?.subjectSummaries || [];
      if (subjects.length) {
        const pick = (prevId) =>
          subjects.find((s) => String(s._id) === String(prevId)) || subjects[0];

        // Assign form: keep chosen subject, show its current (default) teacher
        setAssignmentForm((prev) => {
          const subject = pick(prev.semesterSubjectId);
          return { semesterSubjectId: subject._id, teacherId: subject.teacherId || "" };
        });

        // Entry form: keep chosen subject, room is chosen again per slot
        setEntryForm((prev) => {
          const subject = pick(prev.semesterSubjectId);
          return {
            ...prev,
            semesterSubjectId: subject._id,
            roomId: "",
            periodNo: prev.periodNo || summaryData?.timeSlots?.[0]?.periodNo || "",
          };
        });
      }
    } catch (error) {
      setMessage({ type: "error", text: errText(error, "Unable to load timetable data.") });
    } finally {
      setSummaryLoading(false);
    }
  };

  useEffect(() => {
    if (selectedBatchId) {
      setGenResult(null);
      loadBatchDetail(selectedBatchId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBatchId]);

  /* ---------- derived data ---------- */

  const DAYS = summary?.days?.length ? summary.days : DAYS_FALLBACK;
  const subjectSummaries = summary?.subjectSummaries || [];
  const roomOptions = summary?.rooms || [];

  const periodSlots = useMemo(
    () => (summary?.timeSlots || []).map((s) => ({ periodNo: s.periodNo, label: slotLabel(s) })),
    [summary]
  );

  const selectedBatchName = useMemo(
    () => (selectedBatch ? formatBatchName(selectedBatch) : ""),
    [selectedBatch]
  );

  const selectedSubject = subjectSummaries.find(
    (s) => String(s._id) === String(entryForm.semesterSubjectId)
  );
  const hasTeacher = Boolean(selectedSubject?.teacherId);

  // Only lecture types that still have quota left
  const typeOptions = useMemo(() => {
    const opts = [];
    if (selectedSubject?.theoryRemaining > 0) opts.push({ value: "theory", label: `Theory (${selectedSubject.theoryRemaining} left)` });
    if (selectedSubject?.practicalRemaining > 0) opts.push({ value: "practical", label: `Practical (${selectedSubject.practicalRemaining} left)` });
    return opts;
  }, [selectedSubject]);

  useEffect(() => {
    if (typeOptions.length && !typeOptions.some((o) => o.value === entryForm.lectureType)) {
      setEntryForm((prev) => ({ ...prev, lectureType: typeOptions[0].value, roomId: "" }));
    }
  }, [typeOptions, entryForm.lectureType]);

  // Free rooms for the selected day + period (practical => labs only)
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!selectedBatchId || !entryForm.day || !entryForm.periodNo || !summary) {
        setFreeRooms(null);
        return;
      }
      try {
        const body = await getTimetableAvailability({
          batchId: selectedBatchId,
          day: entryForm.day,
          periodNo: entryForm.periodNo,
          type: entryForm.lectureType,
        });
        if (!cancelled) setFreeRooms(body?.data?.rooms || body?.rooms || []);
      } catch {
        if (!cancelled) setFreeRooms(null); // fall back to all rooms, backend still validates
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [selectedBatchId, entryForm.day, entryForm.periodNo, entryForm.lectureType, summary]);

  const availableRooms = useMemo(() => {
    const base = freeRooms ?? roomOptions;
    return entryForm.lectureType === "practical" ? base.filter((r) => r.type === "lab") : base;
  }, [freeRooms, roomOptions, entryForm.lectureType]);

  useEffect(() => {
    if (entryForm.roomId && !availableRooms.some((r) => String(r._id) === String(entryForm.roomId))) {
      setEntryForm((prev) => ({ ...prev, roomId: "" }));
    }
  }, [availableRooms, entryForm.roomId]);

  const timetableByKey = useMemo(() => {
    const map = {};
    (summary?.timetableEntries || []).forEach((entry) => {
      map[`${entry.day}-${entry.periodNo}`] = entry;
    });
    return map;
  }, [summary]);

  /* ---------- handlers ---------- */

  const handleAssignSubjectChange = (subjectId) => {
    const subject = subjectSummaries.find((s) => String(s._id) === String(subjectId));
    setAssignmentForm({ semesterSubjectId: subjectId, teacherId: subject?.teacherId || "" });
  };

  const handleAssignmentSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBatchId || !assignmentForm.semesterSubjectId || !assignmentForm.teacherId) {
      setMessage({ type: "error", text: "Please select a subject and a teacher." });
      return;
    }

    try {
      await assignTeacher({
        batchId: selectedBatchId,
        semesterNo: summary?.currentSemester,
        semesterSubjectId: assignmentForm.semesterSubjectId,
        teacherId: assignmentForm.teacherId,
      });
      setMessage({ type: "success", text: "Teacher assigned successfully." });
      await loadBatchDetail(selectedBatchId, { keepMessage: true });
    } catch (error) {
      setMessage({ type: "error", text: errText(error, "Teacher assignment failed.") });
    }
  };

  const handleEntrySubmit = async (e) => {
    e.preventDefault();
    if (!hasTeacher) {
      setMessage({ type: "error", text: "Pehle is subject ko teacher assign karein." });
      return;
    }
    if (!selectedBatchId || !entryForm.semesterSubjectId || !entryForm.roomId || !entryForm.periodNo) {
      setMessage({ type: "error", text: "Please complete the timetable entry form." });
      return;
    }

    try {
      // teacher is not sent: backend takes it from the subject's assignment
      const res = await createTimetableEntry({
        batchId: selectedBatchId,
        sessionId: selectedBatch?.startSessionId?._id || selectedBatch?.startSessionId,
        semesterNo: summary?.currentSemester,
        semesterSubjectId: entryForm.semesterSubjectId,
        lectureType: entryForm.lectureType,
        roomId: entryForm.roomId,
        day: entryForm.day,
        periodNo: Number(entryForm.periodNo),
      });

      const warnings = res?.warnings || [];
      setMessage(
        warnings.length
          ? { type: "warning", text: `Lecture slot created. ${warnings.join(" ")}` }
          : { type: "success", text: "Lecture slot created successfully." }
      );
      await loadBatchDetail(selectedBatchId, { keepMessage: true });
    } catch (error) {
      setMessage({ type: "error", text: errText(error, "Unable to create timetable entry.") });
    }
  };

  const handleDeleteEntry = async (entryId) => {
    if (!window.confirm("Delete this lecture slot?")) return;
    try {
      await deleteTimetableEntry(entryId);
      setMessage({ type: "success", text: "Lecture slot deleted successfully." });
      await loadBatchDetail(selectedBatchId, { keepMessage: true });
    } catch (error) {
      setMessage({ type: "error", text: errText(error, "Unable to delete timetable entry.") });
    }
  };

  const handleGenerate = async (dryRun) => {
    if (!selectedBatchId) return;
    if (!dryRun && !window.confirm("Generate the remaining lectures for this batch?")) return;

    setGenerating(true);
    setGenResult(null);
    try {
      // service must return the response body: { success, message, data }
      const res = await generateTimetable(selectedBatchId, { dryRun, allowPartial });
      setGenResult(res?.data || null);
      setMessage({
        type: res?.success ? "success" : "warning",
        text: res?.message || (res?.success ? "Done." : "Timetable is incomplete."),
      });
      if (!dryRun && res?.data?.saved) await loadBatchDetail(selectedBatchId, { keepMessage: true });
    } catch (error) {
      const data = error?.response?.data?.data;
      if (data) setGenResult(data);
      setMessage({ type: "error", text: errText(error, "Timetable could not be generated.") });
    } finally {
      setGenerating(false);
    }
  };

  /* ---------- render ---------- */

  const banner = bannerColors[message.type] || bannerColors.success;

  return (
    <div style={{ padding: "24px", background: "#f4f7fb", minHeight: "100vh" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <div>
          <h2 style={{ margin: 0, color: "#1f2937" }}>Timetable Management</h2>
          <p style={{ margin: "6px 0 0", color: "#6b7280" }}>
            Batch-specific timetable with live semester subject and teacher validation.
          </p>
        </div>
      </div>

      {message.text && (
        <div
          style={{
            marginBottom: "18px",
            padding: "12px 16px",
            borderRadius: "10px",
            background: banner.bg,
            border: `1px solid ${banner.border}`,
            color: banner.text,
          }}
        >
          {message.text}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        <div style={card}>
          <label style={labelStyle}>Select Batch</label>
          <select value={selectedBatchId} onChange={(e) => setSelectedBatchId(e.target.value)} style={inputStyle} disabled={loading}>
            <option value="">Choose a batch</option>
            {batches.map((batch) => (
              <option key={getId(batch)} value={getId(batch)}>
                {formatBatchName(batch)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {summaryLoading && <div>Loading timetable...</div>}

      {summary && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
            <div style={card}>
              <div style={{ color: "#6b7280", fontSize: "12px" }}>Selected Batch</div>
              <strong style={{ display: "block", marginTop: "6px", fontSize: "18px" }}>{selectedBatchName}</strong>
            </div>
            <div style={card}>
              <div style={{ color: "#6b7280", fontSize: "12px" }}>Current Semester</div>
              <strong style={{ display: "block", marginTop: "6px", fontSize: "18px" }}>{summary.currentSemester}</strong>
            </div>
            <div style={card}>
              <div style={{ color: "#6b7280", fontSize: "12px" }}>Total Subjects</div>
              <strong style={{ display: "block", marginTop: "6px", fontSize: "18px" }}>{summary.totalSubjects}</strong>
            </div>
            <div style={card}>
              <div style={{ color: "#6b7280", fontSize: "12px" }}>Lectures Scheduled</div>
              <strong style={{ display: "block", marginTop: "6px", fontSize: "18px" }}>
                {summary.scheduledLectures} / {summary.totalRequiredLectures}
              </strong>
            </div>
            <div style={card}>
              <div style={{ color: "#6b7280", fontSize: "12px" }}>Lectures Remaining</div>
              <strong style={{ display: "block", marginTop: "6px", fontSize: "18px" }}>{summary.remainingLectures}</strong>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px", marginBottom: "24px" }}>
            {/* ---------- Assign Teacher ---------- */}
            <div style={card}>
              <h3 style={{ marginTop: 0, marginBottom: "16px" }}>Assign Teacher</h3>
              <form onSubmit={handleAssignmentSubmit}>
                <div style={{ display: "grid", gap: "12px" }}>
                  <div>
                    <label style={labelStyle}>Semester Subject</label>
                    <select
                      value={assignmentForm.semesterSubjectId}
                      onChange={(e) => handleAssignSubjectChange(e.target.value)}
                      style={inputStyle}
                    >
                      <option value="">Select subject</option>
                      {subjectSummaries.map((subject) => (
                        <option key={subject._id} value={subject._id}>
                          {subject.subjectCode} - {subject.subjectName} ({subject.requiredLectures} lectures
                          {subject.teacherName ? ` | ${subject.teacherName}` : " | no teacher"})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={labelStyle}>Teacher</label>
                    <select
                      value={assignmentForm.teacherId}
                      onChange={(e) => setAssignmentForm((prev) => ({ ...prev, teacherId: e.target.value }))}
                      style={inputStyle}
                    >
                      <option value="">Select teacher</option>
                      {teachers.map((teacher) => (
                        <option key={getId(teacher)} value={getId(teacher)}>
                          {teacher.userId?.name || teacher.name || "Teacher"}
                        </option>
                      ))}
                    </select>
                    <small style={{ color: "#6b7280" }}>
                      One subject has one teacher in this class. Saving again replaces the teacher.
                    </small>
                  </div>

                  <button type="submit" style={{ padding: "10px 14px", border: "none", borderRadius: "10px", background: "#2563eb", color: "white", fontWeight: "600" }}>
                    Save Teacher Assignment
                  </button>
                </div>
              </form>
            </div>

            {/* ---------- Create Timetable Entry ---------- */}
            <div style={card}>
              <h3 style={{ marginTop: 0, marginBottom: "16px" }}>Create Timetable Entry</h3>
              <form onSubmit={handleEntrySubmit}>
                <div style={{ display: "grid", gap: "12px" }}>
                  <div>
                    <label style={labelStyle}>Subject</label>
                    <select
                      value={entryForm.semesterSubjectId}
                      onChange={(e) => setEntryForm((prev) => ({ ...prev, semesterSubjectId: e.target.value, roomId: "" }))}
                      style={inputStyle}
                    >
                      <option value="">Select subject</option>
                      {subjectSummaries.map((subject) => (
                        <option key={subject._id} value={subject._id} disabled={subject.isComplete}>
                          {subject.subjectCode} - {subject.subjectName}
                          {subject.isComplete ? " (complete)" : ` (${subject.remainingLectures} left)`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={labelStyle}>Assigned Teacher</label>
                    <input
                      readOnly
                      value={selectedSubject?.teacherName || "Teacher not assigned"}
                      style={{ ...inputStyle, background: "#f9fafb", color: hasTeacher ? "#111827" : "#b91c1c" }}
                    />
                    {!hasTeacher && entryForm.semesterSubjectId && (
                      <small style={{ color: "#b91c1c" }}>Pehle is subject ko teacher assign karein.</small>
                    )}
                  </div>

                  <div>
                    <label style={labelStyle}>Lecture Type</label>
                    <select
                      value={entryForm.lectureType}
                      onChange={(e) => setEntryForm((prev) => ({ ...prev, lectureType: e.target.value, roomId: "" }))}
                      style={inputStyle}
                      disabled={!typeOptions.length}
                    >
                      {typeOptions.length === 0 && <option value="">No lectures left</option>}
                      {typeOptions.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div>
                      <label style={labelStyle}>Day</label>
                      <select
                        value={entryForm.day}
                        onChange={(e) => setEntryForm((prev) => ({ ...prev, day: e.target.value, roomId: "" }))}
                        style={inputStyle}
                      >
                        {DAYS.map((day) => (
                          <option key={day} value={day}>{day}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Period</label>
                      <select
                        value={entryForm.periodNo}
                        onChange={(e) => setEntryForm((prev) => ({ ...prev, periodNo: Number(e.target.value), roomId: "" }))}
                        style={inputStyle}
                        disabled={!periodSlots.length}
                      >
                        {periodSlots.length === 0 && <option value="">No time slots configured</option>}
                        {periodSlots.map((slot) => (
                          <option key={slot.periodNo} value={slot.periodNo}>{slot.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>
                      Room {entryForm.lectureType === "practical" ? "(lab only)" : ""}
                    </label>
                    <select
                      value={entryForm.roomId}
                      onChange={(e) => setEntryForm((prev) => ({ ...prev, roomId: e.target.value }))}
                      style={inputStyle}
                    >
                      <option value="">{availableRooms.length ? "Select room" : "No free room for this slot"}</option>
                      {availableRooms.map((room) => (
                        <option key={room._id} value={room._id}>
                          {room.name} ({room.code}){room.type === "lab" ? " - Lab" : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={!hasTeacher || !typeOptions.length}
                    style={{
                      padding: "10px 14px",
                      border: "none",
                      borderRadius: "10px",
                      background: "#0f766e",
                      color: "white",
                      fontWeight: "600",
                      opacity: !hasTeacher || !typeOptions.length ? 0.5 : 1,
                    }}
                  >
                    Create Lecture Slot
                  </button>
                </div>
              </form>
            </div>

            {/* ---------- Auto generate ---------- */}
            <div style={card}>
              <h3 style={{ marginTop: 0, marginBottom: "8px" }}>Auto Generate</h3>
              <p style={{ margin: "0 0 12px", color: "#6b7280", fontSize: "13px" }}>
                Fills the remaining lectures without any teacher, room or class clash. Existing lectures are kept.
              </p>
              <label style={{ display: "flex", gap: "8px", alignItems: "center", fontSize: "13px", marginBottom: "12px" }}>
                <input type="checkbox" checked={allowPartial} onChange={(e) => setAllowPartial(e.target.checked)} />
                Save what fits even if some lectures cannot be placed
              </label>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => handleGenerate(true)}
                  disabled={generating}
                  style={{ flex: 1, padding: "10px 14px", borderRadius: "10px", border: "1px solid #2563eb", background: "#fff", color: "#2563eb", fontWeight: "600" }}
                >
                  {generating ? "Working..." : "Preview"}
                </button>
                <button
                  type="button"
                  onClick={() => handleGenerate(false)}
                  disabled={generating}
                  style={{ flex: 1, padding: "10px 14px", borderRadius: "10px", border: "none", background: "#2563eb", color: "#fff", fontWeight: "600" }}
                >
                  Generate
                </button>
              </div>

              {genResult && (
                <div style={{ marginTop: "16px", fontSize: "13px", color: "#374151" }}>
                  <div>
                    Required: <strong>{genResult.totalRequiredLectures}</strong> | Scheduled:{" "}
                    <strong>{genResult.scheduledLectures}</strong> | Remaining:{" "}
                    <strong>{genResult.remainingLectures}</strong>
                  </div>
                  {genResult.dryRun && <div style={{ color: "#6b7280", marginTop: "4px" }}>Preview only, nothing saved.</div>}

                  {genResult.unscheduledLectures?.length > 0 && (
                    <div style={{ marginTop: "10px" }}>
                      <strong>Could not schedule:</strong>
                      <ul style={{ margin: "6px 0 0", paddingLeft: "18px" }}>
                        {genResult.unscheduledLectures.map((u, i) => (
                          <li key={i}>
                            {u.subjectName} ({u.lectureType}): {u.reason}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {genResult.warnings?.length > 0 && (
                    <ul style={{ margin: "10px 0 0", paddingLeft: "18px", color: "#92400e" }}>
                      {genResult.warnings.map((w, i) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ---------- Weekly timetable ---------- */}
          <div style={card}>
            <h3 style={{ marginTop: 0 }}>Weekly Timetable</h3>
            {periodSlots.length === 0 ? (
              <div style={{ color: "#6b7280" }}>No time slots configured yet. Add periods first.</div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "12px" }}>
                  <thead>
                    <tr>
                      <th style={{ padding: "10px", border: "1px solid #e5e7eb", background: "#f8fafc", textAlign: "left" }}>Period</th>
                      {DAYS.map((day) => (
                        <th key={day} style={{ padding: "10px", border: "1px solid #e5e7eb", background: "#f8fafc", textAlign: "left" }}>{day}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {periodSlots.map((slot) => (
                      <tr key={slot.periodNo}>
                        <td style={{ padding: "10px", border: "1px solid #e5e7eb", background: "#f8fafc", fontWeight: 600 }}>
                          {slot.label}
                        </td>
                        {DAYS.map((day) => {
                          const entry = timetableByKey[`${day}-${slot.periodNo}`];
                          const practical = entry?.lectureType === "practical";

                          return (
                            <td key={`${day}-${slot.periodNo}`} style={{ padding: "10px", border: "1px solid #e5e7eb", verticalAlign: "top" }}>
                              {entry ? (
                                <div
                                  style={{
                                    background: practical ? "#f0fdf4" : "#eff6ff",
                                    borderRadius: "8px",
                                    padding: "8px",
                                    border: `1px solid ${practical ? "#bbf7d0" : "#bfdbfe"}`,
                                  }}
                                >
                                  <strong>{entry.semesterSubjectId?.subjectId?.name || "Subject"}</strong>
                                  <span style={{ marginLeft: "6px", fontSize: "11px", color: practical ? "#166534" : "#1d4ed8" }}>
                                    {practical ? "Practical" : "Theory"}
                                  </span>
                                  <div style={{ fontSize: "12px", color: "#374151", marginTop: "4px" }}>
                                    {entry.semesterSubjectId?.subjectId?.code || "N/A"}
                                  </div>
                                  <div style={{ fontSize: "12px", color: "#374151", marginTop: "4px" }}>
                                    Teacher: {entry.teacherId?.userId?.name || "Unknown"}
                                  </div>
                                  <div style={{ fontSize: "12px", color: "#374151", marginTop: "4px" }}>
                                    Room: {entry.roomId?.name || "N/A"}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteEntry(entry._id)}
                                    style={{ marginTop: "8px", padding: "4px 8px", border: "none", borderRadius: "6px", background: "#ef4444", color: "white", fontSize: "12px" }}
                                  >
                                    Delete
                                  </button>
                                </div>
                              ) : (
                                <span style={{ color: "#9ca3af" }}>Available</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {!summary && !summaryLoading && selectedBatchId && (
        <div style={{ ...card, color: "#475569" }}>No timetable data found for this batch.</div>
      )}
    </div>
  );
}