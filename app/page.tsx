import MainHome from "./mainHome";

export default function Home() {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 max-w-[90rem] mx-auto w-full">
        <MainHome />
      </div>
    </div>
  );
}
