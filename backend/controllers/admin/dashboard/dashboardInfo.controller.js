import Teachers from "../../../models/Teacher.model.js";
import Students from "../../../models/Student.model.js";
import User from "../../../models/User.model.js";

export const dashboardInfo = async (req, res, next) => {
  try {
    const totalUsers = (await User.find()).length;

    const totalTeachers = (await Teachers.find()).length;

    const totalStudents = (await Students.find()).length;


    const dashboardInfo = {
      totalUsers,
      totalTeachers,
      totalStudents,
    };


    return res
      .status(200)
      .json({ data: dashboardInfo, message: "Data Retrieved" });
  } catch (error) {
    console.error("Error fetching dashboard info:", error);
    next(error);
  }
};
