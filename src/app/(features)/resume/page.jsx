'use client';

import { useState } from 'react';
import { FiDownload, FiExternalLink } from 'react-icons/fi';
import { MdPictureAsPdf } from 'react-icons/md';

const ResumeTemplatesPage = () => {
  const [resumeTemplates] = useState([
    {
      id: 1,
      name: 'Modern Professional',
      description: 'Clean and modern resume template perfect for tech professionals',
      pdfUrl: 'https://s3.resume.io/cdn-cgi/image/width=380,format=auto/uploads/local_template_image/image/383/persistent-resource/santiago-resume-templates.jpg?v=1656070649',
      thumbnail: '/templates/thumbnails/modern-professional.png',
      category: 'Modern',
    },
    {
      id: 2,
      name: 'Creative Resume',
      description: 'Bold and creative template for designers and creative professionals',
      pdfUrl: '/templates/creative.pdf',
      thumbnail: '/templates/thumbnails/creative.png',
      category: 'Creative',
    },
    {
      id: 3,
      name: 'Executive CV',
      description: 'Professional CV template for executive and management roles',
      pdfUrl: '/templates/executive.pdf',
      thumbnail: '/templates/thumbnails/executive.png',
      category: 'Executive',
    },
    {
      id: 4,
      name: 'Simple Elegant',
      description: 'Minimal and elegant resume template with classic design',
      pdfUrl: '/templates/simple-elegant.pdf',
      thumbnail: '/templates/thumbnails/simple-elegant.png',
      category: 'Minimal',
    },
    {
      id: 5,
      name: 'ATS-Friendly',
      description: 'Optimized for Applicant Tracking Systems, simple but effective',
      pdfUrl: '/templates/ats-friendly.pdf',
      thumbnail: '/templates/thumbnails/ats-friendly.png',
      category: 'Technical',
    },
    {
      id: 6,
      name: 'Two-Column Layout',
      description: 'Modern two-column design for better organization of information',
      pdfUrl: '/templates/two-column.pdf',
      thumbnail: '/templates/thumbnails/two-column.png',
      category: 'Modern',
    },
  ]);

  const handleOpenPDF = (pdfUrl) => {
    window.open(pdfUrl, '_blank');
  };

  const handleDownloadPDF = (pdfUrl, templateName) => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `${templateName}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-200">
      {/* Header */}
      <div className="mt-15 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Resume Templates
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Choose from our collection of professional resume templates. Preview and download the perfect template for your career.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resumeTemplates.map((template) => (
            <div
              key={template.id}
              className="group bg-white dark:bg-gray-900 rounded-lg shadow-md dark:shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-xl dark:hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* Thumbnail/Preview Section */}
              <div className="relative w-full h-64 bg-gray-100 dark:bg-gray-800 overflow-hidden">
                {/* PDF Icon Placeholder */}
                <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                  <MdPictureAsPdf className="text-6xl text-red-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    PDF Preview
                  </span>
                </div>

                {/* Category Badge */}
                <div className="absolute top-3 right-3">
                  <span className="inline-block bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    {template.category}
                  </span>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {template.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {template.description}
                </p>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenPDF(template.pdfUrl)}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 rounded-lg transition-colors duration-200"
                  >
                    <FiExternalLink size={16} />
                    <span>Preview</span>
                  </button>
                  <button
                    onClick={() => handleDownloadPDF(template.pdfUrl, template.name)}
                    className="flex-1 flex items-center justify-center gap-2 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-medium py-2 px-3 rounded-lg transition-colors duration-200"
                  >
                    <FiDownload size={16} />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {resumeTemplates.length === 0 && (
          <div className="text-center py-16">
            <MdPictureAsPdf className="text-6xl text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Templates Available
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Resume templates will be available soon. Check back later!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeTemplatesPage;
