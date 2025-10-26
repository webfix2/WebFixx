"use client";

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faFileImport, faSpinner } from '@fortawesome/free-solid-svg-icons';

type Tool = 'emailSorter' | 'emailExtractor';

export default function Tools() {
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string[]>([]);

  const handleFileUpload = async (file: File) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Implementation for file processing
      // const response = await processFile(formData, selectedTool);
      // setResult(response.data);
    } catch (error) {
      console.error('Error processing file:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Developer Tools</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Powerful tools to help with your development workflow. Need a custom tool?
          Fill out our survey below.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div 
          className={`p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-none cursor-pointer transition-all
            ${selectedTool === 'emailSorter' ? 'ring-2 ring-blue-500' : 'hover:shadow-lg'}`}
          onClick={() => setSelectedTool('emailSorter')}
        >
          <FontAwesomeIcon icon={faEnvelope} className="w-6 h-6 text-blue-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Email Sorter</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Sort and validate email lists, remove duplicates, and format for various platforms.
          </p>
        </div>

        <div 
          className={`p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-none cursor-pointer transition-all
            ${selectedTool === 'emailExtractor' ? 'ring-2 ring-blue-500' : 'hover:shadow-lg'}`}
          onClick={() => setSelectedTool('emailExtractor')}
        >
          <FontAwesomeIcon icon={faFileImport} className="w-6 h-6 text-blue-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Email Extractor</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Extract email addresses from text files, websites, or raw content.
          </p>
        </div>
      </div>

      {selectedTool && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-none p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            {selectedTool === 'emailSorter' ? 'Email Sorter' : 'Email Extractor'}
          </h3>
          
          <div className="mb-4">
            <input
              type="file"
              accept=".txt,.csv"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
              className="block w-full text-sm text-gray-500 dark:text-gray-300
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700 dark:file:bg-blue-900 dark:file:text-blue-300
                hover:file:bg-blue-100 dark:hover:file:bg-blue-800"
            />
          </div>

          {loading && (
            <div className="flex items-center justify-center py-4">
              <FontAwesomeIcon icon={faSpinner} className="w-6 h-6 text-blue-500 animate-spin" />
            </div>
          )}

          {result.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Results:</h4>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md max-h-60 overflow-y-auto">
                {result.map((item, index) => (
                  <div key={index} className="text-sm text-gray-600 dark:text-gray-300">{item}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Survey Form */}
      <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-none p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Request Custom Development</h2>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              What type of tool do you need?
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Describe the tool you need"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Use Case
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              rows={4}
              placeholder="Describe how you plan to use this tool"
            />
          </div>
          <button
            type="submit"
            className="btn-primary"
          >
            Submit Request
          </button>
        </form>
      </div>
    </div>
  );
}
