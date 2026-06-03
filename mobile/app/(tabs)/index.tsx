import { useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Dimensions, Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

const { width } = Dimensions.get('window');

const FEATURES = [
  { icon: 'scan-outline', label: 'Instant Diagnosis', desc: 'Detect 50 diseases in seconds' },
  { icon: 'language-outline', label: 'Multilingual', desc: 'English, Amharic & Oromoo' },
  { icon: 'eye-outline', label: 'Visual AI', desc: 'Grad-CAM heatmap explanation' },
  { icon: 'shield-checkmark-outline', label: 'Expert Advice', desc: 'Organic, traditional & chemical' },
];

const CROPS = [
  { name: 'Coffee', emoji: '☕' }, { name: 'Enset', emoji: '🌱' },
  { name: 'Maize', emoji: '🌽' }, { name: 'Potato', emoji: '🥔' },
  { name: 'Tomato', emoji: '🍅' }, { name: 'Apple', emoji: '🍎' },
  { name: 'Grape', emoji: '🍇' }, { name: 'Pepper', emoji: '🫑' },
  { name: 'Peach', emoji: '🍑' }, { name: 'Orange', emoji: '🍊' },
  { name: 'Strawberry', emoji: '🍓' }, { name: 'Corn', emoji: '🌾' },
];

const STATS = [
  { val: '50', lbl: 'Diseases' },
  { val: '16', lbl: 'Crops' },
  { val: '3', lbl: 'Languages' },
  { val: '90%+', lbl: 'Accuracy' },
];

// Animated fade+slide component
function FadeInView({ children, delay = 0, fromY = 30 }: { children: React.ReactNode; delay?: number; fromY?: number }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(fromY)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 600, delay, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, delay, useNativeDriver: true, tension: 60, friction: 10 }),
    ]).start();
  }, []);

  return <Animated.View style={{ opacity, transform: [{ translateY }] }}>{children}</Animated.View>;
}

// Pulsing dot for hero decoration
function PulsingDot({ size = 8, color = 'rgba(255,255,255,0.3)', delay = 0 }: { size?: number; color?: string; delay?: number }) {
  const scale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.6, duration: 900, delay, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <Animated.View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color, transform: [{ scale }] }} />
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const btnScale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => Animated.spring(btnScale, { toValue: 0.96, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(btnScale, { toValue: 1, useNativeDriver: true }).start();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

      {/* ── HERO ── */}
      <View style={styles.hero}>
        {/* Decorative blobs */}
        <View style={styles.blob1} />
        <View style={styles.blob2} />

        <FadeInView delay={0}>
          <View style={styles.heroBadge}>
            <PulsingDot size={7} color="#4ade80" />
            <Text style={styles.heroBadgeText}>AI · Free · Multilingual</Text>
          </View>
        </FadeInView>

        <FadeInView delay={120}>
          <Text style={styles.heroTitle}>Protect Your{'\n'}Crops Early</Text>
        </FadeInView>

        <FadeInView delay={240}>
          <Text style={styles.heroSub}>
            Point your camera at any leaf — our AI identifies the disease and gives expert treatment advice in your language.
          </Text>
        </FadeInView>

        <FadeInView delay={320}>
          <Text style={styles.heroLocal}>ለኢትዮጵያ አርሶ አደሮች · Qonnaan bultootaa Itoophiyaaf</Text>
        </FadeInView>

        {/* Stats strip */}
        <FadeInView delay={400}>
          <View style={styles.statsStrip}>
            {STATS.map((s, i) => (
              <View key={s.lbl} style={[styles.statItem, i < STATS.length - 1 && styles.statBorder]}>
                <Text style={styles.statVal}>{s.val}</Text>
                <Text style={styles.statLbl}>{s.lbl}</Text>
              </View>
            ))}
          </View>
        </FadeInView>

        {/* CTA Button */}
        <FadeInView delay={500}>
          <Animated.View style={{ transform: [{ scale: btnScale }] }}>
            <TouchableOpacity
              style={styles.ctaBtn}
              onPress={() => router.push('/(tabs)/diagnosis')}
              onPressIn={onPressIn}
              onPressOut={onPressOut}
              activeOpacity={1}
            >
              <View style={styles.ctaBtnInner}>
                <Ionicons name="camera" size={20} color={Colors.primaryDark} />
                <Text style={styles.ctaBtnText}>Diagnose a Crop Now</Text>
              </View>
              <View style={styles.ctaBtnArrow}>
                <Ionicons name="arrow-forward" size={18} color={Colors.primaryDark} />
              </View>
            </TouchableOpacity>
          </Animated.View>
        </FadeInView>

        {/* Dots decoration */}
        <View style={styles.dots}>
          <PulsingDot delay={0} />
          <PulsingDot delay={300} />
          <PulsingDot delay={600} />
        </View>
      </View>

      {/* ── HOW IT WORKS ── */}
      <FadeInView delay={200} fromY={20}>
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionLabel}>HOW IT WORKS</Text>
            <Text style={styles.sectionTitle}>Three simple steps</Text>
          </View>
          <View style={styles.stepsRow}>
            {[
              { n: '1', icon: 'camera-outline', title: 'Photograph', desc: 'Take a clear leaf photo' },
              { n: '2', icon: 'hardware-chip-outline', title: 'AI Scans', desc: 'Detects the disease' },
              { n: '3', icon: 'document-text-outline', title: 'Get Advice', desc: 'Full treatment plan' },
            ].map((s, i) => (
              <View key={s.n} style={styles.stepWrap}>
                <View style={styles.stepCard}>
                  <View style={styles.stepIconBox}>
                    <Ionicons name={s.icon as any} size={22} color={Colors.primary} />
                  </View>
                  <Text style={styles.stepTitle}>{s.title}</Text>
                  <Text style={styles.stepDesc}>{s.desc}</Text>
                </View>
                {i < 2 && <View style={styles.stepArrow}><Ionicons name="chevron-forward" size={16} color={Colors.textLight} /></View>}
              </View>
            ))}
          </View>
        </View>
      </FadeInView>

      {/* ── FEATURES ── */}
      <FadeInView delay={250} fromY={20}>
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionLabel}>FEATURES</Text>
            <Text style={styles.sectionTitle}>Built for Ethiopian farmers</Text>
          </View>
          <View style={styles.featureGrid}>
            {FEATURES.map((f) => (
              <View key={f.label} style={styles.featureCard}>
                <View style={styles.featureIconBox}>
                  <Ionicons name={f.icon as any} size={24} color={Colors.primary} />
                </View>
                <Text style={styles.featureLabel}>{f.label}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
            ))}
          </View>
        </View>
      </FadeInView>

      {/* ── SUPPORTED CROPS ── */}
      <FadeInView delay={300} fromY={20}>
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionLabel}>SUPPORTED CROPS</Text>
            <Text style={styles.sectionTitle}>50 disease classes</Text>
          </View>
          <View style={styles.cropGrid}>
            {CROPS.map((c) => (
              <View key={c.name} style={styles.cropCard}>
                <Text style={styles.cropEmoji}>{c.emoji}</Text>
                <Text style={styles.cropName}>{c.name}</Text>
              </View>
            ))}
          </View>
        </View>
      </FadeInView>

      {/* ── BOTTOM CTA ── */}
      <FadeInView delay={350} fromY={20}>
        <View style={styles.bottomCta}>
          <View style={styles.bottomCtaBlob} />
          <Text style={styles.bottomCtaTitle}>Ready to protect{'\n'}your harvest?</Text>
          <Text style={styles.bottomCtaSub}>Early detection can save up to 50% of your yield.</Text>
          <TouchableOpacity
            style={styles.bottomCtaBtn}
            onPress={() => router.push('/(tabs)/diagnosis')}
            activeOpacity={0.85}
          >
            <Ionicons name="leaf-outline" size={18} color={Colors.primaryDark} />
            <Text style={styles.bottomCtaBtnText}>Start Free Diagnosis</Text>
          </TouchableOpacity>
        </View>
      </FadeInView>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0fdf4' },
  content: { paddingBottom: 40 },

  // Hero
  hero: {
    backgroundColor: Colors.primaryDark,
    paddingHorizontal: 24,
    paddingTop: 52,
    paddingBottom: 40,
    overflow: 'hidden',
  },
  blob1: {
    position: 'absolute', width: 220, height: 220, borderRadius: 110,
    backgroundColor: 'rgba(74,222,128,0.07)', top: -60, right: -60,
  },
  blob2: {
    position: 'absolute', width: 160, height: 160, borderRadius: 80,
    backgroundColor: 'rgba(74,222,128,0.05)', bottom: 20, left: -40,
  },
  heroBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    backgroundColor: 'rgba(74,222,128,0.12)', alignSelf: 'flex-start',
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 24, marginBottom: 22,
  },
  heroBadgeText: { color: '#4ade80', fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  heroTitle: {
    fontSize: 40, fontWeight: '900', color: '#ffffff',
    lineHeight: 48, marginBottom: 16, letterSpacing: -0.5,
  },
  heroSub: {
    fontSize: 15, color: 'rgba(255,255,255,0.72)',
    lineHeight: 24, marginBottom: 10,
  },
  heroLocal: {
    fontSize: 12, color: 'rgba(255,255,255,0.38)',
    fontStyle: 'italic', marginBottom: 28,
  },
  statsStrip: {
    flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 16, overflow: 'hidden', marginBottom: 24,
  },
  statItem: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  statBorder: { borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,0.1)' },
  statVal: { fontSize: 20, fontWeight: '800', color: '#4ade80' },
  statLbl: { fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 2, fontWeight: '500' },
  ctaBtn: {
    backgroundColor: '#4ade80', borderRadius: 16,
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingLeft: 20, paddingRight: 10, paddingVertical: 16,
    shadowColor: '#4ade80', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 16, elevation: 8,
  },
  ctaBtnInner: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  ctaBtnText: { color: Colors.primaryDark, fontWeight: '900', fontSize: 16 },
  ctaBtnArrow: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: 'rgba(20,83,45,0.15)', alignItems: 'center', justifyContent: 'center',
  },
  dots: { flexDirection: 'row', gap: 6, marginTop: 20, justifyContent: 'flex-end' },

  // Sections
  section: { paddingHorizontal: 20, paddingVertical: 28 },
  sectionHead: { marginBottom: 18 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: Colors.primary, letterSpacing: 1.5, marginBottom: 4 },
  sectionTitle: { fontSize: 22, fontWeight: '800', color: Colors.text },

  // Steps
  stepsRow: { flexDirection: 'row', alignItems: 'center' },
  stepWrap: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  stepCard: {
    flex: 1, backgroundColor: Colors.surface, borderRadius: 18, padding: 16,
    alignItems: 'center', gap: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
    borderWidth: 1, borderColor: Colors.border,
  },
  stepIconBox: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center',
  },
  stepTitle: { fontWeight: '700', color: Colors.text, fontSize: 13, textAlign: 'center' },
  stepDesc: { fontSize: 11, color: Colors.textMuted, textAlign: 'center', lineHeight: 16 },
  stepArrow: { paddingHorizontal: 4 },

  // Features
  featureGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  featureCard: {
    width: (width - 52) / 2, backgroundColor: Colors.surface, borderRadius: 18,
    padding: 18, gap: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    borderWidth: 1, borderColor: Colors.border,
  },
  featureIconBox: {
    width: 46, height: 46, borderRadius: 14,
    backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center',
  },
  featureLabel: { fontWeight: '700', color: Colors.text, fontSize: 14 },
  featureDesc: { fontSize: 12, color: Colors.textMuted, lineHeight: 17 },

  // Crops
  cropGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  cropCard: {
    backgroundColor: Colors.surface, borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 10,
    alignItems: 'center', gap: 5,
    borderWidth: 1, borderColor: Colors.border, minWidth: 74,
  },
  cropEmoji: { fontSize: 24 },
  cropName: { fontSize: 11, fontWeight: '600', color: Colors.text },

  // Bottom CTA
  bottomCta: {
    margin: 20, backgroundColor: Colors.primaryDark, borderRadius: 24,
    padding: 30, alignItems: 'center', gap: 10, overflow: 'hidden',
  },
  bottomCtaBlob: {
    position: 'absolute', width: 180, height: 180, borderRadius: 90,
    backgroundColor: 'rgba(74,222,128,0.08)', top: -50, right: -40,
  },
  bottomCtaTitle: {
    fontSize: 24, fontWeight: '900', color: '#ffffff',
    textAlign: 'center', lineHeight: 32,
  },
  bottomCtaSub: {
    fontSize: 13, color: 'rgba(255,255,255,0.6)',
    textAlign: 'center', marginBottom: 6,
  },
  bottomCtaBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#4ade80', paddingHorizontal: 28, paddingVertical: 14, borderRadius: 14,
  },
  bottomCtaBtnText: { color: Colors.primaryDark, fontWeight: '900', fontSize: 15 },
});
