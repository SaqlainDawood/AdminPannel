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
    day: "",
    startTime: "",
    endTime: "",
    room: "",
  });

  useEffect(() => {
    fetchTeachers();
  }, []);

  useEffect(() => {
    if (filterDepartment === "all") {
      setFilteredTeachers(teachers);
    } else {
      const filtered = teachers.filter(
        (teacher) => teacher.department === filterDepartment,
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
        console.log("All Teachers Data",response.data);
        console.log("ALl Faculty Data ",response.data.data);
        
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
    setLoading(true); // Show spinner
    const token = localStorage.getItem("adminToken");
    const response = await AdminAPI(`/classes/faculty/${teacherId}/schedule`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log("Schedule API Response:", response); // Add this for debugging

    // Check if the response has the expected structure
    if (response.data && response.data.success) {
      // The actual data is in response.data.data based on your backend controller
      const scheduleData = response.data.data;
      
      setTeacherSchedule({
        teacherName: scheduleData.teacherName || selectedTeacher?.name,
        department: scheduleData.department || selectedTeacher?.department,
        assignedClasses: Array.isArray(scheduleData.assignedClasses) 
          ? scheduleData.assignedClasses 
          : [],
      });
    } else {
      // Handle case where response structure is different
      console.error("Unexpected response structure:", response.data);
      toast.error("Invalid response format from server");
      setTeacherSchedule({
        teacherName: selectedTeacher?.name,
        department: selectedTeacher?.department,
        assignedClasses: [],
      });
    }
  } catch (error) {
    console.error("Error fetching teacher schedule:", error);
    toast.error("Failed to fetch teacher schedule");

    setTeacherSchedule({
      teacherName: selectedTeacher?.name,
      department: selectedTeacher?.department,
      assignedClasses: [],
    });
  } finally {
    setLoading(false);
  }
};

 const handleViewSchedule = (teacher) => {
  setSelectedTeacher(teacher); // Select teacher
  setTeacherSchedule(null); // Reset previous schedule
  setShowScheduleModal(true); // Show modal immediately
  fetchTeacherSchedule(teacher._id); // Fetch schedule asynchronously
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
  toast.success(`${teacher.name} selected for assignment`);
};
 const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Get unique departments from teachers
  const departments = [
    "all",
    ...new Set(teachers.map((t) => t.department).filter(Boolean)),
  ];
  const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Validate required selections
  if (!selectedTeacher) {
    toast.info("Please select a teacher for this class");
    return;
  }

  // Validate schedule fields
  if (!formData.day || !formData.startTime || !formData.endTime || !formData.room) {
    toast.info("Please complete all schedule fields");
    return;
  }

  try {
    setLoading(true); // Add loading state if you have one
    const token = localStorage.getItem("adminToken");
    
    if (!token) {
      toast.error("Authentication token not found. Please login again.");
      return;
    }

    // Prepare the payload
    const payload = {
      className: formData.className,
      classCode: formData.classCode,
      department: formData.department,
      semester: parseInt(formData.semester), // Ensure number
      section: formData.section,
      subject: formData.subject,
      creditHours: parseInt(formData.creditHours), // Ensure number
      capacity: parseInt(formData.capacity) || 50, // Default to 50 if not provided
      teachers: [
        {
          teacher: selectedTeacher._id,
          role: selectedTeacher.mappedRole || "Lecturer",
        },
      ],
      students: [], // Empty array for new class
      schedule: [
        {
          day: formData.day,
          startTime: formData.startTime,
          endTime: formData.endTime,
          room: formData.room,
        },
      ],
    };

    // Make the API call
    const response = await AdminAPI({
      method: 'POST', // Specify the method
      url: '/classes/create',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      data: payload, // Axios uses 'data' for POST body
    });

    // Check response status
    if (response.data && response.data.success) {
      toast.success("Class created successfully!");
      
      // Reset form after successful submission
      setFormData({
        className: "",
        classCode: "",
        department: "",
        section: "",
        subject: "",
        creditHours: "",
        semester: "",
        capacity: "",
        day: "",
        startTime: "",
        endTime: "",
        room: "",
      });
      setSelectedTeacher(null);
      
      // Optional: Redirect or refresh list
      // navigate('/classes') or fetchClasses()
    } else {
      throw new Error(response.data.message || "Failed to create class");
    }
    
  } catch (error) {
    console.error("Error creating class:", error);
    
    // Handle different types of errors
    if (error.response) {
      // Server responded with error
      const message = error.response.data?.message || "Server error occurred";
      toast.error(message);
      
      // Handle specific error cases
      if (error.response.status === 401) {
        toast.error("Session expired. Please login again.");
        // Handle logout here
      } else if (error.response.status === 400) {
        // Validation errors
        if (error.response.data.errors) {
          error.response.data.errors.forEach(err => toast.error(err));
        }
      }
    } else if (error.request) {
      // Request made but no response
      toast.error("No response from server. Please check your connection.");
    } else {
      // Something else happened
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

            <form onSubmit={handleSubmit}>
              {/* Class Information Card */}
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

              {/* Teacher Assignment Card */}
              <div className="card mb-4">
                <div className="card-header bg-primary text-white">
                  <h5 className="mb-0">
                    <MDBIcon fas icon="chalkboard-teacher" className="me-2" />
                    Teacher Assignment
                  </h5>
                </div>

                <div className="card-body">
                  {/* Department Filter Dropdown */}
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

                  {/* Teachers Table */}
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

                  {/* Selected Teacher Display */}
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
                          onClick={() => setSelectedTeacher(null)}
                        >
                          <MDBIcon fas icon="times" /> Remove
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Schedule Card */}
              <div className="card mb-4">
                <div className="card-header bg-primary text-white">
                  <h5 className="mb-0">
                    <MDBIcon far icon="calendar-check" className="me-2" />
                    Schedule & Timings
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-md-3">
                      <label className="form-label">Day</label>
                      <select
                        className="form-select"
                        name="day"
                        value={formData.day}
                        onChange={handleChange}
                        required
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
                    <div className="col-md-3">
                      <label className="form-label">Start Time</label>
                      <select
                        className="form-select"
                        name="startTime"
                        value={formData.startTime}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Start Time</option>
                        <option value="8:00">8:00 AM</option>
                        <option value="9:30">9:30 AM</option>
                        <option value="11:00">11:00 AM</option>
                        <option value="12:30">12:30 PM</option>
                        <option value="14:00">2:00 PM</option>
                        <option value="15:30">3:30 PM</option>
                        <option value="17:00">5:00 PM</option>
                        <option value="18:30">6:30 PM</option>
                      </select>
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">End Time</label>
                      <select
                        className="form-select"
                        name="endTime"
                        value={formData.endTime}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select End Time</option>
                        <option value="9:30">9:30 AM</option>
                        <option value="11:00">11:00 AM</option>
                        <option value="12:30">12:30 PM</option>
                        <option value="14:00">2:00 PM</option>
                        <option value="15:30">3:30 PM</option>
                        <option value="17:00">5:00 PM</option>
                        <option value="18:30">6:30 PM</option>
                        <option value="20:00">8:00 PM</option>
                      </select>
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Room</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g., Room 401"
                        name="room"
                        value={formData.room}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="d-flex justify-content-end">
                <button type="submit" className="btn btn-primary px-5 py-2">
                  <MDBIcon fas icon="save" className="me-2" />
                  Create Class
                </button>
              </div>
            </form>
          </MDBCardBody>
        </MDBCard>
      </MDBContainer>

      {/* Schedule View Modal */}
      <MDBModal
        show={showScheduleModal}
        setShow={setShowScheduleModal}
        size="lg"
      >
        <MDBModalDialog size="lg">
          <MDBModalContent>
            <MDBModalHeader className="bg-primary text-white">
              <MDBModalTitle>
                <MDBIcon far icon="calendar-alt" className="me-2" />
                Teacher Schedule
              </MDBModalTitle>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={() => setShowScheduleModal(false)}
              ></button>
            </MDBModalHeader>

            <MDBModalBody>
              {loading ? (
                <div className="text-center p-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                selectedTeacher && (
                  <>
                    {/* Teacher Info */}
                    <div className="teacher-info-card mb-4 p-3 bg-light rounded">
                      <h5 className="mb-2">{selectedTeacher.name}</h5>
                      <p className="mb-1 text-muted">
                        <MDBIcon fas icon="building" className="me-2" />
                        Department: {selectedTeacher.department}
                      </p>
                      <p className="mb-0 text-muted">
                        <MDBIcon fas icon="id-badge" className="me-2" />
                        Employee ID: {selectedTeacher.employeeID}
                      </p>
                    </div>

                    {/* Assigned Classes */}
                    <h6 className="fw-bold mb-3">Assigned Classes:</h6>
                    {teacherSchedule?.assignedClasses?.length > 0 ? (
                      <div className="table-responsive">
                        <table className="table table-bordered schedule-table">
                          <thead className="table-light">
                            <tr>
                              <th>Class Code</th>
                              <th>Day</th>
                              <th>Time</th>
                              <th>Subject</th>
                            </tr>
                          </thead>
                          <tbody>
                            {teacherSchedule.assignedClasses.map(
                              (cls, index) => (
                                <tr key={index}>
                                  <td>
                                    <strong>{cls.classCode}</strong>
                                  </td>
                                  <td>{cls.day}</td>
                                  <td>
                                    {cls.startTime} - {cls.endTime}
                                  </td>
                                  <td>{cls.subject}</td>
                                </tr>
                              ),
                            )}
                          </tbody>
                        </table>
                        <div className="total-classes mt-3 p-2 bg-primary text-white rounded">
                          <strong>
                            Total Classes:{" "}
                            {teacherSchedule.assignedClasses.length}
                          </strong>
                        </div>
                      </div>
                    ) : (
                      <div className="no-classes p-4 text-center bg-light rounded">
                        <MDBIcon
                          far
                          icon="frown"
                          size="3x"
                          className="text-muted mb-3"
                        />
                        <h6 className="text-muted">Assigned Classes: N/A</h6>
                        <p className="text-muted mb-0">Total Classes: 0</p>
                      </div>
                    )}
                  </>
                )
              )}
            </MDBModalBody>

            <MDBModalFooter>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowScheduleModal(false)}
              >
                Close
              </button>
            </MDBModalFooter>
          </MDBModalContent>
        </MDBModalDialog>
      </MDBModal>
    </>
  );
};

export default CreateClass;
