import axios from "axios";

const ShiftAPI = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

// ============================================
// GET ALL SHIFTS
// ============================================

export const getShifts = async (params = {}) => {
    const response = await ShiftAPI.get(
        "/api/shifts",
        {
            params,
        }
    );

    return response.data;
};

// ============================================
// GET SINGLE SHIFT
// ============================================

export const getShiftById = async (id) => {
    const response = await ShiftAPI.get(
        `/api/shifts/${id}`
    );

    return response.data;
};

// ============================================
// CREATE SHIFT
// ============================================

export const createShift = async (payload) => {
    const response = await ShiftAPI.post(
        "/api/shifts",
        payload
    );

    return response.data;
};

// ============================================
// UPDATE SHIFT
// ============================================

export const updateShift = async (
    id,
    payload
) => {
    const response = await ShiftAPI.put(
        `/api/shifts/${id}`,
        payload
    );

    return response.data;
};

// ============================================
// DELETE SHIFT
// ============================================

export const deleteShift = async (id) => {
    const response = await ShiftAPI.delete(
        `/api/shifts/${id}`
    );

    return response.data;
};

export default ShiftAPI;