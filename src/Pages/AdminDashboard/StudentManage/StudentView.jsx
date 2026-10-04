import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  MDBContainer,
  MDBTable,
  MDBTableHead,
  MDBTableBody,
  MDBCard,
  MDBCardBody,
} from 'mdb-react-ui-kit';
import AdminAPI from '../../../api';
import { FaSpinner } from 'react-icons/fa';

const fetchStudentDetail = async (studentId) => {
  const candidateRoutes = [
    `/student/view/${studentId}`,
    `/student/${studentId}`,
    `/students/${studentId}`,
  ];

  let lastError = null;

  for (const route of candidateRoutes) {
    try {
      const res = await AdminAPI.get(route);
      const payload = res?.data?.student || res?.data?.data?.student || res?.data?.data;

      if (res?.data?.success && payload) {
        return payload;
      }
    } catch (error) {
      lastError = error;
      if (!error?.response || error.response.status !== 404) {
        throw error;
      }
    }
  }

  if (lastError) throw lastError;
  throw new Error('Student not found');
};

const formatDate = (value, withTime = false) => {
  if (!value) return 'N/A';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return 'N/A';
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  });
};

const yesNo = (v) => (v ? 'Yes' : 'No');
const val = (v) => (v === undefined || v === null || v === '' ? 'N/A' : v);

// items: [[label, value], ...] -> 2 pairs per row
const Section = ({ title, cls, items }) => {
  const rows = [];
  for (let i = 0; i < items.length; i += 2) rows.push([items[i], items[i + 1]]);

  return (
    <>
      <tr className={cls}>
        <th colSpan={4} className="text-center">{title}</th>
      </tr>
      {rows.map(([a, b], idx) => (
        <tr key={`${title}-${idx}`}>
          <th scope="col">{a[0]}</th>
          <td colSpan={b ? 1 : 3} className="fw-bold">{val(a[1])}</td>
          {b && (
            <>
              <th scope="col">{b[0]}</th>
              <td className="fw-bold">{val(b[1])}</td>
            </>
          )}
        </tr>
      ))}
    </>
  );
};

const StudentView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchStudentById = async () => {
      try {
        const token =
          sessionStorage.getItem('token') ||
          sessionStorage.getItem('adminToken') ||
          localStorage.getItem('token') ||
          localStorage.getItem('adminToken');
        if (!token) {
          toast.error('Not Authorized User');
          navigate('/login');
          return;
        }

        if (!id || id === ':id') {
          toast.error('Invalid Student ID! Redirecting to Student List...');
          setTimeout(() => navigate('/admin/dashboard/students/list'), 2000);
          return;
        }

        const studentData = await fetchStudentDetail(id);
        setStudent(studentData);
        setLoading(false);
      } catch (error) {
        console.log('Error fetching Student by id:', error);
        if (error.response && error.response.status === 404) {
          setNotFound(true);
          toast.error('Student not found!');
        } else if (error.response && error.response.status === 401) {
          toast.error('Unauthorized! Please login again.');
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('adminToken');
          localStorage.removeItem('adminToken');
          navigate('/login');
        } else {
          toast.error('Error fetching Student details!');
        }
        setLoading(false);
      }
    };
    fetchStudentById();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="loading-container">
        <div>
          <FaSpinner className="spinner" size={40} />
          <p className="loading-text">Loading Student View...</p>
        </div>
      </div>
    );
  }

  if (notFound || !student) {
    return (
      <div className="notfound-container">
        <h2>Student Not Found</h2>
        <p>The requested Student record doesn't exist.</p>
        <button className="back-btn" onClick={() => navigate('/admin/dashboard/students/list')}>
          ← Back to Student List
        </button>
      </div>
    );
  }

  const profileMissing = !student.personalInfo;
  const fullName = `${student.firstName || ''} ${student.lastName || ''}`.trim();
  const status = String(student.status || '').toLowerCase();
  const statusClass =
    ['active', 'approved', 'assign'].includes(status) ? 'bg-success'
    : ['suspend', 'suspended', 'pending'].includes(status) ? 'bg-warning'
    : status === 'rejected' ? 'bg-danger'
    : 'bg-secondary';

  const fam = student.familyInfo || student.family || {};
  const addr = student.addressInfo || {};
  const dis = student.disabilityInfo || {};
  const other = student.otherInfo || {};
  const education = Array.isArray(student.education) ? student.education : [];
  const enr = student.enrollment || {};
  const image = student.profileImage?.url;

  return (
    <div className="table-responsive">
      <MDBContainer className="py-4">
        <MDBCard className="shadow-4">
          <MDBCardBody>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div className="d-flex align-items-center">
                {image && (
                  <img
                    src={image}
                    alt={fullName || 'Student'}
                    style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', marginRight: 16 }}
                  />
                )}
                <h3 className="text-primary fw-bold mb-0">
                  {fullName || 'Student Information'}
                </h3>
              </div>
              <button
                className="btn btn-outline-primary"
                onClick={() => navigate('/admin/dashboard/students/list')}
              >
                <i className="fas fa-arrow-left me-2"></i>
              </button>
            </div>

            {profileMissing && (
              <div className="alert alert-warning">
                Is user ka student profile abhi maujood nahi hai (students collection mein koi record nahi mila).
                Sirf account ki basic info dikh rahi hai.
              </div>
            )}

            <MDBTable bordered hover responsive className="align-middle custom-table">
              <MDBTableHead>
                <tr className="text-center table-primary">
                  <th colSpan={4}>Student Details</th>
                </tr>
              </MDBTableHead>
              <MDBTableBody>
                <Section
                  title="Personal Information"
                  cls="table-primary"
                  items={[
                    ['Roll Number', student.rollNo],
                    ['Full Name', fullName],
                    ['Email', student?.user?.email || student.email],
                    ['Phone Number', student.phoneNo],
                    ['CNIC', student.cnic],
                    ['Date of Birth', formatDate(student.DOB)],
                    ['Gender', student.gender],
                    ['Blood Group', student.bloodGroup],
                    ['Marital Status', student.maritalStatus],
                    ['Religion', student.religion],
                    ['Nationality', student.nationality],
                    ['Status', <span key="st" className={`badge ${statusClass}`}>{student.status || 'N/A'}</span>],
                  ]}
                />

                <Section
                  title="Address Information"
                  cls="table-info"
                  items={[
                    ['Present Address', addr.presentAddress],
                    ['Permanent Address', addr.permanentAddress],
                    ['Province', addr.province],
                    ['City', addr.city],
                    ['Domicile', addr.domicile],
                    ['Postal Code', addr.postalCode],
                  ]}
                />

                <Section
                  title="Academic Information"
                  cls="table-info"
                  items={[
                    ['Department', enr.department],
                    ['Program', enr.program],
                    ['Semester', enr.semester],
                    ['Session', enr.session],
                    ['Campus', enr.campus],
                    ['Shift', enr.shift],
                    ['Registration No', student.registrationNo],
                    ['Section', student.section],
                    ['CGPA', student.cgpa ? Number(student.cgpa).toFixed(2) : 'N/A'],
                    ['Applied On', formatDate(enr.appliedOn)],
                  ]}
                />

                <Section
                  title="Family Information"
                  cls="table-warning"
                  items={[
                    ["Father's Name", fam.fatherName],
                    ["Mother's Name", fam.motherName],
                    ["Father's CNIC", fam.fatherCnic],
                    ["Mother's CNIC", fam.motherCnic],
                    ["Father's Occupation", fam.fatherOccupation],
                    ["Mother's Occupation", fam.motherOccupation],
                    ["Father's Mobile", fam.fatherMobile],
                    ["Mother's Mobile", fam.motherMobile],
                    ['Guardian Name', fam.guardianName],
                    ['Guardian Relation', fam.guardianRelation],
                    ['Guardian Mobile', fam.guardianMobile],
                  ]}
                />

                <Section
                  title="Disability Information"
                  cls="table-danger"
                  items={[
                    ['Has Disability', yesNo(dis.hasDisability)],
                    ['Disability Type', dis.disabilityType],
                    ['Description', dis.disabilityDescription],
                    [
                      'Certificate',
                      dis.disabilityCertificate?.url ? (
                        <a key="dc" href={dis.disabilityCertificate.url} target="_blank" rel="noreferrer">View</a>
                      ) : 'N/A',
                    ],
                  ]}
                />

                <Section
                  title="Other Information"
                  cls="table-success"
                  items={[
                    ['Extra Curricular', other.extraCurricular],
                    ['Achievements', other.achievements],
                    ['Hobbies', other.hobbies],
                    ['Additional Notes', other.additionalNotes],
                  ]}
                />

                <Section
                  title="Account Information"
                  cls="table-secondary"
                  items={[
                    ['Email Verified', yesNo(student.isEmailVerified)],
                    ['Profile Complete', yesNo(student.isProfileComplete)],
                    ['Last Step Completed', student.lastStepCompleted],
                    ['Completed Steps', (student.completedSteps || []).join(', ')],
                    ['Last Login', formatDate(student.lastLogin, true)],
                    ['Account Active', student?.user?.isActive === undefined ? 'N/A' : yesNo(student.user.isActive)],
                    ['Created At', formatDate(student.createdAt)],
                    ['Updated At', formatDate(student.updatedAt)],
                  ]}
                />
              </MDBTableBody>
            </MDBTable>

            {/* Education */}
            <h5 className="text-primary fw-bold mt-4 mb-3">Education</h5>
            <MDBTable bordered hover responsive className="align-middle">
              <MDBTableHead>
                <tr className="table-primary">
                  <th>Level</th>
                  <th>Qualification</th>
                  <th>Institution</th>
                  <th>Board / University</th>
                  <th>Passing Year</th>
                  <th>Roll No</th>
                  <th>Marks</th>
                  <th>%</th>
                  <th>Marksheet</th>
                </tr>
              </MDBTableHead>
              <MDBTableBody>
                {education.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center text-muted">No education records</td>
                  </tr>
                ) : (
                  education.map((edu, idx) => (
                    <tr key={idx}>
                      <td>{val(edu.degreeLevel)}</td>
                      <td>{val(edu.qualification)}</td>
                      <td>{val(edu.institution)}</td>
                      <td>{val(edu.boardUni)}</td>
                      <td>{val(edu.passingYear)}</td>
                      <td>{val(edu.rollNo)}</td>
                      <td>{edu.totalMarks ? `${edu.obtainMarks} / ${edu.totalMarks}` : 'N/A'}</td>
                      <td>{val(edu.percentage)}</td>
                      <td>
                        {edu.markSheet?.url ? (
                          <a href={edu.markSheet.url} target="_blank" rel="noreferrer">View</a>
                        ) : 'N/A'}
                      </td>
                    </tr>
                  ))
                )}
              </MDBTableBody>
            </MDBTable>
          </MDBCardBody>
        </MDBCard>
      </MDBContainer>
    </div>
  );
};

export default StudentView;