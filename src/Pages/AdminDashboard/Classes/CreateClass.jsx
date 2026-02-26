import React from 'react'
import {
  MDBContainer,
  MDBCard,
  MDBCardBody,
  MDBBtn,
  MDBIcon,
} from "mdb-react-ui-kit";
const CreateClass = () => {
  const handleSubmit = async(e)=>{
    
  }
  return (
     <>
     <MDBContainer className="py-4">
      <MDBCard className='shadow-4'>
        <MDBCardBody className=''>
        <div className='d-flex justify-content-between align-items-center mb-4'>
            <h3 className="text-primary fw-bold">
              <MDBIcon fas icon="plus-square" />
              Create New Class  
            </h3>
            <MDBBtn color='secondary'
             className="me-1">
              [Step 1-3]
            </MDBBtn>
        </div>
        <div className="card mb-4 mt-4">
           <div className="card-header bg-primary text-white">
              <h5 className="mb-0">
                     <i className="fas fa-user me-2"></i>                
                  </h5>
           </div>
           <div className="card-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Coordinator ID</label>
                      <input
                        type="text"
                        className="form-control"
                        name="coordId"
                        value={formData.coordId}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Full Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Email Address *</label>
                      <input
                        type="email"
                        className="form-control"
                        name="user.email"
                        value={formData.user?.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Phone Number *</label>
                      <input
                        type="tel"
                        className="form-control"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">CNIC *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="cnic"
                        value={formData.cnic}
                        onChange={handleInputChange}
                        maxLength="13"
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Date of Birth</label>
                      <input
                        type="date"
                        className="form-control"
                        name="DOB"
                        value={formData.DOB}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Address</label>
                      <textarea
                        className="form-control"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        rows="2"
                      />
                    </div>
                  </div>
                </div>
        </div>
        </MDBCardBody>

      </MDBCard>
     </MDBContainer>
     </>
  )
}

export default CreateClass