import { ReactNode } from "react";
import LoaderUi from "../UI/LoaderUi";

type MainWrapperParams = {
  status: "error" | "pending" | "success";
  heading: string;
  children: ReactNode;
  errorMeassage?: string;
};
export default function AdminMainWrapper({
  status,
  heading,
  children,
  errorMeassage,
}: MainWrapperParams) {
  return (
    <article className="h-full p-4">
      <h1 className="text-center text-3xl mb-8 text-darkBlue font-bold">
        {heading}
      </h1>
      {status === "pending" && <LoaderUi title="Loading..." />}
      {status === "error" && <LoaderUi title={errorMeassage || ""} />}
      {children}
    </article>
  );
}
