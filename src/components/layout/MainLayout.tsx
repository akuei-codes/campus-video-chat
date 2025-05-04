
import { PropsWithChildren } from 'react';
import Navbar from './Navbar';

const MainLayout = ({ children }: PropsWithChildren) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">{children}</main>
      <footer className="py-6 md:px-8 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} IvyTV. All rights reserved.
          </p>
          <p className="text-center text-xs text-muted-foreground md:text-right">
            For Ivy League students only.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
