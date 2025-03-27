import School from "../models/School.model.js";

// Register a school
export const registerSchool = async (req, res) => {
  try {
    console.log("📩 Incoming Request to Register School");
    console.log("Request Body:", req.body); // Log the received data

    const { name, headmaster, email, phone, address, city, state, country, website, establishedYear, numberOfStudents } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !address || !headmaster) {
      console.log("⚠️ Missing required fields!");
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    // Check if the school already exists
    const existingSchool = await School.findOne({ email });
    if (existingSchool) {
      console.log("⛔ School already exists:", existingSchool);
      return res.status(400).json({ message: "School already registered" });
    }

    // Create new school
    const school = new School({
      name,
      headmaster,
      email,
      phone,
      address,
      city: city || "N/A",  // Provide default values if missing
      state: state || "N/A",
      country: country || "N/A",
      website: website || "N/A",
      establishedYear: establishedYear || "N/A",
      numberOfStudents: numberOfStudents || 0,
    });

    console.log("✅ Saving new school:", school);

    await school.save();

    console.log("🎉 School Registered Successfully!");
    res.status(201).json({ message: "School registered successfully", school });

  } catch (error) {
    console.log("❌ Error Registering School:", error.message);
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
