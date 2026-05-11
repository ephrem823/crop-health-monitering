import React, { useEffect, useState } from 'react';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { FileDown } from 'lucide-react';
import { getHistory, searchHistory, clearHistory } from '../services/api';
import { Button } from './ui/button';

interface HistoryItem {
  id: number;
  crop_name: string;
  disease_name: string;
  confidence: number;
  timestamp: string;
}

// PDF Styles
const pdfStyles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottom: '2pt solid #059669',
    paddingBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#059669',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 9,
    color: '#64748b',
  },
  section: {
    marginTop: 15,
    marginBottom: 15,
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 4,
    borderLeft: '3pt solid #059669',
  },
  diseaseTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  label: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#475569',
    width: 100,
  },
  value: {
    fontSize: 10,
    color: '#1e293b',
    flex: 1,
  },
  adviceSection: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#ffffff',
    borderRadius: 4,
  },
  adviceTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#059669',
    marginBottom: 6,
  },
  adviceText: {
    fontSize: 9,
    color: '#334155',
    lineHeight: 1.5,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#94a3b8',
    borderTop: '1pt solid #e2e8f0',
    paddingTop: 10,
  },
});

// Treatment advice mapping
const TREATMENT_ADVICE: { [key: string]: string } = {
  "Coffee___Leaf rust": "Apply copper fungicides. Prune for airflow. Critical for Ethiopian coffee.",
  "Enset___Bacterial-Wilt": "Remove infected plants immediately. Disinfect tools. Plant disease-free suckers.",
  "Maize___Blight": "Apply fungicide. Remove infected plants. Rotate with legumes.",
  "Maize___Common_Rust": "Apply azoxystrobin. Use resistant varieties. Traditional: neem spray.",
  "Maize___Gray_Leaf_Spot": "Use fungicide. Rotate with teff or pulses. Remove infected leaves.",
  "Potato___Early_blight": "Spray mancozeb every 7-10 days. Avoid overhead watering. Use wood ash.",
  "Potato___Late_blight": "Apply chlorothalonil immediately. Rotate crops. Spreads fast in highlands.",
  "Tomato___Bacterial_spot": "Use certified seeds. Avoid overhead watering. Apply copper.",
  "Tomato___Early_blight": "Remove infected leaves. Spray chlorothalonil. Plant basil nearby.",
  "Tomato___Late_blight": "Spray metalaxyl. Improve airflow. Common in Bale, Arsi.",
  "Tomato___Leaf_Mold": "Improve ventilation. Spray copper. Reduce humidity.",
  "Tomato___Septoria_leaf_spot": "Remove infected leaves. Spray mancozeb. Mulch with dry grass.",
};

// PDF Document Component
interface DiagnosisPDFProps {
  history: HistoryItem[];
}

const DiagnosisPDF: React.FC<DiagnosisPDFProps> = ({ history }) => {
  // Filter only diseased crops (not healthy)
  const diseasedCrops = history.filter(item => 
    !item.disease_name.toLowerCase().includes('healthy')
  );

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        {/* Header */}
        <View style={pdfStyles.header}>
          <Text style={pdfStyles.title}>Crop Disease Diagnosis Report</Text>
          <Text style={pdfStyles.subtitle}>
            Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
          </Text>
          <Text style={pdfStyles.subtitle}>
            Total Diseases Detected: {diseasedCrops.length}
          </Text>
        </View>

        {/* Disease Entries */}
        {diseasedCrops.map((item, index) => {
          const fullKey = `${item.crop_name}___${item.disease_name}`;
          const advice = TREATMENT_ADVICE[fullKey] || "Consult a local agricultural expert for treatment advice.";
          
          return (
            <View key={item.id} style={pdfStyles.section}>
              <Text style={pdfStyles.diseaseTitle}>
                {index + 1}. {item.crop_name} - {item.disease_name.replace(/_/g, ' ')}
              </Text>
              
              <View style={pdfStyles.infoRow}>
                <Text style={pdfStyles.label}>Confidence:</Text>
                <Text style={pdfStyles.value}>{(item.confidence * 100).toFixed(1)}%</Text>
              </View>
              
              <View style={pdfStyles.infoRow}>
                <Text style={pdfStyles.label}>Detected:</Text>
                <Text style={pdfStyles.value}>
                  {new Date(item.timestamp).toLocaleString()}
                </Text>
              </View>

              <View style={pdfStyles.adviceSection}>
                <Text style={pdfStyles.adviceTitle}>Treatment Advice:</Text>
                <Text style={pdfStyles.adviceText}>{advice}</Text>
              </View>
            </View>
          );
        })}

        {diseasedCrops.length === 0 && (
          <View style={pdfStyles.section}>
            <Text style={pdfStyles.adviceText}>
              No diseases detected in the diagnosis history. All crops appear healthy.
            </Text>
          </View>
        )}

        {/* Footer */}
        <Text style={pdfStyles.footer}>
          EthioCrop Health Monitoring System - Empowering Ethiopian Farmers
        </Text>
      </Page>
    </Document>
  );
};

// Main Component
export default function History() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await getHistory();
      setHistory(data.history);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      loadHistory();
      return;
    }
    
    setLoading(true);
    try {
      const data = await searchHistory(searchQuery);
      setHistory(data.results);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to delete all diagnosis history? This cannot be undone.')) {
      return;
    }
    
    setLoading(true);
    try {
      await clearHistory();
      setHistory([]);
      setSearchQuery('');
    } catch (error) {
      console.error('Failed to clear history:', error);
      alert('Failed to clear history');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Diagnosis History</h1>
        
        {/* Print to PDF Button */}
        {history.length > 0 && (
          <PDFDownloadLink
            document={<DiagnosisPDF history={history} />}
            fileName={`diagnosis-report-${new Date().toISOString().split('T')[0]}.pdf`}
          >
            {({ loading }) => (
              <Button disabled={loading} className="flex items-center gap-2">
                <FileDown className="h-4 w-4" />
                {loading ? 'Generating PDF...' : 'Export to PDF'}
              </Button>
            )}
          </PDFDownloadLink>
        )}
      </div>
      
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by crop or disease name..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Search
          </button>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              loadHistory();
            }}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={handleClearAll}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Clear All
          </button>
        </div>
      </form>

      {/* History Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600">Loading history...</p>
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No diagnosis history found.</p>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Crop
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Disease
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Confidence
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {history.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(item.timestamp)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {item.crop_name}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.disease_name.replace(/_/g, ' ')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {(item.confidence * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
