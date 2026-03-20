import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  MDBContainer,
  MDBCard,
  MDBCardBody,
  MDBBtn,
  MDBIcon,
  MDBSpinner,
  MDBBadge,
} from "mdb-react-ui-kit";
import AdminAPI from "../../../api";
import { toast } from "react-toastify";
import "./EditClass.css";

const EditClass = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [formData, setFormData] = useState({
    className: "",
    classCode: "",
    department: "",
    section: "A",
    subject: "",
    creditHours: "3",
    semester: "",
    capacity: "50",
    academicYear: "",
    isActive: true,
    teachers: [],
    schedule: [{ day: "", startTime: "", endTime: "", room: "" }],
  });

  // Fetch class data and teachers on component mount
  useEffect(() => {
    fetchClassData();
    fetchTeachers();
  }, [id]);

  const fetchClassData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      const response = await AdminAPI.get(`/classes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data && response.data.success) {
        const classData = response.data.data;
        
        // Format the data for the form
        setFormData({
          className: classData.className || "",
          classCode: classData.classCode || "",
          department: classData.department || "",
          section: classData.section || "A",
          subject: classData.subject || "",
          creditHours: classData.creditHours?.toString() || "3",
          semester: classData.semester?.toString() || "",
          capacity: classData.capacity?.toString() || "50",
          academicYear: classData.academicYear || "",
          isActive: classData.isActive !== undefined ? classData.isActive : true,
          teachers: classData.teachers?.map(t => ({
            teacher: t.teacher?._id || t.teacher,
            role: t.role || "Lecturer",
            teacherData: t.teacher // Store the populated teacher data for display
          })) || [],
          schedule: classData.schedule?.length > 0 
            ? classData.schedule 
            : [{ day: "", startTime: "", endTime: "", room: "" }],
        });
      }
    } catch (error) {
      console.error("Error fetching class:", error);
      toast.error("Failed to load class data");
      navigate("/admin/dashboard/classes");
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await AdminAPI.get("/faculty/all", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data && response.data.success) {
        setTeachers(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching teachers:", error);
      toast.error("Failed to load teachers");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleScheduleChange = (index, field, value) => {
    const updatedSchedule = [...formData.schedule];
    updatedSchedule[index] = { ...updatedSchedule[index], [field]: value };
    setFormData((prev) => ({ ...prev, schedule: updatedSchedule }));
  };

  const addScheduleSlot = () => {
    setFormData((prev) => ({
      ...prev,
      schedule: [...prev.schedule, { day: "", startTime: "", endTime: "", room: "" }],
    }));
  };

  const removeScheduleSlot = (index) => {
    if (formData.schedule.length > 1) {
      const updatedSchedule = formData.schedule.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, schedule: updatedSchedule }));
    }
  };

  const handleTeacherSelect = (teacher) => {
    // Check if teacher is already selected
    const isSelected = formData.teachers.some(t => t.teacher === teacher._id);
    
    if (isSelected) {
      // Remove teacher
      setFormData((prev) => ({
        ...prev,
        teachers: prev.teachers.filter(t => t.teacher !== teacher._id)
      }));
    } else {
      // Add teacher
      setFormData((prev) => ({
        ...prev,
        teachers: [
          ...prev.teachers,
          {
            teacher: teacher._id,
            role: teacher.designation || "Lecturer",
            teacherData: teacher
          }
        ]
      }));
    }
  };

  const handleTeacherRoleChange = (teacherId, role) => {
    setFormData((prev) => ({
      ...prev,
      teachers: prev.teachers.map(t => 
        t.teacher === teacherId ? { ...t, role } : t
      )
    }));
  };

  const removeTeacher = (teacherId) => {
    setFormData((prev) => ({
      ...prev,
      teachers: prev.teachers.filter(t => t.teacher !== teacherId)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.className || !formData.classCode || !formData.department || 
        !formData.semester || !formData.subject) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.teachers.length === 0) {
      toast.error("Please select at least one teacher");
      return;
    }

    // Validate schedule
    const invalidSchedule = formData.schedule.some(
      s => !s.day || !s.startTime || !s.endTime || !s.room
    );
    if (invalidSchedule) {
      toast.error("Please complete all schedule fields");
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem("adminToken");

      // Prepare payload
      const payload = {
        className: formData.className,
        classCode: formData.classCode,
        department: formData.department,
        semester: parseInt(formData.semester),
        section: formData.section,
        subject: formData.subject,
        creditHours: parseInt(formData.creditHours),
        capacity: parseInt(formData.capacity) || 50,
        academicYear: formData.academicYear,
        isActive: formData.isActive,
        teachers: formData.teachers.map(t => ({
          teacher: t.teacher,
          role: t.role
        })),
        schedule: formData.schedule
      };

      const response = await AdminAPI.put(`/classes/${id}`, payload, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (response.data && response.data.success) {
        toast.success("Class updated successfully!");
        navigate(`/admin/dashboard/classes/view/${id}`);
      }
    } catch (error) {
      console.error("Error updating class:", error);
      toast.error(error.response?.data?.message || "Failed to update class");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(`/admin/dashboard/classes/view/${id}`);
  };

  if (loading) {
    return (
      <MDBContainer className="py-5 text-center">
        <MDBSpinner role="status" color="primary" size="lg">
          <span className="visually-hidden">Loading...</span>
        </MDBSpinner>
        <p className="mt-3">Loading class data...</p>
      </MDBContainer>
    );
  }

  return (
    <MDBContainer fluid className="py-4 edit-class-container">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center">
          <MDBBtn color="link" className="text-dark p-0 me-3" onClick={handleCancel}>
            <MDBIcon fas icon="arrow-left" size="lg" />
          </MDBBtn>
          <div>
            <h3 className="mb-1">Edit Class</h3>
            <p className="text-muted mb-0">
              <MDBBadge color="info" className="me-2">{formData.classCode}</MDBBadge>
              Update class information
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Basic Information Card */}
        <MDBCard className="shadow-3 mb-4">
          <MDBCardBody>
            <h5 className="card-title mb-4">
              <MDBIcon fas icon="info-circle" className="me-2 text-primary" />
              Basic Information
            </h5>
            
            <div className="row g-4">
              <div className="col-md-6">
                <label className="form-label">Class Name *</label>
                <input
                  type="text"
                  className="form-control"
                  name="className"
                  value={formData.className}
                  onChange={handleChange}
                  placeholder="e.g., BSIT Post ADP"
                  required
                />
              </div>
              
              <div className="col-md-6">
                <label className="form-label">Class Code *</label>
                <input
                  type="text"
                  className="form-control"
                  name="classCode"
                  value={formData.classCode}
                  onChange={handleChange}
                  placeholder="e.g., BSIT0398"
                  required
                />
              </div>
              
              <div className="col-md-4">
                <label className="form-label">Department *</label>
                <select
                  className="form-select"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Department</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Software Engineering">Software Engineering</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Electrical Engineering">Electrical Engineering</option>
                </select>
              </div>
              
              <div className="col-md-4">
                <label className="form-label">Subject *</label>
                <input
                  type="text"
                  className="form-control"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="e.g., Data Structures"
                  required
                />
              </div>
              
              <div className="col-md-2">
                <label className="form-label">Semester *</label>
                <select
                  className="form-select"
                  name="semester"
                  value={formData.semester}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select</option>
                  {[1,2,3,4,5,6,7,8].map(num => (
                    <option key={num} value={num}>{num}{getOrdinalSuffix(num)}</option>
                  ))}
                </select>
              </div>
              
              <div className="col-md-2">
                <label className="form-label">Section</label>
                <select
                  className="form-select"
                  name="section"
                  value={formData.section}
                  onChange={handleChange}
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="Morning">Morning</option>
                  <option value="Evening">Evening</option>
                </select>
              </div>
              
              <div className="col-md-3">
                <label className="form-label">Credit Hours</label>
                <select
                  className="form-select"
                  name="creditHours"
                  value={formData.creditHours}
                  onChange={handleChange}
                >
                  {[1,2,3,4].map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>
              
              <div className="col-md-3">
                <label className="form-label">Capacity</label>
                <input
                  type="number"
                  className="form-control"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  min="1"
                  max="70"
                />
              </div>
              
              <div className="col-md-3">
                <label className="form-label">Academic Year</label>
                <input
                  type="text"
                  className="form-control"
                  name="academicYear"
                  value={formData.academicYear}
                  onChange={handleChange}
                  placeholder="e.g., 2026-2027"
                />
              </div>
              
              <div className="col-md-3">
                <label className="form-label">Status</label>
                <div className="form-check form-switch mt-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    id="statusSwitch"
                  />
                  <label className="form-check-label" htmlFor="statusSwitch">
                    {formData.isActive ? "Active" : "Inactive"}
                  </label>
                </div>
              </div>
            </div>
          </MDBCardBody>
        </MDBCard>

        {/* Teachers Assignment Card */}
        <MDBCard className="shadow-3 mb-4">
          <MDBCardBody>
            <h5 className="card-title mb-4">
              <MDBIcon fas icon="chalkboard-teacher" className="me-2 text-primary" />
              Teachers Assignment
            </h5>

            <div className="selected-teachers mb-4">
              <label className="form-label">Selected Teachers</label>
              {formData.teachers.length > 0 ? (
                <div className="selected-teachers-list">
                  {formData.teachers.map((t) => (
                    <div key={t.teacher} className="selected-teacher-item">
                      <div className="teacher-info">
                        <span className="teacher-name">
                          {t.teacherData?.name || 
                           teachers.find(te => te._id === t.teacher)?.name || 
                           "Unknown Teacher"}
                        </span>
                        <select
                          className="form-select form-select-sm role-select"
                          value={t.role}
                          onChange={(e) => handleTeacherRoleChange(t.teacher, e.target.value)}
                        >
                          <option value="Lecturer">Lecturer</option>
                          <option value="Assistant">Assistant</option>
                          <option value="Associate">Associate</option>
                          <option value="Professor">Professor</option>
                        </select>
                      </div>
                      <button
                        type="button"
                        className="btn-close"
                        onClick={() => removeTeacher(t.teacher)}
                        aria-label="Remove"
                      ></button>
                    </div>
                  ))}
                </div>
              ) : (
               <div className="alert alert-warning d-flex align-items-center py-2" role="alert">
  <MDBIcon fas icon="exclamation-triangle" className="me-2" />
  <div>No teachers selected. Please select at least one teacher.</div>
</div>
              )}
            </div>

            <label className="form-label">Available Teachers</label>
            <div className="teachers-grid">
              {teachers.map((teacher) => {
                const isSelected = formData.teachers.some(t => t.teacher === teacher._id);
                return (
                  <div
                    key={teacher._id}
                    className={`teacher-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleTeacherSelect(teacher)}
                  >
                    <div className="teacher-avatar">
                      {teacher.profileImage ? (
                        <img src={teacher.profileImage} alt={teacher.name} />
                      ) : (
                        <div className="avatar-placeholder">
                          {teacher.name?.charAt(0) || 'T'}
                        </div>
                      )}
                    </div>
                    <div className="teacher-details">
                      <div className="teacher-name">{teacher.name}</div>
                      <div className="teacher-meta">
                        <span>{teacher.department}</span>
                        <span className="dot">•</span>
                        <span>{teacher.designation}</span>
                      </div>
                    </div>
                    {isSelected && (
                      <MDBIcon fas icon="check-circle" className="selected-icon text-success" />
                    )}
                  </div>
                );
              })}
            </div>
          </MDBCardBody>
        </MDBCard>

        {/* Schedule Card */}
        <MDBCard className="shadow-3 mb-4">
          <MDBCardBody>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="card-title mb-0">
                <MDBIcon far icon="calendar-alt" className="me-2 text-primary" />
                Class Schedule
              </h5>
              <MDBBtn color="primary" size="sm" onClick={addScheduleSlot}>
                <MDBIcon fas icon="plus" className="me-2" />
                Add Slot
              </MDBBtn>
            </div>

            {formData.schedule.map((slot, index) => (
              <div key={index} className="schedule-row mb-3">
                <div className="row g-3 align-items-end">
                  <div className="col-md-2">
                    <label className="form-label">Day</label>
                    <select
                      className="form-select"
                      value={slot.day}
                      onChange={(e) => handleScheduleChange(index, "day", e.target.value)}
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
                  
                  <div className="col-md-2">
                    <label className="form-label">Start Time</label>
                    <select
                      className="form-select"
                      value={slot.startTime}
                      onChange={(e) => handleScheduleChange(index, "startTime", e.target.value)}
                      required
                    >
                      <option value="">Select</option>
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
                  
                  <div className="col-md-2">
                    <label className="form-label">End Time</label>
                    <select
                      className="form-select"
                      value={slot.endTime}
                      onChange={(e) => handleScheduleChange(index, "endTime", e.target.value)}
                      required
                    >
                      <option value="">Select</option>
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
                      value={slot.room}
                      onChange={(e) => handleScheduleChange(index, "room", e.target.value)}
                      placeholder="e.g., Room 401"
                      required
                    />
                  </div>
                  
                  <div className="col-md-2">
                    {formData.schedule.length > 1 && (
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => removeScheduleSlot(index)}
                      >
                        <MDBIcon fas icon="trash" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </MDBCardBody>
        </MDBCard>

        {/* Form Actions */}
        <div className="d-flex justify-content-end gap-3">
          <MDBBtn color="secondary" size="lg" onClick={handleCancel}>
            Cancel
          </MDBBtn>
          <MDBBtn 
            color="primary" 
            size="lg" 
            type="submit" 
            disabled={submitting}
          >
            {submitting ? (
              <>
                <MDBSpinner size="sm" className="me-2" />
                Updating...
              </>
            ) : (
              <>
                <MDBIcon fas icon="save" className="me-2" />
                Update Class
              </>
            )}
          </MDBBtn>
        </div>
      </form>
    </MDBContainer>
  );
};

// Helper function for ordinal suffixes
const getOrdinalSuffix = (num) => {
  if (num === 1) return "st";
  if (num === 2) return "nd";
  if (num === 3) return "rd";
  return "th";
};

export default EditClass;