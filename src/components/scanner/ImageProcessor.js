// src/components/scanner/ImageProcessor.js
export const applyBWFilter = (base64) => {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = `data:image/jpeg;base64,${base64}`;

        img.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            canvas.width = img.width;
            canvas.height = img.height;

            ctx.drawImage(img, 0, 0);
            ctx.filter = "grayscale(100%) contrast(140%) brightness(110%)";
            ctx.drawImage(canvas, 0, 0);

            resolve(canvas.toDataURL("image/jpeg").split(",")[1]);
        };
    });
};
