
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
  deleteTimetableEntry,
  generateTimetable,
  getTimetableAvailability,
} from "../../../services/academicApi";

const DAYS_FALLBACK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

/* =========================================================
   HELPERS
========================================================= */

const getId = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") return value._id || value.id || "";
  return value;
};

const formatBatchName = (batch) => {
  if (!batch) return "Select batch";

  if (batch.name) return batch.name;

  const degreeClassCode =
    batch.degreeClassId?.code ||
    batch.degreeClassId ||
    "Batch";

  const year = batch.startSessionId?.year || "";

  return year
    ? `${degreeClassCode}-${year}`
    : degreeClassCode;
};

const slotLabel = (slot) => {
  if (slot.label) return slot.label;

  if (slot.startTime && slot.endTime) {
    return `Period ${slot.periodNo} (${slot.startTime}–${slot.endTime})`;
  }

  return `Period ${slot.periodNo}`;
};

const errText = (error, fallback) =>
  error?.response?.data?.message ||
  error?.message ||
  fallback;

/* =========================================================
   SMALL ICON COMPONENT
========================================================= */

const Icon = ({ type, size = 20 }) => {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  if (type === "calendar") {
    return (
      <svg {...common}>
        <rect x="3" y="4" width="18" height="17" rx="3" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    );
  }

  if (type === "users") {
    return (
      <svg {...common}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    );
  }

  if (type === "book") {
    return (
      <svg {...common}>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
      </svg>
    );
  }

  if (type === "clock") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    );
  }

  if (type === "plus") {
    return (
      <svg {...common}>
        <path d="M12 5v14M5 12h14" />
      </svg>
    );
  }

  if (type === "spark") {
    return (
      <svg {...common}>
        <path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" />
        <path d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16Z" />
      </svg>
    );
  }

  if (type === "trash") {
    return (
      <svg {...common}>
        <path d="M3 6h18" />
        <path d="M8 6V4h8v2" />
        <path d="m19 6-1 15H6L5 6" />
        <path d="M10 11v6M14 11v6" />
      </svg>
    );
  }

  if (type === "refresh") {
    return (
      <svg {...common}>
        <path d="M20 11a8.1 8.1 0 0 0-15.5-3M4 4v4h4" />
        <path d="M4 13a8.1 8.1 0 0 0 15.5 3M20 20v-4h-4" />
      </svg>
    );
  }

  if (type === "chevron") {
    return (
      <svg {...common}>
        <path d="m6 9 6 6 6-6" />
      </svg>
    );
  }

  return null;
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function TimetableManager() {
  const [batches, setBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [summary, setSummary] = useState(null);
  const [teachers, setTeachers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  const [assignmentForm, setAssignmentForm] = useState({
    semesterSubjectId: "",
    teacherId: "",
  });

  const [entryForm, setEntryForm] = useState({
    semesterSubjectId: "",
    lectureType: "theory",
    roomId: "",
    day: "Monday",
    periodNo: "",
  });

  const [freeRooms, setFreeRooms] = useState(null);

  const [allowPartial, setAllowPartial] =
    useState(false);

  const [generating, setGenerating] =
    useState(false);

  const [genResult, setGenResult] =
    useState(null);

  /* =========================================================
     LOAD BATCHES
  ========================================================= */

  const loadBatches = async () => {
    try {
      const response = await getBatches();

      const list = Array.isArray(response)
        ? response
        : response?.data || [];

      setBatches(list);

      if (list.length && !selectedBatchId) {
        setSelectedBatchId(getId(list[0]));
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: errText(
          error,
          "Unable to load batches."
        ),
      });
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

  /* =========================================================
     LOAD BATCH DETAIL
  ========================================================= */

  const loadBatchDetail = async (
    batchId,
    { keepMessage = false } = {}
  ) => {
    if (!batchId) {
      setSelectedBatch(null);
      setSummary(null);
      return;
    }

    setSummaryLoading(true);

    if (!keepMessage) {
      setMessage({
        type: "",
        text: "",
      });
    }

    try {
      const batchData =
        await getBatchById(batchId);

      const batch =
        batchData?.data || batchData;

      setSelectedBatch(batch);

      const summaryData =
        await getTimetableForBatch(batchId);

      setSummary(summaryData);

      const deptId =
        batch?.departmentId?._id ||
        batch?.departmentId ||
        batch?.degreeClassId?.departmentId;

      if (deptId) {
        const teachersData =
          await getTeachers({
            departmentId: deptId,
            isActive: true,
          });

        setTeachers(
          Array.isArray(teachersData)
            ? teachersData
            : []
        );
      }

      const subjects =
        summaryData?.subjectSummaries || [];

      if (subjects.length) {
        const pick = (prevId) =>
          subjects.find(
            (s) =>
              String(s._id) ===
              String(prevId)
          ) || subjects[0];

        setAssignmentForm((prev) => {
          const subject = pick(
            prev.semesterSubjectId
          );

          return {
            semesterSubjectId:
              subject._id,
            teacherId:
              subject.teacherId || "",
          };
        });

        setEntryForm((prev) => {
          const subject = pick(
            prev.semesterSubjectId
          );

          return {
            ...prev,
            semesterSubjectId:
              subject._id,
            roomId: "",
            periodNo:
              prev.periodNo ||
              summaryData?.timeSlots?.[0]
                ?.periodNo ||
              "",
          };
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: errText(
          error,
          "Unable to load timetable data."
        ),
      });
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

  /* =========================================================
     DERIVED DATA
  ========================================================= */

  const DAYS =
    summary?.days?.length
      ? summary.days
      : DAYS_FALLBACK;

  const subjectSummaries =
    summary?.subjectSummaries || [];

  const roomOptions =
    summary?.rooms || [];

  const periodSlots = useMemo(
    () =>
      (summary?.timeSlots || []).map(
        (s) => ({
          periodNo: s.periodNo,
          label: slotLabel(s),
        })
      ),
    [summary]
  );

  const selectedBatchName = useMemo(
    () =>
      selectedBatch
        ? formatBatchName(
            selectedBatch
          )
        : "",
    [selectedBatch]
  );

  const selectedSubject =
    subjectSummaries.find(
      (s) =>
        String(s._id) ===
        String(
          entryForm.semesterSubjectId
        )
    );

  const hasTeacher =
    Boolean(selectedSubject?.teacherId);

  const typeOptions = useMemo(() => {
    const opts = [];

    if (
      selectedSubject?.theoryRemaining > 0
    ) {
      opts.push({
        value: "theory",
        label: `Theory (${selectedSubject.theoryRemaining} left)`,
      });
    }

    if (
      selectedSubject?.practicalRemaining > 0
    ) {
      opts.push({
        value: "practical",
        label: `Practical (${selectedSubject.practicalRemaining} left)`,
      });
    }

    return opts;
  }, [selectedSubject]);

  useEffect(() => {
    if (
      typeOptions.length &&
      !typeOptions.some(
        (o) =>
          o.value ===
          entryForm.lectureType
      )
    ) {
      setEntryForm((prev) => ({
        ...prev,
        lectureType:
          typeOptions[0].value,
        roomId: "",
      }));
    }
  }, [typeOptions, entryForm.lectureType]);

  /* =========================================================
     ROOM AVAILABILITY
  ========================================================= */

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (
        !selectedBatchId ||
        !entryForm.day ||
        !entryForm.periodNo ||
        !summary
      ) {
        setFreeRooms(null);
        return;
      }

      try {
        const body =
          await getTimetableAvailability({
            batchId: selectedBatchId,
            day: entryForm.day,
            periodNo:
              entryForm.periodNo,
            type:
              entryForm.lectureType,
          });

        if (!cancelled) {
          setFreeRooms(
            body?.data?.rooms ||
              body?.rooms ||
              []
          );
        }
      } catch {
        if (!cancelled) {
          setFreeRooms(null);
        }
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [
    selectedBatchId,
    entryForm.day,
    entryForm.periodNo,
    entryForm.lectureType,
    summary,
  ]);

  const availableRooms = useMemo(() => {
    const base =
      freeRooms ?? roomOptions;

    if (
      entryForm.lectureType ===
      "practical"
    ) {
      return base.filter(
        (r) => r.type === "lab"
      );
    }

    return base;
  }, [
    freeRooms,
    roomOptions,
    entryForm.lectureType,
  ]);

  useEffect(() => {
    if (
      entryForm.roomId &&
      !availableRooms.some(
        (r) =>
          String(r._id) ===
          String(entryForm.roomId)
      )
    ) {
      setEntryForm((prev) => ({
        ...prev,
        roomId: "",
      }));
    }
  }, [
    availableRooms,
    entryForm.roomId,
  ]);

  const timetableByKey = useMemo(() => {
    const map = {};

    (
      summary?.timetableEntries || []
    ).forEach((entry) => {
      map[
        `${entry.day}-${entry.periodNo}`
      ] = entry;
    });

    return map;
  }, [summary]);

  /* =========================================================
     HANDLERS
  ========================================================= */

  const handleAssignSubjectChange = (
    subjectId
  ) => {
    const subject =
      subjectSummaries.find(
        (s) =>
          String(s._id) ===
          String(subjectId)
      );

    setAssignmentForm({
      semesterSubjectId: subjectId,
      teacherId:
        subject?.teacherId || "",
    });
  };

  const handleAssignmentSubmit =
    async (e) => {
      e.preventDefault();

      if (
        !selectedBatchId ||
        !assignmentForm.semesterSubjectId ||
        !assignmentForm.teacherId
      ) {
        setMessage({
          type: "error",
          text:
            "Please select a subject and a teacher.",
        });

        return;
      }

      try {
        await assignTeacher({
          batchId:
            selectedBatchId,
          semesterNo:
            summary?.currentSemester,
          semesterSubjectId:
            assignmentForm.semesterSubjectId,
          teacherId:
            assignmentForm.teacherId,
        });

        setMessage({
          type: "success",
          text:
            "Teacher assigned successfully.",
        });

        await loadBatchDetail(
          selectedBatchId,
          { keepMessage: true }
        );
      } catch (error) {
        setMessage({
          type: "error",
          text: errText(
            error,
            "Teacher assignment failed."
          ),
        });
      }
    };

  const handleEntrySubmit =
    async (e) => {
      e.preventDefault();

      if (!hasTeacher) {
        setMessage({
          type: "error",
          text:
            "Pehle is subject ko teacher assign karein.",
        });

        return;
      }

      if (
        !selectedBatchId ||
        !entryForm.semesterSubjectId ||
        !entryForm.roomId ||
        !entryForm.periodNo
      ) {
        setMessage({
          type: "error",
          text:
            "Please complete the timetable entry form.",
        });

        return;
      }

      try {
        const res =
          await createTimetableEntry({
            batchId:
              selectedBatchId,

            sessionId:
              selectedBatch
                ?.startSessionId?._id ||
              selectedBatch
                ?.startSessionId,

            semesterNo:
              summary?.currentSemester,

            semesterSubjectId:
              entryForm.semesterSubjectId,

            lectureType:
              entryForm.lectureType,

            roomId:
              entryForm.roomId,

            day:
              entryForm.day,

            periodNo:
              Number(
                entryForm.periodNo
              ),
          });

        const warnings =
          res?.warnings || [];

        setMessage(
          warnings.length
            ? {
                type: "warning",
                text: `Lecture slot created. ${warnings.join(
                  " "
                )}`,
              }
            : {
                type: "success",
                text:
                  "Lecture slot created successfully.",
              }
        );

        await loadBatchDetail(
          selectedBatchId,
          { keepMessage: true }
        );
      } catch (error) {
        setMessage({
          type: "error",
          text: errText(
            error,
            "Unable to create timetable entry."
          ),
        });
      }
    };

  const handleDeleteEntry =
    async (entryId) => {
      if (
        !window.confirm(
          "Delete this lecture slot?"
        )
      ) {
        return;
      }

      try {
        await deleteTimetableEntry(
          entryId
        );

        setMessage({
          type: "success",
          text:
            "Lecture slot deleted successfully.",
        });

        await loadBatchDetail(
          selectedBatchId,
          { keepMessage: true }
        );
      } catch (error) {
        setMessage({
          type: "error",
          text: errText(
            error,
            "Unable to delete timetable entry."
          ),
        });
      }
    };

  const handleGenerate =
    async (dryRun) => {
      if (!selectedBatchId) return;

      if (
        !dryRun &&
        !window.confirm(
          "Generate the remaining lectures for this batch?"
        )
      ) {
        return;
      }

      setGenerating(true);
      setGenResult(null);

      try {
        const res =
          await generateTimetable(
            selectedBatchId,
            {
              dryRun,
              allowPartial,
            }
          );

        setGenResult(
          res?.data || null
        );

        setMessage({
          type: res?.success
            ? "success"
            : "warning",
          text:
            res?.message ||
            (res?.success
              ? "Done."
              : "Timetable is incomplete."),
        });

        if (
          !dryRun &&
          res?.data?.saved
        ) {
          await loadBatchDetail(
            selectedBatchId,
            { keepMessage: true }
          );
        }
      } catch (error) {
        const data =
          error?.response?.data?.data;

        if (data) {
          setGenResult(data);
        }

        setMessage({
          type: "error",
          text: errText(
            error,
            "Timetable could not be generated."
          ),
        });
      } finally {
        setGenerating(false);
      }
    };

  /* =========================================================
     COMMON STYLES
  ========================================================= */

  const styles = {
    page: {
      minHeight: "100vh",
      background:
        "linear-gradient(180deg, #f8fafc 0%, #f3f6fb 100%)",
      padding: "28px",
      color: "#172033",
    },

    container: {
      maxWidth: "1650px",
      margin: "0 auto",
    },

    card: {
      background: "#ffffff",
      border:
        "1px solid #e7ebf2",
      borderRadius: "18px",
      boxShadow:
        "0 8px 30px rgba(15, 23, 42, 0.045)",
    },

    label: {
      display: "block",
      marginBottom: "7px",
      fontSize: "11px",
      fontWeight: "800",
      color: "#64748b",
      textTransform: "uppercase",
      letterSpacing: "0.055em",
    },

    input: {
      width: "100%",
      height: "44px",
      padding: "0 13px",
      borderRadius: "10px",
      border:
        "1px solid #d8dee8",
      background: "#ffffff",
      color: "#172033",
      fontSize: "13px",
      outline: "none",
      boxSizing: "border-box",
    },

    button: {
      height: "44px",
      border: "none",
      borderRadius: "10px",
      padding: "0 16px",
      fontWeight: "700",
      fontSize: "13px",
      cursor: "pointer",
    },
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "20px",
            marginBottom: "25px",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
            }}
          >
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "15px",
                background:
                  "linear-gradient(135deg, #2563eb, #4f46e5)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow:
                  "0 10px 22px rgba(37, 99, 235, .22)",
              }}
            >
              <Icon
                type="calendar"
                size={25}
              />
            </div>

            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: "26px",
                  fontWeight: "850",
                  letterSpacing:
                    "-0.025em",
                  color: "#172033",
                }}
              >
                Timetable Management
              </h1>

              <p
                style={{
                  margin:
                    "5px 0 0",
                  color: "#64748b",
                  fontSize: "13px",
                }}
              >
                Manage weekly schedules,
                teachers, rooms and lecture
                allocations.
              </p>
            </div>
          </div>

          {selectedBatch && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "9px",
                padding:
                  "10px 14px",
                borderRadius: "12px",
                background: "#ffffff",
                border:
                  "1px solid #e3e8f0",
              }}
            >
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "#22c55e",
                  boxShadow:
                    "0 0 0 4px #dcfce7",
                }}
              />

              <span
                style={{
                  fontSize: "12px",
                  color: "#64748b",
                  fontWeight: "600",
                }}
              >
                Active Batch
              </span>

              <span
                style={{
                  fontSize: "13px",
                  color: "#1d4ed8",
                  fontWeight: "800",
                }}
              >
                {selectedBatchName}
              </span>
            </div>
          )}
        </div>

        {/* =====================================================
            ALERT
        ===================================================== */}

        {message.text && (
          <div
            style={{
              marginBottom: "20px",
              padding:
                "13px 16px",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              background:
                message.type === "error"
                  ? "#fff1f2"
                  : message.type ===
                    "warning"
                  ? "#fffbeb"
                  : "#ecfdf5",
              border:
                message.type === "error"
                  ? "1px solid #fecdd3"
                  : message.type ===
                    "warning"
                  ? "1px solid #fde68a"
                  : "1px solid #a7f3d0",
              color:
                message.type === "error"
                  ? "#be123c"
                  : message.type ===
                    "warning"
                  ? "#92400e"
                  : "#047857",
              fontSize: "13px",
              fontWeight: "650",
            }}
          >
            <strong
              style={{
                width: "22px",
                height: "22px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background:
                  message.type ===
                  "error"
                    ? "#ffe4e6"
                    : message.type ===
                      "warning"
                    ? "#fef3c7"
                    : "#d1fae5",
              }}
            >
              {message.type === "error"
                ? "!"
                : message.type ===
                  "warning"
                ? "!"
                : "✓"}
            </strong>

            {message.text}
          </div>
        )}

        {/* =====================================================
            BATCH SELECTOR
        ===================================================== */}

        <div
          style={{
            ...styles.card,
            padding: "20px",
            marginBottom: "22px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent:
                "space-between",
              gap: "15px",
              marginBottom: "13px",
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "9px",
                }}
              >
                <span
                  style={{
                    color: "#2563eb",
                  }}
                >
                  <Icon
                    type="book"
                    size={18}
                  />
                </span>

                <span
                  style={{
                    fontSize: "15px",
                    fontWeight: "800",
                  }}
                >
                  Select Batch
                </span>
              </div>

              <p
                style={{
                  margin:
                    "4px 0 0 27px",
                  color: "#94a3b8",
                  fontSize: "11px",
                }}
              >
                Select a batch to load
                its current semester
                timetable.
              </p>
            </div>

            {summaryLoading && (
              <span
                style={{
                  fontSize: "11px",
                  color: "#2563eb",
                  fontWeight: "700",
                }}
              >
                Loading...
              </span>
            )}
          </div>

          <div
            style={{
              position: "relative",
            }}
          >
            <select
              value={
                selectedBatchId
              }
              onChange={(e) =>
                setSelectedBatchId(
                  e.target.value
                )
              }
              style={{
                ...styles.input,
                height: "48px",
                paddingRight: "40px",
                fontWeight: "600",
              }}
              disabled={loading}
            >
              <option value="">
                Choose a batch
              </option>

              {batches.map(
                (batch) => (
                  <option
                    key={getId(batch)}
                    value={getId(
                      batch
                    )}
                  >
                    {formatBatchName(
                      batch
                    )}
                  </option>
                )
              )}
            </select>
          </div>
        </div>

        {/* =====================================================
            LOADING
        ===================================================== */}

        {loading && (
          <div
            style={{
              ...styles.card,
              padding: "55px",
              textAlign: "center",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                width: "34px",
                height: "34px",
                margin:
                  "0 auto 13px",
                border:
                  "3px solid #e2e8f0",
                borderTop:
                  "3px solid #2563eb",
                borderRadius:
                  "50%",
                animation:
                  "tmSpin 1s linear infinite",
              }}
            />

            <div
              style={{
                color: "#64748b",
                fontSize: "13px",
                fontWeight: "600",
              }}
            >
              Loading batches...
            </div>
          </div>
        )}

        {/* =====================================================
            MAIN CONTENT
        ===================================================== */}

        {summary && (
          <>
            {/* =================================================
                STATS
            ================================================= */}

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(210px, 1fr))",
                gap: "15px",
                marginBottom: "22px",
              }}
            >
              {[
                {
                  title:
                    "Current Semester",
                  value:
                    summary.currentSemester ||
                    "-",
                  sub:
                    "Active semester",
                  icon: "calendar",
                  bg: "#eff6ff",
                  color: "#2563eb",
                },
                {
                  title:
                    "Total Subjects",
                  value:
                    summary.totalSubjects ||
                    0,
                  sub:
                    "Semester subjects",
                  icon: "book",
                  bg: "#f5f3ff",
                  color: "#7c3aed",
                },
                {
                  title:
                    "Scheduled",
                  value: `${summary.scheduledLectures || 0}/${summary.totalRequiredLectures || 0}`,
                  sub:
                    "Lecture slots",
                  icon: "clock",
                  bg: "#ecfdf5",
                  color: "#059669",
                },
                {
                  title:
                    "Remaining",
                  value:
                    summary.remainingLectures ||
                    0,
                  sub:
                    "Lectures to schedule",
                  icon: "calendar",
                  bg: "#fff7ed",
                  color: "#ea580c",
                },
              ].map(
                (stat) => (
                  <div
                    key={stat.title}
                    style={{
                      ...styles.card,
                      padding: "18px",
                      position:
                        "relative",
                      overflow:
                        "hidden",
                    }}
                  >
                    <div
                      style={{
                        display:
                          "flex",
                        alignItems:
                          "center",
                        justifyContent:
                          "space-between",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            color:
                              "#64748b",
                            fontSize:
                              "10px",
                            fontWeight:
                              "800",
                            textTransform:
                              "uppercase",
                            letterSpacing:
                              ".06em",
                          }}
                        >
                          {stat.title}
                        </div>

                        <div
                          style={{
                            marginTop:
                              "7px",
                            color:
                              "#172033",
                            fontSize:
                              "25px",
                            lineHeight:
                              1,
                            fontWeight:
                              "850",
                          }}
                        >
                          {stat.value}
                        </div>

                        <div
                          style={{
                            marginTop:
                              "7px",
                            color:
                              "#94a3b8",
                            fontSize:
                              "11px",
                          }}
                        >
                          {stat.sub}
                        </div>
                      </div>

                      <div
                        style={{
                          width: "42px",
                          height: "42px",
                          borderRadius:
                            "12px",
                          background:
                            stat.bg,
                          color:
                            stat.color,
                          display:
                            "flex",
                          alignItems:
                            "center",
                          justifyContent:
                            "center",
                        }}
                      >
                        <Icon
                          type={
                            stat.icon
                          }
                          size={20}
                        />
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>

            {/* =================================================
                BATCH INFO
            ================================================= */}

            <div
              style={{
                ...styles.card,
                padding:
                  "15px 18px",
                marginBottom:
                  "22px",
                background:
                  "linear-gradient(90deg, #eff6ff, #ffffff)",
                border:
                  "1px solid #dbeafe",
              }}
            >
              <div
                style={{
                  display:
                    "flex",
                  alignItems:
                    "center",
                  gap: "10px",
                  flexWrap:
                    "wrap",
                }}
              >
                <span
                  style={{
                    fontSize:
                      "11px",
                    color:
                      "#64748b",
                    fontWeight:
                      "700",
                  }}
                >
                  MANAGING
                </span>

                <span
                  style={{
                    padding:
                      "5px 10px",
                    borderRadius:
                      "7px",
                    background:
                      "#dbeafe",
                    color:
                      "#1d4ed8",
                    fontSize:
                      "12px",
                    fontWeight:
                      "800",
                  }}
                >
                  {selectedBatchName}
                </span>

                <span
                  style={{
                    color:
                      "#cbd5e1",
                  }}
                >
                  /
                </span>

                <span
                  style={{
                    fontSize:
                      "12px",
                    color:
                      "#475569",
                    fontWeight:
                      "650",
                  }}
                >
                  Semester{" "}
                  {
                    summary.currentSemester
                  }
                </span>
              </div>
            </div>

            {/* =================================================
                MANAGEMENT PANELS
            ================================================= */}

            <div
              style={{
                display:
                  "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(320px, 1fr))",
                gap: "18px",
                marginBottom:
                  "22px",
              }}
            >
              {/* =============================================
                  ASSIGN TEACHER
              ============================================= */}

              <div
                style={{
                  ...styles.card,
                  padding: "21px",
                }}
              >
                <div
                  style={{
                    display:
                      "flex",
                    alignItems:
                      "center",
                    gap: "11px",
                    marginBottom:
                      "20px",
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius:
                        "11px",
                      background:
                        "#eff6ff",
                      color:
                        "#2563eb",
                      display:
                        "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                    }}
                  >
                    <Icon
                      type="users"
                      size={19}
                    />
                  </div>

                  <div>
                    <h3
                      style={{
                        margin:
                          0,
                        fontSize:
                          "16px",
                        fontWeight:
                          "800",
                      }}
                    >
                      Assign Teacher
                    </h3>

                    <p
                      style={{
                        margin:
                          "3px 0 0",
                        color:
                          "#94a3b8",
                        fontSize:
                          "11px",
                      }}
                    >
                      Connect a teacher
                      with a subject.
                    </p>
                  </div>
                </div>

                <form
                  onSubmit={
                    handleAssignmentSubmit
                  }
                >
                  <div
                    style={{
                      display:
                        "grid",
                      gap: "15px",
                    }}
                  >
                    <div>
                      <label
                        style={
                          styles.label
                        }
                      >
                        Semester Subject
                      </label>

                      <select
                        value={
                          assignmentForm.semesterSubjectId
                        }
                        onChange={(e) =>
                          handleAssignSubjectChange(
                            e.target
                              .value
                          )
                        }
                        style={
                          styles.input
                        }
                      >
                        <option value="">
                          Select subject
                        </option>

                        {subjectSummaries.map(
                          (
                            subject
                          ) => (
                            <option
                              key={
                                subject._id
                              }
                              value={
                                subject._id
                              }
                            >
                              {
                                subject.subjectCode
                              }{" "}
                              -{" "}
                              {
                                subject.subjectName
                              }
                              {" "}
                              (
                              {
                                subject.requiredLectures
                              }{" "}
                              lectures
                              {subject.teacherName
                                ? ` | ${subject.teacherName}`
                                : " | no teacher"}
                              )
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <div>
                      <label
                        style={
                          styles.label
                        }
                      >
                        Teacher
                      </label>

                      <select
                        value={
                          assignmentForm.teacherId
                        }
                        onChange={(e) =>
                          setAssignmentForm(
                            (
                              prev
                            ) => ({
                              ...prev,
                              teacherId:
                                e
                                  .target
                                  .value,
                            })
                          )
                        }
                        style={
                          styles.input
                        }
                      >
                        <option value="">
                          Select teacher
                        </option>

                        {teachers.map(
                          (
                            teacher
                          ) => (
                            <option
                              key={getId(
                                teacher
                              )}
                              value={getId(
                                teacher
                              )}
                            >
                              {teacher
                                .userId
                                ?.name ||
                                teacher.name ||
                                "Teacher"}
                            </option>
                          )
                        )}
                      </select>

                      <p
                        style={{
                          margin:
                            "7px 0 0",
                          color:
                            "#94a3b8",
                          fontSize:
                            "10px",
                          lineHeight:
                            "1.4",
                        }}
                      >
                        Saving again will
                        replace the current
                        teacher for this
                        subject.
                      </p>
                    </div>

                    <button
                      type="submit"
                      style={{
                        ...styles.button,
                        background:
                          "#2563eb",
                        color:
                          "#ffffff",
                        boxShadow:
                          "0 6px 14px rgba(37,99,235,.18)",
                      }}
                    >
                      Save Teacher Assignment
                    </button>
                  </div>
                </form>
              </div>

              {/* =============================================
                  CREATE ENTRY
              ============================================= */}

              <div
                style={{
                  ...styles.card,
                  padding: "21px",
                }}
              >
                <div
                  style={{
                    display:
                      "flex",
                    alignItems:
                      "center",
                    gap: "11px",
                    marginBottom:
                      "20px",
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius:
                        "11px",
                      background:
                        "#ecfdf5",
                      color:
                        "#059669",
                      display:
                        "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                    }}
                  >
                    <Icon
                      type="plus"
                      size={20}
                    />
                  </div>

                  <div>
                    <h3
                      style={{
                        margin:
                          0,
                        fontSize:
                          "16px",
                        fontWeight:
                          "800",
                      }}
                    >
                      Create Lecture Slot
                    </h3>

                    <p
                      style={{
                        margin:
                          "3px 0 0",
                        color:
                          "#94a3b8",
                        fontSize:
                          "11px",
                      }}
                    >
                      Add a lecture to
                      the weekly schedule.
                    </p>
                  </div>
                </div>

                <form
                  onSubmit={
                    handleEntrySubmit
                  }
                >
                  <div
                    style={{
                      display:
                        "grid",
                      gap: "13px",
                    }}
                  >
                    <div>
                      <label
                        style={
                          styles.label
                        }
                      >
                        Subject
                      </label>

                      <select
                        value={
                          entryForm.semesterSubjectId
                        }
                        onChange={(e) =>
                          setEntryForm(
                            (
                              prev
                            ) => ({
                              ...prev,
                              semesterSubjectId:
                                e
                                  .target
                                  .value,
                              roomId:
                                "",
                            })
                          )
                        }
                        style={
                          styles.input
                        }
                      >
                        <option value="">
                          Select subject
                        </option>

                        {subjectSummaries.map(
                          (
                            subject
                          ) => (
                            <option
                              key={
                                subject._id
                              }
                              value={
                                subject._id
                              }
                              disabled={
                                subject.isComplete
                              }
                            >
                              {
                                subject.subjectCode
                              }{" "}
                              -{" "}
                              {
                                subject.subjectName
                              }
                              {subject.isComplete
                                ? " (complete)"
                                : ` (${subject.remainingLectures} left)`}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <div>
                      <label
                        style={
                          styles.label
                        }
                      >
                        Assigned Teacher
                      </label>

                      <div
                        style={{
                          height:
                            "44px",
                          display:
                            "flex",
                          alignItems:
                            "center",
                          padding:
                            "0 12px",
                          borderRadius:
                            "10px",
                          border:
                            hasTeacher
                              ? "1px solid #bbf7d0"
                              : "1px solid #fecaca",
                          background:
                            hasTeacher
                              ? "#f0fdf4"
                              : "#fff7f7",
                          color:
                            hasTeacher
                              ? "#166534"
                              : "#b91c1c",
                          fontSize:
                            "13px",
                          fontWeight:
                            "650",
                        }}
                      >
                        {selectedSubject
                          ?.teacherName ||
                          "Teacher not assigned"}
                      </div>

                      {!hasTeacher &&
                        entryForm.semesterSubjectId && (
                          <p
                            style={{
                              margin:
                                "6px 0 0",
                              color:
                                "#dc2626",
                              fontSize:
                                "10px",
                              fontWeight:
                                "600",
                            }}
                          >
                            Assign a teacher
                            before creating
                            this lecture.
                          </p>
                        )}
                    </div>

                    <div>
                      <label
                        style={
                          styles.label
                        }
                      >
                        Lecture Type
                      </label>

                      <div
                        style={{
                          display:
                            "grid",
                          gridTemplateColumns:
                            "1fr 1fr",
                          gap: "8px",
                        }}
                      >
                        {[
                          {
                            value:
                              "theory",
                            label:
                              "Theory",
                            color:
                              "#2563eb",
                          },
                          {
                            value:
                              "practical",
                            label:
                              "Practical",
                            color:
                              "#059669",
                          },
                        ].map(
                          (
                            option
                          ) => {
                            const active =
                              entryForm.lectureType ===
                              option.value;

                            const available =
                              typeOptions.some(
                                (
                                  x
                                ) =>
                                  x.value ===
                                  option.value
                              );

                            return (
                              <button
                                key={
                                  option.value
                                }
                                type="button"
                                disabled={
                                  !available
                                }
                                onClick={() =>
                                  setEntryForm(
                                    (
                                      prev
                                    ) => ({
                                      ...prev,
                                      lectureType:
                                        option.value,
                                      roomId:
                                        "",
                                    })
                                  )
                                }
                                style={{
                                  height:
                                    "42px",
                                  borderRadius:
                                    "9px",
                                  border:
                                    active
                                      ? `1px solid ${option.color}`
                                      : "1px solid #e2e8f0",
                                  background:
                                    active
                                      ? option.value ===
                                        "theory"
                                        ? "#eff6ff"
                                        : "#ecfdf5"
                                      : "#ffffff",
                                  color:
                                    active
                                      ? option.color
                                      : available
                                      ? "#64748b"
                                      : "#cbd5e1",
                                  fontSize:
                                    "12px",
                                  fontWeight:
                                    "750",
                                  cursor:
                                    available
                                      ? "pointer"
                                      : "not-allowed",
                                }}
                              >
                                {option.label}
                              </button>
                            );
                          }
                        )}
                      </div>
                    </div>

                    <div
                      style={{
                        display:
                          "grid",
                        gridTemplateColumns:
                          "1fr 1fr",
                        gap: "10px",
                      }}
                    >
                      <div>
                        <label
                          style={
                            styles.label
                          }
                        >
                          Day
                        </label>

                        <select
                          value={
                            entryForm.day
                          }
                          onChange={(e) =>
                            setEntryForm(
                              (
                                prev
                              ) => ({
                                ...prev,
                                day: e
                                  .target
                                  .value,
                                roomId:
                                  "",
                              })
                            )
                          }
                          style={
                            styles.input
                          }
                        >
                          {DAYS.map(
                            (day) => (
                              <option
                                key={
                                  day
                                }
                                value={
                                  day
                                }
                              >
                                {day}
                              </option>
                            )
                          )}
                        </select>
                      </div>

                      <div>
                        <label
                          style={
                            styles.label
                          }
                        >
                          Period
                        </label>

                        <select
                          value={
                            entryForm.periodNo
                          }
                          onChange={(e) =>
                            setEntryForm(
                              (
                                prev
                              ) => ({
                                ...prev,
                                periodNo:
                                  Number(
                                    e
                                      .target
                                      .value
                                  ),
                                roomId:
                                  "",
                              })
                            )
                          }
                          style={
                            styles.input
                          }
                          disabled={
                            !periodSlots.length
                          }
                        >
                          {!periodSlots.length && (
                            <option value="">
                              No time slots
                            </option>
                          )}

                          {periodSlots.map(
                            (
                              slot
                            ) => (
                              <option
                                key={
                                  slot.periodNo
                                }
                                value={
                                  slot.periodNo
                                }
                              >
                                {
                                  slot.label
                                }
                              </option>
                            )
                          )}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label
                        style={
                          styles.label
                        }
                      >
                        Available Room{" "}
                        {entryForm.lectureType ===
                        "practical"
                          ? "(Labs only)"
                          : ""}
                      </label>

                      <select
                        value={
                          entryForm.roomId
                        }
                        onChange={(e) =>
                          setEntryForm(
                            (
                              prev
                            ) => ({
                              ...prev,
                              roomId:
                                e
                                  .target
                                  .value,
                            })
                          )
                        }
                        style={
                          styles.input
                        }
                      >
                        <option value="">
                          {availableRooms.length
                            ? `${availableRooms.length} room${
                                availableRooms.length >
                                1
                                  ? "s"
                                  : ""
                              } available`
                            : "No free room for this slot"}
                        </option>

                        {availableRooms.map(
                          (
                            room
                          ) => (
                            <option
                              key={
                                room._id
                              }
                              value={
                                room._id
                              }
                            >
                              {room.name}{" "}
                              (
                              {
                                room.code
                              }
                              )
                              {room.type ===
                              "lab"
                                ? " • Lab"
                                : ""}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={
                        !hasTeacher ||
                        !typeOptions.length
                      }
                      style={{
                        ...styles.button,
                        background:
                          "#059669",
                        color:
                          "#ffffff",
                        opacity:
                          !hasTeacher ||
                          !typeOptions.length
                            ? 0.45
                            : 1,
                      }}
                    >
                      <span
                        style={{
                          display:
                            "inline-flex",
                          alignItems:
                            "center",
                          gap: "7px",
                        }}
                      >
                        <Icon
                          type="plus"
                          size={16}
                        />

                        Create Lecture Slot
                      </span>
                    </button>
                  </div>
                </form>
              </div>

              {/* =============================================
                  AUTO GENERATE
              ============================================= */}

              <div
                style={{
                  ...styles.card,
                  padding: "21px",
                  background:
                    "linear-gradient(145deg, #172554 0%, #1e3a8a 100%)",
                  color: "#ffffff",
                  border:
                    "1px solid #1e40af",
                  boxShadow:
                    "0 14px 35px rgba(30,64,175,.15)",
                }}
              >
                <div
                  style={{
                    display:
                      "flex",
                    alignItems:
                      "center",
                    gap: "11px",
                    marginBottom:
                      "17px",
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius:
                        "11px",
                      background:
                        "rgba(255,255,255,.12)",
                      color:
                        "#bfdbfe",
                      display:
                        "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                    }}
                  >
                    <Icon
                      type="spark"
                      size={20}
                    />
                  </div>

                  <div>
                    <h3
                      style={{
                        margin:
                          0,
                        fontSize:
                          "16px",
                        fontWeight:
                          "800",
                      }}
                    >
                      Auto Generate
                    </h3>

                    <p
                      style={{
                        margin:
                          "3px 0 0",
                        color:
                          "#bfdbfe",
                        fontSize:
                          "11px",
                      }}
                    >
                      Automatically build
                      the remaining schedule.
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    padding:
                      "12px",
                    borderRadius:
                      "11px",
                    background:
                      "rgba(255,255,255,.08)",
                    marginBottom:
                      "14px",
                    fontSize:
                      "11px",
                    lineHeight:
                      "1.55",
                    color:
                      "#dbeafe",
                  }}
                >
                  The generator tries to
                  prevent teacher, room and
                  class clashes while keeping
                  existing lectures.
                </div>

                <label
                  style={{
                    display:
                      "flex",
                    gap: "9px",
                    alignItems:
                      "flex-start",
                    fontSize:
                      "11px",
                    color:
                      "#dbeafe",
                    marginBottom:
                      "15px",
                    cursor:
                      "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={
                      allowPartial
                    }
                    onChange={(e) =>
                      setAllowPartial(
                        e.target
                          .checked
                      )
                    }
                    style={{
                      marginTop:
                        "2px",
                    }}
                  />

                  <span>
                    Save what fits even
                    if some lectures cannot
                    be placed.
                  </span>
                </label>

                <div
                  style={{
                    display:
                      "grid",
                    gridTemplateColumns:
                      "1fr 1fr",
                    gap: "9px",
                  }}
                >
                  <button
                    type="button"
                    onClick={() =>
                      handleGenerate(
                        true
                      )
                    }
                    disabled={
                      generating
                    }
                    style={{
                      height:
                        "42px",
                      borderRadius:
                        "9px",
                      border:
                        "1px solid rgba(255,255,255,.25)",
                      background:
                        "rgba(255,255,255,.08)",
                      color:
                        "#ffffff",
                      fontWeight:
                        "750",
                      cursor:
                        "pointer",
                    }}
                  >
                    {generating
                      ? "Working..."
                      : "Preview"}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleGenerate(
                        false
                      )
                    }
                    disabled={
                      generating
                    }
                    style={{
                      height:
                        "42px",
                      borderRadius:
                        "9px",
                      border:
                        "none",
                      background:
                        "#ffffff",
                      color:
                        "#1e3a8a",
                      fontWeight:
                        "800",
                      cursor:
                        "pointer",
                    }}
                  >
                    {generating
                      ? "Generating..."
                      : "Generate"}
                  </button>
                </div>

                {genResult && (
                  <div
                    style={{
                      marginTop:
                        "15px",
                      padding:
                        "12px",
                      borderRadius:
                        "10px",
                      background:
                        "rgba(255,255,255,.09)",
                      fontSize:
                        "11px",
                      color:
                        "#dbeafe",
                    }}
                  >
                    <div
                      style={{
                        display:
                          "grid",
                        gridTemplateColumns:
                          "repeat(3, 1fr)",
                        gap: "7px",
                        marginBottom:
                          "9px",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            color:
                              "#93c5fd",
                          }}
                        >
                          Required
                        </div>
                        <strong>
                          {
                            genResult.totalRequiredLectures
                          }
                        </strong>
                      </div>

                      <div>
                        <div
                          style={{
                            color:
                              "#93c5fd",
                          }}
                        >
                          Scheduled
                        </div>
                        <strong>
                          {
                            genResult.scheduledLectures
                          }
                        </strong>
                      </div>

                      <div>
                        <div
                          style={{
                            color:
                              "#93c5fd",
                          }}
                        >
                          Remaining
                        </div>
                        <strong>
                          {
                            genResult.remainingLectures
                          }
                        </strong>
                      </div>
                    </div>

                    {genResult.dryRun && (
                      <div
                        style={{
                          color:
                            "#bfdbfe",
                        }}
                      >
                        Preview only —
                        nothing has been
                        saved.
                      </div>
                    )}

                    {genResult.unscheduledLectures
                      ?.length >
                      0 && (
                      <div
                        style={{
                          marginTop:
                            "9px",
                        }}
                      >
                        <strong>
                          Could not
                          schedule:
                        </strong>

                        <ul
                          style={{
                            margin:
                              "5px 0 0",
                            paddingLeft:
                              "17px",
                          }}
                        >
                          {genResult.unscheduledLectures.map(
                            (
                              u,
                              i
                            ) => (
                              <li
                                key={
                                  i
                                }
                              >
                                {
                                  u.subjectName
                                }{" "}
                                (
                                {
                                  u.lectureType
                                }
                                ):{" "}
                                {
                                  u.reason
                                }
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* =================================================
                WEEKLY TIMETABLE
            ================================================= */}

            <div
              style={{
                ...styles.card,
                overflow:
                  "hidden",
              }}
            >
              <div
                style={{
                  padding:
                    "21px 22px",
                  borderBottom:
                    "1px solid #edf1f6",
                  display:
                    "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "space-between",
                  gap: "15px",
                  flexWrap:
                    "wrap",
                }}
              >
                <div
                  style={{
                    display:
                      "flex",
                    alignItems:
                      "center",
                    gap: "11px",
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius:
                        "11px",
                      background:
                        "#f1f5f9",
                      color:
                        "#334155",
                      display:
                        "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                    }}
                  >
                    <Icon
                      type="calendar"
                      size={19}
                    />
                  </div>

                  <div>
                    <h3
                      style={{
                        margin:
                          0,
                        fontSize:
                          "17px",
                        fontWeight:
                          "800",
                      }}
                    >
                      Weekly Timetable
                    </h3>

                    <p
                      style={{
                        margin:
                          "3px 0 0",
                        color:
                          "#94a3b8",
                        fontSize:
                          "11px",
                      }}
                    >
                      {selectedBatchName}
                      {" • "}
                      Semester{" "}
                      {
                        summary.currentSemester
                      }
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    display:
                      "flex",
                    alignItems:
                      "center",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      display:
                        "flex",
                      alignItems:
                        "center",
                      gap: "6px",
                      fontSize:
                        "10px",
                      color:
                        "#64748b",
                      fontWeight:
                        "650",
                    }}
                  >
                    <span
                      style={{
                        width:
                          "8px",
                        height:
                          "8px",
                        borderRadius:
                          "50%",
                        background:
                          "#3b82f6",
                      }}
                    />
                    Theory
                  </div>

                  <div
                    style={{
                      display:
                        "flex",
                      alignItems:
                        "center",
                      gap: "6px",
                      fontSize:
                        "10px",
                      color:
                        "#64748b",
                      fontWeight:
                        "650",
                    }}
                  >
                    <span
                      style={{
                        width:
                          "8px",
                        height:
                          "8px",
                        borderRadius:
                          "50%",
                        background:
                          "#10b981",
                      }}
                    />
                    Practical
                  </div>
                </div>
              </div>

              {periodSlots.length ===
              0 ? (
                <div
                  style={{
                    padding:
                      "55px 25px",
                    textAlign:
                      "center",
                  }}
                >
                  <div
                    style={{
                      width:
                        "50px",
                      height:
                        "50px",
                      margin:
                        "0 auto 12px",
                      borderRadius:
                        "14px",
                      background:
                        "#f1f5f9",
                      color:
                        "#64748b",
                      display:
                        "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                    }}
                  >
                    <Icon
                      type="clock"
                      size={22}
                    />
                  </div>

                  <div
                    style={{
                      fontSize:
                        "15px",
                      fontWeight:
                        "800",
                      color:
                        "#475569",
                    }}
                  >
                    No time slots
                    configured
                  </div>

                  <p
                    style={{
                      margin:
                        "5px 0 0",
                      color:
                        "#94a3b8",
                      fontSize:
                        "11px",
                    }}
                  >
                    Add periods before
                    creating the
                    timetable.
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    overflowX:
                      "auto",
                  }}
                >
                  <table
                    style={{
                      width:
                        "100%",
                      minWidth:
                        "1120px",
                      borderCollapse:
                        "separate",
                      borderSpacing:
                        0,
                    }}
                  >
                    <thead>
                      <tr>
                        <th
                          style={{
                            width:
                              "125px",
                            padding:
                              "14px",
                            borderBottom:
                              "1px solid #e5e7eb",
                            borderRight:
                              "1px solid #e5e7eb",
                            background:
                              "#f8fafc",
                            color:
                              "#64748b",
                            textAlign:
                              "left",
                            fontSize:
                              "10px",
                            fontWeight:
                              "850",
                            textTransform:
                              "uppercase",
                            position:
                              "sticky",
                            left: 0,
                            zIndex: 3,
                          }}
                        >
                          Period
                        </th>

                        {DAYS.map(
                          (
                            day
                          ) => (
                            <th
                              key={
                                day
                              }
                              style={{
                                minWidth:
                                  "155px",
                                padding:
                                  "14px 12px",
                                borderBottom:
                                  "1px solid #e5e7eb",
                                borderRight:
                                  "1px solid #e5e7eb",
                                background:
                                  "#f8fafc",
                                color:
                                  "#334155",
                                textAlign:
                                  "left",
                                fontSize:
                                  "11px",
                                fontWeight:
                                  "800",
                              }}
                            >
                              {day}
                            </th>
                          )
                        )}
                      </tr>
                    </thead>

                    <tbody>
                      {periodSlots.map(
                        (
                          slot
                        ) => (
                          <tr
                            key={
                              slot.periodNo
                            }
                          >
                            <td
                              style={{
                                padding:
                                  "13px",
                                borderBottom:
                                  "1px solid #edf1f5",
                                borderRight:
                                  "1px solid #edf1f5",
                                background:
                                  "#fbfcfe",
                                verticalAlign:
                                  "top",
                                position:
                                  "sticky",
                                left: 0,
                                zIndex: 2,
                              }}
                            >
                              <div
                                style={{
                                  fontSize:
                                    "12px",
                                  fontWeight:
                                    "800",
                                  color:
                                    "#334155",
                                  lineHeight:
                                    "1.35",
                                }}
                              >
                                {slot.label}
                              </div>

                              <div
                                style={{
                                  marginTop:
                                    "4px",
                                  color:
                                    "#94a3b8",
                                  fontSize:
                                    "9px",
                                  fontWeight:
                                    "600",
                                }}
                              >
                                SLOT{" "}
                                {
                                  slot.periodNo
                                }
                              </div>
                            </td>

                            {DAYS.map(
                              (
                                day
                              ) => {
                                const entry =
                                  timetableByKey[
                                    `${day}-${slot.periodNo}`
                                  ];

                                const practical =
                                  entry?.lectureType ===
                                  "practical";

                                return (
                                  <td
                                    key={`${day}-${slot.periodNo}`}
                                    style={{
                                      padding:
                                        "8px",
                                      borderBottom:
                                        "1px solid #edf1f5",
                                      borderRight:
                                        "1px solid #edf1f5",
                                      verticalAlign:
                                        "top",
                                      background:
                                        "#ffffff",
                                    }}
                                  >
                                    {entry ? (
                                      <div
                                        style={{
                                          minHeight:
                                            "128px",
                                          padding:
                                            "11px",
                                          borderRadius:
                                            "11px",
                                          background:
                                            practical
                                              ? "#f0fdf4"
                                              : "#eff6ff",
                                          border:
                                            practical
                                              ? "1px solid #bbf7d0"
                                              : "1px solid #bfdbfe",
                                          position:
                                            "relative",
                                          overflow:
                                            "hidden",
                                        }}
                                      >
                                        <div
                                          style={{
                                            position:
                                              "absolute",
                                            left:
                                              0,
                                            top:
                                              0,
                                            bottom:
                                              0,
                                            width:
                                              "3px",
                                            background:
                                              practical
                                                ? "#10b981"
                                                : "#3b82f6",
                                          }}
                                        />

                                        <div
                                          style={{
                                            display:
                                              "flex",
                                            alignItems:
                                              "center",
                                            justifyContent:
                                              "space-between",
                                            gap:
                                              "5px",
                                            marginBottom:
                                              "7px",
                                          }}
                                        >
                                          <span
                                            style={{
                                              padding:
                                                "3px 6px",
                                              borderRadius:
                                                "5px",
                                              background:
                                                practical
                                                  ? "#dcfce7"
                                                  : "#dbeafe",
                                              color:
                                                practical
                                                  ? "#166534"
                                                  : "#1d4ed8",
                                              fontSize:
                                                "8px",
                                              fontWeight:
                                                "850",
                                              textTransform:
                                                "uppercase",
                                            }}
                                          >
                                            {practical
                                              ? "Practical"
                                              : "Theory"}
                                          </span>
                                        </div>

                                        <div
                                          style={{
                                            fontSize:
                                              "12px",
                                            fontWeight:
                                              "800",
                                            color:
                                              "#172033",
                                            lineHeight:
                                              "1.35",
                                          }}
                                        >
                                          {entry
                                            .semesterSubjectId
                                            ?.subjectId
                                            ?.name ||
                                            "Subject"}
                                        </div>

                                        <div
                                          style={{
                                            marginTop:
                                              "4px",
                                            color:
                                              practical
                                                ? "#059669"
                                                : "#2563eb",
                                            fontSize:
                                              "10px",
                                            fontWeight:
                                              "800",
                                          }}
                                        >
                                          {entry
                                            .semesterSubjectId
                                            ?.subjectId
                                            ?.code ||
                                            "N/A"}
                                        </div>

                                        <div
                                          style={{
                                            marginTop:
                                              "9px",
                                            display:
                                              "grid",
                                            gap:
                                              "4px",
                                          }}
                                        >
                                          <div
                                            style={{
                                              fontSize:
                                                "9px",
                                              color:
                                                "#475569",
                                              lineHeight:
                                                "1.35",
                                            }}
                                          >
                                            <strong>
                                              Teacher:
                                            </strong>{" "}
                                            {entry
                                              .teacherId
                                              ?.userId
                                              ?.name ||
                                              "Unknown"}
                                          </div>

                                          <div
                                            style={{
                                              fontSize:
                                                "9px",
                                              color:
                                                "#475569",
                                              lineHeight:
                                                "1.35",
                                            }}
                                          >
                                            <strong>
                                              Room:
                                            </strong>{" "}
                                            {entry
                                              .roomId
                                              ?.name ||
                                              "N/A"}
                                          </div>
                                        </div>

                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleDeleteEntry(
                                              entry._id
                                            )
                                          }
                                          style={{
                                            marginTop:
                                              "9px",
                                            height:
                                              "27px",
                                            padding:
                                              "0 8px",
                                            border:
                                              "1px solid #fecaca",
                                            borderRadius:
                                              "6px",
                                            background:
                                              "#fff1f2",
                                            color:
                                              "#dc2626",
                                            fontSize:
                                              "9px",
                                            fontWeight:
                                              "800",
                                            cursor:
                                              "pointer",
                                            display:
                                              "inline-flex",
                                            alignItems:
                                              "center",
                                            gap:
                                              "4px",
                                          }}
                                        >
                                          <Icon
                                            type="trash"
                                            size={
                                              11
                                            }
                                          />
                                          Delete
                                        </button>
                                      </div>
                                    ) : (
                                      <div
                                        style={{
                                          minHeight:
                                            "128px",
                                          display:
                                            "flex",
                                          alignItems:
                                            "center",
                                          justifyContent:
                                            "center",
                                          borderRadius:
                                            "10px",
                                          border:
                                            "1px dashed #dbe2ea",
                                          background:
                                            "#fcfdff",
                                          color:
                                            "#b0bac8",
                                          fontSize:
                                            "9px",
                                          fontWeight:
                                            "600",
                                        }}
                                      >
                                        Available
                                      </div>
                                    )}
                                  </td>
                                );
                              }
                            )}
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* =====================================================
            NO DATA
        ===================================================== */}

        {!summary &&
          !summaryLoading &&
          selectedBatchId &&
          !loading && (
            <div
              style={{
                ...styles.card,
                padding:
                  "55px 25px",
                textAlign:
                  "center",
              }}
            >
              <div
                style={{
                  width:
                    "58px",
                  height:
                    "58px",
                  margin:
                    "0 auto 14px",
                  borderRadius:
                    "16px",
                  background:
                    "#f1f5f9",
                  color:
                    "#64748b",
                  display:
                    "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                }}
              >
                <Icon
                  type="calendar"
                  size={25}
                />
              </div>

              <h3
                style={{
                  margin:
                    "0 0 6px",
                  fontSize:
                    "17px",
                  fontWeight:
                    "800",
                  color:
                    "#334155",
                }}
              >
                No timetable data found
              </h3>

              <p
                style={{
                  margin: 0,
                  color:
                    "#94a3b8",
                  fontSize:
                    "12px",
                }}
              >
                There is currently no
                timetable information
                available for this batch.
              </p>
            </div>
          )}

        {!selectedBatchId &&
          !loading && (
            <div
              style={{
                ...styles.card,
                padding:
                  "60px 25px",
                textAlign:
                  "center",
              }}
            >
              <div
                style={{
                  width:
                    "58px",
                  height:
                    "58px",
                  margin:
                    "0 auto 14px",
                  borderRadius:
                    "16px",
                  background:
                    "#eff6ff",
                  color:
                    "#2563eb",
                  display:
                    "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                }}
              >
                <Icon
                  type="calendar"
                  size={25}
                />
              </div>

              <h3
                style={{
                  margin:
                    "0 0 6px",
                  fontSize:
                    "17px",
                  fontWeight:
                    "800",
                  color:
                    "#334155",
                }}
              >
                Select a batch
              </h3>

              <p
                style={{
                  margin: 0,
                  color:
                    "#94a3b8",
                  fontSize:
                    "12px",
                }}
              >
                Choose a batch above to
                view and manage its
                timetable.
              </p>
            </div>
          )}
      </div>

      {/* =====================================================
          ANIMATIONS / RESPONSIVE
      ===================================================== */}

      <style>
        {`
          @keyframes tmSpin {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }

          select:focus {
            border-color: #2563eb !important;
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.10);
          }

          select:hover {
            border-color: #b8c2d1;
          }

          button {
            transition:
              transform .18s ease,
              box-shadow .18s ease,
              opacity .18s ease;
          }

          button:not(:disabled):hover {
            transform: translateY(-1px);
          }

          button:disabled {
            cursor: not-allowed !important;
          }

          @media (max-width: 768px) {
            .timetable-page {
              padding: 16px !important;
            }
          }

          @media (max-width: 520px) {
            body {
              overflow-x: hidden;
            }
          }
        `}
      </style>
    </div>
  );
}
