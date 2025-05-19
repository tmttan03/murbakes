
import axios from "axios";

const BASE_URL = "http://localhost:8000/api";

// Products
export async function loadProducts() {
  try {
    const response = await axios.get(`${BASE_URL}/products/`);
    return response.data;
  } catch (error) {
    console.error("Error loading products:", error);
    return [];
  }
}

export async function saveProducts(products: any[]) {
  try {
    const responses = await Promise.all(products.map(p => axios.post(`${BASE_URL}/products/`, p)));
    return responses.map(r => r.data);
  } catch (error) {
    console.error("Error saving products:", error);
    throw error;
  }
}

// Orders
export async function loadOrders() {
  try {
    const response = await axios.get(`${BASE_URL}/orders/`);
    return response.data;
  } catch (error) {
    console.error("Error loading orders:", error);
    return [];
  }
}

export async function saveOrders(orders: any[]) {
  try {
    const responses = await Promise.all(orders.map(o => axios.post(`${BASE_URL}/orders/`, o)));
    return responses.map(r => r.data);
  } catch (error) {
    console.error("Error saving orders:", error);
    throw error;
  }
}

// Bake Sales
export async function loadBakeSales() {
  try {
    const response = await axios.get(`${BASE_URL}/bake-sales/`);
    return response.data;
  } catch (error) {
    console.error("Error loading bake sales:", error);
    return [];
  }
}

export async function saveBakeSales(bakeSales: any[]) {
  try {
    const responses = await Promise.all(bakeSales.map(b => axios.post(`${BASE_URL}/bake-sales/`, b)));
    return responses.map(r => r.data);
  } catch (error) {
    console.error("Error saving bake sales:", error);
    throw error;
  }
}

// Bake Sale Periods
export async function loadBakeSalePeriods() {
  try {
    const response = await axios.get(`${BASE_URL}/bake-sales/`);
    return response.data;
  } catch (error) {
    console.error("Error loading bake sale periods:", error);
    return [];
  }
}

export async function saveBakeSalePeriods(bakeSalePeriods: any[]) {
  try {
    const responses = await Promise.all(bakeSalePeriods.map(p => axios.post(`${BASE_URL}/bake-sales/`, p)));
    return responses.map(r => r.data);
  } catch (error) {
    console.error("Error saving bake sale periods:", error);
    throw error;
  }
}


// Local storage keys
// const ORDERS_KEY = "murbakes-orders"
// const PRODUCTS_KEY = "murbakes-products"
// const BAKE_SALES_KEY = "murbakes-bake-sales"
// const BAKE_SALE_PERIODS_KEY = "murbakes-bake-sale-periods"

// // Load orders from local storage
// export async function loadOrders() {
//   try {
//     const ordersJson = localStorage.getItem(ORDERS_KEY)
//     return ordersJson ? JSON.parse(ordersJson) : []
//   } catch (error) {
//     console.error("Error loading orders:", error)
//     return []
//   }
// }

// // Save orders to local storage
// export async function saveOrders(orders: any[]) {
//   try {
//     localStorage.setItem(ORDERS_KEY, JSON.stringify(orders))
//     return orders
//   } catch (error) {
//     console.error("Error saving orders:", error)
//     throw error
//   }
// }

// // Load products from local storage
// export async function loadProducts() {
//   try {
//     const productsJson = localStorage.getItem(PRODUCTS_KEY)
//     return productsJson ? JSON.parse(productsJson) : []
//   } catch (error) {
//     console.error("Error loading products:", error)
//     return []
//   }
// }

// // Save products to local storage
// export async function saveProducts(products: any[]) {
//   try {
//     localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products))
//     return products
//   } catch (error) {
//     console.error("Error saving products:", error)
//     throw error
//   }
// }

// // Load bake sales from local storage
// export async function loadBakeSales() {
//   try {
//     const bakeSalesJson = localStorage.getItem(BAKE_SALES_KEY)
//     return bakeSalesJson ? JSON.parse(bakeSalesJson) : []
//   } catch (error) {
//     console.error("Error loading bake sales:", error)
//     return []
//   }
// }

// // Save bake sales to local storage
// export async function saveBakeSales(bakeSales: any[]) {
//   try {
//     localStorage.setItem(BAKE_SALES_KEY, JSON.stringify(bakeSales))
//     return bakeSales
//   } catch (error) {
//     console.error("Error saving bake sales:", error)
//     throw error
//   }
// }

// // Load bake sale periods from local storage
// export async function loadBakeSalePeriods() {
//   try {
//     const bakeSalePeriodsJson = localStorage.getItem(BAKE_SALE_PERIODS_KEY)
//     return bakeSalePeriodsJson ? JSON.parse(bakeSalePeriodsJson) : []
//   } catch (error) {
//     console.error("Error loading bake sale periods:", error)
//     return []
//   }
// }

// // Save bake sale periods to local storage
// export async function saveBakeSalePeriods(bakeSalePeriods: any[]) {
//   try {
//     localStorage.setItem(BAKE_SALE_PERIODS_KEY, JSON.stringify(bakeSalePeriods))
//     return bakeSalePeriods
//   } catch (error) {
//     console.error("Error saving bake sale periods:", error)
//     throw error
//   }
// }
