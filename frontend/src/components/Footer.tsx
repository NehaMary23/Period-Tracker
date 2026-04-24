import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-6 border-t border-gray-800 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm">
          <p className="font-light">
            &copy; 2026 Period Tracker. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0">
            <Link
              href="https://neha-portfolio.nehamaryp.workers.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition duration-200 font-light"
            >
              Neha Mary Pramod
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
