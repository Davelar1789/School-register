// utils/resolveSchool.js
import School from '../models/School.model.js';
import Teacher from '../models/Teacher.model.js';

/**
 * Resolves the school for a given user (Admin or Teacher)
 * @param {Object} user - The authenticated user from req.user
 * @returns {Promise<Object|null>} - The school document or null
 */
export const resolveSchoolFromUser = async (user) => {
  try {
    if (!user) {
      console.error('❌ No user provided to resolveSchoolFromUser');
      return null;
    }

    console.log('🔍 Resolving school for user:', {
      id: user._id,
      role: user.role,
      email: user.email
    });

    // Handle Admin/SuperAdmin users
    if (user.role === 'admin' || user.role === 'superadmin') {
      const school = await School.findOne({ user: user._id });
      
      if (!school) {
        console.error('❌ No school found for admin user:', user._id);
        return null;
      }
      
      console.log('✅ School found for admin:', school._id);
      return school;
    }

    // Handle Teacher users
    if (user.role === 'Teacher') {
      // The user object IS the teacher document (since protect middleware fetches Teacher by ID)
      // So user.school should already be available
      if (user.school) {
        console.log('✅ School field found in teacher:', user.school);
        
        // If school is already populated (an object), return it
        if (typeof user.school === 'object' && user.school._id) {
          console.log('✅ School is already populated');
          return user.school;
        }
        
        // If school is just an ID, fetch the full school document
        console.log('🔍 Fetching school by ID:', user.school);
        const school = await School.findById(user.school);
        
        if (!school) {
          console.error('❌ School not found by ID:', user.school);
          return null;
        }
        
        console.log('✅ School fetched successfully:', school._id);
        return school;
      }

      // If somehow school is not in the user object, try fetching fresh
      console.log('⚠️ School not in user object, fetching teacher document');
      const teacher = await Teacher.findById(user._id);
      
      if (!teacher) {
        console.error('❌ Teacher document not found:', user._id);
        return null;
      }

      if (!teacher.school) {
        console.error('❌ No school assigned to teacher:', user._id);
        return null;
      }

      console.log('✅ School found from fresh teacher fetch:', teacher.school);
      const school = await School.findById(teacher.school);
      return school;
    }

    // Unknown role
    console.error('❌ Unknown user role:', user.role);
    return null;

  } catch (error) {
    console.error('❌ Error in resolveSchoolFromUser:', error);
    return null;
  }
};