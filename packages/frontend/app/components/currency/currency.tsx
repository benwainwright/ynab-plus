import type { ReactNode } from "react";

interface CurrencyProps {
  children: number | string;
}

export const Currency = ({ children }: CurrencyProps): ReactNode => {
  const theAmount = typeof children === "string" ? Number.parseInt(children, 10) : children;
  return (
    <>
      {new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: "GBP"
      }).format(theAmount / 1000)}
    </>
  );
};
