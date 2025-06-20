import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      {/* Animated space background */}
      <div className="absolute inset-0 z-0">
        <div className="stars"></div>
        <div className="stars2"></div>
        <div className="stars3"></div>
      </div>
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex flex-1 flex-col items-center justify-center text-center px-4">
          {/* Profile Avatar */}
          <img
            src="https://avatars.githubusercontent.com/u/1?v=4"
            alt="[Your Name] Avatar"
            className="w-32 h-32 rounded-full border-4 border-purple-700 shadow-xl mb-6 object-cover"
          />
          {/* Hero Headline */}
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-purple-400 via-indigo-400 to-pink-400 bg-clip-text text-transparent drop-shadow-xl">
            Hi, I'm [Your Name]
          </h1>
          {/* Subheadline */}
          <p className="text-lg md:text-2xl text-gray-300 mb-8 max-w-2xl font-light">
            20+ years crafting beautiful, performant digital experiences.<br />
            I design & build modern web apps with a focus on UI/UX, speed, and accessibility.
          </p>
          {/* CTA Buttons */}
          <div className="flex gap-4 mb-10">
            <a
              href="/projects"
              className="px-7 py-3 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-700 text-white font-semibold shadow-lg hover:scale-105 transition-transform"
            >
              View Projects
            </a>
            <a
              href="/contact"
              className="px-7 py-3 rounded-xl border border-purple-700 text-purple-300 font-semibold hover:bg-purple-900/40 hover:text-white transition"
            >
              Contact Me
            </a>
          </div>
          {/* Skills Badges */}
          <div className="flex flex-wrap justify-center gap-3 opacity-90">
            {["React", "Next.js", "UI/UX", "Performance", "Accessibility"].map((skill) => (
              <span
                key={skill}
                className="bg-white/10 backdrop-blur px-4 py-2 rounded-full text-sm text-gray-200 border border-purple-700 shadow"
              >
                {skill}
              </span>
            ))}
          </div>
        </main>
        <footer className="text-center text-gray-500 py-4 text-xs opacity-60">
          &copy; {new Date().getFullYear()} [Your Name]. All rights reserved.
        </footer>
      </div>
    </div>
  );
}

