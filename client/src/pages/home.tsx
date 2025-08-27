import { Navigation } from "@/components/navigation";
import { HeroCarousel } from "@/components/hero-carousel";
import { ProductGrid } from "@/components/product-grid";
import { ShoppingCartSidebar } from "@/components/shopping-cart";

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <Navigation />
      <HeroCarousel />
      <ProductGrid />
      
      {/* Footer */}
      <footer className="bg-slate-900 dark:bg-slate-950 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                  <i className="fas fa-shopping-bag text-white text-sm"></i>
                </div>
                <span className="text-xl font-bold">ElegantShop</span>
              </div>
              <p className="text-slate-400 mb-6 max-w-md">
                Your premium destination for quality products. We curate the finest selection of items to enhance your lifestyle.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <i className="fab fa-instagram"></i>
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <i className="fab fa-linkedin-in"></i>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#home" className="text-slate-400 hover:text-white transition-colors">Home</a></li>
                <li><a href="#products" className="text-slate-400 hover:text-white transition-colors">Products</a></li>
                <li><a href="#categories" className="text-slate-400 hover:text-white transition-colors">Categories</a></li>
                <li><a href="#about" className="text-slate-400 hover:text-white transition-colors">About Us</a></li>
                <li> <a className="text-slate-400 hover:text-white transition-colors" href="https://wa.me/8801890342817?text=Hi%20I%20came%20from%20your%20website" target="_blank">
  Chat with me on WhatsApp
</a>
</li>
                <li><a href="#contact" className="text-slate-400 hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            {/* Customer Service */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Customer Service</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Shipping Info</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Returns</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-12 pt-8 text-center">
            <p className="text-slate-400">
              &copy; 2024 ElegantShop. All rights reserved. Designed with ❤️ for amazing shopping experiences.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
