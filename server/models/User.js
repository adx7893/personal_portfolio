import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

const SALT_ROUNDS = 12;

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required.'],
      default: '',
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required.'],
      default: '',
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required.'],
      default: '',
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required.'],
      default: '',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  }
);

userSchema.pre('save', async function saveHash() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
});

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toSafeObject = function toSafeObject() {
  const fullName = `${this.firstName} ${this.lastName}`.trim();
  return {
    id: this._id.toString(),
    firstName: this.firstName,
    lastName: this.lastName,
    fullName,
    name: fullName,
    email: this.email,
  };
};

const User = mongoose.models.User || mongoose.model('User', userSchema);

export { User };
