import { Suspense } from "react";
import BlogsPage from "./BlogsPage";

export default function Blogs() {
  return (
    <Suspense fallback={<div>Loading blogs...</div>}>
      <BlogsPage />
    </Suspense>
  );
}