import AudioInput from "@/components/AudioInput";

export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center p-4 max-w-md">
        <AudioInput />
      </div>
    </div>
  );
}
