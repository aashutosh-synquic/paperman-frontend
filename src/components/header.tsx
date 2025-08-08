"use client";

import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Leaf } from "lucide-react";

export function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-green-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center mr-3">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">Parashwanath Enterprises</span>
          </Link>
          <nav className="hidden md:flex space-x-8">
            <Link
              to="/#about"
              className="text-gray-600 hover:text-green-600 transition-colors"
            >
              About
            </Link>
            <Link
              to="/#products"
              className="text-gray-600 hover:text-green-600 transition-colors"
            >
              Products
            </Link>
            <Link
              to="/stock"
              className="text-gray-600 hover:text-green-600 transition-colors"
            >
              Stock
            </Link>
            <Link
              to="/#contact"
              className="text-gray-600 hover:text-green-600 transition-colors"
            >
              Contact
            </Link>
          </nav>
          <Link to="/stock">
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              Check Available Stock
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
