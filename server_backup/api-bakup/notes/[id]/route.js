// src/app/api/notes/[id]/route.js

import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Note from '@/models/Note';

/**
 * DELETE handler for /api/notes/[id]
 * Deletes a single note by its ID.
 */
export async function DELETE(request, { params }) {
    const { id } = params;

    if (!id) {
        return NextResponse.json({ success: false, message: 'Note ID is required for deletion.' }, { status: 400 });
    }

    try {
        await dbConnect();

        const deletedNote = await Note.findByIdAndDelete(id);

        if (!deletedNote) {
            return NextResponse.json({ success: false, message: `Note with ID ${id} not found.` }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: `Note ID ${id} deleted successfully.`,
            deletedId: id
        }, { status: 200 });

    } catch (error) {
        console.error("Deletion Error:", error);
        return NextResponse.json({
            success: false,
            message: 'An error occurred during note deletion.',
            error: error.message
        }, { status: 500 });
    }
}