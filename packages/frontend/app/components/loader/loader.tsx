import type { ReactNode } from "react";

interface LoaderProps<TData> {
  data: TData | undefined;
  children: (data: TData) => ReactNode;
}

export const Loader = <TData,>({ data, children }: LoaderProps<TData>): ReactNode => {
  if (data === undefined) {
    return <div aria-busy />;
  }

  return children(data);
};
