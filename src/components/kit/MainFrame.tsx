import type { ReactNode } from "react";

/** The one page frame: phone-width column with room for the bottom nav. Screens own their horizontal padding. */
export default function MainFrame({ children }: { children: ReactNode }) {
  return (
    <main id="main-content" className="mx-auto min-h-screen max-w-[600px] pb-24">
      {children}
    </main>
  );
}
