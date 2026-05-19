import { toast } from "react-toastify";
import {
  FaWhatsapp,
  FaInstagram,
  FaEnvelope,
  FaTelegramPlane,
} from "react-icons/fa";

type ShareTarget = "whatsapp" | "instagram" | "email" | "telegram";

type ProductShareSectionProps = {
  productName?: string;
};

const SHARE_ITEMS: {
  key: ShareTarget;
  label: string;
  Icon: typeof FaWhatsapp;
  className: string;
}[] = [
  {
    key: "whatsapp",
    label: "WhatsApp",
    Icon: FaWhatsapp,
    className: "bg-green-50 text-green-600 hover:bg-green-100",
  },
  {
    key: "instagram",
    label: "Instagram",
    Icon: FaInstagram,
    className: "bg-pink-50 text-pink-600 hover:bg-pink-100",
  },
  {
    key: "email",
    label: "Email",
    Icon: FaEnvelope,
    className: "bg-slate-100 text-slate-700 hover:bg-slate-200",
  },
  {
    key: "telegram",
    label: "Telegram",
    Icon: FaTelegramPlane,
    className: "bg-sky-50 text-sky-600 hover:bg-sky-100",
  },
];

export default function ProductShareSection({
  productName,
}: ProductShareSectionProps) {
  const shareUrl =
    typeof window !== "undefined" ? window.location.href : "";
  const title = productName || "Semamart Product";
  const text = `Check out this product on Semamart: ${title}`;

  const copyLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Product link copied");
    } catch {
      toast.error("Unable to copy product link");
    }
  };

  const openShareLink = async (target: ShareTarget) => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(`${text} ${shareUrl}`);
    const encodedSubject = encodeURIComponent(title);
    let targetUrl = "";

    if (target === "whatsapp") {
      targetUrl = `https://wa.me/?text=${encodedText}`;
    } else if (target === "telegram") {
      targetUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent(text)}`;
    } else if (target === "email") {
      targetUrl = `mailto:?subject=${encodedSubject}&body=${encodedText}`;
    } else if (target === "instagram") {
      await copyLink();
      targetUrl = "https://www.instagram.com/";
      toast.info("Link copied. Paste it into Instagram to share.");
    }

    if (targetUrl) {
      window.open(targetUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleShare = async (target: ShareTarget) => {
    if (!shareUrl) return;

    if (navigator.share && target !== "instagram") {
      try {
        await navigator.share({
          title,
          text,
          url: shareUrl,
        });
        return;
      } catch (error: any) {
        if (error?.name === "AbortError") return;
      }
    }

    await openShareLink(target);
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4">
      <h3 className="text-base font-semibold text-[#1C647C]">Share</h3>
      <div className="mt-3 flex flex-wrap gap-3">
        {SHARE_ITEMS.map(({ key, label, Icon, className }) => (
          <button
            key={key}
            type="button"
            onClick={() => void handleShare(key)}
            aria-label={`Share via ${label}`}
            title={`Share via ${label}`}
            className={`flex h-11 w-11 items-center justify-center rounded-full transition ${className}`}
          >
            <Icon className="text-xl" />
          </button>
        ))}
      </div>
    </div>
  );
}
