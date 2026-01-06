// src/models/User.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const progressSchema = new mongoose.Schema({
  moduleId: { type: mongoose.Schema.Types.ObjectId, ref: "Module" },
  status: { 
    type: String, 
    enum: ["not-started", "in-progress", "completed"], 
    default: "not-started" 
  },
  score: { type: Number, default: 0 }
}, { timestamps: true });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["student", "admin"], default: "student" },

  // Student profile fields
  profileImage: { type: String, default: "" },   // path to image
  mobile: { type: String, default: "" },
  stream: { type: String, enum: ["CS", "IT", "DS", ""], default: "" },   // ✅ allow empty
  year: { type: String, enum: ["FY", "SY", "TY", ""], default: "" },    // ✅ allow empty
  division: { type: String, default: "" },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null },
  gender: { type: String, default: "" },

  // Progress tracker
  progress: [progressSchema]
}, { timestamps: true });

// ✅ Hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
