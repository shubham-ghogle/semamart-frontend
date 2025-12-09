import { useEffect, useRef, useState } from "react";
import {
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiSave,
  FiX,
  FiUploadCloud,
} from "react-icons/fi";

/* ================= HELPERS ================= */
const normalizeImage = (src?: string | null) => {
  if (!src) return "/placeholder.png";

  if (
    src.startsWith("http://") ||
    src.startsWith("https://") ||
    src.startsWith("/")
  ) {
    return src;
  }

  return `/hero/${src}`;
};



/* ================= TYPES ================= */
type HeroItem = {
  id?: string;
  name: string;
  link: string;
  type: "banner-left" | "banner-right" | "slider";
  file?: File;
  preview?: string; // local preview OR existing image path
};

/* ================= CARD ================= */
const HeroCard = ({
  item,
  index,
  editing,
  onUpdate,
  onRemove,
}: {
  item: HeroItem;
  index: number;
  editing: boolean;
  onUpdate: (i: number, d: Partial<HeroItem>) => void;
  onRemove?: () => void;
}) => (
  <div className="relative rounded-xl border bg-white p-4 shadow-sm space-y-3">
    {/* Trash icon for saved sliders */}
    {editing && onRemove && (
      <button
        onClick={onRemove}
        className="absolute right-3 top-3 text-red-600 hover:bg-red-100 p-1 rounded"
      >
        <FiTrash2 />
      </button>
    )}

    <input
      value={item.name}
      readOnly={!editing}
      onChange={(e) => onUpdate(index, { name: e.target.value })}
      className={`w-full border rounded px-3 py-2 ${!editing && "bg-gray-100"}`}
      placeholder="Name"
    />

    <input
      value={item.link}
      readOnly={!editing}
      onChange={(e) => onUpdate(index, { link: e.target.value })}
      className={`w-full border rounded px-3 py-2 ${!editing && "bg-gray-100"}`}
      placeholder="Link"
    />

    {/* IMAGE UPLOAD / REPLACE */}
    {editing && (
      <div className="relative">
        {item.preview ? (
          <>
            <img
              src={normalizeImage(item.preview)}
              className="h-40 w-full object-cover rounded-lg"
              alt=""
            />
            <button
              type="button"
              className="absolute top-2 right-2 bg-black text-white rounded-full w-6 h-6 flex items-center justify-center"
              onClick={() =>
                onUpdate(index, {
                  file: undefined,
                  preview: undefined,
                })
              }
            >
              ×
            </button>
            {/* Hidden input still allows replacing image */}
            <input
              type="file"
              hidden
              onChange={(e) =>
                onUpdate(index, {
                  file: e.target.files?.[0],
                  preview: URL.createObjectURL(e.target.files![0]),
                })
              }
            />
          </>
        ) : (
          <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 cursor-pointer hover:bg-gray-50">
            <FiUploadCloud size={24} className="mb-2" />
            <span className="text-sm text-gray-600">Upload Image</span>
            <input
              type="file"
              hidden
              onChange={(e) =>
                onUpdate(index, {
                  file: e.target.files?.[0],
                  preview: URL.createObjectURL(e.target.files![0]),
                })
              }
            />
          </label>
        )}
      </div>
    )}

    {/* DISPLAY IMAGE WHEN NOT EDITING */}
    {!editing && item.preview && (
      <img
        src={normalizeImage(item.preview)}
        className="h-40 w-full object-cover rounded-lg"
        alt=""
      />
    )}
  </div>
);

/* ================= MAIN ================= */
export default function HeroSectionUploader() {
  const [items, setItems] = useState<HeroItem[]>([]);
  const [editing, setEditing] = useState(false);
  const original = useRef<HeroItem[]>([]);

  /* -------- FETCH DATA -------- */
  useEffect(() => {
    fetch("/api/v2/heroslider/getallimg")
      .then((r) => r.json())
      .then((res) => {
        if (!res?.data?.length) {
          const init: HeroItem[] = [
            { type: "banner-left", name: "", link: "" },
            { type: "banner-right", name: "", link: "" },
            { type: "slider", name: "", link: "" },
            { type: "slider", name: "", link: "" },
            { type: "slider", name: "", link: "" },
          ];
          setItems(init);
          original.current = structuredClone(init);
          setEditing(true);
          return;
        }

        const r0 = res.data[0];
        const loaded: HeroItem[] = [
          {
            type: "banner-left",
            name: r0.leftBanner.name,
            link: r0.leftBanner.link,
            preview: r0.leftBanner.imagePath,
          },
          {
            type: "banner-right",
            name: r0.rightBanner.name,
            link: r0.rightBanner.link,
            preview: r0.rightBanner.imagePath,
          },
          ...r0.sliders.map((s: any) => ({
            id: s._id,
            type: "slider",
            name: s.name,
            link: s.link,
            preview: s.imagePath,
          })),
        ];

        setItems(loaded);
        original.current = structuredClone(loaded);
      });
  }, []);

  /* -------- UPDATE -------- */
  const updateItem = (i: number, d: Partial<HeroItem>) =>
    setItems((p) => p.map((x, idx) => (idx === i ? { ...x, ...d } : x)));

  /* -------- ADD / REMOVE SLIDER -------- */
  const addSlider = () =>
    setItems((p) => [...p, { type: "slider", name: "", link: "" }]);

  const removeSlider = (index: number) =>
    setItems((p) => p.filter((_, i) => i !== index));

  /* -------- SAVE -------- */
  const save = async () => {
    const fd = new FormData();

    fd.append(
      "heroData",
      JSON.stringify(
        items.map((i) => ({
          id: i.id,
          name: i.name,
          link: i.link,
          type: i.type,
          fileName: i.file?.name, // new uploaded file name
          existingImage: !i.file ? i.preview : undefined, // preserve old image if file not changed
        }))
      )
    );

    // Only append new files
    items.forEach((i) => i.file && fd.append("heroImages", i.file));

    await fetch("/api/v2/heroslider", {
      method: "POST",
      body: fd,
    });

    original.current = structuredClone(items);
    setEditing(false);
    alert("Hero section updated ✅");
  };

  /* -------- CANCEL -------- */
  const cancel = () => {
    setItems(structuredClone(original.current));
    setEditing(false);
  };

  const banners = items.filter((i) => i.type !== "slider");
  const sliders = items.filter((i) => i.type === "slider");

  /* -------- UI -------- */
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Hero Section</h2>

        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-2 border px-4 py-2 rounded bg-blue-600 text-white"
          >
            <FiEdit2 /> Edit
          </button>
        )}
      </div>

      {/* BANNERS */}
      <div className="grid md:grid-cols-2 gap-6">
        {banners.map((b, i) => (
          <HeroCard key={i} item={b} index={i} editing={editing} onUpdate={updateItem} />
        ))}
      </div>

      {/* SLIDERS */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Sliders</h3>
        {editing && (
          <button
            onClick={addSlider}
            className="flex items-center gap-2 border px-4 py-2 rounded bg-blue-600 text-white"
          >
            <FiPlus /> Add Slider
          </button>
        )}
      </div>

      <div className="space-y-4">
        {sliders.map((s, i) => (
          <HeroCard
            key={s.id || i}
            item={s}
            index={i + 2}
            editing={editing}
            onUpdate={updateItem}
            onRemove={s.id ? () => removeSlider(i + 2) : undefined} // Trash icon only for saved sliders
          />
        ))}
      </div>

      {/* SAVE / CANCEL BUTTONS */}
      {editing && (
        <div className="flex gap-4 mt-6">
          <button
            onClick={save}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            <FiSave /> Save Changes
          </button>
          <button
            onClick={cancel}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            <FiX /> Cancel
          </button>
        </div>
      )}
    </div>
  );
}
