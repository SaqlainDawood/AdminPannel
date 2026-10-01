import React from 'react';

const Books = () => {
  return (
    <div className="books-page" style={{ padding: '0' }}>
      <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--ums-gray-800, #1e293b)', margin: 0 }}>
            <i className="fas fa-book-reader me-2" style={{ color: 'var(--ums-primary-mid, #2d6a9f)' }}></i>
            Library & Books Management
          </h2>
          <p style={{ color: 'var(--ums-gray-500, #64748b)', margin: '4px 0 0 0', fontSize: '0.88rem' }}>
            Catalog, issue, and manage library books and learning resources
          </p>
        </div>
      </div>

      <div
        className="card shadow-sm border-0 text-center py-5 px-4"
        style={{ borderRadius: '16px', background: '#ffffff', maxWidth: '600px', margin: '40px auto' }}
      >
        <div
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: 'rgba(45, 106, 159, 0.1)',
            color: 'var(--ums-primary-mid, #2d6a9f)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.8rem',
            margin: '0 auto 1.25rem'
          }}
        >
          <i className="fas fa-book"></i>
        </div>
        <h4 style={{ fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>Library Module Coming Soon</h4>
        <p style={{ color: '#64748b', fontSize: '0.92rem', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
          The university book repository, digital cataloging, and student checkout system is scheduled for an upcoming release.
        </p>
        <div>
          <span className="badge px-3 py-2" style={{ background: '#e2e8f0', color: '#475569', borderRadius: '8px', fontWeight: 600 }}>
            <i className="fas fa-tools me-1"></i> Module in Development
          </span>
        </div>
      </div>
    </div>
  );
};

export default Books;