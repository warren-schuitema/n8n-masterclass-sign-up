// Hero section with countdown timer and main CTA
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, ArrowRight } from 'lucide-react';

interface HeroProps {
  onRegisterClick: () => void;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const Hero: React.FC<HeroProps> = ({ onRegisterClick }) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isEventPassed, setIsEventPassed] = useState(false);

  // Event date: July 24, 2025 at 3:00 PM EST
  const eventDate = new Date('2025-07-24T19:00:00.000Z'); // 3 PM EST = 7 PM UTC

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const eventTime = eventDate.getTime();
      const difference = eventTime - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
        setIsEventPassed(false);
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setIsEventPassed(true);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(14,165,233,0.1),transparent_50%)]"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-electric-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">
        <div className="animate-fade-in">
          <h1 className="font-orbitron font-black text-4xl sm:text-6xl lg:text-7xl mb-6 tracking-wider">
            <span className="bg-gradient-to-r from-electric-400 via-primary-400 to-violet-400 bg-clip-text text-transparent">
              CREATING AGENTS
            </span>
            <br />
            <span className="text-white">& AUTOMATIONS</span>
            <br />
            <span className="text-2xl sm:text-4xl lg:text-5xl font-normal">IN N8N</span>
          </h1>
          
          <p className="font-inter text-xl sm:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Master workflow automation from beginner to advanced user. 
            Build powerful agents and connect your entire tech stack.
          </p>

          {/* Countdown Timer */}
          {!isEventPassed ? (
            <div className="mb-12">
              <h2 className="font-orbitron font-bold text-2xl mb-6 text-electric-400">
                EVENT STARTS IN:
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                <div className="bg-navy-800/30 backdrop-blur-sm rounded-xl p-4 border border-primary-500/20">
                  <div className="text-3xl font-bold text-electric-400">{timeLeft.days}</div>
                  <div className="text-sm text-gray-300">DAYS</div>
                </div>
                <div className="bg-navy-800/30 backdrop-blur-sm rounded-xl p-4 border border-primary-500/20">
                  <div className="text-3xl font-bold text-electric-400">{timeLeft.hours}</div>
                  <div className="text-sm text-gray-300">HOURS</div>
                </div>
                <div className="bg-navy-800/30 backdrop-blur-sm rounded-xl p-4 border border-primary-500/20">
                  <div className="text-3xl font-bold text-electric-400">{timeLeft.minutes}</div>
                  <div className="text-sm text-gray-300">MINUTES</div>
                </div>
                <div className="bg-navy-800/30 backdrop-blur-sm rounded-xl p-4 border border-primary-500/20">
                  <div className="text-3xl font-bold text-electric-400">{timeLeft.seconds}</div>
                  <div className="text-sm text-gray-300">SECONDS</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-12">
              <h2 className="font-orbitron font-bold text-2xl mb-6 text-violet-400">
                MISSED THE LIVE EVENT?
              </h2>
              <p className="text-xl text-gray-300 mb-6">
                Get instant access to the complete masterclass recording!
              </p>
            </div>
          )}

          {/* Event Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
            <div className="bg-navy-800/30 backdrop-blur-sm rounded-xl p-6 border border-primary-500/20 hover:border-primary-400/40 transition-all duration-300">
              <Calendar className="h-8 w-8 text-electric-400 mx-auto mb-3" />
              <h3 className="font-orbitron font-bold text-lg mb-2">DATE</h3>
              <p className="text-gray-300">July 24, 2025</p>
            </div>
            
            <div className="bg-navy-800/30 backdrop-blur-sm rounded-xl p-6 border border-primary-500/20 hover:border-primary-400/40 transition-all duration-300">
              <Clock className="h-8 w-8 text-electric-400 mx-auto mb-3" />
              <h3 className="font-orbitron font-bold text-lg mb-2">TIME</h3>
              <p className="text-gray-300">3:00 PM - 6:00 PM EST</p>
            </div>
            
            <div className="bg-navy-800/30 backdrop-blur-sm rounded-xl p-6 border border-primary-500/20 hover:border-primary-400/40 transition-all duration-300">
              <Users className="h-8 w-8 text-electric-400 mx-auto mb-3" />
              <h3 className="font-orbitron font-bold text-lg mb-2">FORMAT</h3>
              <p className="text-gray-300">{isEventPassed ? 'Complete Recording' : 'Live Interactive Session'}</p>
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={onRegisterClick}
            className="group inline-flex items-center px-12 py-4 bg-gradient-to-r from-electric-500 to-violet-500 rounded-xl font-orbitron font-bold text-xl tracking-wider hover:from-electric-400 hover:to-violet-400 transition-all duration-300 transform hover:scale-105 animate-glow"
          >
            SECURE YOUR SPOT
            <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform duration-200" />
          </button>
          
          <p className="font-inter text-sm text-gray-400 mt-4">
            Limited seats available • Register now to secure your access
          </p>
        </div>
      </div>
    </section>
  );
};