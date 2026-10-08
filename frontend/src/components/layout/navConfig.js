import {
  LayoutDashboard, Users, School, CalendarCheck, Wallet, ReceiptText, BookOpenCheck,
  TrendingUp, FileBarChart, FileSignature, Bell, Settings, BookOpen, ClipboardCheck,
  GraduationCap, Library, Building2, UserPlus, Layers, CalendarDays,
} from "lucide-react";

/**
 * `match` lists extra path prefixes that should keep a nav item highlighted
 * (detail pages, sub pages).  `title` is used by the top bar.
 */
export const NAV = {
  admin: {
    home: "/dashboard",
    sections: [
      { label: "Overview", items: [
        { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, title: "Dashboard" },
      ]},
      { label: "People", items: [
        { to: "/students-teachers", label: "Students & Teachers", icon: Users, title: "Students & Teachers",
          match: ["/students", "/teachers", "/student/"] },
        { to: "/classes-main", label: "Classes & Subjects", icon: School, title: "Classes & Subjects",
          match: ["/classes", "/subjects"] },
        { to: "/view-attendance", label: "Attendance", icon: CalendarCheck, title: "Attendance" },
      ]},
      { label: "Finance", items: [
        { to: "/fees", label: "Fees", icon: Wallet, title: "Fees", match: ["/school-fees", "/feeding-fee"] },
        { to: "/termly-details", label: "Termly Details", icon: CalendarDays, title: "Termly Details" },
        { to: "/expenses", label: "Accounts", icon: ReceiptText, title: "Accounts & Expenses" },
        { to: "/income", label: "Income Statement", icon: TrendingUp, title: "Income Statement" },
      ]},
      { label: "Academics", items: [
        { to: "/view-reports", label: "Report Cards", icon: FileBarChart, title: "Report Cards",
          match: ["/view-reports2", "/upload-report"] },
        { to: "/exam", label: "Exam Generator", icon: BookOpenCheck, title: "Exam Generator" },
        { to: "/upload-scheme", label: "Marking Schemes", icon: FileSignature, title: "Marking Schemes" },
      ]},
      { label: "Account", items: [
        { to: "/notifications", label: "Notifications", icon: Bell, title: "Notifications" },
        { to: "/school-settings", label: "School Settings", icon: Settings, title: "School Settings" },
      ]},
    ],
  },

  teacher: {
    home: "/teacher-dashboard",
    sections: [
      { label: "Teaching", items: [
        { to: "/teacher-dashboard", label: "Dashboard", icon: LayoutDashboard, title: "Dashboard", offline: true },
        { to: "/my-classes", label: "My Classes", icon: Users, title: "My Classes", match: ["/class/"], when: "class" },
        { to: "/my-subjects", label: "My Subjects", icon: BookOpen, title: "My Subjects", when: "subject" },
        { to: "/attendance", label: "Attendance", icon: ClipboardCheck, title: "Attendance", offline: true },
        { to: "/gradebook", label: "Gradebook", icon: GraduationCap, title: "Gradebook" },
        { to: "/curriculum", label: "Curriculum", icon: Library, title: "Curriculum" },
        { to: "/marking-schemes", label: "Marking Schemes", icon: FileSignature, title: "Marking Schemes" },
      ]},
      { label: "Account", items: [
        { to: "/notifications2", label: "Notifications", icon: Bell, title: "Notifications" },
      ]},
    ],
  },

  superadmin: {
    home: "/superadmin",
    sections: [
      { label: "Platform", items: [
        { to: "/superadmin", label: "Dashboard", icon: LayoutDashboard, title: "Platform Overview", end: true },
        { to: "/all-schools", label: "Schools", icon: Building2, title: "All Schools" },
        { to: "/add-school", label: "Add School", icon: Layers, title: "Add School" },
        { to: "/add-admin", label: "Add Admin", icon: UserPlus, title: "Add Administrator" },
      ]},
    ],
  },
};

export const flatNav = (variant) => NAV[variant].sections.flatMap((s) => s.items);

export const isItemActive = (item, pathname) => {
  if (item.end) return pathname === item.to;
  const hit = (p) => pathname === p || pathname.startsWith(p.endsWith("/") ? p : p + "/");
  return hit(item.to) || (item.match || []).some(hit);
};

export const titleFor = (variant, pathname) => {
  const item = flatNav(variant).find((i) => isItemActive(i, pathname));
  return item?.title || "";
};
