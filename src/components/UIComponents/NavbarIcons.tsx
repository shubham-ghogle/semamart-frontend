
type NavbarIconsProps = {
  show?: number[];
  color?: string;
};

export function NavbarIcons({ show = [], color = "currentColor" }: NavbarIconsProps) {
  const logos = [
    "/chair.svg",
    "/bagtype.svg",
    "/setting.svg",
    "/square.svg",
    "/material-symbols_stethoscope.svg",
    "/material-symbols_syringe.svg",
    "/mdi_capsule.svg",
  ];

  return (
    <div className="flex gap-2">
      {logos.map((src, idx) =>
        show.includes(idx) ? (
          <span
            key={idx}
            className="w-6 h-6"
            style={{
              // use the SVG file as a mask so we can paint it any color
              WebkitMask: `url(${src}) no-repeat center / contain`,
              mask: `url(${src}) no-repeat center / contain`,
              backgroundColor: color,
            }}
          />
        ) : null
      )}
    </div>
  );
}
