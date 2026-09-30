import React from "react";
import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import HeroLanding from "../Components/MainFrontPage/auth/login";
import CoordinatorLogin from "../CoordinatorForm/Login";
import ForgotPassword from "../Components/MainFrontPage/auth/ForgotPassword";
import ResetPassword from "../Components/MainFrontPage/auth/ResetPassword";
import Dashboard from "../Pages/AdminDashboard/Dashboard/AdminDashboard";
import AdminSidebar from "../Pages/AdminDashboard/AdminSN";
import StudentList from "../Pages/AdminDashboard/StudentManage/StudentList";
import StudentApprovals from "../Pages/AdminDashboard/StudentManage/StudentApprovals";
import StudentAssign from "../Pages/AdminDashboard/StudentManage/StudentAssign";
import StudentView from "../Pages/AdminDashboard/StudentManage/StudentView";
import StudentUpdate from "../Pages/AdminDashboard/StudentManage/StudentUpdate";
import FacultyList from "../Pages/AdminDashboard/FacultyManage/FacultyList";
import FacultyAdd from "../Pages/AdminDashboard/FacultyManage/FacultyAdd";
import UpdateFaculty from "../Pages/AdminDashboard/FacultyManage/UpdateFaculty";
import ViewFaculty from "../Pages/AdminDashboard/FacultyManage/ViewFaculty";
import CoodList from "../Pages/AdminDashboard/CoordinatorsManage/CoodList";
import CoodAdd from "../Pages/AdminDashboard/CoordinatorsManage/CoodAdd";
import CoodView from "../Pages/AdminDashboard/CoordinatorsManage/CoodView";
import CoodUpdate from "../Pages/AdminDashboard/CoordinatorsManage/CoodUpdate";
import FeeManagement from "../Pages/AdminDashboard/FeeManage/FeeVouchers";
import FeeVerify from "../Pages/AdminDashboard/FeeManage/FeeVerify";
import Voucher from "../Pages/AdminDashboard/FeeManage/Voucher";
import VoucherPage from "../Pages/AdminDashboard/FeeManage/VoucherPage";
import FeeConfig from "../Pages/AdminDashboard/FeeManage/FeeConfig";
import VoucherPreview from "../Pages/AdminDashboard/FeeManage/VoucherPreview";
import ExamAnnouncements from "../Pages/AdminDashboard/ExaminationManage/ExamAnnouncements";
import ExamDatesheets from "../Pages/AdminDashboard/ExaminationManage/ExamDatesheets";
import ExamResults from "../Pages/AdminDashboard/ExaminationManage/ExamResults";
import Books from "../Pages/AdminDashboard/Books/Books";
import AdminProfile from "../Pages/AdminDashboard/Settings/AdminProfile";
import Access from "../Pages/AdminDashboard/Settings/Access";
import SystemSett from "../Pages/AdminDashboard/Settings/SystemSett";
import CreateClass from "../Pages/AdminDashboard/Classes/CreateClass";
import ClassList from "../Pages/AdminDashboard/Classes/ClassList";
import ClassDetails from "../Pages/AdminDashboard/Classes/ClassDetails";
import EditClass from "../Pages/AdminDashboard/Classes/EditClass";
import ManageEnrollment from "../Pages/AdminDashboard/Classes/ManageEnrollment";
import AttendanceOverview from "../Pages/AdminDashboard/Attendence/Overview";
import ClassAttendance from "../Pages/AdminDashboard/Attendence/ByCourse";
import StudentAttendance from "../Pages/AdminDashboard/Attendence/ByStudent";
import DepartmentAttendance from "../Pages/AdminDashboard/Attendence/ByDept";
import Department from "../Pages/AdminDashboard/StudentEnrolment/Department";
import DegreeClasses from "../Pages/AdminDashboard/StudentEnrolment/DegreeClasses";
import Sessions from "../Pages/AdminDashboard/StudentEnrolment/Sessions";
import Batch from "../Pages/AdminDashboard/StudentEnrolment/Batch";
import Campus from "../Pages/AdminDashboard/StudentEnrolment/Campus";
import Subject from "../Pages/AdminDashboard/Subjects/Subject";
import JobPostingList from "../Pages/AdminDashboard/JobPosting/JobPostingList";
import JobPostingForm from "../Pages/AdminDashboard/JobPosting/JobPostingForm";
import JobPostingView from "../Pages/AdminDashboard/JobPosting/JobPostingView";
import StaffApplications from "../Pages/AdminDashboard/JobPosting/StaffApplications";
import CoordinatorDashboard from "../CoordinatorDashboard/CoordSideNav/CoordSideNav";
import ProtectedRoute from "./ProtectedRoute";
import RolesManager from "../Pages/AdminDashboard/roles/RolesManager";

import Teacher from "../Pages/AdminDashboard/Teacher/Teachers";




const AppRoutes = () => {
  return (
    <Routes>

      {/* =====================================================
          PUBLIC ROUTES
      ===================================================== */}

      <Route
        path="/login"
        element={<HeroLanding />}
      />


      {/* <Route
        path="/coordinator/login"
        element={<CoordinatorLogin />}
      /> */}

      <Route
        path="/forgot-password"
        element={<ForgotPassword />}
      />

      <Route
        path="/Teacher"
        element={<Teacher/>}
      />

      


      <Route
        path="/reset-password/:token"
        element={<ResetPassword />}
      />


      {/* =====================================================
          PROTECTED ADMIN ROUTES
      ===================================================== */}

      <Route element={<ProtectedRoute />}>

        <Route
          path="/admin/dashboard"
          element={<AdminSidebar />}
        >

          {/* Dashboard */}
          <Route
            index
            element={<Dashboard />}
          />

          {/* Student Enrolment */}
          <Route
            path="Campus"
            element={<Campus />}
          />

          <Route
            path="Department"
            element={<Department />}
          />

          <Route
            path="DegreeClasses"
            element={<DegreeClasses />}
          />

          <Route
            path="Sessions"
            element={<Sessions />}
          />

          <Route
            path="Batches"
            element={<Batch />}
          />


          {/* Teachers */}
          <Route
            path="teachers"
            element={<Teacher />}
          />

          {/* Students */}
          <Route path="students">

            <Route
              index
              element={
                <Navigate
                  to="list"
                  replace
                />
              }
            />

            <Route
              path="list"
              element={<StudentList />}
            />

            <Route
              path="approvals"
              element={<StudentApprovals />}
            />

            <Route
              path="assign"
              element={<StudentAssign />}
            />

            <Route
              path="view/:id"
              element={<StudentView />}
            />

            <Route
              path="update/:id"
              element={<StudentUpdate />}
            />

          </Route>


          {/* Subjects */}
          <Route
            path="subjects"
            element={<Subject />}
          />


          {/* Faculty */}
          <Route path="faculty">

            <Route
              index
              element={
                <Navigate
                  to="list"
                  replace
                />
              }
            />

            <Route
              path="list"
              element={<FacultyList />}
            />

            <Route
              path="add"
              element={<FacultyAdd />}
            />

            <Route
              path="update/:id"
              element={<UpdateFaculty />}
            />

            <Route
              path="view/:id"
              element={<ViewFaculty />}
            />

          </Route>


          {/* Coordinators */}
          <Route path="coordinators">

            <Route
              index
              element={
                <Navigate
                  to="list"
                  replace
                />
              }
            />

            <Route
              path="list"
              element={<CoodList />}
            />

            <Route
              path="add"
              element={<CoodAdd />}
            />

            <Route
              path="view/:id"
              element={<CoodView />}
            />

            <Route
              path="update/:id"
              element={<CoodUpdate />}
            />

          </Route>


          {/* Fee */}
          <Route path="fee">

            <Route
              index
              element={
                <Navigate
                  to="vouchers"
                  replace
                />
              }
            />

            <Route
              path="vouchers"
              element={<FeeManagement />}
            />

            <Route
              path="Voucher"
              element={<Voucher />}
            />

            <Route
              path="generatevoucher"
              element={<VoucherPage />}
            />

            <Route
              path="verify"
              element={<FeeVerify />}
            />

            <Route
              path="config"
              element={<FeeConfig />}
            />

            <Route
              path="preview/:voucherId"
              element={<VoucherPreview />}
            />

          </Route>


          {/* Examination */}
          <Route path="exam">

            <Route
              index
              element={
                <Navigate
                  to="announcements"
                  replace
                />
              }
            />

            <Route
              path="announcements"
              element={<ExamAnnouncements />}
            />

            <Route
              path="datesheets"
              element={<ExamDatesheets />}
            />

            <Route
              path="results"
              element={<ExamResults />}
            />

          </Route>


          {/* Classes */}
          <Route path="classes">

            <Route
              index
              element={
                <Navigate
                  to="createclass"
                  replace
                />
              }
            />

            <Route
              path="createclass"
              element={<CreateClass />}
            />

            <Route
              path="listclass"
              element={<ClassList />}
            />

            <Route
              path="view/:id"
              element={<ClassDetails />}
            />

            <Route
              path="edit/:id"
              element={<EditClass />}
            />

            <Route
              path=":id/enroll"
              element={<ManageEnrollment />}
            />

          </Route>


          {/* Attendance */}
          <Route path="attendance">

            <Route
              index
              element={<AttendanceOverview />}
            />

            <Route
              path="overview"
              element={<AttendanceOverview />}
            />

            <Route
              path="department/:departmentName"
              element={<DepartmentAttendance />}
            />

            <Route
              path="class/:classId"
              element={<ClassAttendance />}
            />

            <Route
              path="student/:studentId"
              element={<StudentAttendance />}
            />

          </Route>

<Route>
          {/* Jobs */}
        <Route
  path="jobs"
  element={<JobPostingList />}
/>

<Route
  path="jobs/roles"
  element={<RolesManager />}
/>

<Route
  path="jobs/approvals"
  element={<StaffApplications />}
/>

            
            <Route
              path="create"
              element={<JobPostingForm />}
            />

            <Route
              path="edit/:id"
              element={<JobPostingForm />}
            />

            <Route
              path="view/:id"
              element={<JobPostingView />}
            />
                
            

          </Route>


          {/* Other Admin Pages */}
          <Route
            path="books"
            element={<Books />}
          />

          <Route
            path="profile"
            element={<AdminProfile />}
          />

          <Route
            path="access-control"
            element={<Access />}
          />

          <Route
            path="system-settings"
            element={<SystemSett />}
          />

        </Route>

      </Route>


      {/* =====================================================
          COORDINATOR
      ===================================================== */}

      <Route
        path="/coordinator"
        element={<CoordinatorDashboard />}
      />


      {/* =====================================================
          FALLBACK
      ===================================================== */}

      <Route
        path="*"
        element={
          <Navigate
            to="/admin/dashboard"
            replace
          />
        }
      />

    </Routes>
  );
};

export default AppRoutes;