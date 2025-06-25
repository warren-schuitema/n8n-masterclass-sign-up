// Footer component with contact information
import React from 'react';
import { Bot, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-navy-950 border-t border-primary-500/20 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <Bot className="h-8 w-8 text-electric-400" />
              <span className="font-orbitron font-bold text-xl tracking-wider">
                N8N MASTERCLASS
              </span>
            </div>
            <p className="text-gray-400 font-inter leading-relaxed">
              Master workflow automation from beginner to advanced user. 
              Build powerful agents and connect your entire tech stack.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-orbitron font-bold text-lg mb-4 text-electric-400">
              CONTACT
            </h3>
            <div className="space-y-3">
              <a
                href="mailto:info@matchless-marketing.com"
                className="flex items-center space-x-3 text-gray-400 hover:text-white transition-colors duration-200"
              >
                <Mail className="h-5 w-5" />
                <span className="font-inter">info@matchless-marketing.com</span>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 font-inter">
            © 2025 N8N Masterclass. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};