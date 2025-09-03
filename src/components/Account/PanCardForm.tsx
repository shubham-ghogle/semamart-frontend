import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";

type FormData = {
  panNumber: string;
  fullName: string;
  panFile: FileList;
  declaration: boolean;
};

const PanCardForm = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState("No file chosen");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    trigger,
  } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    console.log("Submitted Data:", data);
  };

  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      const isJpegType =
        file.type === "image/jpeg" || file.type === "image/jpg";
      const isJpegExt = file.name.toLowerCase().endsWith(".jpeg") || file.name.toLowerCase().endsWith(".jpg");

      if (!(isJpegType || isJpegExt)) {
        alert("Only JPEG files are allowed.");
        e.target.value = "";
        setFileName("No file chosen");
        setValue("panFile", e.target.files as FileList);
        trigger("panFile");
        return;
      }

      setFileName(file.name);
      setValue("panFile", e.target.files as FileList);
      trigger("panFile");
    }
  };

  return (
    <div className="flex-1 p-6 bg-white shadow-lg font-montserrat m-6">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          PAN Card Information
        </h2>

        {/* PAN Number */}
        <div className="mb-4">
          <label htmlFor="panNumber" className="block text-sm font-medium text-gray-700 mb-1">
            PAN Card Number
          </label>
          <input
            id="panNumber"
            type="text"
            placeholder="Enter PAN Number"
            {...register("panNumber", { required: "PAN Card Number is required" })}
            className={`w-50 border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
              errors.panNumber ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
            }`}
          />
          {errors.panNumber && (
            <p className="text-red-500 text-xs mt-1">{errors.panNumber.message}</p>
          )}
        </div>

        {/* Full Name */}
        <div className="mb-4">
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            placeholder="Enter Full Name"
            {...register("fullName", { required: "Full Name is required" })}
            className={`w-50 border px-3 py-2  text-sm focus:outline-none focus:ring-2 ${
              errors.fullName ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
            }`}
          />
          {errors.fullName && (
            <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>
          )}
        </div>

        {/* Upload PAN Card */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Upload PAN Card <span className="text-xs text-gray-500">(Only JPEG file is allowed)</span>
          </label>

          <div className="border w-70 border-gray-300  px-3 py-2 bg-white flex items-center space-x-4">
            <button
              type="button"
              onClick={handleChooseFile}
              className="bg-gray-100 text-sm px-4 py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-200"
            >
              Choose File
            </button>
            <span className="text-sm text-gray-500 truncate max-w-[200px]">{fileName}</span>

            {/* Hidden input */}
            <input
              type="file"
              accept=".jpeg,.jpg,image/jpeg"
              {...register("panFile", {
                required: "Please upload a JPEG PAN card file",
                validate: {
                  isJpeg: (files) => {
                    const file = files?.[0];
                    if (!file) return "File is required";

                    const validTypes = ["image/jpeg", "image/jpg"];
                    const isValidType = validTypes.includes(file.type);
                    const isValidExt =
                      file.name.toLowerCase().endsWith(".jpeg") ||
                      file.name.toLowerCase().endsWith(".jpg");

                    return isValidType || isValidExt || "Only JPEG files allowed";
                  },
                },
              })}
              ref={(e) => {
                register("panFile").ref(e);
                fileInputRef.current = e;
              }}
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {errors.panFile && (
            <p className="text-red-500 text-xs mt-1">{errors.panFile.message}</p>
          )}
        </div>

        {/* Declaration */}
        <div className="mb-4">
          <label className="flex items-start text-sm text-gray-700 space-x-2">
            <input
              type="checkbox"
              {...register("declaration", { required: true })}
              className="mt-1 border-gray-300 rounded text-blue-600 focus:ring-blue-500"
            />
            <span>
              I do hereby declare that PAN furnished/stated above is correct and belongs to me,
              registered as an account holder with <strong>www.semamart.com</strong>. I further declare that I shall solely be held
              responsible for the consequences, in case of any false PAN declaration.
            </span>
          </label>
          {errors.declaration && (
            <p className="text-red-500 text-xs mt-1">You must agree to the declaration</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200"
        >
          UPLOAD
        </button>

        {/* Terms */}
        <div className="mt-4 text-center">
          <a
            href="#"
            className="text-sm text-blue-600 hover:underline font-medium"
          >
            Read Terms & Conditions of PAN Card Information
          </a>
        </div>
      </form>
    </div>
  );
};

export default PanCardForm;
