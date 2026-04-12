import Address from '../models/address.model.js';

const createAddress = async (payload) => {
  return Address.create(payload);
};

const findAddressesByUser = async (userId) => {
  return Address.find({ user: userId }).sort({ createdAt: -1 });
};

const findAddressById = async (addressId) => {
  return Address.findById(addressId);
};

const findAddressByUserAndId = async (userId, addressId) => {
  return Address.findOne({ _id: addressId, user: userId });
};

const updateAddressById = async (addressId, payload) => {
  return Address.findByIdAndUpdate(addressId, payload, {
    new: true,
    runValidators: true,
  });
};

const deleteAddressById = async (addressId) => {
  return Address.findByIdAndDelete(addressId);
};

const unsetDefaultAddresses = async (userId, excludeAddressId = null) => {
  const filter = { user: userId, isDefault: true };

  if (excludeAddressId) {
    filter._id = { $ne: excludeAddressId };
  }

  return Address.updateMany(filter, { isDefault: false });
};

export {
  createAddress,
  findAddressesByUser,
  findAddressById,
  findAddressByUserAndId,
  updateAddressById,
  deleteAddressById,
  unsetDefaultAddresses,
};