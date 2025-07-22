import { Category } from "../entities/category.entity";
import { AppDataSource } from "../utils/data-source.util";

const repo = AppDataSource.getRepository(Category);

export const createCategory = async (name: string) => {
  const category = repo.create({ name });
  return repo.save(category);
};

export const findAllCategories = async () => {
  return repo.find();
};

export const findCategoryById = async (id: string) => {
  return repo.findOneBy({ id });
};

export const updateCategory = async (id: string, name?: string) => {
  const category = await repo.findOneBy({ id });
  if (!category) return null;

  if (name) category.name = name;
  return repo.save(category);
};

export const deleteCategory = async (id: string) => {
  return repo.delete(id);
};
