import React from 'react'
import './Faculty.css'
import { useNavigate, useParams } from 'react-router-dom'
import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify'
import { MDBNavbar, MDBContainer, MDBTable, MDBTableHead, MDBTableBody, MDBNavbarBrand, MDBCard, MDBCardBody } from 'mdb-react-ui-kit';
import AdminAPI from '../../../api';
const ViewFaculty = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [faculty, setFaculty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id || id === ":id") {
      toast.error("Invalid Faculty ID! Redirecting to Faculty List...");

      setTimeout(() => {
        navigate("/admin/dashboard/faculty/list");
      }, 2000);
      return;
    }
    const fetchFacultyById = async () => {
      try {
        const res = await AdminAPI.get(`/faculty/view/${id}`)
        setFaculty(res.data);
        setLoading(false);
      } catch (error) {
        console.log("Error fetching Faculty by id:", error);
        if (error.res && error.res.status === 404) {
          setNotFound(true);
        }
        else {
          toast.error("Error fetching Faculty details!")
        }
        setLoading(false);
      }
    }
    fetchFacultyById();
  }, [id, navigate]);
  if (loading) {
    return (
      <div className="loader-container">
        <div className="spinner"></div>
        <p>Loading faculty details...</p>
      </div>
    );
  }
  if (notFound || !faculty) {
    return (
      <div className="notfound-container">
        <h2>Faculty Not Found</h2>
        <p>The requested faculty record doesn’t exist.</p>
        <button
          className="back-btn"
          onClick={() => navigate("/admin/dashboard/faculty/list")}
        >
          ← Back to Faculty List
        </button>
      </div>
    );
  }
  if (!faculty) return <h1 className='text-center mt-10'>Loading.........</h1>
// Add this function at the top of your component
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};
  return (
    <>
     <div className='table-responsive'>
  <MDBContainer className='py-4'>
    <MDBCard className='shadow-4'>
      <MDBCardBody className=''>
        <div className='d-flex justify-content-between align-items-center mb-4'>
          <h3 className='text-primary fw-bold'>Faculty Information</h3>
          <button 
            className="btn btn-outline-primary d-flex align-items-center gap-2"
            onClick={() => navigate('/admin/dashboard/faculty/list')}
          >
           <i className="fas fa-arrow-left me-2"></i>Back
          </button>
        </div>
        
        <MDBTable bordered hover responsive className="align-middle custom-table">
          <MDBTableHead>
            <tr className='text-center table-primary'>
              <th colSpan={4}>Faculty Details</th>
            </tr>
          </MDBTableHead>
          
          <MDBTableBody>
            {/* Personal Information */}
            <tr>
              <th scope='col'>Faculty ID</th>
              <td className='text-success fw-bold'>{faculty?.employeeID || "N/A"}</td>
              <th scope='col'>Full Name</th>
              <td className='text-success fw-bold'>{faculty?.name || "N/A"}</td>
            </tr>
            
            <tr>
              <th scope='col'>Email</th>
              <td className='text-warning fw-bold'>{faculty?.user?.email || "N/A"}</td>
              <th scope='col'>Phone Number</th>
              <td className='text-warning fw-bold'>{faculty?.phone || "N/A"}</td>
            </tr>
            
            <tr>
              <th scope='col'>CNIC</th>
              <td className='text-info fw-bold'>{faculty?.cnic || "N/A"}</td>
              <th scope='col'>Date of Birth</th>
              <td className='text-info fw-bold'>{formatDate(faculty?.dateOfBirth)}</td>
            </tr>
            
            <tr>
              <th scope='col'>Gender</th>
              <td className='text-warning fw-bold'>{faculty?.gender || "N/A"}</td>
              <th scope='col'>City</th>
              <td className='text-warning fw-bold'>{faculty?.city || "N/A"}</td>
            </tr>

            {/* Professional Information */}
            <tr className="table-info">
              <th colSpan={4} className="text-center">Professional Information</th>
            </tr>
            
            <tr>
              <th scope='col'>Designation</th>
              <td className='text-success fw-bold'>{faculty?.designation || "N/A"}</td>
              <th scope='col'>Department</th>
              <td className='text-success fw-bold'>{faculty?.department || "N/A"}</td>
            </tr>
            
            <tr>
              <th scope='col'>Qualification</th>
              <td className='text-warning fw-bold'>{faculty?.qualification || "N/A"}</td>
              <th scope='col'>Specialization</th>
              <td className='text-warning fw-bold'>{faculty?.specialization || "N/A"}</td>
            </tr>
            
            <tr>
              <th scope='col'>Experience Level</th>
              <td colSpan={3} className='text-info fw-bold'>
                {faculty?.experience ? `${faculty.experience} years` : "N/A"}
              </td>
            </tr>

            {/* Employment Details */}
            <tr className="table-warning">
              <th colSpan={4} className="text-center">Employment Details</th>
            </tr>
            
            <tr>
              <th scope='col'>Joining Date</th>
              <td className='text-success fw-bold'>{formatDate(faculty?.joiningDate)}</td>
              <th scope='col'>Status</th>
              <td className='text-success fw-bold'>
                <span className={`badge ${
                  faculty?.status === 'Active' ? 'bg-success' :
                  faculty?.status === 'Inactive' ? 'bg-warning' :
                  faculty?.status === 'Suspended' ? 'bg-danger' : 'bg-secondary'
                }`}>
                  {faculty?.status || "N/A"}
                </span>
              </td>
            </tr>
            
            <tr>
              <th scope='col'>Salary</th>
              <td className='text-warning fw-bold'>
                {faculty?.salary ? `$${faculty.salary}` : "N/A"}
              </td>
              <th scope='col'>User Name</th>
              <td className='text-warning fw-bold'>{faculty?.userName || "N/A"}</td>
            </tr>

            {/* Bank Details */}
            <tr className="table-success">
              <th colSpan={4} className="text-center">Bank Details</th>
            </tr>
            
            <tr>
              <th scope='col'>Bank Name</th>
              <td className='text-success fw-bold'>{faculty?.bankName || "N/A"}</td>
              <th scope='col'>Account Title</th>
              <td className='text-success fw-bold'>{faculty?.accountTitle || "N/A"}</td>
            </tr>
            
            <tr>
              <th scope='col'>Account Number</th>
              <td colSpan={3} className='text-info fw-bold'>
                {faculty?.accountNumber || "N/A"}
              </td>
            </tr>

            {/* Emergency Contact */}
            <tr className="table-info">
              <th colSpan={4} className="text-center">Emergency Contact</th>
            </tr>
            
            <tr>
              <th scope='col'>Contact Person</th>
              <td className='text-success fw-bold'>{faculty?.emergencyPerson || "N/A"}</td>
              <th scope='col'>Contact Number</th>
              <td className='text-success fw-bold'>{faculty?.emergencyContact || "N/A"}</td>
            </tr>

            {/* Additional Information */}
            <tr>
              <th scope='col'>Created At</th>
              <td colSpan={3} className='text-muted'>
                {formatDate(faculty?.createdAt)}
              </td>
            </tr>
          </MDBTableBody>
        </MDBTable>
      </MDBCardBody>
    </MDBCard>
  </MDBContainer>
</div>
    </>
  )
}

export default ViewFaculty