import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Zap, Activity, Database } from 'lucide-react';
import { Button } from './ui/button';
import { getHistory } from '../services/api';

interface HeroProps {
  onStart: () => void;
}

const Hero: React.FC<HeroProps> = ({ onStart }) => {
  const [dbCount, setDbCount] = useState<number | null>(null);

  useEffect(() => {
    getHistory(1000).then(data => {
      setDbCount(data.history?.length || 0);
    }).catch(() => setDbCount(0));
  }, []);

  return (
    <div className="relative overflow-hidden bg-white pt-16 pb-24 lg:pt-32 lg:pb-40">
      {/* Database Info Badge */}
      {dbCount !== null && (
        <div className="absolute top-4 right-4 z-20">
          <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-md border border-emerald-200">
            <Database className="h-4 w-4 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-900">{dbCount} diagnoses</span>
          </div>
        </div>
      )}

      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-emerald-50/50" />
        <img 
          src="https://storage.googleapis.com/dala-prod-public-storage/generated-images/d3d4fd6e-4ec2-495c-9352-1553c53ec539/hero-background-6398dbb4-1773666022292.webp" 
          alt="Ethiopian Farm" 
          className="h-full w-full object-cover opacity-20"
        />
      </div>

      <div className="container relative z-10 mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20 mb-6">
              Empowering Ethiopian Farmers
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight text-emerald-900 sm:text-6xl mb-6">
              AI-Powered Crop Health <span className="text-emerald-600">Diagnosis</span>
            </h1>
            <p className="text-lg leading-8 text-slate-600 mb-10 max-w-2xl mx-auto">
              Early detection is the key to food security. Use our advanced AI technology to identify diseases in Maize, Potato, and Tomato crops within seconds.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" onClick={onStart} className="w-full sm:w-auto text-lg h-14 px-10">
                Start Diagnosis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg h-14 px-10">
                Learn More
              </Button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-3"
          >
            <div className="flex flex-col items-center gap-2 p-6 rounded-2xl bg-white shadow-sm border border-emerald-50">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <Zap size={24} />
              </div>
              <h3 className="font-bold text-emerald-900">Instant Results</h3>
              <p className="text-sm text-slate-500 text-center">Get diagnosis in under 5 seconds with our EfficientNet-B0 model.</p>
            </div>
            <div className="flex flex-col items-center gap-2 p-6 rounded-2xl bg-white shadow-sm border border-emerald-50">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <ShieldCheck size={24} />
              </div>
              <h3 className="font-bold text-emerald-900">Explainable AI</h3>
              <p className="text-sm text-slate-500 text-center">Our Grad-CAM heatmaps help you understand exactly what the AI sees.</p>
            </div>
            <div className="flex flex-col items-center gap-2 p-6 rounded-2xl bg-white shadow-sm border border-emerald-50">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <Activity size={24} />
              </div>
              <h3 className="font-bold text-emerald-900">Expert Advice</h3>
              <p className="text-sm text-slate-500 text-center">Receive tailored treatment suggestions based on the specific disease.</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Hero;