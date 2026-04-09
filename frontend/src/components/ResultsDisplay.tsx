import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Progress } from './ui/progress';
import { CheckCircle2, AlertCircle, Info, RefreshCcw } from 'lucide-react';
import { Button } from './ui/button';
import type { DiagnosisResult } from '../types/diagnosis';

interface ResultsDisplayProps {
  result: DiagnosisResult;
  onReset: () => void;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result, onReset }) => {
  const isHealthy = result.status === 'healthy';
  const isUnknown = result.crop === 'Unknown';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-4xl mx-auto space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Main Result Card */}
        <Card className="h-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Diagnosis Result</CardTitle>
              {isUnknown ? (
                <div className="flex items-center gap-1 text-amber-600 bg-amber-50 px-3 py-1 rounded-full text-sm font-bold">
                  <AlertCircle size={16} />
                  UNKNOWN
                </div>
              ) : isHealthy ? (
                <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-sm font-bold">
                  <CheckCircle2 size={16} />
                  HEALTHY
                </div>
              ) : (
                <div className="flex items-center gap-1 text-red-600 bg-red-50 px-3 py-1 rounded-full text-sm font-bold">
                  <AlertCircle size={16} />
                  DISEASED
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {!isUnknown && (
              <div>
                <p className="text-sm text-slate-500 mb-1">Detected Condition</p>
                <h4 className="text-2xl font-bold text-emerald-900 capitalize">
                  {result.crop}: {result.disease}
                </h4>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-slate-500">Confidence Score</p>
                <span className="text-sm font-bold text-emerald-700">{Math.round(result.confidence * 100)}%</span>
              </div>
              <Progress value={result.confidence * 100} className="h-3" />
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
              <div className="flex items-start gap-3">
                <Info className="text-emerald-600 shrink-0 mt-1" size={18} />
                <div className="w-full">
                  <h5 className="font-semibold text-emerald-900 text-sm mb-2">
                    {isUnknown ? 'Information' : 'Treatment Advice'}
                  </h5>
                  
                  {result.enhanced_treatment && result.enhanced_treatment.amharic && result.enhanced_treatment.amharic !== "የጀሚኒ ኤፒአይ ስህተት።" && result.enhanced_treatment.amharic !== "የጀሚኒ ኤፒአይ ቁልፍ አልተዘጋጀም።" ? (
                    <div className="space-y-2">
                      <div className="bg-white p-2 rounded border border-emerald-100">
                        <p className="text-xs font-semibold text-emerald-700">በአማርኛ</p>
                        <p className="text-sm text-slate-700 mt-1">{result.enhanced_treatment.amharic}</p>
                      </div>
                      
                      <div className="bg-white p-2 rounded border border-amber-100">
                        <p className="text-xs font-semibold text-amber-700">🌿 Traditional</p>
                        <p className="text-sm text-slate-700 mt-1">{result.enhanced_treatment.traditional}</p>
                      </div>
                      
                      <div className="bg-white p-2 rounded border border-green-100">
                        <p className="text-xs font-semibold text-green-700">♻️ Organic</p>
                        <p className="text-sm text-slate-700 mt-1">{result.enhanced_treatment.organic}</p>
                      </div>
                      
                      <div className="bg-white p-2 rounded border border-blue-100">
                        <p className="text-xs font-semibold text-blue-700">🛡️ Prevention</p>
                        <p className="text-sm text-slate-700 mt-1">{result.enhanced_treatment.prevention}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {result.treatment}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <Button onClick={onReset} variant="outline" className="w-full">
              <RefreshCcw className="mr-2 h-4 w-4" />
              New Diagnosis
            </Button>
          </CardContent>
        </Card>

        {/* Explainable AI / Heatmap Card */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Visual Explanation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
              {result.heatmap ? (
                <img 
                  src={result.heatmap} 
                  alt="Grad-CAM Heatmap" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-center p-8">
                  <div className="h-16 w-16 bg-slate-200 rounded-full animate-pulse mb-4" />
                  <p className="text-sm text-slate-500">Grad-CAM visualization would appear here highlighting the infected regions of the leaf.</p>
                </div>
              )}
              <div className="absolute bottom-4 right-4 bg-emerald-600/90 text-white text-[10px] px-2 py-1 rounded-md backdrop-blur-sm">
                XAI: Grad-CAM Visualization
              </div>
            </div>
            <p className="text-[12px] text-slate-500 mt-4 leading-snug">
              The heatmap highlights the areas of the leaf that the AI model focused on to make this prediction. 
              Warmer colors (red/orange) indicate the most significant regions.
            </p>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default ResultsDisplay;