import React, { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import "./Coordinator.css";
import { useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const CoodList = () => {
  const [coordinators, setCoordinators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [filterRole, setFilterRole] = useState("all");
  const departments = [
    "all",
    ...new Set(coordinators.map((c) => c.department)),
  ];
  const roles = [
    "all",
    "Department Coordinator",
    "Semester Coordinator",
    "Program Coordinator",
    "Fee Coordinator",
    "Examination Coordinator",
  ];
  const filteredCoordinators = coordinators.filter((coord) => {
    const matchesSearch =
      coord.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coord.coordId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment =
      filterDepartment === "all" || coord.department === filterDepartment;
    const matchesRole = filterRole === "all" || coord.role === filterRole;

    return matchesSearch && matchesDepartment && matchesRole;
  });
  const navigate = useNavigate();
  useEffect(() => {
    const fetchCoordinator = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        if (!token) {
          console.log("No Token Found. Redirecting to Login Page");
          window.location.href = "/login";
          return;
        }
        const res = await axios.get(
          "http://localhost:8000/api/admin/coordinator/all",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );
        console.log("API Response:", res.data);
        if (res.data.success) {
          setCoordinators(res.data.data?.coordinators || []);
        }
      } catch (error) {
        console.log("Error for fetching the coordinator data : ", error);
        if (error.response?.status === 401) {
          localStorage.removeItem("adminToken");
          localStorage.removeItem("adminData");
          window.location.href = "/login";
        }
      } finally {
        setLoading(false);
      }
    };
    fetchCoordinator();
  }, []);
  const handleDelete = async (id) => {
    if (!id) {
      toast.error(`Invalid Coordinator ID ${id}`);
    }
    const confirmDelCoord = window.confirm("Are you sure you want to delete this coordiantor ?");
    if (!confirmDelCoord) return;
    const coordMember = coordinators.find((c) => c._id === id);
    try {
      const token = localStorage.getItem("adminToken");
      if(!token){
        toast.error("No Token Found!! Admin not loggin");
        return;
      }
       toast.info("Deleting coordinator...");
      const res = await axios.delete(
        `http://localhost:8000/api/admin/coordinator/delete/${id}`,{
          headers:{
            'Authorization':`Bearer ${token}`,
            'Content-Type':'application/json',
          }
        }
      );
      if (res.status === 200 && res.data.success) {
        toast.success(`Coordinator ${coordMember?.name|| ""} deleted successfully`);
        setCoordinators((prev) => prev.filter((cord) => cord._id !== id));
      }
    } catch (error) {
      console.log("Error for deleting the coordinator");
      toast.error(
        error.response?.data?.message || "Faculty not deleted! (Server error)",
      );
    }
  };
  const getStatusBadge = (status) => {
    const config = {
        'active':{class:"badge-success", icon: "fa-check-circle"},
        'on_leave':{ class: "badge-warning", icon: "fa-exclamation-circle"},
        'inactive':{ class: "badge-secondary", icon: "fa-times-circle"},
    }
    const c = config[status] || "N/A";
    // const config = {
    //   Active: { class: "badge-success", icon: "fa-check-circle" },
    //   "On Leave": { class: "badge-warning", icon: "fa-exclamation-circle" },
    //   Inactive: { class: "badge-secondary", icon: "fa-times-circle" },
    // };
    // const c = config[status] || config["Active"];
    return (
      <span className={`status-badge ${c.class}`}>
        <i className={`fas ${c.icon} me-1`}></i>
        {status}
      </span>
    );
  };
  if (loading) {
    return (
      <div className="approvals-container">
        <div className="container-fluid text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-success fw-bold">Loading...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="cood-list-container">
      <div className="container-fluid">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">
              <i className="fas fa-user-tie me-3"></i>Coordinators Management
            </h1>
            <p className="page-subtitle">
              Manage program and department coordinators
            </p>
          </div>
          <div className="header-actions">
            <Link
              to="/admin/dashboard/coordinators/add"
              className="btn btn-primary btn-lg"
            >
              <i className="fas fa-user-plus me-2"></i>Add Coordinator
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="row g-3 mb-4">
          <div className="col-6 col-md-3">
            <div className="stat-card-small">
              <div className="stat-icon bg-primary">
                <i className="fas fa-user-tie"></i>
              </div>
              <div className="stat-info">
                <h3>{coordinators.length}</h3>
                <p>Total Coordinators</p>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="stat-card-small">
              <div className="stat-icon bg-success">
                <i className="fas fa-user-check"></i>
              </div>
              <div className="stat-info">
                <h3>
                  {
                    coordinators.filter(
                      (c) => c.status === "active" || c.status === "Active",
                    ).length
                  }
                </h3>
                <p>Active</p>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="stat-card-small">
              <div className="stat-icon bg-warning">
                <i className="fas fa-building"></i>
              </div>
              <div className="stat-info">
                <h3>{departments.length - 1}</h3>
                <p>Departments</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="content-card">
          {/* Search and Filter */}
          <div className="search-filter-section">
            <div className="search-box">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Search by name or coordinator ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Filters */}
          <div className="filters-row">
            <select
              className="filter-select"
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept === "all" ? "All Departments" : dept}
                </option>
              ))}
            </select>
            <select
              className="filter-select"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role === "all" ? "All Roles" : role}
                </option>
              ))}
            </select>
          </div>

          {/* Coordinators Grid */}
          <div className="coordinators-grid">
            {filteredCoordinators.map((coord) => (
              <div key={coord._id} className="coordinator-card">
                <div className="coord-card-header">
                  <img
                    src={coord.profileImage?.url}
                    alt={coord.name}
                    className="coord-avatar"
                  />
                  {getStatusBadge(coord.status)}
                </div>
                <div className="coord-card-body">
                  <h3 className="coord-name">{coord.name || "No Name"}</h3>
                  <p className="coord-role">{coord.coordinatorRole}</p>
                  <p className="coord-id">
                    <i className="fas fa-id-badge me-2"></i>
                    {coord.coordId}
                  </p>
                  <p className="coord-dept">
                    <i className="fas fa-building me-2"></i>
                    {coord.department}
                  </p>
                  <p className="coord-detail">
                    <i className="fas fa-envelope me-2"></i>
                    {coord.user?.email}
                  </p>
                  <p className="coord-detail">
                    <i className="fas fa-phone me-2"></i>
                    {coord.phone}
                  </p>

                  {/* <div className="programs-section">
                    <h4>Assigned Programs</h4>
                    {coord.assignedPrograms.map((program, index) => (
                      <span key={index} className="program-badge">
                        {program}
                      </span>
                    ))}
                  </div> */}

                  <div className="coord-stats">
                    <div className="stat-item">
                      <i className="fas fa-users"></i>
                      <span>{coord.studentsManaged} Students</span>
                    </div>
                    <div className="stat-item">
                      <i className="fas fa-calendar"></i>
                      <span>
                        Since {new Date(coord.joiningDate).getFullYear()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="coord-card-footer">
                  <button
                    onClick={() =>
                      navigate(
                        `/admin/dashboard/coordinators/view/${coord._id}`,
                      )
                    }
                    className="btn-action btn-view"
                    title="View Details"
                  >
                    <i className="fas fa-eye"></i>
                  </button>
                  <button 
                  onClick={()=>navigate(`/admin/dashboard/coordinators/update/${coord._id}`)} 
                  className="btn-action btn-edit" title="Edit">
                    <i className="fas fa-edit"></i>
                  </button>
                  <button
                    onClick={() => handleDelete(coord._id)}
                    className="btn-action btn-delete"
                    title="Remove"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredCoordinators.length === 0 && (
            <div className="empty-state">
              <i className="fas fa-search"></i>
              <h3>No Coordinators Found</h3>
              <p>Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoodList;
