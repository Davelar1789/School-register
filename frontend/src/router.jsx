import { createBrowserRouter } from "react-router-dom";
import HomePage from "./pages/general/homepage/HomePage";
import Admission from "./pages/general/admission/Admission";
import ApplyT from "./pages/general/admission/ApplyTeacher";
import ApplyS from "./pages/general/admission/ApplyStudent";
import Dashboard from "./pages/admin2/dashboard/Dashboard";
import Events from "./pages/admin2/events/Events";
import Fees from "./pages/admin2/fees/Fees";
import Cashbook from "./pages/admin2/cashbook/Cashbook";
import TermlyDetails from "./pages/admin2/termlydetails/TermlyDetails";
import TDashboard from "./pages/teacher/dashboard/Dashboard";
import TManageStudents from "./pages/teacher/manage_students/ManageStudents";
import TEditGrades from "./pages/teacher/manage_students/EditGrades";
import TAttendance from "./pages/teacher/attendance/Attendance";
import TReportCard from "./pages/teacher/manage_students/ReportCard";
import TGradeBook from "./pages/teacher/manage_students/Gradebook";
import SignUp from "./pages/general/user/Sign-up";
import Products from "./pages/AllProducts";
import Inbox from "./pages/admin/inbox/Inbox";
import Settings from "./pages/admin2/setting/Settings";
import ProductDisplay from "./pages/ProductDisplay";
import OrderLists from "./pages/admin2/reportcard/ReportCard";
import Table from "./pages/admin/table/Table";
import TeamForm from "./pages/admin2/stuff/TeamForm";
import Cart from "./pages/client/cart/CartPage";
import Checkout from "./pages/client/checkout/Checkout";
import ContactUs from "./components/ContactUs";
import Contact from "./pages/admin2/contact/Contact";
import Invoice from "./pages/admin2/invoice/Invoice";
import App from "./App";
import Calendar from "./pages/admin2/calendar/Calendar";
import Admin from "./pages/admin2/Admin";
import Teacher from "./pages/teacher/Teacher";
import TopSellers from "./pages/admin2/top_sellers/TopSellers";
import SignIn from "./pages/general/login/Sign-in";
import AllProducts from "./pages/AllProducts";
import Stuff from "./pages/admin2/stuff/Stuff";
import ErrorBoundary from "./components/ErrorBoundary";
import NotFound from "./components/NotFound";
import ManageTeachers from "./pages/admin2/manage_teachers/ManageTeachers";
import ManageStudents from "./pages/admin2/manage_students/ManageStudents";
import Welcome from "./pages/head/dashboard/Dashboard";



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
        element: <Welcome />,
      },
      {
        path: "sign-up",
        element: <SignUp />,
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
        path: "cart",
        element: <Cart />,
      },
      {
        path: "checkout",
        element: <Checkout />,
      },
      {
        path: "products",
        element: <Products />,
      },
      {
        path: "product/:id",
        element: <ProductDisplay />,
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
  // Admin Routes
  {
    path: "/admin",
    element: (
      <ErrorBoundary>
        <Admin />
      </ErrorBoundary>
    ),
    children: [
      {
        path: "",
        element: <Dashboard />,
      },
      {
        path: "all-products",
        element: <AllProducts />,
      },
      {
        path: "top-sellers",
        element: <TopSellers />,
      },
      {
        path: "inbox",
        element: <Inbox />,
      },
      {
        path: "order-lists",
        element: <OrderLists />,
      },
      {
        path: "manage-teachers",
        element: <ManageTeachers />,
      },
      {
        path: "manage-students",
        element: <ManageStudents />,
      },
      {
        path: "calendar",
        element: <Calendar />,
      },
      {
        path: "contact",
        element: <Contact />,
      },
      {
        path: "invoice",
        element: <Invoice />,
      },
      {
        path: "events",
        element: <Events />,
      },
      {
        path: "stuff",
        element: <Stuff />,
      },
      {
        path: "fees",
        element: <Fees />,
      },
      {
        path: "cashbook",
        element: <Cashbook />,
      },
      {
        path: "termly-details",
        element: <TermlyDetails />,
      },
      {
        path: "table",
        element: <Table />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
  {
    path: "/teacher",
    element: (
      <ErrorBoundary>
        <Teacher />
      </ErrorBoundary>
    ),
    children: [
      {
        path: "",
        element: <TDashboard />,
      },
      {
        path: "manage-students",
        element: <TManageStudents />,
      },
      {
        path: "grade-book",
        element: <TGradeBook />,
      },
      {
        path: "edit-grades",
        element: <TEditGrades />,
      },
      {
        path: "report-card",
        element: <TReportCard />,
      },
      {
        path: "attendance",
        element: <TAttendance />,
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);

export default router;
