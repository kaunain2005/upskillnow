import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import Course from "@/models/Course";

export async function GET(req) {
    await dbConnect();

    // 1. Extract query parameters from the URL
    const { searchParams } = new URL(req.url);
    const department = searchParams.get('department');
    const year = searchParams.get('year');
    const semester = searchParams.get('semester');

    // 2. Validate essential parameters
    if (!department || !year || !semester) {
        return NextResponse.json(
            { error: "Missing required query parameters: department, year, and semester are mandatory for filtering." },
            { status: 400 }
        );
    }

    try {
        // 3. Construct the query object
        const query = {
            department: department,
            year: year,
            semester: semester,
        };

        // 4. Execute the MongoDB query
        // We only select essential fields for the subject list card view (no need for chapters/modules yet)
        const courses = await Course.find(query).select('title description image department year semester');

        return NextResponse.json(courses);
    } catch (err) {
        console.error("Error fetching filtered courses:", err);
        return NextResponse.json(
            { error: "An internal server error occurred while fetching courses." },
            { status: 500 }
        );
    }
}
