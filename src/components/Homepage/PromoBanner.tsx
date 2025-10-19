type Props = {
  leftSrc?: string;
  rightSrc?: string;
  leftAlt?: string;
  rightAlt?: string;
  className?: string;
  /** optional heights (Tailwind classes) for responsive card height */
  heightClass?: string; // e.g. "h-40 md:h-56 lg:h-64"
};

export default function PromoBanners({
  leftSrc,
  rightSrc,
  leftAlt = "left banner",
  rightAlt = "right banner",
  className = "",
  heightClass = "h-40 md:h-56 lg:h-64",
}: Props) {
  return (
    // center and constrain to same max width as BestSellerShowcase
    <div className={`w-full max-w-[1440px] mx-auto px-6 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* Left banner */}
        <div className={`relative rounded-lg overflow-hidden bg-transparent ${heightClass} flex items-center justify-center`}>
          {leftSrc ? (
            // object-left helps preserve the right-side content of the image (useful for designs where subject is on right)
            <img
              src={leftSrc}
              alt={leftAlt}
              className="w-full h-full object-cover object-left"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gray-100" />
          )}
        </div>

        {/* Right banner */}
        <div className={`relative rounded-lg overflow-hidden bg-transparent ${heightClass} flex items-center justify-center`}>
          {rightSrc ? (
            // object-right preserves the left-side content of the image (subject on the left/right as needed)
            <img
              src={rightSrc}
              alt={rightAlt}
              className="w-full h-full object-cover object-right"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gray-100" />
          )}
        </div>
      </div>
    </div>
  );
}
