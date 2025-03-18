
import React from 'react';

export const SearchLoadingState = () => {
  return (
    <div className="flex justify-center items-center p-10">
      <div className="text-center">
        <div className="mb-4">
          <div className="h-20 w-20 mx-auto">
            <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-[#8B5CF6]"></div>
          </div>
        </div>
        <p className="text-gray-500">Searching for LinkedIn profiles...</p>
      </div>
    </div>
  );
};
