import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Building, FileCheck, ArrowRight } from 'lucide-react';

export default function MainPage() {
  const navigate = useNavigate();

  // Define a primary color for consistency
  const PRIMARY_COLOR = 'indigo'; // Classes will be like text-indigo-600, bg-indigo-600
 

  // Component for feature list item
  const FeatureItem = ({ text, subtext }) => (
    <div className="flex items-start gap-3">
      <div className={`w-2 h-2 rounded-full bg-${PRIMARY_COLOR}-600 mt-2.5 flex-shrink-0`}></div>
      <div>
        <p className="text-sm font-medium text-gray-800">{text}</p>
        <p className="text-xs text-gray-500 mt-0.5">{subtext}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen relative">
      
      {/* Full-Screen Background Container (Fixed to Viewport) */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center" 
        style={{ 
          backgroundImage: `url('/GBU.jpg')`, // Assumes GBU.jpg is in the public folder
          backgroundAttachment: 'fixed' // Ensures the image remains fixed while scrolling
        }} 
      >
        {/* Subtle Dark Overlay for better contrast */}
        <div className="absolute inset-0 bg-black/50"></div> 
      </div>
      
      {/* Main Content Area (Overlaying Background) */}
      <main className="relative z-10 pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            
            {/* Main Headline for the Portal */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-extrabold text-white leading-tight mb-3">
                <span className={`text-${PRIMARY_COLOR}-200`}>No Dues</span> Clearance Portal
              </h1>
              <p className="text-lg text-gray-100 max-w-3xl mx-auto mb-6">
                Welcome to the Gautam Buddha University's online system for managing student clearance and graduation formalities.
              </p>
              <div className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full bg-white/30 text-white backdrop-blur-md`}>
                <FileCheck className="w-5 h-5" />
                Secure | Digital | Efficient
              </div>
            </div>

            {/* Login cards */}
            <h2 className="text-3xl font-bold text-white text-center mb-10">Select Your Portal</h2>
            <div className="grid md:grid-cols-2 gap-8">
              
              {/* Student Portal Card */}
              <div 
                className={`bg-white/85 rounded-3xl shadow-2xl border border-gray-100 transition-all duration-300 hover:shadow-3xl hover:scale-[1.01] cursor-pointer group backdrop-blur-xl`}
              >
                <div className={`p-8`}>
                  <div className={`p-4 w-fit rounded-xl mb-4 bg-${PRIMARY_COLOR}-50`}>
                    <User className={`w-8 h-8 text-${PRIMARY_COLOR}-600`} />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Student Portal</h3>
                  <p className="text-base text-gray-500 mb-6">Access your clearance application and status.</p>

                  <div className="space-y-4 mb-8 pt-4 border-t border-gray-100">
                    <FeatureItem 
                      text="Track Clearance Status" 
                      subtext="Monitor your progress across all departments in real-time."
                    />
                    <FeatureItem 
                      text="Submit Documents Easily" 
                      subtext="Upload all required documentation securely from one place."
                    />
                    <FeatureItem 
                      text="Download Certificate" 
                      subtext="Get your final No-Dues certificate once full clearance is approved."
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                <button 
  className="flex-1 px-6 py-3 rounded-3xl border border-gray-300 bg-white text-black text-base font-semibold hover:bg-gray-100 transition-colors"
  onClick={() => navigate('/student/login')}
>
  Student Login
</button>

                    <button 
                      className={`flex-1 px-6 py-3 rounded-3xl bg-${PRIMARY_COLOR}-600 text-white text-base font-semibold hover:bg-${PRIMARY_COLOR}-700 transition-colors flex items-center justify-center`}
                      onClick={() => navigate('/student/register')}
                    >
                      Register <ArrowRight className="w-4 h-4 ml-2" />
                    </button>
                  </div>
                </div>
              </div>

              {/* System Portal Card */}
              <div 
                className={`bg-white/85 rounded-3xl shadow-2xl border border-gray-100 transition-all duration-300 hover:shadow-3xl hover:scale-[1.01] cursor-pointer group backdrop-blur-xl`}
              >
                <div className="p-8">
                  <div className={`p-4 w-fit rounded-xl mb-4 bg-green-50`}>
                    <Building className="w-8 h-8 text-green-600" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Staff & System Portal</h3>
                  <p className="text-base text-gray-500 mb-6">For department officials and administrators.</p>

                  <div className="space-y-4 mb-8 pt-4 border-t border-gray-100">
                    <FeatureItem 
                      text="Process Clearance Requests" 
                      subtext="Efficiently review, approve, or reject student clearance requests."
                    />
                    <FeatureItem 
                      text="Department Queue Management" 
                      subtext="View and manage the queue specific to your respective department."
                    />
                    <FeatureItem 
                      text="Comprehensive Reporting" 
                      subtext="Access detailed reports and system analytics for auditing."
                    />
                  </div>

                  <button 
                    className={`w-full px-6 py-3 rounded-3xl bg-green-600 text-white text-base font-semibold hover:bg-green-700 transition-colors flex items-center justify-center`}
                    onClick={() => navigate('/login')}
                  >
                    System Login <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                </div>
              </div>
            </div>

            {/* Footer information */}
            <div className="mt-20 text-center">
              <div className={`inline-flex items-center gap-2 px-6 py-4 bg-white/50  rounded-xl backdrop-blur-xl`}> {/* Changed bg-white/85 to bg-white/70 for slightly more transparency */}
                <div className={`w-2 h-2 rounded-full bg-${PRIMARY_COLOR}-600`}></div>
                <p className="text-base text-gray-700">
                  Need assistance? Contact the administration office or email <span className={`font-semibold text-${PRIMARY_COLOR}-600`}>support@gbu.ac.in</span> for technical support.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}