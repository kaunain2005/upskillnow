"use client";
import { useState } from "react";
import ListStudentsPage from "../list/page";

export default function UpdateStudentPage() {
    const [isDeleted, setIsDeleted] = useState(true);
    return (
        <ListStudentsPage isDeleted={isDeleted} name="Update Student 👩‍ 🎓" />
    );
}