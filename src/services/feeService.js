import axios from "axios";

const FeeAPI = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// ============================================
// TUITION FEES
// ============================================

export const getTuitionFees = async () => {
  const response = await FeeAPI.get("/api/tuition-fees");
  return response.data;
};

export const createTuitionFee = async (payload) => {
  const response = await FeeAPI.post(
    "/api/tuition-fees",
    payload
  );

  return response.data;
};

export const updateTuitionFee = async (id, payload) => {
  const response = await FeeAPI.put(
    `/api/tuition-fees/${id}`,
    payload
  );

  return response.data;
};

export const deleteTuitionFee = async (id) => {
  const response = await FeeAPI.delete(
    `/api/tuition-fees/${id}`
  );

  return response.data;
};

// ============================================
// FEE TYPES
// ============================================

export const getFeeTypes = async () => {
  const response = await FeeAPI.get("/api/fee-type");
  return response.data;
};

export const createFeeType = async (payload) => {
  const response = await FeeAPI.post(
    "/api/fee-type",
    payload
  );

  return response.data;
};

export const updateFeeType = async (id, payload) => {
  const response = await FeeAPI.put(
    `/api/fee-type/${id}`,
    payload
  );

  return response.data;
};

export const deleteFeeType = async (id) => {
  const response = await FeeAPI.delete(
    `/api/fee-type/${id}`
  );

  return response.data;
};

// ============================================
// FINE TYPES
// ============================================

export const getFineTypes = async () => {
  const response = await FeeAPI.get("/api/fine-types");
  return response.data;
};

export const createFineType = async (payload) => {
  const response = await FeeAPI.post(
    "/api/fine-types",
    payload
  );

  return response.data;
};

export const updateFineType = async (id, payload) => {
  const response = await FeeAPI.put(
    `/api/fine-types/${id}`,
    payload
  );

  return response.data;
};

export const deleteFineType = async (id) => {
  const response = await FeeAPI.delete(
    `/api/fine-types/${id}`
  );

  return response.data;
};

/// ============================================
// VOUCHER
// ============================================

// Single Student Voucher
export const generateStudentVoucher = async (payload) => {
  const response = await FeeAPI.post(
    "/api/vouchers",
    payload
  );

  return response.data;
};

// Batch Bulk Voucher
export const generateBatchVoucher = async (payload) => {
  const response = await FeeAPI.post(
    "/api/vouchers/bulk/batch",
    payload
  );

  return response.data;
};

// Department Bulk Voucher
export const generateDepartmentVoucher = async (payload) => {
  const response = await FeeAPI.post(
    "/api/vouchers/bulk/department",
    payload
  );

  return response.data;
};

// Get All Vouchers
export const getVouchers = async () => {
  const response = await FeeAPI.get(
    "/api/vouchers"
  );

  return response.data;
};

// Get Single Voucher
export const getVoucherById = async (id) => {
  const response = await FeeAPI.get(
    `/api/vouchers/${id}`
  );

  return response.data;
};

// Update Voucher Status
export const updateVoucherStatus = async (
  id,
  payload
) => {
  const response = await FeeAPI.put(
    `/api/vouchers/${id}/status`,
    payload
  );

  return response.data;
};

// Delete Voucher
export const deleteVoucher = async (id) => {
  const response = await FeeAPI.delete(
    `/api/vouchers/${id}`
  );

  return response.data;
};