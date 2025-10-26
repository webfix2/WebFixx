"use client";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCode, faRocket, faLightbulb } from '@fortawesome/free-solid-svg-icons';

export default function CustomDevelopment() {
  return (
    <div className="p-6 dark:bg-gray-900 dark:text-gray-100 min-h-screen flex flex-col items-center justify-center">
      <div className="max-w-4xl mx-auto text-center">
        <FontAwesomeIcon icon={faCode} className="w-16 h-16 text-blue-600 dark:text-blue-400 mb-6" />
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
          Custom Development Services
        </h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
          Need a tailor-made solution? Our expert team can build custom applications, integrations, and features to perfectly fit your unique business requirements. From concept to deployment, we're here to bring your vision to life.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md dark:shadow-none">
            <FontAwesomeIcon icon={faLightbulb} className="w-8 h-8 text-green-500 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Innovative Solutions</h3>
            <p className="text-gray-600 dark:text-gray-400">
              We craft cutting-edge solutions designed to give you a competitive edge.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md dark:shadow-none">
            <FontAwesomeIcon icon={faRocket} className="w-8 h-8 text-purple-500 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Scalable Architecture</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Build for growth with robust and scalable application architectures.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md dark:shadow-none">
            <FontAwesomeIcon icon={faCode} className="w-8 h-8 text-red-500 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Seamless Integration</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Integrate with your existing systems for a unified workflow.
            </p>
          </div>
        </div>

        <button className="px-8 py-4 bg-blue-600 text-white text-xl font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200">
          Request a Custom Quote
        </button>
      </div>
    </div>
  );
}
