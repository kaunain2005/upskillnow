// src/components/admin/DeleteConfirmationModal.jsx

import React from 'react';
import { X, Trash2, AlertTriangle } from 'lucide-react';

export default function DeleteConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    noteTitle,
    noteId,
    isDeleting,
    imageSrc // New prop for image source
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg mx-auto p-6 transition-all transform scale-100 opacity-100">

                {/* Header */}
                <div className="flex justify-between items-center border-b pb-3 mb-4 dark:border-gray-700">
                    <h3 className="text-xl font-bold text-red-600 dark:text-red-400 flex items-center">
                        <AlertTriangle className="w-6 h-6 mr-2" />
                        Confirm Deletion
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Body Content */}
                <div className="space-y-4">
                    <p className="text-gray-700 dark:text-gray-300">
                        You are about to permanently delete the following note:
                    </p>

                    <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg text-sm font-medium">
                        <p className="font-semibold text-red-800 dark:text-red-300">
                            Title: {noteTitle}
                        </p>
                        <p className="text-red-600 dark:text-red-400 truncate">
                            ID: {noteId}
                        </p>
                    </div>

                    {/* Image Placeholder/Display */}
                    {imageSrc && (
                        <div className="mt-4 flex flex-col items-center">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                Resource Preview (if available)
                            </p>
                            {/* In a real app, you would safely display a thumbnail based on fileType */}
                            <div className="w-full h-32 bg-gray-200 dark:bg-gray-700 flex items-center justify-center rounded-lg overflow-hidden">
                                {
                                    // Simple logic: if it looks like a video, show a play icon
                                    imageSrc.includes('youtube') || imageSrc.includes('video') ? (
                                        <span className="text-gray-600 dark:text-gray-400 text-sm">
                                            Video Link: {imageSrc.substring(0, 30)}...
                                        </span>
                                    ) : (
                                        // Placeholder for a generic document/link image
                                        <Trash2 className="w-10 h-10 text-red-400" />
                                    )
                                }
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Buttons */}
                <div className="mt-6 flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        disabled={isDeleting}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex items-center px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:bg-red-400 transition-colors"
                        disabled={isDeleting}
                    >
                        {isDeleting ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Deleting...
                            </>
                        ) : (
                            <>
                                <Trash2 className="w-5 h-5 mr-2" /> Delete
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}