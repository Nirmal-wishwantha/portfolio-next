import Link from "next/link";

const Navbar = () => (
    <nav className="w-full flex justify-center gap-8 py-4 bg-gray-100 dark:bg-gray-900">
        <Link href="/" className="font-semibold hover:underline">Home</Link>
        <Link href="/about" className="font-semibold hover:underline">About</Link>
        <Link href="/projects" className="font-semibold hover:underline">Projects</Link>
        <Link href="/blog" className="font-semibold hover:underline">Blog</Link>
        <Link href="/contact" className="font-semibold hover:underline">Contact</Link>
    </nav>
);

export default Navbar;