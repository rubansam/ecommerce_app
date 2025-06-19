import React from 'react';
// Assuming your ErrorMessage component is in the same directory or a similar path
import ErrorMessage from './ErrorMessage'; // Adjust this path if your ErrorMessage component is elsewhere

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error: error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
    // For example, if you had an external logging service:
    // logErrorToMyService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <ErrorMessage
          title="Something went wrong."
          message={"Oops Something Went Wrong."}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 