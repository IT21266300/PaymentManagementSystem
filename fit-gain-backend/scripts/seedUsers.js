const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User'); // Adjust path to your User model
require('dotenv').config(); // Load MongoDB URI from .env

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Sample user data matching your User model
const sampleUsers = [
  {
    email: 'customer@example.com',
    password: 'customer123', // Will be hashed
    fullName: 'John Doe',
    role: 'customer',
    paymentMethods: [
      {
        methodType: 'credit_card',
        cardNumberLastFour: '1234',
        isDefault: true,
      },
    
    ],
    billingAddress: {
      street: '123 Main St',
      city: 'Anytown',
      state: 'CA',
      postalCode: '12345',
      country: 'USA',
    },
    loyaltyPoints: 50,
    subscription: {
      isActive: true,
      plan: 'monthly',
      nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
  },
  {
    email: 'admin@example.com',
    password: 'admin123', // Will be hashed
    fullName: 'Admin User',
    role: 'admin',
    paymentMethods: [],
    billingAddress: {},
    loyaltyPoints: 0,
    subscription: {
      isActive: false,
      plan: null,
      nextPaymentDate: null,
    },
  },
];

// Seed function
const seedUsers = async () => {
  try {
    await connectDB();

    // Clear existing users (optional, comment out to preserve data)
    await User.deleteMany({});
    console.log('Existing users cleared');

    // Hash passwords and create users
    const hashedUsers = await Promise.all(
      sampleUsers.map(async (user) => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password, salt);
        return { ...user, password: hashedPassword };
      })
    );

    // Insert users into database
    await User.insertMany(hashedUsers);
    console.log('Sample users seeded successfully');

    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding users:', error);
    mongoose.connection.close();
    process.exit(1);
  }
};

// Run the seed script
seedUsers();