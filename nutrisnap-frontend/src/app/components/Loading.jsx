import { trefoil } from "ldrs";

// Default values shown

export default function Loading() {
  trefoil.register();
  return (
    <div className="fixed top-0 flex border-b w-screen left-0  h-screen items-center justify-center bg-slate-200 bg-clip-padding bg-opacity-10 ">
      <l-trefoil
        size="100"
        stroke="4"
        stroke-length="0.15"
        bg-opacity="0.1"
        speed="1.4"
        color="black"
      ></l-trefoil>
    </div>
  );
}
