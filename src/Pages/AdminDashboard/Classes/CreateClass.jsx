import React, { useState,useEffect } from "react";
import {
  MDBContainer,
  MDBCard,
  MDBCardBody,
  MDBBtn,
  MDBIcon,
} from "mdb-react-ui-kit";
import AdminAPI from "../../../api";
import {toast} from 'react-toastify'
const CreateClass = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [filterSemester, setFilterSemester] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [selectedTeachers, setSelectetdTeachers] = useState(null);
  const [teacherRole, setTeacherRole] = useState("Professor");
  const [formData, setFormData] = useState({
    className: "",
    classCode: "",
    department: "",
    semester: "",
    section: "",
    academicYear: "",
    subject: "",
    creditHours: "",
    assignedDate: "",
    students: "",
    enrollmentDate: "",
    status: "",
    schedule: "",
    capacity: "",
    enrolledCount: "",
    isActive: "",
    day: "",
    startTime: "",
    endTime: "",
    room: "",
  });

  useEffect(() => {
    fetchTeachers();
  }, []);
  const fetchTeachers = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await AdminAPI("/faculty/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
     console.log(response.data);
      if(Array.isArray(response.data.data)){
        setTeachers(response.data.data);
      }
      else{
        setTeachers([]);
      }
    } catch (error) {
      console.error("Error fetching teachers:", error);
    }
  };
  const departments = [
    'all',...new Set(
      teachers.map(t => t.department).filter(Boolean)
    )];
  const filteredTeachers = teachers.filter((teacher) => {
    const fullName = `${teacher.firstName} ${teacher.lastName}`.toLowerCase();
    const employeeID = teacher.employeeID?.toLowerCase() || "";
    const email = teacher.user?.email?.toLowerCase() || "";
    const department = teacher.department?.toLowerCase() || "";
    const designation = teacher.designation?.toLowerCase() || "";
    const specialization = teacher.specialization?.toLowerCase() || "";
    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      employeeID.includes(searchTerm.toLocaleLowerCase()) ||
      email.includes(searchTerm.toLowerCase()) ||
      department.includes(searchTerm.toLowerCase()) ||
      designation.includes(searchTerm.toLowerCase()) ||
      specialization.includes(searchTerm.toLowerCase());
    const matchesDepartment =
      filterDepartment === "all" || teacher.department === filterDepartment;

    const matchesStatus =
      filterStatus === "all" ||
      teacher.status?.toLowerCase() === filterStatus.toLowerCase();

    return matchesSearch && matchesDepartment && matchesStatus;
  });
  const handleTeacherSelect=(teacher)=>{
        setSelectetdTeachers(teacher)
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!selectedTeachers){
      toast.info("Please Select Teacher for this Class");
      return;
    }
  };
  const handleChange = async (e) => {};
  return (
    <>
      <MDBContainer className="py-4">
        <MDBCard className="shadow-4">
          <MDBCardBody className="">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3 className="text-primary fw-bold">
                <MDBIcon fas icon="plus-square" />
                Create New Class
              </h3>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="card mb-4 mt-4">
                <div className="card-header bg-primary text-white">
                  <h5 className="mb-0">
                    <i className="fas fa-user me-2"></i>
                    Assign Class
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Class Name</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="BSIT POST ADP"
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
                        placeholder="BSIT0398"
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
                      >
                        <option value="">Select Type</option>
                        <option value="Computer Science">
                          Computer Science
                        </option>
                        <option value="BBA">BBA</option>
                        <option value="Agriculture">Agriculture</option>
                        <option value="English">English Literature</option>
                        <option value="Chemistry">Chemistry</option>
                        <option value="Physics">Physics</option>
                        <option value="Maths">Mathematics</option>
                        <option value="Biology">Biology</option>
                        <option value="Nutrients">Nutrients</option>
                        <option value="FoodScience">Food Science</option>
                        <option value="Urdu">Urdu</option>
                        <option value="Islamiyat">Islamiyat</option>
                        <option value="SocialStudies">Pak Studies</option>
                        <option value="Psychology">Psychology</option>
                        <option value="Economics">Economics</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Section</label>
                      <select
                        name="section"
                        className="form-select"
                        value={formData.section}
                        onChange={handleChange}
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
                        placeholder="Fundamental of WEB"
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
                        type="text"
                        className="form-control"
                        placeholder="e.g 50"
                        name="capacity"
                        value={formData.capacity}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="card mb-4 mt-4">
                <div className="card-header bg-primary text-white">
                  <h5 className="mb-0">
                    <MDBIcon fas icon="chalkboard-teacher" />
                    Teacher Assignment
                  </h5>
                </div>
                <div className="content-card">
                  {/* <div className="search-filter-section">
                    <div className="search-box">
                      <i className="fas fa-search"></i>
                      <input
                        type="text"
                        placeholder="Search Teacher"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <button
                      className="btn btn-outline-primary"
                      onClick={() => setShowFilters(!showFilters)}
                    >
                      <i className="fas fa-filter me-2"></i>
                      Filters
                      {showFilters ? (
                        <i className="fas fa-chevron-up ms-2"></i>
                      ) : (
                        <i className="fas fa-chevron-down ms-2"></i>
                      )}
                    </button>
                  </div>
                  {showFilters && (
                    <div className="filters-panel">
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label">Department</label>
                          <select
                            className="form-select"
                            value={filterDepartment}
                            onChange={(e) =>
                              setFilterDepartment(e.target.value)
                            }
                          >
                            {departments.map((dept) => (
                              <option key={dept} value={dept}>
                                {dept === "all" ? "All Departments" : dept}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Status</label>
                          <select
                            className="form-select"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                          >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )} */}
                </div>
              </div>
              <div className="card mb-4 mt-4">
                <div className="card-header bg-primary text-white">
                  <h5 className="mb-0">
                    <MDBIcon far icon="calendar-check" />
                    Schedule & Timings
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Day</label>
                      <select
                        className="form-select"
                        name="day"
                        value={formData.day}
                        onChange={handleChange}
                      >
                        <option value="Monday">Monday</option>
                        <option value="Tuesday">Tuesday</option>
                        <option value="Wednesday">Wednesday</option>
                        <option value="Thrusday">Thrusday</option>
                        <option value="Friday">Friday</option>
                        <option value="Saturday">Saturday</option>
                        <option value="Sunday">Sunday</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Start Time</label>
                      <select
                        className="form-select"
                        name="startTime"
                        value={formData.startTime}
                        onChange={handleChange}
                      >
                        <option value="">Select Start Time</option>
                        <option value="8">8:00</option>
                        <option value="9:30">9:30</option>
                        <option value="11">11:00</option>
                        <option value="12:30">12:30</option>
                        <option value="2">2:00</option>
                        <option value="3:30">3:30</option>
                        <option value="5">5:00</option>
                        <option value="6:30">6:30</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">End Time</label>
                      <select
                        className="form-select"
                        name="endTime"
                        value={formData.endTime}
                        onChange={handleChange}
                      >
                        <option value="">Select End Time</option>
                        <option value="9:30">9:30</option>
                        <option value="11">11:00</option>
                        <option value="12:30">12:30</option>
                        <option value="2">2:00</option>
                        <option value="3:30">3:30</option>
                        <option value="5">5:00</option>
                        <option value="6:30">6:30</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Room</label>
                      <input
                        type="text"
                        className="form-control"
                        name="room"
                        value={formData.room}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </MDBCardBody>
        </MDBCard>
      </MDBContainer>
    </>
  );
};

export default CreateClass;
