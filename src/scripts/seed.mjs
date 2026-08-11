import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Manual env loading if running as standalone script
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../../.env.local') });

// Assume models are ES modules that can be imported
import School from '../models/School.js';
import User from '../models/User.js';
import Vehicle from '../models/Vehicle.js';
import Package from '../models/Package.js';
import InstallmentPlan from '../models/InstallmentPlan.js';
import Enrollment from '../models/Enrollment.js';
import Session from '../models/Session.js';
import Payment from '../models/Payment.js';
import Attendance from '../models/Attendance.js';
import Evaluation from '../models/Evaluation.js';
import LicenseInfo from '../models/LicenseInfo.js';
import TripLog from '../models/TripLog.js';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Please set MONGODB_URI in your .env.local file");
  process.exit(1);
}

async function seed() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected.");

    console.log("Dropping existing collections...");
    await School.deleteMany({});
    await User.deleteMany({});
    await Vehicle.deleteMany({});
    await Package.deleteMany({});
    await InstallmentPlan.deleteMany({});
    await Enrollment.deleteMany({});
    await Session.deleteMany({});
    await Payment.deleteMany({});
    await Attendance.deleteMany({});
    await Evaluation.deleteMany({});
    await LicenseInfo.deleteMany({});
    await TripLog.deleteMany({});

    console.log("Creating School...");
    const school = await School.create({
      name: 'DriveOS Academy',
      address: '123 Main Street',
      phone: '123-456-7890',
      email: 'contact@driveos.com'
    });

    console.log("Creating Admin User...");
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@driveos.com',
      phone: '9999999999',
      password: adminPassword,
      role: 'admin',
      schoolId: school._id
    });

    console.log("Creating Instructors...");
    const instructorPassword = await bcrypt.hash('instructor123', 10);
    const instructors = await User.insertMany([
      { name: 'John Doe', email: 'john@driveos.com', phone: '8888888881', password: instructorPassword, role: 'instructor', schoolId: school._id },
      { name: 'Jane Smith', email: 'jane@driveos.com', phone: '8888888882', password: instructorPassword, role: 'instructor', schoolId: school._id },
      { name: 'Bob Wilson', email: 'bob@driveos.com', phone: '8888888883', password: instructorPassword, role: 'instructor', schoolId: school._id }
    ]);

    console.log("Creating Students...");
    const studentPassword = await bcrypt.hash('student123', 10);
    const studentsData = Array.from({ length: 10 }).map((_, i) => ({
      name: `Student ${i+1}`,
      email: `student${i+1}@driveos.com`,
      phone: `777777777${i}`,
      password: studentPassword,
      role: 'student',
      schoolId: school._id
    }));
    const students = await User.insertMany(studentsData);

    console.log("Creating Vehicles...");
    const vehicles = await Vehicle.insertMany([
      { schoolId: school._id, licensePlate: 'ABC-123', make: 'Honda', model: 'Civic', year: 2020, transmissionType: 'automatic', fuelType: 'petrol' },
      { schoolId: school._id, licensePlate: 'DEF-456', make: 'Toyota', model: 'Corolla', year: 2019, transmissionType: 'manual', fuelType: 'petrol' },
      { schoolId: school._id, licensePlate: 'GHI-789', make: 'Ford', model: 'Fiesta', year: 2021, transmissionType: 'manual', fuelType: 'diesel' },
      { schoolId: school._id, licensePlate: 'JKL-012', make: 'Nissan', model: 'Leaf', year: 2022, transmissionType: 'automatic', fuelType: 'electric' },
      { schoolId: school._id, licensePlate: 'MNO-345', make: 'Hyundai', model: 'i20', year: 2020, transmissionType: 'manual', fuelType: 'petrol' }
    ]);

    console.log("Creating Packages and Installment Plans...");
    const pkg1 = await Package.create({ schoolId: school._id, name: 'Basic Manual', totalSessions: 10, durationPerSession: 60, price: 5000, transmissionType: 'manual' });
    const pkg2 = await Package.create({ schoolId: school._id, name: 'Standard Auto', totalSessions: 15, durationPerSession: 60, price: 8000, transmissionType: 'automatic' });
    const pkg3 = await Package.create({ schoolId: school._id, name: 'Premium Comprehensive', totalSessions: 20, durationPerSession: 60, price: 12000, transmissionType: 'both' });

    await InstallmentPlan.insertMany([
      { packageId: pkg1._id, trancheNumber: 1, percentageOfTotal: 100, dueDaysAfterEnrollment: 0 },
      { packageId: pkg2._id, trancheNumber: 1, percentageOfTotal: 50, dueDaysAfterEnrollment: 0 },
      { packageId: pkg2._id, trancheNumber: 2, percentageOfTotal: 50, dueDaysAfterEnrollment: 15 },
      { packageId: pkg3._id, trancheNumber: 1, percentageOfTotal: 40, dueDaysAfterEnrollment: 0 },
      { packageId: pkg3._id, trancheNumber: 2, percentageOfTotal: 30, dueDaysAfterEnrollment: 10 },
      { packageId: pkg3._id, trancheNumber: 3, percentageOfTotal: 30, dueDaysAfterEnrollment: 20 }
    ]);

    console.log("Creating Enrollments and Payments...");
    const enrollments = [];
    for (let i = 0; i < 5; i++) {
      const student = students[i];
      const pkg = i % 2 === 0 ? pkg1 : pkg2;
      const enrollment = await Enrollment.create({ studentId: student._id, packageId: pkg._id, schoolId: school._id });
      enrollments.push(enrollment);

      const plans = await InstallmentPlan.find({ packageId: pkg._id });
      for (const plan of plans) {
        await Payment.create({
          enrollmentId: enrollment._id,
          schoolId: school._id,
          amount: (pkg.price * plan.percentageOfTotal) / 100,
          dueDate: new Date(enrollment.startDate.getTime() + plan.dueDaysAfterEnrollment * 24 * 60 * 60 * 1000),
          status: plan.trancheNumber === 1 ? 'paid' : 'pending',
          trancheNumber: plan.trancheNumber
        });
      }
    }

    console.log("Creating Sessions...");
    const today = new Date();
    today.setHours(10, 0, 0, 0);
    
    for (let i = 0; i < 3; i++) {
      await Session.create({
        enrollmentId: enrollments[i]._id,
        instructorId: instructors[i]._id,
        vehicleId: vehicles[i]._id,
        schoolId: school._id,
        scheduledAt: new Date(today.getTime() + i * 24 * 60 * 60 * 1000), // Next few days
        duration: 60,
        status: 'scheduled'
      });
    }

    console.log("Seed completed successfully.");
    console.log(`Summary:
      1 School
      1 Admin
      3 Instructors
      10 Students
      5 Vehicles
      3 Packages
      5 Enrollments
      3 Sessions
    `);
    
    process.exit(0);
  } catch (error) {
    console.error("Error during seed:", error);
    process.exit(1);
  }
}

seed();
