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
   <MDBNavbar className='mt-2' light bgColor='light'>
      <MDBContainer fluid>
        <MDBNavbarBrand>Class Management</MDBNavbarBrand>
        <MDBInputGroup tag="form" className='d-flex w-auto mb-3'>
          <MDBBtn >New Class</MDBBtn>
        </MDBInputGroup>
      </MDBContainer>
    </MDBNavbar>
   </>
  )
}

export default ClassList