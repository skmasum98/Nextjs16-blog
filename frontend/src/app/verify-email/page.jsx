import React, { Suspense } from "react";
import VerifyEmailPageComponent from "./VerifyEmailComponent";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Verifying email...</div>}>
      <VerifyEmailPageComponent />
    </Suspense>
  );
}
