import { API_URL, BASE_URL } from "@/data";
import React, { useEffect, useState } from "react";
import { FiUploadCloud, FiEdit2, FiSave, FiX } from "react-icons/fi";

// Type definitions
type BannerItem = {
  name: string;
  link: string;
  image?: File;      // newly uploaded file
  preview?: string;  // backend image filename or blob preview
};

type SectionBanner = {
  title: string;
  left: BannerItem;
  right: BannerItem;
};

// Helper to get image source
const getImageSrc = (item: BannerItem) => {
  if (item.image) return item.preview; // newly uploaded blob
  if (item.preview) return BASE_URL + "images/" + item.preview; // saved image
  return ""; // fallback placeholder
};

const SectionBannerUploader: React.FC = () => {
  const [sectionBanners, setSectionBanners] = useState<SectionBanner[]>([]);
  const [originalBanners, setOriginalBanners] = useState<SectionBanner[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch banners from API
 const fetchBanners = async () => {
  try {
    const res = await fetch(API_URL+"sectionbanner/getallsectionbanner");
    const data = await res.json();

    if (data.success && data.data.length) {
      const banners = data.data.map((s: any) => ({
        title: s.title,
        left: { name: s.left.name, link: s.left.link, preview: s.left.image },
        right: { name: s.right.name, link: s.right.link, preview: s.right.image },
      }));
      setSectionBanners(banners);
      setOriginalBanners(JSON.parse(JSON.stringify(banners)));
      setIsEditing(false);
    } else {
      // First-time upload: create 3 empty sections
      const emptyBanners: SectionBanner[] = [1, 2, 3].map((n) => ({
        title: `Section ${n}`,
        left: { name: "", link: "" },
        right: { name: "", link: "" },
      }));
      setSectionBanners(emptyBanners);
      setOriginalBanners(JSON.parse(JSON.stringify(emptyBanners)));
      setIsEditing(true); // enable editing for first-time upload
    }
  } catch (err) {
    console.error("Fetch error:", err);
  }
};


  useEffect(() => {
    fetchBanners();
  }, []);

  // Cleanup blob URLs when component unmounts
  useEffect(() => {
    return () => {
      sectionBanners.forEach((b) => {
        if (b.left.preview?.startsWith("blob:")) URL.revokeObjectURL(b.left.preview);
        if (b.right.preview?.startsWith("blob:")) URL.revokeObjectURL(b.right.preview);
      });
    };
  }, [sectionBanners]);

  // Update banner item
  const updateItem = (index: number, side: "left" | "right", item: BannerItem) => {
    setSectionBanners((prev) =>
      prev.map((b, i) => (i === index ? { ...b, [side]: item } : b))
    );
  };

  // Handle file change
  const handleFileChange = (index: number, side: "left" | "right", file?: File) => {
    if (!file) return;
    const current = sectionBanners[index][side];

    // Revoke old blob if exists
    if (current.image && current.preview?.startsWith("blob:")) {
      URL.revokeObjectURL(current.preview);
    }

    updateItem(index, side, {
      ...current,
      image: file,
      preview: URL.createObjectURL(file),
    });
  };

  // Remove image
  const removeImage = (index: number, side: "left" | "right") => {
    const current = sectionBanners[index][side];
    if (current.image && current.preview?.startsWith("blob:")) {
      URL.revokeObjectURL(current.preview);
    }

    updateItem(index, side, { ...current, image: undefined, preview: undefined });
  };

  // Submit banners
  const submitSectionBanners = async () => {
    // Validation
    for (const s of sectionBanners) {
      if (
        !(s.left.image || s.left.preview) ||
        !(s.right.image || s.right.preview) ||
        !s.left.name ||
        !s.right.name ||
        !s.left.link ||
        !s.right.link
      ) {
        alert("Please fill all fields and upload images for all banners");
        return;
      }
    }

    // Check if anything changed
    const isChanged = JSON.stringify(sectionBanners) !== JSON.stringify(originalBanners);
    if (!isChanged) {
      alert("No changes to save");
      setIsEditing(false);
      return;
    }

    try {
      const fd = new FormData();

      // Include names, links, and existing images
      fd.append(
        "sections",
        JSON.stringify(
          sectionBanners.map((b) => ({
            left: {
              name: b.left.name,
              link: b.left.link,
              image: b.left.image ? undefined : b.left.preview,
            },
            right: {
              name: b.right.name,
              link: b.right.link,
              image: b.right.image ? undefined : b.right.preview,
            },
          }))
        )
      );

      // Append newly uploaded images
      sectionBanners.forEach((b, i) => {
        if (b.left.image) fd.append(`section${i + 1}_left`, b.left.image);
        if (b.right.image) fd.append(`section${i + 1}_right`, b.right.image);
      });

      const res = await fetch(API_URL+"sectionbanner", {
        method: "POST",
        body: fd,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed");

      alert("Promo banners saved successfully");
      setIsEditing(false);
      setOriginalBanners(JSON.parse(JSON.stringify(sectionBanners)));
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Upload failed");
    }
  };

  // Cancel edit
  const cancelEdit = () => {
    setSectionBanners(JSON.parse(JSON.stringify(originalBanners)));
    setIsEditing(false);
  };

  return (
    <div className="p-6 bg-white rounded shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Section Banners</h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            <FiEdit2 size={18} />
            <span>Edit</span>
          </button>
        )}
      </div>

      {sectionBanners.map((banner, index) => (
        <div key={index} className="mb-6">
          <h3 className="font-semibold mb-3">{banner.title}</h3>
          <div className="grid grid-cols-2 gap-4">
            {(["left", "right"] as const).map((side) => {
              const item = banner[side];
              return (
                <div key={side} className="border rounded p-4 space-y-2">
                  <h4 className="font-medium capitalize">{side} Banner</h4>

                  {/* Name */}
                  <input
                    disabled={!isEditing}
                    className="border p-2 w-full rounded"
                    placeholder="Name"
                    value={item.name}
                    onChange={(e) =>
                      updateItem(index, side, { ...item, name: e.target.value })
                    }
                  />

                  {/* Image */}
                  <div className="border-2 border-dashed p-4 rounded text-center">
                    {!item.preview ? (
                      isEditing && (
                        <label className="cursor-pointer flex flex-col items-center gap-2">
                          <FiUploadCloud className="text-3xl text-gray-500" />
                          <span>Upload Image</span>
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) =>
                              handleFileChange(index, side, e.target.files?.[0])
                            }
                          />
                        </label>
                      )
                    ) : (
                      <div className="relative">
                        <img
                          src={getImageSrc(item) || "/placeholder.png"}
                          className="h-32 w-full object-cover rounded"
                        />
                        {isEditing && (
                          <button
                            type="button"
                            className="absolute top-2 right-2 bg-black text-white rounded-full w-6 h-6 flex items-center justify-center"
                            onClick={() => removeImage(index, side)}
                          >
                            ×
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Link */}
                  <input
                    disabled={!isEditing}
                    className="border p-2 w-full rounded"
                    placeholder="Link"
                    value={item.link}
                    onChange={(e) =>
                      updateItem(index, side, { ...item, link: e.target.value })
                    }
                  />
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Save / Cancel Buttons */}
      {isEditing && (
        <div className="flex gap-4 mt-4">
          <button
            onClick={submitSectionBanners}
            className="flex items-center gap-2 px-6 py-2 rounded text-white bg-green-600 hover:bg-green-700 transition"
          >
            <FiSave size={18} />
            <span>Save Changes</span>
          </button>

          <button
            onClick={cancelEdit}
            className="flex items-center gap-2 px-6 py-2 rounded text-white bg-red-600 hover:bg-red-700 transition"
          >
            <FiX size={18} />
            <span>Cancel</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default SectionBannerUploader;
