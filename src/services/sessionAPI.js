import axios from "axios";

const SessionAPI = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});


// =====================================================
// GET ALL SESSIONS
// GET /api/sessions
// =====================================================

export const getSessions = async (params = {}) => {
    const response = await SessionAPI.get(
        "/api/sessions",
        {
            params,
        }
    );

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
// GENERATE DEGREE CLASS SESSIONS
// POST /api/sessions/generate
//
// Backend expects:
//
// {
//     degreeClassId,
//     startYear,
//     startTerm
// }
//
// Example:
//
// {
//     degreeClassId: "68c123456789abcdef123456",
//     startYear: 2026,
//     startTerm: "Fall"
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
// UPDATE EXISTING SESSION
// PUT /api/sessions/:id
// =====================================================

export const updateSession = async (
    id,
    payload
) => {
    const response = await SessionAPI.put(
        `/api/sessions/${id}`,
        payload
    );

    return response.data;
};


// =====================================================
// DELETE ALL SESSIONS OF DEGREE CLASS
// DELETE /api/sessions/bulk/:degreeClassId
// =====================================================

export const deleteSessionsByDegreeClass = async (
    degreeClassId
) => {
    const response = await SessionAPI.delete(
        `/api/sessions/bulk/${degreeClassId}`
    );

    return response.data;
};


export default SessionAPI;