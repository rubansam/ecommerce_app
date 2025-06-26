import axios from 'axios';
import { IGetProductsResponse } from 'models';
import type { AxiosResponse } from 'axios';

const isProduction = process.env.NODE_ENV === 'production';

const RETRY_LIMIT = 3;
const RETRY_DELAY = 1000; // ms

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const getProducts = async () => {
  let lastError: any = null;

  for (let attempt = 1; attempt <= RETRY_LIMIT; attempt++) {
    try {
      let response: AxiosResponse<IGetProductsResponse>;;

      if (isProduction) {
        response = await axios.get(
          'https://react-shopping-cart-67954.firebaseio.com/products.json'
        );

        // HTTP status code validation
        if (response.status < 200 || response.status >= 300) {
          throw new Error(`Server responded with status ${response.status}`);
        }
      } else {
        // Simulate async for local require
        const localData = require('static/json/products.json');
        response = {
          data: localData,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {},
        };
      }

      const { products } = response.data.data || {};
      if (!products) {
        throw new Error('No products found in response.');
      }

      return products;
    } catch (error: any) {
      lastError = error;
      // Network error handling
      if (axios.isAxiosError(error)) {
        if (!error.response) {
          // Network error (no response)
          if (attempt < RETRY_LIMIT) {
            await delay(RETRY_DELAY);
            continue;
          }
          throw new Error('Network error: Unable to reach the server. Please check your connection.');
        }
      }
      // For other errors or after retries
      if (attempt < RETRY_LIMIT) {
        await delay(RETRY_DELAY);
      } else {
        throw new Error(
          error.message ||
          'An unexpected error occurred while fetching products. Please try again later.'
        );
      }
    }
  }
  // If all retries fail, throw the last error
  throw lastError;
};