import { Link } from "react-router";

export default function AdminNavbar() {
  return (
    <nav className="drop-shadow-lg">
      <ul>
        <li>
          <Link to="/">Dashboard</Link>
        </li>
        <li>
          <Link to="requests">Requests</Link>
        </li>
      </ul>
    </nav>
  );
}
