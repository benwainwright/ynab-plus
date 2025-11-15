import type { ReactNode } from "react";

interface LoaderProps<TData> {
  isPending: boolean;
  data: TData | undefined;
  children: (data: TData) => ReactNode;
}

export const Loader = <TData,>({
  isPending,
  data,
  children,
}: LoaderProps<TData>) => {
  if (isPending || data === undefined) {
    return <div aria-busy />;
  }

  return children(data);
};
