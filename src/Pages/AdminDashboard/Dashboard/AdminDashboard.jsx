import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import axios from 'axios'
import {toast} from 'react-toastify'
import { useNavigate } from 'react-router-dom';
const Dashboard = () => {
  const [error , setError] = useState("")
  const [stats, setStats] = useState({});
  const navigae = useNavigate();
    useEffect(()=>{
      const fetchStats = async()=>{
        try {
         const token = localStorage.getItem("adminToken")
        //  console.log("Token from localStorage:", token); // debug
         if(!token){
           setError("No token found. Please log in again.");
          toast.error("No token found! Please Login Again");
          return;
         }
         const res = await axios.get("http://localhost:8000/api/admin/stats/total-students",{
          headers:{
            Authorization:`Bearer ${token}`
          }
         })
          if(res.data.success){
            setStats(res.data);
          }
          else{
            setError(res.data.message|| "Failed to load status");
          }
        } catch (error) {
           console.error("Error fetching stats:", error);
           if(error.res && error.response.status === 401 ){
            localStorage.removeItem("adminToken");
            setTimeout(() => {
                toast.warning("Session Expired , Please Login Again");
            navigae("/admin/login");
            }, 2000);
          
           }
            setError("Error fetching stats. Please try again.");
        }
      }
      fetchStats();
    },[])

  const [recentActivities] = useState([
    { id: 1, type: 'student', action: 'New student registered', name: 'Ahmed Ali', time: '5 min ago', icon: 'fa-user-plus', color: 'primary' },
    { id: 2, type: 'fee', action: 'Fee payment verified', name: 'Sara Khan', time: '12 min ago', icon: 'fa-check-circle', color: 'success' },
    { id: 3, type: 'exam', action: 'Result published', name: 'Mid Term Exam', time: '1 hour ago', icon: 'fa-graduation-cap', color: 'info' },
    { id: 4, type: 'faculty', action: 'New faculty added', name: 'Dr. Hassan Raza', time: '2 hours ago', icon: 'fa-chalkboard-teacher', color: 'warning' },
    { id: 5, type: 'attendance', action: 'Attendance marked', name: 'CS-A Morning', time: '3 hours ago', icon: 'fa-clipboard-check', color: 'secondary' }
  ]);

  const [upcomingEvents] = useState([
    { id: 1, title: 'Final Exams Start', date: '15 Oct 2024', type: 'exam', color: 'danger' },
    { id: 2, title: 'Faculty Meeting', date: '18 Oct 2024', type: 'meeting', color: 'primary' },
    { id: 3, title: 'Fee Submission Deadline', date: '20 Oct 2024', type: 'fee', color: 'warning' },
    { id: 4, title: 'Sports Day', date: '25 Oct 2024', type: 'event', color: 'success' }
  ]);

  const quickActions = [
    { title: 'Approve Students', icon: 'fa-user-check', color: 'primary', link: '/admin/dashboard/students/approvals', count: 23 },
    { title: 'Verify Payments', icon: 'fa-money-check-alt', color: 'success', link: '/admin/dashboard/fee/verify', count: 15 },
    { title: 'Add Faculty', icon: 'fa-user-plus', color: 'info', link: '/admin/dashboard/faculty/add', count: null },
    { title: 'Mark Attendance', icon: 'fa-clipboard-list', color: 'warning', link: '/admin/dashboard/attendance', count: null }
  ];

  return (
     
    <div className="dashboard-container" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh', padding: '2rem' }}>
     
      <div className="container-fluid">
        {/* Header Section */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center flex-wrap">
              <div>
                <h1 className="text-white fw-bold mb-2" style={{ fontSize: '2.5rem' }}>
                  <i className="fas fa-chart-line me-3"></i>Dashboard Overview
                </h1>
                <p className="text-white-50 mb-0" style={{ fontSize: '1.1rem' }}>
                  <i className="far fa-calendar-alt me-2"></i>
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <div className="mt-3 mt-md-0">
                <button className="btn btn-light btn-lg shadow-sm me-2">
                  <i className="fas fa-download me-2"></i>Export Report
                </button>
                <button className="btn btn-outline-light btn-lg">
                  <i className="fas fa-bell me-2"></i>Notifications
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
      <div className="row g-4 mb-4">
          <div className="col-12 col-sm-6 col-lg-3">
            <div className="card border-0 shadow-lg h-100" style={{ borderRadius: '20px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <p className="text-white-50 mb-2 fw-semibold">Total Students</p>
                    <h2 className="text-white fw-bold mb-0" style={{ fontSize: '2.5rem' }}>{stats.totalStudents}</h2>
                    <p className="text-white-50 mb-0 mt-2">
                      <i className="fas fa-arrow-up me-1"></i>12% from last month
                    </p>
                  </div>
                  <div className="bg-white bg-opacity-25 rounded-circle p-3" style={{ width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="fas fa-users text-white" style={{ fontSize: '1.5rem' }}></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-lg-3">
            <div className="card border-0 shadow-lg h-100" style={{ borderRadius: '20px', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <p className="text-white-50 mb-2 fw-semibold">Total Faculty</p>
                    <h2 className="text-white fw-bold mb-0" style={{ fontSize: '2.5rem' }}>{stats.totalFaculty}</h2>
                    <p className="text-white-50 mb-0 mt-2">
                      <i className="fas fa-arrow-up me-1"></i>5% from last month
                    </p>
                  </div>
                  <div className="bg-white bg-opacity-25 rounded-circle p-3" style={{ width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="fas fa-chalkboard-teacher text-white" style={{ fontSize: '1.5rem' }}></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-lg-3">
            <div className="card border-0 shadow-lg h-100" style={{ borderRadius: '20px', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <p className="text-white-50 mb-2 fw-semibold">Pending Approvals</p>
                    <h2 className="text-white fw-bold mb-0" style={{ fontSize: '2.5rem' }}>{stats.pendingApprovals}</h2>
                    <p className="text-white-50 mb-0 mt-2">
                      <Link to="/admin/dashboard/students/approvals" className="text-white text-decoration-none">
                        View all <i className="fas fa-arrow-right ms-1"></i>
                      </Link>
                    </p>
                  </div>
                  <div className="bg-white bg-opacity-25 rounded-circle p-3" style={{ width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="fas fa-clock text-white" style={{ fontSize: '1.5rem' }}></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-lg-3">
            <div className="card border-0 shadow-lg h-100" style={{ borderRadius: '20px', background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <p className="text-white-50 mb-2 fw-semibold">Today's Attendance</p>
                    <h2 className="text-white fw-bold mb-0" style={{ fontSize: '2.5rem' }}>{stats.todayAttendance}%</h2>
                    <p className="text-white-50 mb-0 mt-2">
                      <i className="fas fa-arrow-up me-1"></i>3% from yesterday
                    </p>
                  </div>
                  <div className="bg-white bg-opacity-25 rounded-circle p-3" style={{ width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="fas fa-clipboard-check text-white" style={{ fontSize: '1.5rem' }}></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-0 shadow-lg" style={{ borderRadius: '20px', background: 'rgba(255, 255, 255, 0.95)' }}>
              <div className="card-body p-4">
                <h4 className="fw-bold mb-4" style={{ color: '#667eea' }}>
                  <i className="fas fa-bolt me-2"></i>Quick Actions
                </h4>
                <div className="row g-3">
                  {quickActions.map(action => (
                    <div key={action.title} className="col-4 col-md-3">
                      <Link to={action.link} className="text-decoration-none">
                        <div className={`card border-0 shadow-sm h-100 hover-card`} style={{ borderRadius: '15px', background: `linear-gradient(135deg, ${action.color === 'primary' ? '#667eea, #764ba2' : action.color === 'success' ? '#43e97b, #38f9d7' : action.color === 'info' ? '#4facfe, #00f2fe' : '#f093fb, #f5576c'})`, cursor: 'pointer', transition: 'transform 0.3s' }}>
                          <div className="card-body text-center p-4 position-relative">
                            {action.count && (
                              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                                {action.count}
                              </span>
                            )}
                            <i className={`fas ${action.icon} text-white mb-3`} style={{ fontSize: '2.5rem' }}></i>
                            <h6 className="text-white fw-semibold mb-0">{action.title}</h6>
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activities and Upcoming Events */}
        <div className="row g-4">
          {/* Recent Activities */}
          <div className="col-12 col-lg-7">
            <div className="card border-0 shadow-lg h-100" style={{ borderRadius: '20px', background: 'rgba(255, 255, 255, 0.95)' }}>
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4 className="fw-bold mb-0" style={{ color: '#667eea' }}>
                    <i className="fas fa-history me-2"></i>Recent Activities
                  </h4>
                  <button className="btn btn-sm btn-outline-primary">View All</button>
                </div>
                <div className="list-group list-group-flush">
                  {recentActivities.map(activity => (
                    <div key={activity.id} className="list-group-item border-0 px-0 py-3">
                      <div className="d-flex align-items-start">
                        <div className={`bg-${activity.color} bg-opacity-10 rounded-circle p-3 me-3`} style={{ width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <i className={`fas ${activity.icon} text-${activity.color}`}></i>
                        </div>
                        <div className="flex-grow-1">
                          <p className="mb-1 fw-semibold text-dark">{activity.action}</p>
                          <p className="mb-1 text-muted small">{activity.name}</p>
                          <p className="mb-0 text-muted small">
                            <i className="far fa-clock me-1"></i>{activity.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="col-12 col-lg-5">
            <div className="card border-0 shadow-lg h-100" style={{ borderRadius: '20px', background: 'rgba(255, 255, 255, 0.95)' }}>
              <div className="card-body p-4">
                <h4 className="fw-bold mb-4" style={{ color: '#667eea' }}>
                  <i className="far fa-calendar-alt me-2"></i>Upcoming Events
                </h4>
                <div className="list-group list-group-flush">
                  {upcomingEvents.map(event => (
                    <div key={event.id} className="list-group-item border-0 px-0 py-3">
                      <div className="d-flex align-items-center">
                        <div className={`bg-${event.color} rounded-3 p-3 me-3 text-white text-center`} style={{ width: '70px' }}>
                          <div className="fw-bold" style={{ fontSize: '1.5rem' }}>{event.date.split(' ')[0]}</div>
                          <div className="small">{event.date.split(' ')[1]}</div>
                        </div>
                        <div className="flex-grow-1">
                          <h6 className="mb-1 fw-semibold">{event.title}</h6>
                          <p className="mb-0 text-muted small">
                            <span className={`badge bg-${event.color} bg-opacity-10 text-${event.color}`}>
                              {event.type.toUpperCase()}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          .hover-card:hover {
            transform: translateY(-5px);
          }
          
          @media (max-width: 768px) {
            .dashboard-container {
              padding: 1rem !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default Dashboard;