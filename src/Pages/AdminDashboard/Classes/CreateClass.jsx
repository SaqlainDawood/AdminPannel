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
                   <input type="text"
                   className='form-control' 
                   name='department'
                   value={formData.department}
                   onChange={handleChange}
                   required />
                 </div>
                 
                  <div className="col-md-6">
                   <label className="form-label">Semester</label>
                   <input type="text"
                   className='form-control' 
                   name='semester'
                   value={formData.semester}
                   onChange={handleChange}
                   required />
                 </div>

                  <div className="col-md-6">
                   <label className="form-label">Section</label>
                   <input type="text"
                   className='form-control' 
                   name='section'
                   value={formData.section}
                   onChange={handleChange}
                   required />
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
                   <input type='number'
                   className='form-control' 
                   name='creditHours'
                   value={formData.creditHours}
                   onChange={handleChange}
                   required />
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