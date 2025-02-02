import { Link } from "react-router";

export function Logo() {
  return (
    <figure>
      <Link to="/">
        <img src="/logo.svg" alt="brand logo" width={250} />
      </Link>
    </figure>
  );
}
