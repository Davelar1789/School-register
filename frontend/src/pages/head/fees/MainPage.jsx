import { Wallet, Utensils } from "lucide-react";
import HubPage from "../../../components/ui/HubPage";

const Fees = () => (
  <HubPage
    title="Fees"
    subtitle="Record and review what students have paid."
    items={[
      { to: "/school-fees", label: "School Fees", text: "Manage and view all academic fee payments.", icon: Wallet, tone: "teal" },
      { to: "/feeding-fee", label: "Feeding Fee", text: "Track and manage students' meal payments.", icon: Utensils, tone: "amber" },
    ]}
  />
);

export default Fees;
