// The-Human-Tech-Blog-Server/src/models/Sponsor.ts

import mongoose from 'mongoose';

const sponsorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  logoUrl: { type: String, required: true },
  website: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model('Sponsor', sponsorSchema);
