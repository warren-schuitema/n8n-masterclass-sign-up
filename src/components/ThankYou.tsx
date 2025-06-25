// Thank you page with calendar integration and contact information
import React from 'react';
import { CheckCircle, Calendar, ArrowLeft } from 'lucide-react';

interface ThankYouProps {
  onBackToLanding: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export const ThankYou: React.FC<ThankYouProps> = ({ onBackToLanding }) => {
  // Check if event has passed (July 24, 2025)
  const eventDate = new Date('2025-07-24T19:00:00.000Z');
  const isEventPassed = new Date() > eventDate;

  const calendarLinks = [
    {
      name: 'Google Calendar',
      url: 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=N8N%20Masterclass&dates=20250724T190000Z/20250724T220000Z&details=N8N%20Masterclass:%20Creating%20Agents%20and%20Automations%20from%20Beginner%20to%20Advanced&location=Online%20Event',
      icon: '📅'
    },
    {
      name: 'Outlook Calendar',
      url: 'https://outlook.live.com/calendar/0/deeplink/compose?subject=N8N%20Masterclass&startdt=2025-07-24T19:00:00Z&enddt=2025-07-24T22:00:00Z&body=N8N%20Masterclass:%20Creating%20Agents%20and%20Automations%20from%20Beginner%20to%20Advanced&location=Online%20Event',
      icon: '📆'
    },
    {
      name: 'Apple Calendar',
      url: 'data:text/calendar;charset=utf8,BEGIN:VCALENDAR%0AVERSION:2.0%0APRODID:-//Test//Test//EN%0ABEGIN:VEVENT%0AUID:test@example.com%0ADTSTAMP:20250101T120000Z%0ADTSTART:20250724T190000Z%0ADTEND:20250724T220000Z%0ASUMMARY:N8N Masterclass%0ADESCRIPTION:N8N Masterclass: Creating Agents and Automations from Beginner to Advanced%0ALOCATION:Online Event%0AEND:VEVENT%0AEND:VCALENDAR',
      icon: '🍎'
    }
  ];

  return (
    <div className="min-h-screen bg-navy-950 text-white">
      {/* Header */}
      <header className="border-b border-primary-500/20 bg-navy-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={onBackToLanding}
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors duration-200"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-inter">Back to Masterclass</span>
            </button>
            
            <h1 className="font-orbitron font-bold text-xl tracking-wider">
              {isEventPassed ? 'ACCESS CONFIRMED' : 'REGISTRATION CONFIRMED'}
            </h1>
            
            <div className="w-32"></div> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Message */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mb-6">
            <CheckCircle className="h-12 w-12 text-green-400" />
          </div>
          
          <h1 className="font-orbitron font-black text-4xl sm:text-5xl mb-4 tracking-wider">
            <span className="bg-gradient-to-r from-electric-400 to-violet-400 bg-clip-text text-transparent">
              {isEventPassed ? 'ACCESS' : 'WELCOME TO THE'}
            </span>
            <br />
            <span className="text-white">
              {isEventPassed ? 'CONFIRMED!' : 'MASTERCLASS!'}
            </span>
          </h1>
          
          <p className="font-inter text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            {isEventPassed 
              ? 'You now have lifetime access to the complete N8N Masterclass recording. You can start watching immediately!'
              : 'Your registration is confirmed! Get ready to transform your automation skills and unlock the full potential of N8N.'
            }
          </p>
        </div>

        {/* Event Details or Access Info */}
        <div className="bg-navy-800/30 backdrop-blur-sm rounded-2xl p-8 border border-primary-500/20 mb-8">
          {isEventPassed ? (
            <div className="text-center">
              <h2 className="font-orbitron font-bold text-2xl mb-6 text-electric-400">
                YOUR REPLAY ACCESS
              </h2>
              <p className="text-gray-300 mb-6">
                You have lifetime access to the complete 3-hour N8N Masterclass recording. 
                Watch at your own pace and revisit any section as many times as you need.
              </p>
              <div className="bg-navy-700/30 rounded-xl p-6 border border-electric-400/20">
                <h3 className="font-orbitron font-bold text-lg text-electric-400 mb-4">
                  WHAT'S INCLUDED
                </h3>
                <ul className="text-gray-300 space-y-2">
                  <li>• Complete 3-hour masterclass recording</li>
                  <li>• All presentation materials and resources</li>
                  <li>• Lifetime access - watch anytime</li>
                  <li>• Access to any bonus materials shared</li>
                </ul>
              </div>
            </div>
          ) : (
            <>
              <h2 className="font-orbitron font-bold text-2xl mb-6 text-electric-400">
                EVENT DETAILS
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h3 className="font-orbitron font-bold text-lg mb-2">DATE & TIME</h3>
                  <p className="text-gray-300">July 24, 2025</p>
                  <p className="text-gray-300">3:00 PM - 6:00 PM EST</p>
                </div>
                
                <div>
                  <h3 className="font-orbitron font-bold text-lg mb-2">FORMAT</h3>
                  <p className="text-gray-300">Live Interactive Session</p>
                  <p className="text-gray-300">3 Hours + Q&A</p>
                </div>
              </div>

              <div className="bg-navy-700/30 rounded-xl p-6 border border-electric-400/20">
                <h3 className="font-orbitron font-bold text-lg text-electric-400 mb-4">
                  IMPORTANT NOTES
                </h3>
                <ul className="text-gray-300 space-y-2">
                  <li>• You'll receive event access details via email 24 hours before the masterclass</li>
                  <li>• Save this information and add the event to your calendar</li>
                  <li>• The session will be recorded for lifetime access</li>
                  <li>• Bring your questions for the live Q&A session</li>
                </ul>
              </div>
            </>
          )}
        </div>

        {/* Add to Calendar (only for future events) */}
        {!isEventPassed && (
          <div className="bg-navy-800/30 backdrop-blur-sm rounded-2xl p-8 border border-primary-500/20 mb-8">
            <div className="flex items-center space-x-3 mb-6">
              <Calendar className="h-6 w-6 text-electric-400" />
              <h2 className="font-orbitron font-bold text-2xl text-electric-400">
                ADD TO CALENDAR
              </h2>
            </div>
            
            <p className="text-gray-300 mb-6">
              Don't miss the masterclass! Add it to your calendar now:
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {calendarLinks.map((calendar, index) => (
                <a
                  key={index}
                  href={calendar.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center space-x-3 px-6 py-4 bg-navy-700/50 rounded-lg hover:bg-navy-600/50 transition-colors duration-200 border border-gray-600 hover:border-electric-400/50"
                >
                  <span className="text-2xl">{calendar.icon}</span>
                  <span className="font-inter font-semibold">{calendar.name}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Contact Support */}
        <div className="text-center bg-navy-800/30 backdrop-blur-sm rounded-2xl p-8 border border-primary-500/20">
          <h3 className="font-orbitron font-bold text-xl mb-4 text-electric-400">
            QUESTIONS OR CONCERNS?
          </h3>
          <p className="text-gray-300 mb-6">
            We're here to help! If you have any questions about your {isEventPassed ? 'access' : 'registration'} or need support, 
            don't hesitate to reach out.
          </p>
          <a
            href="mailto:info@matchless-marketing.com"
            className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-electric-500 to-violet-500 rounded-lg font-orbitron font-bold tracking-wider hover:from-electric-400 hover:to-violet-400 transition-all duration-300 transform hover:scale-105"
          >
            CONTACT SUPPORT
          </a>
          <p className="text-sm text-gray-400 mt-4">
            info@matchless-marketing.com
          </p>
        </div>
      </div>
    </div>
  );
};