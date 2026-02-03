  // Show loading state
  if (loading) {
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