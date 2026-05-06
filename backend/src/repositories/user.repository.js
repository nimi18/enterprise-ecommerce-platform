import User from '../models/user.model.js';

const userPublicFields = '-password';

const createUser = async (payload) => {
  return User.create(payload);
};

const findUserByEmail = async (email) => {
  return User.findOne({ email: email.toLowerCase() });
};

const findUserById = async (userId) => {
  return User.findById(userId).select(userPublicFields).lean();
};

const findUserWithPasswordById = async (userId) => {
  return User.findById(userId);
};

const updateUserById = async (userId, payload) => {
  return User.findByIdAndUpdate(userId, payload, {
    new: true,
    runValidators: true,
  })
    .select(userPublicFields)
    .lean();
};

export {
  createUser,
  findUserByEmail,
  findUserById,
  findUserWithPasswordById,
  updateUserById,
};