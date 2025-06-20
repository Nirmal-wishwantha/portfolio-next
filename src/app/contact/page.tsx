import Navbar from "@/components/Navbar";

export default function ContactPage() {
    return (
        <div>
            <Navbar />
            <main className="flex flex-col items-center justify-center min-h-[80vh]">
                <h1 className="text-3xl font-bold mb-4">Contact</h1>
                <p className="text-lg text-gray-700 dark:text-gray-300">
                    Get in touch with me! (Add your contact form or info here!)
                </p>
            </main>
        </div>
    );
}