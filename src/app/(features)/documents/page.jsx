"use client";

import { useEffect, useState } from "react";
import {
    getAllPdfs,
    deletePdf,
    sharePdf
} from "@/app/utils/fileUtils";

export default function DocumentsPage() {
    const [files, setFiles] = useState([]);

    useEffect(() => {
        loadFiles();
    }, []);

    const loadFiles = async () => {
        const pdfs = await getAllPdfs();
        setFiles(pdfs);
    };

    return (
        <div className="docs-container">
            <h2>My Documents</h2>

            {files.map(file => (
                <div key={file.name} className="doc-card">
                    <span>📄 {file.name}</span>

                    <div className="doc-actions">
                        <button onClick={() => openPdf(file.name)}>👁️</button>
                        <button onClick={() => sharePdf(file.name)}>📤</button>
                        <button onClick={() => deleteAndRefresh(file.name)}>❌</button>
                    </div>
                </div>
            ))}
        </div>

    );
}
