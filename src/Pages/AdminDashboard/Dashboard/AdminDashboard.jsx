import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminAPI from '../../../api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const [error, setError] = useState('');
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token =
          sessionStorage.getItem('token') ||
          sessionStorage.getItem('adminToken') ||
          localStorage.getItem('token') ||
          localStorage.getItem('adminToken');
        if (!token) {
          setError('No token found. Please log in again.');
          toast.error('No token found! Please Login Again');
          return;
        }
        const res = await AdminAPI.get('/stats/total-students', {
          headers: { 'Content-Type': 'application/json' },
        });
        if (res.data.success) {
          setStats(res.data);
        } else {
          setError(res.data.message || 'Failed to load stats');
        }
      } catch (err) {
        console.error('Error fetching stats:', err);
        if (err.response?.status === 401) {
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('adminToken');
          localStorage.removeItem('adminToken');
          setTimeout(() => {
            toast.warning('Session Expired, Please Login Again');
            navigate('/login');
          }, 1500);
        }
        setError('Error fetching stats. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [navigate]);

  const activities = Array.isArray(stats.activities) ? stats.activities : [];
  const events = Array.isArray(stats.events) ? stats.events : [];

  const quickActions = [
    { title: 'Approve Students', icon: 'fa-user-check', color: 'blue', link: '/admin/dashboard/students/approvals', count: stats.pendingApprovals || null },
    { title: 'Verify Payments', icon: 'fa-money-check-alt', color: 'green', link: '/admin/dashboard/fee/verify', count: null },
    { title: 'Add Faculty', icon: 'fa-user-plus', color: 'cyan', link: '/admin/dashboard/faculty/add', count: null },
    { title: 'Mark Attendance', icon: 'fa-clipboard-list', color: 'orange', link: '/admin/dashboard/attendance', count: null },
  ];

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* ---- Page Header ---- */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">
            <i className="fas fa-tachometer-alt"></i> Dashboard Overview
          </h1>
          <p className="dashboard-subtitle">
            <i className="far fa-calendar-alt me-1"></i>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* ---- Stats Row ---- */}
      <div className="dashboard-stats-grid">
        <div className="dash-stat-card">
          <div className="dash-stat-icon blue"><i className="fas fa-users"></i></div>
          <div>
            <p className="dash-stat-value">{stats.totalStudents ?? '—'}</p>
            <p className="dash-stat-label">Total Students</p>
            <p className="dash-stat-trend" style={{ color: '#64748b' }}>Active student enrollments</p>
          </div>
        </div>

        <div className="dash-stat-card">
          <div className="dash-stat-icon pink"><i className="fas fa-chalkboard-teacher"></i></div>
          <div>
            <p className="dash-stat-value">{stats.totalFaculty ?? '—'}</p>
            <p className="dash-stat-label">Total Faculty</p>
            <p className="dash-stat-trend" style={{ color: '#64748b' }}>Registered teaching staff</p>
          </div>
        </div>

        <div className="dash-stat-card">
          <div className="dash-stat-icon cyan"><i className="fas fa-clock"></i></div>
          <div>
            <p className="dash-stat-value">{stats.pendingApprovals ?? '—'}</p>
            <p className="dash-stat-label">Pending Approvals</p>
            <p className="dash-stat-trend">
              <Link to="/admin/dashboard/students/approvals" style={{ color: '#0891b2', fontWeight: 600, fontSize: '0.75rem', textDecoration: 'none' }}>
                Review pending →
              </Link>
            </p>
          </div>
        </div>

        <div className="dash-stat-card">
          <div className="dash-stat-icon green"><i className="fas fa-clipboard-check"></i></div>
          <div>
            <p className="dash-stat-value">{stats.todayAttendance != null ? `${stats.todayAttendance}%` : '—'}</p>
            <p className="dash-stat-label">Today's Attendance</p>
            <p className="dash-stat-trend" style={{ color: '#64748b' }}>Daily classroom presence</p>
          </div>
        </div>
      </div>

      {/* ---- Quick Actions ---- */}
      <div className="dash-section-card">
        <div className="dash-section-header">
          <h5 className="dash-section-title"><i className="fas fa-bolt"></i> Quick Actions</h5>
        </div>
        <div className="dash-section-body">
          <div className="quick-actions-grid">
            {quickActions.map((action) => (
              <Link key={action.title} to={action.link} className={`qa-tile ${action.color}`}>
                {action.count && <span className="qa-badge">{action.count}</span>}
                <i className={`fas ${action.icon}`}></i>
                <span>{action.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ---- Bottom Row ---- */}
      <div className="dash-bottom-grid">
        {/* Recent Activities */}
        <div className="dash-section-card">
          <div className="dash-section-header">
            <h5 className="dash-section-title"><i className="fas fa-history"></i> Recent Activity</h5>
          </div>
          <div className="dash-section-body" style={{ padding: '16px 20px' }}>
            {activities.length > 0 ? (
              activities.map((activity, idx) => (
                <div key={activity.id || idx} className="activity-item">
                  <div className="activity-icon" style={{ background: '#e0f2fe' }}>
                    <i className="fas fa-check-circle" style={{ color: '#0369a1' }}></i>
                  </div>
                  <div className="activity-text">
                    <p>{activity.action || activity.title}</p>
                    <small>{activity.name || activity.description}</small>
                    {activity.time && <span className="activity-time"><i className="far fa-clock me-1"></i>{activity.time}</span>}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-muted">
                <i className="fas fa-inbox fa-2x mb-2 d-block" style={{ color: '#cbd5e1' }}></i>
                <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b' }}>No recent activity records available.</p>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="dash-section-card">
          <div className="dash-section-header">
            <h5 className="dash-section-title"><i className="far fa-calendar-alt"></i> Upcoming Events</h5>
          </div>
          <div className="dash-section-body" style={{ padding: '16px 20px' }}>
            {events.length > 0 ? (
              events.map((event, idx) => (
                <div key={event.id || idx} className="event-item">
                  <div className="event-date-box" style={{ background: '#2563eb' }}>
                    <span className="event-day">{event.day || '—'}</span>
                    <span className="event-month">{event.month || '—'}</span>
                  </div>
                  <div className="event-details">
                    <h6>{event.title}</h6>
                    {event.type && <span className="ums-badge ums-badge-secondary" style={{ fontSize: '0.7rem' }}>{event.type}</span>}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-muted">
                <i className="far fa-calendar fa-2x mb-2 d-block" style={{ color: '#cbd5e1' }}></i>
                <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b' }}>No upcoming institutional events scheduled.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;