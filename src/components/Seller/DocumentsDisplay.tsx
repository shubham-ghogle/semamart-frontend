import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router";
import { ScreenOverlayLoaderUi } from "../UIComponents/LoaderUi";
import { Product } from "@/Types/types";
import { API_URL } from "@/data";
import { toast } from "react-toastify";
import { Trash2, RotateCcw } from "lucide-react";

export default function DocumentsDisplay() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const product = queryClient.getQueryData(["product", id]) as Product;

  const [selectedFiles, setSelectedFiles] = useState<{ [key: string]: { file: File, idx?: number } }>({});
  const [pendingDeletions, setPendingDeletions] = useState<string[]>([]);

  // UPLOAD MUTATION WITH FETCH
  const { mutateAsync: uploadFile, status: uploadStatus } = useMutation({
    mutationFn: async ({ docType, file, idx }: { docType: string; file: File; idx?: number }) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("docType", docType);
      if (idx !== undefined) formData.append("idx", idx.toString());

      const res = await fetch(`${API_URL}product/upload-doc/${id}`, {
        method: "PUT",
        body: formData,
        // credentials: "include" is required to send cookies/session with fetch
        credentials: "include", 
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Upload failed");
      }

      const data = await res.json();
      return data.product;
    }
  });

  // DELETE MUTATION WITH FETCH
  const { mutateAsync: deleteFile, status: deleteStatus } = useMutation({
    mutationFn: async ({ docType, idx }: { docType: string; idx?: number }) => {
      const res = await fetch(`${API_URL}product/delete-doc/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ docType, idx }),
        credentials: "include",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Delete failed");
      }

      const data = await res.json();
      return data.product;
    }
  });

  const handleGlobalSubmit = async () => {
    const fileKeys = Object.keys(selectedFiles);
    const deleteKeys = pendingDeletions;

    if (fileKeys.length === 0 && deleteKeys.length === 0) {
      return toast.warn("No changes to update.");
    }

    try {
      const mainToastId = toast.loading("Syncing document changes...");

      // 1. Process Deletions First
      for (const key of deleteKeys) {
        const isArray = ["msds_ifu_leaflet", "productCompilance", "certificate"].includes(key);
        await deleteFile({ docType: key, idx: isArray ? 0 : undefined });
      }

      // 2. Process Uploads
      for (const key of fileKeys) {
        const item = selectedFiles[key];
        await uploadFile({ docType: key, file: item.file, idx: item.idx });
      }

      queryClient.invalidateQueries({ queryKey: ["product", id] });
      setSelectedFiles({});
      setPendingDeletions([]);
      toast.update(mainToastId, { render: "Changes saved successfully!", type: "success", isLoading: false, autoClose: 3000 });
    } catch (error: any) {
      toast.error(error.message || "An error occurred during sync.");
    }
  };

  const RenderInput = (label: string, docType: keyof Product, isArray = false) => {
    const existingFileName = isArray 
      ? (product?.[docType] as string[])?.[0] 
      : (product?.[docType] as string);
    
    const isSelected = !!selectedFiles[docType as string];
    const isMarkedForDeletion = pendingDeletions.includes(docType as string);

    return (
      <div className="flex flex-col gap-1 border-b pb-4 last:border-0 md:border-0">
        <label className="flex flex-col items-start gap-2 cursor-pointer text-gray-700">
          <span className="text-sm font-medium mt-2">{label}</span>
          <input
            key={isSelected ? "selected" : isMarkedForDeletion ? "deleted" : "empty"}
            type="file"
            className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-gray-500 hover:file:bg-blue-100 cursor-pointer"
            onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                    setSelectedFiles(prev => ({ ...prev, [docType]: { file, idx: isArray ? 0 : undefined } }));
                    setPendingDeletions(prev => prev.filter(k => k !== docType));
                }
            }}
          />
        </label>
        
        <div className="flex items-center justify-between mt-1 min-h-[20px]">
          {isSelected ? (
            <div className="flex items-center gap-2">
               <p className="text-[10px] text-blue-600 font-bold italic">Pending Upload: {selectedFiles[docType as string].file.name}</p>
               <button onClick={() => setSelectedFiles(prev => {const n = {...prev}; delete n[docType as string]; return n;})} className="text-gray-400 hover:text-red-500"><RotateCcw size={12}/></button>
            </div>
          ) : isMarkedForDeletion ? (
            <div className="flex items-center gap-2">
              <p className="text-[10px] text-red-500 font-bold line-through">Marked for deletion</p>
              <button 
                type="button" 
                onClick={() => setPendingDeletions(prev => prev.filter(k => k !== docType))}
                className="text-gray-400 hover:text-blue-500"
                title="Undo deletion"
              >
                <RotateCcw size={14} />
              </button>
            </div>
          ) : (
            existingFileName && (
              <div className="flex items-center gap-2">
                <p className="text-[10px] text-green-600 truncate max-w-[150px]">Current: {existingFileName}</p>
                <button 
                  type="button"
                  onClick={() => setPendingDeletions(prev => [...prev, docType as string])}
                  className="text-red-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="mt-4 p-6 bg-white rounded-lg border shadow-sm">
      {(uploadStatus === "pending" || deleteStatus === "pending") && <ScreenOverlayLoaderUi />}
      <p className="text-xl font-bold mb-6 text-[#1C647C]">Manage Product Documents</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-6">
        {RenderInput("AMC/CMS", "amc_cms")}
        {RenderInput("OEM Letter", "oemLetter")}
        {RenderInput("Product Comparison Sheet", "productComparisionSheet")}
        {RenderInput("MSDS/IFU Leaflet", "msds_ifu_leaflet", true)}
        {RenderInput("Compliance", "productCompilance", true)}
        {RenderInput("Certificate", "certificate", true)}
      </div>

      <div className="flex justify-end mt-12 pt-6 border-t">
        <button 
          type="button"
          onClick={handleGlobalSubmit}
          className="bg-[#1C647C] text-white px-6 py-2 rounded shadow-md hover:bg-[#154d5f] transition-all font-semibold"
        >
          Update All Documents
        </button>
      </div>
    </div>
  );
}