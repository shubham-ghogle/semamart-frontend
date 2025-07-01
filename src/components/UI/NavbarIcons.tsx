type NavbarIconsProps = {
  show?: number[];
};

export function NavbarIcons({ show = [] }: NavbarIconsProps) {
  const logos = [
    { src: "/chair.svg" },
    { src: "/bagtype.svg"},
    { src: "/setting.svg"},
    { src: "/square.svg"},
    { src: "/material-symbols_stethoscope.svg"},
    { src: "/material-symbols_syringe.svg"},
    { src: "/mdi_capsule.svg"},
  ];

  return (
    <figure className="flex gap-4">
        {logos.map((logo, index) =>
            show.includes(index) ? (
            <img key={index} src={logo.src} className="w-6 h-6" />
            ) : null
        )}
    </figure>

  );
}
