type LoaderUiParams = {
  title: string;
};
export default function LoaderUi({ title }: LoaderUiParams) {
  return (
    <div className="h-full grid place-items-center">
      <p className="text-3xl text-darkBlue">{title}</p>
    </div>
  );
}
