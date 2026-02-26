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
           
        </div>
        </MDBCardBody>

      </MDBCard>
     </MDBContainer>
     </>
  )
}

export default CreateClass