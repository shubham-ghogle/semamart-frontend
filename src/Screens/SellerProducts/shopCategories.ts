// src/data/shopCategories.ts
const shopCategories = [
  {
    id: "c2",
    name: "What's New",
    slug: "/shop/whats-new",
    subcategories: [
      { id: "c2s1", name: "All Models", slug: "/shop/whats-new/all" },
      { id: "c2s2", name: "New Arrivals", slug: "/shop/whats-new/arrivals" },
    ],
  },
  { id: "c3", name: "Shop Deals", slug: "/shop/deals" },
  {
    id: "c4",
    name: "iPhone",
    slug: "/shop/iphone",
    subcategories: [
      { id: "c4s1", name: "iPhone 15", slug: "/shop/iphone/15" },
      { id: "c4s2", name: "Cases", slug: "/shop/iphone/cases" },
    ],
  },
  { id: "c5", name: "iPad", slug: "/shop/ipad" },
  { id: "c6", name: "Apple Watch", slug: "/shop/watch" },
  { id: "c7", name: "AirPods", slug: "/shop/airpods" },
  { id: "c8", name: "Mac Laptops", slug: "/shop/mac-laptops" },
  { id: "c9", name: "Accessories", slug: "/shop/accessories" },
];

export default shopCategories;
