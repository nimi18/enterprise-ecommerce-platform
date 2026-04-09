import ERROR_CODES from '../constants/errorCodes.js';
import {
  createCategory,
  findCategoryById,
  findCategoryByName,
  findCategoryBySlug,
  getCategories,
  updateCategoryById,
} from '../repositories/category.repository.js';
import AppError from '../utils/appError.js';
import generateSlug from '../utils/slug.js';

const buildCategoryResponse = (category) => {
  return {
    _id: category._id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    isActive: category.isActive,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  };
};

const createCategoryService = async ({ name, description = '' }) => {
  const normalizedName = name.trim();
  const slug = generateSlug(normalizedName);

  const existingCategoryByName = await findCategoryByName(normalizedName);
  if (existingCategoryByName) {
    throw new AppError('Category name already exists', 409, ERROR_CODES.CONFLICT);
  }

  const existingCategoryBySlug = await findCategoryBySlug(slug);
  if (existingCategoryBySlug) {
    throw new AppError('Category slug already exists', 409, ERROR_CODES.CONFLICT);
  }

  const category = await createCategory({
    name: normalizedName,
    slug,
    description,
  });

  return buildCategoryResponse(category);
};

const listCategoriesService = async ({ isActive } = {}) => {
  const filter = {};

  if (typeof isActive === 'boolean') {
    filter.isActive = isActive;
  }

  const categories = await getCategories(filter);

  return categories.map(buildCategoryResponse);
};

const getCategoryByIdService = async (categoryId) => {
  const category = await findCategoryById(categoryId);

  if (!category) {
    throw new AppError('Category not found', 404, ERROR_CODES.NOT_FOUND);
  }

  return buildCategoryResponse(category);
};

const updateCategoryService = async (categoryId, payload) => {
  const category = await findCategoryById(categoryId);

  if (!category) {
    throw new AppError('Category not found', 404, ERROR_CODES.NOT_FOUND);
  }

  const updatePayload = { ...payload };

  if (payload.name) {
    const normalizedName = payload.name.trim();
    const slug = generateSlug(normalizedName);

    const existingCategoryByName = await findCategoryByName(normalizedName);
    if (existingCategoryByName && existingCategoryByName._id.toString() !== categoryId) {
      throw new AppError('Category name already exists', 409, ERROR_CODES.CONFLICT);
    }

    const existingCategoryBySlug = await findCategoryBySlug(slug);
    if (existingCategoryBySlug && existingCategoryBySlug._id.toString() !== categoryId) {
      throw new AppError('Category slug already exists', 409, ERROR_CODES.CONFLICT);
    }

    updatePayload.name = normalizedName;
    updatePayload.slug = slug;
  }

  const updatedCategory = await updateCategoryById(categoryId, updatePayload);

  return buildCategoryResponse(updatedCategory);
};

const deactivateCategoryService = async (categoryId) => {
  const category = await findCategoryById(categoryId);

  if (!category) {
    throw new AppError('Category not found', 404, ERROR_CODES.NOT_FOUND);
  }

  const updatedCategory = await updateCategoryById(categoryId, { isActive: false });

  return buildCategoryResponse(updatedCategory);
};

export {
  createCategoryService,
  listCategoriesService,
  getCategoryByIdService,
  updateCategoryService,
  deactivateCategoryService,
};