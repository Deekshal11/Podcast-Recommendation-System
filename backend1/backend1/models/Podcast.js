const mongoose = require('mongoose');

const podcastSchema = new mongoose.Schema({
  // Basic Info
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  
  // Creator & Category
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  subCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  
  // Media
  coverImage: { type: String },
  bannerImage: { type: String },
  trailer: { type: String }, // Audio trailer URL
  
  // SEO & Discovery
  slug: { type: String, unique: true, sparse: true },
  tags: [String],
  language: { type: String, default: 'English' },
  country: { type: String },
  
  // Content Details
  episodeCount: { type: Number, default: 0 },
  totalDuration: { type: Number, default: 0 }, // Total minutes
  releaseSchedule: { type: String }, // e.g., "Weekly on Monday"
  isExplicit: { type: Boolean, default: false },
  ageRating: { type: String }, // 13+, 18+, etc.
  
  // Status & Visibility
  status: { type: String, default: 'draft' }, // draft, pending, approved, rejected, suspended
  isActive: { type: Boolean, default: true },
  isPublished: { type: Boolean, default: false },
  publishedAt: { type: Date },
  
  // Admin Review
  approvalStatus: { type: String, default: 'pending' }, // pending, approved, rejected
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: { type: Date },
  rejectionReason: { type: String },
  reviewNotes: { type: String },
  
  // Engagement Stats
  totalPlays: { type: Number, default: 0 },
  totalLikes: { type: Number, default: 0 },
  totalComments: { type: Number, default: 0 },
  subscriberCount: { type: Number, default: 0 },
  averageRating: { type: Number, default: 0, min: 0, max: 5 },
  ratingCount: { type: Number, default: 0 },
  
  // Social & Links
  websiteUrl: { type: String },
  rssUrl: { type: String },
  socialLinks: {
    twitter: String,
    facebook: String,
    instagram: String,
    youtube: String,
    spotify: String,
    applepodcasts: String
  },
  
  // Monetization
  isPremium: { type: Boolean, default: false },
  subscriptionPrice: { type: Number },
  isMonetized: { type: Boolean, default: false },
  sponsorshipEnabled: { type: Boolean, default: false },
  
  // Features
  allowComments: { type: Boolean, default: true },
  allowDownloads: { type: Boolean, default: true },
  allowSharing: { type: Boolean, default: true },
  enableTranscripts: { type: Boolean, default: false },
  enableChapters: { type: Boolean, default: false },
  
  // Analytics
  viewCount: { type: Number, default: 0 },
  searchCount: { type: Number, default: 0 },
  shareCount: { type: Number, default: 0 },
  
  // Metadata
  copyright: { type: String },
  owner: {
    name: String,
    email: String
  },
  author: { type: String },
  
  // Flags
  isFeatured: { type: Boolean, default: false },
  isTrending: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
  
}, { timestamps: true });

module.exports = mongoose.model('Podcast', podcastSchema);
