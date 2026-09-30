// src/pages/admin/Teachers.jsx
import { useEffect, useState } from "react";
import * as api from "../../../services/academicApi";

const input =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700";
const primary =
  "rounded-md bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-50";

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

  const [editing, setEditing] = useState(null); // null | "new" | teacher
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);

  const say = (type, text) => setNotice({ type, text });

  const load = () =>
    api
      .getTeachers({
        departmentId: deptFilter || undefined,
        isActive: status === "" ? undefined : status,
      })
      .then(setTeachers)
      .catch((e) => say("error", api.errMsg(e)));

  useEffect(() => {
    Promise.all([api.getDepartments(), api.getUsers({ roleSlug: "teacher" })])
      .then(([d, u]) => {
        setDepartments(d);
        setUsers(u);
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
    if (!window.confirm(`Deactivate ${t.userId?.name}?`)) return;
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

  // Jo users pehle se teacher hain unhe list se hata dein
  const takenUserIds = new Set(teachers.map((t) => api.idOf(t.userId)));
  const freeUsers = users.filter((u) => !takenUserIds.has(u._id));

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Teachers</h1>
          <p className="text-sm text-slate-600">
            Add teachers here before assigning subjects.
          </p>
        </div>
        <button onClick={openNew} className={primary}>
          Add teacher
        </button>
      </header>

      {notice && (
        <div
          role="status"
          className={`flex items-center justify-between rounded-md border px-4 py-2 text-sm ${
            notice.type === "error"
              ? "border-red-200 bg-red-50 text-red-800"
              : "border-emerald-200 bg-emerald-50 text-emerald-800"
          }`}
        >
          <span>{notice.text}</span>
          <button onClick={() => setNotice(null)} className="ml-4 font-medium">
            Close
          </button>
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm font-medium text-slate-700">
          Department
          <select className={`${input} mt-1`} value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
            <option value="">All departments</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Status
          <select className={`${input} mt-1`} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
            <option value="">All</option>
          </select>
        </label>
      </section>

      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 text-slate-700">
            <tr>
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Department</th>
              <th className="px-4 py-2 font-medium">Designation</th>
              <th className="px-4 py-2 font-medium">Specialization</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {teachers.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  No teacher found. Add a teacher to get started.
                </td>
              </tr>
            )}
            {teachers.map((t) => (
              <tr key={t._id} className={t.isActive ? "" : "bg-slate-50 text-slate-400"}>
                <td className="px-4 py-2">
                  <div className="font-medium text-slate-900">{t.userId?.name}</div>
                  <div className="text-xs text-slate-500">{t.userId?.email}</div>
                </td>
                <td className="px-4 py-2 text-slate-600">{t.departmentId?.name}</td>
                <td className="px-4 py-2 text-slate-600">{t.designation}</td>
                <td className="px-4 py-2 text-slate-600">{(t.specialization || []).join(", ") || "-"}</td>
                <td className="space-x-3 whitespace-nowrap px-4 py-2 text-right">
                  <button onClick={() => openEdit(t)} className="text-sm font-medium text-teal-700 hover:underline">
                    Edit
                  </button>
                  {t.isActive ? (
                    <button onClick={() => deactivate(t)} className="text-sm font-medium text-red-700 hover:underline">
                      Deactivate
                    </button>
                  ) : (
                    <button onClick={() => reactivate(t)} className="text-sm font-medium text-teal-700 hover:underline">
                      Activate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <form onSubmit={submit} className="w-full max-w-lg space-y-4 rounded-lg bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-900">
              {editing === "new" ? "Add teacher" : "Edit teacher"}
            </h2>

            <label className="block text-sm font-medium text-slate-700">
              User
              {editing === "new" ? (
                <select required className={`${input} mt-1`} value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })}>
                  <option value="">Select user</option>
                  {freeUsers.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
              ) : (
                <input disabled className={`${input} mt-1 bg-slate-100`} value={editing.userId?.name || ""} />
              )}
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Department
              <select required className={`${input} mt-1`} value={form.departmentId} onChange={(e) => setForm({ ...form, departmentId: e.target.value })}>
                <option value="">Select department</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700">
                Designation
                <input className={`${input} mt-1`} value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Joining date
                <input type="date" className={`${input} mt-1`} value={form.joiningDate} onChange={(e) => setForm({ ...form, joiningDate: e.target.value })} />
              </label>
            </div>

            <label className="block text-sm font-medium text-slate-700">
              Specialization
              <input
                className={`${input} mt-1`}
                placeholder="Comma se alag karein, e.g. Databases, Networking"
                value={form.specialization}
                onChange={(e) => setForm({ ...form, specialization: e.target.value })}
              />
            </label>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setEditing(null)} className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                Cancel
              </button>
              <button disabled={busy} className={primary}>
                {editing === "new" ? "Create teacher" : "Save changes"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}