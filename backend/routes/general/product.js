import { Router } from "express";
import {
  getAllTeachers,
  getTeacherDetails,
} from "../../controllers/general/products/products.controller.js";

const route = Router();

route.get("/get-all-teachers", getAllTeachers);
route.post("/teacher-details", getTeacherDetails);

export default route;
