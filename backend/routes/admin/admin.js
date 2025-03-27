import { Router } from "express";
import { addTeachers } from "../../controllers/admin/manage_products/addProduct.js";
import { addStudents } from "../../controllers/admin/manage_students/addStudent.js";
import { dashboardInfo } from "../../controllers/admin/dashboard/dashboardInfo.controller.js";
import { authToken } from "../../middleware/authToken.js";
import { stuff } from "../../controllers/admin/stuff/stuff.controller.js";
import { deleteTeacher } from "../../controllers/admin/manage_products/deleteProduct.js";
import { editTeacher } from "../../controllers/admin/manage_products/editProduct.js";
import { deleteStudent } from "../../controllers/admin/manage_students/deleteStudent.js";
import { editStudent } from "../../controllers/admin/manage_students/editStudent.js";
import { addStuff } from "../../controllers/admin/stuff/addStuff.js";
import { totalUsers } from "../../controllers/admin/dashboard/totalUsers.controller.js";

const route = Router();

route.post("/manage-teachers/add", addTeachers);
route.post("/manage-teachers/delete", deleteTeacher);
route.put("/manage-teachers/edit", editTeacher);
route.post("/manage-students/add", addStudents);
route.post("/manage-students/delete", deleteStudent);
route.put("/manage-students/edit", editStudent);
route.get("/get-dashboard-info", dashboardInfo);
route.get("/stuff/view-members", stuff);
route.put("/stuff/add-member", addStuff);
route.get("/get-all-users", totalUsers);

export default route;
