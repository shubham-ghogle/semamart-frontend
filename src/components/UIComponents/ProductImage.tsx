type ProductImageProps = {
  images: string[];
};
export default function ProductImage({ images = [] }: ProductImageProps) {
  const mainImage = images[0];
  const thumbnailImages = images.slice(1);

  return (
    <div className="w-[521px] h-[541px] rotate-0 opacity-100 space-y-4">
      {/* Main Image */}
      <div className="flex items-center justify-center border rounded-lg p-4 bg-white">
        {mainImage ? (
          <img
            src={`http://localhost:8000/uploads/${mainImage}`}
            alt="Main Product"
            className="object-contain max-h-[400px] w-auto"
          />
        ) : (
          <div className="text-gray-400 italic">No Image Available</div>
        )}
      </div>

      {/* Thumbnails */}
      <div className="flex space-x-3">
        {thumbnailImages.slice(0, 3).map((thumb, index) => (
          <img
            key={index}
            src={`http://localhost:8000/uploads/${thumb}`}
            alt={`Thumbnail ${index + 1}`}
            className="w-16 h-16 object-cover rounded-md border"
          />
        ))}

        {thumbnailImages.length > 3 && (
          <div className="w-16 h-16 flex items-center justify-center rounded-md border bg-gray-100 text-gray-500 text-sm font-medium">
            {`${thumbnailImages.length - 3}+`}
          </div>
        )}
      </div>
    </div>
  );
}
