import dotenv from 'dotenv';
dotenv.config();

const configuragion = {
  port: process.env.PORT || 4000,
  jwt_secret: process.env.JWT_SECRET || 'Test key',
  jwt_expires_in: process.env.JWT_EXPIRES_IN || 3600, // in seconds
  url_domain_verification: process.env.URL_DOMAIN_VERIFICATION, // in seconds
}

type NodemailerConfig = {
  service: string | undefined;
  host: string | undefined;
  port: number | undefined;
  secure: boolean | undefined;
  auth: {
    user: string;
    pass: string;
  };
}

export const nodemailerConfig: NodemailerConfig = {
  service: process.env.NODEMAILER_SERVICE, // Assuming correct environment variable
  host: process.env.NODEMAILER_HOST, // Assuming correct environment variable
  port: Number(process.env.NODEMAILER_PORT), // Convert string to number or undefined
  secure: Boolean(process.env.NODEMAILER_SECURE), // Provide default value
  auth: {
    user: process.env.NODEMAILER_USER || '',
    pass: process.env.NODEMAILER_PASSWORD || '', // Provide default value
  },
};

export default configuragion;