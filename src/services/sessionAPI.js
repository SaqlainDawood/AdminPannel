import axios from "axios";

const SessionAPI = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

// =====================================================
// TOKEN INTERCEPTOR
// Get JWT from sessionStorage
// =====================================================

SessionAPI.interceptors.request.use(
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
    (error) => {
        return Promise.reject(error);
    }
);

// =====================================================
// GET ALL SESSIONS
// GET /api/sessions
// Optional params: term, year
// =====================================================

export const getSessions = async (params = {}) => {
    const response = await SessionAPI.get(
        "/api/sessions",
        { params }
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
// BULK GENERATE DEGREE CLASS SESSIONS
// POST /api/sessions/generate
//
// Payload:
// {
//     degreeClassId: "...",
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