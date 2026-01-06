import { FaGithub, FaLinkedin, FaTwitter } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="relative text-[var(--secondary-text)] dark:bg-black pt-16 overflow-x-hidden">
        {/* Footer Wave Divider */}
        <div className="absolute -top-8 left-0 w-full overflow-x-hidden leading-none">
          <svg
            className="relative block w-[200%] h-40"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            {/* Big back wave */}
            <path
              d="M0,40 C300,120 500,-20 800,60 C1000,120 1200,20 1200,20 L1200,120 L0,120 Z"
              className="wave wave1"
              fill="#0a0a0a"
              opacity="0.5"
            />

            {/* Mid wave */}
            <path
              d="M0,60 C200,140 500,0 800,80 C1000,140 1200,40 1200,40 L1200,120 L0,120 Z"
              className="wave wave2"
              fill="#0a0a0a"
              
            />

            {/* Thin gray base wave */}
            <path
              d="M0,80 C400,120 800,60 1200,100 L1200,120 L0,120 Z"
              className="wave wave3"
              fill="#0a0a0a"
              opacity="0.35"
            />
          </svg>
        </div>

        {/* Footer Content */}
        <div className="bg-[var(--secondary-background)] w-full h-full">
          <div className="grid w-full px-10 md:grid-cols-3 gap-8 mt-15 text-center md:text-left relative z-10">
            {/* Left */}
            <div>
              <h3 className="text-xl font-bold text-[var(--secondary-text)] mb-2">LevelUpLearn</h3>
              <p className="text-gray-500 text-sm">
                Unlock your potential with interactive learning and AI support.
              </p>
            </div>

            {/* Center */}
            <div>
              <h4 className="font-semibold text-[var(--secondary-text)] mb-2">Quick Links</h4>
              <ul className="space-y-1">
                <li><a href="#hero" className="hover:font-bold">Home</a></li>
                <li><a href="#features" className="hover:font-bold">Features</a></li>
                <li><a href="#testimonials" className="hover:font-bold">Testimonials</a></li>
                <li><a href="#contact" className="hover:font-bold">Contact</a></li>
              </ul>
            </div>

            {/* Right */}
            <div>
              <h4 className="font-semibold text-[var(--secondary-text)] mb-2">Follow Us</h4>
              <div className="flex justify-center md:justify-start gap-4">
                <a href="#" className="hover:text-black hover:scale-110 transition"><FaGithub size={20} /></a>
                <a href="#" className="hover:text-blue-600 hover:scale-110 transition"><FaLinkedin size={20} /></a>
                <a href="#" className="hover:text-blue-500 hover:scale-110 transition"><FaTwitter size={20} /></a>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-[var(--tertiary-text)] bg-[var(--secondary-background)] text-md pt-10 relative z-10">
          © {new Date().getFullYear()} LevelUpLearn. All rights reserved.
        </p>
      </footer>
  );
}
