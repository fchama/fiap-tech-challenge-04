const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * Cria um model de usuário (professor ou aluno) com senha criptografada.
 * `extraFields` permite campos específicos de cada tipo.
 */
const createUserModel = (modelName, role, extraFields = {}) => {
  const schema = new mongoose.Schema(
    {
      name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters'],
      },
      email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true,
        unique: true,
        match: [/^\S+@\S+\.\S+$/, 'Email is invalid'],
      },
      password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must have at least 6 characters'],
        select: false,
      },
      ...extraFields,
    },
    {
      timestamps: true,
      versionKey: false,
      toJSON: {
        transform: (doc, ret) => {
          delete ret.password;
          ret.role = role;
          return ret;
        },
      },
    }
  );

  schema.pre('save', async function hashPassword() {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10);
  });

  schema.methods.comparePassword = function comparePassword(plain) {
    return bcrypt.compare(plain, this.password);
  };

  schema.statics.role = role;

  return mongoose.model(modelName, schema);
};

module.exports = createUserModel;
