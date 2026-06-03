import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { predictDisease } from '@/services/api';
import type { DiagnosisResult } from '@/types/diagnosis';
import ResultsDisplay from '@/components/ResultsDisplay';

export default function DiagnosisScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiagnosisResult | null>(null);

  const pickImage = async (useCamera: boolean) => {
    const permission = useCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Permission Required', `Please allow ${useCamera ? 'camera' : 'photo library'} access in your device settings.`);
      return;
    }

    const picked = useCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.85, mediaTypes: ImagePicker.MediaTypeOptions.Images })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.85, mediaTypes: ImagePicker.MediaTypeOptions.Images });

    if (!picked.canceled && picked.assets[0]) {
      const uri = picked.assets[0].uri;
      setImageUri(uri);
      setResult(null);
      await analyze(uri);
    }
  };

  const analyze = async (uri: string) => {
    setLoading(true);
    try {
      const response = await predictDisease(uri);
      const sep = response.class.includes('___') ? '___' : '_';
      const parts = response.class.split(sep);
      const crop = parts[0];
      const disease = parts.slice(1).join(' ').replace(/_/g, ' ').trim();
      const isHealthy = disease.toLowerCase().includes('healthy') || response.class.toLowerCase().includes('healthy');
      const isUnknown = response.class === 'Unknown';
      setResult({
        crop, disease,
        confidence: response.confidence,
        treatment: response.treatment,
        enhanced_treatment: response.enhanced_treatment,
        heatmap: response.heatmap,
        status: isUnknown ? 'unknown' : isHealthy ? 'healthy' : 'diseased',
      });
    } catch (err: any) {
      Alert.alert('Connection Failed', 'Could not reach the server.\n\nMake sure:\n• Backend server is running\n• Your phone and computer are on the same WiFi', [{ text: 'OK' }]);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setImageUri(null); setResult(null); };

  if (result) return <ResultsDisplay result={result} onReset={reset} />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Crop Diagnosis</Text>
        <Text style={styles.headerSub}>Upload or take a photo of a leaf to detect disease instantly</Text>
      </View>

      {/* Image Preview / Upload Area */}
      {imageUri ? (
        <View style={styles.previewBox}>
          <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="cover" />
          {loading && (
            <View style={styles.loadingOverlay}>
              <View style={styles.loadingCard}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.loadingTitle}>Analyzing your crop...</Text>
                <Text style={styles.loadingSubText}>AI is detecting disease patterns</Text>
                <Text style={styles.loadingSubText}>Getting expert treatment advice</Text>
              </View>
            </View>
          )}
          {!loading && (
            <TouchableOpacity style={styles.clearOverlay} onPress={reset}>
              <Ionicons name="close-circle" size={32} color="white" />
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <TouchableOpacity style={styles.uploadArea} onPress={() => pickImage(false)} activeOpacity={0.8}>
          <View style={styles.uploadIcon}>
            <Ionicons name="cloud-upload-outline" size={40} color={Colors.primary} />
          </View>
          <Text style={styles.uploadTitle}>Upload Leaf Photo</Text>
          <Text style={styles.uploadSub}>Tap to choose from your gallery</Text>
          <Text style={styles.uploadHint}>JPG or PNG · Max 10MB</Text>
        </TouchableOpacity>
      )}

      {/* Action Buttons */}
      {!loading && (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.cameraBtn} onPress={() => pickImage(true)} activeOpacity={0.85}>
            <Ionicons name="camera" size={22} color={Colors.surface} />
            <Text style={styles.cameraBtnText}>Take Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.galleryBtn} onPress={() => pickImage(false)} activeOpacity={0.85}>
            <Ionicons name="images-outline" size={22} color={Colors.primary} />
            <Text style={styles.galleryBtnText}>Gallery</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Tips */}
      <View style={styles.tipsBox}>
        <View style={styles.tipsHeader}>
          <Ionicons name="bulb-outline" size={18} color={Colors.warning} />
          <Text style={styles.tipsTitle}>Tips for accurate results</Text>
        </View>
        {[
          'Use bright natural daylight — avoid harsh shadows',
          'Fill the frame with a single, clearly visible leaf',
          'Keep the camera steady to avoid blurry images',
          'Capture both healthy and affected parts of the leaf',
        ].map((tip) => (
          <View key={tip} style={styles.tipRow}>
            <View style={styles.tipDot} />
            <Text style={styles.tipText}>{tip}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const { surface } = Colors;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: 48 },

  header: { paddingHorizontal: 24, paddingTop: 28, paddingBottom: 20, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle: { fontSize: 26, fontWeight: '800', color: Colors.text, marginBottom: 4 },
  headerSub: { fontSize: 14, color: Colors.textMuted, lineHeight: 20 },

  uploadArea: { margin: 20, borderRadius: 20, borderWidth: 2, borderColor: Colors.primaryLight, borderStyle: 'dashed', backgroundColor: Colors.surface, paddingVertical: 48, alignItems: 'center', gap: 8 },
  uploadIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  uploadTitle: { fontSize: 18, fontWeight: '700', color: Colors.text },
  uploadSub: { fontSize: 14, color: Colors.textMuted },
  uploadHint: { fontSize: 12, color: Colors.textLight, marginTop: 4 },

  previewBox: { margin: 20, borderRadius: 20, overflow: 'hidden', height: 280, backgroundColor: Colors.border },
  preview: { width: '100%', height: '100%' },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center' },
  loadingCard: { backgroundColor: Colors.surface, borderRadius: 20, padding: 28, alignItems: 'center', gap: 10, width: '75%' },
  loadingTitle: { fontWeight: '700', color: Colors.text, fontSize: 16 },
  loadingSubText: { color: Colors.textMuted, fontSize: 12 },
  clearOverlay: { position: 'absolute', top: 12, right: 12 },

  actions: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, marginBottom: 20 },
  cameraBtn: { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: Colors.primary, paddingVertical: 16, borderRadius: 14 },
  cameraBtnText: { color: Colors.surface, fontWeight: '700', fontSize: 16 },
  galleryBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.surface, paddingVertical: 16, borderRadius: 14, borderWidth: 1.5, borderColor: Colors.primary },
  galleryBtnText: { color: Colors.primary, fontWeight: '700', fontSize: 15 },

  tipsBox: { marginHorizontal: 20, backgroundColor: Colors.surface, borderRadius: 16, padding: 18, gap: 12, borderWidth: 1, borderColor: Colors.border },
  tipsHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tipsTitle: { fontWeight: '700', color: Colors.text, fontSize: 15 },
  tipRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  tipDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary, marginTop: 6 },
  tipText: { color: Colors.textMuted, fontSize: 13, flex: 1, lineHeight: 20 },
});
