type LoaderUiParams = {
  title?: string;
};
export default function LoaderUi({ title = "Loading..." }: LoaderUiParams) {
  return (
    <div className="grid min-h-[240px] place-items-center px-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#1C647C]/20 border-t-[#1C647C]" />
        <p className="text-lg font-medium text-[#1C647C]">{title}</p>
      </div>
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
    <article className="fixed inset-0 z-1000 grid place-items-center bg-black/60">
      <div className="flex flex-col items-center gap-4 rounded-2xl bg-white px-8 py-6 shadow-2xl">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#1C647C]/20 border-t-[#1C647C]" />
        <p className="text-base font-medium text-[#1C647C]">{label}</p>
      </div>
    </article>
  );
}
