import API from "../api";

export async function getCart(offset = 0, limit = 10) {
  const response = await API.get("/cart", {
    params: { offset, limit },
  });
  return response.data;
}

export async function addToCart(productId, quantity = 1) {
  const response = await API.post("/cart/items", {
    productId,
    quantity,
  });
  return response.data;
}

export async function addProductToCart(productId, quantity = 1) {
  return addToCart(productId, quantity);
}

export async function updateCartItem(itemId, quantity) {
  const response = await API.patch(`/cart/items/${itemId}`, {
    quantity,
  });
  return response.data;
}

export async function removeCartItem(itemId) {
  const response = await API.delete(`/cart/items/${itemId}`);
  return response.data;
}

export async function checkout(shippingAddress, pincode) {
  const response = await API.post("/cart/checkout", {
    shippingAddress,
    pincode,
  });
  return response.data;
}
