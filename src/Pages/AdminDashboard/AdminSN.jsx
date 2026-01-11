// AdminSidebar.jsx
import React, { useState } from 'react';
import './AdminSidebar.css'; // Import the CSS file below
import { Link, Navigate, Outlet, useNavigate } from 'react-router-dom';
import Header from './AdminHeader/Header';
const AdminSidebar = () => {
const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState('dashboard');

  const handleLogOut = ()=>{
    const confirmLogOut = toast.info("Are you sure you want to Logout!!!!")
    if(confirmLogOut){
         navigate('/admin/login')
    }
   
  }
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const menuItems = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: 'fa-dashboard',
      path: '/admin/dashboard'
    },
    {
      id: 'students',
      title: 'Student Management',
      icon: 'fa-users',
      path: '/admin/dashboard/students',
      submenu: [
        { id: 'student-list', title: 'All Students', icon: 'fa-list', path: '/admin/dashboard/students/list' },
        { id: 'student-approval', title: 'Pending Approvals', icon: 'fa-clock', path: '/admin/dashboard/students/approvals' },
        { id: 'student-assign', title: 'Assign Roll Numbers', icon: 'fa-id-card', path: '/admin/dashboard/students/assign' },
      ]
    },
    {
      id: 'faculty',
      title: 'Faculty Management',
      icon: 'fa-chalkboard-teacher',
      path: '/admin/dashboard/faculty',
      submenu: [
        { id: 'faculty-list', title: 'All Faculty',  icon: 'fa-list', path: '/admin/dashboard/faculty/list' },
        { id: 'faculty-add', title: 'Register Faculty', icon: 'fa-user-plus', path: '/admin/dashboard/faculty/add' },
        // { id:'faculty-update',title:'Update Faculty' , icon:'fa-user-plus', path:'/admin/dashboard/faculty/update/:id'},
        // { id:'faculty-view', title:'View Faculty' , icon:'fa-list' ,path:'/admin/dashboard/faculty/view/:id'},
      ]
    },
    {
      id: 'coordinators',
      title: 'Coordinators',
      icon: 'fa-user-tie',
      path: '/admin/dashboard/coordinators',
      submenu: [
        { id: 'coord-list', title: 'All Coordinators', icon: 'fa-list', path: '/admin/dashboard/coordinators/list' },
        { id: 'coord-add', title: 'Add Coordinator', icon: 'fa-plus', path: '/admin/dashboard/coordinators/add' },
      ]
    },
    {
      id: 'fee',
      title: 'Fee Management',
      icon: 'fa-money-bill-wave',
      path: '/admin/dashboard/fee',
      submenu: [
        { id: 'fee-vouchers', title: 'Fee Vouchers', icon: 'fa-receipt', path: '/admin/dashboard/fee/vouchers' },
        { id: 'fee-verify', title: 'Verify Payments', icon: 'fa-check-circle', path: '/admin/dashboard/fee/verify' },
      ]
    },
    {
      id: 'examination',
      title: 'Examination Cell',
      icon: 'fa-file-alt',
      path: '/admin/dashboard/exam',
      submenu: [
        { id: 'exam-announce', title: 'Announcements', icon: 'fa-bullhorn', path: '/admin/dashboard/exam/announcements' },
        { id: 'exam-datesheet', title: 'Date Sheets', icon: 'fa-calendar-alt', path:'/admin/dashboard/exam/datesheets' },
        { id: 'exam-results', title: 'Results', icon: 'fa-graduation-cap', path: '/admin/dashboard/exam/results' },
      ]
    },
    {
      id: 'attendance',
      title: 'Attendance',
      icon: 'fa-clipboard-check',
      path: '/admin/dashboard/attendance'
    },
    {
      id: 'books',
      title: 'Books & Notes',
      icon: 'fa-book',
      path: '/admin/dashboard/books'
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: 'fa-cog',
      path: '/admin/dashboard/system-settings',
      submenu: [
        { id: 'profile', title: 'Profile', icon: 'fa-user', path: '/admin/dashboard/profile' },
        { id: 'access-control', title: 'Access Control', icon: 'fa-shield-alt', path: '/admin/dashboard/access-control' },
        { id: 'system-settings', title: 'System Settings', icon: 'fa-sliders-h', path: '/admin/dashboard/system-settings' },
      ]
    },
    {
      id: 'logout',
      title: 'Logout',
      icon: 'fa-sign-out-alt',
      path: '/admin/login',
      className: 'logout-item'
    }
  ];

  const [expandedMenus, setExpandedMenus] = useState({});

  const toggleSubmenu = (menuId) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };

  return (
    <>
      {/* Sidebar */}
      <div className={`admin-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>

        {/* Logo Section */}
        <div className="sidebar-logo">
          <div className="logo-icon">
            <i className="fas fa-graduation-cap fa-3x text-white"></i>
          </div>
          {isSidebarOpen && (
            <>
              <h4 className="text-white fw-bold mt-3 mb-0">UMS Admin</h4>
              <p className="text-white-50 small mb-0">University Management</p>
            </>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="sidebar-nav">
          <ul className="nav flex-column">
            {menuItems.map(item => (
              <li key={item.id} className="nav-item">
                <Link
                  to={item.path === 'logout' ? '#' :item.path}
                  className={`nav-link ${activeMenu === item.id ? 'active' : ''} ${item.className || ''}`}
                  onClick={() => {
                    if(item.id === 'logout'){
                      handleLogOut();
                    }
                   else if (item.submenu) {
                      toggleSubmenu(item.id);
                    } else {
                      setActiveMenu(item.id);
                    }
                  }}
                >
                  <i className={`fas ${item.icon} nav-icon`}></i>
                  {isSidebarOpen && (
                    <>
                      <span className="nav-text">{item.title}</span>
                      {item.submenu && (
                        <i className={`fas fa-chevron-${expandedMenus[item.id] ? 'down' : 'right'} ms-auto`}></i>
                      )}
                    </>
                  )}
                </Link>

                {/* Submenu */}
                {item.submenu && isSidebarOpen && expandedMenus[item.id] && (
                  <ul className="submenu">
                    {item.submenu.map(subitem => (
                      <li key={subitem.id}>
                        <Link
                          to={subitem.path}
                          className={`submenu-link ${activeMenu === subitem.id ? 'active' : ''}`}
                          onClick={() => setActiveMenu(subitem.id)}
                        >
                          <i className={`fas ${subitem.icon} me-2`}></i>
                          {subitem.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* User Profile Section at Bottom */}
  
      </div>

      {/* Toggle Button */}
      <button
        className="sidebar-toggle-btn btn btn-primary"
        onClick={toggleSidebar}
        style={{ left: isSidebarOpen ? '280px' : '80px' }}
      >
        <i className={`fas fa-${isSidebarOpen ? 'chevron-left' : 'chevron-right'}`}></i>
      </button>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="sidebar-overlay d-md-none"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Main Content Area */}
      <div className={`main-content ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        {/* Your page content goes here */}
        <div className="container-fluid p-4">
         <Header/>
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;