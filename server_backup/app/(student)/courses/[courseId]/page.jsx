import CourseViewClient from "./CourseViewClient";

// 1. This runs on the server at build time
export async function generateStaticParams() {
    // For Capacitor, we usually return an empty array 
    // and let the client handle the fetch.
    return []; 
}

export default function Page({ params }) {
    // Pass params down to the Client Component
    return <CourseViewClient params={params} />;
}