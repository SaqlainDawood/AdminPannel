import axios from "axios";

const BatchAPI = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

// ============================================
// GET ALL BATCHES
// GET /api/batches
// ============================================

export const getBatches = async (params = {}) => {
    const response = await BatchAPI.get("/api/batches", {
        params,
    });

    return response.data;
};

// ============================================
// GET SINGLE BATCH
// GET /api/batches/:id
// ============================================

export const getBatchById = async (id) => {
    const response = await BatchAPI.get(
        `/api/batches/${id}`
    );

    return response.data;
};

// ============================================
// CREATE BATCH
// POST /api/batches
// ============================================

export const createBatch = async (payload) => {
    const response = await BatchAPI.post(
        "/api/batches",
        payload
    );

    return response.data;
};

// ============================================
// UPDATE BATCH
// PUT /api/batches/:id
// ============================================

export const updateBatch = async (id, payload) => {
    const response = await BatchAPI.put(
        `/api/batches/${id}`,
        payload
    );

    return response.data;
};

// ============================================
// DELETE BATCH
// DELETE /api/batches/:id
// ============================================

export const deleteBatch = async (id) => {
    const response = await BatchAPI.delete(
        `/api/batches/${id}`
    );

    return response.data;
};

// ============================================
// GET BATCH SEMESTERS
// GET /api/batches/:id/semesters
// ============================================

export const getBatchSemesters = async (id) => {
    const response = await BatchAPI.get(
        `/api/batches/${id}/semesters`
    );

    return response.data;
};

// ============================================
// GET NEXT SESSION
// GET /api/batches/next-session
// ============================================

export const getNextSession = async (
    currentSessionId
) => {
    const response = await BatchAPI.get(
        "/api/batches/next-session",
        {
            params: {
                currentSessionId,
            },
        }
    );

    return response.data;
};

// ============================================
// ADVANCE BATCH
// PUT /api/batches/:id/advance
//
// Automatic:
// advanceBatch(id)
//
// Manual:
// advanceBatch(id, { sessionId })
// ============================================

export const advanceBatch = async (
    id,
    payload = {}
) => {
    const response = await BatchAPI.put(
        `/api/batches/${id}/advance`,
        payload
    );

    return response.data;
};

export default BatchAPI;