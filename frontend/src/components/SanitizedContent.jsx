// blog-application/frontend/src/components/SanitizedContent.jsx
"use client";

import React from "react";
import * as DOMPurifyModule from "dompurify";

const DOMPurify = DOMPurifyModule.default || DOMPurifyModule;

const SanitizedContent = ({ htmlContent, className }) => {
  const sanitizer =
    typeof window !== "undefined" ? DOMPurify : { sanitize: (html) => html };
  const cleanHtml = sanitizer.sanitize(htmlContent);

  // ... (existing empty content check) ...
  const plainText = cleanHtml.replace(/<[^>]*>/g, "");
  if (!plainText || plainText.trim().length === 0) {
    return null;
  }

  // FIX: Only use the passed-in className
  const finalClassName = className || ""; // Do NOT add 'prose' here

  return (
    <div
      className={finalClassName} // <-- ONLY APPLY CUSTOM CLASS HERE
      dangerouslySetInnerHTML={{ __html: cleanHtml }}
    />
  );
};

export default SanitizedContent;
