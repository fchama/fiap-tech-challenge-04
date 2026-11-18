const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const { signToken } = require('../middlewares/auth');

const models = { teacher: Teacher, student: Student };

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    // Procura primeiro entre professores e depois entre alunos.
    for (const role of ['teacher', 'student']) {
      // eslint-disable-next-line no-await-in-loop
      const user = await models[role].findOne({ email: normalizedEmail }).select('+password');

      // eslint-disable-next-line no-await-in-loop
      if (user && (await user.comparePassword(String(password)))) {
        return res.status(200).json({
          success: true,
          token: signToken(user, role),
          data: user,
        });
      }
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid email or password',
    });
  } catch (error) {
    return next(error);
  }
};

const me = async (req, res, next) => {
  try {
    const user = await models[req.auth.role].findById(req.auth.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists',
      });
    }

    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    return next(error);
  }
};

module.exports = { login, me };
