import Teachers from "../../../models/Teacher.model.js";
import Students from "../../../models/Student.model.js";
import User from "../../../models/User.model.js";

export const dashboardInfo = async (req, res, next) => {
  try {
    const totalUsers = (await User.find()).length;
    const totalTeachers = (await Teachers.find()).length;
    const totalStudents = (await Students.find()).length;
    const totalSales = 0;
    const pendingOrders = 0;

    const dashboardInfo = {
      totalUsers,
      totalTeachers,
      totalStudents,
      totalSales,
      pendingOrders,
    };
    return res
      .status(200)
      .json({ data: dashboardInfo, message: "Data Retrieved" });
  } catch (error) {
    next(error);
  }
};
