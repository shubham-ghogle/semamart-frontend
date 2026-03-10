export type MedicopProduct = {
  id: string;
  name: string;
  image: string;
  category: string;
  moq: number;
  description: string;
  specifications: string[];
};

export const MEDICOP_PRODUCTS: MedicopProduct[] = [
  {
    id: "med-icu-monitor",
    name: "Multipara Patient Monitor",
    image: "/MedicalImages/imagea.png",
    category: "Monitoring",
    moq: 2,
    description:
      "Dummy monitor with ECG, SpO2, NIBP and respiration parameters for demo workflow.",
    specifications: [
      "12.1 inch TFT display",
      "Adult/Pediatric/NICU modes",
      "Built-in rechargeable battery",
    ],
  },
  {
    id: "med-syringe-pump",
    name: "Dual Channel Syringe Pump",
    image: "/MedicalImages/imageb.png",
    category: "Infusion",
    moq: 3,
    description:
      "Dummy infusion pump card for Mediqop demo with safety alarm and anti-bolus control.",
    specifications: [
      "Dual independent channels",
      "KVO and anti-bolus function",
      "Multiple syringe compatibility",
    ],
  },
  {
    id: "med-ecg",
    name: "12 Channel ECG Machine",
    image: "/MedicalImages/imagec.png",
    category: "Diagnostics",
    moq: 1,
    description:
      "Dummy diagnostic ECG machine used for demo list generation.",
    specifications: [
      "Automatic interpretation",
      "Thermal printer built-in",
      "USB export support",
    ],
  },
  {
    id: "med-nebulizer",
    name: "Hospital Grade Nebulizer",
    image: "/MedicalImages/imaged.png",
    category: "Respiratory",
    moq: 5,
    description:
      "Dummy nebulizer product for respiratory care procurement demo.",
    specifications: [
      "Low noise compressor",
      "Continuous operation",
      "Adult and pediatric masks",
    ],
  },
];

export const MEDICOP_PRODUCT_MAP = MEDICOP_PRODUCTS.reduce<Record<string, MedicopProduct>>(
  (acc, item) => {
    acc[item.id] = item;
    return acc;
  },
  {}
);

export const MEDICOP_SHOWCASE_PRODUCTS = MEDICOP_PRODUCTS.map((item) => ({
  _id: item.id,
  name: item.name,
  image: item.image,
  category: item.category,
  moq: item.moq,
  description: item.description,
  badge: false,
  avgRating: 0,
  reviewsCount: 0,
  variants: [
    {
      _id: `${item.id}-variant`,
      stock: 100,
      thumbnail: "",
      discountPrice: 0,
      originalPrice: 0,
    },
  ],
  minmaxrule: JSON.stringify({ minQty: String(item.moq), maxQty: "500" }),
}));
