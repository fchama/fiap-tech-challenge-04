const express = require('express');
const cors = require('cors');
const postRoutes = require('./routes/postRoutes');
const authRoutes = require('./routes/authRoutes');
const createUserRoutes = require('./routes/createUserRoutes');
const createUserController = require('./controllers/createUserController');
const Teacher = require('./models/Teacher');
const Student = require('./models/Student');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
  });
});

app.use('/auth', authRoutes);
app.use('/posts', postRoutes);
app.use('/teachers', createUserRoutes(createUserController(Teacher, 'Teacher', ['subject'])));
app.use('/students', createUserRoutes(createUserController(Student, 'Student', ['grade'])));

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

app.use(errorHandler);

module.exports = app;
