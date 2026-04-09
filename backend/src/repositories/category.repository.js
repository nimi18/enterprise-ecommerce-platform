import Category from '../models/category.model.js';

const createCategory = async (payload) => {
  return Category.create(payload);
};

const findCategoryByName = async (name) => {
  return Category.findOne({ name });
};

const findCategoryBySlug = async (slug) => {
  return Category.findOne({ slug });
};

const findCategoryById = async (categoryId) => {
  return Category.findById(categoryId);
};

const getCategories = async (filter = {}) => {
  return Category.find(filter).sort({ createdAt: -1 });
};

const updateCategoryById = async (categoryId, payload) => {
  return Category.findByIdAndUpdate(categoryId, payload, {
    new: true,
    runValidators: true,
  });
};

export {
  createCategory,
  findCategoryByName,
  findCategoryBySlug,
  findCategoryById,
  getCategories,
  updateCategoryById,
};