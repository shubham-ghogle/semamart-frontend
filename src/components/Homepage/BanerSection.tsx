import { useEffect, useState } from "react";

export default function BannerSection() {
  const [banners, setBanners] = useState([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    fetch("/api/v2/banner")
      .then(res => res.json())
      .then(data => setBanners(data))
      .catch(err => console.error("Banner fetch error:", err));
  }, []);

  // Rotate images every 1 second if more than 2 images
  useEffect(() => {
    if (banners.length <= 2) return;

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 2) % banners.length); 
    }, 5000); // 5 second

    return () => clearInterval(interval);
  }, [banners]);

  if (banners.length < 2) return <p className="text-center">Loading banners...</p>;

  const first = banners[index];
  const second = banners[(index + 1) % banners.length];

  return (
    <div className="flex gap-4 mt-4">
      <img
        src={first}
        className="w-1/2 rounded-lg object-cover"
        alt="Banner 1"
      />
      <img
        src={second}
        className="w-1/2 rounded-lg object-cover"
        alt="Banner 2"
      />
    </div>
  );
}
