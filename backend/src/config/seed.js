const Teacher = require('../models/Teacher');

/** Garante que exista ao menos um professor para o primeiro login. */
const seedTeacher = async () => {
  const count = await Teacher.countDocuments();
  if (count > 0) return;

  const name = process.env.SEED_TEACHER_NAME || 'Administrador';
  const email = process.env.SEED_TEACHER_EMAIL || 'admin@blog.com';
  const password = process.env.SEED_TEACHER_PASSWORD || 'admin123';

  await Teacher.create({ name, email, password, subject: 'Coordenação' });
  console.log(`Professor inicial criado: ${email}`);
};

module.exports = { seedTeacher };
