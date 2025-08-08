import { Leaf, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center mr-3">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">
                Parashwanath Enterprises
              </span>
            </div>
            <p className="text-gray-400 mb-4">
              Leading manufacturer of sustainable paper reels, committed to
              quality and environmental responsibility.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/#about"
                  className="text-gray-400 hover:text-green-400 transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/#products"
                  className="text-gray-400 hover:text-green-400 transition-colors"
                >
                  Products
                </Link>
              </li>
              <li>
                <Link
                  to="/stock"
                  className="text-gray-400 hover:text-green-400 transition-colors"
                >
                  Stock
                </Link>
              </li>
              <li>
                <Link
                  to="/#contact"
                  className="text-gray-400 hover:text-green-400 transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Products</h3>
            <ul className="space-y-2">
              <li>
                <span className="text-gray-400">Standard Paper Reels</span>
              </li>
              <li>
                <span className="text-gray-400">Custom Paper Reels</span>
              </li>
              <li>
                <span className="text-gray-400">Eco-Friendly Options</span>
              </li>
              <li>
                <span className="text-gray-400">Industrial Grade</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-2 text-green-400" />
                <span className="text-gray-400">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-2 text-green-400" />
                <span className="text-gray-400">
                  info@Parashwanath Enterprises.com
                </span>
              </div>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-green-400" />
                <span className="text-gray-400">
                  123 Industrial Ave, City, State
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © 2024 Parashwanath Enterprises. All rights reserved. | Sustainable
            Manufacturing Solutions
          </p>
        </div>
      </div>
    </footer>
  );
}
