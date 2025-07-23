import { FindOptionsWhere, LessThan } from "typeorm";

import { Product } from "../entities/product.entity";
import { Category } from "../entities/category.entity";
import AppError from "../utils/app-error.util";
import { AppDataSource } from "../utils/data-source.util";
// import redisClient from "../utils/connect-redis.util";

// interface GetProductsCursorQuery {
//   limit?: number;
//   categoryId?: string;
//   cursor?: string; // base64 encoded cursor string (createdAt + id)
// }

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
      order: { createdAt: "DESC" },
    });

    return {
      total,
      page,
      limit,
      isLastPage: skip + products.length >= total,
      products,
    };
  }

  //   async getProductsCursor(query: GetProductsCursorQuery) {
  //     const limit = query.limit ?? 10;
  //     const filters: any = {};
  //     if (query.categoryId) {
  //       filters.category = { id: query.categoryId };
  //     }

  //     // decode cursor if provided
  //     let cursorCreatedAt: Date | undefined = undefined;
  //     let cursorId: string | undefined = undefined;
  //     if (query.cursor) {
  //       try {
  //         const decoded = Buffer.from(query.cursor, "base64").toString("ascii");
  //         const [createdAtStr, id] = decoded.split("_");
  //         cursorCreatedAt = new Date(createdAtStr);
  //         cursorId = id;
  //       } catch {
  //         throw new Error("Invalid cursor");
  //       }
  //     }

  //     // build query conditions with cursor
  //     let whereCondition = filters;
  //     if (cursorCreatedAt && cursorId) {
  //       // pagination keyset logic:
  //       // (createdAt, id) < (cursorCreatedAt, cursorId)
  //       // for descending createdAt order
  //       whereCondition = [
  //         {
  //           ...filters,
  //           createdAt: LessThan(cursorCreatedAt),
  //         },
  //         {
  //           ...filters,
  //           createdAt: cursorCreatedAt,
  //           id: LessThan(cursorId),
  //         },
  //       ];
  //     }

  //     // check cache key
  //     const cacheKey = `products:${query.categoryId || "all"}:${
  //       query.cursor || "start"
  //     }:${limit}`;
  //     const cached = await redisClient.get(cacheKey);
  //     if (cached) {
  //       return JSON.parse(cached);
  //     }

  //     // fetch data
  //     const products = await this.productRepo.find({
  //       where: whereCondition,
  //       take: limit,
  //       order: { createdAt: "DESC", id: "DESC" },
  //       relations: ["category"],
  //     });

  //     // prepare next cursor (last item)
  //     let nextCursor: string | null = null;
  //     if (products.length === limit) {
  //       const last = products[products.length - 1];
  //       nextCursor = Buffer.from(
  //         `${last.createdAt.toISOString()}_${last.id}`
  //       ).toString("base64");
  //     }

  //     const result = {
  //       products,
  //       nextCursor,
  //     };

  //     // cache result for short time (e.g., 30 seconds)
  //     await redisClient.set(cacheKey, JSON.stringify(result), { EX: 30 });

  //     return result;
  //   }

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
