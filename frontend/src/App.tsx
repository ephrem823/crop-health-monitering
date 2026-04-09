import React, { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import History from './components/History';
import ImageUpload from './components/ImageUpload';
import ResultsDisplay from './components/ResultsDisplay';
import { Toaster, toast } from 'sonner';
import { predictDisease } from './services/api';
import type { DiagnosisResult } from './types/diagnosis';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState<DiagnosisResult | null>(null);

  const handleImageSelect = async (file: File) => {
    setIsAnalyzing(true);
    setDiagnosisResult(null);

    try {
      const response = await predictDisease(file);

      // API returns "Potato_Late_Blight" — split into crop + disease
      const [crop, ...diseaseParts] = response.class.split('_');
      const disease = diseaseParts.join(' ');

      setDiagnosisResult({
        crop,
        disease,
        confidence: response.confidence,
        treatment: response.treatment,
        enhanced_treatment: response.enhanced_treatment,
        heatmap: response.heatmap,
        status: disease.toLowerCase() === 'healthy' ? 'healthy' : 'diseased',
      });

      toast.success('Analysis complete!');
      
      // Warn if confidence is low (might be unsupported crop)
      if (response.confidence < 0.5) {
        toast.warning('Low confidence detected. Please ensure you uploaded a Maize, Potato, or Tomato leaf image.');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Analysis failed';
      toast.error(message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setDiagnosisResult(null);
    setIsAnalyzing(false);
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'home':
        return <Hero onStart={() => setCurrentPage('diagnosis')} />;
      case 'diagnosis':
        return (
          <div className="container mx-auto px-4 py-20 min-h-[80vh]">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-emerald-900 mb-4">Crop Health Diagnosis</h2>
              <p className="text-slate-600">Upload a clear photo of your plant's leaf for instant AI analysis.</p>
            </div>
            {!diagnosisResult ? (
              <ImageUpload onImageSelect={handleImageSelect} isLoading={isAnalyzing} />
            ) : (
              <ResultsDisplay result={diagnosisResult} onReset={handleReset} />
            )}
          </div>
        );
      case 'about':
        return <About />;
      case 'history':
        return <History />;
      default:
        return <Hero onStart={() => setCurrentPage('diagnosis')} />;
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <Header
        currentPage={currentPage}
        onNavigate={(page) => {
          setCurrentPage(page);
          if (page === 'diagnosis') handleReset();
        }}
      />

      <main>{renderContent()}</main>

      <footer className="bg-emerald-900 text-white py-12 mt-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-emerald-900">
                  <span className="font-bold">E</span>
                </div>
                <span className="text-xl font-bold">EthioCrop Health</span>
              </div>
              <p className="text-emerald-100/70 text-sm leading-relaxed">
                Empowering smallholder farmers in Ethiopia with advanced AI technology for crop disease detection and management.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-6">Quick Links</h4>
              <ul className="space-y-4 text-emerald-100/70 text-sm">
                <li><button onClick={() => setCurrentPage('home')}>Home</button></li>
                <li><button onClick={() => setCurrentPage('diagnosis')}>Diagnosis</button></li>
                <li><button onClick={() => setCurrentPage('history')}>History</button></li>
                <li><button onClick={() => setCurrentPage('about')}>About Us</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6">Target Crops</h4>
              <ul className="space-y-4 text-emerald-100/70 text-sm">
                <li>Maize (Corn)</li>
                <li>Potato</li>
                <li>Tomato</li>
                <li>Ethiopian Highland Crops</li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-emerald-800 text-center text-xs text-emerald-100/40">
            &copy; {new Date().getFullYear()} Crop Health Monitoring System. All rights reserved.
          </div>
        </div>
      </footer>
      <Toaster position="top-center" />
    </div>
  );
};

export default App;
