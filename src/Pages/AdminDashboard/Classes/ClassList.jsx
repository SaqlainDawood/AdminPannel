import React from 'react'
import {
  MDBContainer,
  MDBCard,
  MDBCardBody,
  MDBBtn,
  MDBIcon,
  
} from "mdb-react-ui-kit";
import { Navigate, useNavigate } from 'react-router-dom';
const ClassList = () => {
  const naviage = useNavigate();
  return (
   <>
   <div className="coordinator-update-container">
      <MDBContainer className="py-4">
        <MDBCard className='shadow-4'>
           <MDBCardBody className="">
            <div className='d-flex justify-content-between align-items-center mb-4'>
               <h3 className="text-primary fw-bold">
                <i className="fas fa-user-edit me-2"></i>
                Class Management
               </h3>
              <div>
               <MDBBtn className='me-1'
               color='secondary'
               onClick={()=>naviage('/admin/dashboard/classes/createclass')}
               >
                  Create Class
                  <MDBIcon fas icon="bible" />
               </MDBBtn>
              </div>
            </div>
           </MDBCardBody>
        </MDBCard>
      </MDBContainer>
   </div>
   </>
  )
}

export default ClassList