// src/app/(features)/scan/page.jsx
"use client";

import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { useState } from "react";
import Link from "next/link"; // Added Link for navigation
import {
    Camera as CameraIcon,
    Eye,
    Save,
    FileText,
    Zap,
    ZapOff,
    X,
    Home // Added Home icon
} from "lucide-react";

import { applyBWFilter } from "@/components/scanner/ImageProcessor";
import {
    createPdfFromImages,
    previewPdfFromImages
} from "@/components/scanner/PdfService";

export default function ScanPage() {
    const [pages, setPages] = useState([]);
    const [bwf, setBwf] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);

    const scanPage = async () => {
        const photo = await Camera.getPhoto({
            quality: 90,
            allowEditing: true,
            resultType: CameraResultType.Base64,
            source: CameraSource.Camera,
        });

        let image = photo.base64String;
        if (bwf) image = await applyBWFilter(image);

        setPages(prev => [...prev, image]);
    };

    const previewPDF = () => {
        const url = previewPdfFromImages(pages);
        setPreviewUrl(url);
    };

    const savePDF = async () => {
        try {
            await createPdfFromImages(pages);
            alert("PDF saved in Documents folder");
        } catch (err) {
            console.error(err);
            alert("PDF save failed");
        }
    };

    return (
        <div className="h-dvh bg-gray-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 pb-24">
            {/* HEADER */}
            <header className="sticky top-0 z-10 backdrop-blur-md bg-white/70 dark:bg-slate-900/70 border-b border-gray-200 dark:border-slate-800 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div>
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <FileText className="text-blue-600 w-5 h-5" />
                            Scan Document
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{pages.length} Pages Captured</p>
                    </div>
                </div>

                {/* HOME BUTTON */}
                <Link
                    href="/"
                    className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-600 dark:text-slate-400"
                    aria-label="Go to home"
                >
                    <Home className="w-6 h-6" />
                </Link>

                {/* <button
                    onClick={() => setBwf(prev => !prev)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${bwf
                        ? "bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400 shadow-sm"
                        : "bg-gray-100 text-gray-500 dark:bg-slate-800 dark:text-slate-400"
                        }`}
                >
                    {bwf ? <Zap className="w-3.5 h-3.5" /> : <ZapOff className="w-3.5 h-3.5" />}
                    B&W
                </button> */}
            </header>

            <main className="p-6">
                {/* EMPTY STATE */}
                {pages.length === 0 && (
                    <div className="mt-20 flex flex-col items-center text-center opacity-40">
                        <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-slate-800 flex items-center justify-center mb-4">
                            <CameraIcon className="w-10 h-10" />
                        </div>
                        <p className="text-lg font-medium">No pages scanned yet</p>
                        <p className="text-sm">Tap the button below to start</p>
                    </div>
                )}

                {/* PAGE PREVIEW (THUMBNAILS) */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {pages.map((_, i) => (
                        <div key={i} className="group relative aspect-[3/4] bg-white dark:bg-slate-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-slate-700 flex flex-col items-center justify-center shadow-sm hover:border-blue-500 transition-colors">
                            <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2">
                                {i + 1}
                            </div>
                            <span className="text-xs font-semibold uppercase tracking-wider opacity-60">Page</span>
                        </div>
                    ))}
                </div>
            </main>

            {/* FLOATING ACTION BAR */}
            <div className="fixed bottom-6 left-1/2 z-9 -translate-x-1/2 flex items-center gap-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl p-3 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 w-[90%] max-w-md">
                <button
                    onClick={scanPage}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-blue-600/20"
                >
                    <CameraIcon className="w-5 h-5" />
                    Scan
                </button>

                <button
                    onClick={previewPDF}
                    disabled={!pages.length}
                    className="flex-1 flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-700 disabled:opacity-50 disabled:grayscale text-slate-700 dark:text-white py-3 rounded-xl font-bold transition-all active:scale-95"
                >
                    <Eye className="w-5 h-5" />
                    Preview
                </button>
            </div>

            {/* PDF MODAL PREVIEW */}
            {previewUrl && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm p-4 flex flex-col">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-2xl mx-auto rounded-3xl overflow-hidden flex flex-col h-full shadow-2xl">
                        <div className="p-4 border-b dark:border-slate-800 flex justify-between items-center">
                            <h3 className="font-bold">PDF Preview</h3>
                            <button onClick={() => setPreviewUrl(null)} className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <iframe src={previewUrl} className="flex-1 w-full border-none" title="PDF Preview" />

                        <div className="p-4 bg-gray-50 dark:bg-slate-900 border-t dark:border-slate-800">
                            <button
                                onClick={savePDF}
                                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl font-bold shadow-lg shadow-green-600/20 transition-all active:scale-[0.98]"
                            >
                                <Save className="w-5 h-5" />
                                Save to Device
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}