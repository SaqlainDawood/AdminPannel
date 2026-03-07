import React, { useState, useEffect } from "react";
import {
  MDBContainer,
  MDBCard,
  MDBCardBody,
  MDBBtn,
  MDBIcon,
  MDBModal,
  MDBModalDialog,
  MDBModalContent,
  MDBModalHeader,
  MDBModalTitle,
  MDBModalBody,
  MDBModalFooter,
  MDBTable,
  MDBTableHead,
  MDBTableBody,
  MDBBadge,
  MDBAlert,
} from "mdb-react-ui-kit";
import AdminAPI from "../../../api";
import { toast } from "react-toastify";
import "./CreateClass.css";

const CreateClass = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [teachers, setTeachers] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [teacherSchedule, setTeacherSchedule] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scheduleConflicts, setScheduleConflicts] = useState([]);
  const [showConflictToast, setShowConflictToast] = useState(false);

  // Schedule entries state
  const [scheduleEntries, setScheduleEntries] = useState([]);
  const [currentSchedule, setCurrentSchedule] = useState({
    day: "",
    startTime: "",
    endTime: "",
    room: "",
  });

  // Form data state
  const [formData, setFormData] = useState({
    className: "",
    classCode: "",
    department: "",
    section: "",
    subject: "",
    creditHours: "",
    semester: "",
    capacity: "",
  });

  // Time slots mapping for validation
  const timeSlots = {
    "8:00": "8:00 AM",
    "9:30": "9:30 AM",
    "11:00": "11:00 AM",
    "12:30": "12:30 PM",
    "14:00": "2:00 PM",
    "15:30": "3:30 PM",
    "17:00": "5:00 PM",
    "18:30": "6:30 PM",
    "20:00": "8:00 PM"
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  useEffect(() => {
    if (filterDepartment === "all") {
      setFilteredTeachers(teachers);
    } else {
      const filtered = teachers.filter(
        (teacher) => teacher.department === filterDepartment
      );
      setFilteredTeachers(filtered);
    }
  }, [filterDepartment, teachers]);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      const response = await AdminAPI("/faculty/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("All Teachers Data", response.data);

      if (response.data && Array.isArray(response.data.data)) {
        setTeachers(response.data.data);
        setFilteredTeachers(response.data.data);
      } else if (Array.isArray(response.data)) {
        setTeachers(response.data);
        setFilteredTeachers(response.data);
      } else {
        setTeachers([]);
        setFilteredTeachers([]);
      }
    } catch (error) {
      console.error("Error fetching teachers:", error);
      toast.error("Failed to fetch teachers");
    } finally {
      setLoading(false);
    }
  };

  const fetchTeacherSchedule = async (teacherId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      
      const response = await AdminAPI(`/classes/faculty/${teacherId}/schedule`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Schedule response:", response.data);

      if (response.data && response.data.success) {
        setTeacherSchedule({
          teacherName: selectedTeacher?.name,
          department: response.data.department || selectedTeacher?.department,
          assignedClasses: response.data.assignedClasses || [],
        });
        
        if (response.data.assignedClasses?.length > 0) {
          toast.success(`Found ${response.data.assignedClasses.length} classes`);
        }
      } else {
        setTeacherSchedule({
          teacherName: selectedTeacher?.name,
          department: selectedTeacher?.department,
          assignedClasses: [],
        });
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to fetch schedule");
      setTeacherSchedule({
        teacherName: selectedTeacher?.name,
        department: selectedTeacher?.department,
        assignedClasses: [],
      });
    } finally {
      setLoading(false);
    }
  };

  // Check for schedule conflicts with existing teacher schedule
  const checkForConflicts = (newSchedule) => {
    if (!teacherSchedule?.assignedClasses || !selectedTeacher) return [];

    const conflicts = [];
    
    teacherSchedule.assignedClasses.forEach((existingClass) => {
      if (existingClass.day === newSchedule.day) {
        // Check time overlap
        const existingStart = parseInt(existingClass.startTime.split(':')[0]);
        const existingEnd = parseInt(existingClass.endTime.split(':')[0]);
        const newStart = parseInt(newSchedule.startTime.split(':')[0]);
        const newEnd = parseInt(newSchedule.endTime.split(':')[0]);

        if ((newStart >= existingStart && newStart < existingEnd) ||
            (newEnd > existingStart && newEnd <= existingEnd) ||
            (newStart <= existingStart && newEnd >= existingEnd)) {
          conflicts.push({
            ...existingClass,
            conflictType: "Time slot already taken",
            newSchedule: newSchedule
          });
        }
      }
    });

    return conflicts;
  };

  // Add schedule entry
  const handleAddSchedule = () => {
    if (!currentSchedule.day || !currentSchedule.startTime || 
        !currentSchedule.endTime || !currentSchedule.room) {
      toast.info("Please complete all schedule fields");
      return;
    }

    // Check for conflicts with existing entries in the current form
    const existingConflict = scheduleEntries.find(
      entry => entry.day === currentSchedule.day && 
               entry.startTime === currentSchedule.startTime
    );

    if (existingConflict) {
      toast.warning("This time slot is already added to the schedule");
      return;
    }

    // Check for conflicts with teacher's existing schedule
    if (selectedTeacher) {
      const conflicts = checkForConflicts(currentSchedule);
      if (conflicts.length > 0) {
        setScheduleConflicts(conflicts);
        setShowConflictToast(true);
        
        // Show conflict details in toast
        conflicts.forEach(conflict => {
          toast.error(
            `Conflict: Teacher already has ${conflict.className || conflict.classCode} on ${conflict.day} at ${conflict.startTime}-${conflict.endTime}`
          );
        });
        return;
      }
    }

    // Add to schedule entries
    setScheduleEntries([...scheduleEntries, currentSchedule]);
    
    // Reset current schedule
    setCurrentSchedule({
      day: "",
      startTime: "",
      endTime: "",
      room: "",
    });

    toast.success("Schedule added successfully");
  };

  // Remove schedule entry
  const handleRemoveSchedule = (index) => {
    const newEntries = scheduleEntries.filter((_, i) => i !== index);
    setScheduleEntries(newEntries);
    toast.info("Schedule removed");
  };

  const handleViewSchedule = (teacher) => {
    console.log("Opening modal for teacher:", teacher);
    setSelectedTeacher(teacher);
    setTeacherSchedule(null);
    setShowScheduleModal(true);
    fetchTeacherSchedule(teacher._id);
  };

  const roleMapping = {
    "Assistant Professor": "Assistant",
    "Associate Professor": "Associate",
    "Visiting Professor": "Visiting",
    "Permanent Faculty": "Permanent",
    "Lecturer": "Lecturer",
    "Lab Attendant": "Lab_Attendant",
    "Professor": "Professor"
  };

  const handleAssignTeacher = (teacher) => {
    const role = roleMapping[teacher.designation] || "Lecturer";
    setSelectedTeacher({...teacher, mappedRole: role});
    
    // Clear conflicts when new teacher is selected
    setScheduleConflicts([]);
    setScheduleEntries([]);
    
    toast.success(`${teacher.name} selected for assignment`);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleScheduleChange = (e) => {
    const { name, value } = e.target;
    setCurrentSchedule((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const departments = [
    "all",
    ...new Set(teachers.map((t) => t.department).filter(Boolean)),
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedTeacher) {
      toast.info("Please select a teacher for this class");
      return;
    }

    if (scheduleEntries.length === 0) {
      toast.info("Please add at least one schedule entry");
      return;
    }

    // Final conflict check before submission
    let allConflicts = [];
    scheduleEntries.forEach(entry => {
      const conflicts = checkForConflicts(entry);
      allConflicts = [...allConflicts, ...conflicts];
    });

    if (allConflicts.length > 0) {
      setScheduleConflicts(allConflicts);
      toast.error("Cannot create class due to schedule conflicts");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      
      if (!token) {
        toast.error("Authentication token not found. Please login again.");
        return;
      }

      const payload = {
        className: formData.className,
        classCode: formData.classCode,
        department: formData.department,
        semester: parseInt(formData.semester),
        section: formData.section,
        subject: formData.subject,
        creditHours: parseInt(formData.creditHours),
        capacity: parseInt(formData.capacity) || 50,
        teachers: [
          {
            teacher: selectedTeacher._id,
            role: selectedTeacher.mappedRole || "Lecturer",
          },
        ],
        students: [],
        schedule: scheduleEntries,
      };

      const response = await AdminAPI({
        method: 'POST',
        url: '/classes/create',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data: payload,
      });

      if (response.data && response.data.success) {
        toast.success("Class created successfully!");
        
        // Reset form
        setFormData({
          className: "",
          classCode: "",
          department: "",
          section: "",
          subject: "",
          creditHours: "",
          semester: "",
          capacity: "",
        });
        setScheduleEntries([]);
        setSelectedTeacher(null);
        setScheduleConflicts([]);
      } else {
        throw new Error(response.data.message || "Failed to create class");
      }
      
    } catch (error) {
      console.error("Error creating class:", error);
      
      if (error.response) {
        const message = error.response.data?.message || "Server error occurred";
        toast.error(message);
        
        if (error.response.status === 401) {
          toast.error("Session expired. Please login again.");
        } else if (error.response.status === 400) {
          if (error.response.data.errors) {
            error.response.data.errors.forEach(err => toast.error(err));
          }
        }
      } else if (error.request) {
        toast.error("No response from server. Please check your connection.");
      } else {
        toast.error(error.message || "Failed to create class");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <MDBContainer className="py-4">
        <MDBCard className="shadow-4">
          <MDBCardBody>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3 className="text-primary fw-bold">
                <MDBIcon fas icon="plus-square" />
                Create New Class
              </h3>
            </div>

            {/* Conflict Alert */}
            {scheduleConflicts.length > 0 && (
              <MDBAlert color="danger" className="mb-4" dismissible onClose={() => setScheduleConflicts([])}>
                <h5>
                  <MDBIcon fas icon="exclamation-triangle" className="me-2" />
                  Schedule Conflicts Detected!
                </h5>
                <ul className="mb-0">
                  {scheduleConflicts.map((conflict, index) => (
                    <li key={index}>
                      {conflict.day} at {conflict.startTime}-{conflict.endTime}:{' '}
                      <strong>{conflict.className || conflict.classCode}</strong> already scheduled in {conflict.room}
                    </li>
                  ))}
                </ul>
              </MDBAlert>
            )}

            <form onSubmit={handleSubmit}>
              {/* Class Information Card (same as before) */}
              <div className="card mb-4">
                <div className="card-header bg-primary text-white">
                  <h5 className="mb-0">
                    <MDBIcon fas icon="user" className="me-2" />
                    Class Information
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Class Name</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g., BSIT POST ADP"
                        name="className"
                        value={formData.className}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Class Code</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g., BSIT0398"
                        name="classCode"
                        value={formData.classCode}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Department</label>
                      <select
                        className="form-select"
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Department</option>
                        {departments
                          .filter((d) => d !== "all")
                          .map((dept) => (
                            <option key={dept} value={dept}>
                              {dept}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Section</label>
                      <select
                        name="section"
                        className="form-select"
                        value={formData.section}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Section</option>
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="Morning">Morning</option>
                        <option value="Evening">Evening</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Subject</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g., Fundamentals of WEB"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Credit Hours</label>
                      <select
                        className="form-select"
                        name="creditHours"
                        value={formData.creditHours}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Credit Hours</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Capacity</label>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="e.g., 50"
                        name="capacity"
                        value={formData.capacity}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Select Semester</label>
                      <select
                        className="form-select"
                        name="semester"
                        value={formData.semester}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Semester</option>
                        <option value="1">1st</option>
                        <option value="2">2nd</option>
                        <option value="3">3rd</option>
                        <option value="4">4th</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Teacher Assignment Card (same as before) */}
              <div className="card mb-4">
                <div className="card-header bg-primary text-white">
                  <h5 className="mb-0">
                    <MDBIcon fas icon="chalkboard-teacher" className="me-2" />
                    Teacher Assignment
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row mb-4">
                    <div className="col-md-4">
                      <label className="form-label fw-bold">
                        Filter by Department
                      </label>
                      <select
                        className="form-select"
                        value={filterDepartment}
                        onChange={(e) => setFilterDepartment(e.target.value)}
                      >
                        <option value="all">All Departments</option>
                        {departments
                          .filter((d) => d !== "all")
                          .map((dept) => (
                            <option key={dept} value={dept}>
                              {dept}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div className="col-md-8">
                      <label className="form-label fw-bold">
                        Search Teacher
                      </label>
                      <div className="search-wrapper">
                        <i className="fas fa-search search-icon"></i>
                        <input
                          type="text"
                          className="form-control search-input"
                          placeholder="Search by name, ID, email, department..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                          <button
                            className="clear-search"
                            onClick={() => setSearchTerm("")}
                            type="button"
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="table-responsive">
                    <table className="table table-hover teacher-table">
                      <thead className="table-light">
                        <tr>
                          <th>Teacher Name</th>
                          <th>Department</th>
                          <th>Designation</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loading ? (
                          <tr>
                            <td colSpan="5" className="text-center py-4">
                              <div
                                className="spinner-border text-primary"
                                role="status"
                              >
                                <span className="visually-hidden">
                                  Loading...
                                </span>
                              </div>
                            </td>
                          </tr>
                        ) : filteredTeachers.length > 0 ? (
                          filteredTeachers
                            .filter((teacher) => {
                              if (!searchTerm) return true;
                              const searchLower = searchTerm.toLowerCase();
                              return (
                                teacher.name
                                  ?.toLowerCase()
                                  .includes(searchLower) ||
                                teacher.employeeID
                                  ?.toLowerCase()
                                  .includes(searchLower) ||
                                teacher.email
                                  ?.toLowerCase()
                                  .includes(searchLower) ||
                                teacher.department
                                  ?.toLowerCase()
                                  .includes(searchLower) ||
                                teacher.designation
                                  ?.toLowerCase()
                                  .includes(searchLower)
                              );
                            })
                            .map((teacher) => (
                              <tr key={teacher._id}>
                                <td>
                                  <div className="d-flex align-items-center">
                                    {teacher.image && (
                                      <img
                                        src={teacher.image}
                                        alt={teacher.name}
                                        className="rounded-circle me-2"
                                        style={{
                                          width: "35px",
                                          height: "35px",
                                          objectFit: "cover",
                                        }}
                                      />
                                    )}
                                    <div>
                                      <strong>{teacher.name}</strong>
                                      <br />
                                      <small className="text-muted">
                                        {teacher.employeeID}
                                      </small>
                                    </div>
                                  </div>
                                </td>
                                <td>{teacher.department}</td>
                                <td>{teacher.designation}</td>
                                <td>
                                  <span
                                    className={`badge ${teacher.status === "Active" ? "bg-success" : "bg-warning"}`}
                                  >
                                    {teacher.status || "Active"}
                                  </span>
                                </td>
                                <td>
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-info me-2"
                                    onClick={() => handleViewSchedule(teacher)}
                                  >
                                    <MDBIcon far icon="eye" /> View
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-primary"
                                    onClick={() => handleAssignTeacher(teacher)}
                                  >
                                    <MDBIcon fas icon="user-plus" /> Assign
                                  </button>
                                </td>
                              </tr>
                            ))
                        ) : (
                          <tr>
                            <td colSpan="5" className="text-center py-4">
                              <MDBIcon
                                fas
                                icon="search"
                                size="2x"
                                className="text-muted mb-3"
                              />
                              <p className="text-muted">
                                No teachers found in this department
                              </p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {selectedTeacher && (
                    <div className="selected-teacher-info mt-3 p-3 bg-light rounded">
                      <div className="d-flex align-items-center">
                        <MDBIcon
                          fas
                          icon="check-circle"
                          className="text-success me-2"
                          size="lg"
                        />
                        <span className="fw-bold">Selected Teacher:</span>
                        <span className="ms-2">{selectedTeacher.name}</span>
                        <span className="badge bg-primary ms-2">
                          {selectedTeacher.department}
                        </span>
                        <button
                          type="button"
                          className="btn btn-sm btn-link text-danger ms-auto"
                          onClick={() => {
                            setSelectedTeacher(null);
                            setScheduleEntries([]);
                            setScheduleConflicts([]);
                          }}
                        >
                          <MDBIcon fas icon="times" /> Remove
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* UPDATED: Schedule & Timings Card with Table */}
              <div className="card mb-4">
                <div className="card-header bg-primary text-white">
                  <h5 className="mb-0">
                    <MDBIcon far icon="calendar-check" className="me-2" />
                    Schedule & Timings
                  </h5>
                </div>
                <div className="card-body">
                  {/* Schedule Entry Form */}
                  <div className="row g-3 mb-4">
                    <div className="col-md-3">
                      <label className="form-label">Day</label>
                      <select
                        className="form-select"
                        name="day"
                        value={currentSchedule.day}
                        onChange={handleScheduleChange}
                      >
                        <option value="">Select Day</option>
                        <option value="Monday">Monday</option>
                        <option value="Tuesday">Tuesday</option>
                        <option value="Wednesday">Wednesday</option>
                        <option value="Thursday">Thursday</option>
                        <option value="Friday">Friday</option>
                        <option value="Saturday">Saturday</option>
                      </select>
                    </div>
                    <div className="col-md-2">
                      <label className="form-label">Start Time</label>
                      <select
                        className="form-select"
                        name="startTime"
                        value={currentSchedule.startTime}
                        onChange={handleScheduleChange}
                      >
                        <option value="">Select</option>
                        {Object.entries(timeSlots).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-2">
                      <label className="form-label">End Time</label>
                      <select
                        className="form-select"
                        name="endTime"
                        value={currentSchedule.endTime}
                        onChange={handleScheduleChange}
                      >
                        <option value="">Select</option>
                        {Object.entries(timeSlots).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Room</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g., Room 401"
                        name="room"
                        value={currentSchedule.room}
                        onChange={handleScheduleChange}
                      />
                    </div>
                    <div className="col-md-2 d-flex align-items-end">
                      <button
                        type="button"
                        className="btn btn-success w-100"
                        onClick={handleAddSchedule}
                      >
                        <MDBIcon fas icon="plus" className="me-2" />
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Schedule Table */}
                  {scheduleEntries.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table table-bordered table-hover">
                        <thead className="table-light">
                          <tr>
                            <th>Day</th>
                            <th>Start Time</th>
                            <th>End Time</th>
                            <th>Room</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {scheduleEntries.map((entry, index) => (
                            <tr key={index}>
                              <td>
                                <MDBBadge color="info" pill>
                                  {entry.day}
                                </MDBBadge>
                              </td>
                              <td>{timeSlots[entry.startTime] || entry.startTime}</td>
                              <td>{timeSlots[entry.endTime] || entry.endTime}</td>
                              <td>
                                <MDBBadge color="secondary" pill>
                                  {entry.room}
                                </MDBBadge>
                              </td>
                              <td>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-danger"
                                  onClick={() => handleRemoveSchedule(index)}
                                >
                                  <MDBIcon fas icon="trash" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-4 bg-light rounded">
                      <MDBIcon far icon="calendar-alt" size="3x" className="text-muted mb-3" />
                      <p className="text-muted">No schedule added yet. Please add schedule entries above.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="d-flex justify-content-end">
                <button 
                  type="submit" 
                  className="btn btn-primary px-5 py-2"
                  disabled={loading || scheduleEntries.length === 0 || !selectedTeacher}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <MDBIcon fas icon="save" className="me-2" />
                      Create Class
                    </>
                  )}
                </button>
              </div>
            </form>
          </MDBCardBody>
        </MDBCard>
      </MDBContainer>

      {/* Schedule View Modal (same as before) */}
      {showScheduleModal && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="far fa-calendar-alt"></i>
                  Teacher Schedule
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setShowScheduleModal(false)}
                  aria-label="Close"
                ></button>
              </div>

              <div className="modal-body">
                {loading ? (
                  <div className="spinner-container">
                    <div className="luxury-spinner"></div>
                    <p className="text-muted">Loading schedule...</p>
                  </div>
                ) : (
                  selectedTeacher && (
                    <>
                      <div className="teacher-info-card">
                        {selectedTeacher.image && (
                          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                            <img 
                              src={selectedTeacher.image} 
                              alt={selectedTeacher.name}
                              style={{
                                width: '100px',
                                height: '100px',
                                borderRadius: '50%',
                                objectFit: 'cover',
                                border: '3px solid #667eea',
                                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                              }}
                            />
                          </div>
                        )}
                        <h5>{selectedTeacher.name}</h5>
                        <div className="info-grid">
                          <div className="info-item">
                            <i className="fas fa-building"></i>
                            <span>Department: <strong>{selectedTeacher.department}</strong></span>
                          </div>
                          <div className="info-item">
                            <i className="fas fa-id-badge"></i>
                            <span>Employee ID: <strong>{selectedTeacher.employeeID}</strong></span>
                          </div>
                          <div className="info-item">
                            <i className="fas fa-envelope"></i>
                            <span>Email: <strong>{selectedTeacher.email}</strong></span>
                          </div>
                          <div className="info-item">
                            <i className="fas fa-phone"></i>
                            <span>Phone: <strong>{selectedTeacher.phone || 'N/A'}</strong></span>
                          </div>
                          <div className="info-item">
                            <i className="fas fa-user-tie"></i>
                            <span>Designation: <strong>{selectedTeacher.designation || 'N/A'}</strong></span>
                          </div>
                          <div className="info-item">
                            <i className="fas fa-graduation-cap"></i>
                            <span>Qualification: <strong>{selectedTeacher.qualification || 'N/A'}</strong></span>
                          </div>
                          <div className="info-item">
                            <i className="fas fa-flask"></i>
                            <span>Specialization: <strong>{selectedTeacher.specialization || 'N/A'}</strong></span>
                          </div>
                          <div className="info-item">
                            <i className="fas fa-briefcase"></i>
                            <span>Experience: <strong>{selectedTeacher.experience || 'N/A'}</strong></span>
                          </div>
                          <div className="info-item">
                            <i className="fas fa-calendar-alt"></i>
                            <span>Joining Date: <strong>
                              {selectedTeacher.joiningDate ? new Date(selectedTeacher.joiningDate).toLocaleDateString() : 'N/A'}
                            </strong></span>
                          </div>
                          <div className="info-item">
                            <i className="fas fa-money-bill"></i>
                            <span>Salary: <strong>
                              {selectedTeacher.salary ? `$${selectedTeacher.salary.toLocaleString()}` : 'N/A'}
                            </strong></span>
                          </div>
                          <div className="info-item">
                            <i className="fas fa-circle"></i>
                            <span>Status: 
                              <strong style={{ 
                                color: selectedTeacher.status === 'Active' ? '#28a745' : '#ffc107',
                                marginLeft: '5px'
                              }}>
                                {selectedTeacher.status || 'N/A'}
                              </strong>
                            </span>
                          </div>
                        </div>
                      </div>

                      <h6 className="section-title">
                        <i className="fas fa-book-open"></i>
                        Assigned Classes
                      </h6>

                      {teacherSchedule?.assignedClasses?.length > 0 ? (
                        <>
                          <div className="table-responsive">
                            <table className="schedule-table">
                              <thead>
                                <tr>
                                  <th>Class Code</th>
                                  <th>Class Name</th>
                                  <th>Day</th>
                                  <th>Time</th>
                                  <th>Subject</th>
                                  <th>Room</th>
                                  <th>Section</th>
                                </tr>
                              </thead>
                              <tbody>
                                {teacherSchedule.assignedClasses.map((cls, index) => (
                                  <tr key={index}>
                                    <td>
                                      <span className="class-code-badge">{cls.classCode}</span>
                                    </td>
                                    <td>{cls.className || cls.classCode}</td>
                                    <td>{cls.day}</td>
                                    <td>{cls.startTime} - {cls.endTime}</td>
                                    <td>{cls.subject}</td>
                                    <td>{cls.room || 'N/A'}</td>
                                    <td>{cls.section || 'N/A'}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          <div className="total-classes">
                            <i className="fas fa-chart-bar"></i>
                            Total Classes: {teacherSchedule.assignedClasses.length}
                          </div>
                        </>
                      ) : (
                        <div className="no-classes">
                          <i className="far fa-calendar-times"></i>
                          <h6>No Classes Assigned</h6>
                          <p>This teacher currently has no scheduled classes</p>
                        </div>
                      )}
                    </>
                  )
                )}
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowScheduleModal(false)}
                >
                  Close
                </button>
                {teacherSchedule?.assignedClasses?.length > 0 && (
                  <button 
                    type="button" 
                    className="btn btn-primary"
                    onClick={() => window.print()}
                  >
                    <i className="fas fa-print me-2"></i>
                    Print Schedule
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateClass;