import { Link } from "react-router";

export function Logo() {
  return (
    <figure className="flex items-center">
      <Link to="/">
        <img
          src="/logo.svg"
          alt="brand logo"
          className="w-24 sm:w-32 md:w-36 lg:w-44 xl:w-48 max-w-full"
        />
      </Link>
    </figure>
  );
}
