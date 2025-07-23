import { FindOptionsWhere } from "typeorm";

import { Product } from "../entities/product.entity";
import { Category } from "../entities/category.entity";
import AppError from "../utils/app-error.util";
import { AppDataSource } from "../utils/data-source.util";

export class ProductService {
  private productRepo = AppDataSource.getRepository(Product);
  private categoryRepo = AppDataSource.getRepository(Category);

  async createProduct(data: {
    name: string;
    description: string;
    price: number;
    image: string;
    quantity: number;
    unit: "mL" | "g" | "pcs" | "set";
    categoryId: string;
  }) {
    const category = await this.categoryRepo.findOne({
      where: { id: data.categoryId },
    });

    if (!category) {
      throw new AppError(404, "Category not found");
    }

    const existing = await this.productRepo.findOne({
      where: { name: data.name },
    });

    if (existing) {
      throw new AppError(409, "Product name must be unique");
    }

    const product = this.productRepo.create({
      ...data,
      category,
    });

    return await this.productRepo.save(product);
  }

  async getProductById(id: string) {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: ["category"],
    });

    if (!product) {
      throw new AppError(404, "Product not found");
    }

    return product;
  }

  async getAllProducts(query: {
    page?: number;
    limit?: number;
    categoryId?: string;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const filters: FindOptionsWhere<Product> = {};
    if (query.categoryId) {
      filters.category = { id: query.categoryId };
    }

    const [products, total] = await this.productRepo.findAndCount({
      where: filters,
      skip,
      take: limit,
      relations: ["category"],
      order: { created_at: "DESC" },
    });

    return {
      total,
      page,
      limit,
      isLastPage: skip + products.length >= total,
      products,
    };
  }

  async updateProduct(
    id: string,
    data: Partial<Omit<Product, "id">> & { categoryId?: string }
  ) {
    const product = await this.productRepo.findOne({ where: { id } });

    if (!product) {
      throw new AppError(404, "Product not found");
    }

    if (data.categoryId) {
      const category = await this.categoryRepo.findOne({
        where: { id: data.categoryId },
      });

      if (!category) {
        throw new AppError(404, "Category not found");
      }

      product.category = category;
    }

    if (data.name && data.name !== product.name) {
      const nameExists = await this.productRepo.findOne({
        where: { name: data.name },
      });
      if (nameExists) {
        throw new AppError(409, "Product name already exists");
      }
    }

    Object.assign(product, data);

    return await this.productRepo.save(product);
  }

  async deleteProduct(id: string) {
    const product = await this.productRepo.findOne({ where: { id } });

    if (!product) {
      throw new AppError(404, "Product not found");
    }

    await this.productRepo.remove(product);

    return { message: "Product deleted successfully" };
  }
}
