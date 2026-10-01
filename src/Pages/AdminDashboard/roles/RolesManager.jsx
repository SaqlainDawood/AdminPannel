// src/pages/roles/RolesManager.jsx
import { Fragment, useEffect, useState } from "react";
import { getRoles, deleteRole } from "../../../services/roleService";
import { getPermissions, groupPermissions } from "../../../services/permissionService";
import { getErrorMessage } from "../../../services/api";
import RoleModal from "./RoleModal";

const cap = (s = "") => s.charAt(0).toUpperCase() + s.slice(1);

// Role permissions mapped to { module: [actions] }
const groupByModule = (perms = []) =>
  perms.reduce((acc, p) => {
    (acc[p.module] ||= []).push(p.action);
    return acc;
  }, {});

export default function RolesManager() {
  const [roles, setRoles] = useState([]);
  const [groups, setGroups] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null); // null | "create" | roleObject
  const [expanded, setExpanded] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [rolesData, permsData] = await Promise.all([getRoles(), getPermissions()]);
      setRoles(Array.isArray(rolesData) ? rolesData : []);
      setGroups(groupPermissions(Array.isArray(permsData) ? permsData : []));
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (role) => {
    if (!window.confirm(`Delete role "${role.name}"?`)) return;
    try {
      await deleteRole(role._id);
      load();
    } catch (e) {
      setError(getErrorMessage(e));
    }
  };

  const filteredRoles = roles.filter((role) =>
    role.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.slug?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="roles-manager-page" style={{ padding: 0 }}>
      {/* Page Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-3 border-bottom gap-3">
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--ums-gray-800, #1e293b)', margin: 0 }}>
            <i className="fas fa-user-shield me-2" style={{ color: 'var(--ums-primary-mid, #2d6a9f)' }}></i>
            Roles & Permissions
          </h2>
          <p style={{ color: 'var(--ums-gray-500, #64748b)', margin: '4px 0 0 0', fontSize: '0.88rem' }}>
            Configure institutional user roles, access privileges, and capability limits
          </p>
        </div>
        <div>
          <button
            onClick={() => setModal("create")}
            className="btn d-flex align-items-center gap-2"
            style={{
              backgroundColor: 'var(--ums-primary-mid, #2d6a9f)',
              color: '#ffffff',
              borderRadius: '10px',
              fontSize: '0.9rem',
              fontWeight: 600
            }}
          >
            <i className="fas fa-plus"></i> Create Role
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger d-flex align-items-center justify-content-between mb-4" role="alert" style={{ borderRadius: '12px' }}>
          <div>
            <i className="fas fa-exclamation-circle me-2"></i>
            {error}
          </div>
          <button className="btn btn-sm btn-outline-danger" onClick={load}>Retry</button>
        </div>
      )}

      {/* Search Bar */}
      <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '14px', background: '#ffffff' }}>
        <div className="card-body p-3">
          <div className="row g-2 align-items-center">
            <div className="col-12 col-md-6">
              <div className="input-group">
                <span className="input-group-text bg-transparent border-end-0 text-muted">
                  <i className="fas fa-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search roles by title, code or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ fontSize: '0.9rem' }}
                />
              </div>
            </div>
            <div className="col-12 col-md-6 text-md-end text-muted" style={{ fontSize: '0.88rem' }}>
              Showing <strong>{filteredRoles.length}</strong> of <strong>{roles.length}</strong> roles
            </div>
          </div>
        </div>
      </div>

      {/* Roles Table */}
      <div className="card border-0 shadow-sm" style={{ borderRadius: '14px', background: '#ffffff', overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.9rem' }}>
            <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <tr>
                <th className="py-3 px-3" style={{ fontWeight: 700, color: '#475569' }}>Role</th>
                <th className="py-3 px-3" style={{ fontWeight: 700, color: '#475569' }}>Permissions</th>
                <th className="py-3 px-3" style={{ fontWeight: 700, color: '#475569' }}>Assigned Users</th>
                <th className="py-3 px-3" style={{ fontWeight: 700, color: '#475569' }}>Status</th>
                <th className="py-3 px-3 text-end" style={{ fontWeight: 700, color: '#475569' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} className="py-5 text-center text-muted">
                    <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                    Loading roles & permissions...
                  </td>
                </tr>
              )}

              {!loading && filteredRoles.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-5 text-center text-muted">
                    <i className="fas fa-shield-alt fa-2x mb-2 d-block text-secondary"></i>
                    {roles.length === 0 ? "No roles configured yet. Click '+ Create Role' to begin." : "No roles match your search query."}
                  </td>
                </tr>
              )}

              {!loading && filteredRoles.map((role) => (
                <Fragment key={role._id}>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td className="py-3 px-3">
                      <div className="d-flex align-items-center gap-2">
                        <strong style={{ color: '#1e293b' }}>{role.name}</strong>
                        {role.isSystemRole && (
                          <span className="badge" style={{ background: '#f1f5f9', color: '#475569', fontSize: '0.75rem', fontWeight: 600 }}>
                            System
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{role.description || role.slug}</div>
                    </td>

                    <td className="py-3 px-3">
                      <button
                        onClick={() => setExpanded(expanded === role._id ? null : role._id)}
                        className="btn btn-sm btn-light d-inline-flex align-items-center gap-1"
                        style={{ borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600, color: '#2563eb' }}
                      >
                        <i className="fas fa-key text-muted"></i>
                        {role.permissions?.length || 0} permissions
                        <i className={`fas fa-chevron-${expanded === role._id ? 'up' : 'down'} ms-1`} style={{ fontSize: '0.7rem' }}></i>
                      </button>
                    </td>

                    <td className="py-3 px-3">
                      <span className="badge bg-light text-dark border" style={{ fontWeight: 600 }}>
                        <i className="fas fa-users me-1 text-muted"></i> {role.userCount ?? 0}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className="badge"
                        style={{
                          background: role.isActive ? '#dcfce7' : '#f1f5f9',
                          color: role.isActive ? '#15803d' : '#64748b',
                          fontWeight: 600,
                          borderRadius: '6px',
                          padding: '5px 10px'
                        }}
                      >
                        {role.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-end">
                      <div className="d-inline-flex gap-2">
                        <button
                          onClick={() => setModal(role)}
                          className="btn btn-sm btn-light text-primary"
                          title="Edit Role & Permissions"
                        >
                          <i className="fas fa-edit me-1"></i> Edit
                        </button>
                        {!role.isSystemRole && (
                          <button
                            onClick={() => handleDelete(role)}
                            className="btn btn-sm btn-light text-danger"
                            title="Delete Role"
                          >
                            <i className="fas fa-trash-alt me-1"></i> Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>

                  {expanded === role._id && (
                    <tr style={{ background: '#f8fafc' }}>
                      <td colSpan={5} className="p-3">
                        {!role.permissions?.length ? (
                          <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>No individual permissions assigned to this role.</p>
                        ) : (
                          <div className="row g-2">
                            {Object.entries(groupByModule(role.permissions)).map(([module, actions]) => (
                              <div key={module} className="col-12 col-md-6 col-lg-4">
                                <div className="p-2 border rounded bg-white" style={{ fontSize: '0.84rem' }}>
                                  <div className="fw-bold text-dark mb-1 d-flex align-items-center gap-1">
                                    <i className="fas fa-cube text-primary" style={{ fontSize: '0.75rem' }}></i>
                                    {cap(module)}
                                  </div>
                                  <div className="d-flex flex-wrap gap-1">
                                    {actions.map((a) => (
                                      <span key={a} className="badge bg-light text-primary border" style={{ fontSize: '0.72rem' }}>
                                        {a}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <RoleModal
          role={modal === "create" ? null : modal}
          groups={groups}
          onClose={() => setModal(null)}
          onSaved={() => {
            setModal(null);
            load();
          }}
        />
      )}
    </div>
  );
}