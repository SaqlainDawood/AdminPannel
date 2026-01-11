import React from 'react'
import './Faculty.css'
import { useNavigate, useParams } from 'react-router-dom'
import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify'
import { MDBNavbar, MDBContainer, MDBTable, MDBTableHead, MDBTableBody, MDBNavbarBrand, MDBCard, MDBCardBody } from 'mdb-react-ui-kit';
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
        const res = await axios.get(`http://localhost:8000/api/faculty/view/${id}`)
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

  return (
    <>
      <div className='table-responsive'>
        <MDBContainer className='py-4'>
          <MDBCard className='shadow-4'>
            <MDBCardBody className=''>
              <div className='d-flex justify-content-between align-item-center mb-4'>
                <h3 className='text-primary fw-bold'>View Faculty Information</h3>
              <button  className="btn btn-outline-primary"
              onClick={()=>navigate('/admin/dashboard/faculty/list')}
              >Back to List</button>
              </div>
              <MDBTable bordered hover responsive className="align-middle custom-table" >
                <MDBTableHead>
                  <tr className='text-center table-primary'>
                    <th colSpan={4}>View Faculty Member</th>
                  </tr>
                  
                </MDBTableHead>
                <MDBTableBody>
                  <tr>
                    <th scope='col'>Facutly ID</th>
                    <td className='text-success fw-bold'>{faculty?.employeeID}</td>
                    <th scope='col'>Faculty Name</th>
                    <td className='text-success fw-bold'>{faculty?.name}</td>
                  </tr>
                  <tr>
                    <th scope='col'>Email</th>
                    <td className='text-warning fw-bold'>{faculty?.email}</td>
                    <th scope='col'>Designation</th>
                    <td className='text-warning fw-bold'>{faculty?.designation}</td>
                  </tr>
                  <tr>
                    <th scope='col'>Department</th>
                    <td className='text-info fw-bold'>{faculty?.department}</td>
                    <th scope='col'>Qualification</th>
                    <td className='text-info fw-bold'>{faculty?.qualification}</td>
                  </tr>
                  <tr>
                    <th scope='col'>Specialization</th>
                    <td className='text-warning fw-bold'>{faculty?.specialization}</td>
                    <th scope='col'>Experience Level</th>
                    <td className='text-warning fw-bold'>{faculty?.experience}</td>
                  </tr>
                  <tr>
                    <th scope='col'>Phone Number</th>
                    <td className='text-info fw-bold'>{faculty?.phone}</td>
                    <th scope='col'>Status</th>
                    <td className='text-info fw-bold'>{faculty?.status}</td>
                  </tr>
                  <tr>
                    <th scope='col'>CNIC</th>
                    <td className='text-success fw-bold'>{faculty.cnic}</td>
                    <th scope='col'>City</th>
                    <td className='text-warning fw-bold'>{faculty?.city}</td>
                  </tr>
                  <tr>
                    <th scope='col'>Date of Birth</th>
                    <td>{faculty.dateOfBirth}</td>
                    <th scope='col'>Gender</th>
                    <td className='text-success fw-bold'>{faculty?.gender}</td>
                  </tr>
                  <tr>
                    <th>Salary</th>
                    <td className='text-success fw-bold'>{faculty?.salary}</td>
                    <th>Bank Name</th>
                    <td className='text-danger fw-bold'>{faculty?.bankName}</td>
                  </tr>

                  <tr>
                    <th scope='col'>Account Title</th>
                    <td className='text-ternary fw-bold'>{faculty.accountTitle}</td>
                    <th scope='col'>Account Number</th>
                    <td>{faculty.accountNumber}</td>
                  </tr>
                  <tr>
                    <th scope='col'>Emergency Contact Person</th>
                    <td className='text-warning fw-bold'>{faculty.emergencyPerson}</td>
                    <th scope='col'>Emergency Contact Number</th>
                    <td className='text-info fw-bold'>{faculty?.emergencyContact}</td>
                  </tr>
                  <tr>
                    <th scope='col'>Joining Date</th>
                    <td colSpan={1} className='text-info fw-bold'>{faculty?.joiningDate}</td>
                    <th scope='col'>User Name</th>
                    <td colSpan={1} className='text-info fw-bold'>{faculty?.userName}</td>
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