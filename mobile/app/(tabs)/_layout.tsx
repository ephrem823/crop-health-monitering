import { Tabs, useRouter, usePathname } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

const TABS = [
  { name: 'index', label: 'Home', icon: 'home', iconActive: 'home' },
  { name: 'diagnosis', label: 'Diagnose', icon: 'scan-outline', iconActive: 'scan' },
  { name: 'history', label: 'History', icon: 'time-outline', iconActive: 'time' },
  { name: 'about', label: 'About', icon: 'information-circle-outline', iconActive: 'information-circle' },
] as const;

const TITLES: Record<string, string> = {
  index: '🌿 EthioCrop Health',
  diagnosis: 'Crop Diagnosis',
  history: 'Diagnosis History',
  about: 'About',
};

const PREV: Record<string, string> = {
  diagnosis: 'Home',
  history: 'Home',
  about: 'Home',
};

function CustomHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const current = pathname.replace('/', '') || 'index';
  const title = TITLES[current] ?? 'EthioCrop';
  const backLabel = PREV[current];

  return (
    <View style={hStyles.container}>
      <View style={hStyles.left}>
        {backLabel ? (
          <TouchableOpacity style={hStyles.backBtn} onPress={() => router.push('/(tabs)/')} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={20} color={Colors.surface} />
            <Text style={hStyles.backLabel}>{backLabel}</Text>
          </TouchableOpacity>
        ) : (
          <View style={hStyles.logoBadge}>
            <Ionicons name="leaf" size={14} color="#4ade80" />
          </View>
        )}
      </View>

      <Text style={hStyles.title} numberOfLines={1}>{title}</Text>

      <View style={hStyles.right}>
        {current !== 'diagnosis' && (
          <TouchableOpacity style={hStyles.scanBtn} onPress={() => router.push('/(tabs)/diagnosis')} activeOpacity={0.8}>
            <Ionicons name="scan" size={18} color="#4ade80" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const hStyles = StyleSheet.create({
  container: {
    backgroundColor: Colors.primaryDark,
    paddingTop: Platform.OS === 'ios' ? 52 : 16,
    paddingBottom: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  left: { width: 90, justifyContent: 'flex-start' },
  right: { width: 90, alignItems: 'flex-end' },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  backLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '500' },
  logoBadge: {
    width: 30, height: 30, borderRadius: 10,
    backgroundColor: 'rgba(74,222,128,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  title: { fontSize: 17, fontWeight: '800', color: Colors.surface, flex: 1, textAlign: 'center' },
  scanBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: 'rgba(74,222,128,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
});

function CustomTabBar({ state, descriptors, navigation }: any) {
  return (
    <View style={tbStyles.container}>
      {state.routes.map((route: any, index: number) => {
        const tab = TABS.find(t => t.name === route.name);
        if (!tab) return null;
        const isFocused = state.index === index;

        return (
          <TouchableOpacity
            key={route.key}
            style={tbStyles.tab}
            onPress={() => navigation.navigate(route.name)}
            activeOpacity={0.8}
          >
            <View style={[tbStyles.iconWrap, isFocused && tbStyles.iconWrapActive]}>
              <Ionicons
                name={(isFocused ? tab.iconActive : tab.icon) as any}
                size={22}
                color={isFocused ? Colors.primary : Colors.textLight}
              />
            </View>
            <Text style={[tbStyles.label, isFocused && tbStyles.labelActive]}>
              {tab.label}
            </Text>
            {isFocused && <View style={tbStyles.dot} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const tbStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    paddingTop: 8,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 10,
  },
  tab: { flex: 1, alignItems: 'center', gap: 3, position: 'relative' },
  iconWrap: { width: 44, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  iconWrapActive: { backgroundColor: Colors.primaryLight },
  label: { fontSize: 10, fontWeight: '600', color: Colors.textLight },
  labelActive: { color: Colors.primary },
  dot: {
    position: 'absolute', bottom: -6,
    width: 4, height: 4, borderRadius: 2,
    backgroundColor: Colors.primary,
  },
});

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        header: () => <CustomHeader />,
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="diagnosis" />
      <Tabs.Screen name="history" />
      <Tabs.Screen name="about" />
    </Tabs>
  );
}
