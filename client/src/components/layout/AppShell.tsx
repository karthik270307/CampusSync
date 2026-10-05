import type { ReactNode } from "react";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const AppShell = ({
  children,
}: {
  children: ReactNode;
}) => {
  return (
    <div className="flex min-h-screen bg-[#f4f1ea]">

      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">

        <Topbar />

        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {children}
        </main>

      </div>

    </div>
  );
};

export default AppShell;
