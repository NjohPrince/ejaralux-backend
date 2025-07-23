import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from "typeorm";

import { Order } from "./order.entity";
import { Product } from "./product.entity";

@Entity()
export class OrderItem {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Order, (order) => order.items)
  order: Order;

  @ManyToOne(() => Product)
  product: Product;

  @Column()
  quantity: number;
}
