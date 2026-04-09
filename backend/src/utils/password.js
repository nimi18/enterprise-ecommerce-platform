import bcrypt from 'bcryptjs';

const hashPassword = async (plainPassword) => {
  return bcrypt.hash(plainPassword, 10);
};

const comparePassword = async (plainPassword, hashedPassword) => {
  return bcrypt.compare(plainPassword, hashedPassword);
};

export { hashPassword, comparePassword };