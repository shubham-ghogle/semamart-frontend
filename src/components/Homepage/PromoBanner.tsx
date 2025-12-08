type Props = {
  leftSrc?: string;
  rightSrc?: string;
  leftAlt?: string;
  rightAlt?: string;
  className?: string;
  heightClass?: string;
};

export default function PromoBanners({
  leftSrc,
  rightSrc,
  leftAlt = "left banner",
  rightAlt = "right banner",
  className = "",
  // mobile-first sensible heights; md/lg keep original tall look
  heightClass = "h-44 sm:h-56 md:h-56 lg:h-64",
}: Props) {
  return (
    <div className={`w-full max-w-[1440px] mx-auto px-6 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* Left banner */}
        <div className={`relative rounded-lg overflow-hidden bg-transparent ${heightClass} flex items-center justify-center`}>
          {leftSrc ? (
            <>
              {/* subtle overlay for mobile legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/12 to-transparent pointer-events-none md:hidden" />
              <img
                src={leftSrc}
                alt={leftAlt}
                className="w-full h-full object-cover object-center md:object-left"
                loading="lazy"
                sizes="(max-width: 639px) 100vw, 50vw"
                onError={(e) => (e.currentTarget.src = "/placeholder.png")}
              />
            </>
          ) : (
            <div className="w-full h-full bg-gray-100" />
          )}
        </div>

        {/* Right banner */}
        <div className={`relative rounded-lg overflow-hidden bg-transparent ${heightClass} flex items-center justify-center`}>
          {rightSrc ? (
            <>
              <div className="absolute inset-0 bg-gradient-to-t from-black/12 to-transparent pointer-events-none md:hidden" />
              <img
                src={rightSrc}
                alt={rightAlt}
                className="w-full h-full object-cover object-center md:object-right"
                loading="lazy"
                sizes="(max-width: 639px) 100vw, 50vw"
                onError={(e) => (e.currentTarget.src = "/placeholder.png")}
              />
            </>
          ) : (
            <div className="w-full h-full bg-gray-100" />
          )}
        </div>
      </div>
    </div>
  );
}
