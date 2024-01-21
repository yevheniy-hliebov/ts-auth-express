import dotenv from 'dotenv';
dotenv.config();

const configuragion = {
  port: process.env.PORT || 4000,
  jwt_secret: process.env.JWT_SECRET || 'Test key',
  jwt_expires_in: process.env.JWT_EXPIRES_IN || 3600, // in seconds
}

export default configuragion;