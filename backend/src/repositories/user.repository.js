import User from '../models/user.model.js';

const createUser = async (payload) => {
  return User.create(payload);
};

const findUserByEmail = async (email, options = {}) => {
  const query = User.findOne({ email });

  if (options.includePassword) {
    query.select('+password');
  }

  return query;
};

const findUserById = async (userId) => {
  return User.findById(userId);
};

export { createUser, findUserByEmail, findUserById };