import School from "../models/School.model.js";
import User from "../models/User.model.js"; // Ensure this is correct


// Register a school
export const registerSchool = async (req, res) => {
  try {
    // ✅ Destructure incoming request
    const {
      name,
      headmaster,
      email,
      phone,
      address,
      city,
      state,
      country,
      website,
      establishedYear,
      numberOfStudents,
      numberOfTeachers,
      numberOfClasses,
    } = req.body;

    // ✅ Check if school already exists
    const existingSchool = await School.findOne({ email });
    if (existingSchool) {
      return res.status(400).json({ message: "School already registered" });
    }

    // ✅ Find user by email (this is the admin who should manage this school)
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "Admin user with this email not found" });
    }

    // ✅ Create new school, linking to the admin user
    const school = new School({
      user: user._id, // link the school to the admin user, not superadmin
      name,
      headmaster,
      email,
      phone,
      address,
      city,
      state,
      country,
      website,
      establishedYear,
      numberOfStudents,
      numberOfTeachers,
      numberOfClasses,
    });

    await school.save(); // Save the school first

    // ✅ Update the user with the school's ID
    user.schoolId = school._id;
    await user.save();

    // ✅ Send success response
    res.status(201).json({ 
      message: "School registered and admin updated successfully", 
      school,
      user
    });

  } catch (error) {
    console.error("❌ Server Error in registerSchool:", error);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};



export const getSchoolByUserId = async (req, res) => {
  try {
    const isOwner = String(req.user?._id) === String(req.params.userId);
    if (!isOwner && req.user?.role !== "superadmin") {
      return res.status(403).json({ message: "You can only view your own school." });
    }
    const school = await School.findOne({ user: req.params.userId });

    if (!school) {
      return res.status(404).json({ message: "No school found for this user" });
    }

    res.status(200).json({ school });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




// Get all schools (platform-wide — super admins only)
export const getAllSchools = async (req, res) => {
  try {
    if (req.user?.role !== "superadmin") {
      return res.status(403).json({ message: "Access denied. SuperAdmin only." });
    }
    const schools = await School.find();
    res.status(200).json(schools);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single school by ID
const canAccessSchool = (req, school) =>
  req.user?.role === "superadmin" ||
  String(school.user) === String(req.user?._id) ||
  String(req.user?.schoolId || req.user?.school) === String(school._id);

export const getSchoolById = async (req, res) => {
  try {
    const school = await School.findById(req.params.id);
    if (!school) {
      return res.status(404).json({ message: "School not found" });
    }
    if (!canAccessSchool(req, school)) {
      return res.status(403).json({ message: "You can't view another school." });
    }
    res.status(200).json(school);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a school
const EDITABLE_SCHOOL_FIELDS = ["name", "headmaster", "phone", "address", "city", "state", "country", "website", "establishedYear"];

export const updateSchool = async (req, res) => {
  try {
    const existing = await School.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: "School not found" });
    }
    if (!canAccessSchool(req, existing)) {
      return res.status(403).json({ message: "You can't edit another school." });
    }

    // Whitelist: status, owner and counters are never client-controlled
    const updates = {};
    EDITABLE_SCHOOL_FIELDS.forEach((k) => {
      if (req.body[k] !== undefined) updates[k] = typeof req.body[k] === "string" ? req.body[k].trim() : req.body[k];
    });
    if (updates.name === "" || updates.headmaster === "") {
      return res.status(400).json({ message: "School name and head of school are required." });
    }

    const school = await School.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    res.status(200).json({ message: "School updated successfully", school });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a school
export const deleteSchool = async (req, res) => {
  try {
    const school = await School.findByIdAndDelete(req.params.id);
    if (!school) {
      return res.status(404).json({ message: "School not found" });
    }
    res.status(200).json({ message: "School deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get pending schools (status = "pending")
export const getPendingSchools = async (req, res) => {
  try {
    const pendingSchools = await School.find({ status: "pending" });
    res.json(pendingSchools);
  } catch (error) {
    res.status(500).json({ message: "Error fetching pending schools." });
  }
};

// Get approved schools (status = "approved")
export const getApprovedSchools = async (req, res) => {
  try {
    const approvedSchools = await School.find({ status: "approved" });
    res.json(approvedSchools);
  } catch (error) {
    res.status(500).json({ message: "Error fetching approved schools." });
  }
};

// Approve a school (update status to "approved")
export const approveSchool = async (req, res) => {
  try {
    const school = await School.findById(req.params.id);
    if (!school) {
      return res.status(404).json({ message: "School not found." });
    }

    school.status = "approved";
    await school.save();

    res.json({ message: "School approved successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Error approving school." });
  }
};

// Reject a school (delete from database)
export const rejectSchool = async (req, res) => {
  try {
    const school = await School.findById(req.params.id);
    if (!school) {
      return res.status(404).json({ message: "School not found." });
    }

    await school.deleteOne();

    res.json({ message: "School rejected and removed." });
  } catch (error) {
    res.status(500).json({ message: "Error rejecting school." });
  }
};

