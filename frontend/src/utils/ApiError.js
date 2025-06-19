class ApiError extends Error {
  constructor(message, status = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status; // Optional: store HTTP status code
    // You can also store other details like error code, original response data, etc.

    // Restore prototype chain
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export default ApiError; 