import { MEDICOP_PRODUCT_MAP, type MedicopProduct } from "./data";

export type MedicopListItem = {
  productId: string;
  qty: number;
};

export type GeneratedRequirement = {
  uid: string;
  date: string;
  salesman: string;
  entityType: string;
  entityName: string;
  address: string;
  state: string;
  district: string;
  customerName: string;
  designation: string;
  phoneNumber: string;
  alternateMobileNumber: string;
  email: string;
  department: string;
  noOfBeds: string;
  items: Array<{ productId: string; productName: string; quantity: number; department?: string }>;
};

const MEDICOP_LIST_KEY = "medicop-list";
const MEDICOP_REQ_KEY = "medicop-generated-requirements";
const MEDICOP_EVENT = "medicop-list-updated";

const parseJSON = <T,>(raw: string | null, fallback: T): T => {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const notifyMedicopListChange = () => {
  window.dispatchEvent(new CustomEvent(MEDICOP_EVENT));
};

export const getMedicopList = (): MedicopListItem[] => {
  return parseJSON<MedicopListItem[]>(localStorage.getItem(MEDICOP_LIST_KEY), []);
};

export const setMedicopList = (items: MedicopListItem[]) => {
  localStorage.setItem(MEDICOP_LIST_KEY, JSON.stringify(items));
  notifyMedicopListChange();
};

export const upsertMedicopItem = (productId: string, qty = 1) => {
  const list = getMedicopList();
  const idx = list.findIndex((x) => x.productId === productId);
  if (idx >= 0) {
    list[idx] = { ...list[idx], qty: Math.max(1, qty) };
  } else {
    list.push({ productId, qty: Math.max(1, qty) });
  }
  setMedicopList(list);
};

export const toggleMedicopItem = (productId: string, checked: boolean) => {
  const list = getMedicopList();
  if (checked) {
    const existing = list.find((x) => x.productId === productId);
    if (!existing) {
      list.push({ productId, qty: 1 });
    }
  } else {
    const next = list.filter((x) => x.productId !== productId);
    setMedicopList(next);
    return;
  }
  setMedicopList(list);
};

export const updateMedicopQty = (productId: string, delta: 1 | -1) => {
  const list = getMedicopList().map((x) =>
    x.productId === productId ? { ...x, qty: Math.max(1, x.qty + delta) } : x
  );
  setMedicopList(list);
};

export const removeMedicopItem = (productId: string) => {
  setMedicopList(getMedicopList().filter((x) => x.productId !== productId));
};

export const clearMedicopList = () => {
  setMedicopList([]);
};

export const getMedicopProductById = (id: string): MedicopProduct | null => {
  return MEDICOP_PRODUCT_MAP[id] ?? null;
};

export const getMedicopListWithProducts = () => {
  return getMedicopList()
    .map((item) => ({
      ...item,
      product: getMedicopProductById(item.productId),
    }))
    .filter((x) => Boolean(x.product));
};

export const getGeneratedRequirements = (): GeneratedRequirement[] => {
  return parseJSON<GeneratedRequirement[]>(localStorage.getItem(MEDICOP_REQ_KEY), []);
};

export const saveGeneratedRequirement = (payload: Omit<GeneratedRequirement, "uid" | "date">) => {
  const existing = getGeneratedRequirements();
  const nextId = existing.length + 1;
  const record: GeneratedRequirement = {
    ...payload,
    uid: `MREQ${String(nextId).padStart(3, "0")}`,
    date: new Date().toISOString().slice(0, 10),
  };
  localStorage.setItem(MEDICOP_REQ_KEY, JSON.stringify([record, ...existing]));
  return record;
};

export const updateGeneratedRequirement = (
  uid: string,
  updates: Partial<
    Pick<
      GeneratedRequirement,
      | "items"
      | "entityName"
      | "customerName"
      | "designation"
      | "phoneNumber"
      | "alternateMobileNumber"
      | "email"
      | "address"
      | "state"
      | "district"
      | "entityType"
      | "department"
      | "noOfBeds"
    >
  >
) => {
  const existing = getGeneratedRequirements();
  const next = existing.map((item) =>
    item.uid === uid
      ? {
          ...item,
          ...updates,
        }
      : item
  );
  localStorage.setItem(MEDICOP_REQ_KEY, JSON.stringify(next));
  return next.find((x) => x.uid === uid) ?? null;
};

export const MEDICOP_LIST_EVENT_NAME = MEDICOP_EVENT;
