import {
  MDBCardBody,
  MDBCard,
  MDBContainer,
  MDBTable,
  MDBTableHead,
  MDBTableBody,
} from "mdb-react-ui-kit";
import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import axios from "axios";
import AdminAPI from "../../../api";
const CoodView = () => {
  const { id } = useParams();
  const [viewCoord, setViewCoord] = useState([]);
  const [loading, setLoading] = useState(true);
   const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  useEffect(() => {
    const fetchCoordinator = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        if (!token) {
          console.log("No Token Found. Redirect to the Login Page.");
          toast.error("No Token Found....");
          navigate("/api/admin/login");
          return;
        }
        if (!id || id === ":id") {
          toast.error("Invalid Student ID! Redirecting to Student List...");
          setTimeout(() => {
            navigate("/admin/dashboard/students/list");
          }, 2000);
          return;
        }
        const res = await AdminAPI.get(
          `/coordinator/view/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );
        console.log("API Response:", res.data);
        if (res.data.success) {
          setViewCoord(res.data.data);
          setLoading(false);
        } else {
          toast.error("Student data not found in response");
          setLoading(false);
        }
      } catch (error) {
        console.log("Error for fetching the coordinator record!!!", error);
        if (error.response && error.response.status === 404) {
          toast.error("Invalid Object Id......");
        } else if (error.response && error.response.status === 401) {
          toast.error("Coordinator is not found");
        }
      }
    };
    fetchCoordinator();
  }, [id, navigate]);
  // Show loading state
  if (loading) {
    return (
      <div className="approvals-container">
        <div className="container-fluid text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading pending approvals...</p>
        </div>
      </div>
    );
  }
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
    <div className="table-responsive">
  <MDBContainer className="py-4">
    <MDBCard className="shadow-4">
      <MDBCardBody className="">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="text-primary fw-bold">Coordinator Information</h3>
          <button
            className="btn btn-outline-primary"
            onClick={() => navigate("/admin/dashboard/coordinators/list")}
          >
           <i className="fas fa-arrow-left me-2"></i>
          </button>
        </div>
        
        <MDBTable bordered hover responsive className="align-middle custom-table">
          <MDBTableHead>
            <tr className="text-center table-primary">
              <th colSpan={4}>Coordinator Details</th>
            </tr>
          </MDBTableHead>
          
          <MDBTableBody>
            {/* Personal Information */}
            <tr>
              <th scope="col">Coordinator ID</th>
              <td className="text-success fw-bold">{viewCoord.coordId || "N/A"}</td>
              <th scope="col">Full Name</th>
              <td className="text-success fw-bold">
                {viewCoord.name || "N/A"}
              </td>
            </tr>
            
            <tr>
              <th scope="col">Email Address</th>
              <td className="text-warning fw-bold">{viewCoord.user?.email || "N/A"}</td>
              <th scope="col">Phone Number</th>
              <td className="text-warning fw-bold">{viewCoord.phone || "N/A"}</td>
            </tr>
            
            <tr>
              <th scope="col">CNIC</th>
              <td className="text-info fw-bold">{viewCoord.cnic || "N/A"}</td>
              <th scope="col">Date of Birth</th>
              <td className="text-info fw-bold">{formatDate(viewCoord.DOB)}</td>
            </tr>
            
            <tr>
              <th scope="col">Address</th>
              <td colSpan={3}>{viewCoord.address || "N/A"}</td>
            </tr>

            {/* Academic Credentials */}
            <tr className="table-info">
              <th colSpan={4} className="text-center">Academic Credentials</th>
            </tr>
            
            <tr>
              <th scope="col">Highest Qualification</th>
              <td className="text-success fw-bold">{viewCoord.highestQualification || "N/A"}</td>
              <th scope="col">Specialization</th>
              <td className="text-success fw-bold">{viewCoord.specialization || "N/A"}</td>
            </tr>
            
            <tr>
              <th scope="col">University/Institution</th>
              <td className="text-warning fw-bold">{viewCoord.institution || "N/A"}</td>
              <th scope="col">Year of Graduation</th>
              <td className="text-warning fw-bold">{viewCoord.graduationYear || "N/A"}</td>
            </tr>
            
            <tr>
              <th scope="col">Degree Certificate</th>
              <td colSpan={3} className="text-info fw-bold">
                {viewCoord.degreeCertificate?.url ? (
                  <a href={viewCoord.degreeCertificate.url} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                    View Certificate
                  </a>
                ) : "N/A"}
              </td>
            </tr>

            {/* Professional Experience */}
            <tr className="table-warning">
              <th colSpan={4} className="text-center">Professional Experience</th>
            </tr>
            
            <tr>
              <th scope="col">Total Years of Experience</th>
              <td className="text-success fw-bold">{viewCoord.yearsOfExperience || "N/A"}</td>
              <th scope="col">Area of Expertise</th>
              <td className="text-success fw-bold">{viewCoord.areaOfExpertise || "N/A"}</td>
            </tr>
            
            <tr>
              <th scope="col">Previous Position</th>
              <td className="text-warning fw-bold">{viewCoord.previousPosition || "N/A"}</td>
              <th scope="col">Previous Institution</th>
              <td className="text-warning fw-bold">{viewCoord.previousInstitution || "N/A"}</td>
            </tr>

            {/* Employment Details */}
            <tr className="table-success">
              <th colSpan={4} className="text-center">Employment Details</th>
            </tr>
            
            <tr>
              <th scope="col">Employment Type</th>
              <td className="text-success fw-bold">{viewCoord.employmentType || "N/A"}</td>
              <th scope="col">Salary Grade</th>
              <td className="text-success fw-bold">{viewCoord.salaryGrade || "N/A"}</td>
            </tr>
            
            <tr>
              <th scope="col">Basic Salary</th>
              <td className="text-warning fw-bold">
                {viewCoord.basicSalary ? `$${viewCoord.basicSalary}` : "N/A"}
              </td>
              <th scope="col">Probation Period</th>
              <td className="text-warning fw-bold">
                {viewCoord.probationPeriod ? `${viewCoord.probationPeriod} months` : "N/A"}
              </td>
            </tr>
            
            <tr>
              <th scope="col">Contract Expiry Date</th>
              <td className="text-info fw-bold">{formatDate(viewCoord.contractExpiry)}</td>
              <th scope="col">Joining Date</th>
              <td className="text-info fw-bold">{formatDate(viewCoord.joiningDate)}</td>
            </tr>

            {/* Bank Details */}
            <tr className="table-info">
              <th colSpan={4} className="text-center">Bank Details</th>
            </tr>
            
            <tr>
              <th scope="col">Bank Name</th>
              <td className="text-success fw-bold">{viewCoord.bankName || "N/A"}</td>
              <th scope="col">Account Title</th>
              <td className="text-success fw-bold">{viewCoord.bankAccountTitle || "N/A"}</td>
            </tr>
            
            <tr>
              <th scope="col">Account Number</th>
              <td colSpan={3} className="text-warning fw-bold">
                {viewCoord.bankAccount || "N/A"}
              </td>
            </tr>

            {/* Role Information */}
            <tr className="table-warning">
              <th colSpan={4} className="text-center">Role Information</th>
            </tr>
            
            <tr>
              <th scope="col">Coordinator Type</th>
              <td className="text-success fw-bold">{viewCoord.coordinatorRole || "N/A"}</td>
              <th scope="col">Department</th>
              <td className="text-success fw-bold">{viewCoord.department || "N/A"}</td>
            </tr>
            
            <tr>
              <th scope="col">Role Title</th>
              <td colSpan={3} className="text-warning fw-bold">
                {viewCoord.roleTitle || "N/A"}
              </td>
            </tr>

            {/* Emergency Contact */}
            <tr className="table-success">
              <th colSpan={4} className="text-center">Emergency Contact</th>
            </tr>
            
            <tr>
              <th scope="col">Contact Person Name</th>
              <td className="text-success fw-bold">{viewCoord.emergencyContactName || "N/A"}</td>
              <th scope="col">Contact Person Phone</th>
              <td className="text-success fw-bold">{viewCoord.emergencyContactPhone || "N/A"}</td>
            </tr>

            {/* Login Credentials */}
            <tr className="table-info">
              <th colSpan={4} className="text-center">Login Credentials</th>
            </tr>
            
            <tr>
              <th scope="col">Username</th>
              <td className="text-success fw-bold">{viewCoord.username || "N/A"}</td>
              <th scope="col">Password</th>
        <td className="text-warning fw-bold">
          {viewCoord.user?.password ? (
            <div className="d-flex align-items-center gap-2">
              {/* Show actual password or masked dots */}
              <span className="font-monospace">
                {showPassword ? viewCoord.user.password : "••••••••"}
              </span>
              
              {/* Eye icon button */}
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary p-1"
                onClick={togglePasswordVisibility}
                // aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {/* Option 1: Using Font Awesome */}
                <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
              </button>
            </div>
          ) : (
            "N/A"
          )}
        </td>
            </tr>

            {/* Status & Administration */}
            <tr>
              <th scope="col">Status</th>
              <td colSpan={3} className="text-warning fw-bold">
                <span className={`badge ${
                  viewCoord.status === 'Active' ? 'bg-success' :
                  viewCoord.status === 'Inactive' ? 'bg-warning' :
                  viewCoord.status === 'Suspended' ? 'bg-danger' : 'bg-secondary'
                }`}>
                  {viewCoord.status || "N/A"}
                </span>
              </td>
            </tr>
            
            <tr>
              <th scope="col">Created At</th>
              <td colSpan={3} className="text-muted">
                {formatDate(viewCoord.createdAt)}
              </td>
            </tr>
          </MDBTableBody>
        </MDBTable>
      </MDBCardBody>
    </MDBCard>
  </MDBContainer>
</div>
    </>
  );
};

export default CoodView;
