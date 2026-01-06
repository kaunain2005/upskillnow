import { Suspense } from "react";
import NotesClient from "./NotesClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Loading notes...</div>}>
      <NotesClient />
    </Suspense>
  );
}
