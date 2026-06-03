import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

const HOW_IT_WORKS = [
  { icon: 'camera-outline', title: 'Photograph a Leaf', desc: 'Take or upload a clear photo of the affected crop leaf using your phone camera.' },
  { icon: 'hardware-chip-outline', title: 'AI Analysis', desc: 'Our deep learning model (EfficientNet-B0) analyzes the image across 50 known disease classes within seconds.' },
  { icon: 'document-text-outline', title: 'Get Expert Advice', desc: 'Receive a full treatment plan in your preferred language — English, Amharic, or Afaan Oromoo — including organic and traditional remedies.' },
  { icon: 'trending-up-outline', title: 'Track Over Time', desc: 'Save and review your diagnosis history. Export reports as PDF for record keeping or sharing with agricultural advisors.' },
];

const FAQ = [
  { q: 'How accurate is the diagnosis?', a: 'The AI model achieves over 90% accuracy on validated test data. For best results, use a clear, well-lit photo of a single leaf. Diagnoses below 75% confidence are automatically flagged as uncertain.' },
  { q: 'Does it work without internet?', a: 'An internet connection is required to communicate with the AI server and receive Gemini-powered multilingual treatment advice.' },
  { q: 'Which crops are supported?', a: 'The system supports 16 crop types including Coffee, Enset, Maize, Potato, Tomato, Apple, Grape, and more — covering 50 disease and healthy classes in total.' },
  { q: 'Is my data private?', a: 'Diagnosis data is stored locally on the server you connect to. No images are stored permanently. History records include only crop name, disease, confidence, and timestamp.' },
  { q: 'What languages are supported?', a: 'Treatment advice is provided in English, Amharic (አማርኛ), and Afaan Oromoo, making it accessible to farmers across Ethiopia.' },
];

export default function AboutScreen() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

      {/* Hero */}
      <View style={styles.hero}>
        <View style={styles.heroBadge}>
          <Ionicons name="leaf" size={13} color="#4ade80" />
          <Text style={styles.heroBadgeText}>Free · AI-Powered · Multilingual</Text>
        </View>
        <Text style={styles.heroTitle}>EthioCrop Health</Text>
        <Text style={styles.heroSub}>
          Early disease detection for Ethiopian smallholder farmers. Protect your harvest, protect your livelihood.
        </Text>
        <Text style={styles.heroLocal}>ለኢትዮጵያ አርሶ አደሮች · Qonnaan bultootaa Itoophiyaaf</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        {[
          { val: '50', lbl: 'Disease Classes' },
          { val: '16', lbl: 'Crop Types' },
          { val: '3', lbl: 'Languages' },
          { val: '90%+', lbl: 'Accuracy' },
        ].map((s) => (
          <View key={s.lbl} style={styles.statCard}>
            <Text style={styles.statVal}>{s.val}</Text>
            <Text style={styles.statLbl}>{s.lbl}</Text>
          </View>
        ))}
      </View>

      {/* About */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>ABOUT</Text>
        <Text style={styles.sectionTitle}>What is EthioCrop Health?</Text>
        <Text style={styles.body}>
          EthioCrop Health is a free mobile application that uses artificial intelligence to help farmers across Ethiopia identify crop diseases quickly and accurately — directly from a smartphone photo.
        </Text>
        <Text style={styles.body}>
          Agriculture is the backbone of Ethiopia's economy, yet crop disease remains one of the leading causes of yield loss for smallholder farmers. Early diagnosis can reduce losses by up to 50%. EthioCrop makes expert-level plant pathology accessible to every farmer, in their own language.
        </Text>
      </View>

      {/* How It Works */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>HOW IT WORKS</Text>
        <Text style={styles.sectionTitle}>Simple, fast, and accurate</Text>
        {HOW_IT_WORKS.map((item, i) => (
          <View key={item.title} style={styles.howRow}>
            <View style={styles.howLeft}>
              <View style={styles.howIconBox}>
                <Ionicons name={item.icon as any} size={20} color={Colors.primary} />
              </View>
              {i < HOW_IT_WORKS.length - 1 && <View style={styles.howLine} />}
            </View>
            <View style={styles.howContent}>
              <Text style={styles.howTitle}>{item.title}</Text>
              <Text style={styles.howDesc}>{item.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* FAQ */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>FAQ</Text>
        <Text style={styles.sectionTitle}>Common questions</Text>
        {FAQ.map((item, i) => (
          <TouchableOpacity
            key={item.q}
            style={[styles.faqItem, openFaq === i && styles.faqItemOpen]}
            onPress={() => setOpenFaq(openFaq === i ? null : i)}
            activeOpacity={0.8}
          >
            <View style={styles.faqHeader}>
              <Text style={styles.faqQ}>{item.q}</Text>
              <Ionicons name={openFaq === i ? 'chevron-up' : 'chevron-down'} size={18} color={Colors.textMuted} />
            </View>
            {openFaq === i && <Text style={styles.faqA}>{item.a}</Text>}
          </TouchableOpacity>
        ))}
      </View>

      {/* Disclaimer */}
      <View style={styles.disclaimer}>
        <Ionicons name="information-circle-outline" size={18} color={Colors.textMuted} />
        <Text style={styles.disclaimerText}>
          EthioCrop Health is intended for educational and informational purposes. For severe outbreaks, always consult a licensed agricultural extension officer or plant pathologist.
        </Text>
      </View>

    </ScrollView>
  );
}

import { useState } from 'react';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: 48 },

  hero: { backgroundColor: Colors.primaryDark, paddingHorizontal: 24, paddingTop: 40, paddingBottom: 36 },
  heroBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(74,222,128,0.15)', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, marginBottom: 16 },
  heroBadgeText: { color: '#4ade80', fontSize: 12, fontWeight: '600' },
  heroTitle: { fontSize: 32, fontWeight: '800', color: Colors.surface, marginBottom: 10 },
  heroSub: { fontSize: 15, color: 'rgba(255,255,255,0.75)', lineHeight: 24, marginBottom: 10 },
  heroLocal: { fontSize: 12, color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' },

  statsRow: { flexDirection: 'row', padding: 16, gap: 10 },
  statCard: { flex: 1, backgroundColor: Colors.surface, borderRadius: 14, padding: 14, alignItems: 'center', gap: 4, borderWidth: 1, borderColor: Colors.border },
  statVal: { fontSize: 20, fontWeight: '800', color: Colors.primary },
  statLbl: { fontSize: 10, color: Colors.textMuted, textAlign: 'center', fontWeight: '500' },

  section: { paddingHorizontal: 24, paddingVertical: 24, borderTopWidth: 1, borderTopColor: Colors.borderLight },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: Colors.primary, letterSpacing: 1.5, marginBottom: 4 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: Colors.text, marginBottom: 16 },
  body: { fontSize: 14, color: Colors.textMuted, lineHeight: 22, marginBottom: 12 },

  howRow: { flexDirection: 'row', gap: 14, marginBottom: 4 },
  howLeft: { alignItems: 'center', width: 44 },
  howIconBox: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  howLine: { width: 2, flex: 1, backgroundColor: Colors.primaryLight, marginVertical: 4, minHeight: 20 },
  howContent: { flex: 1, paddingBottom: 20 },
  howTitle: { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  howDesc: { fontSize: 13, color: Colors.textMuted, lineHeight: 20 },

  faqItem: { backgroundColor: Colors.surface, borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: Colors.border },
  faqItemOpen: { borderColor: Colors.primary },
  faqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  faqQ: { fontSize: 14, fontWeight: '600', color: Colors.text, flex: 1, paddingRight: 8 },
  faqA: { fontSize: 13, color: Colors.textMuted, lineHeight: 20, marginTop: 12 },

  disclaimer: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, margin: 20, backgroundColor: Colors.surface, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: Colors.border },
  disclaimerText: { flex: 1, fontSize: 12, color: Colors.textMuted, lineHeight: 18 },
});
