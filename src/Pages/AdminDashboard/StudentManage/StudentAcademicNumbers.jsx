import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import AdminAPI from '../../../api';

const initialFilters = {
  department: '',
  degreeClass: '',
  session: '',
  batch: '',
  semester: '',
  approvalStatus: 'approved',
  registrationStatus: 'all',
  rollStatus: 'all',
  search: '',
};

const StudentAcademicNumbers = () => {
  const [filters, setFilters] = useState(initialFilters);
  const [students, setStudents] = useState([]);
  const [summary, setSummary] = useState({
    total: 0,
    approved: 0,
    registrationAssigned: 0,
    registrationPending: 0,
    rollAssigned: 0,
    rollPending: 0,
  });
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bulkForm, setBulkForm] = useState({
    department: '',
    degreeClass: '',
    session: '',
    batch: '',
    startRegistrationNumber: 'BSF2205801',
    startRollNumber: '001',
    orderBy: 'merit',
    mode: 'CLASS',
  });

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = { ...filters, page: 1, limit: 20 };
      const response = await AdminAPI.get('/students/academic-numbers', { params });
      const rows = response?.data?.students || [];
      setStudents(rows);
      setSummary({
        total: response?.data?.total || rows.length,
        approved: rows.length,
        registrationAssigned: rows.filter((row) => row.registrationAssigned).length,
        registrationPending: rows.filter((row) => !row.registrationAssigned).length,
        rollAssigned: rows.filter((row) => row.rollAssigned).length,
        rollPending: rows.filter((row) => !row.rollAssigned).length,
      });
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to load academic numbers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleBulkChange = (event) => {
    const { name, value } = event.target;
    setBulkForm((prev) => ({ ...prev, [name]: value }));
  };

  const previewAssignment = async () => {
    try {
      const payload = { ...bulkForm, mode: bulkForm.mode || 'CLASS' };
      const response = await AdminAPI.post('/students/academic-numbers/preview', payload);
      setPreview(response?.data || null);
      toast.success('Bulk preview generated');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Preview failed');
    }
  };

  const confirmAssignment = async () => {
    try {
      const response = await AdminAPI.post('/students/academic-numbers/assign-bulk', bulkForm);
      toast.success(response?.data?.message || 'Academic numbers assigned');
      await fetchStudents();
      setPreview(null);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Assignment failed');
    }
  };

  const tableRows = useMemo(() => students, [students]);

  return (
    <div style={{ padding: '1rem' }}>
      <h3>Student Academic Numbers</h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
        <div className="card border-0 shadow-sm p-3">
          <strong>Total</strong>
          <div className="display-6">{summary.total}</div>
        </div>
        <div className="card border-0 shadow-sm p-3">
          <strong>Approved</strong>
          <div className="display-6">{summary.approved}</div>
        </div>
        <div className="card border-0 shadow-sm p-3">
          <strong>Registration</strong>
          <div>{summary.registrationAssigned} / {summary.registrationAssigned + summary.registrationPending}</div>
        </div>
        <div className="card border-0 shadow-sm p-3">
          <strong>Roll</strong>
          <div>{summary.rollAssigned} / {summary.rollAssigned + summary.rollPending}</div>
        </div>
      </div>

      <div className="card border-0 shadow-sm p-3 mb-3">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          <input className="form-control" name="department" value={filters.department} onChange={handleFilterChange} placeholder="Department" />
          <input className="form-control" name="degreeClass" value={filters.degreeClass} onChange={handleFilterChange} placeholder="Degree Class" />
          <input className="form-control" name="session" value={filters.session} onChange={handleFilterChange} placeholder="Session" />
          <input className="form-control" name="batch" value={filters.batch} onChange={handleFilterChange} placeholder="Batch" />
          <input className="form-control" name="semester" value={filters.semester} onChange={handleFilterChange} placeholder="Semester" />
          <select className="form-select" name="registrationStatus" value={filters.registrationStatus} onChange={handleFilterChange}>
            <option value="all">Registration: All</option>
            <option value="assigned">Assigned</option>
            <option value="unassigned">Unassigned</option>
          </select>
          <select className="form-select" name="rollStatus" value={filters.rollStatus} onChange={handleFilterChange}>
            <option value="all">Roll: All</option>
            <option value="assigned">Assigned</option>
            <option value="unassigned">Unassigned</option>
          </select>
          <select className="form-select" name="approvalStatus" value={filters.approvalStatus} onChange={handleFilterChange}>
            <option value="approved">Approved</option>
            <option value="all">All</option>
          </select>
          <input className="form-control" name="search" value={filters.search} onChange={handleFilterChange} placeholder="Search Name / Email / CNIC / Number" />
        </div>
        <div className="mt-3 d-flex gap-2">
          <button className="btn btn-primary" onClick={fetchStudents}>Apply Filters</button>
          <button className="btn btn-outline-secondary" onClick={() => setFilters(initialFilters)}>Reset</button>
        </div>
      </div>

      <div className="card border-0 shadow-sm p-3 mb-3">
        <h5>Bulk Academic Number Assignment</h5>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          <input className="form-control" name="department" value={bulkForm.department} onChange={handleBulkChange} placeholder="Department ID" />
          <input className="form-control" name="degreeClass" value={bulkForm.degreeClass} onChange={handleBulkChange} placeholder="Degree Class ID" />
          <input className="form-control" name="session" value={bulkForm.session} onChange={handleBulkChange} placeholder="Session ID" />
          <input className="form-control" name="batch" value={bulkForm.batch} onChange={handleBulkChange} placeholder="Batch ID" />
          <input className="form-control" name="startRegistrationNumber" value={bulkForm.startRegistrationNumber} onChange={handleBulkChange} placeholder="Registration Start" />
          <input className="form-control" name="startRollNumber" value={bulkForm.startRollNumber} onChange={handleBulkChange} placeholder="Roll Start" />
          <select className="form-select" name="orderBy" value={bulkForm.orderBy} onChange={handleBulkChange}>
            <option value="merit">Merit</option>
            <option value="name">Name</option>
            <option value="applicationDate">Application Date</option>
            <option value="studentId">Student ID</option>
          </select>
          <select className="form-select" name="mode" value={bulkForm.mode} onChange={handleBulkChange}>
            <option value="CLASS">Entire Class</option>
            <option value="SELECTED">Selected Students</option>
          </select>
        </div>
        <div className="mt-3 d-flex gap-2">
          <button className="btn btn-primary" onClick={previewAssignment}>Preview Assignment</button>
          {preview && (
            <button className="btn btn-success" onClick={confirmAssignment}>Confirm Bulk Assignment</button>
          )}
        </div>
      </div>

      {preview && (
        <div className="card border-0 shadow-sm p-3 mb-3">
          <h5>Preview</h5>
          <p><strong>Registration:</strong> {preview.registrationStart} → {preview.registrationEnd}</p>
          <p><strong>Roll:</strong> {preview.rollStart} → {preview.rollEnd}</p>
          <p><strong>Total Students:</strong> {preview.totalStudents} | <strong>Approved:</strong> {preview.approvedStudents}</p>
          {preview.conflicts?.length > 0 ? (
            <div className="alert alert-danger">
              {preview.conflicts.map((item) => <div key={item}>{item}</div>)}
            </div>
          ) : (
            <div className="alert alert-success">No conflicts detected.</div>
          )}
          <div className="table-responsive">
            <table className="table table-bordered table-striped">
              <thead>
                <tr>
                  <th>Sr</th>
                  <th>Student</th>
                  <th>Registration</th>
                  <th>Roll</th>
                </tr>
              </thead>
              <tbody>
                {(preview.rows || []).map((row) => (
                  <tr key={row.studentId}>
                    <td>{row.sr}</td>
                    <td>{row.name}</td>
                    <td>{row.registrationNumber}</td>
                    <td>{row.rollNumber}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="card border-0 shadow-sm p-3">
        <div className="table-responsive">
          <table className="table table-striped table-bordered">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Degree Class</th>
                <th>Batch</th>
                <th>Registration</th>
                <th>Roll</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center text-muted">No approved students found.</td>
                </tr>
              )}
              {tableRows.map((student) => (
                <tr key={student.studentId || student._id}>
                  <td>{student.name}</td>
                  <td>{student.email}</td>
                  <td>{student.department}</td>
                  <td>{student.degreeClass}</td>
                  <td>{student.batch}</td>
                  <td>{student.registrationNumber || 'Unassigned'}</td>
                  <td>{student.rollNumber || 'Unassigned'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentAcademicNumbers;
