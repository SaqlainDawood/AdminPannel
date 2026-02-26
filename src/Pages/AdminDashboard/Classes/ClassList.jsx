import React, { useState } from "react";
import {
  MDBContainer,
  MDBCard,
  MDBCardBody,
  MDBBtn,
  MDBIcon,
} from "mdb-react-ui-kit";
import { Navigate, useNavigate } from "react-router-dom";
import { useState } from "react";
import { all } from "axios";
const ClassList = () => {
  const naviage = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [filterSemester, setFilterSemester] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  return (
    <>
      <div className="coordinator-update-container">
        <MDBContainer className="py-4">
          <MDBCard className="shadow-4">
            <MDBCardBody className="">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="text-primary fw-bold">
                  <i className="fas fa-user-edit me-2"></i>
                  Class Management
                </h3>
                <div>
                  <MDBBtn
                    className="me-1"
                    color="secondary"
                    onClick={() =>
                      naviage("/admin/dashboard/classes/createclass")
                    }
                  >
                    Create Class
                    <MDBIcon fas icon="dice" />
                  </MDBBtn>
                </div>
              </div>
              <div className="content-card">
                <div className="search-filter-section">
                  <div className="search-box">
                    <i className="fas fa-search"></i>
                    <input
                      type="text"
                      placeholder="Search by name, roll number, or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <button
                    className="btn btn-outline-primary"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <i className="fas fa-filter me-2"></i>
                    Filters
                    {showFilters ? (
                      <i className="fas fa-chevron-up ms-2"></i>
                    ) : (
                      <i className="fas fa-chevron-down ms-2"></i>
                    )}
                  </button>
                </div>
                {showFilters && (
                  <div className="filters-panel">
                    <div className="row g-3">
                      <div className="col-md-4">
                        <label className="form-label">Department</label>
                        <select
                          className="form-select"
                          value={filterDepartment}
                          onChange={(e) => setFilterDepartment(e.target.value)}
                        >
                          {departments.map((dept) => (
                            <option key={dept} value={dept}>
                              {dept === "all" ? "All Departments" : dept}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">Semester</label>
                        <select
                          className="form-select"
                          value={filterSemester}
                          onChange={(e) => setFilterSemester(e.target.value)}
                        >
                          {semesters.map((sem) => (
                            <option key={sem} value={sem}>
                              {sem === "all"
                                ? "All Semesters"
                                : sem + " Semester"}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">Status</label>
                        <select
                          className="form-select"
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value)}
                        >
                          <option value="all">All Status</option>
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="card mb-4">
                <div className="card-header bg-primary text-white">
                  <h5 className="mb-0">
                     <i className="fas fa-user me-2"></i>
                      Class List
                  </h5>
                </div>
              </div>
            </MDBCardBody>
          </MDBCard>
        </MDBContainer>
      </div>
    </>
  );
};

export default ClassList;
