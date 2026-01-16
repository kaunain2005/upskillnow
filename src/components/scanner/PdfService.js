// src/components/scanner/PdfService.js
import jsPDF from "jspdf";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Capacitor } from "@capacitor/core";

export const createPdfFromImages = async (images) => {
    const pdf = new jsPDF("p", "mm", "a4");

    images.forEach((img, i) => {
        if (i > 0) pdf.addPage();

        // ✅ ensure correct base64 format
        const imageData = img.startsWith("data:")
            ? img
            : `data:image/jpeg;base64,${img}`;

        pdf.addImage(imageData, "JPEG", 10, 10, 190, 270);
    });

    const fileName = `scan_${Date.now()}.pdf`;

    // 🌐 WEB (Browser)
    if (Capacitor.getPlatform() === "web") {
        pdf.save(fileName);
        return;
    }

    // 📱 ANDROID (Capacitor)
    const pdfBase64 = pdf.output("datauristring").split(",")[1];

    const result = await Filesystem.writeFile({
        path: fileName,
        data: pdfBase64,
        directory: Directory.Documents,
        recursive: true,
    });

    console.log("PDF saved at:", result.uri);
};

export const previewPdfFromImages = (images) => {
    const pdf = new jsPDF("p", "mm", "a4");

    images.forEach((img, i) => {
        if (i > 0) pdf.addPage();

        const imageData = img.startsWith("data:")
            ? img
            : `data:image/jpeg;base64,${img}`;

        pdf.addImage(imageData, "JPEG", 10, 10, 190, 270);
    });

    return pdf.output("bloburl");
};
