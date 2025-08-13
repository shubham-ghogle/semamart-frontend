import  { useState } from 'react';
import Header from '../Header/Header';

const ordersData = [
  {
    id: 1,
    title: "N AND J Solid Men Polo Neck Navy Blue T-Shirt",
    color: "Navy Blue",
    size: "XXL",
    price: 256,
    status: "Delivered",
    deliveryDate: "Aug 06",
  },
  {
    id: 2,
    title: "Coofandy Men Solid Party Multicolor Shirt",
    color: "Multicolor",
    size: "L",
    price: 391,
    status: "Refund",
    refundDate: "Jul 30 07:41 PM",
    refundId: "12103502078119006364",
    bankRef: "557203579474",
    reason: "The quality was not as expected.",
  },
  {
    id: 3,
    title: "INDICLUB Loose Fit Men Brown Trousers",
    color: "Brown",
    size: "34",
    price: 300,
    status: "Delivered",
    deliveryDate: "Jul 22",
  },
  {
    id: 4,
    title: "INDICLUB Loose Fit Men Brown Trousers",
    color: "Brown",
    size: "34",
    price: 300,
    status: "Order Not Placed",
    errorMessage: "Payment not successful. Please contact your bank for any money deducted.",
  },
];

const MyOrders = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter orders by search term
  const filteredOrders = ordersData.filter(order =>
    order.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className='font-montserrat'>
        <div>
          <Header/>
        </div>
        
    <div className="flex flex-col md:flex-row p-6 bg-gray-50 min-h-screen">
      
      <aside className="md:w-1/4 mb-6 md:mb-0 bg-white p-4 rounded shadow">
        
        <h2 className="text-xl font-semibold mb-4">Filters</h2>

        <div className="mb-6">
          <h3 className="font-medium mb-2">ORDER STATUS</h3>
          <div className="space-y-1">
            <label className="block"><input type="checkbox" className="mr-2" />On the way</label>
            <label className="block"><input type="checkbox" className="mr-2" />Delivered</label>
            <label className="block"><input type="checkbox" className="mr-2" />Cancelled</label>
            <label className="block"><input type="checkbox" className="mr-2" />Returned</label>
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-2">ORDER TIME</h3>
          <div className="space-y-1">
            <label className="block"><input type="checkbox" className="mr-2" />Last 30 days</label>
            <label className="block"><input type="checkbox" className="mr-2" />2024</label>
            <label className="block"><input type="checkbox" className="mr-2" />2023</label>
            <label className="block"><input type="checkbox" className="mr-2" />2022</label>
            <label className="block"><input type="checkbox" className="mr-2" />2021</label>
            <label className="block"><input type="checkbox" className="mr-2" />Older</label>
          </div>
        </div>
      </aside>

      {/* Orders Section */}
      <main className="md:w-3/4 md:pl-8">
        {/* Search */}
        <div className="flex items-center space-x-2 mb-6">
          <input
            type="text"
            className="border border-gray-300 px-4 py-2 w-full rounded-md"
            placeholder="Search your orders here"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="bg-blue-600 text-white py-2 px-3 rounded-md text-center">
            Search
          </button>
        </div>

        {/* Order Cards */}
        <div className="space-y-6">
          {filteredOrders.length === 0 && (
            <p className="text-gray-600">No orders found matching your search.</p>
          )}

        {filteredOrders.map(order => (
  <div
    key={order.id}
    className="border rounded-md p-4 bg-white shadow-sm flex items-start space-x-4"  // changed items-center to items-start
  >
    {/* Image */}
    <img
      src={ "https://via.placeholder.com/60x80"}
      alt={order.title}
      className="w-16 h-20 object-cover flex-shrink-0 rounded"
    />

    {/* Product info, price, delivery, and status */}
    <div className="flex flex-wrap items-start justify-between flex-1"> {/* changed items-center to items-start */}
      {/* Left part: Title + color/size */}
      <div className="flex flex-col min-w-[200px] mr-6">
        <h3 className="text-sm font-semibold">{order.title}</h3>
        <p className="text-xs text-gray-600">
          Color: {order.color} | Size: {order.size}
        </p>
      </div>

      {/* Price */}
      <p className="text-sm text-gray-800 font-medium mr-6 whitespace-nowrap">
        ₹{order.price}
      </p>

      {order.status === "Delivered" && (
  <div className="flex flex-col items-start space-y-1 text-xs">
    <p className="text-green-600 font-medium flex items-center space-x-1">
      <span className="text-green-600 text-lg leading-none">●</span>
      <span>Delivered on {order.deliveryDate}</span>
    </p>
    <p className="text-blue-600 hover:underline font-medium cursor-pointer">
      ★ Rate & Review Product
    </p>
  </div>
)}

{order.status === "Refund" && (
  <div className="flex flex-col items-start space-y-1 text-xs max-w-xs">
    <p className="text-yellow-600 font-medium flex items-center space-x-1">
      <span className="text-yellow-600 text-lg leading-none">●</span>
      <span>Refund Completed</span>
    </p>
    <p className="text-gray-600">
      You returned this order because the quality was not as expected.
    </p>
   
  </div>
)}

{order.status === "Order Not Placed" && (
  <div className="flex flex-col items-start space-y-1 text-xs max-w-xs">
    <p className="text-red-600 font-medium flex items-center space-x-1">
      <span className="text-red-600 text-lg leading-none">●</span>
      <span>Order Not Placed</span>
    </p>
    <p className="text-red-600">
      {order.errorMessage}
    </p>
  </div>
)}


      {/* Other statuses remain unchanged */}
    </div>
  </div>
))}


        </div>
      </main>
    </div>
      </div>
  );
};

export default MyOrders;
