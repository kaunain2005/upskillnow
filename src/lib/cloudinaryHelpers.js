// src/lib/cloudinaryHelpers.js
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function deleteStudentCloudFolder(studentId) {
  if (!studentId) return;

  try {
    await cloudinary.api.delete_resources([`students/${studentId}/profile`]);
    await cloudinary.api.delete_folder(`students/${studentId}`);
    console.log(`Cloudinary folder deleted for student: ${studentId}`);
  } catch (err) {
    console.error(`Cloudinary deletion failed for ${studentId}:`, err.message);
  }
}

export async function deleteMultipleStudentsCloudFolders(studentIds) {
  for (const id of studentIds) {
    await deleteStudentCloudFolder(id);
  }
}
