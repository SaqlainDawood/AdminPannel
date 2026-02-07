import React, { useEffect, useState } from 'react';
import './Student.css';
import { toast } from 'react-toastify';
import AdminAPI from '../../../api';

const StudentApprovals = () => {
  const [pendingStudents, setPendingStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [filter, setFilter] = useState('all');
  const [initialLoading, setInitialLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchPendingStudents = async () => {
      try {
        const res = await AdminAPI.get("/stats/students/pending");
        
        let studentsArray = [];
        
        if (Array.isArray(res.data)) {
          studentsArray = res.data;
        } else if (res.data && Array.isArray(res.data.students)) {
          studentsArray = res.data.students;
        } else if (res.data && Array.isArray(res.data.data)) {
          studentsArray = res.data.data;
        } else if (res.data && Array.isArray(res.data.pendingStudents)) {
          studentsArray = res.data.pendingStudents;
        } else {
          console.error("Unexpected API structure:", res.data);
          toast.error("Unexpected data format received");
        }
        setPendingStudents(studentsArray);
      } catch (error) {
        console.error("Fetch Pending students Error!!!", error);
        toast.error("Failed to load pending students");
        setPendingStudents([]);
      } finally {
        setInitialLoading(false);
      }
    };
    
    fetchPendingStudents();
  }, []);

  const handleApprove = (student) => {
    setSelectedStudent(student);
    setActionType('approve');
    setShowModal(true);
  };

  const handleReject = (student) => {
    setSelectedStudent(student);
    setActionType('rejected');
    setShowModal(true);
  };

  const confirmAction = async () => {
    if (!selectedStudent) return;
    
    // Prevent multiple clicks
    if (processing) return;
    
    setProcessing(true);
    
    try {
      if (actionType === 'approve') {
        const res = await AdminAPI.put(`/stats/students/approve/${selectedStudent._id}`);
        
        if (res.data.success) {
          toast.success(`${selectedStudent.firstName} ${selectedStudent.lastName} has been approved successfully!`);
          
          // Remove from list
          setPendingStudents(prev => prev.filter(s => s._id !== selectedStudent._id));
          
          // Close modal after success
          setTimeout(() => {
            setShowModal(false);
            setProcessing(false);
            setSelectedStudent(null);
          }, 500);
          
          return;
        } else {
          toast.error(res.data.message || "Approval failed");
        }
      } 
      else if (actionType === 'rejected') {
        const res = await AdminAPI.put(`/stats/students/rejected/${selectedStudent._id}`, {
          rejectionReason: rejectReason
        });
        
        if (res.data.success) {
          toast.info(`${selectedStudent.firstName} ${selectedStudent.lastName} has been rejected`);
          setPendingStudents(prev => prev.filter(s => s._id !== selectedStudent._id));
          
          setTimeout(() => {
            setShowModal(false);
            setProcessing(false);
            setRejectReason('');
            setSelectedStudent(null);
          }, 500);
          
          return;
        } else {
          toast.error(res.data.message || "Rejection failed");
        }
      }
    } catch (error) {
      console.error("Approval/Reject Error:", error);
      toast.error("Something went wrong while updating the status!");
    } finally {
      setProcessing(false);
    }
  };

  const getDocumentStatus = (documents) => {
    if (!documents || typeof documents !== 'object') {
      return { completed: 0, total: 0, percentage: 0 };
    }
    const total = Object.keys(documents).length;
    const completed = Object.values(documents).filter(Boolean).length;
    return { completed, total, percentage: (completed / total) * 100 };
  };

  const filteredStudents = filter === 'all'
    ? pendingStudents
    : pendingStudents.filter((s) =>
        s.enrollment?.department?.toLowerCase().includes(filter.toLowerCase())
      );

  if (initialLoading) {
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

  return (
    <div className="approvals-container">
      <div className="container-fluid">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">
              <i className="fas fa-clock me-3"></i>Pending Approvals
            </h1>
            <p className="page-subtitle">
              Review and approve student registration applications
            </p>
          </div>
          <div className="header-stats">
            <div className="stat-badge">
              <i className="fas fa-hourglass-half"></i>
              <span>{pendingStudents.length} Pending</span>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="filter-section">
          <div className="filter-label">Search by Department:</div>
          <div className="filter-controls">
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All Departments
            </button>
            <input
              type="text"
              className="search-bar"
              placeholder="Type department name (e.g. Software Engineering)"
              value={filter === 'all' ? '' : filter}
              onChange={(e) => {
                const value = e.target.value;
                setFilter(value === '' ? 'all' : value);
              }}
            />
          </div>
        </div>

        {/* Approvals Grid */}
        <div className="approvals-grid">
          {filteredStudents.map(student => {
            const docStatus = getDocumentStatus(student.documents);
            return (
              <div key={student._id} className="approval-card">
                <div className="card-header">
                  <div className="student-basic-info">
                    <img 
                      src={
                        student.documents?.photo?.url ||
                        student.profileImage?.url ||
                        "/default-avatar.png"
                      } 
                      alt={`${student.firstName} ${student.lastName}`} 
                      className="student-photo" 
                    />
                    <div className="student-details">
                      <h3 className="student-name">{student.firstName} {student.lastName}</h3>
                      <p className="student-email">
                        <i className="fas fa-envelope me-2"></i>
                        {student?.user?.email || "No Email"}
                      </p>
                      <p className="student-phone">
                        <i className="fas fa-phone me-2"></i>
                        {student.phoneNo}
                      </p>
                    </div>
                  </div>
                  <div className="time-badge">
                    <i className="far fa-clock me-2"></i>
                    Applied: {new Date(student.createdAt || student.appliedDate).toLocaleDateString()}
                  </div>
                </div>

                <div className="card-body">
                  <div className="info-grid">
                    <div className="info-item">
                      <label>CNIC</label>
                      <span>{student.cnic}</span>
                    </div>
                    <div className="info-item">
                      <label>Father's Name</label>
                      <span>{student.family?.fatherName || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <label>Department</label>
                      <span className="dept-badge">{student.enrollment?.department || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <label>Program</label>
                      <span>{student.enrollment?.program || 'N/A'} - {student.enrollment?.semester}</span>
                    </div>
                  </div>

                  {/* Documents Status */}
                  <div className="documents-section">
                    <div className="documents-header">
                      <h4>Documents Verification</h4>
                      <span className="completion-badge">
                        {docStatus.completed}/{docStatus.total} Complete
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${docStatus.percentage}%` }}
                      ></div>
                    </div>
                    <div className="documents-list">
                      <div className={`doc-item ${student.documents?.cnic ? 'verified' : 'missing'}`}>
                        <i className={`fas ${student.documents?.cnic ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
                        <span>CNIC Copy</span>
                      </div>
                      <div className={`doc-item ${student.documents?.marksheet ? 'verified' : 'missing'}`}>
                        <i className={`fas ${student.documents?.marksheet ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
                        <span>Marksheet</span>
                      </div>
                      <div className={`doc-item ${student.documents?.photo ? 'verified' : 'missing'}`}>
                        <i className={`fas ${student.documents?.photo ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
                        <span>Photograph</span>
                      </div>
                      <div className={`doc-item ${student.documents?.domicile ? 'verified' : 'missing'}`}>
                        <i className={`fas ${student.documents?.domicile ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
                        <span>Domicile</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card-footer">
                  <button
                    className="btn-reject"
                    onClick={() => handleReject(student)}
                  >
                    <i className="fas fa-times me-2"></i>
                    Reject
                  </button>
                  <button
                    className="btn-approve"
                    onClick={() => handleApprove(student)}
                  >
                    <i className="fas fa-check me-2"></i>
                    Approve
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredStudents.length === 0 && (
          <div className="empty-state">
            <i className="fas fa-check-circle"></i>
            <h3>All Caught Up!</h3>
            <p>There are no pending approvals at the moment.</p>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div 
          className={`modal-overlay ${processing ? 'processing' : ''}`} 
          onClick={() => !processing && setShowModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {actionType === 'approve' ? (
                  <>
                    <i className="fas fa-check-circle text-success me-2"></i>
                    Approve Application
                  </>
                ) : (
                  <>
                    <i className="fas fa-times-circle text-danger me-2"></i>
                    Reject Application
                  </>
                )}
              </h3>
              {!processing && (
                <button className="btn-close" onClick={() => setShowModal(false)}>
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>
            
            {/* Show loading spinner when processing */}
            {processing ? (
              <div className="modal-body text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Processing...</span>
                </div>
                <p className="mt-3">
                  {actionType === 'approve' ? 'Approving student...' : 'Rejecting student...'}
                </p>
              </div>
            ) : (
              <div className="modal-body">
                {actionType === 'approve' ? (
                  <div>
                    <p className="mb-3">
                      Are you sure you want to approve <strong>{selectedStudent?.firstName} {selectedStudent?.lastName}</strong>'s application?
                    </p>
                    <div className="approval-details">
                      <div className="detail-item">
                        <i className="fas fa-user-graduate"></i>
                        <span>{selectedStudent?.firstName} {selectedStudent?.lastName}</span>
                      </div>
                      <div className="detail-item">
                        <i className="fas fa-envelope"></i>
                        <span>{selectedStudent?.user?.email || 'No email available'}</span>
                      </div>
                      <div className="detail-item">
                        <i className="fas fa-building"></i>
                        <span>{selectedStudent?.enrollment?.department || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="alert alert-info">
                      <i className="fas fa-info-circle me-2"></i>
                      Student will receive confirmation email with login credentials.
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="mb-3">
                      Please provide a reason for rejecting <strong>{selectedStudent?.firstName} {selectedStudent?.lastName}</strong>'s application:
                    </p>
                    <textarea
                      className="form-control"
                      rows="4"
                      placeholder="Enter rejection reason..."
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                    ></textarea>
                    <div className="alert alert-warning mt-3">
                      <i className="fas fa-exclamation-triangle me-2"></i>
                      Student will be notified via email with the rejection reason.
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowModal(false)}
                disabled={processing}
              >
                Cancel
              </button>
              <button
                className={`btn ${actionType === 'approve' ? 'btn-success' : 'btn-danger'}`}
                onClick={confirmAction}
                disabled={processing || (actionType === 'rejected' && !rejectReason.trim())}
              >
                {processing ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    {actionType === 'approve' ? 'Approving...' : 'Rejecting...'}
                  </>
                ) : (
                  actionType === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentApprovals;