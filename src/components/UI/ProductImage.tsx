

export default function ProductImage() {
  // All image paths relative to public folder
  const mainImage = "/girl_dress.png";
//   const thumbnailImages = [
//     "/images/thumb1.jpg",
//     "/images/thumb2.jpg",
//     "/images/thumb3.jpg",
//     "/images/thumb4.jpg", 
//   ];

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className=" flex items-center justify-center rounded">
        <img
          src={mainImage}
          alt="Main Product"
          className="object-contain w-full h-auto"
        />
      </div>

      {/* Thumbnails
      <div className="grid grid-cols-4 gap-2">
        {thumbnailImages.slice(0, 3).map((thumb, index) => (
          <img
            key={index}
            src={thumb}
            className="rounded"
            alt={`Thumbnail ${index + 1}`}
          />
        ))}
        {thumbnailImages.length > 3 && (
          <div className="rounded border text-center flex items-center justify-center text-sm">
            {thumbnailImages.length - 3}+
          </div>
        )}
      </div> */}
    </div>
  );
}




