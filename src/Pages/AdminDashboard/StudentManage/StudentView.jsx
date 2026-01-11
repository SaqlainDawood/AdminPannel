import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify'
import { MDBNavbar, MDBContainer, MDBTable, MDBTableHead, MDBTableBody, MDBNavbarBrand, MDBCard, MDBCardBody } from 'mdb-react-ui-kit';

const StudentView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchStudentById = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        if (!token) {
          toast.error("Not Authorized User");
          navigate('/admin/login');
          return;
        }

        // Check if ID is valid
        if (!id || id === ":id") {
          toast.error("Invalid Student ID! Redirecting to Student List...");
          setTimeout(() => {
            navigate("/admin/dashboard/students/list");
          }, 2000);
          return;
        }
        const res = await axios.get(`http://localhost:8000/api/admin/student/view/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

     
        
        // FIXED: Set the actual student data from response
        if (res.data.success && res.data.student) {
          setStudent(res.data.student);
        } else {
          toast.error("Student data not found in response");
          setNotFound(true);
        }
        
        setLoading(false);
      } catch (error) {
        console.log("Error fetching Student by id:", error);
        
        // FIXED: error.response instead of error.res
        if (error.response && error.response.status === 404) {
          setNotFound(true);
          toast.error("Student not found!");
        } else if (error.response && error.response.status === 401) {
          toast.error("Unauthorized! Please login again.");
          localStorage.removeItem("adminToken");
          navigate('/admin/login');
        } else {
          toast.error("Error fetching Student details!");
        }
        setLoading(false);
      }
    }
    fetchStudentById();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="loader-container">
        <div className="spinner"></div>
        <p>Loading Student details...</p>
      </div>
    );
  }

  if (notFound || !student) {
    return (
      <div className="notfound-container">
        <h2>Student Not Found</h2>
        <p>The requested Student record doesn't exist.</p>
        <button
          className="back-btn"
          onClick={() => navigate("/admin/dashboard/students/list")}
        >
          ← Back to Student List
        </button>
      </div>
    );
  }

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className='table-responsive'>
      <MDBContainer className='py-4'>
        <MDBCard className='shadow-4'>
          <MDBCardBody className=''>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3 className='text-primary fw-bold'>Student Information</h3>
              <button 
                className="btn btn-outline-primary"
                onClick={() => navigate("/admin/dashboard/students/list")}
              >
                ← Back to List
              </button>
            </div>
            
            <MDBTable bordered hover responsive className="align-middle custom-table">
              <MDBTableHead>
                <tr className='text-center table-primary'>
                  <th colSpan={4}>Student Details</th>
                </tr>
              </MDBTableHead>
              <MDBTableBody>
                {/* Personal Information */}
                <tr>
                  <th scope='col'>Roll Number</th>
                  <td className='text-success fw-bold'>{student.rollNo || 'N/A'}</td>
                  <th scope='col'>Full Name</th>
                  <td className='text-success fw-bold'>
                    {student.firstName} {student.lastName}
                  </td>
                </tr>
                <tr>
                  <th scope='col'>Email</th>
                  <td className='text-warning fw-bold'>{student?.user?.email}</td>
                  <th scope='col'>Phone Number</th>
                  <td className='text-warning fw-bold'>{student.phoneNo || 'N/A'}</td>
                </tr>
                <tr>
                  <th scope='col'>CNIC</th>
                  <td className='text-info fw-bold'>{student.cnic || 'N/A'}</td>
                  <th scope='col'>Date of Birth</th>
                  <td className='text-info fw-bold'>{formatDate(student.DOB)}</td>
                </tr>
                <tr>
                  <th scope='col'>Gender</th>
                  <td className='text-warning fw-bold'>{student.gender || 'N/A'}</td>
                  <th scope='col'>Blood Group</th>
                  <td className='text-warning fw-bold'>{student.bloodGroup || 'N/A'}</td>
                </tr>
                <tr>
                  <th scope='col'>Marital Status</th>
                  <td className='text-info fw-bold'>{student.maritalStatus || 'N/A'}</td>
                  <th scope='col'>Religion</th>
                  <td className='text-info fw-bold'>{student.religion || 'N/A'}</td>
                </tr>
                <tr>
                  <th scope='col'>Nationality</th>
                  <td className='text-success fw-bold'>{student.nationality || 'N/A'}</td>
                  <th scope='col'>Status</th>
                  <td className='text-warning fw-bold'>
                    <span className={`badge ${
                      student.status === 'Active' || student.status === 'Assigned' ? 'bg-success' :
                      student.status === 'Suspended' ? 'bg-warning' :
                      student.status === 'rejected' ? 'bg-danger' : 'bg-secondary'
                    }`}>
                      {student.status}
                    </span>
                  </td>
                </tr>

                {/* Address Information */}
                <tr>
                  <th scope='col'>Present Address</th>
                  <td colSpan={3}>{student.presentAddress || 'N/A'}</td>
                </tr>
                <tr>
                  <th scope='col'>Permanent Address</th>
                  <td colSpan={3}>{student.permanentAddress || 'N/A'}</td>
                </tr>
                <tr>
                  <th scope='col'>Province</th>
                  <td className='text-success fw-bold'>{student.province || 'N/A'}</td>
                  <th scope='col'>Domicile</th>
                  <td className='text-warning fw-bold'>{student.domicile || 'N/A'}</td>
                </tr>

                {/* Academic Information */}
                {student.enrollment && (
                  <>
                    <tr className="table-info">
                      <th colSpan={4} className="text-center">Academic Information</th>
                    </tr>
                    <tr>
                      <th scope='col'>Department</th>
                      <td className='text-success fw-bold'>{student.enrollment.department}</td>
                      <th scope='col'>Program</th>
                      <td className='text-success fw-bold'>{student.enrollment.program}</td>
                    </tr>
                    <tr>
                      <th scope='col'>Semester</th>
                      <td className='text-warning fw-bold'>{student.enrollment.semester}</td>
                      <th scope='col'>Session</th>
                      <td className='text-warning fw-bold'>{student.enrollment.session}</td>
                    </tr>
                    <tr>
                      <th scope='col'>Campus</th>
                      <td className='text-info fw-bold'>{student.enrollment.campus}</td>
                      <th scope='col'>Shift</th>
                      <td className='text-info fw-bold'>{student.enrollment.shift}</td>
                    </tr>
                    <tr>
                      <th scope='col'>Applied On</th>
                      <td colSpan={3} className='text-warning fw-bold'>
                        {formatDate(student.enrollment.appliedOn)}
                      </td>
                    </tr>
                  </>
                )}

                {/* Family Information */}
                {student.family && (
                  <>
                    <tr className="table-warning">
                      <th colSpan={4} className="text-center">Family Information</th>
                    </tr>
                    <tr>
                      <th scope='col'>Father's Name</th>
                      <td className='text-success fw-bold'>{student.family.fatherName}</td>
                      <th scope='col'>Mother's Name</th>
                      <td className='text-success fw-bold'>{student.family.motherName}</td>
                    </tr>
                    <tr>
                      <th scope='col'>Father's CNIC</th>
                      <td className='text-warning fw-bold'>{student.family.fatherCnic}</td>
                      <th scope='col'>Father's Mobile</th>
                      <td className='text-warning fw-bold'>{student.family.fatherMobile}</td>
                    </tr>
                  </>
                )}

                {/* Documents Information */}
                {student.documents && (
                  <>
                    <tr className="table-success">
                      <th colSpan={4} className="text-center">Documents Status</th>
                    </tr>
                    <tr>
                      <th scope='col'>CNIC Document</th>
                      <td>
                        <span className={`badge ${student.documents.cnic ? 'bg-success' : 'bg-danger'}`}>
                          {student.documents.cnic ? 'Verified' : 'Missing'}
                        </span>
                      </td>
                      <th scope='col'>Marksheet</th>
                      <td>
                        <span className={`badge ${student.documents.marksheet ? 'bg-success' : 'bg-danger'}`}>
                          {student.documents.marksheet ? 'Verified' : 'Missing'}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <th scope='col'>Photo</th>
                      <td>
                        <span className={`badge ${student.documents.photo ? 'bg-success' : 'bg-danger'}`}>
                          {student.documents.photo ? 'Verified' : 'Missing'}
                        </span>
                      </td>
                      <th scope='col'>Domicile</th>
                      <td>
                        <span className={`badge ${student.documents.domicile ? 'bg-success' : 'bg-danger'}`}>
                          {student.documents.domicile ? 'Verified' : 'Missing'}
                        </span>
                      </td>
                    </tr>
                  </>
                )}

                {/* Additional Information */}
                <tr>
                  <th scope='col'>Registration No</th>
                  <td className='text-info fw-bold'>{student.registrationNo || 'N/A'}</td>
                  <th scope='col'>CGPA</th>
                  <td className='text-info fw-bold'>
                    {student.cgpa ? student.cgpa.toFixed(2) : 'N/A'}
                  </td>
                </tr>
                <tr>
                  <th scope='col'>Created At</th>
                  <td colSpan={3} className='text-muted'>
                    {formatDate(student.createdAt)}
                  </td>
                </tr>
              </MDBTableBody>
            </MDBTable>
          </MDBCardBody>
        </MDBCard>
      </MDBContainer>
    </div>
  )
}

export default StudentView