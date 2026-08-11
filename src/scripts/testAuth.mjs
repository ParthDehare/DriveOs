import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../../.env.local') });

import User from '../models/User.js';

async function testAuth() {
  await mongoose.connect(process.env.MONGODB_URI);
  const user = await User.findOne({ email: 'admin@driveos.com', isActive: true });
  console.log("Found User:", user ? user.email : "none");
  if (user) {
    const match = await bcrypt.compare('admin123', user.password);
    console.log("Password match:", match);
  }
  process.exit(0);
}
testAuth();
