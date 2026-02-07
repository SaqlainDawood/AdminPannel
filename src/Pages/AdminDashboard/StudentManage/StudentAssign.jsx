import React, { useEffect, useState } from 'react';
import './Student.css';
import axios from 'axios'
import { useNavigate } from 'react-router-dom';
import {toast} from 'react-toastify'
import AdminAPI from '../../../api';
const StudentAssign = () => {
  const navigate = useNavigate();
  const [newStudents, setNewStudents] = useState([]);
  const [autoGenerateMode, setAutoGenerateMode] = useState(true);
  const [rollNoPrefix, setRollNoPrefix] = useState('');
  const [startingNumber, setStartingNumber] = useState(1);
  const [selectedStudents, setSelectedStudents] = useState([]);

  const sections = ['A', 'B', 'C', 'D'];
  const departments = [...new Set(newStudents.map(s => s.department))];

  const handleSectionChange = (_id, section) => {
    setNewStudents(prev =>
      prev.map(student =>
        student._id === _id ? { ...student, section } : student
      )
    );
  };

  const handleRollNoChange = (_id, rollNo) => {
    setNewStudents(prev =>
      prev.map(student =>
        student._id === _id ? { ...student, rollNo } : student
      )
    );
  };
const handleRegistrationChange = (_id, registrationNo) => {
  setNewStudents(prev =>
    prev.map(student =>
      student._id === _id ? { ...student, registrationNo } : student
    )
  );
};

  const toggleSelectStudent = (_id) => {
    setSelectedStudents(prev =>
      prev.includes(_id) ? prev.filter(sId => sId !== _id) : [...prev, _id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedStudents.length === newStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(newStudents.map(s => s._id));
    }
  };

  const generateRollNumbers = () => {
    if (!rollNoPrefix) {
      alert('Please enter a roll number prefix!');
      return;
    }

    let counter = startingNumber;
    setNewStudents(prev =>
      prev.map(student => {
        if (selectedStudents.includes(student._id) && !student.rollNo) {
          const rollNo = `${rollNoPrefix}-${String(counter).padStart(3, '0')}`;
          counter++;
          return { ...student, rollNo };
        }
        return student;
      })
    );
  };

  
    const fetchUnassignRollStd = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        if (!token) {
          navigate('/admin/login');
          return;
        }
        const res = await AdminAPI.get("/stats/students/unassign",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        //  setUnassignedCount(res.data.count);
        console.log('API Response:', res.data); // Debug log
        if (res.data && res.data.success) {
          setNewStudents(res.data.Students || []);
        }
        else {
          toast.error('Failed to fetch students');
        }
      } catch (error) {
        console.error('Failed to fetch students:', error);
        if (error.response?.status === 401) {
          localStorage.removeItem("adminToken");
          navigate('/admin/login');
        }
      }
    }
    useEffect(()=>{
      fetchUnassignRollStd();
    },[])
    
  


  const assignRollNumbers = async() => {
    const studentsToAssign = newStudents.filter(s =>
      selectedStudents.includes(s._id) && s.rollNo &&  s.registrationNo && s.section
    );

    if (studentsToAssign.length === 0) {
      toast.info('Please select students and assign roll numbers and sections!');
      return;
    }
    try {
      const token = localStorage.getItem("adminToken");
      if(!token){
        toast.error("No Token exist , Unauthorized");
        return;
      }
      const res = await AdminAPI.put("/stats/students/assign/",
         { assignedStudents: studentsToAssign },
        {
          headers:{
            Authorization:`Bearer ${token}`
          }
        }
      )
      console.log("Server Response:", res.data);
        toast.success(res.data.message || "Roll Numbers & Registration Number Assigned Successfully!");
        fetchUnassignRollStd();
        setSelectedStudents([]);
    } catch (error) {
      console.log("Assign Error:", error.response?.data || error);

  toast.error(error.response?.data?.message || "Failed to assign roll numbers");
    }
    // const missingData = studentsToAssign.filter(s => !s.rollNo || !s.section);
    // if (missingData.length > 0) {
    //   toast.info('Some students are missing roll numbers or sections!');
    //   return;
    // }

    // // Update status
    // setNewStudents(prev =>
    //   prev.map(student =>
    //     studentsToAssign.find(s => s._id === student._id)
    //       ? { ...student, status: 'assigned' }
    //       : student
    //   )
    // );
  };

  const unassignedCount = newStudents.filter(s => !s.rollNo).length;
  const assignedCount = newStudents.filter(s => s.rollNo).length;

  return (
    <div className="assign-container">
      <div className="container-fluid">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">
              <i className="fas fa-id-card me-3"></i>Assign Roll Numbers
            </h1>
            <p className="page-subtitle">
              Assign roll numbers and sections to newly approved students
            </p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="row g-3 mb-4">
          <div className="col-6 col-md-3">
            <div className="stat-card-assign">
              <div className="stat-icon bg-warning">
                <i className="fas fa-clock"></i>
              </div>
              <div className="stat-info">
                <h3>{unassignedCount}</h3>
                <p>Pending Assignment</p>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="stat-card-assign">
              <div className="stat-icon bg-success">
                <i className="fas fa-check-circle"></i>
              </div>
              <div className="stat-info">
                <h3>{assignedCount}</h3>
                <p>Assigned Today</p>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="stat-card-assign">
              <div className="stat-icon bg-info">
                <i className="fas fa-users"></i>
              </div>
              <div className="stat-info">
                <h3>{selectedStudents.length}</h3>
                <p>Selected Students</p>
              </div>
            </div>
          </div>
        </div>

        <div className="row g-4">
          {/* Left Panel - Roll Number Generator */}
          <div className="col-lg-4">
            <div className="generator-card">
              <h3 className="card-title">
                <i className="fas fa-magic me-2"></i>Roll Number Generator
              </h3>

              <div className="generator-options">
                <div className="option-toggle">
                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      checked={autoGenerateMode}
                      onChange={(e) => setAutoGenerateMode(e.target.checked)}
                    />
                    <span className="toggle-text">Auto Generate Roll Numbers</span>
                  </label>
                </div>

                {autoGenerateMode && (
                  <div className="generator-form">
                    <div className="form-group">
                      <label className="form-label">Roll Number Prefix</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g., CS-2024"
                        value={rollNoPrefix}
                        onChange={(e) => setRollNoPrefix(e.target.value.toUpperCase())}
                      />
                      <small className="form-hint">
                        Format: DEPT-YEAR (e.g., CS-2024)
                      </small>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Starting Number</label>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="1"
                        value={startingNumber}
                        onChange={(e) => setStartingNumber(parseInt(e.target.value) || 1)}
                        min="1"
                      />
                      <small className="form-hint">
                        First roll number will be {rollNoPrefix}-{String(startingNumber).padStart(3, '0')}
                      </small>
                    </div>

                    <button
                      className="btn-generate"
                      onClick={generateRollNumbers}
                      disabled={selectedStudents.length === 0 || !rollNoPrefix}
                    >
                      <i className="fas fa-bolt me-2"></i>
                      Generate Roll Numbers
                    </button>
                  </div>
                )}
              </div>

              <div className="quick-actions">
                <h4 className="section-subtitle">Quick Actions</h4>
                <button
                  className="action-btn btn-primary-action"
                  onClick={assignRollNumbers}
                  disabled={selectedStudents.length === 0}
                >
                  <i className="fas fa-save me-2"></i>
                  Save & Assign
                </button>
                <button
                  className="action-btn btn-secondary-action"
                  onClick={() => setSelectedStudents([])}
                >
                  <i className="fas fa-times me-2"></i>
                  Clear Selection
                </button>
              </div>

              <div className="info-box">
                <i className="fas fa-info-circle"></i>
                <div>
                  <strong>Instructions:</strong>
                  <ul>
                    <li>Select students from the list</li>
                    <li>Generate or manually enter roll numbers</li>
                    <li>Assign sections to each student</li>
                    <li>Click "Save & Assign" to complete</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Students List */}
          <div className="col-lg-8">
            <div className="students-assignment-card">
              <div className="card-header-assign">
                <h3 className="card-title">
                  <i className="fas fa-list me-2"></i>Students Pending Assignment
                </h3>
                <button
                  className="btn-select-all"
                  onClick={toggleSelectAll}
                >
                  {selectedStudents.length === newStudents.length ? (
                    <>
                      <i className="fas fa-times me-2"></i>Deselect All
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check-square me-2"></i>Select All
                    </>
                  )}
                </button>
              </div>

              <div className="students-list-assign">
                {newStudents.map(student => (
                  <div
                    key={student._id}
                    className={`student-assign-card ${student.status === 'assigned' ? 'assigned' : ''} ${selectedStudents.includes(student._id) ? 'selected' : ''}`}
                  >
                    <div className="student-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student._id)}
                        onChange={() => toggleSelectStudent(student._id)}
                        disabled={student.status === 'assigned'}
                      />
                    </div>

                    <div className="student-main-info">
                      <img
                        src={student.profileImage?.url || "https://via.placeholder.com/100"}
                        alt={student.firstName}
                        className="student-photo-small" />
                      <div className="student-basic">
                        <h5 className="student-name-assign">{student.firstName + " " + student.lastName}</h5>
                        <p className="student-details-small">
                          <i className="fas fa-envelope me-2"></i>
                          {student?.user?.email}
                        </p>
                        <p className="student-details-small">
                          <i className="fas fa-graduation-cap me-2"></i>
                          {student.enrollment.program} - {student.enrollment.department}
                        </p>
                      </div>
                    </div>

                    <div className="assignment-controls">
                      <div className="control-group">
                        <label className="control-label">Roll Number</label>
                        <input
                          type="text"
                          className="control-input"
                          placeholder="Enter roll no."
                          value={student.rollNo || ""}
                          onChange={(e) => handleRollNoChange(student._id, e.target.value.toUpperCase())}
                          disabled={student.status === 'assigned'}
                        />
                      </div>
                    <div className="control-group">
  <label className="control-label">Registration No</label>
  <input
    type="text"
    className="control-input"
    placeholder="Enter Reg No."
    value={student.registrationNo || ""}
    onChange={(e) => handleRegistrationChange(student._id, e.target.value.toUpperCase())}
    disabled={student.status === 'assigned'}
  />
</div>

                      <div className="control-group">
                        <label className="control-label">Section</label>
                        <select
                          className="control-select"
                          value={student.section || ""}
                          onChange={(e) => handleSectionChange(student._id, e.target.value)}
                          disabled={student.status === 'assigned'}
                        >
                          <option value="">Select</option>
                          {sections.map(sec => (
                            <option key={sec} value={sec}>{sec}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {student.status === 'assigned' && (
                      <div className="assigned-badge">
                        <i className="fas fa-check-circle me-2"></i>
                        Assigned
                      </div>
                    )}
                  </div>
                ))}

                {newStudents.length === 0 && (
                  <div className="empty-state-assign">
                    <i className="fas fa-check-double"></i>
                    <h3>All Done!</h3>
                    <p>No students pending roll number assignment.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentAssign;