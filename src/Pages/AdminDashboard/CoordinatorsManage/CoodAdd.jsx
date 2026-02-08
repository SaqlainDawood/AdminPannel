import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import AdminAPI from "../../../api";

const CoodAdd = () => {
  const navigate = useNavigate();
  // const [imagePreview, setImagePreview] = useState('');  
  const [formData, setFormData] = useState({
    // Personel Information
    coordId: "",
    name: "",
    email: "",
    phone: "",
    cnic: "",
    address: "",
    DOB: "",
    // Employment Qualification
    highestQualification: "",
    institution: "",
    graduationYear: "",
    specialization: "",
    yearsOfExperience: "",
    previousPosition: "",
    previousInstitution: "",
    areaOfExpertise: "",
    // Employment Type
    employmentType: "",
    salaryGrade: "",
    basicSalary: "",
    contractExpiry: "",
    probationPeriod: "",
    bankAccount: "",
    bankAccountTitle: "",
    bankName: "",
    department: "",
    role: "",
    roleTitle: "",
    // campus:"",
    emergencyContactName: "",
    emergencyContactPhone: "",
    // STEP 5: Permissions Section
    permissions: {
      students: [],
      faculty: [],
      courses: [],
      examinations: [],
      fees: [],
      reports: [],
    },

    // STEP 6: Status & Admin
    status: "active",
    joiningDate: new Date().toISOString().split("T")[0],
      username: "",
      password: "",
      lastLogin: "",
    
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [registeredCoord, setRegisteredCoord] = useState(null);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [degreeCertificate, setDegreeCertificate] = useState(null);
  const handleFile = (e) => {
    setProfileImage(e.target.files[0]);
  };
  const handleDegreeCertificate = (e) => {
    setDegreeCertificate(e.target.files[0]);
  };
  //   const handleImageChange = (e) => {
  //   const file = e.target.files[0];
  //   if (file) {
  //     if (file.size > 5 * 1024 * 1024) { // 5MB limit
  //       setError('Image size should be less than 5MB');
  //       return;
  //     }
  //     if (!file.type.startsWith('image/')) {
  //       setError('Please select a valid image file');
  //       return;
  //     }
  //     setProfileImage(file);
  //     setError('');
  //     const reader = new FileReader();
  //     reader.onloadend = () => {
  //       setImagePreview(reader.result);
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // };

  // Auto-fill role title when role or department changes
  useEffect(() => {
    if (formData.role && formData.department) {
      const roleTitle = generateRoleTitle(formData.role, formData.department);
      setFormData((prev) => ({
        ...prev,
        roleTitle: roleTitle,
      }));
    }
  }, [formData.role, formData.department]);


  const generateRoleTitle = (role, department) => {
    const roleMap = {
      "Department Coordinator": `${department} Department Coordinator`,
      "Semester Coordinator": `${department} Semester Coordinator`,
      "Examination Coordinator": `${department} Examination Coordinator`,
      "Admissions Coordinator": `${department} Admissions Coordinator`,
      "Program Coordinator": `${department} Program Coordinator`,
      "Fee Coordinator": `${department} Fee Coordinator`,
    };

    return roleMap[role] || `${department} Coordinator`;
  };

  // Enhanced handleChange for nested objects
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Check if it's a nested field (contains dot notation)
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

  // Handle permissions multi-select
  const handlePermissionChange = (e, permissionType) => {
    const options = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    setFormData((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permissionType]: options,
      },
    }));
  };
  // Generate strong password
  const generatePassword = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    setFormData((prev) => ({
      ...prev,
        password: password,
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key !== "profileImage" && key !== "degreeCertificate") {
          if (typeof formData[key] === "object" && formData[key] !== null) {
            formDataToSend.append(key, JSON.stringify(formData[key]));
          } else {
            formDataToSend.append(key, formData[key]);
          }
        }
      });
      if (profileImage) {
      formDataToSend.append("profileImage", profileImage);
      }
      if (degreeCertificate)
        formDataToSend.append("degreeCertificate", degreeCertificate);

      const response = await AdminAPI.post(
        "/coordinator/register",
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        navigate("/admin/dashboard/coordinators/list");
      }
       setShowSuccessModal(true);
    } catch (error) {
      console.log(" Coordinator Registration Error", error);
      if (error.response) {
        const { data } = error.response;
        if (data.errors) {
          toast.error(`Error: ${data.message}\n${data.errors.join("\n")}`);
        } else {
          toast.error(`Error: ${data.message || "Something went wrong"}`);
        }
      } else if (error.request) {
        
        toast.error("Network error. Please check your connection.");
      } else {
        
        toast.error("Error: " + error.message);
      }
    }
  };
 const handleSendCredentials = async () => {
  if (!registeredCoord) return;
  setSendingEmail(true);
  try {
   
  } catch (error) {
    console.error('Email sending error:', error);
    
    // Better error handling
    if (error.code === 'ERR_NETWORK') {
      toast.error('Cannot connect to email service. Please check if server is running.');
    } else if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else {
      toast.error('Failed to send email. Please try again.');
    }
  } finally {
    setSendingEmail(false);
  }
};
  const handleAddAnother = () => {
    setShowSuccessModal(false);
    setRegisteredCoord(null);
  };
  const departments = [
    "Computer Science",
    "Electrical Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Software Engineering",
    "Business Administration",
  ];

  const roles = [
    "Department Coordinator",
    "Semester Coordinator",
    "Examination Coordinator",
    "Admissions Coordinator",
    "Program Coordinator",
    "Fee Coordinator",
  ];

  const programs = [
    "BS Computer Science",
    "BS Information Technology",
    "BS Cyber Security",
    "BS Artificial Intelligence",
    "BS Chemistery",
    "BS PHYSICS",
    "MS Computer Science",
    "BS Electrical Engineering",
    "MS Electrical Engineering",
    "BS Mechanical Engineering",
    "BS Software Engineering",
    "BS Civil Engineering",
    "Business Administration",
  ];

  // Permission options for each category
  const permissionOptions = {
    students: ["view", "create", "edit", "delete", "export"],
    faculty: ["view", "create", "edit", "assign_courses", "evaluate"],
    courses: ["view", "create", "edit", "schedule", "assign_faculty"],
    examinations: ["view", "create", "edit", "schedule", "publish_results"],
    fees: ["view", "collect", "waiver", "generate_receipts", "reports"],
    reports: ["academic", "financial", "attendance", "performance", "custom"],
  };

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "on_leave", label: "On Leave" },
    { value: "inactive", label: "Inactive" },
  ];

  return (
    <div className="cood-add-container">
      <div className="container-fluid">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">
              <i className="fas fa-user-plus me-3"></i>Add New Coordinator
            </h1>
            <p className="page-subtitle">
              Assign a coordinator to manage programs and students
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="row g-4">
            <div className="col-12">
              {/* <div className="form-section-card">
                <h3 className="section-title">
                  <i className="fas fa-camera me-2"></i>
                  <h3>Profile Photo</h3>
                </h3>
                  
                <div className="row g-3">
                  <div className="col-md-4">
                    <div className="image-upload-area">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="image-preview"
                        />
                      ) : (
                        <div className="upload-placeholder">
                          <i className="fas fa-user-circle"></i>
                          <p>Upload Photo</p>
                        </div>
                      )}
                      <input
                        type="file"
                        id="profileImage"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="file-input"
                      />
                      <label htmlFor="profileImage" className="upload-btn">
                        <i className="fas fa-cloud-upload-alt me-2"></i>
                        Choose Photo
                      </label>
                    </div>
                  </div>
                </div>
              </div> */}
              {/* Personal Information */}
              <div className="form-section-card">
                <h3 className="section-title">
                  <i className="fas fa-user me-2"></i>Personal Information
                </h3>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Coordinator ID *</label>
                    <input
                      type="text"
                      id="coordId"
                      name="coordId"
                      className="form-control"
                      placeholder="COORD-001"
                      value={formData.coordId}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className="form-control"
                      placeholder="Enter full name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Email Address *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="form-control"
                      placeholder="email@university.edu.pk"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Phone Number *</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      className="form-control"
                      placeholder="+92 300 1234567"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">CNIC *</label>
                    <input
                      type="text"
                      id="cnic"
                      name="cnic"
                      className="form-control"
                      placeholder="12345-9876543-0"
                      pattern="[0-9]{5}-[0-9]{7}-[0-9]{1}"
                      value={formData.cnic}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Address</label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      className="form-control"
                      placeholder="Enter Address"
                      value={formData.address}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Profile Image</label>

                    <input
                      type="file"
                      id="profileImage"
                      name="profileImage"
                      className="form-control"
                      onChange={handleFile}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Date Of Birth</label>
                    <input
                      type="date"
                      id="DOB"
                      name="DOB"
                      value={formData.DOB}
                      className="form-control"
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
              {/*  Academic Credentials  */}
              {/* Academic Credentials - FIXED */}
              <div className="form-section-card">
                <h3 className="section-title">
                  <i className="fas fa-graduation-cap me-2"></i>Academic
                  Credentials
                </h3>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">
                      Highest Qualification *
                    </label>
                    <select
                    id="highestQualification"
                      name="highestQualification"
                      value={formData.highestQualification}
                      onChange={handleChange}
                      className="form-control"
                      required
                    >
                      <option value="">Select Qualification</option>
                      <option value="PhD">PhD</option>
                      <option value="Masters">Masters</option>
                      <option value="Bachelors">Bachelors</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Specialization/Major *</label>
                    <input
                      type="text"
                      id="specialization"
                      placeholder="e.g., Computer Science, Electrical Engineering"
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">
                      University/Institution *
                    </label>
                    <input
                      type="text"
                      id="institution"
                      placeholder="e.g., University of Engineering"
                      name="institution"
                      className="form-control"
                      value={formData.institution}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Year of Graduation *</label>
                    <input
                      type="number"
                      placeholder="2020"
                      id="graduationYear"
                      name="graduationYear"
                      value={formData.graduationYear}
                      onChange={handleChange}
                      className="form-control"
                      min="1980"
                      max="2024"
                      required
                    />
                  </div>
                  <div className="col-md-12">
                    <label className="form-label">Degree Certificate</label>
                    <input
                      type="file"
                      id="degreeCertificate"
                      name="degreeCertificate"
                      onChange={handleDegreeCertificate}
                      className="form-control"
                    />
                  </div>
                </div>
              </div>

              {/* NEW: Professional Experience Section */}
              <div className="form-section-card">
                <h3 className="section-title">
                  <i className="fas fa-briefcase me-2"></i>Professional
                  Experience
                </h3>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">
                      Total Years of Experience *
                    </label>
                    <input
                      type="number"
                      placeholder="Enter years of experience"
                      id="yearsOfExperience"
                      name="yearsOfExperience"
                      value={formData.yearsOfExperience}
                      onChange={handleChange}
                      className="form-control"
                      min="0"
                      max="50"
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Previous Position</label>
                    <input
                      type="text"
                      placeholder="e.g., Assistant Professor, Lecturer"
                      id="previousPosition"
                      name="previousPosition"
                      value={formData.previousPosition}
                      onChange={handleChange}
                      className="form-control"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Previous Institution</label>
                    <input
                      type="text"
                      id="previousInstitution"
                      placeholder="Previous university/college"
                      name="previousInstitution"
                      value={formData.previousInstitution}
                      onChange={handleChange}
                      className="form-control"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Area of Expertise</label>
                    <input
                      type="text"
                      placeholder="e.g., AI, Database Systems, Power Systems"
                      id="areaOfExpertise"
                      name="areaOfExpertise"
                      value={formData.areaOfExpertise}
                      onChange={handleChange}
                      className="form-control"
                    />
                  </div>
                </div>
              </div>

              <div className="form-section-card">
                <h3 className="section-title">
                  <i className="fas fa-file-contract me-2"></i>Employment
                  Details (Current)
                </h3>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Employment Type *</label>
                    <select
                    id="employmentType"
                      name="employmentType"
                      value={formData.employmentType}
                      onChange={handleChange}
                      className="form-control"
                      required
                    >
                      <option value="">Select Type</option>
                      <option value="Full-time">Full-time Permanent</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract Basis</option>
                      <option value="Visiting">Visiting Faculty</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Salary Grade *</label>
                    <select
                    id="salaryGrade"
                      name="salaryGrade"
                      value={formData.salaryGrade}
                      onChange={handleChange}
                      className="form-control"
                      required
                    >
                      <option value="">Select Grade</option>
                      <option value="BPS-17">BPS-17</option>
                      <option value="BPS-18">BPS-18</option>
                      <option value="BPS-19">BPS-19</option>
                      <option value="Contract-1">Contract Scale 1</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Basic Salary *</label>
                    <input
                      type="number"
                      id="basicSalary"
                      placeholder="50000"
                      name="basicSalary"
                      value={formData.basicSalary}
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Contract Expiry Date</label>
                    <input
                      type="date"
                      id="contractExpiry"
                      name="contractExpiry"
                      value={formData.contractExpiry}
                      onChange={handleChange}
                      className="form-control"
                      disabled={formData.employmentType === "Full-time"} // Only for contract
                    />
                    <small className="text-muted">
                      For contract employees only
                    </small>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">
                      Probation Period (Months)
                    </label>
                    <input
                      type="number"
                      placeholder="6"
                      id="probationPeriod"
                      name="probationPeriod"
                      value={formData.probationPeriod}
                      onChange={handleChange}
                      className="form-control"
                      min="0"
                      max="12"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Bank Account Number</label>
                    <input
                      type="text"
                      placeholder="For salary disbursement"
                      id="bankAccount"
                      name="bankAccount"
                      value={formData.bankAccount}
                      onChange={handleChange}
                      className="form-control"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Bank Account Title</label>
                    <input
                      type="text"
                      id="bankAccountTitle"
                      placeholder="Saqlain Dawood"
                      name="bankAccountTitle"
                      value={formData.bankAccountTitle}
                      onChange={handleChange}
                      className="form-control"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Bank Name</label>
                    <input
                      type="text"
                      id="bankName"
                      placeholder="Faisal Bankd"
                      name="bankName"
                      value={formData.bankName}
                      onChange={handleChange}
                      className="form-control"
                    />
                  </div>
                </div>
              </div>
              {/* Assignment Details */}
              <div className="form-section-card">
                <h3 className="section-title">
                  <i className="fas fa-tasks me-2"></i>Coordinator Role
                </h3>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Coordinator Type *</label>
                    <select
                    id="role"
                      name="role"
                      className="form-control"
                      value={formData.role}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Role</option>
                      {roles.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Department *</label>
                    <select
                    id="department"
                      name="department"
                      className="form-control"
                      value={formData.department}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-section-card">
                <h3 className="section-title">
                  <i className="fas fa-tasks me-2"></i>Role Title of Coordinator
                </h3>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Role Title</label>
                    <input
                      type="text"
                      id="roleTitle"
                      className="form-control"
                      name="roleTitle"
                      placeholder="Role title will auto-fill"
                      value={formData.roleTitle}
                      onChange={handleChange}
                    />
                    <small className="text-muted">
                      Auto-filled based on role and department
                    </small>
                  </div>
                </div>
              </div>
              {/* STEP 5: Permissions Section */}
              <div className="form-section-card">
                <h3 className="section-title">
                  <i className="fas fa-shield-alt me-2"></i>Permissions & Access
                </h3>
                <div className="row g-4">
                  {Object.entries(permissionOptions).map(
                    ([category, options]) => (
                      <div key={category} className="col-lg-6 col-md-12">
                        <div className="card permission-card h-100">
                          <div className="card-header bg-light">
                            <h6 className="mb-0 text-capitalize">
                              <i className="fas fa-shield-alt me-2 "></i>
                              {category} Permissions
                            </h6>
                          </div>
                          <div className="card-body">
                            <div className="permission-checkboxes">
                              {options.map((option) => (
                                <div key={option} className="form-check">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    checked={formData.permissions[
                                      category
                                    ].includes(option)}
                                    onChange={(e) => {
                                      const updatedPermissions = e.target
                                        .checked
                                        ? [
                                            ...formData.permissions[category],
                                            option,
                                          ]
                                        : formData.permissions[category].filter(
                                            (perm) => perm !== option
                                          );

                                      setFormData((prev) => ({
                                        ...prev,
                                        permissions: {
                                          ...prev.permissions,
                                          [category]: updatedPermissions,
                                        },
                                      }));
                                    }}
                                    id={`${category}-${option}`}
                                  />
                                  <label
                                    className="form-check-label permission-label"
                                    htmlFor={`${category}-${option}`}
                                  >
                                    <span className="permission-badge">
                                      {option.replace("_", " ").toUpperCase()}
                                    </span>
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
              <div className="form-section-card">
                <h3 className="section-title">
                  <i className="fas fa-phone me-2"></i> Emergency Contact
                </h3>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label"> Contact Person Name</label>
                    <input
                      type="text"
                      id="emergencyContactName"
                      className="form-control"
                      name="emergencyContactName"
                      value={formData.emergencyContactName}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label"> Contact Person Phone</label>
                    <input
                      type="tel"
                      id="emergencyContactPhone"
                      className="form-control"
                      name="emergencyContactPhone"
                      value={formData.emergencyContactPhone}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
              {/* STEP 6: Status & Admin */}
              <div className="form-section-card">
                <h3 className="section-title">
                  <i className="fas fa-info-circle me-2"></i>Status &
                  Administration
                </h3>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Status</label>
                    <select
                    id="status"
                      name="status"
                      className="form-control"
                      value={formData.status}
                      onChange={handleChange}
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Joining Date</label>
                    <input
                      type="date"
                      id="joiningDate"
                      name="joiningDate"
                      className="form-control"
                      value={formData.joiningDate}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* STEP 7: Login Credentials */}
              <div className="form-section-card">
                <h3 className="section-title">
                  <i className="fas fa-key me-2"></i>Login Credentials
                </h3>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Username *</label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      className="form-control"
                      placeholder="username.coord"
                      value={formData.username}
                      onChange={handleChange}
                      required
                    />
                    <small className="text-muted">
                      Auto-generated from name, can be modified
                    </small>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Password *</label>
                    <div className="input-group">
                      <input
                        type="password"
                        id="password"
                        name="password"
                        className="form-control"
                        placeholder="Generate strong password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={generatePassword}
                      >
                        <i className="fas fa-sync-alt"></i> Generate
                      </button>
                    </div>
                    <small className="text-muted">
                      Use generate button for strong password
                    </small>
                  </div>
                </div>
              </div>

              {/* Responsibilities Info */}
              <div className="info-card">
                <div className="info-header">
                  <h4>Coordinator Responsibilities</h4>
                </div>
                <div className="responsibilities-grid">
                  <div className="responsibility-item">
                    <i className="fas fa-check-circle"></i>
                    <span>Student Enrollment Management</span>
                  </div>
                  <div className="responsibility-item">
                    <i className="fas fa-check-circle"></i>
                    <span>Course Registration Oversight</span>
                  </div>
                  <div className="responsibility-item">
                    <i className="fas fa-check-circle"></i>
                    <span>Academic Progress Monitoring</span>
                  </div>
                  <div className="responsibility-item">
                    <i className="fas fa-check-circle"></i>
                    <span>Faculty Coordination</span>
                  </div>
                  <div className="responsibility-item">
                    <i className="fas fa-check-circle"></i>
                    <span>Examination Management</span>
                  </div>
                  <div className="responsibility-item">
                    <i className="fas fa-check-circle"></i>
                    <span>Student Query Resolution</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="form-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => navigate("/admin/dashboard/coordinators/list")}
                >
                  <i className="fas fa-times me-2"></i>Cancel
                </button>
                <button type="submit" className="btn-submit">
                  <i className="fas fa-check me-2"></i>Add Coordinator
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
       {/* Success Modal */}
      {showSuccessModal && registeredCoord && (
        <div className="modal-overlay" onClick={() => setShowSuccessModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <i className="fas fa-check-circle text-success me-2"></i>
                Faculty Member Added Successfully!
              </h3>
              <button className="btn-close" onClick={() => setShowSuccessModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              <div className="success-animation">
                <i className="fas fa-user-check"></i>
              </div>

              <div className="faculty-details">
                <div className="detail-item">
                  <i className="fas fa-user-graduate"></i>
                  <div>
                    <strong>Faculty Name</strong>
                    <span>{registeredCoord.name}</span>
                  </div>
                </div>
                <div className="detail-item">
                  <i className="fas fa-envelope"></i>
                  <div>
                    <strong>Email Address</strong>
                    <span>{registeredCoord.email}</span>
                  </div>
                </div>
                <div className="detail-item">
                  <i className="fas fa-id-card"></i>
                  <div>
                    <strong>Employee ID</strong>
                    <span>{registeredCoord.employeeID}</span>
                  </div>
                </div>
                <div className="detail-item">
                  <i className="fas fa-building"></i>
                  <div>
                    <strong>Department</strong>
                    <span>{registeredCoord.department}</span>
                  </div>
                </div>
                <div className="detail-item">
                  <i className="fas fa-briefcase"></i>
                  <div>
                    <strong>Designation</strong>
                    <span>{registeredCoord.designation}</span>
                  </div>
                </div>
              </div>

              <div className="alert alert-info">
                <i className="fas fa-info-circle me-2"></i>
                Faculty member has been registered successfully. Login credentials will be sent via email.
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={handleAddAnother}
                disabled={sendingEmail}
              >
                <i className="fas fa-user-plus me-2"></i>
                Add Another Faculty
              </button>
              <button
                className="btn btn-success"
                onClick={handleSendCredentials}
                disabled={sendingEmail}
              >
                {
                  sendingEmail ? (
                    <>
                      <i className="fas fa-spinner fa-spin me-2"></i>
                      Sending Email.....
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane me-2"></i>
                      Send Login Credentials
                    </>
                  )
                }

              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoodAdd;
