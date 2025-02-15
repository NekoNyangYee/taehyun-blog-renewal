import Header from "@components/components/Header";
import MainHome from "./mainHome";

export default function Home() {
  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex-1 max-w-[90rem] mx-auto w-full">
        <MainHome />
      </div>
    </div>
  );
}
