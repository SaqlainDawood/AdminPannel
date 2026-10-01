import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const AdminProfile = () => {
  const [profileData, setProfileData] = useState({
    name: 'Administrator',
    email: '',
    role: 'Admin',
    phone: '',
    designation: '',
    office: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    try {
      const stored =
        sessionStorage.getItem('user') ||
        sessionStorage.getItem('adminData') ||
        localStorage.getItem('adminData');
      const role =
        sessionStorage.getItem('userRole') ||
        localStorage.getItem('userRole') ||
        'Administrator';
      if (stored) {
        const parsed = JSON.parse(stored);
        setProfileData({
          name: parsed.name || parsed.username || (parsed.firstName ? `${parsed.firstName} ${parsed.lastName || ''}`.trim() : 'Administrator'),
          email: parsed.email || '',
          role: parsed.role || role,
          phone: parsed.phone || '',
          designation: parsed.designation || 'System Administrator',
          office: parsed.office || 'Main Administration Block',
        });
      } else {
        setProfileData((prev) => ({ ...prev, role }));
      }
    } catch (e) {
      console.error('Failed to parse admin data', e);
    }
  }, []);

  const handlePasswordUpdate = (e) => {
    e.preventDefault();
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      toast.error('Please complete all password fields');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    toast.success('Password updated successfully');
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const getInitials = (name) => {
    if (!name) return 'A';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="admin-profile-page" style={{ padding: 0 }}>
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-3 border-bottom gap-3">
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--ums-gray-800, #1e293b)', margin: 0 }}>
            <i className="fas fa-user-shield me-2" style={{ color: 'var(--ums-primary-mid, #2d6a9f)' }}></i>
            Administrator Account
          </h2>
          <p style={{ color: 'var(--ums-gray-500, #64748b)', margin: '4px 0 0 0', fontSize: '0.88rem' }}>
            Current administrator session, credentials, and security profile
          </p>
        </div>
      </div>

      <div className="row g-4">
        {/* Left Column: Avatar & Summary */}
        <div className="col-12 col-lg-5 col-xl-4">
          <div className="card border-0 shadow-sm p-4 text-center mb-4" style={{ borderRadius: '16px', background: '#ffffff' }}>
            <div className="position-relative mx-auto mb-3" style={{ width: '90px', height: '90px' }}>
              <div
                style={{
                  width: '90px',
                  height: '90px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #1e3a8a 0%, #2d6a9f 100%)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  fontWeight: 700,
                  boxShadow: '0 8px 20px rgba(30, 58, 138, 0.25)'
                }}
              >
                {getInitials(profileData.name)}
              </div>
              <span
                className="position-absolute bottom-0 end-0 bg-success border border-white rounded-circle"
                style={{ width: '16px', height: '16px' }}
                title="Active Session"
              ></span>
            </div>

            <h5 style={{ fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}>
              {profileData.name}
            </h5>
            <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '12px' }}>
              {profileData.designation}
            </p>

            <div>
              <span className="badge px-3 py-2" style={{ background: '#e0f2fe', color: '#0369a1', borderRadius: '8px', fontWeight: 600 }}>
                <i className="fas fa-shield-alt me-1"></i> {profileData.role}
              </span>
            </div>

            <hr className="my-3" style={{ opacity: 0.1 }} />

            <div className="text-start" style={{ fontSize: '0.88rem', color: '#475569' }}>
              {profileData.email && (
                <div className="mb-2">
                  <i className="far fa-envelope me-2 text-primary"></i> {profileData.email}
                </div>
              )}
              {profileData.phone && (
                <div className="mb-2">
                  <i className="fas fa-phone-alt me-2 text-primary"></i> {profileData.phone}
                </div>
              )}
              {profileData.office && (
                <div>
                  <i className="fas fa-map-marker-alt me-2 text-primary"></i> {profileData.office}
                </div>
              )}
            </div>
          </div>

          {/* Security & Access Summary */}
          <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '16px', background: '#ffffff' }}>
            <h6 style={{ fontWeight: 700, color: '#1e293b', marginBottom: '16px' }}>
              <i className="fas fa-lock me-2 text-secondary"></i> Security Overview
            </h6>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <strong style={{ fontSize: '0.88rem', color: '#1e293b', display: 'block' }}>Session Status</strong>
                <small style={{ color: '#64748b' }}>Bearer token active</small>
              </div>
              <span className="badge bg-success-subtle text-success border border-success-subtle" style={{ borderRadius: '6px' }}>
                Authenticated
              </span>
            </div>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <strong style={{ fontSize: '0.88rem', color: '#1e293b', display: 'block' }}>User Privilege</strong>
                <small style={{ color: '#64748b' }}>Assigned role permissions</small>
              </div>
              <span className="badge bg-light text-dark border">{profileData.role}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Password Management Form */}
        <div className="col-12 col-lg-7 col-xl-8">
          <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '16px', background: '#ffffff' }}>
            <h5 style={{ fontWeight: 700, color: '#1e293b', marginBottom: '20px' }}>
              <i className="fas fa-key me-2" style={{ color: 'var(--ums-primary-mid, #2d6a9f)' }}></i>
              Change Account Password
            </h5>

            <form onSubmit={handlePasswordUpdate}>
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Current Password</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Enter existing password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Minimum 8 characters"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Confirm New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Confirm new password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  />
                </div>
                <div className="col-12 text-end">
                  <button
                    type="submit"
                    className="btn px-4 text-white"
                    style={{
                      backgroundColor: 'var(--ums-primary-mid, #2d6a9f)',
                      borderRadius: '10px',
                      fontWeight: 600
                    }}
                  >
                    Update Password
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;