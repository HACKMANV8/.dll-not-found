import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  githubId: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  avatarUrl: { type: String },
  plan: { type: String, default: 'FREE' },
  githubAccessToken: { type: String }, 
  selectedRepos: [
    {
      name: String,
      repoId: String
    }
  ]
});

const User = mongoose.model('User', userSchema);
export default User; 