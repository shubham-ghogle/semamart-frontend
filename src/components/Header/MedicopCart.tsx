import { useEffect, useState } from "react";
import { IoBagHandleOutline } from "react-icons/io5";
import { RxCross1 } from "react-icons/rx";
import { useLocation, useNavigate } from "react-router";
import {
  MEDICOP_LIST_EVENT_NAME,
  clearMedicopList,
  getMedicopListWithProducts,
  removeMedicopItem,
  updateMedicopQty,
} from "@/medicop/storage";

type MedicopCartProps = {
  cartOpenHandler: () => void;
};

export default function MedicopCart({ cartOpenHandler }: MedicopCartProps) {
  const [items, setItems] = useState(() => getMedicopListWithProducts());
  const navigate = useNavigate();
  const location = useLocation();

  const refresh = () => {
    setItems(getMedicopListWithProducts());
  };

  useEffect(() => {
    refresh();
    const onStorage = () => refresh();
    const onMedicop = () => refresh();
    window.addEventListener("storage", onStorage);
    window.addEventListener(MEDICOP_LIST_EVENT_NAME, onMedicop);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(MEDICOP_LIST_EVENT_NAME, onMedicop);
    };
  }, []);

  const addToListHandler = () => {
    cartOpenHandler();
    navigate("/get-quote-admin/lead-form?mode=medicop", {
      state: {
        medicopProducts: items.map((item) => ({
          productId: item.productId,
          qty: item.qty,
        })),
        from: location.pathname,
      },
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1000]">
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl rounded-l-3xl flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-6 py-4 bg-[#1C647C]">
          <div className="flex items-center gap-2 text-white">
            <IoBagHandleOutline size={28} />
            <h2 className="text-2xl font-bold">{items.length} item(s)</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                clearMedicopList();
                refresh();
              }}
              disabled={items.length === 0}
              className="px-3 py-1 text-sm font-semibold bg-white/20 text-white rounded-full hover:bg-white/30 transition disabled:opacity-50"
            >
              Clear All
            </button>
            <RxCross1
              size={24}
              className="text-white cursor-pointer hover:opacity-80 transition"
              onClick={cartOpenHandler}
            />
          </div>
        </header>

        {items.length === 0 ? (
          <div className="flex-grow flex flex-col items-center justify-center px-8 text-gray-500">
            <h3 className="text-xl font-semibold mb-2">No items selected</h3>
            <p className="text-center">Tick products on Medical Manager page to create a list.</p>
          </div>
        ) : (
          <>
            <div className="flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 p-4 space-y-4">
              {items.map((item) => (
                <div key={item.productId} className="flex gap-4 py-4 border-b border-gray-200">
                  <div className="w-20 h-20 bg-gray-50 rounded border p-2">
                    <img
                      src={item.product?.image}
                      alt={item.product?.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-900">{item.product?.name}</h4>
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center border rounded-md overflow-hidden">
                        <button
                          onClick={() => {
                            updateMedicopQty(item.productId, -1);
                            refresh();
                          }}
                          disabled={item.qty === 1}
                          className={`w-8 h-8 text-lg font-bold ${
                            item.qty === 1
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : "bg-white hover:bg-gray-100"
                          }`}
                        >
                          -
                        </button>
                        <div className="px-3 text-sm font-medium">{item.qty}</div>
                        <button
                          onClick={() => {
                            updateMedicopQty(item.productId, 1);
                            refresh();
                          }}
                          className="w-8 h-8 text-lg font-bold bg-white hover:bg-gray-100"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => {
                          removeMedicopItem(item.productId);
                          refresh();
                        }}
                        className="text-sm text-red-600 hover:underline"
                      >
                        REMOVE
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t">
              <button
                onClick={addToListHandler}
                className="w-full text-white py-3 rounded-2xl font-semibold text-lg"
                style={{ background: "linear-gradient(270deg, #FCB320 0%, #F04526 100%)" }}
              >
                Add to list
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
