import React from 'react'
import {
  MDBContainer,
  MDBNavbar,
  MDBNavbarBrand,
  MDBBtn,
  MDBInputGroup
} from 'mdb-react-ui-kit';
const ClassList = () => {
  return (
   <>
   <MDBNavbar light bgColor='light'>
      <MDBContainer fluid>
        <MDBNavbarBrand>Class Management</MDBNavbarBrand>
        <MDBInputGroup tag="form" className='d-flex w-auto mb-3'>
          <MDBBtn className='me-1'>New Class</MDBBtn>
        </MDBInputGroup>
      </MDBContainer>
    </MDBNavbar>
   </>
  )
}

export default ClassList