import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate,
} from "typeorm";
import slugify from "slugify";

import Model from "./model.entity";
import { Category } from "./category.entity";

export type UnitType = "mL" | "g" | "pcs" | "set";

@Entity("products")
export class Product extends Model {
  @Column({ unique: true })
  name: string;

  @Column()
  slug: string;

  @Column("text")
  description: string;

  @Column("float")
  price: number;

  @Column({ type: "enum", enum: ["mL", "g", "pcs", "set"] })
  unit: UnitType;

  @Column("int")
  quantity: number;

  @ManyToOne(() => Category, { eager: true, nullable: false })
  @JoinColumn({ name: "categoryId" })
  category: Category;

  @Column()
  categoryId: string;

  @BeforeInsert()
  @BeforeUpdate()
  generateSlug() {
    if (this.name) {
      this.slug = slugify(this.name, { lower: true, strict: true });
    }
  }
}
