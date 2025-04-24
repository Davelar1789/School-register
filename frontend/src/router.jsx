import { createBrowserRouter } from "react-router-dom";
import HomePage from "./pages/general/homepage/HomePage";
import Admission from "./pages/general/admission/Admission";
import ApplyT from "./pages/general/admission/ApplyTeacher";
import ApplyS from "./pages/general/admission/ApplyStudent";
import Students from "./pages/head/students/Students"
// import Dashboard from "./pages/admin2/dashboard/Dashboard";
// import Events from "./pages/admin2/events/Events";
// import Fees from "./pages/admin2/fees/Fees";
// import Cashbook from "./pages/admin2/cashbook/Cashbook";
// import TermlyDetails from "./pages/admin2/termlydetails/TermlyDetails";
// import TDashboard from "./pages/teacher/dashboard/Dashboard";
// import TManageStudents from "./pages/teacher/manage_students/ManageStudents";
// import TEditGrades from "./pages/teacher/manage_students/EditGrades";
// import TAttendance from "./pages/teacher/attendance/Attendance";
// import TReportCard from "./pages/teacher/manage_students/ReportCard";
// import TGradeBook from "./pages/teacher/manage_students/Gradebook";
import SignUp from "./pages/general/user/Sign-up";
// import Inbox from "./pages/admin/inbox/Inbox";
// import Settings from "./pages/admin2/setting/Settings";
// import OrderLists from "./pages/admin2/reportcard/ReportCard";
// import Table from "./pages/admin/table/Table";
// import TeamForm from "./pages/admin2/stuff/TeamForm";
// import Cart from "./pages/client/cart/CartPage";
// import Checkout from "./pages/client/checkout/Checkout";
// import Contact from "./pages/admin2/contact/Contact";
// import Invoice from "./pages/admin2/invoice/Invoice";
import App from "./App";
// import Calendar from "./pages/admin2/calendar/Calendar";
// import Admin from "./pages/admin2/Admin";
// import Teacher from "./pages/teacher/Teacher";
// import TopSellers from "./pages/admin2/top_sellers/TopSellers";
import SignIn from "./pages/general/login/Sign-in";
// import Stuff from "./pages/admin2/stuff/Stuff";
import ErrorBoundary from "./components/ErrorBoundary";
import NotFound from "./components/NotFound";
// import ManageTeachers from "./pages/admin2/manage_teachers/ManageTeachers";
// import ManageStudents from "./pages/admin2/manage_students/ManageStudents";
import Welcome from "./pages/head/dashboard/Dashboard";
import SuperDashboard from "./pages/superadmin/dashboard/SuperAdmin";
import SuperAdmin from "./pages/superadmin/SuperAdmin";
import Trial from "./pages/head/page2/Trial";
import Teachers from "./pages/head/teachers/Teachers";
import TeacherLogin from "./pages/general/login/TeacherLogin";
import Welcome2 from "./pages/teacher/dashboard/Dashboard";
import Classes from "./pages/head/classes/Class";
import TeacherDetails from "./pages/head/teachers/TeacherDetails";
import TeacherClasses from "./pages/teacher/classes/Classes";
import ClassDetails from "./pages/teacher/classes/ClassDetails";
import ProtectedRoute from "./components/ProtectedRoute"; // adjust path accordingly



const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    ),
    children: [
      {
        path: "",
        element: <HomePage />,
      },
      {
        path: "dashboard",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <Welcome />
          </ProtectedRoute>
        ),
      },
      {
        path: "teacher-dashboard",
        element: <Welcome2 />,
      },
      {
        path: "students",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <Students />
          </ProtectedRoute>
        ),
      },
      {
        path: "teachers",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <Teachers />
          </ProtectedRoute>
        ),
      },
      {
        path: "my-classes",
        element: <TeacherClasses />,
      },
      {
        path: "/class/:id",
        element: <ClassDetails />,
      },
      {
        path: "/teachers/:id",
        element: <TeacherDetails />,
      },
      {
        path: "classes",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <Classes />
          </ProtectedRoute>
        ),
      },
      {
        path: "sign-up",
        element: <SignUp />,
      },
      {
        path: "teacher-login",
        element: <TeacherLogin />,
      },
      {
        path: "admission",
        element: <Admission />,
      },
      {
        path: "apply-teacher",
        element: <ApplyT />,
      },
      {
        path: "apply-student",
        element: <ApplyS />,
      },
      {
        path: "sign-in",
        element: <SignIn />,
      },
      {
        path: "trial",
        element: <Trial />,
      },
      // {
      //   path: "cart",
      //   element: <Cart />,
      // },
      // {
      //   path: "checkout",
      //   element: <Checkout />,
      // },
      
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
  // Admin Routes
  {
    path: "/superadmin",
    element: (
      <ErrorBoundary>
        <SuperAdmin />
      </ErrorBoundary>
    ),
    children: [
      {
        path: "",
        element: <SuperDashboard />,
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
  // {
  //   path: "/teacher",
  //   element: (
  //     <ErrorBoundary>
  //       <Teacher />
  //     </ErrorBoundary>
  //   ),
  //   children: [
  //     // {
  //     //   path: "",
  //     //   element: <TDashboard />,
  //     // },
  //     // {
  //     //   path: "manage-students",
  //     //   element: <TManageStudents />,
  //     // },
  //     // {
  //     //   path: "grade-book",
  //     //   element: <TGradeBook />,
  //     // },
  //     // {
  //     //   path: "edit-grades",
  //     //   element: <TEditGrades />,
  //     // },
  //     // {
  //     //   path: "report-card",
  //     //   element: <TReportCard />,
  //     // },
  //     // {
  //     //   path: "attendance",
  //     //   element: <TAttendance />,
  //     // },
  //     {
  //       path: "*",
  //       element: <NotFound />,
  //     },
  //   ],
  // },
]);

export default router;
