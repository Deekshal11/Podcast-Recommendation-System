const mongoose = require('mongoose');

const episodeSchema = new mongoose.Schema({
  // Basic Info
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  
  // Relations
  podcastId: { type: mongoose.Schema.Types.ObjectId, ref: 'Podcast', required: true },
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  seasonNumber: { type: Number },
  episodeNumber: { type: Number },
  
  // Media Files
  audioUrl: { type: String },
  audioFileSize: { type: Number }, // bytes
  audioFormat: { type: String }, // mp3, wav, m4a
  audioBitrate: { type: String }, // 128kbps, 320kbps
  
  thumbnail: { type: String },
  videoUrl: { type: String }, // For video podcasts
  
  // Duration & Timing
  duration: { type: Number }, // seconds
  formattedDuration: { type: String }, // "1:23:45"
  
  // Content Details
  slug: { type: String, unique: true, sparse: true },
  tags: [String],
  keywords: [String],
  
  // Transcript & Chapters
  transcript: { type: String },
  hasTranscript: { type: Boolean, default: false },
  chapters: [{
    title: String,
    startTime: Number,
    endTime: Number,
    description: String
  }],
  
  // Publishing
  status: { type: String, default: 'draft' }, // draft, scheduled, pending, approved, rejected, published
  isPublished: { type: Boolean, default: false },
  publishedAt: { type: Date },
  scheduledAt: { type: Date },
  
  // Visibility & Access
  isActive: { type: Boolean, default: true },
  isExplicit: { type: Boolean, default: false },
  isPremium: { type: Boolean, default: false },
  isTrailer: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  
  // Admin Review
  approvalStatus: { type: String, default: 'pending' }, // pending, approved, rejected
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: { type: Date },
  rejectionReason: { type: String },
  reviewNotes: { type: String },
  moderationFlags: [String],
  
  // Engagement Stats
  plays: { type: Number, default: 0 },
  uniqueListeners: { type: Number, default: 0 },
  completionRate: { type: Number, default: 0 }, // percentage
  averageListenDuration: { type: Number, default: 0 }, // seconds
  
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
  comments: { type: Number, default: 0 },
  shares: { type: Number, default: 0 },
  downloads: { type: Number, default: 0 },
  
  rating: { type: Number, default: 0, min: 0, max: 5 },
  ratingCount: { type: Number, default: 0 },
  
  // SEO
  metaTitle: { type: String },
  metaDescription: { type: String },
  metaKeywords: [String],
  
  // Guests & Credits
  guests: [{
    name: String,
    bio: String,
    image: String,
    socialLinks: {
      twitter: String,
      instagram: String,
      linkedin: String
    }
  }],
  
  hosts: [{
    name: String,
    role: String
  }],
  
  credits: {
    producer: String,
    editor: String,
    musicBy: String,
    artwork: String
  },
  
  // Links & Resources
  showNotes: { type: String },
  links: [{
    title: String,
    url: String,
    type: String // sponsor, resource, affiliate
  }],
  
  // Sponsorship & Monetization
  sponsorshipInfo: {
    isSponsored: { type: Boolean, default: false },
    sponsorName: String,
    sponsorLogo: String,
    sponsorUrl: String,
    adBreaks: [{
      time: Number, // seconds
      duration: Number,
      type: String // pre-roll, mid-roll, post-roll
    }]
  },
  
  // Technical
  fileHash: { type: String }, // For duplicate detection
  processingStatus: { type: String, default: 'pending' }, // pending, processing, completed, failed
  encodingProgress: { type: Number, default: 0 },
  
  // Features
  allowComments: { type: Boolean, default: true },
  allowDownloads: { type: Boolean, default: true },
  allowSharing: { type: Boolean, default: true },
  
  // Analytics Tracking
  analyticsData: {
    peakListeningTime: String,
    averageDropOffPoint: Number,
    popularSegments: [Number],
    geographicData: [{
      country: String,
      plays: Number
    }]
  },
  
  // Copyright & Legal
  copyright: { type: String },
  license: { type: String },
  contentWarning: { type: String },
  
}, { timestamps: true });

module.exports = mongoose.model('Episode', episodeSchema);
