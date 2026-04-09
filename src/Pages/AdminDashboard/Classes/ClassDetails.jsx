import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  MDBContainer,
  MDBCard,
  MDBCardBody,
  MDBBtn,
  MDBIcon,
  MDBBadge,
  MDBSpinner,
  MDBTabs,
  MDBTabsItem,
  MDBTabsLink,
  MDBTabsContent,
  MDBTabsPane,
  MDBTable,
  MDBTableHead,
  MDBTableBody,
} from "mdb-react-ui-kit";
import AdminAPI from "../../../api";
import { toast } from "react-toastify";
import { FaSpinner } from "react-icons/fa";
import "./ClassDetails.css";

const ClassDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchClassDetails();
  }, [id]);

  const fetchClassDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      const response = await AdminAPI.get(`/classes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data && response.data.success) {
        setClassData(response.data.data);
      } else {
        toast.error("Failed to load class details");
      }
    } catch (error) {
      console.error("Error fetching class details:", error);
      toast.error("Error loading class details");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/admin/dashboard/classes");
  };

  const handleEdit = () => {
    navigate(`/admin/dashboard/classes/edit/${id}`);
  };

  // Helper function to get teacher name
  const getTeacherName = (teacherAssignment) => {
    if (!teacherAssignment || !teacherAssignment.teacher) return "Not Assigned";
    const teacher = teacherAssignment.teacher;
    return (
      `${teacher.firstName || ""} ${teacher.lastName || ""}`.trim() || "Unknown"
    );
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div>
          <FaSpinner className="spinner" size={40} />
          <p className="loading-text">Loading attendance data...</p>
        </div>
      </div>
    );
  }

  if (!classData) {
    return (
      <MDBContainer className="py-5 text-center">
        <MDBCard>
          <MDBCardBody className="py-5">
            <MDBIcon
              fas
              icon="exclamation-triangle"
              size="3x"
              className="text-warning mb-3"
            />
            <h4>Class Not Found</h4>
            <p className="text-muted">
              The class you're looking for doesn't exist or has been removed.
            </p>
            <MDBBtn onClick={handleBack} className="mt-3">
              <MDBIcon fas icon="arrow-left" className="me-2" />
              Back to Classes
            </MDBBtn>
          </MDBCardBody>
        </MDBCard>
      </MDBContainer>
    );
  }

  return (
    <MDBContainer fluid className="py-4 class-details-container">
      {/* Header with navigation */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center">
          <MDBBtn
            color="link"
            className="text-dark p-0 me-3"
            onClick={handleBack}
          >
            <MDBIcon fas icon="arrow-left" size="lg" />
          </MDBBtn>
          <div>
            <h3 className="mb-1">{classData.className}</h3>
            <p className="text-muted mb-0">
              <MDBBadge color="info" className="me-2">
                {classData.classCode}
              </MDBBadge>
              <MDBBadge color="secondary">{classData.department}</MDBBadge>
            </p>
          </div>
        </div>
        <div>
          <MDBBtn color="primary" onClick={handleEdit} className="me-2">
            <MDBIcon fas icon="edit" className="me-2" />
            Edit Class
          </MDBBtn>
          <MDBBtn color="secondary" onClick={handleBack}>
            <MDBIcon fas icon="times" className="me-2" />
            Close
          </MDBBtn>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <MDBCard className="shadow-3 stat-card">
            <MDBCardBody className="text-center">
              <MDBIcon
                fas
                icon="users"
                size="2x"
                className="text-primary mb-3"
              />
              <h5>Enrolled Students</h5>
              <h3 className="fw-bold">{classData.enrolledCount || 0}</h3>
              <small className="text-muted">
                Capacity: {classData.capacity || 50}
              </small>
            </MDBCardBody>
          </MDBCard>
        </div>
        <div className="col-md-3">
          <MDBCard className="shadow-3 stat-card">
            <MDBCardBody className="text-center">
              <MDBIcon
                fas
                icon="chalkboard-teacher"
                size="2x"
                className="text-success mb-3"
              />
              <h5>Teachers</h5>
              <h3 className="fw-bold">{classData.teachers?.length || 0}</h3>
              <small className="text-muted">Assigned</small>
            </MDBCardBody>
          </MDBCard>
        </div>
        <div className="col-md-3">
          <MDBCard className="shadow-3 stat-card">
            <MDBCardBody className="text-center">
              <MDBIcon
                far
                icon="clock"
                size="2x"
                className="text-warning mb-3"
              />
              <h5>Schedule Slots</h5>
              <h3 className="fw-bold">{classData.schedule?.length || 0}</h3>
              <small className="text-muted">Per Week</small>
            </MDBCardBody>
          </MDBCard>
        </div>
        <div className="col-md-3">
          <MDBCard className="shadow-3 stat-card">
            <MDBCardBody className="text-center">
              <MDBIcon
                fas
                icon="calendar-alt"
                size="2x"
                className="text-info mb-3"
              />
              <h5>Academic Year</h5>
              <h6 className="fw-bold">{classData.academicYear || "N/A"}</h6>
              <small className="text-muted">
                Semester {classData.semester}
              </small>
            </MDBCardBody>
          </MDBCard>
        </div>
      </div>

      {/* Tabs for different sections */}
      <MDBCard className="shadow-4">
        <MDBCardBody>
          <MDBTabs className="mb-4">
            <MDBTabsItem>
              <MDBTabsLink
                onClick={() => setActiveTab("overview")}
                active={activeTab === "overview"}
              >
                <MDBIcon fas icon="info-circle" className="me-2" />
                Overview
              </MDBTabsLink>
            </MDBTabsItem>
            <MDBTabsItem>
              <MDBTabsLink
                onClick={() => setActiveTab("teachers")}
                active={activeTab === "teachers"}
              >
                <MDBIcon fas icon="chalkboard-teacher" className="me-2" />
                Teachers ({classData.teachers?.length || 0})
              </MDBTabsLink>
            </MDBTabsItem>
            <MDBTabsItem>
              <MDBTabsLink
                onClick={() => setActiveTab("schedule")}
                active={activeTab === "schedule"}
              >
                <MDBIcon far icon="calendar-alt" className="me-2" />
                Schedule ({classData.schedule?.length || 0})
              </MDBTabsLink>
            </MDBTabsItem>
            <MDBTabsItem>
              <MDBTabsLink
                onClick={() => setActiveTab("students")}
                active={activeTab === "students"}
              >
                <MDBIcon fas icon="user-graduate" className="me-2" />
                Students ({classData.enrolledCount || 0})
              </MDBTabsLink>
            </MDBTabsItem>
          </MDBTabs>

          <MDBTabsContent>
            {/* Overview Tab */}
            <MDBTabsPane open={activeTab === "overview"}>
              <div className="row">
                <div className="col-md-6">
                  <h5 className="mb-3">Basic Information</h5>
                  <table className="table details-table">
                    <tbody>
                      <tr>
                        <th>Class Name:</th>
                        <td>{classData.className}</td>
                      </tr>
                      <tr>
                        <th>Class Code:</th>
                        <td>{classData.classCode}</td>
                      </tr>
                      <tr>
                        <th>Department:</th>
                        <td>{classData.department}</td>
                      </tr>
                      <tr>
                        <th>Subject:</th>
                        <td>{classData.subject}</td>
                      </tr>
                      <tr>
                        <th>Semester:</th>
                        <td>{classData.semester}</td>
                      </tr>
                      <tr>
                        <th>Section:</th>
                        <td>{classData.section || "A"}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="col-md-6">
                  <h5 className="mb-3">Additional Details</h5>
                  <table className="table details-table">
                    <tbody>
                      <tr>
                        <th>Credit Hours:</th>
                        <td>{classData.creditHours}</td>
                      </tr>
                      <tr>
                        <th>Capacity:</th>
                        <td>{classData.capacity}</td>
                      </tr>
                      <tr>
                        <th>Enrolled:</th>
                        <td>{classData.enrolledCount || 0}</td>
                      </tr>
                      <tr>
                        <th>Available Seats:</th>
                        <td>
                          {(classData.capacity || 50) -
                            (classData.enrolledCount || 0)}
                        </td>
                      </tr>
                      <tr>
                        <th>Status:</th>
                        <td>
                          <MDBBadge
                            color={classData.isActive ? "success" : "secondary"}
                          >
                            {classData.isActive ? "Active" : "Inactive"}
                          </MDBBadge>
                        </td>
                      </tr>
                      <tr>
                        <th>Academic Year:</th>
                        <td>{classData.academicYear || "N/A"}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </MDBTabsPane>

            {/* Teachers Tab */}
            <MDBTabsPane open={activeTab === "teachers"}>
              <h5 className="mb-3">Assigned Teachers</h5>
              {classData.teachers && classData.teachers.length > 0 ? (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Teacher Name</th>
                        <th>Role</th>
                        <th>Email</th>
                        <th>Employee ID</th>
                        <th>Assigned Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {classData.teachers.map((teacherAssign, index) => (
                        <tr key={index}>
                          <td>
                            <strong>{getTeacherName(teacherAssign)}</strong>
                          </td>
                          <td>
                            <MDBBadge color="info" pill>
                              {teacherAssign.role || "Teacher"}
                            </MDBBadge>
                          </td>
                          <td>{teacherAssign.teacher?.user?.email || "N/A"}</td>
                          <td>{teacherAssign.teacher?.employeeID || "N/A"}</td>
                          <td>
                            {teacherAssign.assignedDate
                              ? new Date(
                                  teacherAssign.assignedDate,
                                ).toLocaleDateString()
                              : "N/A"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted">
                  No teachers assigned to this class.
                </p>
              )}
            </MDBTabsPane>

            {/* Schedule Tab */}
            <MDBTabsPane open={activeTab === "schedule"}>
              <h5 className="mb-3">Class Schedule</h5>
              {classData.schedule && classData.schedule.length > 0 ? (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Day</th>
                        <th>Start Time</th>
                        <th>End Time</th>
                        <th>Room</th>
                      </tr>
                    </thead>
                    <tbody>
                      {classData.schedule.map((slot, index) => (
                        <tr key={index}>
                          <td>
                            <MDBBadge color="primary" pill>
                              {slot.day}
                            </MDBBadge>
                          </td>
                          <td>{slot.startTime}</td>
                          <td>{slot.endTime}</td>
                          <td>{slot.room}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted">
                  No schedule defined for this class.
                </p>
              )}
            </MDBTabsPane>

            {/* Students Tab */}
            <MDBTabsPane open={activeTab === "students"}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">Enrolled Students</h5>
                <MDBBtn
                  color="primary"
                  size="sm"
                  onClick={() =>
                    navigate(`/admin/dashboard/classes/${id}/enroll`)
                  }
                >
                  <MDBIcon fas icon="user-plus" className="me-2" />
                  Manage Enrollment
                </MDBBtn>
              </div>
              {classData.students && classData.students.length > 0 ? (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Roll No</th>
                        <th>Student Name</th>
                        <th>Status</th>
                        <th>Enrollment Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {classData.students.map((studentAssign, index) => (
                        <tr key={index}>
                          <td>{studentAssign.student?.rollNo || "N/A"}</td>
                          <td>
                            {`${studentAssign.student?.firstName || ""} ${studentAssign.student?.lastName || ""}`.trim() ||
                              "N/A"}
                          </td>
                          <td>
                            <MDBBadge color="success" pill>
                              {studentAssign.status || "enrolled"}
                            </MDBBadge>
                          </td>
                          <td>
                            {studentAssign.enrollmentDate
                              ? new Date(
                                  studentAssign.enrollmentDate,
                                ).toLocaleDateString()
                              : "N/A"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted">
                  No students enrolled in this class.
                </p>
              )}
            </MDBTabsPane>
          </MDBTabsContent>
        </MDBCardBody>
      </MDBCard>
    </MDBContainer>
  );
};

export default ClassDetails;
