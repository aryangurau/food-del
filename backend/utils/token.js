import crypto from 'crypto';

export const genOTP = () => {
  return crypto.randomInt(10000, 999999);
};