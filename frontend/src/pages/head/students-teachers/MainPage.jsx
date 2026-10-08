import { GraduationCap, Presentation } from "lucide-react";
import HubPage from "../../../components/ui/HubPage";

const StudentsTeachers = () => (
  <HubPage
    title="Students & Teachers"
    subtitle="Everyone who learns and teaches at your school."
    items={[
      { to: "/students", label: "Students", text: "Admissions, profiles, promotion and records.", icon: GraduationCap, tone: "teal" },
      { to: "/teachers", label: "Teachers", text: "Staff accounts, assignments and status.", icon: Presentation, tone: "purple" },
    ]}
  />
);

export default StudentsTeachers;
