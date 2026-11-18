const createUserModel = require('./createUserModel');

module.exports = createUserModel('Student', 'student', {
  grade: {
    type: String,
    trim: true,
    maxlength: [100, 'Grade cannot exceed 100 characters'],
  },
});
