import { Footer, Header } from "@components";
import { Suspense, type ReactNode } from "react";

interface AppProps {
  children: ReactNode;
}

export const AppLayout = ({ children }: AppProps) => {
  return (
    <Suspense fallback={<div aria-busy></div>}>
      <Header title="YNAB Plus!" />
      {children}
      <Footer />
    </Suspense>
  );
};
