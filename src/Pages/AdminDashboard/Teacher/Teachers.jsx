// src/pages/admin/Teachers.jsx
import React, { useEffect, useState } from "react";
import * as api from "../../../services/academicApi";

const emptyForm = {
  userId: "",
  departmentId: "",
  designation: "Lecturer",
  specialization: "",
  joiningDate: "",
};

export default function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [deptFilter, setDeptFilter] = useState("");
  const [status, setStatus] = useState("true"); // "true" | "false" | ""
  const [notice, setNotice] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState(null); // null | "new" | teacher
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);

  const say = (type, text) => setNotice({ type, text });

  const load = () => {
    setLoading(true);
    return api
      .getTeachers({
        departmentId: deptFilter || undefined,
        isActive: status === "" ? undefined : status,
      })
      .then((data) => setTeachers(Array.isArray(data) ? data : []))
      .catch((e) => say("error", api.errMsg(e)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    Promise.all([api.getDepartments(), api.getUsers({ roleSlug: "teacher" })])
      .then(([d, u]) => {
        setDepartments(Array.isArray(d) ? d : []);
        setUsers(Array.isArray(u) ? u : []);
      })
      .catch((e) => say("error", api.errMsg(e)));
  }, []);

  useEffect(() => {
    load();
  }, [deptFilter, status]);

  const openNew = () => {
    setForm({ ...emptyForm, departmentId: deptFilter });
    setEditing("new");
  };

  const openEdit = (t) => {
    setForm({
      userId: api.idOf(t.userId),
      departmentId: api.idOf(t.departmentId),
      designation: t.designation || "",
      specialization: (t.specialization || []).join(", "),
      joiningDate: t.joiningDate ? t.joiningDate.slice(0, 10) : "",
    });
    setEditing(t);
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    const body = {
      departmentId: form.departmentId,
      designation: form.designation,
      specialization: form.specialization
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      joiningDate: form.joiningDate || null,
    };
    try {
      if (editing === "new") {
        await api.createTeacher({ ...body, userId: form.userId });
        say("success", "Teacher created successfully");
      } else {
        await api.updateTeacher(editing._id, body);
        say("success", "Teacher updated successfully");
      }
      setEditing(null);
      await load();
    } catch (err) {
      say("error", api.errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  const deactivate = async (t) => {
    const name = t.userId?.name || "this teacher";
    if (!window.confirm(`Deactivate ${name}?`)) return;
    try {
      await api.deactivateTeacher(t._id);
      say("success", "Teacher deactivated successfully");
      await load();
    } catch (err) {
      say("error", api.errMsg(err));
    }
  };

  const reactivate = async (t) => {
    try {
      await api.updateTeacher(t._id, { isActive: true });
      say("success", "Teacher activated successfully");
      await load();
    } catch (err) {
      say("error", api.errMsg(err));
    }
  };

  // Filter out users who are already registered as teachers
  const takenUserIds = new Set(teachers.map((t) => api.idOf(t.userId)));
  const freeUsers = users.filter((u) => !takenUserIds.has(u._id));

  // Client search filter
  const filteredTeachers = teachers.filter((t) => {
    const name = t.userId?.name?.toLowerCase() || "";
    const email = t.userId?.email?.toLowerCase() || "";
    const designation = t.designation?.toLowerCase() || "";
    const dept = t.departmentId?.name?.toLowerCase() || "";
    const q = searchTerm.toLowerCase();
    return name.includes(q) || email.includes(q) || designation.includes(q) || dept.includes(q);
  });

  return (
    <div className="teachers-page" style={{ padding: 0 }}>
      {/* Page Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-3 border-bottom gap-3">
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--ums-gray-800, #1e293b)', margin: 0 }}>
            <i className="fas fa-chalkboard-teacher me-2" style={{ color: 'var(--ums-primary-mid, #2d6a9f)' }}></i>
            Teachers Directory
          </h2>
          <p style={{ color: 'var(--ums-gray-500, #64748b)', margin: '4px 0 0 0', fontSize: '0.88rem' }}>
            Manage academic teaching faculty, department associations, and subject specialization
          </p>
        </div>
        <div>
          <button
            onClick={openNew}
            className="btn d-flex align-items-center gap-2"
            style={{
              backgroundColor: 'var(--ums-primary-mid, #2d6a9f)',
              color: '#ffffff',
              borderRadius: '10px',
              fontSize: '0.9rem',
              fontWeight: 600
            }}
          >
            <i className="fas fa-plus"></i> Add Teacher
          </button>
        </div>
      </div>

      {notice && (
        <div
          role="status"
          className={`alert d-flex align-items-center justify-content-between mb-4 ${
            notice.type === "error" ? "alert-danger" : "alert-success"
          }`}
          style={{ borderRadius: '12px' }}
        >
          <div>
            <i className={`fas ${notice.type === "error" ? "fa-exclamation-circle" : "fa-check-circle"} me-2`}></i>
            {notice.text}
          </div>
          <button onClick={() => setNotice(null)} className="btn-close" aria-label="Close"></button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '14px', background: '#ffffff' }}>
        <div className="card-body p-3">
          <div className="row g-2 align-items-center">
            <div className="col-12 col-md-5">
              <div className="input-group">
                <span className="input-group-text bg-transparent border-end-0 text-muted">
                  <i className="fas fa-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search teacher by name, email, or designation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ fontSize: '0.9rem' }}
                />
              </div>
            </div>
            <div className="col-6 col-md-4">
              <select
                className="form-select"
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                style={{ fontSize: '0.9rem' }}
              >
                <option value="">All Departments</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-6 col-md-3">
              <select
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={{ fontSize: '0.9rem' }}
              >
                <option value="true">Active Teachers</option>
                <option value="false">Inactive Teachers</option>
                <option value="">All Statuses</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="card border-0 shadow-sm" style={{ borderRadius: '14px', background: '#ffffff', overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.9rem' }}>
            <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <tr>
                <th className="py-3 px-3" style={{ fontWeight: 700, color: '#475569' }}>Teacher</th>
                <th className="py-3 px-3" style={{ fontWeight: 700, color: '#475569' }}>Department</th>
                <th className="py-3 px-3" style={{ fontWeight: 700, color: '#475569' }}>Designation</th>
                <th className="py-3 px-3" style={{ fontWeight: 700, color: '#475569' }}>Specialization</th>
                <th className="py-3 px-3" style={{ fontWeight: 700, color: '#475569' }}>Status</th>
                <th className="py-3 px-3 text-end" style={{ fontWeight: 700, color: '#475569' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className="py-5 text-center text-muted">
                    <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                    Loading teachers data...
                  </td>
                </tr>
              )}

              {!loading && filteredTeachers.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-5 text-center text-muted">
                    <i className="fas fa-user-graduate fa-2x mb-2 d-block text-secondary"></i>
                    {teachers.length === 0 ? "No teachers found. Click '+ Add Teacher' to register one." : "No teachers match your search filter."}
                  </td>
                </tr>
              )}

              {!loading && filteredTeachers.map((t) => (
                <tr key={t._id} style={{ borderBottom: '1px solid #f1f5f9', opacity: t.isActive ? 1 : 0.65 }}>
                  <td className="py-3 px-3">
                    <div className="d-flex align-items-center gap-2.5">
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: 'rgba(37, 99, 235, 0.1)',
                          color: '#2563eb',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.85rem'
                        }}
                      >
                        {(t.userId?.name || 'T').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <strong style={{ color: '#1e293b' }}>{t.userId?.name || 'Unnamed Teacher'}</strong>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{t.userId?.email || '—'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="badge bg-light text-dark border">
                      {t.departmentId?.name || "General"}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-secondary font-weight-500">{t.designation || "Lecturer"}</td>
                  <td className="py-3 px-3">
                    <div className="d-flex flex-wrap gap-1">
                      {(t.specialization || []).length > 0 ? (
                        t.specialization.map((spec, i) => (
                          <span key={i} className="badge bg-light text-primary border" style={{ fontSize: '0.72rem' }}>
                            {spec}
                          </span>
                        ))
                      ) : (
                        <span className="text-muted" style={{ fontSize: '0.8rem' }}>—</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className="badge"
                      style={{
                        background: t.isActive ? '#dcfce7' : '#f1f5f9',
                        color: t.isActive ? '#15803d' : '#64748b',
                        fontWeight: 600,
                        borderRadius: '6px',
                        padding: '5px 10px'
                      }}
                    >
                      {t.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-end">
                    <div className="d-inline-flex gap-2">
                      <button
                        onClick={() => openEdit(t)}
                        className="btn btn-sm btn-light text-primary"
                        title="Edit Teacher"
                      >
                        <i className="fas fa-edit me-1"></i> Edit
                      </button>
                      {t.isActive ? (
                        <button
                          onClick={() => deactivate(t)}
                          className="btn btn-sm btn-light text-danger"
                          title="Deactivate Teacher"
                        >
                          <i className="fas fa-ban me-1"></i> Deactivate
                        </button>
                      ) : (
                        <button
                          onClick={() => reactivate(t)}
                          className="btn btn-sm btn-light text-success"
                          title="Activate Teacher"
                        >
                          <i className="fas fa-check-circle me-1"></i> Activate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {editing && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{ background: 'rgba(15, 23, 42, 0.65)', zIndex: 1050, backdropFilter: 'blur(3px)' }}
        >
          <div
            className="card border-0 shadow-lg"
            style={{ width: '100%', maxWidth: '580px', borderRadius: '16px', background: '#ffffff' }}
          >
            <form onSubmit={submit}>
              {/* Modal Header */}
              <div className="d-flex justify-content-between align-items-center px-4 py-3 border-bottom">
                <h5 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2">
                  <i className="fas fa-chalkboard-teacher" style={{ color: 'var(--ums-primary-mid, #2d6a9f)' }}></i>
                  {editing === "new" ? "Register Teacher" : "Edit Teacher Profile"}
                </h5>
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="btn btn-sm btn-light text-muted rounded-circle"
                  style={{ width: '32px', height: '32px' }}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-4">
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label fw-semibold text-secondary" style={{ fontSize: '0.85rem' }}>Select User Account *</label>
                    {editing === "new" ? (
                      <select
                        required
                        className="form-select"
                        value={form.userId}
                        onChange={(e) => setForm({ ...form, userId: e.target.value })}
                        style={{ fontSize: '0.9rem' }}
                      >
                        <option value="">Choose eligible user...</option>
                        {freeUsers.map((u) => (
                          <option key={u._id} value={u._id}>
                            {u.name} ({u.email})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        disabled
                        className="form-control bg-light"
                        value={editing.userId?.name || ""}
                        style={{ fontSize: '0.9rem' }}
                      />
                    )}
                  </div>

                  <div className="col-12">
                    <label className="form-label fw-semibold text-secondary" style={{ fontSize: '0.85rem' }}>Department *</label>
                    <select
                      required
                      className="form-select"
                      value={form.departmentId}
                      onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
                      style={{ fontSize: '0.9rem' }}
                    >
                      <option value="">Select department...</option>
                      {departments.map((d) => (
                        <option key={d._id} value={d._id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold text-secondary" style={{ fontSize: '0.85rem' }}>Designation</label>
                    <input
                      type="text"
                      className="form-control"
                      value={form.designation}
                      onChange={(e) => setForm({ ...form, designation: e.target.value })}
                      placeholder="e.g. Associate Professor"
                      style={{ fontSize: '0.9rem' }}
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold text-secondary" style={{ fontSize: '0.85rem' }}>Joining Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={form.joiningDate}
                      onChange={(e) => setForm({ ...form, joiningDate: e.target.value })}
                      style={{ fontSize: '0.9rem' }}
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label fw-semibold text-secondary" style={{ fontSize: '0.85rem' }}>Subject Specializations</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Separate with commas, e.g. Data Structures, Algorithms, AI"
                      value={form.specialization}
                      onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                      style={{ fontSize: '0.9rem' }}
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="d-flex justify-content-end gap-2 px-4 py-3 border-top bg-light" style={{ borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px' }}>
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="btn btn-outline-secondary btn-sm px-3"
                  style={{ borderRadius: '8px', fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="btn btn-sm px-3 text-white"
                  style={{
                    backgroundColor: 'var(--ums-primary-mid, #2d6a9f)',
                    borderRadius: '8px',
                    fontWeight: 600
                  }}
                >
                  {busy ? <><i className="fas fa-spinner fa-spin me-1"></i> Saving...</> : editing === "new" ? "Create Teacher" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}