import axios from 'axios';


export const fetchProducts = async () => {
  try {
    const response = await axios.get(`/products`);
    return response.data;
  } catch (error) {
    throw error.response.data || error.message;
  }
};

// You can add more product-related API calls here (e.g., addProduct, updateProduct, deleteProduct) 