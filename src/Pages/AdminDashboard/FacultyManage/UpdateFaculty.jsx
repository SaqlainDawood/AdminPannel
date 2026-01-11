import React, { useEffect, useState } from "react";
import './UpdateFaculty.css';
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import {
  MDBTable,
  MDBTableBody,
  MDBTableHead,
  MDBContainer,
  MDBSpinner,
  MDBBtn,
  MDBCard,
  MDBCardBody,
} from "mdb-react-ui-kit";

const UpdateFaculty = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    employeeID: "",
     name:"",
    email: "",
    phone: "",
    cnic: "",
    dateOfBirth: "",
    gender: "",
    city: "",
    department: "",
    designation: "",
    qualification: "",
    specialization: "",
    experience: "",
    joiningDate: "",
    salary: "",
    accountTitle: "",
    accountNumber: "",
    bankName: "",
    emergencyContact: "",
    emergencyPerson: "",
  });

  const [loading, setLoading] = useState(true);

  // Fetch faculty data
  useEffect(() => {
    if (!id) {
      toast.error("Invalid Faculty ID! Redirecting to Faculty List...");
      navigate("/admin/dashboard/faculty/list");
      return;
    }

    const fetchFacultyData = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/api/faculty/view/${id}`);
        const facultyData = {
          ...res.data,
          experience:res.data.experience?parseInt(res.data.experience)||0:0
        }
        setFormData(facultyData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching faculty data:", error);
        toast.error("Error fetching faculty data");
        navigate("/admin/dashboard/faculty/list");
      }
    };

    fetchFacultyData();
  }, [id, navigate]);

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:8000/api/faculty/update/${id}`, formData);
      toast.success("Faculty updated successfully!");
      navigate("/admin/dashboard/faculty/list");
    } catch (error) {
      console.error("Error updating faculty:", error);
      toast.error("Error updating faculty member");
    }
  };

  if (loading) {
    return (
      <MDBContainer className="text-center mt-5">
        <MDBSpinner grow color="primary" />
        <p className="mt-2">Loading Faculty Data...</p>
      </MDBContainer>
    );
  }

  return (
    <MDBContainer className="py-4">
      <MDBCard className="shadow-4">
        <MDBCardBody className="">
          <div className="d-flex justify-content-between align-item-center mb-4">
              <h3 className="text-primary fw-bold">
            Update Faculty Information
          </h3>
            <button className="btn btn-outline-primary"
            onClick={()=>navigate('/admin/dashboard/faculty/list')}>back to list</button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="table-responsive">
            <MDBTable bordered hover>
              <MDBTableHead>
                <tr className="table-primary text-center">
                  <th colSpan={4}>Faculty Details</th>
                </tr>
              </MDBTableHead>

              <MDBTableBody>
                <tr>
                  <th>Employee ID</th>
                  <td>
                    <input
                      type="text"
                      name="employeeID"
                      value={formData.employeeID}
                      onChange={handleChange}
                      className="form-control"
                      disabled
                    />
                  </td>
                  <th>Full Name</th>
                  <td>
                    <input
                      type="text"
                      name="name"
                      value={`${formData.name}`}
                      onChange={handleChange}
                      className="form-control"
                    />
                  </td>
                </tr>

                <tr>
                  <th>Email</th>
                  <td>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="form-control"
                    />
                  </td>
                  <th>Phone</th>
                  <td>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="form-control"
                    />
                  </td>
                </tr>

                <tr>
                  <th>Department</th>
                  <td>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="form-control"
                    />
                  </td>
                  <th>Designation</th>
                  <td>
                    <input
                      type="text"
                      name="designation"
                      value={formData.designation}
                      onChange={handleChange}
                      className="form-control"
                    />
                  </td>
                </tr>

                <tr>
                  <th>Qualification</th>
                  <td>
                    <input
                      type="text"
                      name="qualification"
                      value={formData.qualification}
                      onChange={handleChange}
                      className="form-control"
                    />
                  </td>
                  <th>Specialization</th>
                  <td>
                    <input
                      type="text"
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleChange}
                      className="form-control"
                    />
                  </td>
                </tr>

                <tr>
                  <th>Experience</th>
                  <td>
                    <input
                      type="number"
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                      className="form-control"
                       placeholder="e.g., 5 years"
                    />
                  </td>
                  <th>Joining Date</th>
                  <td>
                    <input
                      type="date"
                      name="joiningDate"
                      value={formData.joiningDate?.substring(0, 10)}
                      onChange={handleChange}
                      className="form-control"
                    />
                  </td>
                </tr>

                <tr>
                  <th>CNIC</th>
                  <td>
                    <input
                      type="text"
                      name="cnic"
                      value={formData.cnic}
                      onChange={handleChange}
                      className="form-control"
                    />
                  </td>
                  <th>Gender</th>
                  <td>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="form-select"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </td>
                </tr>

                <tr>
                  <th>City</th>
                  <td>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="form-control"
                    />
                  </td>
                  <th>Salary</th>
                  <td>
                    <input
                      type="number"
                      name="salary"
                      value={formData.salary}
                      onChange={handleChange}
                      className="form-control"
                    />
                  </td>
                </tr>

                <tr>
                  <th>Account Title</th>
                  <td>
                    <input
                      type="text"
                      name="accountTitle"
                      value={formData.accountTitle}
                      onChange={handleChange}
                      className="form-control"
                    />
                  </td>
                  <th>Account Number</th>
                  <td>
                    <input
                      type="text"
                      name="accountNumber"
                      value={formData.accountNumber}
                      onChange={handleChange}
                      className="form-control"
                    />
                  </td>
                </tr>

                <tr>
                  <th>Bank Name</th>
                  <td>
                    <input
                      type="text"
                      name="bankName"
                      value={formData.bankName}
                      onChange={handleChange}
                      className="form-control"
                    />
                  </td>
                  <th>Emergency Person</th>
                  <td>
                    <input
                      type="text"
                      name="emergencyPerson"
                      value={formData.emergencyPerson}
                      onChange={handleChange}
                      className="form-control"
                    />
                  </td>
                </tr>

                <tr>
                  <th>Emergency Contact</th>
                  <td colSpan={3}>
                    <input
                      type="text"
                      name="emergencyContact"
                      value={formData.emergencyContact}
                      onChange={handleChange}
                      className="form-control"
                    />
                  </td>
                </tr>
              </MDBTableBody>
            </MDBTable>
              </div>
            <div className="text-center mt-4">
              <MDBBtn type="submit" color="success" size="lg" className="px-5">
                Update Faculty
              </MDBBtn>
            </div>
          </form>
        </MDBCardBody>
      </MDBCard>
    </MDBContainer>
  );
};

export default UpdateFaculty;
