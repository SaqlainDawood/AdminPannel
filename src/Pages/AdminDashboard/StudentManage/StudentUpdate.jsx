import React from "react";
import "./StudentUpdate.css";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  MDBContainer,
  MDBCard,
  MDBCardBody,
  MDBBtn,
  MDBSpinner,
} from "mdb-react-ui-kit";

const StudentUpdate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: "",
    lastName: "",
    email: "",
    phoneNo: "",
    cnic: "",
    DOB: "",
    gender: "",
    bloodGroup: "",
    maritalStatus: "",
    religion: "",
    nationality: "",
    province: "",
    domicile: "",
    presentAddress: "",
    permanentAddress: "",
    status: "",

    // Academic Information
    enrollment: {
      program: "",
      semester: "",
      session: "",
      department: "",
      shift: "",
      campus: "",
    },

    // Family Information
    family: {
      fatherName: "",
      motherName: "",
      fatherCnic: "",
      fatherMobile: "",
    },

    // Documents
    documents: {
      cnic: false,
      marksheet: false,
      photo: false,
      domicile: false,
    },

    // Academic Performance
    cgpa: "",
    section: "",
    registrationNo: "",
    rollNo: "",
  });

  // Fetch student data
  useEffect(() => {
    const fetchStudentById = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        if (!token) {
          toast.error("Not Authorized User");
          navigate("/admin/login");
          return;
        }

        if (!id || id === ":id") {
          toast.error("Invalid Student ID!");
          navigate("/admin/dashboard/students/list");
          return;
        }

        const res = await axios.get(
          `http://localhost:8000/api/admin/student/view/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (res.data.success && res.data.student) {
          const studentData = res.data.student;
          setStudent(studentData);

          // Populate form with existing data
          setFormData({
            firstName: studentData.firstName || "",
            lastName: studentData.lastName || "",
            email: studentData?.user?.email || "",
            phoneNo: studentData.phoneNo || "",
            cnic: studentData.cnic || "",
            DOB: studentData.DOB
              ? new Date(studentData.DOB).toISOString().split("T")[0]
              : "",
            gender: studentData.gender || "",
            bloodGroup: studentData.bloodGroup || "",
            maritalStatus: studentData.maritalStatus || "",
            religion: studentData.religion || "",
            nationality: studentData.nationality || "",
            province: studentData.province || "",
            domicile: studentData.domicile || "",
            presentAddress: studentData.presentAddress || "",
            permanentAddress: studentData.permanentAddress || "",
            status: studentData.status || "",

            enrollment: {
              program: studentData.enrollment?.program || "",
              semester: studentData.enrollment?.semester || "",
              session: studentData.enrollment?.session || "",
              department: studentData.enrollment?.department || "",
              shift: studentData.enrollment?.shift || "",
              campus: studentData.enrollment?.campus || "",
            },

            family: {
              fatherName: studentData.family?.fatherName || "",
              motherName: studentData.family?.motherName || "",
              fatherCnic: studentData.family?.fatherCnic || "",
              fatherMobile: studentData.family?.fatherMobile || "",
            },

            documents: {
              cnic: studentData.documents?.cnic || false,
              marksheet: studentData.documents?.marksheet || false,
              photo: studentData.documents?.photo || false,
              domicile: studentData.documents?.domicile || false,
            },

            cgpa: studentData.cgpa || "",
            section: studentData.section || "",
            registrationNo: studentData.registrationNo || "",
            rollNo: studentData.rollNo || "",
          });
        } else {
          toast.error("Student data not found");
          setNotFound(true);
        }

        setLoading(false);
      } catch (error) {
        console.log("Error fetching student:", error);
        if (error.response?.status === 404) {
          setNotFound(true);
          toast.error("Student not found!");
        } else if (error.response?.status === 401) {
          toast.error("Unauthorized! Please login again.");
          localStorage.removeItem("adminToken");
          navigate("/admin/login");
        } else {
          toast.error("Error fetching student details!");
        }
        setLoading(false);
      }
    };

    fetchStudentById();
  }, [id, navigate]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.includes(".")) {
      // Handle nested objects (enrollment.program, family.fatherName, etc.)
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === "checkbox" ? checked : value,
        },
      }));
    } else {
      // Handle top-level fields
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setUpdating(true);

      const token = localStorage.getItem("adminToken");
      if (!token) {
        toast.error("Not Authorized !!!!");
        navigate("/admin/dashboard/students/list");
        return;
      }
      const res = await axios.put(
        `http://localhost:8000/api/admin/student/update/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (res.data.success) {
        toast.success("Student updated successfully!");
        navigate(`/admin/dashboard/students/view/${id}`);
      } else {
        toast.error(res.data.message || "Failed to update student");
      }
    } catch (error) {
      console.error("Error updating student:", error);

      if (error.response?.status === 401) {
        toast.error("Unauthorized! Please login again.");
        localStorage.removeItem("adminToken");
        navigate("/admin/login");
      } else if (error.response?.status === 400) {
        // Validation errors or duplicate field
        if (error.response.data.errors) {
          error.response.data.errors.forEach((err) => toast.error(err));
        } else {
          toast.error(error.response.data.message || "Validation error");
        }
      } else if (error.response?.status === 404) {
        toast.error("Student not found!");
      } else {
        toast.error("Error updating student");
      }
    } finally {
      setUpdating(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="loader-container text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading student details...</p>
      </div>
    );
  }

  // Not found state
  if (notFound || !student) {
    return (
      <div className="notfound-container text-center py-5">
        <h2>Student Not Found</h2>
        <p>The requested Student record doesn't exist.</p>
        <button
          className="btn btn-primary mt-3"
          onClick={() => navigate("/admin/dashboard/students/list")}
        >
          <i className="fas fa-arrow-left me-2"></i> Back to Student List
        </button>
      </div>
    );
  }

  return (
    <div className="student-update-container">
      <MDBContainer className="py-4">
        <MDBCard className="shadow-4">
          <MDBCardBody className="">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3 className="text-primary fw-bold">
                <i className="fas fa-edit me-2"></i>
                Update Student Information
              </h3>
              <div>
                <MDBBtn
                  color="outline-primary"
                  className="me-2"
                  onClick={() =>
                    navigate(`/admin/dashboard/students/view/${id}`)
                  }
                >
                  <i className="fas fa-eye me-2"></i>View
                </MDBBtn>
                <MDBBtn
                  color="secondary"
                  onClick={() => navigate("/admin/dashboard/students/list")}
                >
                  ← Back to List
                </MDBBtn>
              </div>
            </div>

            {/* Update Form */}
            <form onSubmit={handleSubmit}>
              {/* Personal Information Section */}
              <div className="card mb-4">
                <div className="card-header bg-primary text-white">
                  <h5 className="mb-0">
                    <i className="fas fa-user me-2"></i>
                    Personal Information
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">First Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Last Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Email *</label>
                      <input
                        type="email"
                        className="form-control"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Phone Number *</label>
                      <input
                        type="tel"
                        className="form-control"
                        name="phoneNo"
                        value={formData.phoneNo}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">CNIC *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="cnic"
                        value={formData.cnic}
                        onChange={handleInputChange}
                        maxLength="13"
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Date of Birth</label>
                      <input
                        type="date"
                        className="form-control"
                        name="DOB"
                        value={formData.DOB}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Gender</label>
                      <select
                        className="form-select"
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Blood Group</label>
                      <select
                        className="form-select"
                        name="bloodGroup"
                        value={formData.bloodGroup}
                        onChange={handleInputChange}
                      >
                        <option value="">Select Blood Group</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Marital Status</label>
                      <select
                        className="form-select"
                        name="maritalStatus"
                        value={formData.maritalStatus}
                        onChange={handleInputChange}
                      >
                        <option value="">Select Status</option>
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Divorced">Divorced</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Religion</label>
                      <input
                        type="text"
                        className="form-control"
                        name="religion"
                        value={formData.religion}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Nationality</label>
                      <input
                        type="text"
                        className="form-control"
                        name="nationality"
                        value={formData.nationality}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Status</label>
                      <select
                        className="form-select"
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="active">Active</option>
                        <option value="assign">Assign</option>
                        <option value="unassigned">UnAssigned</option>
                        <option value="suspend">Suspend</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="card mb-4">
                <div className="card-header bg-info text-white">
                  <h5 className="mb-0">
                    <i className="fas fa-home me-2"></i>
                    Address Information
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label">Present Address</label>
                      <textarea
                        className="form-control"
                        name="presentAddress"
                        value={formData.presentAddress}
                        onChange={handleInputChange}
                        rows="3"
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Permanent Address</label>
                      <textarea
                        className="form-control"
                        name="permanentAddress"
                        value={formData.permanentAddress}
                        onChange={handleInputChange}
                        rows="3"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Province</label>
                      <input
                        type="text"
                        className="form-control"
                        name="province"
                        value={formData.province}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Domicile</label>
                      <input
                        type="text"
                        className="form-control"
                        name="domicile"
                        value={formData.domicile}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              <div className="card mb-4">
                <div className="card-header bg-warning text-dark">
                  <h5 className="mb-0">
                    <i className="fas fa-graduation-cap me-2"></i>
                    Academic Information
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Roll Number</label>
                      <input
                        type="text"
                        className="form-control"
                        name="rollNo"
                        value={formData.rollNo}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Registration No</label>
                      <input
                        type="text"
                        className="form-control"
                        name="registrationNo"
                        value={formData.registrationNo}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Section</label>
                      <input
                        type="text"
                        className="form-control"
                        name="section"
                        value={formData.section}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">CGPA</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="4"
                        className="form-control"
                        name="cgpa"
                        value={formData.cgpa}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Program</label>
                      <input
                        type="text"
                        className="form-control"
                        name="enrollment.program"
                        value={formData.enrollment.program}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Semester</label>
                      <input
                        type="text"
                        className="form-control"
                        name="enrollment.semester"
                        value={formData.enrollment.semester}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Session</label>
                      <input
                        type="text"
                        className="form-control"
                        name="enrollment.session"
                        value={formData.enrollment.session}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Department</label>
                      <input
                        type="text"
                        className="form-control"
                        name="enrollment.department"
                        value={formData.enrollment.department}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Shift</label>
                      <input
                        type="text"
                        className="form-control"
                        name="enrollment.shift"
                        value={formData.enrollment.shift}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Campus</label>
                      <input
                        type="text"
                        className="form-control"
                        name="enrollment.campus"
                        value={formData.enrollment.campus}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Family Information */}
              <div className="card mb-4">
                <div className="card-header bg-success text-white">
                  <h5 className="mb-0">
                    <i className="fas fa-users me-2"></i>
                    Family Information
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Father's Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="family.fatherName"
                        value={formData.family.fatherName}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Mother's Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="family.motherName"
                        value={formData.family.motherName}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Father's CNIC</label>
                      <input
                        type="text"
                        className="form-control"
                        name="family.fatherCnic"
                        value={formData.family.fatherCnic}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Father's Mobile</label>
                      <input
                        type="text"
                        className="form-control"
                        name="family.fatherMobile"
                        value={formData.family.fatherMobile}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Documents Status */}
              <div className="card mb-4">
                <div className="card-header bg-secondary text-white">
                  <h5 className="mb-0">
                    <i className="fas fa-file-alt me-2"></i>
                    Documents Status
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-md-3">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          name="documents.cnic"
                          checked={formData.documents.cnic}
                          onChange={handleInputChange}
                        />
                        <label className="form-check-label">
                          CNIC Verified
                        </label>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          name="documents.marksheet"
                          checked={formData.documents.marksheet}
                          onChange={handleInputChange}
                        />
                        <label className="form-check-label">
                          Marksheet Verified
                        </label>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          name="documents.photo"
                          checked={formData.documents.photo}
                          onChange={handleInputChange}
                        />
                        <label className="form-check-label">
                          Photo Verified
                        </label>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          name="documents.domicile"
                          checked={formData.documents.domicile}
                          onChange={handleInputChange}
                        />
                        <label className="form-check-label">
                          Domicile Verified
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="d-flex justify-content-end gap-3">
                <MDBBtn
                  color="secondary"
                  onClick={() => navigate("/admin/dashboard/students/list")}
                >
                  Cancel
                </MDBBtn>
                <MDBBtn type="submit" color="primary" disabled={updating}>
                  {updating ? (
                    <>
                      <MDBSpinner size="sm" className="me-2" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save me-2"></i>
                      Update Student
                    </>
                  )}
                </MDBBtn>
              </div>
            </form>
          </MDBCardBody>
        </MDBCard>
      </MDBContainer>
    </div>
  );
};

export default StudentUpdate;
