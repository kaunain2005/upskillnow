// src/app/utils/fileUtils.js
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { FileOpener } from "@capacitor-community/file-opener";

export const openPdf = async (fileName) => {
    await FileOpener.open({
        filePath: `file://${Directory.Documents}/${fileName}`,
        contentType: "application/pdf",
    });
};

// 📤 Share PDF
export const sharePdf = async (fileName) => {
    await Share.share({
        title: "My PDF",
        url: `file://${Directory.Documents}/${fileName}`,
    });
};

// 📄 Get all PDFs
export const getAllPdfs = async () => {
    const result = await Filesystem.readdir({
        directory: Directory.Documents,
        path: "",
    });

    return result.files.filter(file => file.name.endsWith(".pdf"));
};

// ❌ Delete PDF
export const deletePdf = async (fileName) => {
    await Filesystem.deleteFile({
        directory: Directory.Documents,
        path: fileName,
    });
};

// 📂 Get PDF path (for sharing/opening)
export const getPdfPath = (fileName) => {
    return `${Directory.Documents}/${fileName}`;
};
