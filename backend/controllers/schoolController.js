import School from "../models/School.model.js";

// Register a school
export const registerSchool = async (req, res) => {
  try {
    const { name, headmaster, email, phone, address, city, state, country, website, establishedYear, numberOfStudents } = req.body;

    // Check if the school already exists
    const existingSchool = await School.findOne({ email });
    if (existingSchool) {
      return res.status(400).json({ message: "School already registered" });
    }

    // Create new school
    const school = new School({
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
    });

    await school.save();
    res.status(201).json({ message: "School registered successfully", school });
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
