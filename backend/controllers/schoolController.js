import School from "../models/School.model.js";
import User from "../models/User.model.js"; // Ensure this is correct


// Register a school
export const registerSchool = async (req, res) => {
  try {
    console.log("📌 Received Request to Register School");
    
    // ✅ Check if user is authenticated
    if (!req.user || !req.user._id) {
      console.error("❌ Error: Unauthorized - No User Found in Request");
      return res.status(401).json({ message: "Unauthorized - User not found" });
    }

    console.log("✅ Authenticated User ID:", req.user._id);

    // ✅ Log Incoming Request Data
    console.log("📌 Request Body:", req.body);

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

    // ✅ Check if a school with this email already exists
    const existingSchool = await School.findOne({ email });
    if (existingSchool) {
      console.error("❌ Error: School already exists with email:", email);
      return res.status(400).json({ message: "School already registered" });
    }

    console.log("✅ No existing school found. Proceeding with registration...");

    // ✅ Create new school
    const school = new School({
      user: req.user._id, // Assign school to logged-in user
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

    console.log("📌 New School Object Created:", school);

    // ✅ Save the new school to the database
    await school.save();
    console.log("✅ School Registered Successfully:", school);

    // ✅ Update User Model with School ID
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id, 
      { $set: { schoolId: school._id } }, 
      { new: true, runValidators: true }
    );

    console.log("✅ User Updated with School ID:", updatedUser);

    // ✅ Send success response
    res.status(201).json({ 
      message: "School registered successfully", 
      school, 
      user: updatedUser // Send updated user data
    });

  } catch (error) {
    console.error("❌ Server Error in registerSchool:", error); // ✅ Log Full Error Stack
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};


export const getSchoolByUserId = async (req, res) => {
  try {
    const school = await School.findOne({ user: req.params.userId });

    if (!school) {
      return res.status(404).json({ message: "No school found for this user" });
    }

    res.status(200).json({ school });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




// Get all schools
export const getAllSchools = async (req, res) => {
  try {
    const schools = await School.find();
    res.status(200).json(schools);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single school by ID
export const getSchoolById = async (req, res) => {
  try {
    const school = await School.findById(req.params.id);
    if (!school) {
      return res.status(404).json({ message: "School not found" });
    }
    res.status(200).json(school);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a school
export const updateSchool = async (req, res) => {
  try {
    const school = await School.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!school) {
      return res.status(404).json({ message: "School not found" });
    }
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

