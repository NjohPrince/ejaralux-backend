import "reflect-metadata";

require("dotenv").config();

import { AppDataSource } from "../utils/data-source.util";
import { Category } from "../entities/category.entity";
import { categories } from "../data/categories";

async function seedCategories() {
  try {
    await AppDataSource.initialize();
    const categoryRepo = AppDataSource.getRepository(Category);

    for (const category of categories) {
      const exists = await categoryRepo.findOneBy({ name: category.name });
      if (!exists) {
        const cat = categoryRepo.create({ name: category.name });
        await categoryRepo.save(cat);
      }
    }

    console.log("✅ Categories seeded successfully");
    await AppDataSource.destroy();
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    await AppDataSource.destroy();
    process.exit(1);
  }
}

seedCategories();
