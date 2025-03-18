
import React from 'react';

export const EmptySearchState = () => {
  return (
    <div className="bg-gray-50 text-gray-500 p-8 rounded-md border border-gray-200 text-center">
      <p className="mb-2">No LinkedIn profiles found matching your search criteria.</p>
      <p>Try modifying your search terms or click the Search button to retry.</p>
    </div>
  );
};
