import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "./App";
import ErrorBoundary from "./components/General/ErrorBoundary";
import NotFound from "./components/General/NotFound";
import ProtectedRoute from "./components/General/ProtectedRoute";
import AppShell from "./components/layout/AppShell";

/* every page is code-split so first paint only downloads what it needs */
const HomePage = lazy(() => import("./pages/general/homepage/HomePage"));
const SignIn = lazy(() => import("./pages/general/login/Sign-in"));
const TeacherLogin = lazy(() => import("./pages/general/login/TeacherLogin"));
const ForgotPassword = lazy(() => import("./pages/general/login/ForgotPassword"));
const SignUp = lazy(() => import("./pages/general/user/Sign-up"));
const Admission = lazy(() => import("./pages/general/admission/Admission"));
const ApplyTeacher = lazy(() => import("./pages/general/admission/ApplyTeacher"));
const ApplyStudent = lazy(() => import("./pages/general/admission/ApplyStudent"));

/* admin */
const AdminDashboard = lazy(() => import("./pages/head/dashboard/Dashboard"));
const StudentsTeachers = lazy(() => import("./pages/head/students-teachers/MainPage"));
const Students = lazy(() => import("./pages/head/students/Students"));
const StudentDetails = lazy(() => import("./pages/head/students/StudentDetails"));
const Teachers = lazy(() => import("./pages/head/teachers/Teachers"));
const TeacherDetails = lazy(() => import("./pages/head/teachers/TeacherDetails"));
const MainClasses = lazy(() => import("./pages/head/classes/MainPage"));
const Classes = lazy(() => import("./pages/head/classes/Class"));
const Subjects = lazy(() => import("./pages/head/classes/Subjects"));
const ClassSubjectsPage = lazy(() => import("./pages/head/classes/ClassSubjectsPage"));
const TopicEditor = lazy(() => import("./pages/head/classes/TopicsEditorPage"));
const TrackAttendance = lazy(() => import("./pages/head/attendance/TrackAttendance"));
const Fees = lazy(() => import("./pages/head/fees/MainPage"));
const SchoolFees = lazy(() => import("./pages/head/schoolfees/SchoolFees"));
const FeedingFee = lazy(() => import("./pages/head/fees/FeedingFee"));
const TermlyDetails = lazy(() => import("./pages/head/fees/TermlyDetails"));
const Expenses = lazy(() => import("./pages/head/expenses/ExpensePage"));
const Income = lazy(() => import("./pages/head/income/Income"));
const UploadReport = lazy(() => import("./pages/head/report/UploadReportTemplates"));
const ReportCards = lazy(() => import("./pages/head/report/ReportCards"));
const ExamGenerator = lazy(() => import("./pages/head/exams/ExamGenerator"));
const AdminMarkingSchemes = lazy(() => import("./pages/head/schemes/AdminMarkingSchemes"));
const AdminNotifications = lazy(() => import("./pages/head/notifications/Notifications"));
const SchoolSettings = lazy(() => import("./pages/head/settings/AdminSettings"));

/* teacher */
const TeacherDashboard = lazy(() => import("./pages/teacher/dashboard/Dashboard"));
const TeacherClasses = lazy(() => import("./pages/teacher/classes/Classes"));
const ClassDetails = lazy(() => import("./pages/teacher/classes/ClassDetails"));
const TeacherSubjects = lazy(() => import("./pages/teacher/mysubjects/MySubjects"));
const Attendance = lazy(() => import("./pages/teacher/attendance/Attendance"));
const Gradebook = lazy(() => import("./pages/teacher/gradebook/Gradebook"));
const Curriculum = lazy(() => import("./pages/teacher/curriculum/curriculum"));
const MarkingSchemes = lazy(() => import("./pages/teacher/schemes/MarkingSchemes"));
const TeacherNotifications = lazy(() => import("./pages/teacher/notifications/Notifications"));

/* super admin */
const SuperDashboard = lazy(() => import("./pages/superadmin/dashboard/SuperAdmin"));
const AllSchools = lazy(() => import("./pages/superadmin/schools/AllSchools"));
const AddSchool = lazy(() => import("./pages/superadmin/schools/AddSchool"));
const AddAdmin = lazy(() => import("./pages/superadmin/addAdmin/addAdmin"));

const PageLoader = () => (
  <div className="loading-block" role="status" aria-live="polite">
    <span className="spinner spinner-lg" /> Loading…
  </div>
);

const s = (el) => <Suspense fallback={<PageLoader />}>{el}</Suspense>;

const ADMIN = ["admin"];
const TEACHER = ["Teacher", "teacher"];
const SUPER = ["superadmin"];

const adminShell = (
  <ProtectedRoute allowedRoles={ADMIN}>
    <AppShell variant="admin" />
  </ProtectedRoute>
);
const teacherShell = (
  <ProtectedRoute allowedRoles={TEACHER}>
    <AppShell variant="teacher" />
  </ProtectedRoute>
);
const superShell = (
  <ProtectedRoute allowedRoles={SUPER}>
    <AppShell variant="superadmin" />
  </ProtectedRoute>
);

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    ),
    children: [
      /* ── public ── */
      { index: true, element: s(<HomePage />) },
      { path: "sign-in", element: s(<SignIn />) },
      { path: "teacher-login", element: s(<TeacherLogin />) },
      { path: "sign-up", element: s(<SignUp />) },
      { path: "forgot-password", element: s(<ForgotPassword />) },
      { path: "admission", element: s(<Admission />) },
      { path: "apply-teacher", element: s(<ApplyTeacher />) },
      { path: "apply-student", element: s(<ApplyStudent />) },

      /* ── school administrator ── */
      {
        element: adminShell,
        children: [
          { path: "dashboard", element: s(<AdminDashboard />) },
          { path: "students-teachers", element: s(<StudentsTeachers />) },
          { path: "students", element: s(<Students />) },
          { path: "student/:id", element: s(<StudentDetails />) },
          { path: "teachers", element: s(<Teachers />) },
          { path: "teachers/:id", element: s(<TeacherDetails />) },
          { path: "classes-main", element: s(<MainClasses />) },
          { path: "classes", element: s(<Classes />) },
          { path: "subjects", element: s(<Subjects />) },
          { path: "classes/:classId/subjects", element: s(<ClassSubjectsPage />) },
          { path: "classes/:classId/subjects/:subjectId/topics", element: s(<TopicEditor />) },
          { path: "view-attendance", element: s(<TrackAttendance />) },
          { path: "fees", element: s(<Fees />) },
          { path: "school-fees", element: s(<SchoolFees />) },
          { path: "feeding-fee", element: s(<FeedingFee />) },
          { path: "termly-details", element: s(<TermlyDetails />) },
          { path: "expenses", element: s(<Expenses />) },
          { path: "income", element: s(<Income />) },
          { path: "upload-report", element: s(<UploadReport />) },
          { path: "view-reports", element: s(<ReportCards />) },
          { path: "view-reports2", element: s(<ReportCards />) },
          { path: "exam", element: s(<ExamGenerator />) },
          { path: "upload-scheme", element: s(<AdminMarkingSchemes />) },
          { path: "notifications", element: s(<AdminNotifications />) },
          { path: "school-settings", element: s(<SchoolSettings />) },
        ],
      },

      /* ── teacher ── */
      {
        element: teacherShell,
        children: [
          { path: "teacher-dashboard", element: s(<TeacherDashboard />) },
          { path: "my-classes", element: s(<TeacherClasses />) },
          { path: "class/:id", element: s(<ClassDetails />) },
          { path: "my-subjects", element: s(<TeacherSubjects />) },
          { path: "attendance", element: s(<Attendance />) },
          { path: "gradebook", element: s(<Gradebook />) },
          { path: "curriculum", element: s(<Curriculum />) },
          { path: "marking-schemes", element: s(<MarkingSchemes />) },
          { path: "notifications2", element: s(<TeacherNotifications />) },
        ],
      },

      /* ── platform super admin ── */
      {
        element: superShell,
        children: [
          { path: "superadmin", element: s(<SuperDashboard />) },
          { path: "all-schools", element: s(<AllSchools />) },
          { path: "add-school", element: s(<AddSchool />) },
          { path: "add-admin", element: s(<AddAdmin />) },
        ],
      },

      /* ── legacy paths ── */
      { path: "teacher-dashboard2", element: <Navigate to="/teacher-dashboard" replace /> },
      { path: "trial", element: <Navigate to="/" replace /> },
      { path: "announcements", element: <Navigate to="/notifications" replace /> },
      { path: "settings", element: <Navigate to="/school-settings" replace /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

export default router;
