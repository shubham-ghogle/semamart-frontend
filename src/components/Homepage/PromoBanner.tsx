
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
    <div className={`w-full px-6 ${className}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className={`relative rounded-lg overflow-hidden bg-transparent ${heightClass}`}>
          {leftSrc && (
            <img src={leftSrc} alt={leftAlt} className="w-full h-full object-cover" />
          )}
        </div>

        <div className={`relative rounded-lg overflow-hidden bg-transparent ${heightClass}`}>
          {rightSrc && (
            <img src={rightSrc} alt={rightAlt} className="w-full h-full object-cover" />
          )}
        </div>
      </div>
    </div>
  );
}
