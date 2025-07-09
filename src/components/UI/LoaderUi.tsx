type LoaderUiParams = {
  title: string;
};
export default function LoaderUi({ title }: LoaderUiParams) {
  return (
    <div className="h-[calc(100vh-350px)] grid place-items-center">
      <p className="text-3xl text-darkBlue">{title}</p>
    </div>
  );
}

type OverlayParams = {
  label?: string;
};
export function ScreenOverlayLoaderUi({ label }: OverlayParams) {
  if (!label) {
    label = "Loading...";
  }
  return (
    <article className="fixed inset-0 bg-black/60 grid place-items-center z-[1000]">
      <p className="text-3xl text-white">{label}</p>
    </article>
  );
}
