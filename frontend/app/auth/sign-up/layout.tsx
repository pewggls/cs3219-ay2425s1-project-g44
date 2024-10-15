import { ReactNode } from "react";

export default function SignUpLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-screen laptop:flex">
        <div className="hidden min-h-screen bg-brand-50 laptop:w-screen laptop:flex laptop:items-center laptop:justify-center">
            <span className="text-4xl font-bold font-branding tracking-tight text-brand-700">PeerPrep</span>
        </div>

        {children}
    </div>
  );
}
