import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { MDBIcon } from "mdb-react-ui-kit";
import './Coordinator.css';
import Header from "../Header/Header";

export default function CoordinatorDashboard() {
  const [collapsed, setCollapsed] = useState(false);
  const [coordinatorType, setCoordinatorType] = useState("Student Admission");
  const location = useLocation();

  // Get coordinator type from path or localStorage
  useEffect(() => {
    const path = location.pathname;
    const coordType = localStorage.getItem('coordinatorType') || "Student Admission";
    setCoordinatorType(coordType);
  }, [location.pathname]);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  // Role-based configurations
  const roleConfigs = {
    "Student Admission": {
      color: "#4361ee",
      gradient: "linear-gradient(135deg, #4361ee, #3a56d4)",
      icon: "user-graduate",
      menuItems: [
        { path: "/coordinator/dashboard", name: "Dashboard", icon: "tachometer-alt" },
        { path: "/coordinator/admission/new", name: "New Applications", icon: "file-alt" },
        { path: "/coordinator/admission/pending", name: "Pending Reviews", icon: "clock" },
        { path: "/coordinator/admission/approved", name: "Approved Students", icon: "check-circle" },
        { path: "/coordinator/admission/rejected", name: "Rejected Students", icon: "times-circle" },
        { path: "/coordinator/admission/reports", name: "Admission Reports", icon: "chart-bar" },
        { path: "/coordinator/admission/settings", name: "Admission Settings", icon: "cog" },
      ]
    },
    "Faculty Coordinator": {
      color: "#7209b7",
      gradient: "linear-gradient(135deg, #7209b7, #560bad)",
      icon: "chalkboard-teacher",
      menuItems: [
        { path: "/coordinator/dashboard", name: "Dashboard", icon: "tachometer-alt" },
        { path: "/coordinator/faculty/manage", name: "Manage Faculty", icon: "users" },
        { path: "/coordinator/faculty/assignments", name: "Assignments", icon: "tasks" },
        { path: "/coordinator/faculty/schedule", name: "Teaching Schedule", icon: "calendar-alt" },
        { path: "/coordinator/faculty/performance", name: "Performance", icon: "chart-line" },
        { path: "/coordinator/faculty/leave", name: "Leave Management", icon: "calendar-times" },
        { path: "/coordinator/faculty/meetings", name: "Meetings", icon: "video" },
      ]
    },
    "Exam Coordinator": {
      color: "#f72585",
      gradient: "linear-gradient(135deg, #5f243e, #53224c)",
      icon: "file-contract",
      menuItems: [
        { path: "/coordinator/dashboard", name: "Dashboard", icon: "tachometer-alt" },
        { path: "/coordinator/exam/schedule", name: "Exam Schedule", icon: "calendar-alt" },
        { path: "/coordinator/exam/rooms", name: "Room Allocation", icon: "door-open" },
        { path: "/coordinator/exam/invigilators", name: "Invigilators", icon: "user-shield" },
        { path: "/coordinator/exam/papers", name: "Question Papers", icon: "file-pdf" },
        { path: "/coordinator/exam/results", name: "Result Processing", icon: "calculator" },
        { path: "/coordinator/exam/complaints", name: "Grievances", icon: "exclamation-circle" },
      ]
    },
    "Fee Coordinator": {
      color: "#4cc9f0",
      gradient: "linear-gradient(135deg, #4cc9f0, #4895ef)",
      icon: "money-check-alt",
      menuItems: [
        { path: "/coordinator/dashboard", name: "Dashboard", icon: "tachometer-alt" },
        { path: "/coordinator/fee/collection", name: "Fee Collection", icon: "cash-register" },
        { path: "/coordinator/fee/pending", name: "Pending Fees", icon: "clock" },
        { path: "/coordinator/fee/installments", name: "Installments", icon: "calendar" },
        { path: "/coordinator/fee/concessions", name: "Fee Concessions", icon: "percentage" },
        { path: "/coordinator/fee/reports", name: "Financial Reports", icon: "chart-pie" },
        { path: "/coordinator/fee/receipts", name: "Generate Receipts", icon: "receipt" },
      ]
    },
    "Semester Coordinator": {
      color: "#f8961e",
      gradient: "linear-gradient(135deg, #f8961e, #f3722c)",
      icon: "calendar-plus",
      menuItems: [
        { path: "/coordinator/dashboard", name: "Dashboard", icon: "tachometer-alt" },
        { path: "/coordinator/semester/registration", name: "Registration", icon: "user-check" },
        { path: "/coordinator/semester/timetable", name: "Timetable", icon: "table" },
        { path: "/coordinator/semester/subjects", name: "Subject Allocation", icon: "book" },
        { path: "/coordinator/semester/progress", name: "Academic Progress", icon: "chart-line" },
        { path: "/coordinator/semester/clearance", name: "Clearance", icon: "shield-alt" },
        { path: "/coordinator/semester/transcripts", name: "Transcripts", icon: "scroll" },
      ]
    },
    "Department Coordinator": {
      color: "#2a9d8f",
      gradient: "linear-gradient(135deg, #2a9d8f, #264653)",
      icon: "building",
      menuItems: [
        { path: "/coordinator/dashboard", name: "Dashboard", icon: "tachometer-alt" },
        { path: "/coordinator/department/staff", name: "Staff Management", icon: "user-tie" },
        { path: "/coordinator/department/inventory", name: "Inventory", icon: "box-open" },
        { path: "/coordinator/department/budget", name: "Budget & Finance", icon: "wallet" },
        { path: "/coordinator/department/events", name: "Department Events", icon: "microphone-alt" },
        { path: "/coordinator/department/reports", name: "Department Reports", icon: "clipboard-list" },
        { path: "/coordinator/department/settings", name: "Department Settings", icon: "cogs" },
      ]
    }
  };

  const currentConfig = roleConfigs[coordinatorType] || roleConfigs["Student Admission"];

  // Role selection dropdown items
  const roleItems = Object.keys(roleConfigs).map(role => ({
    role,
    icon: roleConfigs[role].icon,
    color: roleConfigs[role].color
  }));

  const handleRoleChange = (role) => {
    setCoordinatorType(role);
    localStorage.setItem('coordinatorType', role);
  };

  return (
    <div className="dashboard-layout">
      {/* Enhanced Sidebar with Role-based Styling */}
      <div 
        className={`sidebar ${collapsed ? "collapsed" : ""}`}
        style={{
          background: currentConfig.gradient,
          '--role-color': currentConfig.color
        }}
      >
        <div className="sidebar-header">
          <div className="logo-section">
            <div className="logo-icon" style={{ background: 'rgba(255, 255, 255, 0.2)' }}>
              <MDBIcon fas icon={currentConfig.icon} />
            </div>
            {!collapsed && (
              <div className="logo-text">
                <h2 className="logo-main">{coordinatorType}</h2>
                <p className="logo-sub">Coordinator Portal</p>
              </div>
            )}
          </div>
          <span className="toggle-btn" onClick={toggleSidebar}>
            <MDBIcon fas icon={collapsed ? "chevron-right" : "chevron-left"} />
          </span>
        </div>

        {/* Role Selector (only in expanded mode) */}
        {!collapsed && (
          <div className="role-selector">
            <div className="role-selector-label">
              <MDBIcon fas icon="exchange-alt" className="me-2" />
              Switch Role
            </div>
            <div className="role-buttons">
              {roleItems.map((item, index) => (
                <button
                  key={index}
                  className={`role-button ${coordinatorType === item.role ? "active" : ""}`}
                  onClick={() => handleRoleChange(item.role)}
                  style={{ 
                    background: coordinatorType === item.role ? item.color : 'rgba(255, 255, 255, 0.1)',
                    borderColor: item.color
                  }}
                >
                  <MDBIcon fas icon={item.icon} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Main Menu */}
        <div className="menu">
          {currentConfig.menuItems.map((item, index) => (
            <Link
              to={item.path}
              key={index}
              className={`menu-link ${location.pathname === item.path ? "active" : ""}`}
            >
              <span className="menu-icon">
                <MDBIcon fas icon={item.icon} />
              </span>
              {!collapsed && <span className="menu-text">{item.name}</span>}
              {location.pathname === item.path && (
                <span className="active-pulse"></span>
              )}
            </Link>
          ))}
        </div>

        {/* Quick Stats (only in expanded mode) */}
        {!collapsed && (
          <div className="quick-stats">
            <div className="stats-header">
              <MDBIcon fas icon="chart-line" className="me-2" />
              Quick Stats
            </div>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-value">24</div>
                <div className="stat-label">Pending</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">156</div>
                <div className="stat-label">Completed</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">12</div>
                <div className="stat-label">Urgent</div>
              </div>
            </div>
          </div>
        )}

        {/* Sidebar Footer */}
        {!collapsed && (
          <div className="sidebar-footer">
            <div className="user-info">
              <div className="user-avatar">
                <MDBIcon fas icon="user-tie" />
              </div>
              <div className="user-details">
                <span className="user-name">{coordinatorType}</span>
                <span className="user-role">Coordinator</span>
              </div>
            </div>
            <button className="logout-btn">
              <MDBIcon fas icon="sign-out-alt" />
            </button>
          </div>
        )}

        {/* Collapsed Role Indicator */}
        {collapsed && (
          <div className="collapsed-role">
            <div 
              className="role-indicator" 
              style={{ background: currentConfig.color }}
            >
              <MDBIcon fas icon={currentConfig.icon} />
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className={`main ${collapsed ? "collapsed" : ""}`}>
        <Header 
          title={coordinatorType}
          subtitle="Coordinator Dashboard"
        />
        <div className="content-wrapper">
          <Outlet />
        </div>
      </div>
    </div>
  );
}