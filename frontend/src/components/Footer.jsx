"use client";

const Footer = () => {
  return (
    <footer className="w-full bg-gray-900 text-gray-300 mt-20">
      {/* Main footer grid */}
      <div className="w-full px-8 py-12 grid grid-cols-1 md:grid-cols-3 gap-10 max-w-7xl mx-auto">
        {/* About */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">
            About This Blog
          </h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            A platform to share insights, tutorials, and stories with developers
            around the world. Join, write, and grow with the community.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="/" className="hover:text-indigo-400 transition-colors">
                Home
              </a>
            </li>
            <li>
              <a
                href="/about"
                className="hover:text-indigo-400 transition-colors"
              >
                About
              </a>
            </li>
            <li>
              <a
                href="/contact"
                className="hover:text-indigo-400 transition-colors"
              >
                Contact
              </a>
            </li>
          </ul>
        </div>

        {/* Stay Connected */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">
            Stay Connected
          </h3>
          <div className="flex space-x-4 text-2xl">
            <a href="#" className="hover:text-indigo-400 transition-colors">
              🌐
            </a>
            <a href="#" className="hover:text-indigo-400 transition-colors">
              🐦
            </a>
            <a href="#" className="hover:text-indigo-400 transition-colors">
              📸
            </a>
          </div>
        </div>
      </div>

      {/* Bottom line */}
      <div className="border-t border-gray-800 text-center py-5 text-sm text-gray-500">
        © {new Date().getFullYear()} BlogSphere — All Rights Reserved.
      </div>
    </footer>
  );
};

export default Footer;
