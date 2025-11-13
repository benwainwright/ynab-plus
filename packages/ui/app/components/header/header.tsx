import { Link } from "react-router";

interface HeaderProps {
  title: string;
}

export const Header = ({ title }: HeaderProps) => {
  return (
    <header>
      <nav>
        <ul>
          <li>
            <h1>{title}</h1>
          </li>
        </ul>
        <ul>
          <li>
            <Link to={""}>Home</Link>
          </li>
          <li>
            <Link to={"login"}>Login</Link>
          </li>
          <li>
            <Link to={"register"}>Register</Link>
          </li>
          <li>
            <Link to={"logout"}>Logout</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};
