import React from 'react';
// The main Home component for your page
export default function HomeContent() {
  return (
    <div className="flex min-h-screen">
      <div className="flex-1 relative">
        <div className="absolute top-0 left-0 w-full h-full z-0">
        </div>
        <div className="relative z-10 flex flex-col min-h-screen">
          <main className="flex flex-1 flex-col items-center justify-center text-center px-4">
            <div className="bg-black/40 backdrop-blur-sm p-8 rounded-2xl border border-white/10 shadow-2xl shadow-purple-500/10">
              <img
                src="https://avatars.githubusercontent.com/u/1?v=4"
                alt="[Your Name] Avatar"
                className="w-32 h-32 rounded-full border-4 border-purple-500 shadow-xl mb-6 object-cover mx-auto"
              />
              <h1 className="text-5xl md:text-7xl font-extrabold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent drop-shadow-lg">
                Hi, I'm [Your Name]
              </h1>
              <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl font-light">
                Crafting immersive and performant digital experiences.
                <br />I design & build modern web applications with a focus on creativity and user engagement.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/projects"
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold shadow-lg hover:scale-105 transform transition-transform duration-300"
                >
                  View My Work
                </a>
                <a
                  href="/contact"
                  className="px-8 py-3 rounded-xl border border-purple-500 text-purple-300 font-semibold hover:bg-purple-900/40 hover:text-white transition-colors duration-300"
                >
                  Get In Touch
                </a>
              </div>
            </div>
          </main>
          <footer className="text-center text-gray-500 py-4 text-xs opacity-70">
            &copy; {new Date().getFullYear()} [Your Name]. All rights reserved.
          </footer>
        </div>
      </div>
    </div>
  );
}

