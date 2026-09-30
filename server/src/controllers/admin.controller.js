import bcrypt from "bcryptjs";
import User from "../models/User.js";

const CATEGORIES = [
  "ROADS",
  "EDUCATION",
  "HEALTH",
  "ELECTRICITY",
  "WATER",
  "SAFETY"
];

export async function listAdmins(req, res) {
  try {
    const admins = await User.find({
      role: { $in: ["CATEGORY_ADMIN", "SUPER_ADMIN"] }
    })
      .select("-password")
      .sort({ role: 1, category: 1, name: 1 });

    res.json(admins);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
}

export async function createAdmin(req, res) {
  try {
    const { name, email, password, category } = req.body;

    if (!name || !email || !password || !category) {
      return res.status(400).json({
        message: "Name, email, password and category are required"
      });
    }

    if (!CATEGORIES.includes(category)) {
      return res.status(400).json({
        message: "Invalid category"
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existing = await User.findOne({
      email: normalizedEmail
    });

    if (existing) {
      return res.status(409).json({
        message: "An account with this email already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const admin = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "CATEGORY_ADMIN",
      category,
      isActive: true
    });

    res.status(201).json({
      message: "Category admin created successfully",
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        category: admin.category,
        isActive: admin.isActive
      }
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
}

export async function deactivateAdmin(req, res) {
  try {
    const { id } = req.params;

    if (req.user._id.toString() === id) {
      return res.status(400).json({
        message: "You cannot deactivate your own account"
      });
    }

    const admin = await User.findOne({
      _id: id,
      role: "CATEGORY_ADMIN"
    });

    if (!admin) {
      return res.status(404).json({
        message: "Category administrator not found"
      });
    }

    admin.isActive = false;
    await admin.save();

    res.json({
      message: "Administrator deactivated successfully",
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        category: admin.category,
        isActive: admin.isActive
      }
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
}

export async function activateAdmin(req, res) {
  try {
    const { id } = req.params;

    const admin = await User.findOne({
      _id: id,
      role: "CATEGORY_ADMIN"
    });

    if (!admin) {
      return res.status(404).json({
        message: "Category administrator not found"
      });
    }

    admin.isActive = true;
    await admin.save();

    res.json({
      message: "Administrator reactivated successfully",
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        category: admin.category,
        isActive: admin.isActive
      }
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
}
