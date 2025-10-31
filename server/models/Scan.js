import mongoose from 'mongoose';

const scanSchema = new mongoose.Schema({
  scanId: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  repoName: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'scanning', 'fixing', 'verifying', 'creating_pr', 'completed', 'failed'],
    default: 'pending' 
  },
  plan: { type: String, default: 'FREE' },
  findings: {
    vulnerability: String,
    checkId: String,
    filePath: String,
    message: String,
    line: Number
  },
  fixStatus: { type: String, enum: ['not_fixed', 'fixed', 'failed'], default: 'not_fixed' },
  prUrl: { type: String },
  prNumber: { type: Number },
  error: { type: String },
  logs: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  completedAt: { type: Date }
});

// Update updatedAt before saving
scanSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  if (this.status === 'completed' || this.status === 'failed') {
    this.completedAt = Date.now();
  }
  next();
});

const Scan = mongoose.model('Scan', scanSchema);
export default Scan;

