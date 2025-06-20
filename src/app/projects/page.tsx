import Navbar from "@/components/Navbar";

export default function ProjectsPage() {
    return (
        <div>
            <Navbar />
            <main className="flex flex-col items-center justify-center min-h-[80vh]">
                <h1 className="text-3xl font-bold mb-4">Projects</h1>
                <p className="text-lg text-gray-700 dark:text-gray-300">
                    Here are some of my projects. (Add your project details here!)
                </p>
            </main>
        </div>
    );
}