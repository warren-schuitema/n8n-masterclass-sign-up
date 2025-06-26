// Instructor bio section featuring Warren Schuitema - Fixed image import for deployment
import React from 'react';
import { Linkedin, Twitter, Globe } from 'lucide-react';
import instructorImage from '../assets/3eEbkcdwaLZQ5sLM1Hybl_825df02bd20d49ff9a2a3ffc2885bb60.png';

export const Instructor: React.FC = () => {
  return (
    <section id="instructor" className="py-20 bg-navy-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-slide-up">
          <h2 className="font-orbitron font-black text-4xl sm:text-5xl mb-6 tracking-wider">
            <span className="bg-gradient-to-r from-electric-400 to-violet-400 bg-clip-text text-transparent">
              YOUR INSTRUCTOR
            </span>
          </h2>
          <p className="font-inter text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Learn from a passionate automation enthusiast with hands-on experience in workflow optimization
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="bg-navy-800/30 backdrop-blur-sm rounded-2xl p-8 lg:p-12 border border-primary-500/20">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
              {/* Profile Image */}
              <div className="lg:col-span-1 text-center">
                <div className="relative inline-block">
                  <img
                    src={instructorImage}
                    alt="Warren Schuitema"
                    className="w-64 h-64 rounded-2xl object-cover border-4 border-electric-400/30 shadow-2xl"
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-electric-500/20 to-transparent"></div>
                </div>
              </div>

              {/* Bio Content */}
              <div className="lg:col-span-2">
                <h3 className="font-orbitron font-bold text-3xl mb-4 text-white">
                  Warren Schuitema
                </h3>
                <p className="font-inter text-lg text-electric-400 mb-6">
                  Automation Enthusiast & N8N Practitioner
                </p>
                
                <div className="space-y-4 text-gray-300 font-inter leading-relaxed">
                  <p>
                    Warren is passionate about helping businesses and individuals discover the power of 
                    workflow automation. With hands-on experience using N8N and other automation tools, 
                    he understands the challenges of getting started and the incredible potential that 
                    automation can unlock.
                  </p>
                  
                  <p>
                    Through practical experience building workflows and connecting various tools and 
                    services, Warren has developed effective strategies for automation that he's excited 
                    to share. His approach focuses on real-world applications and helping others avoid 
                    common pitfalls when starting their automation journey.
                  </p>
                  
                  <p>
                    As someone who believes in the transformative power of automation, Warren is 
                    committed to making these powerful tools accessible to everyone, regardless of 
                    their technical background. This masterclass represents his dedication to sharing 
                    knowledge and helping others succeed with N8N.
                  </p>
                </div>

                {/* Social Links */}
                <div className="flex space-x-4 mt-8">
                  <a
                    href="#"
                    className="flex items-center justify-center w-12 h-12 bg-navy-700/50 rounded-lg hover:bg-electric-500/20 transition-colors duration-200"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="h-6 w-6 text-electric-400" />
                  </a>
                  <a
                    href="#"
                    className="flex items-center justify-center w-12 h-12 bg-navy-700/50 rounded-lg hover:bg-electric-500/20 transition-colors duration-200"
                    aria-label="Twitter"
                  >
                    <Twitter className="h-6 w-6 text-electric-400" />
                  </a>
                  <a
                    href="#"
                    className="flex items-center justify-center w-12 h-12 bg-navy-700/50 rounded-lg hover:bg-electric-500/20 transition-colors duration-200"
                    aria-label="Website"
                  >
                    <Globe className="h-6 w-6 text-electric-400" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};