import { Link } from "react-router";

export default function AdminNavbar() {
  return (
    <nav>
      <ul>
        <li>
          <Link to="requests">Requests</Link>
        </li>
      </ul>
    </nav>
  );
}
