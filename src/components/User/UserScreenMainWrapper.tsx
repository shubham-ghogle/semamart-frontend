import { ReactNode } from "react";
import LoaderUi from "../UI/LoaderUi";

type MainWrapperProps = {
  status: "error" | "pending" | "success";
  heading: string;
  children: ReactNode;
  errorMeassage?: string;
};

export default function UserScreenMainWrapper({
  status,
  heading,
  children,
  errorMeassage,
}: MainWrapperProps) {
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
