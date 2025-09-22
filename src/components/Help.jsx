import React from "react";

const Help = () => {
  const handleFeedbackRedirect = () => {
    // Replace this URL with your actual Google Form URL
    const googleFormUrl = "https://forms.gle/Kr14cxgdvpKtJtc16";
    window.open(googleFormUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg text-center">
      <div className="bg-blue-50 p-6 rounded-lg mb-6 border border-blue-200">
        <h3 className="text-lg font-bold text-gray-700 mb-4">Help/Support</h3>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Contact Links */}
          <div className="flex flex-col space-y-3">
            <a
              href="https://wa.me/919265318453"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center md:justify-start text-blue-600 hover:text-blue-700 transition-colors"
            >
              <span className="text-xl mr-3">📱</span>
              <span className="text-sm hover:underline font-medium">
                +91 9265318453 (WhatsApp/Call)
              </span>
            </a>
            <a
              href="mailto:info.vegbazar@gmail.com"
              className="flex items-center justify-center md:justify-start text-blue-600 hover:text-blue-700 transition-colors"
            >
              <span className="text-xl mr-3">📧</span>
              <span className="text-sm hover:underline font-medium">
                info.vegbazar@gmail.com
              </span>
            </a>
          </div>

          {/* Feedback Button */}
          <button
            onClick={handleFeedbackRedirect}
            className="bg-[#0e540b] text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-md min-w-40 flex items-center justify-center"
          >
            <span className="mr-2">📝</span>
            Feedback Form
          </button>
        </div>
      </div>
    </div>
  );
};

export default Help;