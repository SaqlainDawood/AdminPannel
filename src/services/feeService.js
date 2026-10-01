import axios from "axios";

const FeeAPI = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// ============================================
// TOKEN INTERCEPTOR
// ============================================
FeeAPI.interceptors.request.use(
  (config) => {
    const token =
      sessionStorage.getItem("token") ||
      sessionStorage.getItem("adminToken") ||
      localStorage.getItem("token") ||
      localStorage.getItem("adminToken");

    if (token) {
      const cleanToken = token.replace(/^Bearer\s+/i, "").replace(/^"|"$/g, "");
      config.headers.Authorization = `Bearer ${cleanToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ============================================
// RESPONSE INTERCEPTOR (401 handling)
// ============================================
FeeAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      sessionStorage.removeItem("adminToken");
      sessionStorage.removeItem("token");
    }
    return Promise.reject(error);
  }
);

// ============================================
// HELPERS
// ============================================
export const unwrap = (response) => {
  const body = response?.data;
  if (!body) return null;
  if (body.success === false) {
    throw new Error(body.message || "Request failed.");
  }
  return body.data ?? body;
};

export const normalizeList = (response) => {
  const data = unwrap(response);
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
};

export const getId = (item) => item?._id || item?.id;

export const getName = (item, fallback = "-") =>
  item?.name || item?.title || item?.code || fallback;

// ============================================
// TUITION FEES
// ============================================
export const getTuitionFees = async (params = {}) => {
  const res = await FeeAPI.get("/api/tuition-fees", { params });
  return res.data;
};

export const createTuitionFee = async (payload) => {
  const res = await FeeAPI.post("/api/tuition-fees", payload);
  return res.data;
};

export const updateTuitionFee = async (id, payload) => {
  const res = await FeeAPI.put(`/api/tuition-fees/${id}`, payload);
  return res.data;
};

export const deleteTuitionFee = async (id) => {
  const res = await FeeAPI.delete(`/api/tuition-fees/${id}`);
  return res.data;
};

// ============================================
// FEE TYPES
// ============================================
export const getFeeTypes = async () => {
  const res = await FeeAPI.get("/api/fee-type");
  return res.data;
};

export const createFeeType = async (payload) => {
  const res = await FeeAPI.post("/api/fee-type", payload);
  return res.data;
};

export const updateFeeType = async (id, payload) => {
  const res = await FeeAPI.put(`/api/fee-type/${id}`, payload);
  return res.data;
};

export const deleteFeeType = async (id) => {
  const res = await FeeAPI.delete(`/api/fee-type/${id}`);
  return res.data;
};

// ============================================
// FINE TYPES
// ============================================
export const getFineTypes = async () => {
  const res = await FeeAPI.get("/api/fine-types");
  return res.data;
};

export const createFineType = async (payload) => {
  const res = await FeeAPI.post("/api/fine-types", payload);
  return res.data;
};

export const updateFineType = async (id, payload) => {
  const res = await FeeAPI.put(`/api/fine-types/${id}`, payload);
  return res.data;
};

export const deleteFineType = async (id) => {
  const res = await FeeAPI.delete(`/api/fine-types/${id}`);
  return res.data;
};

// ============================================
// VOUCHERS
// ============================================

// Single Student Voucher
export const generateStudentVoucher = async (payload) => {
  const res = await FeeAPI.post("/api/vouchers", payload);
  return res.data;
};

// Batch Bulk Voucher
export const generateBatchVoucher = async (payload) => {
  const res = await FeeAPI.post("/api/vouchers/bulk/batch", payload);
  return res.data;
};

// Department Bulk Voucher
export const generateDepartmentVoucher = async (payload) => {
  const res = await FeeAPI.post("/api/vouchers/bulk/department", payload);
  return res.data;
};

// Get All Vouchers
export const getVouchers = async (params = {}) => {
  const res = await FeeAPI.get("/api/vouchers", { params });
  return res.data;
};

// Get Single Voucher
export const getVoucherById = async (id) => {
  const res = await FeeAPI.get(`/api/vouchers/${id}`);
  return res.data;
};

// Update Voucher Status
export const updateVoucherStatus = async (studentId, voucherId, payStatus) => {
  const res = await FeeAPI.put(
    `/api/vouchers/student/${studentId}/status`,
    { voucherId, payStatus }
  );
  return res.data;
};

// Delete Voucher
export const deleteVoucher = async (id) => {
  const res = await FeeAPI.delete(`/api/vouchers/${id}`);
  return res.data;
};

// Voucher Report
export const getVoucherReport = async (batchId, semester) => {
  const res = await FeeAPI.get("/api/vouchers/report", {
    params: { batchId, semester },
  });
  return res.data;
};

export default FeeAPI;