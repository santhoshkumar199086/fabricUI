import React from "react";

const ErrorMessage = () => (
  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center justify-center text-center">
    <i className="ri-error-warning-line mr-2 text-red-700 text-lg"></i>
    <span className="text-lg">No Information found</span>
  </div>
);

export default ErrorMessage;