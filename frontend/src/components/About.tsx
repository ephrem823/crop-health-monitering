import React from 'react';
import { Card, CardContent } from './ui/card';
import { Leaf, Users, ShieldCheck, Microscope } from 'lucide-react';

const About: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-20">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-emerald-900 sm:text-4xl mb-4">About EthioCrop Health</h2>
          <div className="h-1.5 w-24 bg-emerald-600 mx-auto rounded-full" />
          <p className="text-lg text-slate-600 mt-6">
            We are dedicated to revolutionizing Ethiopian agriculture through cutting edge Artificial Intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-emerald-900">Our Mission</h3>
            <p className="text-slate-600 leading-relaxed">
              In Ethiopia, agriculture is the backbone of the economy, but diseases can devastate yields and livelihoods. Our project aims to provide smallholder farmers with a free, easy-to-use tool for instant disease diagnosis.
            </p>
            <p className="text-slate-600 leading-relaxed">
              By leveraging the EfficientNet-B0 architecture and Explainable AI (XAI), we build trust and transparency in digital solutions.
            </p>
            
            
            
          </div>

          <div className="relative">
            <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl">
              <img 
                src="https://storage.googleapis.com/dala-prod-public-storage/generated-images/d3d4fd6e-4ec2-495c-9352-1553c53ec539/hero-background-6398dbb4-1773666022292.webp" 
                alt="Agricultural Innovation" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute left-1/1000000 -translate-x-2/1 bottom-[-20px] bg-white p-10 rounded-4xl shadow-xl border border-emerald-50 max-w-[220px]">
              <Microscope className="text-emerald-600 mb-2" size={28} />
              <p className="text-xs text-slate-600 font-medium">Powered by Deep Learning & Grad-CAM Visualization</p>
            </div>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="h-10 w-10 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 mb-4">
                <Leaf size={20} />
              </div>
              <h4 className="font-bold text-emerald-900 mb-2">Maize</h4>
              <p className="text-sm text-slate-500 leading-snug">Detection of Gray Leaf Spot, Common Rust, and Northern Leaf Blight.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="h-10 w-10 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 mb-4">
                <Leaf size={20} />
              </div>
              <h4 className="font-bold text-emerald-900 mb-2">Potato</h4>
              <p className="text-sm text-slate-500 leading-snug">Identification of Early Blight and Late Blight (Phytophthora infestans).</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="h-10 w-10 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 mb-4">
                <Leaf size={20} />
              </div>
              <h4 className="font-bold text-emerald-900 mb-2">Tomato</h4>
              <p className="text-sm text-slate-500 leading-snug">Targeting Bacterial Spot, Late Blight, and Septoria Leaf Spot.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="h-10 w-10 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 mb-4">
                <Leaf size={20} />
              </div>
              <h4 className="font-bold text-emerald-900 mb-2">And other morethan 20 crops </h4>
              <p className="text-sm text-slate-500 leading-snug">Are incuded in this application</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default About;