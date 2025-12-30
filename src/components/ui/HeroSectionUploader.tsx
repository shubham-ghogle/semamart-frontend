import { API_URL, BASE_URL } from "@/data";
import { useEffect, useRef, useState } from "react";
import {
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiSave,
  FiX,
  FiUploadCloud,
} from "react-icons/fi";

/* ================= HELPER ================= */
const resolveImageSrc = (preview?: string) => {
  if (!preview) return "";
  if (preview.startsWith("blob:")) return preview;
  return BASE_URL + "images/" + preview;
};

/* ================= TYPES ================= */
type HeroItem = {
  uid: string;
  id?: string; // MongoDB _id
  name: string;
  link: string;
  type: "banner-left" | "banner-right" | "slider";
  file?: File;
  preview?: string;
};

/* ================= CARD (UNCHANGED UI) ================= */
const HeroCard = ({
  item,
  index,
  editing,
  onUpdate,
  onRemove,
  draggable,
  onDragStart,
  onDrop,
}: {
  item: HeroItem;
  index: number;
  editing: boolean;
  onUpdate: (i: number, d: Partial<HeroItem>) => void;
  onRemove?: () => void;
  draggable?: boolean;
  onDragStart?: () => void;
  onDrop?: () => void;
}) => (
  <div
    draggable={draggable}
    onDragStart={onDragStart}
    onDragOver={(e) => draggable && e.preventDefault()}
    onDrop={onDrop}
    className={`relative rounded-xl border bg-white p-4 shadow-sm space-y-3 ${
      draggable ? "cursor-move" : ""
    }`}
  >
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
      className={`w-full border rounded px-3 py-2 ${
        !editing && "bg-gray-100"
      }`}
      placeholder="Name"
    />

    <input
      value={item.link}
      readOnly={!editing}
      onChange={(e) => onUpdate(index, { link: e.target.value })}
      className={`w-full border rounded px-3 py-2 ${
        !editing && "bg-gray-100"
      }`}
      placeholder="Link"
    />

    {editing ? (
  <label className="relative block cursor-pointer">
    {item.preview ? (
      <img
        src={resolveImageSrc(item.preview)}
        className="h-40 w-full object-cover rounded-lg"
      />
    ) : (
      <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6">
        <FiUploadCloud size={24} />
        <span className="text-sm">Upload Image *</span>
      </div>
    )}

    {/* Overlay */}
    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center text-white rounded-lg transition">
      <FiUploadCloud size={28} />
      <span className="ml-2 text-sm">Replace Image</span>
    </div>

    <input
      type="file"
      hidden
      accept="image/*"
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        onUpdate(index, {
          file,
          preview: URL.createObjectURL(file),
        });
      }}
    />
  </label>
) : (
  item.preview && (
    <img
      src={resolveImageSrc(item.preview)}
      className="h-40 w-full object-cover rounded-lg"
    />
  )
)}

  </div>
);

/* ================= MAIN ================= */
export default function HeroSectionUploader() {
  const [items, setItems] = useState<HeroItem[]>([]);
  const [editing, setEditing] = useState(false);
  const original = useRef<HeroItem[]>([]);
  const deletedIds = useRef<string[]>([]);
  const dragUid = useRef<string | null>(null);

  /* -------- FETCH -------- */
  useEffect(() => {
    fetch(API_URL+"heroslider/getallimg")
      .then((r) => r.json())
      .then((res) => {
        const r0 = res.data?.[0];
        if (!r0) return;

        const loaded: HeroItem[] = [
          {
            uid: "banner-left",
            type: "banner-left",
            name: r0.leftBanner.name,
            link: r0.leftBanner.link,
            preview: r0.leftBanner.imagePath,
          },
          {
            uid: "banner-right",
            type: "banner-right",
            name: r0.rightBanner.name,
            link: r0.rightBanner.link,
            preview: r0.rightBanner.imagePath,
          },
          ...r0.sliders.map((s: any) => ({
            uid: s._id,
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
  const updateItem = (index: number, d: Partial<HeroItem>) => {
    setItems((p) => p.map((x, i) => (i === index ? { ...x, ...d } : x)));
  };

  /* -------- ADD SLIDER -------- */
  const addSlider = () =>
    setItems((p) => [
      ...p,
      {
        uid: crypto.randomUUID(),
        type: "slider",
        name: "",
        link: "",
      },
    ]);

  /* -------- REMOVE SLIDER -------- */
  const removeSlider = (item: HeroItem) => {
    if (item.id) deletedIds.current.push(item.id);
    setItems((p) => p.filter((x) => x.uid !== item.uid));
  };

  /* -------- DRAG & DROP (SLIDERS ONLY) -------- */
  const onDrop = (targetUid: string) => {
    if (!dragUid.current || dragUid.current === targetUid) return;

    setItems((p) => {
      const arr = [...p];
      const from = arr.findIndex((x) => x.uid === dragUid.current);
      const to = arr.findIndex((x) => x.uid === targetUid);

      // prevent dragging banners
      if (arr[from].type !== "slider" || arr[to].type !== "slider") return arr;

      const [moved] = arr.splice(from, 1);
      arr.splice(to, 0, moved);
      return arr;
    });

    dragUid.current = null;
  };

  /* -------- VALIDATION -------- */
  const validate = () => {
    for (const i of items) {
      if (!i.preview) {
        alert("All banners and sliders must have an image");
        return false;
      }
    }
    return true;
  };

  /* -------- SAVE -------- */
  const save = async () => {
    if (!validate()) return;

    const fd = new FormData();

    fd.append(
      "heroData",
      JSON.stringify(
        items.map((i) => ({
          id: i.id,
          name: i.name,
          link: i.link,
          type: i.type,
          fileName: i.file?.name,
        }))
      )
    );

    fd.append("deletedIds", JSON.stringify(deletedIds.current));
    items.forEach((i) => i.file && fd.append("heroImages", i.file));

    await fetch(API_URL+"heroslider", {
      method: "POST",
      body: fd,
    });

    deletedIds.current = [];
    original.current = structuredClone(items);
    setEditing(false);
    alert("Saved successfully");
  };

  /* -------- CANCEL -------- */
  const cancel = () => {
    deletedIds.current = [];
    setItems(structuredClone(original.current));
    setEditing(false);
  };

  const banners = items.filter((i) => i.type !== "slider");
  const sliders = items.filter((i) => i.type === "slider");

  /* -------- UI -------- */
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between">
        <h2 className="text-2xl font-bold">Hero Section</h2>
        {!editing && (
          <button onClick={() => setEditing(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            <FiEdit2 /> Edit
          </button>
        )}
      </div>

      {/* BANNERS — UNCHANGED */}
      <div className="grid md:grid-cols-2 gap-6">
        {banners.map((b, i) => (
          <HeroCard
            key={b.uid}
            item={b}
            index={i}
            editing={editing}
            onUpdate={updateItem}
          />
        ))}
      </div>

      {/* SLIDERS */}
      <div className="space-y-4">
        {sliders.map((s) => {
          const realIndex = items.findIndex((x) => x.uid === s.uid);
          return (
            <HeroCard
              key={s.uid}
              item={s}
              index={realIndex}
              editing={editing}
              draggable={editing}
              onDragStart={() => (dragUid.current = s.uid)}
              onDrop={() => onDrop(s.uid)}
              onUpdate={updateItem}
              onRemove={() => removeSlider(s)}
            />
          );
        })}
      </div>

      {editing && (
        <div className="flex gap-4 mt-6">
          <button onClick={addSlider}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            <FiPlus /> Add Slider
          </button>
          <button onClick={save}
           className="flex items-center gap-2 px-6 py-2 rounded text-white bg-green-600 hover:bg-green-700 transition"
          >
            <FiSave /> Save Changes
          </button>
          <button onClick={cancel}
          className="flex items-center gap-2 px-6 py-2 rounded text-white bg-red-600 hover:bg-red-700 transition"
          >
            <FiX /> Cancel
          </button>
        </div>
      )}
    </div>
  );
}
