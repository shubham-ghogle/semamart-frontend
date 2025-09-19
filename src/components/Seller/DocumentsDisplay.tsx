import { API_URL, BASE_URL } from "@/data";
import { Button } from "../ui/button";
import { Edit2 } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router";
import { ScreenOverlayLoaderUi } from "../UIComponents/LoaderUi";
import { Product } from "@/Types/types";
import { Card, CardContent } from "../ui/card";

export default function DocumentsDisplay() {

  const { id } = useParams();
  const queryClient = useQueryClient();
  const product = queryClient.getQueryData(["product", id]) as Product;

  const [open, setOpen] = useState(false);
  const [docType, setDocType] = useState("");
  const [file, setFile] = useState<null | File>(null);
  const [idx, setIdx] = useState<undefined | number>();

  const { mutate, status } = useMutation({
    mutationFn: ({
      docType,
      file,
      idx,
    }: {
      docType: string;
      file: File;
      idx?: number;
    }) => editDoc(docType, file, id ?? "", idx),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product", id] });
      setOpen(false);
      setDocType("");
      setFile(null);
      setIdx(undefined);
    },
  });

  function openDialog(docType: string, i?: number) {
    setDocType(docType);
    setOpen(true);
    if (i !== undefined) {
      setIdx(i);
    }
  }

  function handleUpdateDoc() {
    if (file) {
      mutate({ file: file, docType: docType, idx: idx });
    }
  }

  const testReports = product?.certificate || [];

  return (
    <div className="mt-4">
      {status === "pending" && <ScreenOverlayLoaderUi />}
      <p className="text-lg font-semibold">Documents</p>

      <section className="grid grid-cols-3">
        {product.amc_cms ? (
          <DocCard
            title="AMC/CMS"
            fileName={product.amc_cms}
            onClick={() => {
              openDialog("amc_cms");
            }}
          />
        ) : (
          <EmptyDocCard
            title="Add AMC/CMS"
            onClick={() => {
              openDialog("amc_cms");
            }}
          />
        )}
        {product.oemLetter ? (
          <DocCard
            title="OEM Letter"
            fileName={product.oemLetter}
            onClick={() => {
              openDialog("oemLetter");
            }}
          />
        ) : (
          <EmptyDocCard
            title="Add OEM Letter"
            onClick={() => {
              openDialog("oemLetter");
            }}
          />
        )}
        {product.productComparisionSheet ? (
          <DocCard
            title="Product Comparision Sheet"
            fileName={product.productComparisionSheet}
            onClick={() => {
              openDialog("productComparisionSheet");
            }}
          />
        ) : (
          <EmptyDocCard
            title="Add Product Comparision Sheet"
            onClick={() => {
              openDialog("productComparisionSheet");
            }}
          />
        )}
        {product.msds_ifu_leaflet ? (
          <DocCard
            title="MSDS/IFU Leaflet"
            fileName={product.msds_ifu_leaflet}
            onClick={() => {
              openDialog("msds_ifu_leaflet");
            }}
          />
        ) : (
          <EmptyDocCard
            title="Add MSDS/IFU Leaflet"
            onClick={() => {
              openDialog("msds_ifu_leaflet");
            }}
          />
        )}
        {product.productCompilance ? (
          <DocCard
            title="Product Compilance"
            fileName={product.productCompilance}
            onClick={() => {
              openDialog("productCompilance");
            }}
          />
        ) : (
          <EmptyDocCard
            title="Add Product Compilance"
            onClick={() => {
              openDialog("productCompilance");
            }}
          />
        )}
      </section>

       <section className="mt-2">
        {testReports.length > 0 ? (
            <div className="grid grid-cols-3">
              {testReports.map((el, i) => (
                <DocCard
                  title={"Certifcate-" + (i + 1)}
                  key={i}
                  fileName={el}
                  onClick={() => {
                    openDialog("certificate", i);
                  }}
                />
              ))}
            </div>
        ) : (
            <EmptyDocCard
              title="Certifcate"
              onClick={() => {
                openDialog("certificate", 0);
              }}
            />
        )}
      </section>

      {open && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload document</DialogTitle>
            </DialogHeader>
            <Input
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setFile(file);
                }
              }}
            />
            <Button
              type="button"
              onClick={() => {
                handleUpdateDoc();
              }}
            >
              Ok
            </Button>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

type DocCardProps = {
  fileName: string;
  onClick: () => void;
  title: string;
};
function DocCard({ fileName, onClick, title }: DocCardProps) {
  return (
    <div className="relative m-2 h-[350px] aspect-[0.8]">
      <p>{title}</p>
      <iframe
        src={BASE_URL + "docs/" + fileName}
        className="border rounded-md h-[90%] w-full overflow-hidden"
      />
      <Button
        className="absolute bottom-4 left-1.5 rounded-sm"
        variant="outline"
        onClick={onClick}
        type="button"
      >
        <Edit2 />
      </Button>
    </div>
  );
}

type EmptyDocCardProps = {
  title: string;
  onClick: () => void;
};
function EmptyDocCard({ title, onClick }: EmptyDocCardProps) {
  return (
    <Card
      className="flex h-[350px] aspect-[0.8] items-center justify-center cursor-pointer border-dashed text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
      onClick={onClick}
    >
      <CardContent className="flex flex-col items-center justify-center gap-2 p-6">
        <span className="text-2xl">＋</span>
        <span className="text-sm font-medium">{title}</span>
      </CardContent>
    </Card>
  );
}

async function editDoc(
  docType: string,
  file: File,
  productId: string,
  idx?: number
) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("docType", docType);
  if (idx !== undefined) {
    formData.append("idx", idx.toString());
  }

  await fetch(API_URL + "product/upload-doc/" + productId, {
    method: "PUT",
    body: formData,
  });
}
