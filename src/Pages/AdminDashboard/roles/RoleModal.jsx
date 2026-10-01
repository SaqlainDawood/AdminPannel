// src/pages/roles/RoleModal.jsx
import { useMemo, useState } from "react";
import { createRole, updateRole } from "../../../services/roleService";
import { getErrorMessage } from "../../../services/api";

const cap = (s = "") => s.charAt(0).toUpperCase() + s.slice(1);

// Role.permissions objects or strings keys
const toKeys = (perms = []) => perms.map((p) => (typeof p === "string" ? p : p.key));

export default function RoleModal({ role, groups, onClose, onSaved }) {
  const isEdit = !!role;
  const isSuperAdmin = role?.slug === "super-admin";

  const [name, setName] = useState(role?.name || "");
  const [description, setDescription] = useState(role?.description || "");
  const [selected, setSelected] = useState(new Set(toKeys(role?.permissions)));
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const filteredGroups = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return groups;
    const out = {};
    Object.entries(groups).forEach(([category, modules]) => {
      const mods = Object.entries(modules).filter(([m]) => m.toLowerCase().includes(q));
      if (mods.length) out[category] = Object.fromEntries(mods);
    });
    return out;
  }, [groups, search]);

  const toggle = (key) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  const toggleModule = (items) =>
    setSelected((prev) => {
      const next = new Set(prev);
      const keys = items.map((i) => i.key);
      const allOn = keys.every((k) => next.has(k));
      keys.forEach((k) => (allOn ? next.delete(k) : next.add(k)));
      return next;
    });

  const handleSave = async () => {
    if (!name.trim()) return setError("Role name is required");
    setSaving(true);
    setError("");
    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        permissions: [...selected],
      };
      if (isEdit) await updateRole(role._id, payload);
      else await createRole(payload);
      onSaved();
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
      style={{ background: 'rgba(15, 23, 42, 0.65)', zIndex: 1050, backdropFilter: 'blur(3px)' }}
    >
      <div
        className="card border-0 shadow-lg d-flex flex-column"
        style={{ width: '100%', maxWidth: '840px', maxHeight: '90vh', borderRadius: '16px', background: '#ffffff' }}
      >
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center px-4 py-3 border-bottom">
          <h5 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2">
            <i className="fas fa-shield-alt" style={{ color: 'var(--ums-primary-mid, #2d6a9f)' }}></i>
            {isEdit ? `Edit Role: ${role.name}` : "Create New Role"}
          </h5>
          <button
            onClick={onClose}
            className="btn btn-sm btn-light text-muted rounded-circle"
            style={{ width: '32px', height: '32px' }}
            aria-label="Close"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Body */}
        <div className="flex-grow-1 overflow-auto p-4">
          <div className="row g-3 mb-4">
            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold text-secondary" style={{ fontSize: '0.85rem' }}>Role Name *</label>
              <input
                type="text"
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={role?.isSystemRole}
                placeholder="e.g. Academic Coordinator"
                style={{ fontSize: '0.9rem' }}
              />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold text-secondary" style={{ fontSize: '0.85rem' }}>Description</label>
              <input
                type="text"
                className="form-control"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief purpose of this role"
                style={{ fontSize: '0.9rem' }}
              />
            </div>
          </div>

          <div className="border-top pt-3">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
              <div>
                <h6 className="fw-bold text-dark mb-0">Module Permissions</h6>
                <small className="text-muted">{selected.size} total capabilities granted</small>
              </div>
              <div style={{ maxWidth: '260px', width: '100%' }}>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Filter permissions..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {isSuperAdmin && (
              <div className="alert alert-warning py-2 px-3 mb-3" style={{ fontSize: '0.85rem', borderRadius: '8px' }}>
                <i className="fas fa-info-circle me-1"></i> System Super Admin permissions cannot be modified.
              </div>
            )}

            <div style={{ opacity: isSuperAdmin ? 0.6 : 1, pointerEvents: isSuperAdmin ? 'none' : 'auto' }}>
              {Object.entries(filteredGroups).map(([category, modules]) => (
                <div key={category} className="mb-4">
                  <div className="fw-bold text-primary mb-2 text-uppercase" style={{ fontSize: '0.78rem', letterSpacing: '0.5px' }}>
                    {cap(category)}
                  </div>
                  <div className="card border p-2 mb-2" style={{ borderRadius: '10px', background: '#fafbfc' }}>
                    {Object.entries(modules).map(([module, items]) => {
                      const allOn = items.every((i) => selected.has(i.key));
                      const someOn = items.some((i) => selected.has(i.key));
                      return (
                        <div key={module} className="d-flex flex-wrap align-items-center justify-content-between p-2 border-bottom last-border-0">
                          <label className="form-check-label fw-bold text-dark d-flex align-items-center gap-2" style={{ minWidth: '180px', cursor: 'pointer', fontSize: '0.88rem' }}>
                            <input
                              type="checkbox"
                              className="form-check-input mt-0"
                              checked={allOn}
                              ref={(el) => el && (el.indeterminate = someOn && !allOn)}
                              onChange={() => toggleModule(items)}
                            />
                            {cap(module)}
                          </label>

                          <div className="d-flex flex-wrap gap-2">
                            {items.map((p) => (
                              <label
                                key={p.key}
                                title={p.label}
                                className="badge bg-white text-dark border d-flex align-items-center gap-1.5 px-2 py-1.5"
                                style={{ cursor: 'pointer', fontWeight: 500, fontSize: '0.78rem' }}
                              >
                                <input
                                  type="checkbox"
                                  className="form-check-input mt-0"
                                  checked={selected.has(p.key)}
                                  onChange={() => toggle(p.key)}
                                  style={{ width: '13px', height: '13px' }}
                                />
                                {p.action}
                              </label>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {!Object.keys(filteredGroups).length && (
                <p className="text-muted text-center py-3 mb-0" style={{ fontSize: '0.88rem' }}>No modules match your search filter.</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="d-flex justify-content-between align-items-center px-4 py-3 border-top bg-light" style={{ borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px' }}>
          <div>
            {error && <span className="text-danger small">{error}</span>}
          </div>
          <div className="d-flex gap-2">
            <button
              onClick={onClose}
              className="btn btn-outline-secondary btn-sm px-3"
              style={{ borderRadius: '8px', fontWeight: 600 }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn btn-sm px-3 text-white"
              style={{
                backgroundColor: 'var(--ums-primary-mid, #2d6a9f)',
                borderRadius: '8px',
                fontWeight: 600
              }}
            >
              {saving ? <><i className="fas fa-spinner fa-spin me-1"></i> Saving...</> : isEdit ? "Save Changes" : "Create Role"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}