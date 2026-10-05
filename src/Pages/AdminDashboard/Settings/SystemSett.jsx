import React from 'react';

const SystemSett = () => {
  return (
    <div className="system-settings-page" style={{ padding: 0 }}>
      {/* Page Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-3 border-bottom gap-3">
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--ums-gray-800, #1e293b)', margin: 0 }}>
            <i className="fas fa-cogs me-2" style={{ color: 'var(--ums-primary-mid, #2d6a9f)' }}></i>
            System Configuration
          </h2>
          <p style={{ color: 'var(--ums-gray-500, #64748b)', margin: '4px 0 0 0', fontSize: '0.88rem' }}>
            Configure institutional parameters, academic policies, and global portal options
          </p>
        </div>
      </div>

      {/* Coming Soon Card */}
      <div
        className="card shadow-sm border-0 text-center py-5 px-4"
        style={{ borderRadius: '16px', background: '#ffffff', maxWidth: '640px', margin: '40px auto' }}
      >
        <div
          style={{
            width: '76px',
            height: '76px',
            borderRadius: '50%',
            background: 'rgba(45, 106, 159, 0.1)',
            color: 'var(--ums-primary-mid, #2d6a9f)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            margin: '0 auto 1.25rem'
          }}
        >
          <i className="fas fa-cogs"></i>
        </div>
        <h4 style={{ fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>Coming Soon</h4>
        <p style={{ color: '#64748b', fontSize: '0.92rem', maxWidth: '460px', margin: '0 auto 1.5rem', lineHeight: '1.6' }}>
          Global institutional parameters, academic calendar policies, SMTP notification dispatch, and system maintenance controls are currently under development.
        </p>
        <div className="d-flex justify-content-center gap-2 mb-3">
          <span className="badge px-3 py-2" style={{ background: '#e2e8f0', color: '#475569', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem' }}>
            <i className="fas fa-tools me-1.5"></i> Feature Under Development
          </span>
        </div>
        <div className="text-muted pt-3 border-top" style={{ fontSize: '0.8rem' }}>
          Backend Gateway: <code>{import.meta.env.VITE_API_URL || 'https://backend-project-ums-cmwj.vercel.app'}</code>
        </div>
      </div>
    </div>
  );
};

export default SystemSett;