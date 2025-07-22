import { Entity, Column, BeforeInsert, BeforeUpdate } from "typeorm";
import slugify from "slugify";

import Model from "./model.entity";

@Entity("categories")
export class Category extends Model {
  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  slug: string;

  @BeforeInsert()
  @BeforeUpdate()
  generateSlug() {
    if (this.name) {
      this.slug = slugify(this.name, { lower: true, strict: true });
    }
  }
}
