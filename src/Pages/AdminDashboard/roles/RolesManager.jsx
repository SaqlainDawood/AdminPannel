// src/pages/roles/RolesManager.jsx
import { Fragment, useEffect, useState } from "react";
import { getRoles, deleteRole } from "../../../services/roleService";
import { getPermissions, groupPermissions } from "../../../services/permissionService";
import { getErrorMessage } from "../../../services/api";
import RoleModal from "./RoleModal";

const cap = (s = "") => s.charAt(0).toUpperCase() + s.slice(1);

// Role ki permissions ko { module: [actions] } me badlo
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
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">Loading roles...</td>
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
                      {role.permissions?.length || 0} {expanded === role._id ? "▲" : "▼"}
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
                        <button
                          onClick={() => handleDelete(role)}
                          className="rounded-lg border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>

                {expanded === role._id && (
                  <tr className="bg-slate-50">
                    <td colSpan={5} className="px-4 py-4">
                      {!role.permissions?.length ? (
                        <p className="text-sm text-slate-500">No permissions assigned.</p>
                      ) : (
                        <div className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
                          {Object.entries(groupByModule(role.permissions)).map(([module, actions]) => (
                            <div key={module} className="flex items-start gap-3 text-sm">
                              <span className="w-40 shrink-0 font-medium text-slate-800">{cap(module)}</span>
                              <div className="flex flex-wrap gap-1.5">
                                {actions.map((a) => (
                                  <span key={a} className="rounded bg-indigo-50 px-2 py-0.5 text-xs text-indigo-700">
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