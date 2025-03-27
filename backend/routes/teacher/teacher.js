import { Router } from "express";
import { addStudents } from "../../controllers/admin copy/manage_students/addStudent.js";
import { dashboardInfo } from "../../controllers/admin copy/dashboard/dashboardInfo.controller.js";
import { authToken } from "../../middleware/authToken.js";
import { stuff } from "../../controllers/admin copy/stuff/stuff.controller.js";
import { deleteStudent } from "../../controllers/admin copy/manage_students/deleteStudent.js";
import { editStudent } from "../../controllers/admin copy/manage_students/editStudent.js";
import { addStuff } from "../../controllers/admin copy/stuff/addStuff.js";
import { totalUsers } from "../../controllers/admin copy/dashboard/totalUsers.controller.js";

const route = Router();

route.post("/manage-students/add", addStudents);
route.post("/manage-students/delete", deleteStudent);
route.put("/manage-students/edit", editStudent);
route.get("/get-dashboard-info", dashboardInfo);
route.get("/stuff/view-members", stuff);
route.put("/stuff/add-member", addStuff);
route.get("/get-all-users", totalUsers);

export default route;
