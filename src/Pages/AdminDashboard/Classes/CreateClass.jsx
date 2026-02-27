import React ,{useState} from 'react'
import {
  MDBContainer,
  MDBCard,
  MDBCardBody,
  MDBBtn,
  MDBIcon,
} from "mdb-react-ui-kit";

const CreateClass = () => {
  const [formData , setFormData] = useState({
   className:"",
   classCode:"",
   department:"",
   semester:"",
   section:"",
   academicYear:"",
   subject:"",
   creditHours:"",
   teachers:"",
   role:"",
   assignedDate:"",
   students:"",
   enrollmentDate:"",
   status:"",
   schedule:"",
   capacity:"",
   enrolledCount:"",
   isActive:"",
   day:"",
   startTime:"",
   endTime:"",
   room:""
  })
  const handleSubmit = async(e)=>{
    
  }
  const handleChange = async(e)=>{

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
              Step [1-3]
            </MDBBtn>
        </div>
       <form onClick={handleSubmit}>
         <div className="card mb-4 mt-4">
           <div className="card-header bg-primary text-white">
              <h5 className="mb-0">
                     <i className="fas fa-user me-2"></i>    
                     Assign Class            
                  </h5>
           </div>
            <div className="card-body">
               <div className="row g-3">
                 <div className="col-md-6">
                   <label className="form-label">Class Name</label>
                   <input type="text"
                   className='form-control' 
                   name='className'
                   value={formData.className}
                   onChange={handleChange}
                   required />
                 </div>
                 <div className="col-md-6">
                   <label className="form-label">Class Code</label>
                   <input type="text"
                   className='form-control' 
                   name='classCode'
                   value={formData.classCode}
                   onChange={handleChange}
                   required />
                 </div>
                 <div className="col-md-6">
                   <label className="form-label">Department</label>
                  <select 
                    className="form-select"
                  name="department"
                  value={formData.department}
                 onChange={handleChange}>
                  <option value="">Select Type</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="BBA">BBA</option>
                  <option value="Agriculture">Agriculture</option>
                  <option value="English">English Literature</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Physics">Physics</option>
                  <option value="Maths">Mathematics</option>
                  <option value="Biology">Biology</option>
                  <option value="Nutrients">Nutrients</option>
                  <option value="FoodScience">Food Science</option>
                  <option value="Urdu">Urdu</option>
                  <option value="Islamiyat">Islamiyat</option>
                  <option value="SocialStudies">Pak Studies</option>
                  <option value="Psychology">Psychology</option>
                  <option value="Economics">Economics</option>
                  </select>
                 </div>
                 
                  <div className="col-md-6">
                   <label className="form-label">Semester</label>
                 <select
                   className="form-select"
                 name="semester"
                 value={formData.semester}
                 onChange={handleChange} >
                  <option value="1">1st</option>
                  <option value="2">2nd</option>
                  <option value="3">3rd</option>
                  <option value="4">4th</option>
                  <option value="5">th</option>
                  <option value="6">6th</option>
                  <option value="7">7th</option>
                  <option value="8">8th</option>
                 </select>
                 </div>

                  <div className="col-md-6">
                   <label className="form-label">Section</label>
                   <select
                     name="section"
                     className="form-select"
                    value={formData.section} 
                    onChange={handleChange}
                  >
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="Morning">Morning</option>
                      <option value="Evening">Evening</option>
                  </select>
                 </div>
                  <div className="col-md-6">
                   <label className="form-label">Subject</label>
                   <input type="text"
                   className='form-control' 
                   name='subject'
                   value={formData.subject}
                   onChange={handleChange}
                   required />
                 </div>
                 
                  <div className="col-md-6">
                   <label className="form-label">Credit Hours</label>
                  <select
                    className="form-select"
                   name="creditHours"
                  value={formData.creditHours}
                  onChange={handleChange}>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                  </select>
                 </div>
                  <div className="col-md-6">
                   <label className="form-label">Capacity</label>
                   <input type='text'
                   className='form-control' 
                   name='capacity'
                   value={formData.capacity}
                   onChange={handleChange}
                   required />
                 </div>
                 
               </div>
            </div>
        </div>

       </form>
        </MDBCardBody>
      </MDBCard>
     </MDBContainer>
     </>
  )
}

export default CreateClass