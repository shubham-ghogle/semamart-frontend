import { ChangeEvent, FormEvent, useState } from "react";
import { useSellerStore } from "../../store/sellerStore";
import Input, { InputCheckbox, InputChips, SelectInput, Textarea } from "../UI/Inputs";
import { AiOutlinePlusCircle } from "react-icons/ai";
import { MdDeleteForever } from "react-icons/md";

type ProductDetailsFormProps = {
  mode: "views",
  media: string[],
  video: string
} | {
  mode: "add"
  media?: never
  video?: never
}

export default function ProductDetailsForm({ mode, media, video }: ProductDetailsFormProps) {
  const [images, setImages] = useState<File[]>([]);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [hsn, setHsn] = useState("");
  const [shortdescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [stock, setStock] = useState("");
  const [productType, setProductType] = useState("");
  const [sku, setSku] = useState("");
  const [upsells, setUpsells] = useState("");
  const [crosssells, setCrossSells] = useState("");
  const [stockStatus, setStockStatus] = useState("In Stock");
  const [enableStockManagement, setEnableStockManagement] = useState(false);
  const [allowSingleQuantity, setAllowSingleQuantity] = useState(false);
  const [taxStatus, setTaxStatus] = useState("Taxable");
  const [taxClass, setTaxClass] = useState("Standard");
  const [discountOptions, setDiscountOptions] = useState(false);
  const [rma, setRma] = useState(false);
  const [minmaxrule, setMinMacRule] = useState(false);
  // const [productStatus, setProductStatus] = useState("");
  // const [visibiliy, setVisibility] = useState("Visible");
  // const [purchaseNote, setPurchaseNote] = useState("");
  const [allowproductreviews, setAllowProductReviews] = useState(false);
  const [weightValue, setWeightValue] = useState("");
  const [weightUnit, setWeightUnit] = useState("grams");
  const [length, setLength] = useState("");
  const [breadth, setBreadth] = useState("");
  const [height, setHeight] = useState("");
  const [dimensionUnit, setDimensionUnit] = useState("metre");
  const [manufacturerName, setManufacturerName] = useState("");
  const [selectedManufacturer, setSelectedManufacturer] = useState("Manu1");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [countryOfOrigin, setCountryOfOrigin] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("country1");
  const [shortVideo, setShortVideo] = useState<File | null>(null);

  const seller = useSellerStore((state) => state.seller);

  // Consolidated Values
  const weight = `${weightValue}/${weightUnit}`;
  const dimension = `${length}X${breadth}X${height}/${dimensionUnit}`;

  const handleThumbnailChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const file = e.target.files?.[0];
    if (file) setThumbnail(file);
  };
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (!e.target.files) return;
    const files = Array.from(e.target.files) as File[];
    setImages((prevImages) => [...prevImages, ...files]);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newForm = new FormData();
    if (thumbnail) newForm.append("thumbnail", thumbnail);

    if (shortVideo) {
      newForm.append("shortVideo", shortVideo);
    }

    images.forEach((image) => {
      newForm.append("images", image);
    });
    newForm.append("name", name);
    newForm.append("hsn", hsn);
    newForm.append("productType", productType);
    newForm.append("originalPrice", originalPrice.toString());
    newForm.append("discountPrice", discountPrice.toString());
    newForm.append("category", category);
    newForm.append("tags", tags);
    newForm.append("shortdescription", shortdescription);
    newForm.append("description", description);
    newForm.append("stock", stock);
    newForm.append("sku", sku);
    newForm.append("stockStatus", stockStatus);
    newForm.append("enableStockManagement", enableStockManagement.toString());
    newForm.append("allowSingleQuantity", allowSingleQuantity.toString());
    newForm.append("taxStatus", taxStatus);
    newForm.append("taxClass", taxClass);
    newForm.append("upsells", upsells);
    newForm.append("crosssells", crosssells);
    newForm.append("discountoptions", discountOptions.toString());
    newForm.append("rma", rma.toString());
    newForm.append("minmaxrule", minmaxrule.toString());
    // newForm.append("productStatus", productStatus);
    // newForm.append("visibility", visibiliy);
    // newForm.append("purchaseNote", purchaseNote);
    newForm.append("allowproductreviews", allowproductreviews.toString());
    newForm.append("weight", weight);
    newForm.append("dimension", dimension);
    newForm.append("manufacturerName", manufacturerName);
    newForm.append("email", email);
    newForm.append("phone", phone);
    newForm.append("origin", countryOfOrigin);
    if (seller?._id) {
      newForm.append("shopId", seller._id);
    }
    if (enableAttri) {
      newForm.append("attributes", JSON.stringify(attriForForm))
    }
    try {
      const res = await fetch("/api/v2/product/create-product", {
        method: "post",
        body: newForm,
      });

      if (!res.ok) throw new Error();
    } catch (err) {
      console.log(err);
    }
  };


  type Attribute = {
    key: string;
    value: string;
  };
  const [enableAttri, setEnableAttri] = useState(false)
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [newAttribute, setNewAttribute] = useState<Attribute>({ key: "", value: "" });

  function addAttribute() {
    if (!newAttribute.key.trim() || !newAttribute.value.trim()) return;
    setAttributes([...attributes, newAttribute]);
    setNewAttribute({ key: "", value: "" });
  };

  function deleteAttri(index: number) {
    const newAttri = [...attributes]
    newAttri.splice(index, 1)
    setAttributes(newAttri)
  }

  const attriForForm = attributes.length > 0 ? attributes.map(el => ({ [el.key]: el.value })) : null

  return (
    < form onSubmit={handleSubmit} className="max-w-3xl mx-auto bg-white p-6 rounded-md drop-shadow" >
      <Input disabled={mode === "views"} label="Name" type="text" value={name} onChange={(e) => setName(e.target.value)} />
      <Input disabled={mode === "views"} label="HSN code" type="text" value={hsn} onChange={(e) => setHsn(e.target.value)} />
      <Input disabled={mode === "views"} label="Product Type" value={productType} onChange={(e) => setProductType(e.target.value)} />
      <Input disabled={mode === "views"} label="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
      <section>
        <Input disabled={mode === "views"} label="Original Price" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} />
        <Input disabled={mode === "views"} label="Discounted Price" value={discountPrice} onChange={(e) => setDiscountPrice(e.target.value)} />
      </section>
      <InputChips disabled={mode === "views"} label="Tags" value={tags} onChange={(e) => setTags(e.target.value)} />
      <Textarea disabled={mode === "views"} label="Short Description" value={shortdescription} onChange={(e) => setShortDescription(e.target.value)} />
      <Textarea disabled={mode === "views"} label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
      <Input disabled={mode === "views"} label="Stocks Avalaible" value={stock} onChange={(e) => setStock(e.target.value)} />

      {/* /INVENTORY */}
      <section className="border border-gray-300 rounded-[5px] p-4 mt-6">
        <p className="font-bold mb-4">
          INVENTORY (Manage inventory for this product)
        </p>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Input disabled={mode === "views"} label="SKU (Stock Keeping Unit)" value={sku} onChange={(e) => setSku(e.target.value)} />
          <SelectInput disabled={mode === "views"} label="Stock status" value={stockStatus} onChange={(e) => setStockStatus(e.target.value)} />
        </div>
        <InputCheckbox disabled={mode === "views"} label="Enable product stock management" type="checkbox" checked={enableStockManagement}
          onChange={(e) => setEnableStockManagement(e.target.checked)} />
        <InputCheckbox disabled={mode === "views"} label="Allow only one quantity of this product to be bought in a single" type="checkbox"
          checked={allowSingleQuantity} onChange={(e) => setAllowSingleQuantity(e.target.checked)} />
      </section>

      {/* SHIPPING AND TAX Section */}
      <section className="border border-gray-300 rounded-[5px] p-4 mt-6">
        <p className="mb-2 font-bold">
          SHIPPING AND TAX (Manage shipping and tax for this product)
        </p>
        <div className="grid grid-cols-2 gap-4">
          <SelectInput disabled={mode === "views"} label="Tax status" value={taxStatus} onChange={(e) => setTaxStatus(e.target.value)} />
          <SelectInput disabled={mode === "views"} label="Tax Class" value={taxClass} onChange={(e) => setTaxClass(e.target.value)} />
        </div>
      </section>

      {/* LINKED PRODUCTS Section */}
      <section className="border border-gray-300 rounded-[5px] p-4 mt-6">
        <p className="mb-2 font-bold">
          LINKED PRODUCTS (See your linked products for upsell and
          cross-sells)
        </p>
        <div className="grid grid-cols-2 gap-4">
          <Input disabled={mode === "views"} label="Upsells" value={upsells} onChange={(e) => setUpsells(e.target.value)} />
          <Input disabled={mode === "views"} label="Cross-sells" value={crosssells} onChange={(e) => setCrossSells(e.target.value)} />
        </div>
      </section>

      {/*  MANAGE ATTRIBUTES Section  TODO CUSTOM ATTRIBUTES */}
      <section className="border border-gray-300 rounded-[5px] p-4 mt-6">
        <p className="mb-2 font-bold">
          MANAGE ATTRIBUTES (Manage attributes for this simple product)
        </p>
        <InputCheckbox label="Enable custom attributes" checked={enableAttri} onChange={(e) => setEnableAttri(e.target.checked)} />
        {enableAttri && (
          <div className="space-y-2">
            {attributes.length > 0 && attributes.map((el, i) => (
              <div key={i} className="grid grid-cols-[2fr_2fr_1fr] gap-4">
                <Input value={el.key} disabled />
                <Input value={el.value} disabled />
                <button type="button" onClick={() => deleteAttri(i)}><MdDeleteForever color="red" className="p-1 h-full w-fit justify-self-center" /></button>
              </div>
            ))}
            <div className="grid grid-cols-[2fr_2fr_1fr] items-center gap-4">
              <Input value={newAttribute.key} onChange={(e) => setNewAttribute({ ...newAttribute, key: e.target.value })} />
              <Input value={newAttribute.value} onChange={(e) => setNewAttribute({ ...newAttribute, value: e.target.value })} />
              <button type="button" className="p-1 text-sm bg-accentBlue rounded text-white" onClick={addAttribute}>Add attribute</button>
            </div>
          </div>
        )}
      </section>

      {/* DISCOUNT OPTIONS Section TODO */}
      <section className="border border-gray-300 rounded-[5px] p-4 mt-6">
        <p className="mb-2 font-bold">
          DISCOUNT OPTIONS (Set your discount for this product)
        </p>
        <InputCheckbox disabled={mode === "views"} label="Enable bulk discount" checked={discountOptions} onChange={(e) => setDiscountOptions(e.target.checked)} />
      </section>

      {/* RMA OPTIONS Section */}
      <section className="border border-gray-300 rounded-[5px] p-4 mt-6">
        <p className="mb-2 font-bold">
          RMA OPTIONS (Set your return and warranty settings to override
          global settings)
        </p>
        <InputCheckbox disabled={mode === "views"} label="Override your default RMA settings for this product" checked={rma} onChange={(e) => setRma(e.target.checked)} />
      </section>

      {/* MIN/MAX OPTIONS Section */}
      <section className="border border-gray-300 rounded-[5px] p-4 mt-6">
        <p className="mb-2 font-bold">
          MIN/MAX OPTIONS (Manage min/max options for this product)
        </p>
        <InputCheckbox disabled={mode === "views"} label="Enable Min Max Rule for this product" checked={minmaxrule} onChange={(e) => setMinMacRule(e.target.checked)} />
      </section>

      {/* OTHER OPTIONS Section */}
      <section className="border border-gray-300 rounded-[5px] p-4 mt-6">
        <p className="mb-2 font-bold">
          OTHER OPTIONS (Set your extra product options)
        </p>
        {/* <div className="flex justify-between gap-4"> */}
        {/*   {/*     {/* Row 1 - Product Status and Visibility */}
        {/*   <div className="w-1/2"> */}
        {/*     <label className="pb-2">Product Status</label> */}
        {/*     <select */}
        {/*       className="w-full mt-2 border h-[35px] rounded-[5px]" */}
        {/*       value={productStatus} // Add a state variable for tax class */}
        {/*       onChange={(e) => setProductStatus(e.target.value)} */}
        {/*     > */}
        {/*       <option value="pending">Pending</option> */}
        {/*       <option value="success">Success</option> */}
        {/*     </select> */}
        {/*   </div> */}
        {/*   <div className="w-1/2"> */}
        {/*     <label className="pb-2">Visibility</label> */}
        {/*     <select */}
        {/*       className="w-full mt-2 border h-[35px] rounded-[5px]" */}
        {/*       value={visibiliy} // Add a state variable for tax class */}
        {/*       onChange={(e) => setVisibility(e.target.value)} */}
        {/*     > */}
        {/*       <option value="visible">Visible</option> */}
        {/*       <option value="invisible">Invisible</option> */}
        {/*     </select> */}
        {/*   </div> */}
        {/* </div> */}
        {/**/}
        {/*   {/* Row 2 - Purchase Note */}
        {/*   <div className="mt-4"> */}
        {/*     <label className="pb-2">Purchase Note</label> */}
        {/*     <input */}
        {/*       type="text" */}
        {/*       name="purchaseNote" */}
        {/*       value={purchaseNote} // Add a state variable for SKU */}
        {/*       onChange={(e) => setPurchaseNote(e.target.value)} */}
        {/*       className="mt-2 appearance-none block w-full px-3 h-[35px] border border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" */}
        {/*       placeholder="Enter purchase note..." */}
        {/*     /> */}
        {/*   </div> */}
        {/**/}
        {/*   {/* Row 3 - Enable Product Reviews */}
        <InputCheckbox disabled={mode === "views"} label="Enable Product Reviews" checked={allowproductreviews} onChange={(e) => setAllowProductReviews(e.target.checked)} />
      </section>


      <section className="border border-gray-300 rounded-[5px] p-4 mt-6">
        <p className="mb-2 font-bold">SHIPPING DETAILS</p>
        {/* Row 1 - Weight Input and Selector */}
        <div className="grid grid-cols-2 gap-4">
          <Input disabled={mode === "views"} label="Weight" value={weightValue} onChange={(e) => setWeightValue(e.target.value)} />
          <SelectInput disabled={mode === "views"} label="Weight Unit" value={weightUnit} onChange={(e) => setWeightUnit(e.target.value)} />
        </div>
        {/* Row 2 - Dimension Inputs and Selector */}
        <div className="grid grid-cols-2 gap-4 mt-4 ">
          <div>
            <Input label="Dimension" type="hidden" />
            <div className="flex items-center gap-2 -mt-1">
              <Input disabled={mode === "views"} value={length} onChange={(e) => setLength(e.target.value)} />
              <Input disabled={mode === "views"} value={breadth} onChange={(e) => setBreadth(e.target.value)} />
              <Input disabled={mode === "views"} value={height} onChange={(e) => setHeight(e.target.value)} />
            </div>
          </div>
          <div>
            <SelectInput disabled={mode === "views"} label="Dimension Unit" value={dimensionUnit} onChange={(e) => setDimensionUnit(e.target.value)} />
          </div>
        </div>
      </section>

      <section className="border border-gray-300 rounded-[5px] p-4 mt-6">
        <p className="mb-2 font-bold">
          MANUFACTURER DETAILS
        </p>
        <div className="grid grid-cols-2 gap-4">
          <Input disabled={mode === "views"} label="Manufacturer Name" value={manufacturerName} onChange={(e) => setManufacturerName(e.target.value)} />
          <SelectInput disabled={mode === "views"} label="Select Manufacturer" value={selectedManufacturer} onChange={(e) => setSelectedManufacturer(e.target.value)} />
        </div>
        <Input disabled={mode === "views"} label="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input disabled={mode === "views"} label="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} />
        {/* Row 4 - Country of Origin and Selector */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <Input disabled={mode === "views"} label="Country of Origin" value={countryOfOrigin} onChange={(e) => setCountryOfOrigin(e.target.value)} />
          <SelectInput disabled={mode === "views"} label="Select Country" value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)} />
        </div>
      </section>

      {/* PRODUCT MEDIA */}
      <section className="border border-gray-300 p-4 rounded-[5px] mt-6">
        <h2 className="text-lg font-bold mb-4">Product Image Upload</h2>
        {/* Thumbnail Upload */}
        <div className="mb-6">
          <label className="block font-medium mb-2">
            Upload Thumbnail Image
          </label>
          <div className="border border-gray-300 h-[120px] w-[120px] flex items-center justify-center rounded-[5px] cursor-pointer">
            <label
              htmlFor="uploadThumbnail"
              className="cursor-pointer w-full h-full grid place-items-center"
            >
              {mode === "add" ? (thumbnail ? (
                <img
                  src={URL.createObjectURL(thumbnail)}
                  alt="Thumbnail"
                  className="h-full w-full object-cover"
                />
              ) : (
                <AiOutlinePlusCircle size={30} color="#555" />
              )) : (
                <img
                  src={"/baseUrl" + "/" + media[0]}
                  alt="Thumbnail"
                  className="h-full w-full object-cover"
                />
              )}
            </label>
          </div>
          <input
            type="file"
            id="uploadThumbnail"
            className="hidden"
            onChange={handleThumbnailChange}
          />
        </div>

        {/* Other Images Upload */}
        <div>
          <label className="block font-medium mb-2">
            Upload Other Images
          </label>
          <div className="flex gap-4 flex-wrap">
            {mode === "add" ? (Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="border border-gray-300 h-[120px] w-[120px] flex items-center justify-center rounded-[5px] cursor-pointer"
              >
                <label
                  htmlFor={`uploadImage-${index}`}
                  className="cursor-pointer"
                >
                  {images[index] ? (
                    <img
                      src={URL.createObjectURL(images[index])}
                      alt={`Image-${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <AiOutlinePlusCircle size={30} color="#555" />
                  )}
                </label>
                <input
                  type="file"
                  id={`uploadImage-${index}`}
                  className="hidden"
                  onChange={(e) => handleImageChange(e)}
                />
              </div>
            ))) : (
              media.map((el, i) => (
                <div
                  key={i}
                  className="border border-gray-300 h-[120px] w-[120px] flex items-center justify-center rounded-[5px] cursor-pointer"
                >
                  <img
                    src={"baseUrl" + "/" + el}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))
            )}
          </div>
        </div>

        <br />
        {/* Short Video Upload */}
        <div className="mb-6">
          <label className="block font-medium mb-2">
            Upload Short Video (Max: 2MB)
          </label>
          <div className="border border-gray-300 h-[120px] w-[120px] flex items-center justify-center rounded-[5px] cursor-pointer">
            <label htmlFor="uploadShortVideo" className="cursor-pointer">
              {mode === "add" ? (shortVideo ? (
                <video
                  controls
                  src={URL.createObjectURL(shortVideo)}
                  className="h-full w-full object-cover"
                />
              ) : (
                <AiOutlinePlusCircle size={30} color="#555" />
              )) : (
                <video
                  controls
                  src={"baseUrl" + "/" + video}
                  className="h-full w-full object-cover"
                />
              )}
            </label>
          </div>
          <input
            type="file"
            id="uploadShortVideo"
            accept="video/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file && file.size > 2 * 1024 * 1024) {
                alert("Video size should not exceed 2MB.");
                return;
              }
              if (file) {
                setShortVideo(file); // Update state for short video
              }
            }}
          />
        </div>
      </section>
      {/* Submit Button */}
      <div className="mt-6">
        <input
          type="submit"
          value="Create"
          className="cursor-pointer appearance-none text-center block w-full px-3 h-[35px] border border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>
    </form >
  );
}
