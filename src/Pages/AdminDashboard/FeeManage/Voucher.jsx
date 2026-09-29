import React, { useEffect, useMemo, useState } from "react";
import {
  User, Users, Building2, Search, ChevronDown, Plus, Trash2,
  RefreshCw, CheckCircle, AlertCircle, FileText, Printer, X, Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import FeeAPI, { unwrap } from "../../../services/feeService";
import "./Voucher.css";
import "./VoucherPreview.css";

const API = FeeAPI;
// const API = axios.create({
//   baseURL: import.meta.env.VITE_API_URL,
// });
const getTokenConfig = () => ({});
// const getTokenConfig = () => {
//   const token = localStorage.getItem("adminToken");

//   return token
//     ? {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     : {};
// };

/* =========================================================
   HELPERS
========================================================= */

// const unwrap = (response) => {
//   const body = response?.data;

//   if (!body) return null;

//   if (body.success === false) {
//     throw new Error(body.message || "Request failed.");
//   }

//   return body.data ?? body;
// };

const getArray = (response) => {
  const data = unwrap(response);

  if (Array.isArray(data)) return data;

  if (Array.isArray(data?.students)) return data.students;
  if (Array.isArray(data?.departments)) return data.departments;
  if (Array.isArray(data?.degreeClasses)) return data.degreeClasses;
  if (Array.isArray(data?.shifts)) return data.shifts;
  if (Array.isArray(data?.batches)) return data.batches;
  if (Array.isArray(data?.feeTypes)) return data.feeTypes;
  if (Array.isArray(data?.fineTypes)) return data.fineTypes;

  return [];
};

const getErrorMessage = (error) => {
  return (
    error?.response?.data?.message ||
    error?.message ||
    "Something went wrong. Please try again."
  );
};

const getId = (item) => item?._id || item?.id;

const getName = (item) =>
  item?.name ||
  item?.title ||
  item?.fullName ||
  item?.studentName ||
  "Unnamed";

const formatMoney = (amount) => {
  const value = Number(amount || 0);

  return `PKR ${value.toLocaleString()}`;
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

const Voucher = () => {
  const [activeFlow, setActiveFlow] = useState("single");

  const [loading, setLoading] = useState(false);
  const [pageError, setPageError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [previewVoucher, setPreviewVoucher] = useState(null);

  /* =======================================================
     SUPPORTING DATA
  ======================================================= */

  const [departments, setDepartments] = useState([]);
  const [degreeClasses, setDegreeClasses] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [feeTypes, setFeeTypes] = useState([]);
  const [fineTypes, setFineTypes] = useState([]);

  const [supportLoading, setSupportLoading] = useState(false);

  /* =======================================================
     COMMON FEE OPTIONS
  ======================================================= */

  const [includeTransport, setIncludeTransport] = useState(false);
  const [transportFeeTypeId, setTransportFeeTypeId] = useState("");

  const [customItems, setCustomItems] = useState([]);

  const [payDueDate, setPayDueDate] = useState("");
  const [fineDueDate, setFineDueDate] = useState("");
  const [fineTypeId, setFineTypeId] = useState("");

  /* =======================================================
     SINGLE STUDENT
  ======================================================= */

  const [studentSearch, setStudentSearch] = useState("");
  const [students, setStudents] = useState([]);
  const [studentSearchLoading, setStudentSearchLoading] = useState(false);

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [enrollment, setEnrollment] = useState(null);

  const [tuitionFee, setTuitionFee] = useState(null);
  const [tuitionLoading, setTuitionLoading] = useState(false);

  /* =======================================================
     BATCH BULK
  ======================================================= */

  const [batchDepartmentId, setBatchDepartmentId] = useState("");
  const [batchDegreeClassId, setBatchDegreeClassId] = useState("");
  const [batchShiftId, setBatchShiftId] = useState("");

  const [matchedBatch, setMatchedBatch] = useState(null);
  const [batchReport, setBatchReport] = useState(null);

  const [batchLoading, setBatchLoading] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);

  /* =======================================================
     DEPARTMENT BULK
  ======================================================= */

  const [departmentId, setDepartmentId] = useState("");
  const [departmentBatches, setDepartmentBatches] = useState([]);
  const [departmentLoading, setDepartmentLoading] = useState(false);

  const [departmentResult, setDepartmentResult] = useState(null);
  const [batchResult, setBatchResult] = useState(null);

  /* =======================================================
     INITIAL SUPPORTING DATA
  ======================================================= */

  useEffect(() => {
    loadSupportingData();
  }, []);

 const loadSupportingData = async () => {
  try {
    setSupportLoading(true);
    setPageError("");

    const [
      departmentsResponse,
      feeTypesResponse,
      fineTypesResponse,
    ] = await Promise.all([
      API.get("/api/departments", getTokenConfig()),
      API.get("/api/fee-type", getTokenConfig()), // ✅ REAL API
      API.get("/api/fine-types", getTokenConfig()),
    ]);

    setDepartments(getArray(departmentsResponse) || []);
    setFeeTypes(getArray(feeTypesResponse) || []);
    setFineTypes(getArray(fineTypesResponse) || []);

  } catch (error) {
    console.error("Supporting data error:", error);
    setPageError(getErrorMessage(error));

    // ✅ Never allow undefined
    setDepartments([]);
    setFeeTypes([]);
    setFineTypes([]);
  } finally {
    setSupportLoading(false);
  }
};

  /* =======================================================
     CLEAR MESSAGES
  ======================================================= */

  const clearMessages = () => {
    setPageError("");
    setSuccessMessage("");
  };

  /* =======================================================
     STUDENT SEARCH
  ======================================================= */

useEffect(() => {
  if (activeFlow !== "single") return;

  const search = studentSearch.trim();
  if (!search) {
    setStudents([]);
    return;
  }

  const timer = setTimeout(async () => {
    try {
      setStudentSearchLoading(true);
      setPageError("");

      // ✅ Applications endpoint use karo — approved students
      const response = await FeeAPI.get(
        "/api/students/admin/applications/",
        {
          params: {
            status: "approved",
            search: search,
            limit: 50,
          },
        }
      );

      const data =
        response?.data?.applications ||
        response?.data?.data ||
        response?.data ||
        [];

      // Map application → student shape (jo Voucher.jsx expect karta hai)
  const mapped = Array.isArray(data)
  ? data.map((app) => {
      const stu = app?.student || {};
      const p = stu?.personalInfo || {};

      return {
        _id: stu?._id || stu,
        name: `${p.firstName || ""} ${p.lastName || ""}`.trim() || stu?.email || "Student",
        email: stu?.email || "—",
        cnic: p?.cnic || "—",                    // 👈 add
        fatherName: p?.fatherName || "—",         // 👈 add
        phoneNo: p?.phoneNo || "—",               // 👈 add
        rollNo: app?.rollNo || "—",
        registrationNo: app?.registrationNo || "—",
        section: app?.section || "—",

        // 👇 YE POORA APPLICATION SAVE KARO
        _raw: app,
      };
    })
  : [];
  // Search karte waqt ye chalao
const app = students[0]?._raw;
console.log("_raw.batchId:", app?.batchId);
console.log("_raw.batchId.departmentId:", app?.batchId?.departmentId);
console.log("FULL APPLICATION:", JSON.stringify(students[0]?._raw, null, 2));
console.log(JSON.stringify(students[0]?._raw, null, 2));
// 1) students array check karo
console.log("STUDENTS ARRAY:", students);
console.log("LENGTH:", students?.length);

// 2) pehla element
console.log("FIRST STUDENT:", students[0]);

// 3) uske saare keys
console.log("KEYS:", students[0] ? Object.keys(students[0]) : "empty");
console.log("SELECTED:", selectedStudent);
console.log("SELECTED._raw:", selectedStudent?._raw);
console.log("SELECTED._raw.batchId:", selectedStudent?._raw?.batchId);
console.log("ENROLLMENT:", enrollment);

      setStudents(mapped);
    } catch (error) {
      setPageError(getErrorMessage(error));
      setStudents([]);
    } finally {
      setStudentSearchLoading(false);
    }
  }, 400);

  return () => clearTimeout(timer);
}, [studentSearch, activeFlow]);

  /* =======================================================
     SELECT STUDENT
  ======================================================= */

const handleSelectStudent = async (student) => {
  try {
    clearMessages();

    setSelectedStudent(student);
    setStudents([]);
    setStudentSearch(student?.name || "");
    setTuitionFee(null);
    setLoading(true);

    const raw = student?._raw || {};
    const snapshot = raw?.enrollmentSnapshot || {};

    // 👇 batchId ke andar dept/class/shift FLATTEN karo
    const batch = {
      _id: raw?.batchId?._id || raw?.batchId?.id || null,
      name: raw?.batchId?.name || null,

      // Ye 3 application ke TOP-LEVEL pe hain, batchId ke andar nahi
      departmentId: raw?.departmentId || null,
      degreeClassId: raw?.degreeClassId || null,
      shiftId: raw?.shiftId || null,
      campusId: raw?.campusId || null,

      currentSemester:
        raw?.batchId?.currentSemester || 1,
      totalSemesters:
        raw?.batchId?.totalSemesters || 4,
    };

    const enrollmentData = {
      _id: raw?._id || null,
      studentId: raw?.student || null,
      batchId: batch,
      currentSemester: batch.currentSemester,
      totalSemesters: batch.totalSemesters,
      status: "active",
      rollNo: raw?.rollNo || student?.rollNo,
      registrationNo: raw?.registrationNo || student?.registrationNo,
      section: raw?.section || student?.section,
      quota: snapshot?.quota || "Open Merit",
    };

    setEnrollment(enrollmentData);

    // Tuition fee load karo
    if (
      batch?.departmentId?._id &&
      batch?.degreeClassId?._id &&
      batch?.shiftId?._id
    ) {
      await loadStudentTuitionFee({ batchId: batch });
    }
  } catch (error) {
    setPageError(getErrorMessage(error));
  } finally {
    setLoading(false);
  }
};

  /* =======================================================
     STUDENT TUITION FEE
  ======================================================= */

  const loadStudentTuitionFee = async (enroll) => {
    try {
      setTuitionLoading(true);

      const batch = enroll?.batchId;

      const departmentId =
        batch?.department?._id ||
        batch?.departmentId?._id ||
        batch?.departmentId;

      const degreeClassId =
        batch?.degreeClass?._id ||
        batch?.degreeClassId?._id ||
        batch?.degreeClassId;

      const shiftId =
        batch?.shift?._id ||
        batch?.shiftId?._id ||
        batch?.shiftId;

      if (!departmentId || !degreeClassId || !shiftId) {
        throw new Error(
          "Batch department, degree class or shift information is missing."
        );
      }

      const response = await API.get(
        `/api/tuition-fees?departmentId=${departmentId}&degreeClassId=${degreeClassId}&shiftId=${shiftId}`,
        getTokenConfig()
      );

      const data = unwrap(response);

      let fee = data;

      if (Array.isArray(data)) {
        fee = data[0];
      }

      if (Array.isArray(data?.tuitionFees)) {
        fee = data.tuitionFees[0];
      }

      setTuitionFee(fee || null);
    } catch (error) {
      setPageError(getErrorMessage(error));
      setTuitionFee(null);
    } finally {
      setTuitionLoading(false);
    }
  };

  /* =======================================================
     DEPARTMENT CHANGE FOR BATCH
  ======================================================= */

  const handleBatchDepartmentChange = async (value) => {
    clearMessages();

    setBatchDepartmentId(value);

    setBatchDegreeClassId("");
    setBatchShiftId("");

    setDegreeClasses([]);
    setShifts([]);

    setMatchedBatch(null);
    setBatchReport(null);

    if (!value) return;

    try {
      setBatchLoading(true);

      const response = await API.get(
        `/api/degree-classes?departmentId=${value}`,
        getTokenConfig()
      );

      setDegreeClasses(getArray(response));
    } catch (error) {
      setPageError(getErrorMessage(error));
    } finally {
      setBatchLoading(false);
    }
  };

  /* =======================================================
     DEGREE CLASS CHANGE
  ======================================================= */

  const handleDegreeClassChange = async (value) => {
    clearMessages();

    setBatchDegreeClassId(value);

    setBatchShiftId("");

    setShifts([]);

    setMatchedBatch(null);
    setBatchReport(null);

    if (!value) return;

    try {
      setBatchLoading(true);

      const response = await API.get(
        `/api/shifts?degreeClassId=${value}`,
        getTokenConfig()
      );

      setShifts(getArray(response));
    } catch (error) {
      setPageError(getErrorMessage(error));
    } finally {
      setBatchLoading(false);
    }
  };

  /* =======================================================
     SHIFT CHANGE => FIND ONGOING BATCH
  ======================================================= */

  const handleShiftChange = async (value) => {
    clearMessages();

    setBatchShiftId(value);
    setMatchedBatch(null);
    setBatchReport(null);

    if (!value) return;

    try {
      setBatchLoading(true);

      const response = await API.get(
  `/api/batches?departmentId=${batchDepartmentId}&degreeClassId=${batchDegreeClassId}&shiftId=${value}&status=active`,
  getTokenConfig()
);

      const batches = getArray(response);

      if (!batches.length) {
        throw new Error(
          "No active batch found for the selected Department, Degree Class and Shift."
        );
      }

      if (batches.length > 1) {
        setMatchedBatch(batches[0]);

        setPageError(
          "Multiple ongoing batches matched. The first ongoing batch is selected."
        );
      } else {
        setMatchedBatch(batches[0]);
      }

      await loadBatchReport(batches[0]);
    } catch (error) {
      setPageError(getErrorMessage(error));
    } finally {
      setBatchLoading(false);
    }
  };

  /* =======================================================
     BATCH REPORT
  ======================================================= */

  const loadBatchReport = async (batch = matchedBatch) => {
    if (!batch) return;

    try {
      setReportLoading(true);

      const batchId = getId(batch);

      const semester =
        batch?.currentSemester ??
        batch?.semester ??
        batch?.current_semester;

      if (semester === undefined || semester === null) {
        throw new Error(
          "Current semester is missing from the selected batch."
        );
      }

      const response = await API.get(
        `/api/vouchers/report?batchId=${batchId}&semester=${semester}`,
        getTokenConfig()
      );

      const report = unwrap(response);

      setBatchReport(report);
    } catch (error) {
      setPageError(getErrorMessage(error));
    } finally {
      setReportLoading(false);
    }
  };

  /* =======================================================
     DEPARTMENT CHANGE
  ======================================================= */

  const handleDepartmentChange = async (value) => {
    clearMessages();

    setDepartmentId(value);
    setDepartmentBatches([]);
    setDepartmentResult(null);

    if (!value) return;

    try {
      setDepartmentLoading(true);

    // Backend's bulkCreateVoucherForDepartment only processes
    // batches with status "ongoing" — match that here so the list
    // shown matches what will actually be vouchered.
    const response = await API.get(
  `/api/batches?departmentId=${value}&status=ongoing`,
  getTokenConfig()
);

      setDepartmentBatches(getArray(response));
    } catch (error) {
      setPageError(getErrorMessage(error));
    } finally {
      setDepartmentLoading(false);
    }
  };

  /* =======================================================
     CUSTOM ITEMS
  ======================================================= */

  const addCustomItem = () => {
    setCustomItems((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: "",
        amount: "",
      },
    ]);
  };

  const updateCustomItem = (id, field, value) => {
    setCustomItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  const removeCustomItem = (id) => {
    setCustomItems((prev) =>
      prev.filter((item) => item.id !== id)
    );
  };

  /* =======================================================
     TRANSPORT
  ======================================================= */

const transportTypes = useMemo(() => {
  return (feeTypes || []).filter((item) => {
    const name = String(
      item?.name || item?.type || item?.title || ""
    ).toLowerCase();

    return (
      name.includes("transport") ||
      name.includes("bus")
    );
  });
}, [feeTypes]);

  const handleTransportChange = (checked) => {
    setIncludeTransport(checked);

    if (!checked) {
      setTransportFeeTypeId("");
    }
  };

  /* =======================================================
     COMMON VALIDATION
  ======================================================= */

  const validateCommonFields = () => {
    if (!payDueDate) {
      setPageError("Pay Due Date is required.");
      return false;
    }

    if (!fineDueDate) {
      setPageError("Fine Due Date is required.");
      return false;
    }

    if (includeTransport && !transportFeeTypeId) {
      setPageError(
        "Please select a Transport Fee Type or disable Include Transport Fee."
      );
      return false;
    }

    for (const item of customItems) {
      if (!item.name.trim()) {
        setPageError("Custom item name is required.");
        return false;
      }

      if (
        item.amount === "" ||
        Number(item.amount) < 0
      ) {
        setPageError(
          "Custom item amount must be a valid number."
        );
        return false;
      }
    }

    return true;
  };

  /* =======================================================
     COMMON PAYLOAD
  ======================================================= */

  const getCommonPayload = () => {
    const payload = {
      payDueDate,
      fineDueDate,
      includeTransport,
    };

    if (fineTypeId) {
      payload.fineTypeId = fineTypeId;
    }

    if (includeTransport) {
      payload.transportFeeTypeId = transportFeeTypeId;
    }

    return payload;
  };

   /* =======================================================
     SINGLE VOUCHER
  ======================================================= */

  const generateSingleVoucher = async () => {
    clearMessages();

    if (!selectedStudent) {
      setPageError("Please select a student.");
      return;
    }

    if (!enrollment) {
      setPageError("Student enrollment information is not available.");
      return;
    }

    if (!validateCommonFields()) return;

    const raw = selectedStudent?._raw || {};
    const batch = raw?.batchId || enrollment?.batchId;

    const semester =
      batch?.currentSemester ??
      enrollment?.currentSemester ??
      1;

    const studentMongoId =
      raw?.student?._id ||
      raw?.student ||
      selectedStudent?._id;

    if (!studentMongoId) {
      setPageError("Student ID not found.");
      return;
    }

    const customItemsPayload = customItems.map(
      ({ name, amount }) => ({
        name: name.trim(),
        amount: Number(amount),
      })
    );

    try {
      setLoading(true);

      // NOTE: backend always resolves `semester` from the batch's
      // currentSemester itself — it ignores/ does not accept it in
      // the body, so it's intentionally left out of this payload.
      const payload = {
        studentId: studentMongoId,
        ...getCommonPayload(),
        customItems: customItemsPayload,
      };

      const response = await API.post(
        "/api/vouchers",
        payload,
        getTokenConfig()
      );

      const result = unwrap(response);

      // Backend returns { voucher, items } — flatten before using
      const createdVoucher = result?.voucher || result;
      const createdItems = Array.isArray(result?.items) ? result.items : [];

      setSuccessMessage(
        `Voucher ${createdVoucher?.voucherNo || ""} created successfully.`
      );

console.log("=== DEBUG PREVIEW ===");
console.log("raw.student:", raw?.student);
console.log("raw.student.personalInfo:", raw?.student?.personalInfo);
console.log("selectedStudent:", selectedStudent);

     setPreviewVoucher({
  ...createdVoucher,
  items: createdItems,
  student: raw?.student || selectedStudent,
  selectedStudent,
  enrollment,
  batch: enrollment?.batchId || batch,  // 👈 enrollment se lo (already flattened)
  department: enrollment?.batchId?.departmentId,
  degreeClass: enrollment?.batchId?.degreeClassId,
  shift: enrollment?.batchId?.shiftId,
  campus: enrollment?.batchId?.campusId,
  semester: createdVoucher?.semester ?? enrollment?.batchId?.currentSemester ?? 1,
  tuitionFee,
});
    } catch (error) {
      setPageError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     BATCH BULK
  ======================================================= */

  const generateBatchVoucher = async () => {
    clearMessages();

    if (!matchedBatch) {
      setPageError("Please select a valid ongoing batch.");
      return;
    }

    if (!validateCommonFields()) return;

    const semester =
      matchedBatch?.currentSemester ??
      matchedBatch?.semester;

    if (semester === undefined || semester === null) {
      setPageError(
        "Current semester could not be detected from batch."
      );
      return;
    }

    try {
      setLoading(true);

      const payload = {
        batchId: getId(matchedBatch),
        semester,
        ...getCommonPayload(),
      };

      const response = await API.post(
        "/api/vouchers/bulk/batch",
        payload,
        getTokenConfig()
      );

      const result = unwrap(response);

      setBatchResult(result);

      const created = result?.created?.length || 0;
      const skipped = result?.skipped?.length || 0;
      const failed = result?.failed?.length || 0;

      setSuccessMessage(
        `${created} vouchers created, ${skipped} already existed, ${failed} failed.`
      );

      await loadBatchReport(matchedBatch);
    } catch (error) {
      setPageError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     DEPARTMENT BULK
  ======================================================= */

  /* =======================================================
   DEPARTMENT BULK
======================================================= */

const generateDepartmentVoucher = async () => {
  clearMessages();

  if (!departmentId) {
    setPageError("Please select a department.");
    return;
  }

  if (!departmentBatches.length) {
    setPageError(
      "No ongoing batches found in this department."
    );
    return;
  }

  if (!validateCommonFields()) return;

  const semester = departmentBatches[0]?.currentSemester;

  if (
    semester === undefined ||
    semester === null
  ) {
    setPageError(
      "Current semester could not be detected from department batches."
    );
    return;
  }

  try {
    setLoading(true);

    const payload = {
      departmentId,
      semester: Number(semester),
      ...getCommonPayload(),
    };

    console.log(
      "Department Voucher Payload:",
      payload
    );

    const response = await API.post(
      "/api/vouchers/bulk/department",
      payload,
      getTokenConfig()
    );

    const result = unwrap(response);

    setDepartmentResult(result);

    const created =
      result?.created?.length || 0;

    const skipped =
      result?.skipped?.length || 0;

    const failed =
      result?.failed?.length || 0;

    setSuccessMessage(
      `${created} vouchers created across ${departmentBatches.length} batches, ${skipped} skipped, ${failed} failed.`
    );

    // Refresh department batches
    const refreshResponse = await API.get(
      `/api/batches?departmentId=${departmentId}&status=ongoing`,
      getTokenConfig()
    );

    setDepartmentBatches(
      getArray(refreshResponse)
    );

  } catch (error) {
    console.error(
      "Department voucher generation error:",
      error
    );

    setPageError(
      getErrorMessage(error)
    );
  } finally {
    setLoading(false);
  }
};

  /* =======================================================
     RESET
  ======================================================= */

  const resetForm = () => {
    setSelectedStudent(null);
    setStudentSearch("");
    setStudents([]);
    setEnrollment(null);
    setTuitionFee(null);

    setBatchDepartmentId("");
    setBatchDegreeClassId("");
    setBatchShiftId("");
    setMatchedBatch(null);
    setBatchReport(null);

    setDepartmentId("");
    setDepartmentBatches([]);

    setIncludeTransport(false);
    setTransportFeeTypeId("");
    setCustomItems([]);
    setPayDueDate("");
    setFineDueDate("");
    setFineTypeId("");

    setBatchResult(null);
    setDepartmentResult(null);
    setPreviewVoucher(null);

    clearMessages();
  };

  /* =======================================================
     RENDER
  ======================================================= */
  console.log("ENROLLMENT.batchId:", enrollment?.batchId);
console.log("ENROLLMENT.batchId.departmentId:", enrollment?.batchId?.departmentId);
console.log("DEPARTMENT NAME:", enrollment?.batchId?.departmentId?.name);

  return (
    <div className="voucher-page">
      <div className="voucher-header">
        <div>
          <div className="voucher-title-row">
            <div className="voucher-title-icon">
              <FileText size={24} />
            </div>

            <div>
              <h1>Voucher Generation</h1>
              <p>
                Create student fee vouchers automatically using
                enrollment and batch information.
              </p>
            </div>
          </div>
        </div>

        <button
          className="voucher-reset-btn"
          onClick={resetForm}
        >
          <RefreshCw size={16} />
          Reset
        </button>
      </div>

      {/* ALERTS */}

      {pageError && (
        <div className="voucher-alert error">
          <AlertCircle size={20} />
          <span>{pageError}</span>

          <button onClick={() => setPageError("")}>
            <X size={17} />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="voucher-alert success">
          <CheckCircle size={20} />
          <span>{successMessage}</span>

          <button onClick={() => setSuccessMessage("")}>
            <X size={17} />
          </button>
        </div>
      )}

      {/* FLOW TABS */}

      <div className="voucher-flow-tabs">
        <button
          className={activeFlow === "single" ? "active" : ""}
          onClick={() => {
            clearMessages();
            setActiveFlow("single");
          }}
        >
          <User size={18} />
          <div>
            <strong>Single Student</strong>
            <span>Generate one voucher</span>
          </div>
        </button>

        <button
          className={activeFlow === "batch" ? "active" : ""}
          onClick={() => {
            clearMessages();
            setActiveFlow("batch");
          }}
        >
          <Users size={18} />
          <div>
            <strong>Batch Bulk</strong>
            <span>Generate for entire class</span>
          </div>
        </button>

        <button
          className={
            activeFlow === "department" ? "active" : ""
          }
          onClick={() => {
            clearMessages();
            setActiveFlow("department");
          }}
        >
          <Building2 size={18} />
          <div>
            <strong>Department Bulk</strong>
            <span>Generate across batches</span>
          </div>
        </button>
      </div>

      {/* ===================================================
          SINGLE
      =================================================== */}

      {activeFlow === "single" && (
        <div className="voucher-layout">
          <div className="voucher-main-card">
            <div className="voucher-card-header">
              <div>
                <h2>Single Student Voucher</h2>
                <p>
                  Select a student. Enrollment and semester
                  information will be detected automatically.
                </p>
              </div>
            </div>

            {/* Student Search */}

            <div className="voucher-section">
              <label>Student</label>

              <div className="student-search-box">
                <Search size={18} />

                <input
                  value={studentSearch}
                  onChange={(e) => {
                    setStudentSearch(e.target.value);
                    setSelectedStudent(null);
                    setEnrollment(null);
                    setTuitionFee(null);
                  }}
                  placeholder="Search student by name, roll number..."
                />

                {studentSearchLoading && (
                  <Loader2
                    size={18}
                    className="spin"
                  />
                )}
              </div>

              {students.length > 0 && (
                <div className="student-results">
                  {students.map((student) => (
                    <button
                      key={getId(student)}
                      onClick={() =>
                        handleSelectStudent(student)
                      }
                    >
                      <div className="student-result-avatar">
                        {(
                          student?.name ||
                          student?.fullName ||
                          student?.firstName ||
                          "S"
                        )
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div>
                        <strong>
                          {student?.name ||
                            student?.fullName ||
                            `${student?.firstName || ""} ${
                              student?.lastName || ""
                            }`}
                        </strong>

                        <span>
                          {student?.rollNo ||
                            student?.registrationNo ||
                            student?.studentId ||
                            "Student"}
                        </span>
                      </div>

                      <ChevronDown
                        size={17}
                        className="result-arrow"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Enrollment */}

            {enrollment && (
              <div className="auto-info-card">
                <div className="auto-info-header">
                  <CheckCircle size={18} />
                  <strong>
                    Enrollment detected automatically
                  </strong>
                </div>

                <div className="auto-info-grid">
                  <InfoItem
  label="Department"
  value={enrollment?.batchId?.departmentId?.name || "—"}
/>

 

<InfoItem
  label="Degree Class"
  value={enrollment?.batchId?.degreeClassId?.name || "—"}
/>

<InfoItem
  label="Shift"
  value={enrollment?.batchId?.shiftId?.name || "—"}
/>

<InfoItem
  label="Current Semester"
  value={
    enrollment?.currentSemester ??
    enrollment?.batchId?.currentSemester ??
    "—"
  }
  highlight
/>

<InfoItem
  label="Total Semesters"
  value={
    enrollment?.totalSemesters ??
    enrollment?.batchId?.totalSemesters ??
    "—"
  }
/>
                </div>
              </div>
            )}

            {/* Tuition */}

            {selectedStudent && (
              <div className="voucher-section">
                <div className="section-heading">
                  <div>
                    <h3>Tuition Fee</h3>
                    <p>
                      Fee is resolved automatically from the
                      student's batch.
                    </p>
                  </div>
                </div>

                {tuitionLoading ? (
                  <div className="loading-box">
                    <Loader2 size={20} className="spin" />
                    Checking tuition fee configuration...
                  </div>
                ) : tuitionFee ? (
                  <div className="tuition-preview">
                    <div>
                      <span>Configured Tuition Fee</span>
                      <strong>
                        {formatMoney(
                          tuitionFee?.amount ||
                            tuitionFee?.fee ||
                            tuitionFee?.tuitionFee
                        )}
                      </strong>
                    </div>

                    <CheckCircle size={22} />
                  </div>
                ) : (
                  <div className="missing-fee">
                    <AlertCircle size={20} />
                    <div>
                      <strong>
                        Tuition fee not configured
                      </strong>
                      <p>
                        Voucher cannot be generated until
                        tuition fee is configured for this
                        department, degree class and shift.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <FeeOptions
              includeTransport={includeTransport}
              handleTransportChange={handleTransportChange}
              transportFeeTypeId={transportFeeTypeId}
              setTransportFeeTypeId={setTransportFeeTypeId}
              transportTypes={transportTypes}
              customItems={customItems}
              addCustomItem={addCustomItem}
              updateCustomItem={updateCustomItem}
              removeCustomItem={removeCustomItem}
              payDueDate={payDueDate}
              setPayDueDate={setPayDueDate}
              fineDueDate={fineDueDate}
              setFineDueDate={setFineDueDate}
              fineTypeId={fineTypeId}
              setFineTypeId={setFineTypeId}
              fineTypes={fineTypes}
            />

            <div className="voucher-submit-area">
              <button
                className="voucher-create-btn"
                disabled={
                  loading ||
                  !selectedStudent ||
                  !enrollment ||
                  !tuitionFee ||
                  !payDueDate ||
                  !fineDueDate ||
                  (includeTransport &&
                    !transportFeeTypeId)
                }
                onClick={generateSingleVoucher}
              >
                {loading ? (
                  <>
                    <Loader2
                      size={18}
                      className="spin"
                    />
                    Creating Voucher...
                  </>
                ) : (
                  <>
                    <FileText size={18} />
                    Create Voucher
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================
          BATCH
      =================================================== */}

      {activeFlow === "batch" && (
        <div className="voucher-layout">
          <div className="voucher-main-card">
            <div className="voucher-card-header">
              <div>
                <h2>Batch-wise Bulk Voucher</h2>
                <p>
                  Select Department, Degree Class and Shift.
                  The ongoing batch and current semester are
                  detected automatically.
                </p>
              </div>
            </div>

            <div className="cascade-grid">
              <SelectField
                label="Department"
                value={batchDepartmentId}
                onChange={handleBatchDepartmentChange}
                options={departments}
                placeholder="Select Department"
              />

              <SelectField
                label="Degree Class"
                value={batchDegreeClassId}
                onChange={handleDegreeClassChange}
                options={degreeClasses}
                placeholder="Select Degree Class"
                disabled={!batchDepartmentId}
              />

              <SelectField
                label="Shift"
                value={batchShiftId}
                onChange={handleShiftChange}
                options={shifts}
                placeholder="Select Shift"
                disabled={!batchDegreeClassId}
              />
            </div>

            {matchedBatch && (
              <div className="batch-card">
                <div className="batch-card-top">
                  <div>
                    <span className="small-label">
                      ONGOING BATCH
                    </span>
                    <h3>
                      {matchedBatch?.name ||
                        matchedBatch?.batchName ||
                        "Selected Batch"}
                    </h3>
                  </div>

                  <span className="ongoing-badge">
                    Ongoing
                  </span>
                </div>

                <div className="batch-info-grid">
                  <InfoItem
                    label="Current Semester"
                    value={
                      matchedBatch?.currentSemester ??
                      matchedBatch?.semester ??
                      "—"
                    }
                    highlight
                  />

                  <InfoItem
                    label="Total Semesters"
                    value={
                      matchedBatch?.totalSemesters || "—"
                    }
                  />

                 <InfoItem
  label="Department"
  value={
    matchedBatch?.departmentId?.name ||
    "Selected Department"
  }
/>
                 <InfoItem
  label="Degree Class"
  value={
    matchedBatch?.degreeClassId?.name ||
    "Selected Class"
  }
/>

<InfoItem
  label="Shift"
  value={
    matchedBatch?.shiftId?.name ||
    "Selected Shift"
  }
/>
                </div>
              </div>
            )}

            {/* REPORT */}

            {matchedBatch && (
              <div className="report-section">
                <div className="section-heading">
                  <div>
                    <h3>Voucher Impact Report</h3>
                    <p>
                      Review pending students before bulk
                      generation.
                    </p>
                  </div>

                  <button
                    className="icon-refresh-btn"
                    onClick={() =>
                      loadBatchReport(matchedBatch)
                    }
                    disabled={reportLoading}
                  >
                    <RefreshCw
                      size={17}
                      className={
                        reportLoading ? "spin" : ""
                      }
                    />
                  </button>
                </div>

                {reportLoading ? (
                  <div className="loading-box">
                    <Loader2
                      size={20}
                      className="spin"
                    />
                    Loading voucher report...
                  </div>
                ) : (
                  <>
                    <div className="report-stats">
                      <ReportStat
                        label="Total Students"
                        value={batchReport?.totalStudents ?? 0}
                      />

                      <ReportStat
                        label="Already Vouchered"
                        value={batchReport?.vouchersCreated ?? 0}
                      />

                      <ReportStat
                        label="Pending"
                        value={batchReport?.vouchersPending ?? 0}
                      />
                    </div>

                    <PendingStudents
                      report={batchReport}
                    />
                  </>
                )}
              </div>
            )}

            <FeeOptions
              includeTransport={includeTransport}
              handleTransportChange={handleTransportChange}
              transportFeeTypeId={transportFeeTypeId}
              setTransportFeeTypeId={setTransportFeeTypeId}
              transportTypes={transportTypes}
              customItems={customItems}
              addCustomItem={addCustomItem}
              updateCustomItem={updateCustomItem}
              removeCustomItem={removeCustomItem}
              payDueDate={payDueDate}
              setPayDueDate={setPayDueDate}
              fineDueDate={fineDueDate}
              setFineDueDate={setFineDueDate}
              fineTypeId={fineTypeId}
              setFineTypeId={setFineTypeId}
              fineTypes={fineTypes}
              hideCustomItems
            />

            <div className="voucher-submit-area">
              <button
                className="voucher-create-btn"
                disabled={
                  loading ||
                  !matchedBatch ||
                  !batchReport ||
                  !payDueDate ||
                  !fineDueDate ||
                  (includeTransport &&
                    !transportFeeTypeId)
                }
                onClick={generateBatchVoucher}
              >
                {loading ? (
                  <>
                    <Loader2
                      size={18}
                      className="spin"
                    />
                    Generating Bulk Vouchers...
                  </>
                ) : (
                  <>
                    <Users size={18} />
                    Generate Batch Vouchers
                  </>
                )}
              </button>
            </div>

            {batchResult && (
              <BulkResultTable result={batchResult} />
            )}
          </div>
        </div>
      )}

      {/* ===================================================
          DEPARTMENT
      =================================================== */}

      {activeFlow === "department" && (
        <div className="voucher-layout">
          <div className="voucher-main-card">
            <div className="voucher-card-header">
              <div>
                <h2>Department-wise Bulk Voucher</h2>
                <p>
                  All ongoing batches are included. Each batch
                  uses its own automatically detected semester.
                </p>
              </div>
            </div>

            <div className="single-select-row">
              <SelectField
                label="Department"
                value={departmentId}
                onChange={handleDepartmentChange}
                options={departments}
                placeholder="Select Department"
              />
            </div>

            {departmentLoading && (
              <div className="loading-box">
                <Loader2
                  size={20}
                  className="spin"
                />
                Loading ongoing batches...
              </div>
            )}

            {departmentId &&
              !departmentLoading && (
                <div className="department-batches">
                  <div className="section-heading">
                    <div>
                      <h3>Ongoing Batches</h3>
                      <p>
                        Each batch may have a different
                        current semester.
                      </p>
                    </div>

                    <span className="batch-count">
                      {departmentBatches.length} Batches
                    </span>
                  </div>

                  {departmentBatches.length > 0 ? (
                    <div className="batch-table-wrapper">
                      <table className="batch-table">
                        <thead>
                          <tr>
                            <th>Batch Name</th>
                            <th>Degree Class</th>
                            <th>Shift</th>
                            <th>Current Semester</th>
                          </tr>
                        </thead>

                        <tbody>
                          {departmentBatches.map(
                            (batch) => (
                              <tr key={getId(batch)}>
                                <td>
                                  <strong>
                                    {batch?.name ||
                                      batch?.batchName ||
                                      "—"}
                                  </strong>
                                </td>

                                <td>
                                  {batch?.degreeClassId?.name || "—"}
                                </td>

                                <td>
                                  {batch?.shiftId?.name || "—"}
                                </td>

                                <td>
                                  <span className="semester-pill">
                                    Semester{" "}
                                    {batch?.currentSemester ??
                                      batch?.semester ??
                                      "—"}
                                  </span>
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="empty-box">
                      <Building2 size={25} />
                      <strong>
                        No ongoing batches found
                      </strong>
                    </div>
                  )}
                </div>
              )}

            <div className="department-warning">
              <AlertCircle size={18} />

              <div>
                <strong>Automatic semester handling</strong>
                <p>
                  No semester will be selected manually.
                  The department bulk API receives the
                  department and handles the applicable
                  ongoing batches according to backend
                  configuration.
                </p>
              </div>
            </div>

            <FeeOptions
              includeTransport={includeTransport}
              handleTransportChange={handleTransportChange}
              transportFeeTypeId={transportFeeTypeId}
              setTransportFeeTypeId={setTransportFeeTypeId}
              transportTypes={transportTypes}
              customItems={customItems}
              addCustomItem={addCustomItem}
              updateCustomItem={updateCustomItem}
              removeCustomItem={removeCustomItem}
              payDueDate={payDueDate}
              setPayDueDate={setPayDueDate}
              fineDueDate={fineDueDate}
              setFineDueDate={setFineDueDate}
              fineTypeId={fineTypeId}
              setFineTypeId={setFineTypeId}
            />

            <div className="voucher-submit-area">
              <button
                className="voucher-create-btn"
                disabled={
                  loading ||
                  !departmentId ||
                  !departmentBatches.length ||
                  !payDueDate ||
                  !fineDueDate ||
                  (includeTransport &&
                    !transportFeeTypeId)
                }
                onClick={generateDepartmentVoucher}
              >
                {loading ? (
                  <>
                    <Loader2
                      size={18}
                      className="spin"
                    />
                    Generating Department Vouchers...
                  </>
                ) : (
                  <>
                    <Building2 size={18} />
                    Generate Department Vouchers
                  </>
                )}
              </button>
            </div>

            {departmentResult && (
              <BulkResultTable
                result={departmentResult}
              />
            )}
          </div>
        </div>
      )}

      {/* VOUCHER PREVIEW */}

      {previewVoucher && (
        <VoucherPreview
          voucher={previewVoucher}
          onClose={() => setPreviewVoucher(null)}
        />
      )}

      {supportLoading && (
        <div className="support-loading">
          Loading fee configuration...
        </div>
      )}
    </div>
  );
};

/* =========================================================
   INFO ITEM
========================================================= */

const InfoItem = ({
  label,
  value,
  highlight = false,
}) => (
  <div className="info-item">
    <span>{label}</span>
    <strong className={highlight ? "highlight" : ""}>
      {value}
    </strong>
  </div>
);

/* =========================================================
   SELECT FIELD
========================================================= */

const SelectField = ({
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
}) => (
  <div className="voucher-field">
    <label>{label}</label>

    <div className="select-wrapper">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        <option value="">{placeholder}</option>

        {options.map((option) => (
          <option
            key={getId(option)}
            value={getId(option)}
          >
            {getName(option)}
          </option>
        ))}
      </select>

      <ChevronDown size={17} />
    </div>
  </div>
);

/* =========================================================
   FEE OPTIONS
========================================================= */

const FeeOptions = ({
  includeTransport,
  handleTransportChange,
  transportFeeTypeId,
  setTransportFeeTypeId,
  transportTypes,
  customItems,
  addCustomItem,
  updateCustomItem,
  removeCustomItem,
  payDueDate,
  setPayDueDate,
  fineDueDate,
  setFineDueDate,
  fineTypeId,
  setFineTypeId,
  fineTypes,
  hideCustomItems = false,
}) => (
  <div className="voucher-section fee-options-section">
    <div className="section-heading">
      <div>
        <h3>Fee Options</h3>
        <p>
          These settings will be applied to the voucher.
        </p>
      </div>
    </div>

    {/* TRANSPORT */}

    <div className="transport-option">
      <label className="checkbox-label">
        <input
          type="checkbox"
          checked={includeTransport}
          onChange={(e) =>
            handleTransportChange(e.target.checked)
          }
        />

        <span>
          <strong>Include Transport Fee</strong>
          <small>
            Add transport fee to this voucher.
          </small>
        </span>
      </label>

      {includeTransport && (
        <div className="transport-select">
          <label>Transport Fee Type</label>

          <select
            value={transportFeeTypeId}
            onChange={(e) =>
              setTransportFeeTypeId(e.target.value)
            }
          >
            <option value="">
              Select Transport Fee
            </option>

            {(transportTypes || []).map((type) => (
  <option
    key={getId(type)}
    value={getId(type)}
  >
    {getName(type)}
    {type?.amount
      ? ` — ${formatMoney(type.amount)}`
      : ""}
  </option>
))}
          </select>

          {!transportTypes.length && (
            <small className="inline-error">
              No Transport fee type found.
            </small>
          )}
        </div>
      )}
    </div>

    {/* CUSTOM ITEMS */}

    {!hideCustomItems && (
      <div className="custom-items">
        <div className="custom-items-header">
          <div>
            <h4>Custom Items</h4>
            <p>
              Optional ad-hoc charges not tied to master
              fee types.
            </p>
          </div>

          <button
            type="button"
            onClick={addCustomItem}
          >
            <Plus size={16} />
            Add Custom Item
          </button>
        </div>

        {customItems.length > 0 && (
          <div className="custom-item-list">
            {customItems.map((item) => (
              <div
                className="custom-item-row"
                key={item.id}
              >
                <input
                  value={item.name}
                  onChange={(e) =>
                    updateCustomItem(
                      item.id,
                      "name",
                      e.target.value
                    )
                  }
                  placeholder="Item name"
                />

                <input
                  type="number"
                  min="0"
                  value={item.amount}
                  onChange={(e) =>
                    updateCustomItem(
                      item.id,
                      "amount",
                      e.target.value
                    )
                  }
                  placeholder="Amount"
                />

                <button
                  type="button"
                  onClick={() =>
                    removeCustomItem(item.id)
                  }
                >
                  <Trash2 size={17} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    )}

    {/* DATES */}

    <div className="date-grid">
      <div className="voucher-field">
        <label>
          Pay Due Date <span>*</span>
        </label>

        <input
          type="date"
          value={payDueDate}
          onChange={(e) =>
            setPayDueDate(e.target.value)
          }
        />
      </div>

      <div className="voucher-field">
        <label>
          Fine Due Date <span>*</span>
        </label>

        <input
          type="date"
          value={fineDueDate}
          onChange={(e) =>
            setFineDueDate(e.target.value)
          }
        />
      </div>
    </div>

    {/* FINE TYPE */}

    <div className="voucher-field">
      <label>Fine Type (Optional)</label>

      <div className="select-wrapper">
        <select
          value={fineTypeId}
          onChange={(e) =>
            setFineTypeId(e.target.value)
          }
        >
          <option value="">No Fine Type</option>

          {(fineTypes || []).map((type) => (
  <option
    key={getId(type)}
    value={getId(type)}
  >
    {getName(type)}
    {type?.amount
      ? ` — ${formatMoney(type.amount)}`
      : ""}
  </option>
))}
        </select>

        <ChevronDown size={17} />
      </div>
    </div>
  </div>
);

/* =========================================================
   REPORT PENDING STUDENTS
========================================================= */

const PendingStudents = ({ report }) => {
  // Backend sends a flat `students` array with a `voucherCreated`
  // boolean per row — pending students are the ones where it's false.
  const rows = Array.isArray(report?.students) ? report.students : [];
  const pending = rows.filter((row) => !row?.voucherCreated);

  if (!pending.length) {
    return (
      <div className="no-pending">
        <CheckCircle size={20} />
        <span>No pending students found.</span>
      </div>
    );
  }

  const displayName = (student) => {
    const p = student?.personalInfo || student || {};
    return (
      `${p.firstName || ""} ${p.lastName || ""}`.trim() ||
      student?.name ||
      student?.fullName ||
      "Student"
    );
  };

  const displayRollOrReg = (student) =>
    student?.rollNo ||
    student?.registrationNo ||
    student?.personalInfo?.cnic ||
    student?.cnic ||
    "—";

  return (
    <div className="pending-list">
      <div className="pending-list-header">
        <strong>Pending Students</strong>
        <span>{pending.length}</span>
      </div>

      <div className="pending-scroll">
        {pending.map((row, index) => {
          const student = row?.student || {};
          return (
            <div
              className="pending-student"
              key={row?.enrollmentId || getId(student) || index}
            >
              <div className="pending-avatar">
                {displayName(student).charAt(0).toUpperCase()}
              </div>

              <div>
                <strong>{displayName(student)}</strong>
                <span>{displayRollOrReg(student)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* =========================================================
   REPORT STAT
========================================================= */

const ReportStat = ({ label, value }) => (
  <div className="report-stat">
    <span>{label}</span>
    <strong>{value}</strong>
  </div>
);

/* =========================================================
   BULK RESULT TABLE
========================================================= */

const BulkResultTable = ({ result }) => {
  const created = result?.created || [];
  const skipped = result?.skipped || [];
  const failed = result?.failed || [];

  const rows = [
    ...created.map((item) => ({
      ...item,
      resultStatus: "created",
    })),

    ...skipped.map((item) => ({
      ...item,
      resultStatus: "skipped",
    })),

    ...failed.map((item) => ({
      ...item,
      resultStatus: "failed",
    })),
  ];

  if (!rows.length) return null;

  const getStudentName = (item) =>
    item?.student?.name ||
    item?.studentName ||
    item?.name ||
    item?.student?.fullName ||
    "Student";

  const getReason = (item) =>
    item?.reason ||
    item?.message ||
    item?.error ||
    "—";

  return (
    <div className="bulk-result">
      <div className="section-heading">
        <div>
          <h3>Generation Results</h3>
          <p>
            Results returned by the voucher generation
            endpoint.
          </p>
        </div>
      </div>

      <div className="result-summary">
        <div className="result-created">
          <CheckCircle size={18} />
          <strong>{created.length}</strong>
          <span>Created</span>
        </div>

        <div className="result-skipped">
          <AlertCircle size={18} />
          <strong>{skipped.length}</strong>
          <span>Skipped</span>
        </div>

        <div className="result-failed">
          <AlertCircle size={18} />
          <strong>{failed.length}</strong>
          <span>Failed</span>
        </div>
      </div>

      <div className="result-table-wrapper">
        <table className="result-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Status</th>
              <th>Reason</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((item, index) => (
              <tr key={getId(item) || index}>
                <td>
                  <strong>{getStudentName(item)}</strong>
                </td>

                <td>
                  <span
                    className={`result-badge ${item.resultStatus}`}
                  >
                    {item.resultStatus}
                  </span>
                </td>

                <td>{getReason(item)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* =========================================================
   VOUCHER PREVIEW
   Inline preview — no route / no modal
========================================================= */

const VoucherPreview = ({ voucher, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const items = Array.isArray(voucher?.items)
    ? voucher.items
    : [];

 const student =
  voucher?.student ||
  voucher?.enrollment?.studentId ||
  voucher?.enrollmentId?.studentId ||    // 👈 YE ADD KARO
  {};

  const enrollment = voucher?.enrollment || {};

  const batch =
    voucher?.batch ||
    enrollment?.batchId ||
    {};

  const department =
    batch?.departmentId ||
    batch?.department ||
    {};

  const degreeClass =
    batch?.degreeClassId ||
    batch?.degreeClass ||
    {};

  const shift =
    batch?.shiftId ||
    batch?.shift ||
    {};

  const session =
    batch?.startSessionId ||
    batch?.sessionId ||
    batch?.session ||
    {};

const p = student?.personalInfo || student || {};

const studentName =
  `${p.firstName || ""} ${p.lastName || ""}`.trim() ||
  student?.name ||
  student?.fullName ||
  voucher?.studentName ||
  "—";

const cnic =
  student?.personalInfo?.cnic ||
  student?.cnic ||
  student?.CNIC ||
  "—";

  const rollNo =
    student?.rollNo ||
    voucher?.rollNo ||
    "—";

  const registrationNo =
    student?.registrationNo ||
    student?.registrationNumber ||
    voucher?.registrationNo ||
    "—";

 const studentId =
  student?._id ||
  student?.personalInfo?.studentId ||
  voucher?.studentId ||
  "—";

  const campus =
    batch?.campusId?.name ||
    batch?.campusId?.title ||
    batch?.campus?.name ||
    batch?.campus?.title ||
    enrollment?.campusId?.name ||
    "UE Multan Campus";

  const degreeProgram =
    degreeClass?.name ||
    degreeClass?.title ||
    degreeClass?.code ||
    "—";

  const shiftName =
    shift?.name ||
    shift?.title ||
    shift?.code ||
    "—";

  const quota =
    enrollment?.quota ||
    enrollment?.quotaName ||
    enrollment?.admissionQuota ||
    student?.quota ||
    "Open Merit";

  const semester =
    voucher?.semester ??
    enrollment?.currentSemester ??
    batch?.currentSemester ??
    "—";

  const sessionName =
    session?.name ||
    session?.year ||
    session?.session ||
    batch?.session ||
    batch?.sessionName ||
    "—";

  const billNo =
    voucher?.billNo ||
    voucher?.billNumber ||
    voucher?.voucherNo ||
    "—";

  const challanNo =
    voucher?.challanNo ||
    voucher?.challanNumber ||
    voucher?.voucherNo ||
    "—";

  const baseAmount = Number(
    voucher?.baseAmount ??
      voucher?.amount ??
      items.reduce(
        (sum, item) =>
          sum + Number(item?.amount || 0),
        0
      )
  );

  const fineAmount = Number(
    voucher?.fineAmount ||
      voucher?.fine?.amount ||
      0
  );

  const totalAmount = Number(
    voucher?.totalAmount ??
      baseAmount + fineAmount
  );

  const afterDueAmount =
    baseAmount + fineAmount;

  const copies = [
    "Bank Copy",
    "Bank Copy (UE Treasurer)",
    "UE Division/Campus Copy",
    "Student Copy",
  ];

  const getItemName = (item) =>
    item?.name ||
    item?.description ||
    item?.feeTypeId?.name ||
    "Fee Item";

  const getItemAmount = (item) =>
    Number(item?.amount || 0);

  const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const amountInWords = (value) => {
    const number = Math.floor(Number(value || 0));

    if (!number) return "Zero Only";

    const ones = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
    ];

    const teens = [
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];

    const tens = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];

    const twoDigits = (n) => {
      if (n < 10) return ones[n];
      if (n < 20) return teens[n - 10];

      return `${tens[Math.floor(n / 10)]}${
        n % 10 ? `-${ones[n % 10]}` : ""
      }`;
    };

    const threeDigits = (n) => {
      if (n < 100) return twoDigits(n);

      return `${ones[Math.floor(n / 100)]} Hundred${
        n % 100 ? ` ${twoDigits(n % 100)}` : ""
      }`;
    };

    const convert = (n) => {
      if (n < 1000) return threeDigits(n);

      if (n < 100000) {
        return `${twoDigits(Math.floor(n / 1000))} Thousand${
          n % 1000 ? ` ${threeDigits(n % 1000)}` : ""
        }`;
      }

      if (n < 10000000) {
        return `${threeDigits(Math.floor(n / 100000))} Lakh${
          n % 100000 ? ` ${convert(n % 100000)}` : ""
        }`;
      }

      return `${twoDigits(Math.floor(n / 10000000))} Crore${
        n % 10000000
          ? ` ${convert(n % 10000000)}`
          : ""
      }`;
    };

    return `${convert(number)} Only`;
  };

  const today = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <section className="voucher-preview-section">
      <div className="voucher-preview-heading no-print">
        <div>
          <span className="voucher-preview-kicker">
            VOUCHER GENERATED
          </span>
          <h2>Voucher Preview</h2>
          <p>
            Four printable copies are shown below.
          </p>
        </div>

        <div className="voucher-preview-actions">
          <button
            type="button"
            className="voucher-preview-print-btn"
            onClick={handlePrint}
          >
            <Printer size={17} />
            Print Voucher
          </button>

          <button
            type="button"
            className="voucher-preview-close-btn"
            onClick={onClose}
          >
            <X size={17} />
            Close Preview
          </button>
        </div>
      </div>

      <div className="voucher-preview-sheet">
        {copies.map((copyName, copyIndex) => (
          <article
            className="voucher-copy"
            key={`${copyName}-${copyIndex}`}
          >
            <div className="voucher-copy-name">
              {copyName}
            </div>

            <div className="voucher-bank-name">
              The Bank of the Punjab
            </div>

            <div className="voucher-university-name">
              University of Education, Lahore
            </div>

            <div className="voucher-copy-info">
              <VoucherInfoLine
                label="Date"
                value={today}
              />

              <VoucherInfoLine
                label="Challan#"
                value={challanNo}
                bold
              />

              <VoucherInfoLine
                label="1 Bill No."
                value={billNo}
              />

              <VoucherInfoLine
                label="Name"
                value={studentName}
              />

              <VoucherInfoLine
                label="CNIC"
                value={cnic}
              />

              <VoucherInfoLine
                label="Roll No."
                value={rollNo}
              />

              <VoucherInfoLine
                label="Registration No."
                value={registrationNo}
              />

              <VoucherInfoLine
                label="Division/Campus"
                value={campus}
              />

              <VoucherInfoLine
                label="Degree Program"
                value={degreeProgram}
              />

              <div className="voucher-two-col">
                <VoucherInfoLine
                  label="Shift"
                  value={shiftName}
                />

                <VoucherInfoLine
                  label="Quota"
                  value={quota}
                />
              </div>

              <div className="voucher-two-col">
                <VoucherInfoLine
                  label="Semester"
                  value={
                    semester === "—"
                      ? "—"
                      : `Semester ${semester}`
                  }
                />

                <VoucherInfoLine
                  label="Session"
                  value={sessionName}
                />
              </div>

              <VoucherInfoLine
                label="Student Id"
                value={studentId}
              />

              <VoucherInfoLine
                label="Due Date"
                value={formatDate(
                  voucher?.payDueDate
                )}
              />

              <VoucherInfoLine
                label="Fine Due Date"
                value={formatDate(
                  voucher?.fineDueDate
                )}
                bold
              />

              <VoucherInfoLine
                label="Fee Type"
                value="Semester wise"
              />
            </div>

            <table className="voucher-copy-table">
              <thead>
                <tr>
                  <th>Sr#</th>
                  <th>Description</th>
                  <th>Rs.</th>
                </tr>
              </thead>

              <tbody>
                {items.length > 0 ? (
                  items.map((item, itemIndex) => (
                    <tr key={`${getItemName(item)}-${itemIndex}`}>
                      <td>{itemIndex + 1}</td>
                      <td>{getItemName(item)}</td>
                      <td>
                        {getItemAmount(item).toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td>1</td>
                    <td>Tuition Fee</td>
                    <td>
                      {baseAmount.toLocaleString()}
                    </td>
                  </tr>
                )}

                <tr className="voucher-copy-total">
                  <td colSpan="2">
                    Amount (within due date)
                  </td>
                  <td>
                    {baseAmount.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="voucher-amount-words">
              Rs. {amountInWords(baseAmount)}
            </div>

            <div className="voucher-fine-line">
              <span>Fine Amount</span>
              <strong>
                {fineAmount.toLocaleString()}
              </strong>
            </div>

            <div className="voucher-after-due-line">
              <span>Amount (after due date)</span>
              <strong>
                {afterDueAmount.toLocaleString()}
              </strong>
            </div>

            <div className="voucher-amount-words">
              Rs. {amountInWords(afterDueAmount)}
            </div>

            <div className="voucher-copy-notes">
              <div>
                i) Depositors will receive the system generated
                deposit slip from the bank as proof of deposit.
                Sign and stamp on downloaded challan forms or
                manual deposit is not acceptable to UE authority.
              </div>
              <div>
                ii) This Voucher may please be deposited into
                any Branch of BOP.
              </div>
              <div>
                iii) All Bankers are requested to post this Voucher
                to the University of Education New Collection Account.
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="voucher-preview-bottom no-print">
        <strong>Voucher No: {voucher?.voucherNo || "—"}</strong>
        <span>Total: {formatMoney(totalAmount)}</span>
      </div>
    </section>
  );
};




const VoucherInfoLine = ({
  label,
  value,
  bold = false,
}) => (
  <div className="voucher-info-line">
    <span>{label}:</span>
    <strong className={bold ? "is-bold" : ""}>
      {value || "—"}
    </strong>
  </div>
);

export default Voucher;