const createUserModel = require('./createUserModel');

module.exports = createUserModel('Teacher', 'teacher', {
  subject: {
    type: String,
    trim: true,
    maxlength: [100, 'Subject cannot exceed 100 characters'],
  },
});
