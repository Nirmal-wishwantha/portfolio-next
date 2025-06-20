import Navbar from "@/components/Navbar";

export default function BlogPage() {
    return (
        <div>
            <Navbar />
            <main className="flex flex-col items-center justify-center min-h-[80vh]">
                <h1 className="text-3xl font-bold mb-4">Blog</h1>
                <p className="text-lg text-gray-700 dark:text-gray-300">
                    Welcome to my blog! (Add your blog posts here!)
                </p>
            </main>
        </div>
    );
}