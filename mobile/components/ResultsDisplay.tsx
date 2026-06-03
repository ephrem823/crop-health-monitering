import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import type { DiagnosisResult, EnhancedTreatment } from '@/types/diagnosis';

const hasValidEnhanced = (e?: EnhancedTreatment): e is EnhancedTreatment =>
  !!e?.english && !e.amharic?.includes('ስህተት') && !e.amharic?.includes('አልተዘጋጀም');

const TREATMENT_SECTIONS = [
  { key: 'english' as const, label: 'English', flag: '🇬🇧', bg: '#eff6ff', border: '#bfdbfe', color: '#1d4ed8' },
  { key: 'amharic' as const, label: 'አማርኛ', flag: '🇪🇹', bg: '#f0fdf4', border: '#bbf7d0', color: '#166534' },
  { key: 'oromoo' as const, label: 'Afaan Oromoo', flag: '🗣️', bg: '#fff7ed', border: '#fed7aa', color: '#9a3412' },
  { key: 'traditional' as const, label: 'Traditional Remedy', flag: '🌿', bg: '#fefce8', border: '#fde68a', color: '#854d0e' },
  { key: 'organic' as const, label: 'Organic Solution', flag: '♻️', bg: '#f0fdf4', border: '#86efac', color: '#14532d' },
  { key: 'prevention' as const, label: 'Prevention', flag: '🛡️', bg: '#f0f9ff', border: '#7dd3fc', color: '#075985' },
];

interface Props {
  result: DiagnosisResult;
  onReset: () => void;
}

export default function ResultsDisplay({ result, onReset }: Props) {
  const isHealthy = result.status === 'healthy';
  const isUnknown = result.status === 'unknown';
  const enhanced = hasValidEnhanced(result.enhanced_treatment) ? result.enhanced_treatment : null;
  const confidencePct = Math.round(result.confidence * 100);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

      {/* Status Banner */}
      <View style={[styles.banner, isUnknown ? styles.bannerUnknown : isHealthy ? styles.bannerHealthy : styles.bannerDiseased]}>
        <View style={styles.bannerIcon}>
          <Ionicons
            name={isUnknown ? 'help-circle' : isHealthy ? 'checkmark-circle' : 'alert-circle'}
            size={28}
            color={isUnknown ? Colors.warning : isHealthy ? Colors.primary : Colors.danger}
          />
        </View>
        <View style={styles.bannerText}>
          <Text style={[styles.bannerTitle, { color: isUnknown ? Colors.warning : isHealthy ? Colors.primary : Colors.danger }]}>
            {isUnknown ? 'Low Confidence' : isHealthy ? 'Plant is Healthy' : 'Disease Detected'}
          </Text>
          <Text style={styles.bannerSub}>
            {isUnknown
              ? 'Please retake with a clearer photo of a supported crop leaf'
              : isHealthy
              ? 'No signs of disease found. Continue regular care.'
              : 'Review the treatment advice below to act quickly'}
          </Text>
        </View>
      </View>

      {/* Detected Condition */}
      {!isUnknown && (
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Detected Condition</Text>
          <View style={styles.conditionRow}>
            <View style={styles.conditionLeft}>
              <Text style={styles.cropName}>{result.crop}</Text>
              <Text style={styles.diseaseName}>{result.disease || 'Healthy'}</Text>
            </View>
            <View style={[styles.conditionBadge, isHealthy ? styles.badgeHealthy : styles.badgeDiseased]}>
              <Ionicons name={isHealthy ? 'leaf' : 'bug'} size={18} color={isHealthy ? Colors.primary : Colors.danger} />
            </View>
          </View>
        </View>
      )}

      {/* Confidence */}
      <View style={styles.card}>
        <View style={styles.confHeader}>
          <Text style={styles.cardLabel}>AI Confidence</Text>
          <Text style={[styles.confPct, { color: confidencePct >= 75 ? Colors.primary : Colors.warning }]}>{confidencePct}%</Text>
        </View>
        <View style={styles.confTrack}>
          <View style={[styles.confFill, {
            width: `${confidencePct}%` as any,
            backgroundColor: confidencePct >= 75 ? Colors.primary : Colors.warning
          }]} />
        </View>
        <Text style={styles.confNote}>
          {confidencePct >= 90 ? 'Very high confidence — reliable result'
            : confidencePct >= 75 ? 'Good confidence — result is reliable'
            : 'Low confidence — consider retaking the photo'}
        </Text>
      </View>

      {/* Grad-CAM */}
      {result.heatmap && (
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Visual AI Explanation (Grad-CAM)</Text>
          <View style={styles.heatmapBox}>
            <Image source={{ uri: result.heatmap }} style={styles.heatmap} resizeMode="cover" />
            <View style={styles.heatmapTag}>
              <Text style={styles.heatmapTagText}>XAI · Grad-CAM</Text>
            </View>
          </View>
          <Text style={styles.heatmapNote}>
            Red and orange areas show where the AI focused most to make this diagnosis. This helps verify the result is based on the leaf, not the background.
          </Text>
        </View>
      )}

      {/* Treatment */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Expert Treatment Advice</Text>
        {enhanced ? (
          <View style={styles.treatmentList}>
            {TREATMENT_SECTIONS.map(({ key, label, flag, bg, border, color }) => (
              <View key={key} style={[styles.treatmentItem, { backgroundColor: bg, borderColor: border }]}>
                <View style={styles.treatmentHeader}>
                  <Text style={styles.treatmentFlag}>{flag}</Text>
                  <Text style={[styles.treatmentLabel, { color }]}>{label}</Text>
                </View>
                <Text style={styles.treatmentText}>{enhanced[key]}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.basicTreatment}>
            <Ionicons name="information-circle-outline" size={18} color={Colors.textMuted} />
            <Text style={styles.basicTreatmentText}>{result.treatment}</Text>
          </View>
        )}
      </View>

      {/* New Diagnosis Button */}
      <TouchableOpacity style={styles.resetBtn} onPress={onReset} activeOpacity={0.85}>
        <Ionicons name="camera-outline" size={20} color={Colors.surface} />
        <Text style={styles.resetBtnText}>Diagnose Another Crop</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, paddingBottom: 48, gap: 14 },

  banner: { borderRadius: 18, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14 },
  bannerHealthy: { backgroundColor: '#dcfce7' },
  bannerDiseased: { backgroundColor: '#fee2e2' },
  bannerUnknown: { backgroundColor: '#fef3c7' },
  bannerIcon: { },
  bannerText: { flex: 1 },
  bannerTitle: { fontSize: 17, fontWeight: '800', marginBottom: 3 },
  bannerSub: { fontSize: 13, color: Colors.textMuted, lineHeight: 18 },

  card: { backgroundColor: Colors.surface, borderRadius: 18, padding: 18, borderWidth: 1, borderColor: Colors.border, gap: 12 },
  cardLabel: { fontSize: 11, fontWeight: '700', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 },

  conditionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  conditionLeft: { gap: 3 },
  cropName: { fontSize: 26, fontWeight: '800', color: Colors.primaryDark },
  diseaseName: { fontSize: 16, color: Colors.text, textTransform: 'capitalize', fontWeight: '500' },
  conditionBadge: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  badgeHealthy: { backgroundColor: Colors.primaryLight },
  badgeDiseased: { backgroundColor: '#fee2e2' },

  confHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  confPct: { fontSize: 22, fontWeight: '800' },
  confTrack: { height: 10, backgroundColor: Colors.borderLight, borderRadius: 5, overflow: 'hidden' },
  confFill: { height: '100%', borderRadius: 5 },
  confNote: { fontSize: 12, color: Colors.textMuted },

  heatmapBox: { borderRadius: 14, overflow: 'hidden', height: 240 },
  heatmap: { width: '100%', height: '100%' },
  heatmapTag: { position: 'absolute', bottom: 10, right: 10, backgroundColor: 'rgba(20,83,45,0.85)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  heatmapTagText: { color: Colors.surface, fontSize: 10, fontWeight: '700' },
  heatmapNote: { fontSize: 12, color: Colors.textMuted, lineHeight: 18 },

  treatmentList: { gap: 10 },
  treatmentItem: { borderRadius: 12, borderWidth: 1, padding: 14, gap: 8 },
  treatmentHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  treatmentFlag: { fontSize: 16 },
  treatmentLabel: { fontWeight: '700', fontSize: 13 },
  treatmentText: { fontSize: 13, color: Colors.text, lineHeight: 20 },

  basicTreatment: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  basicTreatmentText: { flex: 1, fontSize: 14, color: Colors.textMuted, lineHeight: 22 },

  resetBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: Colors.primary, paddingVertical: 16, borderRadius: 16 },
  resetBtnText: { color: Colors.surface, fontWeight: '800', fontSize: 16 },
});
