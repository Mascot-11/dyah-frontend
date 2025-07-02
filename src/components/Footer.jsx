import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter } from "lucide-react";
import { useLocation } from "react-router-dom";

export default function Footer() {
  const location = useLocation();

  // Hide footer on admin/dashboard routes
  if (
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/dashboard")
  ) {
    return null;
  }

  return (
    <footer className="bg-zinc-900 text-white relative">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Color Mode Section */}
          <div>
            <h3 className="text-lg font-medium mb-3">Dyah Khyah</h3>
            <p className="text-sm text-gray-300 mb-4">
              Expressing creativity through fashion, music, and art.
            </p>
            <div className="flex space-x-4">
              <Link to="#" aria-label="Facebook">
                <Facebook className="h-5 w-5 text-gray-300 hover:text-white transition-colors" />
              </Link>
              <Link to="#" aria-label="Instagram">
                <Instagram className="h-5 w-5 text-gray-300 hover:text-white transition-colors" />
              </Link>
              <Link to="#" aria-label="Twitter">
                <Twitter className="h-5 w-5 text-gray-300 hover:text-white transition-colors" />
              </Link>
            </div>
          </div>

          {/* Quick Links Section */}
          <div>
            <h3 className="text-lg font-medium mb-3">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/landing"
                  className="text-sm text-gray-300 hover:text-white transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/gallery"
                  className="text-sm text-gray-300 hover:text-white transition-colors"
                >
                  Gallery
                </Link>
              </li>
              <li>
                <Link
                  to="/aboutus"
                  className="text-sm text-gray-300 hover:text-white transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="text-sm text-gray-300 hover:text-white transition-colors"
                >
                  FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Information Section */}
          <div>
            <h3 className="text-lg font-medium mb-3">Contact Information</h3>
            <address className="not-italic">
              <p className="text-sm text-gray-300 mb-2">Thamel</p>
              <p className="text-sm text-gray-300 mb-2">(111) 123-41111</p>
              <p className="text-sm text-gray-300">
                <a
                  href="mailto:info@dyahkhyah.com.np"
                  className="hover:text-white transition-colors"
                >
                  info@dyahkhyah.com.np
                </a>
              </p>
            </address>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-zinc-800 mt-8 pt-4 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} Dyah Khyah. All rights reserved.
          <br />
          <a
            href="https://shreeyushdhungana.com.np/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline"
          >
            Developed By Shreeyush Dhungana
          </a>
        </div>
      </div>
    </footer>
  );
}
