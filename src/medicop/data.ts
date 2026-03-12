export type MedicopProduct = {
  id: string;
  name: string;
  image: string;
  category: string;
  departments: string[];
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
    departments: ["CARDIOLOGY", "INTENSIVE CARE UNIT (ICU)"],
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
    departments: ["ANESTHESIOLOGY", "INTENSIVE CARE UNIT (ICU)"],
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
    departments: ["CARDIOLOGY", "EMERGENCY MEDICINE"],
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
    departments: ["PULMONOLOGY", "RESPIRATORY MEDICINE"],
    moq: 5,
    description:
      "Dummy nebulizer product for respiratory care procurement demo.",
    specifications: [
      "Low noise compressor",
      "Continuous operation",
      "Adult and pediatric masks",
    ],
  },
  {
    id: "med-oxygen-concentrator",
    name: "Portable Oxygen Concentrator",
    image: "/MedicalImages/imagea.png",
    category: "Respiratory",
    departments: ["PULMONOLOGY", "RESPIRATORY MEDICINE"],
    moq: 2,
    description:
      "Dummy oxygen concentrator for homecare and ward support in the Mediqop demo flow.",
    specifications: [
      "5 LPM flow rate",
      "Low-noise compressor",
      "Continuous oxygen delivery",
    ],
  },
  {
    id: "med-defibrillator",
    name: "Biphasic Defibrillator",
    image: "/MedicalImages/imageb.png",
    category: "Critical Care",
    departments: ["CARDIOLOGY", "EMERGENCY MEDICINE"],
    moq: 1,
    description:
      "Dummy critical care defibrillator with compact form factor for demo requests.",
    specifications: [
      "Biphasic waveform",
      "Manual and AED modes",
      "Integrated printer support",
    ],
  },
  {
    id: "med-autoclave",
    name: "Vertical Steam Sterilizer",
    image: "/MedicalImages/imagec.png",
    category: "Sterilization",
    departments: ["GENERAL SURGERY", "PATHOLOGY"],
    moq: 1,
    description:
      "Dummy autoclave for sterilization procurement demonstrations.",
    specifications: [
      "Stainless steel chamber",
      "Digital temperature control",
      "Automatic safety lock",
    ],
  },
  {
    id: "med-infusion-pump",
    name: "Volumetric Infusion Pump",
    image: "/MedicalImages/imaged.png",
    category: "Infusion",
    departments: ["ANESTHESIOLOGY", "ONCOLOGY"],
    moq: 4,
    description:
      "Dummy infusion pump with alarm stack and calibration mode for demo lists.",
    specifications: [
      "Flow rate accuracy +/-5%",
      "Air-in-line detection",
      "Battery backup up to 4 hours",
    ],
  },
  {
    id: "med-ultrasound",
    name: "Portable Ultrasound Scanner",
    image: "/MedicalImages/imagea.png",
    category: "Imaging",
    departments: ["OB/GYN", "RADIOLOGY"],
    moq: 1,
    description:
      "Dummy portable ultrasound unit for department-specific request generation.",
    specifications: [
      "15 inch HD display",
      "Convex and linear probe support",
      "DICOM export ready",
    ],
  },
  {
    id: "med-op-table",
    name: "Electro Hydraulic OT Table",
    image: "/MedicalImages/imageb.png",
    category: "Operation Theatre",
    departments: ["GENERAL SURGERY", "ORTHOPEDICS"],
    moq: 1,
    description:
      "Dummy OT table card for surgery and theatre setup requirements.",
    specifications: [
      "Electro hydraulic controls",
      "Radiolucent tabletop",
      "Multi-position adjustment",
    ],
  },
  {
    id: "med-suction",
    name: "Portable Suction Machine",
    image: "/MedicalImages/imagec.png",
    category: "Emergency",
    departments: ["EMERGENCY MEDICINE", "EAR NOSE AND THROAT"],
    moq: 3,
    description:
      "Dummy suction machine product for emergency and bedside care procurement.",
    specifications: [
      "Oil-free vacuum pump",
      "Overflow safety protection",
      "Compact mobile body",
    ],
  },
  {
    id: "med-exam-light",
    name: "LED Examination Light",
    image: "/MedicalImages/imaged.png",
    category: "Examination",
    departments: ["DENTAL", "DERMATOLOGY"],
    moq: 6,
    description:
      "Dummy LED examination light for OPD and procedure room setups.",
    specifications: [
      "Cool white LED source",
      "Flexible arm positioning",
      "Shadow-reduced illumination",
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
  departments: item.departments,
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

export const MEDIQOP_DEPARTMENTS = [
  "EMERGENCY MEDICINE",
  "ORTHOPEDICS",
  "NEUROLOGY",
  "DENTAL",
  "CARDIOLOGY",
  "EAR NOSE AND THROAT",
  "PATHOLOGY",
  "GASTROENTEROLOGY",
  "RESPIRATORY MEDICINE",
  "MICROBIOLOGY",
  "RADIOLOGY",
  "OB/GYN",
  "ONCOLOGY",
  "NEPHROLOGY",
  "PULMONOLOGY",
  "DERMATOLOGY",
  "ENDOCRINOLOGY",
  "OPHTHALMOLOGY",
  "OTOLARYNGOLOGY (ENT)",
  "UROLOGY",
  "PSYCHIATRY",
  "ANESTHESIOLOGY",
  "GENERAL SURGERY",
  "PLASTIC AND RECONSTRUCTIVE SURGERY",
  "PHYSICAL MEDICINE AND REHABILITATION",
  "INTENSIVE CARE UNIT (ICU)",
  "NEONATOLOGY",
] as const;

export const MEDIQOP_HOME_DEPARTMENTS = [
  "CARDIOLOGY",
  "EMERGENCY MEDICINE",
  "NEUROLOGY",
  "ORTHOPEDICS",
  "PATHOLOGY",
  "RADIOLOGY",
] as const;
