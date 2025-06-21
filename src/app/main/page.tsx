"use client";
import { Canvas } from "@react-three/fiber";
import Sidebar from "@/components/Sidebar"; // Use your Sidebar component
import HomeContent from "@/components/HomeContent";

// The main Home component for your page
export default function MainPage() {
    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1 relative">
                <div className="absolute top-0 left-0 w-full h-full z-0">
                    <Canvas camera={{ position: [0, 0, 12], fov: 75 }}>
                        <ambientLight intensity={0.3} />
                        <pointLight position={[10, 10, 10]} intensity={2.0} />
                    </Canvas>
                </div>
                {/* Place your main content here, above the animation */}
                <div className="relative z-10 flex items-center justify-center h-full">
                    {/* Your main content */}
                    <HomeContent/>
                </div>
            </div>
        </div>
    );
}
