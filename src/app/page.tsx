import Waybar from "@/components/Waybar/Waybar";

export default function Home() {
  return (
    <div className="relative w-full h-screen bg-[#1e1e2e] overflow-hidden font-sans">
      {/* Background Wallpaper Mockup - typical Arch linux stylish wallpaper */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-80"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop")' }}
      />
      
      {/* Waybar */}
      <Waybar />

      {/* Desktop Space (Hyprland tiling will go here later) */}
      <main className="relative z-10 w-full h-full pt-16 p-4">
        {/* Placeholder for future windows */}
      </main>
    </div>
  );
}
