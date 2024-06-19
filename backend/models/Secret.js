import mongoose from 'mongoose';

const SecretScheme = new mongoose.Schema({
  hash: { type: String, required: true },
  secretText: { type: String, required: true },
  createdAt: { type: String, required: true },
  expiresAt: { type: String, required: true },
  remainingViews: { type: Number, required: true },
});

const Secret = mongoose.model('Secret', SecretScheme);
export default Secret;
