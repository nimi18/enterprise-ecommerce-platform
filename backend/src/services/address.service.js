import mongoose from 'mongoose';
import ERROR_CODES from '../constants/errorCodes.js';
import {
  createAddress,
  deleteAddressById,
  findAddressByUserAndId,
  findAddressesByUser,
  unsetDefaultAddresses,
  updateAddressById,
} from '../repositories/address.repository.js';
import AppError from '../utils/appError.js';

const buildAddressResponse = (address) => {
  return {
    _id: address._id,
    user: address.user,
    fullName: address.fullName,
    phone: address.phone,
    addressLine1: address.addressLine1,
    addressLine2: address.addressLine2,
    city: address.city,
    state: address.state,
    postalCode: address.postalCode,
    country: address.country,
    landmark: address.landmark,
    addressType: address.addressType,
    isDefault: address.isDefault,
    createdAt: address.createdAt,
    updatedAt: address.updatedAt,
  };
};

const addAddressService = async (userId, payload) => {
  if (payload.isDefault) {
    await unsetDefaultAddresses(userId);
  }

  const address = await createAddress({
    user: userId,
    fullName: payload.fullName,
    phone: payload.phone,
    addressLine1: payload.addressLine1,
    addressLine2: payload.addressLine2 || '',
    city: payload.city,
    state: payload.state,
    postalCode: payload.postalCode,
    country: payload.country,
    landmark: payload.landmark || '',
    addressType: payload.addressType || 'home',
    isDefault: payload.isDefault ?? false,
  });

  return buildAddressResponse(address);
};

const getMyAddressesService = async (userId) => {
  const addresses = await findAddressesByUser(userId);
  return addresses.map(buildAddressResponse);
};

const getAddressByIdService = async (userId, addressId) => {
  if (!mongoose.Types.ObjectId.isValid(addressId)) {
    throw new AppError('Invalid address id', 400, ERROR_CODES.BAD_REQUEST);
  }

  const address = await findAddressByUserAndId(userId, addressId);

  if (!address) {
    throw new AppError('Address not found', 404, ERROR_CODES.NOT_FOUND);
  }

  return buildAddressResponse(address);
};

const updateAddressService = async (userId, addressId, payload) => {
  if (!mongoose.Types.ObjectId.isValid(addressId)) {
    throw new AppError('Invalid address id', 400, ERROR_CODES.BAD_REQUEST);
  }

  const existingAddress = await findAddressByUserAndId(userId, addressId);

  if (!existingAddress) {
    throw new AppError('Address not found', 404, ERROR_CODES.NOT_FOUND);
  }

  if (payload.isDefault === true) {
    await unsetDefaultAddresses(userId, addressId);
  }

  const updatedAddress = await updateAddressById(addressId, payload);

  return buildAddressResponse(updatedAddress);
};

const deleteAddressService = async (userId, addressId) => {
  if (!mongoose.Types.ObjectId.isValid(addressId)) {
    throw new AppError('Invalid address id', 400, ERROR_CODES.BAD_REQUEST);
  }

  const existingAddress = await findAddressByUserAndId(userId, addressId);

  if (!existingAddress) {
    throw new AppError('Address not found', 404, ERROR_CODES.NOT_FOUND);
  }

  await deleteAddressById(addressId);

  if (existingAddress.isDefault) {
    const remainingAddresses = await findAddressesByUser(userId);

    if (remainingAddresses.length > 0) {
      await updateAddressById(remainingAddresses[0]._id, { isDefault: true });
    }
  }

  return { deleted: true };
};

const setDefaultAddressService = async (userId, addressId) => {
  if (!mongoose.Types.ObjectId.isValid(addressId)) {
    throw new AppError('Invalid address id', 400, ERROR_CODES.BAD_REQUEST);
  }

  const existingAddress = await findAddressByUserAndId(userId, addressId);

  if (!existingAddress) {
    throw new AppError('Address not found', 404, ERROR_CODES.NOT_FOUND);
  }

  await unsetDefaultAddresses(userId, addressId);

  const updatedAddress = await updateAddressById(addressId, { isDefault: true });

  return buildAddressResponse(updatedAddress);
};

export {
  addAddressService,
  getMyAddressesService,
  getAddressByIdService,
  updateAddressService,
  deleteAddressService,
  setDefaultAddressService,
};