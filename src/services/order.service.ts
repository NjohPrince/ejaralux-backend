import { Order, OrderStatus } from "../entities/order.entity";
import { OrderItem } from "../entities/order-item.entity";
import { Product } from "../entities/product.entity";
import { AppDataSource } from "../utils/data-source.util";

export const createOrder = async (
  userId: string,
  items: { productId: string; quantity: number }[]
) => {
  const orderRepo = AppDataSource.getRepository(Order);
  const itemRepo = AppDataSource.getRepository(OrderItem);
  const productRepo = AppDataSource.getRepository(Product);

  const order = orderRepo.create({
    user: { id: userId } as any,
    status: OrderStatus.PENDING,
  });
  await orderRepo.save(order);

  const orderItems = await Promise.all(
    items.map(async ({ productId, quantity }) => {
      const product = await productRepo.findOneByOrFail({ id: productId });
      return itemRepo.create({ order, product, quantity });
    })
  );
  await itemRepo.save(orderItems);

  return orderRepo.findOne({
    where: { id: order.id },
    relations: { items: { product: true } },
  });
};

export const getOrderHistory = async (userId: string, page = 1, limit = 10) => {
  const orderRepo = AppDataSource.getRepository(Order);
  return orderRepo.find({
    where: { user: { id: userId } },
    relations: { items: { product: true } },
    order: { createdAt: "DESC" },
    skip: (page - 1) * limit,
    take: limit,
  });
};

export const getAllOrders = async (page = 1, limit = 10) => {
  const orderRepo = AppDataSource.getRepository(Order);
  return orderRepo.find({
    relations: { items: { product: true }, user: true },
    order: { createdAt: "DESC" },
    skip: (page - 1) * limit,
    take: limit,
  });
};

export const updateOrderStatus = async (orderId: string, status: string) => {
  const orderRepo = AppDataSource.getRepository(Order);
  const order = await orderRepo.findOneByOrFail({ id: orderId });
  order.status = status as any;
  return orderRepo.save(order);
};
