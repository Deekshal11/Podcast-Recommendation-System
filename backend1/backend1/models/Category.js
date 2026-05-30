const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  
  // Hierarchy
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  level: { type: Number, default: 0 }, // 0 = main, 1 = sub, 2 = sub-sub
  
  // Media
  icon: { type: String },
  image: { type: String },
  color: { type: String }, // Hex color for UI
  
  // Display
  displayOrder: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  
  // Stats
  podcastCount: { type: Number, default: 0 },
  followerCount: { type: Number, default: 0 },
  
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
