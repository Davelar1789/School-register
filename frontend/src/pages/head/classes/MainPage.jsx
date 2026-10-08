import { School, BookOpen } from "lucide-react";
import HubPage from "../../../components/ui/HubPage";

const ClassesMain = () => (
  <HubPage
    title="Classes & Subjects"
    subtitle="Organise how your school is structured."
    items={[
      { to: "/classes", label: "Classes", text: "Create classes, assign class teachers and students.", icon: School, tone: "teal" },
      { to: "/subjects", label: "Subjects", text: "Define subjects, assign teachers and edit topics.", icon: BookOpen, tone: "blue" },
    ]}
  />
);

export default ClassesMain;
