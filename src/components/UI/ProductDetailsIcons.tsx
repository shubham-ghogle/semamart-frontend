type NavbarIconsProps = {
  show?: number[];
};

export function ProductDetailsIcons({ show = [] }: NavbarIconsProps) {
  const logos = [
    { src: " /ProductDetails/med_eqp.png" },
    { src: "/ProductDetails/med_pro.png"},
    { src: "/ProductDetails/med_fur.png"},
    { src: "/ProductDetails/med_ins.png"},
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
