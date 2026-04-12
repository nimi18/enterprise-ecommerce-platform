import {
  addAddressService,
  deleteAddressService,
  getAddressByIdService,
  getMyAddressesService,
  setDefaultAddressService,
  updateAddressService,
} from '../services/address.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccessResponse } from '../utils/response.js';

const addAddressController = asyncHandler(async (req, res) => {
  const data = await addAddressService(req.user.userId, req.body);

  return sendSuccessResponse(res, {
    statusCode: 201,
    message: 'Address added successfully',
    data,
  });
});

const getMyAddressesController = asyncHandler(async (req, res) => {
  const data = await getMyAddressesService(req.user.userId);

  return sendSuccessResponse(res, {
    message: 'Addresses fetched successfully',
    data,
  });
});

const getAddressByIdController = asyncHandler(async (req, res) => {
  const data = await getAddressByIdService(req.user.userId, req.params.addressId);

  return sendSuccessResponse(res, {
    message: 'Address fetched successfully',
    data,
  });
});

const updateAddressController = asyncHandler(async (req, res) => {
  const data = await updateAddressService(
    req.user.userId,
    req.params.addressId,
    req.body
  );

  return sendSuccessResponse(res, {
    message: 'Address updated successfully',
    data,
  });
});

const deleteAddressController = asyncHandler(async (req, res) => {
  const data = await deleteAddressService(req.user.userId, req.params.addressId);

  return sendSuccessResponse(res, {
    message: 'Address deleted successfully',
    data,
  });
});

const setDefaultAddressController = asyncHandler(async (req, res) => {
  const data = await setDefaultAddressService(
    req.user.userId,
    req.params.addressId
  );

  return sendSuccessResponse(res, {
    message: 'Default address updated successfully',
    data,
  });
});

export {
  addAddressController,
  getMyAddressesController,
  getAddressByIdController,
  updateAddressController,
  deleteAddressController,
  setDefaultAddressController,
};