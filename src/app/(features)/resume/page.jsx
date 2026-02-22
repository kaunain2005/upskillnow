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
      pdfUrl: 'https://cdn.avanlo.com/templates/resume/regular/template42.webp',
      thumbnail: '/templates/thumbnails/modern-professional.png',
      category: 'Modern',
    },
    {
      id: 2,
      name: 'Creative Resume',
      description: 'Bold and creative template for designers and creative professionals',
      pdfUrl: 'http://cdn.avanlo.com/templates/resume/regular/template12.webp',
      thumbnail: '/templates/thumbnails/creative.png',
      category: 'Creative',
    },
    {
      id: 3,
      name: 'Executive CV',
      description: 'Professional CV template for executive and management roles',
      pdfUrl: 'https://cdn-images.zety.com/pages/executive-resume-example-ztus-cta-02.webp',
      thumbnail: '/templates/thumbnails/executive.png',
      category: 'Executive',
    },
    {
      id: 4,
      name: 'Simple Elegant',
      description: 'Minimal and elegant resume template with classic design',
      pdfUrl: 'https://cdn.avanlo.com/templates/resume/regular/template4.webp',
      thumbnail: '/templates/thumbnails/simple-elegant.png',
      category: 'Minimal',
    },
    {
      id: 5,
      name: 'ATS-Friendly',
      description: 'Optimized for Applicant Tracking Systems, simple but effective',
      pdfUrl: 'https://cdn.avanlo.com/templates/resume/regular/template4.webp',
      thumbnail: '/templates/thumbnails/ats-friendly.png',
      category: 'Technical',
    },
    {
      id: 6,
      name: 'Two-Column Layout',
      description: 'Modern two-column design for better organization of information',
      pdfUrl: 'https://cdn.avanlo.com/templates/resume/regular/template2.webp',
      thumbnail: '/templates/thumbnails/two-column.png',
      category: 'Two Column',

    },
    {
      id: 7,
      name: 'Corporate Clean',
      description: 'A simple, professional resume with a clean layout, ideal for corporate and ATS-friendly applications.',
      pdfUrl: 'https://cdn.avanlo.com/templates/resume/regular/template11.webp',
      thumbnail: '/templates/thumbnails/two-column.png',
      category: 'Professional',

    },
    {
      id: 8,
      name: 'Structured Cards',
      description: 'A modern resume with neatly organized sections for easy reading and quick scanning by recruiters.',
      pdfUrl: 'https://cdn.avanlo.com/templates/resume/regular/template19.webp',
      thumbnail: '/templates/thumbnails/two-column.png',
      category: 'Modern',

    },
    {
      id: 9,
      name: 'Technical Profile',
      description: 'Clean, skill-focused resume highlighting technical expertise and projects.',
      pdfUrl: 'https://cdn.avanlo.com/templates/resume/regular/template9.webp',
      thumbnail: '/templates/thumbnails/two-column.png',
      category: 'Modern',

    },
    {
      id: 10,
      name: 'Premium Grid',
      description: 'A polished grid-based layout for a structured and professional look.',
      pdfUrl: 'https://cdn.avanlo.com/templates/resume/regular/template18.webp',
      thumbnail: '/templates/thumbnails/two-column.png',
      category: 'Modern',

    },
    {
      id: 11,
      name: 'Full-Width Header with Right Highlight',
      description: 'Bold header with key details emphasized on the right side.',
      pdfUrl: 'https://cdn.avanlo.com/templates/resume/regular/template31.webp',
      thumbnail: '/templates/thumbnails/two-column.png',
      category: 'Modern',

    },
    {
      id: 12,
      name: 'Modern Contrast',
      description: 'Uses subtle contrast to clearly separate sections and improve readability.',
      pdfUrl: 'https://cdn.avanlo.com/templates/resume/regular/template49.webp',
      thumbnail: '/templates/thumbnails/two-column.png',
      category: 'Modern',

    },
    {
      id: 13,
      name: 'Creative Gradient',
      description: 'A modern design with light gradients for a creative yet professional feel.',
      pdfUrl: 'https://cdn.avanlo.com/templates/resume/regular/template12.webp',
      thumbnail: '/templates/thumbnails/two-column.png',
      category: 'Creative',

    },
    {
      id: '14',
      name: 'Dynamic Split',
      description: 'Two-column layout that balances skills and experience effectively.',
      pdfUrl: 'https://cdn.avanlo.com/templates/resume/regular/template44.webp',
      thumbnail: '/templates/thumbnails/two-column.png',
      category: 'Creative',

    },
    {
      id: '15',
      name: 'Minimal Accent',
      description: 'Simple design with small color accents for a clean appearance.',
      pdfUrl: 'https://cdn.avanlo.com/templates/resume/regular/template10.webp',
      thumbnail: '/templates/thumbnails/two-column.png',
      category: 'Simple',

    },
    {
      id: '16',
      name: 'Professional Single Column',
      description: 'Traditional single-column layout optimized for ATS systems.',
      pdfUrl: 'https://cdn.avanlo.com/templates/resume/regular/template1.webp',
      thumbnail: '/templates/thumbnails/two-column.png',
      category: 'Single column',

    },
    {
      id: '17',
      name: 'Bold Professional',
      description: 'Strong headings and typography for a confident, impactful resume.',
      pdfUrl: 'https://cdn.avanlo.com/templates/resume/regular/template7.webp',
      thumbnail: '/templates/thumbnails/two-column.png',
      category: 'Single column',

    },
    {
      id: 18,
      name: 'Framed Narrative',
      description: 'Content framed neatly to guide the recruiter through your story.',
      pdfUrl: 'https://cdn.avanlo.com/templates/resume/regular/template43.webp',
      thumbnail: '/templates/thumbnails/two-column.png',
      category: 'Single column',

    },
    {
      id: 19,
      name: 'Modern Brackets',
      description: 'Stylish bracket elements used to organize sections clearly.',
      pdfUrl: 'https://cdn.avanlo.com/templates/resume/regular/template17.webp',
      thumbnail: '/templates/thumbnails/two-column.png',
      category: 'Modern',

    },
    {
      id: 20,
      name: 'Strategic Asymmetry',
      description: 'Asymmetric layout designed to stand out while staying readable.',
      pdfUrl: 'https://cdn.avanlo.com/templates/resume/regular/template45.webp',
      thumbnail: '/templates/thumbnails/two-column.png',
      category: 'Modern',

    },
    {
      id: 21,
      name: 'Balanced Contrast',
      description: 'A clean resume design using subtle contrast to separate sections while keeping a professional and readable layout.',
      pdfUrl: 'https://cdn.avanlo.com/templates/resume/regular/template47.webp',
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
                  
                  <a href={template.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 rounded-lg transition-colors duration-200"
                  >
                    <FiExternalLink size={16} />
                    <span>Preview</span>
                  </a>

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
