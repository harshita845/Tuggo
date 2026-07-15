import { validateCalculateOrderDto } from './src/modules/food/orders/validators/order.validator.js';

const mockPayload = {
  items: [
    {
      itemId: "64f1b2c3e4d5a6b7c8d9e0f1",
      name: "Burger",
      price: 150,
      quantity: 1,
      isVeg: true
    }
  ],
  restaurantId: "64f1b2c3e4d5a6b7c8d9e0f2",
  deliveryAddress: {
    location: {
      type: "Point",
      coordinates: ["75.8", "22.7"] // THESE MIGHT BE STRINGS?
    }
  }
};

try {
  validateCalculateOrderDto(mockPayload);
  console.log("SUCCESS");
} catch (err) {
  console.error("FAIL:", err);
}
