import mongoose from 'mongoose';

const diaryEntrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 5000
  },
  aiReply: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  }
}, {
  timestamps: true
});

diaryEntrySchema.index({ userId: 1, createdAt: -1 });

const DiaryEntry = mongoose.models.DiaryEntry || mongoose.model('DiaryEntry', diaryEntrySchema);

export default DiaryEntry;