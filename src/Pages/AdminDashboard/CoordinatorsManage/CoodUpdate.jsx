import React, { useEffect } from "react";
import {
  MDBContainer,
  MDBCard,
  MDBCardBody,
  MDBBtn,
  MDBSpinner,
} from "mdb-react-ui-kit";
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
const CoodUpdate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [coord, setCoord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [formData, setFormData] = useState({
    coordId: "",
    name: "",
    phone: "",
    cnic: "",
    address: "",
    profileImage: "",
    DOB: "",
    user: {
      email: "",
    },
    degreeCertificate: {
      url: "",
    },
    //  ========== ACADEMIC CREDENTIALS ==========
    highestQualification: "",
    specialization: "",
    institution: "",
    graduationYear: "",
    degreeCertificate: "",
    // ========== PROFESSIONAL EXPERIENCE ==========

    yearsOfExperience: "",
    previousPosition: "",
    previousInstitution: "",
    areaOfExpertise: "",
    employmentType: "",
    salaryGrade: "",
    basicSalary: "",
    contractExpiry: "",
    probationPeriod: "",
    bankAccount: "",
    bankAccountTitle: "",
    bankName: "",
    department: "",
    coordinatorRole: "",
    roleTitle: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    // ========== STATUS & ADMINISTRATION ==========
    status: "",
    joiningDate: "",
    username: "",
    createdBy: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  useEffect(() => {
    if (coord) {
      setFormData({
        coordId: coord.coordId || "",
        name: coord.name || "",
        phone: coord.phone || "",
        cnic: coord.cnic || "",
        address: coord.address || "",
        profileImage: coord.profileImage || "",
        DOB: coord.DOB ? coord.DOB.split("T")[0] : "",
        user: {
          email: coord.user?.email || "",
          password: coord.user?.password || "",
        },
        degreeCertificate: {
          url: coord.degreeCertificate?.url || "",
        },
        highestQualification: coord.highestQualification || "",
        specialization: coord.specialization || "",
        institution: coord.institution || "",
        graduationYear: coord.graduationYear || "",
        yearsOfExperience: coord.yearsOfExperience || "",
        previousPosition: coord.previousPosition || "",
        previousInstitution: coord.previousInstitution || "",
        areaOfExpertise: coord.areaOfExpertise || "",
        employmentType: coord.employmentType || "",
        salaryGrade: coord.salaryGrade || "",
        basicSalary: coord.basicSalary || "",
        contractExpiry: coord.contractExpiry
          ? coord.contractExpiry.split("T")[0]
          : "",
        probationPeriod: coord.probationPeriod || "",
        bankAccount: coord.bankAccount || "",
        bankAccountTitle: coord.bankAccountTitle || "",
        bankName: coord.bankName || "",
        department: coord.department || "",
        coordinatorRole: coord.coordinatorRole || "",
        roleTitle: coord.roleTitle || "",
        emergencyContactName: coord.emergencyContactName || "",
        emergencyContactPhone: coord.emergencyContactPhone || "",
        status: coord.status || "",
        joiningDate: coord.joiningDate ? coord.joiningDate.split("T")[0] : "",
        username: coord.username || "",
        createdBy: coord.createdBy || "",
        createdAt: coord.createdAt || "",
      });
    }
  }, [coord]);
  useEffect(() => {
    const fetchCoordinator = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        if (!token) {
          toast.error("Un-Authorized");
          navigate("/admin/login");
          return;
        }
        if (!id || id === ":id") {
          toast.error("Coordinator Not Found!!!");
          navigate("/admin/dashboard/coordinator/list");
          return;
        }

        const res = await axios.get(
          `http://localhost:8000/api/admin/coordinator/view/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );
        if (res.status === 201 && res.data.success) {
          setCoord(res.data.data);
        } else {
          toast.error("Coordinator not Found!!!");
          setNotFound(true);
        }
      } catch (error) {
        console.log("Error for fetching the coordinator record.", error);
        if (error.response?.status === 401) {
          toast.error("Coordinator ID Not Found");
        } else if (error.response?.status === 404) {
          toast.error("Invalid ID of Coordinator");
          setNotFound(true);
        } else {
          toast.error("Error for fetching Coordinator details!!!!!");
        }
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchCoordinator();
  }, [id, navigate]);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData || Object.keys(formData).length === 0) {
      toast.error("Please fill the coordinator details");
      return;
    }
    console.log("Sending data:", formData);
    console.log("Coordinator ID:", id);

    try {
      setUpdating(true);
      const token = localStorage.getItem("adminToken");
      if (!token) {
        toast.error("Authentication Required!!!! Please Login.");
        return;
      }

      const res = await axios.put(
        `http://localhost:8000/api/admin/coordinator/update/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      if (res.status === 200 && res.data.success) {
        toast.success("Coordiantor Update Successfully");
        navigate(`/admin/dashboard/coordinators/view/${id}`);
      } else {
        toast.error(res.data.message || "Failed to update coordinator");
      }
    } catch (error) {
      console.log("Error Updating the Coordinator", error);
      console.error("=== UPDATE ERROR ===");
      console.error("Error status:", error.response?.status);
      console.error("Error data:", error.response?.data);
      console.error("Error message:", error.message);
      if (!error.response) {
        toast.error("Network Error. Please Check your connection");
      } else if (error.response?.status === 400) {
        toast.error("Invalid Coordiantor data provided");
      } else if (error.response?.status === 401) {
        toast.error("Session Expired Please login!!!");
      } else if (error.response?.status === 404) {
        toast.error("Coordinator not found!!!!!");
      } else {
        toast.error("An unexpectted Error Occour");
      }
    } finally {
      setUpdating(false);
    }
  };
  const formatDate = (dateString) => {
    if (!dateString) {
      return "N/A";
    }
    return new Date(dateString).toLocaleString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "numeric",
    });
  };
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
  if (notFound || !coord) {
    return (
      <div className="notfound-container text-center py-5">
        <h2>Coordinator Not Found</h2>
        <p>The requested Coordinator record doesn't exist.</p>
        <button
          className="btn btn-primary mt-3"
          onClick={() => navigate("/admin/dashboard/coordinators/list")}
        >
          <i className="fas fa-arrow-left me-2"></i> Back to Coordinator List
        </button>
      </div>
    );
  }

  return (
    <div className="coordinator-update-container">
      <MDBContainer className="py-4">
        <MDBCard className="shadow-4">
          <MDBCardBody className="">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3 className="text-primary fw-bold">
                <i className="fas fa-user-edit me-2"></i>
                Update Coordinator Information
              </h3>
              <div>
                <MDBBtn
                  color="outline-primary"
                  className="me-2"
                  onClick={() =>
                    navigate(`/admin/dashboard/coordinators/view/${id}`)
                  }
                >
                  <i className="fas fa-eye me-2"></i>View
                </MDBBtn>
                <MDBBtn
                  color="secondary"
                  onClick={() => navigate("/admin/dashboard/coordinators/list")}
                >
                  <i className="fas fa-arrow-left me-2"></i>Back
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
                      <label className="form-label">Coordinator ID</label>
                      <input
                        type="text"
                        className="form-control"
                        name="coordId"
                        value={formData.coordId}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Full Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Email Address *</label>
                      <input
                        type="email"
                        className="form-control"
                        name="user.email"
                        value={formData.user?.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Phone Number *</label>
                      <input
                        type="tel"
                        className="form-control"
                        name="phone"
                        value={formData.phone}
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
                    <div className="col-12">
                      <label className="form-label">Address</label>
                      <textarea
                        className="form-control"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        rows="2"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Academic Credentials Section */}
              <div className="card mb-4">
                <div className="card-header bg-info text-white">
                  <h5 className="mb-0">
                    <i className="fas fa-graduation-cap me-2"></i>
                    Academic Credentials
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">
                        Highest Qualification
                      </label>
                      <select
                        className="form-select"
                        name="highestQualification"
                        value={formData.highestQualification}
                        onChange={handleInputChange}
                      >
                        <option value="">Select Qualification</option>
                        <option value="PhD">PhD</option>
                        <option value="Masters">Masters</option>
                        <option value="Bachelor's">Bachelor's</option>
                        <option value="Diploma">Diploma</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Specialization</label>
                      <input
                        type="text"
                        className="form-control"
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">
                        University/Institution
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="institution"
                        value={formData.institution}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Year of Graduation</label>
                      <input
                        type="number"
                        className="form-control"
                        name="graduationYear"
                        value={formData.graduationYear}
                        onChange={handleInputChange}
                        min="1900"
                        max={new Date().getFullYear()}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">
                        Degree Certificate URL
                      </label>
                      <input
                        type="url"
                        className="form-control"
                        name="degreeCertificate.url"
                        value={formData.degreeCertificate?.url}
                        onChange={handleInputChange}
                        placeholder="https://example.com/certificate.pdf"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Professional Experience Section */}
              <div className="card mb-4">
                <div className="card-header bg-warning text-dark">
                  <h5 className="mb-0">
                    <i className="fas fa-briefcase me-2"></i>
                    Professional Experience
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">
                        Total Years of Experience
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        name="yearsOfExperience"
                        value={formData.yearsOfExperience}
                        onChange={handleInputChange}
                        min="0"
                        max="50"
                        step="0.5"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Area of Expertise</label>
                      <input
                        type="text"
                        className="form-control"
                        name="areaOfExpertise"
                        value={formData.areaOfExpertise}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Previous Position</label>
                      <input
                        type="text"
                        className="form-control"
                        name="previousPosition"
                        value={formData.previousPosition}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Previous Institution</label>
                      <input
                        type="text"
                        className="form-control"
                        name="previousInstitution"
                        value={formData.previousInstitution}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Employment Details Section */}
              <div className="card mb-4">
                <div className="card-header bg-success text-white">
                  <h5 className="mb-0">
                    <i className="fas fa-building me-2"></i>
                    Employment Details
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Employment Type</label>
                      <select
                        className="form-select"
                        name="employmentType"
                        value={formData.employmentType}
                        onChange={handleInputChange}
                      >
                        <option value="">Select Type</option>
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
                        <option value="Temporary">Temporary</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Salary Grade</label>
                      <input
                        type="text"
                        className="form-control"
                        name="salaryGrade"
                        value={formData.salaryGrade}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Basic Salary ($)</label>
                      <input
                        type="number"
                        className="form-control"
                        name="basicSalary"
                        value={formData.basicSalary}
                        onChange={handleInputChange}
                        min="0"
                        step="100"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">
                        Probation Period (months)
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        name="probationPeriod"
                        value={formData.probationPeriod}
                        onChange={handleInputChange}
                        min="0"
                        max="12"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Contract Expiry Date</label>
                      <input
                        type="date"
                        className="form-control"
                        name="contractExpiry"
                        value={formData.contractExpiry}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Joining Date</label>
                      <input
                        type="date"
                        className="form-control"
                        name="joiningDate"
                        value={formData.joiningDate}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bank Details Section */}
              <div className="card mb-4">
                <div className="card-header bg-secondary text-white">
                  <h5 className="mb-0">
                    <i className="fas fa-university me-2"></i>
                    Bank Details
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Bank Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="bankName"
                        value={formData.bankName}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Account Title</label>
                      <input
                        type="text"
                        className="form-control"
                        name="bankAccountTitle"
                        value={formData.bankAccountTitle}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Account Number</label>
                      <input
                        type="text"
                        className="form-control"
                        name="bankAccount"
                        value={formData.bankAccount}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Role Information Section */}
              <div className="card mb-4">
                <div className="card-header bg-danger text-white">
                  <h5 className="mb-0">
                    <i className="fas fa-user-tag me-2"></i>
                    Role Information
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Coordinator Type</label>
                      <select
                        className="form-select"
                        name="coordinatorRole"
                        value={formData.coordinatorRole}
                        onChange={handleInputChange}
                      >
                        <option value="">Select Type</option>
                        <option value="Department Coordinator">Department Coordinator</option>
                        <option value="Semester Coordinator">Semester Coordinator</option>
                        <option value="Examination Coordinator"> Examination Coordinator</option>
                        <option value="Admissions Coordinator">Admissions Coordinator</option>
                        <option value="Program Coordinator">Program Coordinator</option>
                        <option value="Fee Coordinator">Fee Coordinator</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Department</label>
                      <input
                        type="text"
                        className="form-control"
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Role Title</label>
                      <input
                        type="text"
                        className="form-control"
                        name="roleTitle"
                        value={formData.roleTitle}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Emergency Contact Section */}
              <div className="card mb-4">
                <div className="card-header bg-dark text-white">
                  <h5 className="mb-0">
                    <i className="fas fa-phone-alt me-2"></i>
                    Emergency Contact
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Contact Person Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="emergencyContactName"
                        value={formData.emergencyContactName}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Contact Person Phone</label>
                      <input
                        type="tel"
                        className="form-control"
                        name="emergencyContactPhone"
                        value={formData.emergencyContactPhone}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Login Credentials Section */}
              <div className="card mb-4">
                <div className="card-header bg-info text-white">
                  <h5 className="mb-0">
                    <i className="fas fa-key me-2"></i>
                    Login Credentials
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Username</label>
                      <input
                        type="text"
                        className="form-control"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Password</label>
                      <div className="input-group">
                        <input
                          type={showPassword ? "text" : "password"}
                          className="form-control"
                          name="user.password"
                          value={formData.user?.password || ""}
                          onChange={handleInputChange}
                          placeholder="Enter new password"
                        />
                     <button className="btn btn-secondary"
                     type="button"
                     onClick={()=>setShowPassword(!showPassword)}>
                        <i className={`fas ${showPassword ? "fa-eye-slash":"fa-eye"}`}></i>
                     </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Section */}
              <div className="card mb-4">
                <div className="card-header bg-warning">
                  <h5 className="mb-0">
                    <i className="fas fa-chart-line me-2"></i>
                    Status & Administration
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Status</label>
                      <select
                        className="form-select"
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Suspended">Suspended</option>
                        <option value="On Leave">On Leave</option>
                        <option value="Terminated">Terminated</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">
                        Created At (Read-only)
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={formatDate(formData.createdAt)}
                        readOnly
                        disabled
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="d-flex justify-content-end gap-3">
                <MDBBtn
                  color="secondary"
                  onClick={() => navigate("/admin/dashboard/coordinators/list")}
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
                      Update Coordinator
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

export default CoodUpdate;
