import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import HeroLanding from './Components/MainFrontPage/Main'
import AdminLogin from './Pages/AdminForm/Login'
import { ToastContainer } from 'react-toastify'
import Dashboard from './Pages/AdminDashboard/Dashboard/AdminDashboard'
import Register from './Pages/AdminForm/Register'
import AdminSidebar from './Pages/AdminDashboard/AdminSN';
import StudentList from './Pages/AdminDashboard/StudentManage/StudentList'
import StudentApprovals from './Pages/AdminDashboard/StudentManage/StudentApprovals'
import StudentAssign from './Pages/AdminDashboard/StudentManage/StudentAssign'
import FacultyList from './Pages/AdminDashboard/FacultyManage/FacultyList'
import FacultyAdd from './Pages/AdminDashboard/FacultyManage/FacultyAdd'
import CoodList from './Pages/AdminDashboard/CoordinatorsManage/CoodList'
import CoodAdd from './Pages/AdminDashboard/CoordinatorsManage/CoodAdd'
import FeeManagement from './Pages/AdminDashboard/FeeManage/FeeVouchers'
import FeeVerify from './Pages/AdminDashboard/FeeManage/FeeVerify'
import ExamAnnouncements from './Pages/AdminDashboard/ExaminationManage/ExamAnnouncements'
import ExamDatesheets from './Pages/AdminDashboard/ExaminationManage/ExamDatesheets'
import ExamResults from './Pages/AdminDashboard/ExaminationManage/ExamResults'
import Books from './Pages/AdminDashboard/Books/Books'
import AdminProfile from './Pages/AdminDashboard/Settings/AdminProfile'
import Access from './Pages/AdminDashboard/Settings/Access'
import SystemSett from './Pages/AdminDashboard/Settings/SystemSett'
import UpdateFaculty from './Pages/AdminDashboard/FacultyManage/UpdateFaculty'
import ViewFaculty from './Pages/AdminDashboard/FacultyManage/ViewFaculty'
import StudentView from './Pages/AdminDashboard/StudentManage/StudentView'
import StudentUpdate from './Pages/AdminDashboard/StudentManage/StudentUpdate'
import CoordinatorLogin from './CoordinatorForm/Login'
import CoordinatorDashboard from './CoordinatorDashboard/CoordSideNav/CoordSideNav'
import CoodView from './Pages/AdminDashboard/CoordinatorsManage/CoodView'
import CoodUpdate from './Pages/AdminDashboard/CoordinatorsManage/CoodUpdate'
import CreateClass from './Pages/AdminDashboard/Classes/CreateClass'
import ClassList from './Pages/AdminDashboard/Classes/ClassList'
import ClassDetails from './Pages/AdminDashboard/Classes/ClassDetails'
import EditClass from './Pages/AdminDashboard/Classes/EditClass'
import AttendanceOverview from './Pages/AdminDashboard/Attendence/Overview';
import ClassAttendance from './Pages/AdminDashboard/Attendence/ByCourse'
import StudentAttendance from './Pages/AdminDashboard/Attendence/ByStudent'
import DepartmentAttendance from './Pages/AdminDashboard/Attendence/ByDept'
import ManageEnrollment from './Pages/AdminDashboard/Classes/ManageEnrollment'
function App() {

  return (
    <>
      <Router>
        <Routes>
          <Route path='/' element={<HeroLanding/>}/>
          <Route path='/admin/register' element={<Register />} />
          <Route path='/admin/login' element={<AdminLogin />} />
          <Route path='/coordinator/login' element={<CoordinatorLogin/>}/>


          <Route path='/admin/dashboard' element={<AdminSidebar />}>
            <Route index element={<Dashboard />} />
            <Route path='students'>
              <Route index element={<Navigate to='list' replace />} />
              <Route path='list' element={<StudentList />} />
              <Route path='approvals' element={<StudentApprovals />} />
              <Route path='assign' element={<StudentAssign />} />
              <Route path='view/:id' element={<StudentView/>}/>
              <Route path='update/:id' element={<StudentUpdate/>}/>
            </Route>

            <Route path='faculty'>
              <Route index element={<Navigate to='list' replace />} />
              <Route path='list' element={<FacultyList />} />
              <Route path='add' element={<FacultyAdd />} />
              <Route path='update/:id' element={<UpdateFaculty/>} />
              <Route path='view/:id' element={<ViewFaculty/>}/>
            </Route>
            <Route path='coordinators'>
              <Route index element={<Navigate to='list' replace />} />
              <Route path='list' element={<CoodList />} />
              <Route path='add' element={<CoodAdd />} />
              <Route path='view/:id' element={<CoodView/>}/>
              <Route path='update/:id' element={<CoodUpdate/>}/>
            </Route>

            <Route path='fee'>
              <Route index element={<Navigate to='vouchers' replace />} />
              <Route path='vouchers' element={<FeeManagement />} />
              <Route path='verify' element={<FeeVerify />} />
            </Route>
            <Route path='exam'>
              <Route index element={<Navigate to='announcements' replace />} />
              <Route path='announcements' element={<ExamAnnouncements />} />
              <Route path='datesheets' element={<ExamDatesheets />} />
              <Route path='results' element={<ExamResults />} />
            </Route>
             <Route path='classes'>
              <Route index element={<Navigate to='createclass' replace />} />
              <Route path='createclass' element={<CreateClass />} />
              <Route path='listclass' element={<ClassList/>} />
              <Route path='view/:id' element={<ClassDetails/>}/>
              <Route path='edit/:id' element={<EditClass/>}/>
              <Route path=':id/enroll' element={<ManageEnrollment/>}/>
            </Route>
            <Route path='attendance'>
              <Route index element={<AttendanceOverview />} />
              <Route path='overview' element={<AttendanceOverview />} />
              <Route path='department/:departmentName' element={<DepartmentAttendance />} />
              <Route path='class/:classId' element={<ClassAttendance />} />
              <Route path='student/:studentId' element={<StudentAttendance />} />
            </Route>
            <Route path="books" element={<Books />} />
            <Route path="profile" element={<AdminProfile />} />
            <Route path="access-control" element={<Access />} />
            <Route path="system-settings" element={<SystemSett />} />
         </Route>
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
            {/* Coordinator Side */}
          <Route path="/coordinator" element={<CoordinatorDashboard/>}/>
        </Routes>
      </Router>
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  )
}

export default App

