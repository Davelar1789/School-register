export const resolveSchoolFromUser = async (user) => {
  console.log('🔍 Resolving school for user:', user?._id);

  // 1️⃣ School owner
  const ownedSchool = await School.findOne({ user: user._id });
  console.log('🏠 Owned school:', ownedSchool?._id || null);

  if (ownedSchool) return ownedSchool;

  // 2️⃣ Teacher
  const teacher = await Teacher.findOne({ user: user._id }).populate('school');
  console.log('👨‍🏫 Teacher record:', teacher?._id || null);
  console.log('🏫 Teacher school:', teacher?.school || null);

  if (teacher?.school) return teacher.school;

  console.warn('❌ No school resolved for user:', user._id);
  return null;
};
