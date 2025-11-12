import { useFooterMessage } from "@hooks";

export const Footer = () => {
  const message = useFooterMessage();

  return (
    <footer>
      <p>{message ? message.message : null}</p>
    </footer>
  );
};
