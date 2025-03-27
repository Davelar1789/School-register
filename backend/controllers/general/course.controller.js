import Course from '../../models/Course.model.js';

// Add a new course
export const addCourse = async (req, res) => {
  try {
    const { title, description, courseCode } = req.body;

    // Check if the course code already exists
    const existingCourse = await Course.findOne({ courseCode });
    if (existingCourse) {
      return res.status(400).json({ message: 'Course code already exists' });
    }

    const course = new Course({
      title,
      description,
      courseCode,
    });
    await course.save();
    res.status(201).json({ message: 'Course added successfully!', course });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add course', error });
  }
};

// Get all courses
export const getCourses = async (req, res) => {
  try {
    const courses = await Course.find();
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch courses', error });
  }
};

// Get a specific course by ID
export const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.status(200).json(course);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch course', error });
  }
};

// Get a specific course by ID with materials and tests
export const getCourseById2 = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findById(id).populate('materials tests');
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.status(200).json(course);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch course', error });
  }
};

// Update a course by ID
export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, courseCode } = req.body;

    // Ensure the updated course code is unique
    const existingCourse = await Course.findOne({ courseCode, _id: { $ne: id } });
    if (existingCourse) {
      return res.status(400).json({ message: 'Course code already exists' });
    }

    const course = await Course.findByIdAndUpdate(
      id,
      { title, description, courseCode },
      { new: true }
    );
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.status(200).json({ message: 'Course updated successfully', course });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update course', error });
  }
};

// Delete a course by ID
export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findByIdAndDelete(id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.status(200).json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete course', error });
  }
};


// Add materials to a course
export const addMaterialToCourse = async (req, res) => {
  try {
    const { id } = req.params; // Course ID
    const { material } = req.body; // Material (URL or file path)

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    course.materials.push(material);
    await course.save();
    res.status(200).json({ message: 'Material added successfully', course });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add material', error });
  }
};

// Add a test to a course
export const addTestToCourse = async (req, res) => {
  try {
    const { id } = req.params; // Course ID
    const { title, questions } = req.body; // Test title and questions array

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const newTest = { title, questions };
    course.tests.push(newTest);
    await course.save();
    res.status(200).json({ message: 'Test added successfully', course });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add test', error });
  }
};
