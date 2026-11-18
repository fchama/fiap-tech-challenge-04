require('dotenv').config();

const app = require('./app');
const { connectDatabase } = require('./config/database');
const { seedTeacher } = require('./config/seed');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDatabase();
    await seedTeacher();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
