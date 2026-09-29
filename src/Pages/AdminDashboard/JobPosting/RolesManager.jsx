// src/pages/cms/RolesManager.jsx
import { Fragment, useEffect, useMemo, useState } from "react";
import axios from "axios";

/* ---------- API (token key / baseURL apne hisab se change karo) ---------- */
const api = axios.create({ baseURL: "/api/cms" });
api.interceptors.request.use((cfg) => {
  const token = sessionStorage.getItem("token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

const errMsg = (e) => e?.response?.data?.message || e.message || "Something went wrong";

/* Role.permissions array of objects ho ya grouped object, dono se keys nikalo */
const toKeys = (perms) => {
  if (!perms) return [];
  const list = Array.isArray(perms) ? perms : Object.values(perms).flat();
  return list.map((p) => (typeof p === "string" ? p : p.key));
};

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/* Role permissions ko { module: [actions] } mein badlo (table ke liye) */
const groupByModule = (perms) => {
  if (!perms) return {};
  if (!Array.isArray(perms)) {
    return Object.fromEntries(
      Object.entries(perms).map(([m, items]) => [
        m,
        items.map((i) => (typeof i === "string" ? i.split(":")[1] : i.action)),
      ])
    );
  }
  return perms.reduce((acc, p) => {
    (acc[p.module] ||= []).push(p.action);
    return acc;
  }, {});
};

/* ============================================================
   ROLE MODAL (create + edit)
   ============================================================ */
function RoleModal({ role, groups, onClose, onSaved }) {
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
      const mods = Object.entries(modules).filter(([m]) => m.includes(q));
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
      const permissions = [...selected];
      if (isEdit) {
        await api.put(`/roles/${role._id}`, { name: name.trim(), description });
        if (!isSuperAdmin) await api.patch(`/roles/${role._id}/permissions`, { permissions });
      } else {
        await api.post("/roles", { name: name.trim(), description, permissions });
      }
      onSaved();
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">
            {isEdit ? `Edit role: ${role.name}` : "Create role"}
          </h2>
          <button onClick={onClose} className="rounded p-1 text-slate-500 hover:bg-slate-100" aria-label="Close">
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Role name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={role?.isSystemRole}
                placeholder="e.g. Exam Hall Staff"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:bg-slate-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this role for?"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
          </div>

          <div>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-slate-800">
                Permissions <span className="font-normal text-slate-500">({selected.size} selected)</span>
              </h3>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search module..."
                className="w-56 rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>

            {isSuperAdmin && (
              <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
                Super Admin permissions cannot be modified.
              </p>
            )}

            <div className={`space-y-6 ${isSuperAdmin ? "pointer-events-none opacity-60" : ""}`}>
              {Object.entries(filteredGroups).map(([category, modules]) => (
                <section key={category}>
                  <h4 className="mb-2 text-sm font-semibold text-indigo-700">{cap(category)}</h4>
                  <div className="divide-y divide-slate-100 rounded-lg border border-slate-200">
                    {Object.entries(modules).map(([module, items]) => {
                      const allOn = items.every((i) => selected.has(i.key));
                      const someOn = items.some((i) => selected.has(i.key));
                      return (
                        <div key={module} className="flex flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
                          <label className="flex w-52 cursor-pointer items-center gap-2 text-sm font-medium text-slate-800">
                            <input
                              type="checkbox"
                              checked={allOn}
                              ref={(el) => el && (el.indeterminate = someOn && !allOn)}
                              onChange={() => toggleModule(items)}
                              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            {cap(module)}
                          </label>
                          <div className="flex flex-wrap gap-x-5 gap-y-1">
                            {items.map((p) => (
                              <label
                                key={p.key}
                                title={p.label}
                                className="flex cursor-pointer items-center gap-1.5 text-sm text-slate-600"
                              >
                                <input
                                  type="checkbox"
                                  checked={selected.has(p.key)}
                                  onChange={() => toggle(p.key)}
                                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                {p.action}
                              </label>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              ))}
              {!Object.keys(filteredGroups).length && (
                <p className="text-sm text-slate-500">No module matches your search.</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-slate-200 px-6 py-4">
          <p className="text-sm text-red-600">{error}</p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {saving ? "Saving..." : isEdit ? "Save changes" : "Create role"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   ROLES PAGE
   ============================================================ */
export default function RolesManager() {
  const [roles, setRoles] = useState([]);
  const [groups, setGroups] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null); // null | "create" | roleObject
  const [expanded, setExpanded] = useState(null); // role _id jiski permissions khuli hain

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [r, p] = await Promise.all([
        api.get("/roles"),
        api.get("/permissions/grouped", { params: { groupBy: "category" } }),
      ]);
      setRoles(r.data.roles);
      setGroups(p.data.grouped);
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleToggle = async (role) => {
    try {
      await api.patch(`/roles/${role._id}/toggle`);
      load();
    } catch (e) {
      setError(errMsg(e));
    }
  };

  const handleDelete = async (role) => {
    if (!window.confirm(`Delete role "${role.name}"?`)) return;
    try {
      await api.delete(`/roles/${role._id}`);
      load();
    } catch (e) {
      setError(errMsg(e));
    }
  };

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Roles</h1>
          <p className="text-sm text-slate-500">Create roles and choose what each one can do.</p>
        </div>
        <button
          onClick={() => setModal("create")}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          + Create role
        </button>
      </div>

      {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Permissions</th>
              <th className="px-4 py-3 font-medium">Users</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  Loading roles...
                </td>
              </tr>
            )}
            {!loading && !roles.length && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  No roles yet. Create your first role.
                </td>
              </tr>
            )}
            {roles.map((role) => (
              <Fragment key={role._id}>
              <tr className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 font-medium text-slate-900">
                    {role.name}
                    {role.isSystemRole && (
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-normal text-slate-600">
                        System
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500">{role.description || role.slug}</div>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => setExpanded(expanded === role._id ? null : role._id)}
                    className="text-indigo-600 hover:underline"
                  >
                    {toKeys(role.permissions).length} {expanded === role._id ? "▲" : "▼"}
                  </button>
                </td>
                <td className="px-4 py-3 text-slate-700">{role.userCount ?? 0}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      role.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {role.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setModal(role)}
                      className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Edit
                    </button>
                    {!role.isSystemRole && (
                      <>
                        <button
                          onClick={() => handleToggle(role)}
                          className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          {role.isActive ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          onClick={() => handleDelete(role)}
                          className="rounded-lg border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
              {expanded === role._id && (
                <tr className="bg-slate-50">
                  <td colSpan={5} className="px-4 py-4">
                    {toKeys(role.permissions).length === 0 ? (
                      <p className="text-sm text-slate-500">No permissions assigned.</p>
                    ) : (
                      <div className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
                        {Object.entries(groupByModule(role.permissions)).map(([module, actions]) => (
                          <div key={module} className="flex items-start gap-3 text-sm">
                            <span className="w-40 shrink-0 font-medium text-slate-800">{cap(module)}</span>
                            <div className="flex flex-wrap gap-1.5">
                              {actions.map((a) => (
                                <span
                                  key={a}
                                  className="rounded bg-indigo-50 px-2 py-0.5 text-xs text-indigo-700"
                                >
                                  {a}
                                </span>
                              ))}
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
