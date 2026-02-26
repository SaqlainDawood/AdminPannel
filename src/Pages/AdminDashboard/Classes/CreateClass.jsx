import React from 'react'
import {
  MDBContainer,
  MDBCard,
  MDBCardBody,
  MDBBtn,
  MDBIcon,
} from "mdb-react-ui-kit";
const CreateClass = () => {
  return (
     <>
     <MDBContainer className="py-4">
      <MDBCard className='shadow-4'>
        <MDBCardBody className=''>
        <div className='d-flex justify-content-between align-items-center mb-4'>
            <h3 className="text-primary fw-bold">
              <MDBIcon fas icon="plus-square" />
              Assign Class
            </h3>
            <MDBBtn color='secondary'
             className="me-1">
              [Stpet 1-3]
            </MDBBtn>
        </div>
        </MDBCardBody>

      </MDBCard>
     </MDBContainer>
     </>
  )
}

export default CreateClass