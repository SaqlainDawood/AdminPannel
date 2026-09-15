import axios from "axios";

const SessionAPI = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});


// =====================================================
// GET ALL SESSIONS
// GET /api/sessions
// =====================================================

export const getSessions = async (params = {}) => {
    const response = await SessionAPI.get("/api/sessions", {
        params,
    });

    return response.data;
};


// =====================================================
// GET SESSION STATUS
// GET /api/sessions/status
// =====================================================

export const getSessionStatus = async () => {
    const response = await SessionAPI.get(
        "/api/sessions/status"
    );

    return response.data;
};


// =====================================================
// GET CURRENT ACTIVE SESSION
// GET /api/sessions/current
// =====================================================

export const getCurrentSession = async () => {
    const response = await SessionAPI.get(
        "/api/sessions/current"
    );

    return response.data;
};


// =====================================================
// GET SESSION BY ID
// GET /api/sessions/:id
// =====================================================

export const getSessionById = async (id) => {
    const response = await SessionAPI.get(
        `/api/sessions/${id}`
    );

    return response.data;
};


// =====================================================
// CREATE SINGLE SESSION
// POST /api/sessions
//
// NOTE:
// Main UI generation flow uses generateSessions().
// This function is kept for manual/admin use.
// =====================================================

export const createSession = async (payload) => {
    const response = await SessionAPI.post(
        "/api/sessions",
        payload
    );

    return response.data;
};


// =====================================================
// GENERATE SPRING + FALL
//
// POST /api/sessions/generate
//
// Backend expects:
// {
//   degreeClassId,
//   springStartDate,
//   semesterMonths
// }
// =====================================================

export const generateSessions = async (payload) => {
    const response = await SessionAPI.post(
        "/api/sessions/generate",
        payload
    );

    return response.data;
};


// =====================================================
// UPDATE SESSION
// PUT /api/sessions/:id
// =====================================================

export const updateSession = async (id, payload) => {
    const response = await SessionAPI.put(
        `/api/sessions/${id}`,
        payload
    );

    return response.data;
};


// =====================================================
// DELETE SESSION
// DELETE /api/sessions/:id
// =====================================================

export const deleteSession = async (id) => {
    const response = await SessionAPI.delete(
        `/api/sessions/${id}`
    );

    return response.data;
};

export default SessionAPI;