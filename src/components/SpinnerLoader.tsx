// loader Spinner
export default function SpinnerLoader() {
  return (
    <div className="fixed flex flex-col gap-2 items-center justify-center inset-0 z-40 bg-black/70">
      <div className="border-orange-300 border-t-4 border-l-4 rounded-full animate-spin size-14 sm:size-16 z-50 "></div>
      <p className="text-white text-xl sm:text-2xl animate-pulse">
        Please Wait...
      </p>
    </div>
  );
}
