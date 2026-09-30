// src/pages/roles/RoleModal.jsx
import { useMemo, useState } from "react";
import { createRole, updateRole } from "../../../services/roleService";
import { getErrorMessage } from "../../../services/api";

const cap = (s = "") => s.charAt(0).toUpperCase() + s.slice(1);

// Role.permissions objects ya strings dono se keys nikalo
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">
            {isEdit ? `Edit role: ${role.name}` : "Create role"}
          </h2>
          <button onClick={onClose} aria-label="Close" className="rounded p-1 text-slate-500 hover:bg-slate-100">
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
                Super Admin permissions cannot be changed.
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