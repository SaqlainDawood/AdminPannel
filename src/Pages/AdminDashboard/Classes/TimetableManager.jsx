import React, { useEffect, useMemo, useState } from "react";
import {
  getBatches,
  getBatchById,
} from "../../../services/batchAPI";
import {
  getTeachers,
  getTimetableForBatch,
  assignTeacher,
  createTimetableEntry,
  updateTimetableEntry,
  deleteTimetableEntry,
} from "../../../services/academicApi";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const getId = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") return value._id || value.id || "";
  return value;
};

const getName = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    return value.name || value.code || value._id || "";
  }
  return String(value);
};

const formatBatchName = (batch) => {
  if (!batch) return "Select batch";
  if (batch.name) return batch.name;
  const degreeClassCode = batch.degreeClassId?.code || batch.degreeClassId || "Batch";
  const year = batch.startSessionId?.year || "";
  return year ? `${degreeClassCode}-${year}` : degreeClassCode;
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
  const [assignmentForm, setAssignmentForm] = useState({
    semesterSubjectId: "",
    teacherId: "",
  });
  const [entryForm, setEntryForm] = useState({
    semesterSubjectId: "",
    teacherAssignmentId: "",
    roomId: "",
    day: "Monday",
    periodNo: 1,
  });

  const loadBatches = async () => {
    try {
      const response = await getBatches();
      const list = Array.isArray(response) ? response : response?.data || [];
      setBatches(list);
      if (list.length && !selectedBatchId) {
        setSelectedBatchId(getId(list[0]));
      }
    } catch (error) {
      setMessage({ type: "error", text: error?.response?.data?.message || "Unable to load batches." });
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
  }, []);

  const loadBatchDetail = async (batchId) => {
    if (!batchId) {
      setSelectedBatch(null);
      setSummary(null);
      return;
    }

    setSummaryLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const batchData = await getBatchById(batchId);
      const batch = batchData?.data || batchData;
      setSelectedBatch(batch);

      const summaryData = await getTimetableForBatch(batchId);
      setSummary(summaryData);

      const deptId =
        batch?.departmentId?._id ||
        batch?.departmentId ||
        batch?.degreeClassId?.departmentId;

      if (deptId) {
        const teachersData = await getTeachers({ departmentId: deptId, isActive: true });
        setTeachers(Array.isArray(teachersData) ? teachersData : []);
      }

      if (summaryData?.subjectSummaries?.length) {
        setAssignmentForm((prev) => ({
          ...prev,
          semesterSubjectId: prev.semesterSubjectId || summaryData.subjectSummaries[0]._id,
        }));
        setEntryForm((prev) => ({
          ...prev,
          semesterSubjectId: prev.semesterSubjectId || summaryData.subjectSummaries[0]._id,
          roomId: prev.roomId || summaryData.rooms?.[0]?._id || "",
          periodNo: prev.periodNo || 1,
        }));
      }
    } catch (error) {
      setMessage({ type: "error", text: error?.response?.data?.message || "Unable to load timetable data." });
    } finally {
      setSummaryLoading(false);
    }
  };

  useEffect(() => {
    if (selectedBatchId) {
      loadBatchDetail(selectedBatchId);
    }
  }, [selectedBatchId]);

  const selectedBatchName = useMemo(() => {
    if (!selectedBatch) return "";
    return formatBatchName(selectedBatch);
  }, [selectedBatch]);

  const periodSlots = summary?.timeSlots || [];
  const roomOptions = summary?.rooms || [];
  const timetableByKey = useMemo(() => {
    const map = {};
    (summary?.timetableEntries || []).forEach((entry) => {
      const key = `${entry.day}-${entry.periodNo}`;
      map[key] = entry;
    });
    return map;
  }, [summary]);

  const handleAssignmentSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBatchId || !assignmentForm.semesterSubjectId || !assignmentForm.teacherId) {
      setMessage({ type: "error", text: "Please select a subject and a teacher." });
      return;
    }

    try {
      await assignTeacher({
        batchId: selectedBatchId,
        sessionId: selectedBatch?.startSessionId?._id || selectedBatch?.startSessionId,
        semesterSubjectId: assignmentForm.semesterSubjectId,
        teacherId: assignmentForm.teacherId,
      });
      setMessage({ type: "success", text: "Teacher assignment created successfully." });
      await loadBatchDetail(selectedBatchId);
      setAssignmentForm((prev) => ({ ...prev, teacherId: "" }));
    } catch (error) {
      setMessage({ type: "error", text: error?.response?.data?.message || "Teacher assignment failed." });
    }
  };

  const handleEntrySubmit = async (e) => {
    e.preventDefault();
    if (!selectedBatchId || !entryForm.semesterSubjectId || !entryForm.teacherAssignmentId || !entryForm.roomId) {
      setMessage({ type: "error", text: "Please complete the timetable assignment form." });
      return;
    }

    try {
      await createTimetableEntry({
        batchId: selectedBatchId,
        sessionId: selectedBatch?.startSessionId?._id || selectedBatch?.startSessionId,
        semesterNo: summary?.currentSemester,
        semesterSubjectId: entryForm.semesterSubjectId,
        teacherAssignmentId: entryForm.teacherAssignmentId,
        roomId: entryForm.roomId,
        day: entryForm.day,
        periodNo: Number(entryForm.periodNo),
      });
      setMessage({ type: "success", text: "Timetable entry created successfully." });
      await loadBatchDetail(selectedBatchId);
    } catch (error) {
      setMessage({ type: "error", text: error?.response?.data?.message || "Unable to create timetable entry." });
    }
  };

  const handleDeleteEntry = async (entryId) => {
    try {
      await deleteTimetableEntry(entryId);
      setMessage({ type: "success", text: "Timetable entry deleted successfully." });
      await loadBatchDetail(selectedBatchId);
    } catch (error) {
      setMessage({ type: "error", text: error?.response?.data?.message || "Unable to delete timetable entry." });
    }
  };

  const teacherAssignments = summary?.teacherAssignments || [];
  const subjectSummaries = summary?.subjectSummaries || [];

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
            background: message.type === "error" ? "#fef2f2" : "#ecfdf5",
            border: `1px solid ${message.type === "error" ? "#fecaca" : "#a7f3d0"}`,
            color: message.type === "error" ? "#991b1b" : "#065f46",
          }}
        >
          {message.text}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        <div style={{ background: "#fff", borderRadius: "14px", padding: "18px", boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)" }}>
          <label style={{ display: "block", fontSize: "12px", color: "#6b7280", marginBottom: "8px" }}>Select Batch</label>
          <select
            value={selectedBatchId}
            onChange={(e) => setSelectedBatchId(e.target.value)}
            style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #d1d5db" }}
          >
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
            <div style={{ background: "#ffffff", borderRadius: "14px", padding: "18px", boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)" }}>
              <div style={{ color: "#6b7280", fontSize: "12px" }}>Selected Batch</div>
              <strong style={{ display: "block", marginTop: "6px", fontSize: "18px" }}>{selectedBatchName}</strong>
            </div>
            <div style={{ background: "#ffffff", borderRadius: "14px", padding: "18px", boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)" }}>
              <div style={{ color: "#6b7280", fontSize: "12px" }}>Current Semester</div>
              <strong style={{ display: "block", marginTop: "6px", fontSize: "18px" }}>{summary.currentSemester}</strong>
            </div>
            <div style={{ background: "#ffffff", borderRadius: "14px", padding: "18px", boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)" }}>
              <div style={{ color: "#6b7280", fontSize: "12px" }}>Total Subjects</div>
              <strong style={{ display: "block", marginTop: "6px", fontSize: "18px" }}>{summary.totalSubjects}</strong>
            </div>
            <div style={{ background: "#ffffff", borderRadius: "14px", padding: "18px", boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)" }}>
              <div style={{ color: "#6b7280", fontSize: "12px" }}>Lectures Remaining</div>
              <strong style={{ display: "block", marginTop: "6px", fontSize: "18px" }}>{summary.remainingLectures}</strong>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px", marginBottom: "24px" }}>
            <div style={{ background: "#fff", borderRadius: "14px", padding: "18px", boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)" }}>
              <h3 style={{ marginTop: 0, marginBottom: "16px" }}>Assign Teacher</h3>
              <form onSubmit={handleAssignmentSubmit}>
                <div style={{ display: "grid", gap: "12px" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "6px", fontSize: "12px", color: "#6b7280" }}>Semester Subject</label>
                    <select
                      value={assignmentForm.semesterSubjectId}
                      onChange={(e) => setAssignmentForm((prev) => ({ ...prev, semesterSubjectId: e.target.value }))}
                      style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #d1d5db" }}
                    >
                      <option value="">Select subject</option>
                      {subjectSummaries.map((subject) => (
                        <option key={subject._id} value={subject._id}>
                          {subject.subjectCode} - {subject.subjectName} ({subject.requiredLectures} lectures)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", marginBottom: "6px", fontSize: "12px", color: "#6b7280" }}>Teacher</label>
                    <select
                      value={assignmentForm.teacherId}
                      onChange={(e) => setAssignmentForm((prev) => ({ ...prev, teacherId: e.target.value }))}
                      style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #d1d5db" }}
                    >
                      <option value="">Select teacher</option>
                      {teachers.map((teacher) => (
                        <option key={getId(teacher)} value={getId(teacher)}>
                          {teacher.userId?.name || teacher.name || "Teacher"}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button type="submit" style={{ padding: "10px 14px", border: "none", borderRadius: "10px", background: "#2563eb", color: "white", fontWeight: "600" }}>
                    Save Teacher Assignment
                  </button>
                </div>
              </form>
            </div>

            <div style={{ background: "#fff", borderRadius: "14px", padding: "18px", boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)" }}>
              <h3 style={{ marginTop: 0, marginBottom: "16px" }}>Create Timetable Entry</h3>
              <form onSubmit={handleEntrySubmit}>
                <div style={{ display: "grid", gap: "12px" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "6px", fontSize: "12px", color: "#6b7280" }}>Subject</label>
                    <select
                      value={entryForm.semesterSubjectId}
                      onChange={(e) => {
                        const selectedSubjectId = e.target.value;
                        const matchedAssignment = teacherAssignments.find(
                          (item) =>
                            String(item.semesterSubjectId) === String(selectedSubjectId)
                        );
                        setEntryForm((prev) => ({
                          ...prev,
                          semesterSubjectId: selectedSubjectId,
                          teacherAssignmentId: matchedAssignment?._id || "",
                        }));
                      }}
                      style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #d1d5db" }}
                    >
                      <option value="">Select subject</option>
                      {subjectSummaries.map((subject) => (
                        <option key={subject._id} value={subject._id}>
                          {subject.subjectCode} - {subject.subjectName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", marginBottom: "6px", fontSize: "12px", color: "#6b7280" }}>Assigned Teacher</label>
                    <select
                      value={entryForm.teacherAssignmentId}
                      onChange={(e) => setEntryForm((prev) => ({ ...prev, teacherAssignmentId: e.target.value }))}
                      style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #d1d5db" }}
                    >
                      <option value="">Select assignment</option>
                      {teacherAssignments
                        .filter(
                          (assignment) =>
                            String(assignment.semesterSubjectId?._id || assignment.semesterSubjectId) ===
                            String(entryForm.semesterSubjectId)
                        )
                        .map((assignment) => (
                          <option key={assignment._id} value={assignment._id}>
                            {assignment.teacherId?.userId?.name || getName(assignment.teacherId)}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div>
                      <label style={{ display: "block", marginBottom: "6px", fontSize: "12px", color: "#6b7280" }}>Day</label>
                      <select
                        value={entryForm.day}
                        onChange={(e) => setEntryForm((prev) => ({ ...prev, day: e.target.value }))}
                        style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #d1d5db" }}
                      >
                        {DAYS.map((day) => (
                          <option key={day} value={day}>{day}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: "6px", fontSize: "12px", color: "#6b7280" }}>Period</label>
                      <select
                        value={entryForm.periodNo}
                        onChange={(e) => setEntryForm((prev) => ({ ...prev, periodNo: Number(e.target.value) }))}
                        style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #d1d5db" }}
                      >
                        {(periodSlots.length ? periodSlots : [{ periodNo: 1, label: "Period 1" }, { periodNo: 2, label: "Period 2" }, { periodNo: 3, label: "Period 3" }]).map((slot) => (
                          <option key={slot.periodNo} value={slot.periodNo}>{slot.label || `Period ${slot.periodNo}`}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", marginBottom: "6px", fontSize: "12px", color: "#6b7280" }}>Room</label>
                    <select
                      value={entryForm.roomId}
                      onChange={(e) => setEntryForm((prev) => ({ ...prev, roomId: e.target.value }))}
                      style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #d1d5db" }}
                    >
                      <option value="">Select room</option>
                      {roomOptions.map((room) => (
                        <option key={room._id} value={room._id}>{room.name} ({room.code})</option>
                      ))}
                    </select>
                  </div>

                  <button type="submit" style={{ padding: "10px 14px", border: "none", borderRadius: "10px", background: "#0f766e", color: "white", fontWeight: "600" }}>
                    Create Lecture Slot
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div style={{ background: "#fff", borderRadius: "14px", padding: "18px", boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)" }}>
            <h3 style={{ marginTop: 0 }}>Weekly Timetable</h3>
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
                  {(periodSlots.length ? periodSlots : [{ periodNo: 1, label: "Period 1" }, { periodNo: 2, label: "Period 2" }, { periodNo: 3, label: "Period 3" }]).map((slot) => (
                    <tr key={slot.periodNo}>
                      <td style={{ padding: "10px", border: "1px solid #e5e7eb", background: "#f8fafc", fontWeight: 600 }}>
                        {slot.label || `Period ${slot.periodNo}`}
                      </td>
                      {DAYS.map((day) => {
                        const key = `${day}-${slot.periodNo}`;
                        const entry = timetableByKey[key];

                        return (
                          <td key={`${day}-${slot.periodNo}`} style={{ padding: "10px", border: "1px solid #e5e7eb", verticalAlign: "top" }}>
                            {entry ? (
                              <div style={{ background: "#eff6ff", borderRadius: "8px", padding: "8px", border: "1px solid #bfdbfe" }}>
                                <strong>{entry.semesterSubjectId?.subjectId?.name || "Subject"}</strong>
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
          </div>
        </>
      )}

      {!summary && !summaryLoading && selectedBatchId && (
        <div style={{ background: "#fff", borderRadius: "14px", padding: "20px", color: "#475569" }}>
          No timetable data found for this batch.
        </div>
      )}
    </div>
  );
}
