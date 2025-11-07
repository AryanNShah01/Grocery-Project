export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white mb-4">FreshMart</h3>
            <p className="text-sm">Your trusted partner for fresh groceries with smart expiry-based discounts.</p>
          </div>
          
          <div>
            <h4 className="text-white mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white">About Us</a></li>
              <li><a href="#" className="hover:text-white">Contact</a></li>
              <li><a href="#" className="hover:text-white">Careers</a></li>
              <li><a href="#" className="hover:text-white">Blog</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white mb-4">For Sellers</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white">Sell on FreshMart</a></li>
              <li><a href="#" className="hover:text-white">Seller Guidelines</a></li>
              <li><a href="#" className="hover:text-white">Help Center</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white">Terms & Conditions</a></li>
              <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white">Refund Policy</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>&copy; 2025 FreshMart. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
