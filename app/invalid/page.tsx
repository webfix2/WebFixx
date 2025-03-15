"use client";

export default function InvalidPage() {
  return (
    <main className="p-6 lg:p-12 bg-gray-50 dark:bg-gray-900 min-h-screen flex flex-col items-center justify-center">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Error Message Section */}
        <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg text-center">
          <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Invalid Ticket Transfer Link
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            The ticket transfer link you’re trying to access is either invalid or has expired. 
            Please double-check the link or contact the sender for a new one.
          </p>
        </section>

      </div>
    </main>
  );
}
