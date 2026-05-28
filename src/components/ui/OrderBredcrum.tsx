import { Link } from "react-router-dom";

interface BreadcrumbProps {
  orderId?: string;
}

const OrderBreadcrum = ({ orderId }: BreadcrumbProps) => {
  return (
    <nav className="text-sm text-gray-500 mb-4">
      <ul className="flex flex-wrap gap-2 items-center">
        <li>
          <Link to="/" className="hover:text-blue-600">Home</Link>
        </li>
        <li>/</li>
        <li>
          <Link to="/account" className="hover:text-blue-600">My Account</Link>
        </li>
        <li>/</li>
        <li>
          <Link to="/account/orders" className="hover:text-blue-600">My Orders</Link>
        </li>
        {orderId && (
          <>
            <li>/</li>
            <li className="font-semibold text-gray-800 break-all">{orderId}</li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default OrderBreadcrum;
