import MainHome from "./mainHome";
import LoadingWrapper from "./LoadingWrapper";

export default function Home() {
  return (
    <div className="h-full flex flex-col w-full">
      <LoadingWrapper>
        <MainHome />
      </LoadingWrapper>
    </div>
  );
}
