import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Faculty.css';
import { toast } from 'react-toastify'
import axios from 'axios'
import AdminAPI from '../../../api';
const FacultyAdd = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    employeeID: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    cnic: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    city: '',
    department: '',
    designation: '',
    qualification: '',
    specialization: '',
    experience: '',
    joiningDate: '',
    salary: '',
    accountTitle: '',
    accountNumber: '',
    bankName: '',
    emergencyContact: '',
    emergencyPerson: '',
    userName: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [registeredFaculty, setRegisteredFaculty] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Image size should be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      setProfileImage(file);
      setError('');
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          submitData.append(key, formData[key]);
        }
      });
      if (profileImage) {
        submitData.append('profileImage', profileImage);
      }
      const res = await AdminAPI.post('/faculty/add',
        submitData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        })
         console.log("✅ Backend Response:", res.data); 
    console.log("📧 Form Email:", formData.email);
      if (res.data.success) {
        setRegisteredFaculty({
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          employeeID: formData.employeeID,
          department: formData.department,
          designation: formData.designation,
          userName: formData.userName,         // Add this
          password: formData.password,         // Add this
          joiningDate: formData.joiningDate    // Add this
        });
              console.log("✅ registeredFaculty state:", {  // Add this
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        // ... other fields
      });
      
        setShowSuccessModal(true);
        // toast.success('Faculty member added successfully!');
        setFormData({
          employeeID: '',
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          cnic: '',
          dateOfBirth: '',
          gender: '',
          address: '',
          city: '',
          department: '',
          designation: '',
          qualification: '',
          specialization: '',
          experience: '',
          joiningDate: '',
          salary: '',
          accountTitle: '',
          accountNumber: '',
          bankName: '',
          emergencyContact: '',
          emergencyPerson: '',
          userName: '',
          password: ''
        })
        setProfileImage(null);
        setImagePreview('');


        // navigate('/admin/dashboard/faculty/list');
      }
    } catch (error) {
      console.error('API Error:', error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.code === 'ERR_NETWORK') {
        setError('Cannot connect to server. Please check if backend is running.');
      } else {
        setError('Failed to add faculty member. Please try again.');
      }
    } finally {
      setLoading(false);
    }
    // navigate('/admin/dashboard/faculty/list');
  };

  const handleCancel = () => {
    navigate('/admin/dashboard/faculty/list');
  };
 const handleSendCredentials = async () => {
  if (!registeredFaculty) return;
  setSendingEmail(true);
  
  try {
    const emailData = {
      to: registeredFaculty.email,
      subject: `Welcome to University - Your Faculty Account Credentials`,
      facultyName: registeredFaculty.name,
      employeeID: registeredFaculty.employeeID,
      department: registeredFaculty.department,
      designation: registeredFaculty.designation,
      userName: registeredFaculty.userName,
      password: registeredFaculty.password,
      joiningDate: registeredFaculty.joiningDate
    };

    const res = await axios.post("http://localhost:8000/api/faculty/send-credential",
      emailData,
      {
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

    if (res.data.success) {
      toast.success(`Login credentials sent successfully to ${registeredFaculty.email}`);
      setShowSuccessModal(false);
      navigate('/admin/dashboard/faculty/list');
    } else {
      toast.error(res.data.message || 'Failed to send email. Please try again.');
    }
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
    setRegisteredFaculty(null);
  };
  const departments = [
    'Computer Science',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Software Engineering'
  ];

  const designations = [
    'Professor',
    'Associate Professor',
    'Assistant Professor',
    'Lecturer',
    'Visiting Faculty'
  ];

  return (
    <div className="faculty-add-container">
      <div className="container-fluid">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">
              <i className="fas fa-user-plus me-3"></i>Add New Faculty
            </h1>
            <p className="page-subtitle">
              Fill in the details to register a new faculty member
            </p>
          </div>
        </div>
        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            <strong>Error:</strong> {error}
            <button type="button" className="btn-close" onClick={() => setError('')}></button>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="row g-4">
            {/* Left Column - Profile Image */}
            <div className="col-lg-4">
              <div className="profile-upload-card">
                <h3 className="card-title">
                  <i className="fas fa-camera me-2"></i>Profile Photo
                </h3>
                <div className="image-upload-area">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="image-preview" />
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
                <p className="upload-hint">
                  Recommended: Square image, at least 500x500px
                </p>

                {/* Quick Info */}
                <div className="quick-info-box">
                  <h4>Required Documents</h4>
                  <ul>
                    <li><i className="fas fa-check-circle text-success"></i> CNIC Copy</li>
                    <li><i className="fas fa-check-circle text-success"></i> Educational Certificates</li>
                    <li><i className="fas fa-check-circle text-success"></i> Experience Letters</li>
                    <li><i className="fas fa-check-circle text-success"></i> Recent Photograph</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Right Column - Form Fields */}
            <div className="col-lg-8">
              {/* Personal Information */}
              <div className="form-section-card">
                <h3 className="section-title">
                  <i className="fas fa-user me-2"></i>Personal Information
                </h3>
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label">Employee ID *</label>
                    <input
                      type="text"
                      name="employeeID"
                      className="form-control"
                      placeholder="FAC-2024-001"
                      value={formData.employeeID}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">First Name *</label>
                    <input
                      type="text"
                      name="firstName"
                      className="form-control"
                      placeholder="Enter first name"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Last Name *</label>
                    <input
                      type="text"
                      name="lastName"
                      className="form-control"
                      placeholder="Enter last name"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Email Address *</label>
                    <input
                      type="email"
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
                      name="phone"
                      className="form-control"
                      placeholder="+92 300 1234567"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">CNIC *</label>
                    <input
                      type="text"
                      name="cnic"
                      className="form-control"
                      placeholder="12345-1234567-1"
                      value={formData.cnic}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Date of Birth *</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      className="form-control"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Gender *</label>
                    <select
                      name="gender"
                      className="form-control"
                      value={formData.gender}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="col-md-8">
                    <label className="form-label">Address *</label>
                    <input
                      type="text"
                      name="address"
                      className="form-control"
                      placeholder="Street address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">City *</label>
                    <input
                      type="text"
                      name="city"
                      className="form-control"
                      placeholder="City"
                      value={formData.city}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              <div className="form-section-card">
                <h3 className="section-title">
                  <i className="fas fa-graduation-cap me-2"></i>Academic Information
                </h3>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Department *</label>
                    <select
                      name="department"
                      className="form-control"
                      value={formData.department}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Department</option>
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Designation *</label>
                    <select
                      name="designation"
                      className="form-control"
                      value={formData.designation}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Designation</option>
                      {designations.map(des => (
                        <option key={des} value={des}>{des}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Highest Qualification *</label>
                    <input
                      type="text"
                      name="qualification"
                      className="form-control"
                      placeholder="e.g., PhD Computer Science"
                      value={formData.qualification}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Specialization *</label>
                    <input
                      type="text"
                      name="specialization"
                      className="form-control"
                      placeholder="e.g., AI, Machine Learning"
                      value={formData.specialization}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Experience (Years) *</label>
                    <input
                      type="number"
                      name="experience"
                      className="form-control"
                      placeholder="Years of experience"
                      value={formData.experience}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Joining Date *</label>
                    <input
                      type="date"
                      name="joiningDate"
                      className="form-control"
                      value={formData.joiningDate}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Financial Information */}
              <div className="form-section-card">
                <h3 className="section-title">
                  <i className="fas fa-wallet me-2"></i>Financial Information
                </h3>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Monthly Salary (PKR) *</label>
                    <input
                      type="number"
                      name="salary"
                      className="form-control"
                      min="1"
                      step="0.01"
                      placeholder="Amount in PKR"
                      value={formData.salary}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Bank Name *</label>
                    <input
                      type="text"
                      name="bankName"
                      className="form-control"
                      placeholder="Bank name"
                      value={formData.bankName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Account Title *</label>
                    <input
                      type="text"
                      name="accountTitle"
                      className="form-control"
                      placeholder="Account holder name"
                      value={formData.accountTitle}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Account Number *</label>
                    <input
                      type="text"
                      name="accountNumber"
                      className="form-control"
                      placeholder="Bank account number"
                      value={formData.accountNumber}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="form-section-card">
                <h3 className="section-title">
                  <i className="fas fa-phone-square me-2"></i>Emergency Contact
                </h3>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Contact Person Name *</label>
                    <input
                      type="text"
                      name="emergencyPerson"
                      className="form-control"
                      placeholder="Emergency contact name"
                      value={formData.emergencyPerson}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Contact Person Phone *</label>
                    <input
                      type="tel"
                      name="emergencyContact"
                      className="form-control"
                      placeholder="+92 300 1234567"
                      value={formData.emergencyContact}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>
              {/* Login Credentials */}
              <div className="form-section-card">
                <h3 className="section-title">
                  <i className="fas fa-key me-2"></i>Login Credentials
                </h3>
                <div className="row g-3" >
                  <div className="col-md-6">
                    <label className="form-label">User Name</label>
                    <input type='text'
                      name='userName'
                      className='form-control'
                      value={formData.userName}
                      placeholder='Saqlain@university.edu'
                      onChange={handleChange}
                      required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Password</label>
                    <div className="password-input-container">
                      <input type={showPassword ? "text" : "password"}
                        id='password'
                        name='password'
                        value={formData.password}
                        onChange={handleChange}
                        placeholder='********'
                        className='form-control password-input'
                        required />
                      <button
                        type="button"
                        className="password-toggle-btn"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={handleCancel}>
                  <i className="fas fa-times me-2"></i>Cancel
                </button>
                <button type="submit"
                  className="btn-submit"
                  disabled={loading}>
                  {loading ? (<>
                    <i className="fas fa-spinner fa-spin me-2"></i>
                    Adding...
                  </>) : (
                    <>
                      <i className="fas fa-check me-2"></i>
                      Add Faculty Member
                    </>
                  )
                  }
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
      {/* Success Modal */}
      {showSuccessModal && registeredFaculty && (
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
                    <span>{registeredFaculty.name}</span>
                  </div>
                </div>
                <div className="detail-item">
                  <i className="fas fa-envelope"></i>
                  <div>
                    <strong>Email Address</strong>
                    <span>{registeredFaculty.email}</span>
                  </div>
                </div>
                <div className="detail-item">
                  <i className="fas fa-id-card"></i>
                  <div>
                    <strong>Employee ID</strong>
                    <span>{registeredFaculty.employeeID}</span>
                  </div>
                </div>
                <div className="detail-item">
                  <i className="fas fa-building"></i>
                  <div>
                    <strong>Department</strong>
                    <span>{registeredFaculty.department}</span>
                  </div>
                </div>
                <div className="detail-item">
                  <i className="fas fa-briefcase"></i>
                  <div>
                    <strong>Designation</strong>
                    <span>{registeredFaculty.designation}</span>
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

export default FacultyAdd;