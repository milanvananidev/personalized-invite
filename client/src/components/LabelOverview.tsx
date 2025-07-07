
import React from 'react';
import { TextElement } from '../hooks/useTextManager';

interface LabelOverviewProps {
  textElements: TextElement[];
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export const LabelOverview: React.FC<LabelOverviewProps> = ({
  textElements,
  totalPages,
  currentPage,
  onPageChange
}) => {
  const getPageElements = (pageNum: number) => {
    return textElements.filter(element => element.page === pageNum);
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Text Elements Overview
      </h2>
      
      <div className="space-y-3">
        {Array.from({ length: totalPages }, (_, i) => {
          const pageNum = i + 1;
          const elements = getPageElements(pageNum);
          const isCurrentPage = pageNum === currentPage;
          
          return (
            <div
              key={pageNum}
              className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                isCurrentPage
                  ? 'border-purple-300 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => onPageChange(pageNum)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className={`font-medium ${isCurrentPage ? 'text-purple-800' : 'text-gray-700'}`}>
                    Page {pageNum}
                  </span>
                  {isCurrentPage && (
                    <span className="ml-2 px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded">
                      Current
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-xs text-gray-500">
                    {elements.length} element{elements.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              
              {elements.length > 0 && (
                <div className="mt-2 space-y-1">
                  {elements.slice(0, 3).map((element) => (
                    <div key={element.id} className="text-xs">
                      <span
                        className="inline-block px-2 py-1 rounded"
                        style={{ 
                          backgroundColor: `${element.color}20`, 
                          color: element.color,
                          fontFamily: element.fontFamily
                        }}
                      >
                        {element.text} (X: {Math.round(element.x)}, Y: {Math.round(element.y)})
                      </span>
                    </div>
                  ))}
                  {elements.length > 3 && (
                    <div className="text-xs text-gray-400">
                      +{elements.length - 3} more...
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
