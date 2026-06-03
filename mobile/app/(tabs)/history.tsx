import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { getHistory, searchHistory, clearHistory } from '@/services/api';
import type { HistoryItem } from '@/types/diagnosis';

export default function HistoryScreen() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [exporting, setExporting] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getHistory();
      setHistory(data.history);
      setSelectedIds(new Set());
    } catch {
      Alert.alert('Error', 'Failed to load history. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const search = async () => {
    if (!query.trim()) { load(); return; }
    setLoading(true);
    try {
      const data = await searchHistory(query);
      setHistory(data.results);
      setSelectedIds(new Set());
    } catch {
      Alert.alert('Error', 'Search failed.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === history.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(history.map(h => h.id)));
    }
  };

  const handleClear = () => {
    Alert.alert('Clear All History', 'This will permanently delete all diagnosis records. Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete All', style: 'destructive',
        onPress: async () => {
          setLoading(true);
          await clearHistory();
          setHistory([]);
          setQuery('');
          setSelectedIds(new Set());
          setLoading(false);
        }
      }
    ]);
  };

  const exportPDF = async () => {
    const items = selectedIds.size > 0
      ? history.filter(h => selectedIds.has(h.id))
      : history;

    if (items.length === 0) {
      Alert.alert('Nothing to Export', 'No diagnosis records found.');
      return;
    }

    setExporting(true);
    try {
      const rows = items.map((item, i) => `
        <tr style="background:${i % 2 === 0 ? '#f0fdf4' : '#ffffff'}">
          <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;font-weight:600;color:#14532d">${item.crop_name}</td>
          <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;color:#0f172a;text-transform:capitalize">${item.disease_name.replace(/_/g, ' ')}</td>
          <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;text-align:center">
            <span style="background:${item.disease_name.toLowerCase().includes('healthy') ? '#dcfce7' : '#fee2e2'};color:${item.disease_name.toLowerCase().includes('healthy') ? '#166534' : '#dc2626'};padding:3px 10px;border-radius:12px;font-size:12px;font-weight:600">
              ${item.disease_name.toLowerCase().includes('healthy') ? 'Healthy' : 'Diseased'}
            </span>
          </td>
          <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;text-align:center;font-weight:700;color:#16a34a">${(item.confidence * 100).toFixed(1)}%</td>
          <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:12px">${new Date(item.timestamp).toLocaleString()}</td>
        </tr>
      `).join('');

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8"/>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 32px; color: #0f172a; background: #fff; }
            .header { background: linear-gradient(135deg, #14532d, #166534); color: white; padding: 28px 32px; border-radius: 12px; margin-bottom: 28px; }
            .header h1 { margin: 0 0 6px 0; font-size: 26px; }
            .header p { margin: 0; opacity: 0.8; font-size: 13px; }
            .meta { display: flex; gap: 20px; margin-bottom: 24px; }
            .meta-box { background: #f0fdf4; border: 1px solid #dcfce7; border-radius: 10px; padding: 12px 20px; }
            .meta-box .val { font-size: 22px; font-weight: 800; color: #16a34a; }
            .meta-box .lbl { font-size: 11px; color: #64748b; margin-top: 2px; }
            table { width: 100%; border-collapse: collapse; border-radius: 10px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
            thead { background: #14532d; }
            thead th { padding: 12px 14px; color: white; text-align: left; font-size: 13px; font-weight: 600; }
            .footer { margin-top: 32px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 16px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🌿 EthioCrop Health — Diagnosis Report</h1>
            <p>Generated on ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div class="meta">
            <div class="meta-box"><div class="val">${items.length}</div><div class="lbl">Total Records</div></div>
            <div class="meta-box"><div class="val">${items.filter(i => i.disease_name.toLowerCase().includes('healthy')).length}</div><div class="lbl">Healthy</div></div>
            <div class="meta-box"><div class="val">${items.filter(i => !i.disease_name.toLowerCase().includes('healthy')).length}</div><div class="lbl">Diseased</div></div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Crop</th><th>Condition</th><th>Status</th><th>Confidence</th><th>Date & Time</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
          <div class="footer">EthioCrop Health Monitoring System · ለኢትዮጵያ አርሶ አደሮች · Educational use only</div>
        </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html, base64: false });
      await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Save Diagnosis Report' });
    } catch (e) {
      Alert.alert('Export Failed', 'Could not generate PDF.');
    } finally {
      setExporting(false);
    }
  };

  const formatDate = (ts: string) =>
    new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const isHealthy = (item: HistoryItem) => item.disease_name.toLowerCase().includes('healthy');
  const allSelected = history.length > 0 && selectedIds.size === history.length;

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.searchRow}>
          <Ionicons name="search-outline" size={18} color={Colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.input}
            placeholder="Search crop or disease..."
            placeholderTextColor={Colors.textLight}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={search}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => { setQuery(''); load(); }}>
              <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Actions Row */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.selectAllBtn} onPress={toggleSelectAll}>
            <View style={[styles.checkbox, allSelected && styles.checkboxActive]}>
              {allSelected && <Ionicons name="checkmark" size={12} color="white" />}
            </View>
            <Text style={styles.selectAllText}>{allSelected ? 'Deselect All' : 'Select All'}</Text>
          </TouchableOpacity>

          <View style={styles.rightActions}>
            {history.length > 0 && (
              <TouchableOpacity style={styles.exportBtn} onPress={exportPDF} disabled={exporting}>
                {exporting
                  ? <ActivityIndicator size="small" color={Colors.surface} />
                  : <><Ionicons name="download-outline" size={16} color={Colors.surface} />
                    <Text style={styles.exportBtnText}>
                      {selectedIds.size > 0 ? `Export (${selectedIds.size})` : 'Export All'}
                    </Text></>
                }
              </TouchableOpacity>
            )}
            {history.length > 0 && (
              <TouchableOpacity style={styles.trashBtn} onPress={handleClear}>
                <Ionicons name="trash-outline" size={18} color={Colors.danger} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading records...</Text>
        </View>
      ) : history.length === 0 ? (
        <View style={styles.center}>
          <View style={styles.emptyIcon}>
            <Ionicons name="time-outline" size={48} color={Colors.textLight} />
          </View>
          <Text style={styles.emptyTitle}>No records yet</Text>
          <Text style={styles.emptySub}>Your diagnosis history will appear here after you analyze a crop</Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const selected = selectedIds.has(item.id);
            const healthy = isHealthy(item);
            return (
              <TouchableOpacity
                style={[styles.card, selected && styles.cardSelected]}
                onPress={() => toggleSelect(item.id)}
                activeOpacity={0.8}
              >
                <View style={styles.cardLeft}>
                  <View style={[styles.checkbox, selected && styles.checkboxActive]}>
                    {selected && <Ionicons name="checkmark" size={12} color="white" />}
                  </View>
                </View>
                <View style={styles.cardBody}>
                  <View style={styles.cardTop}>
                    <View style={styles.cropBadge}>
                      <Text style={styles.cropBadgeText}>{item.crop_name}</Text>
                    </View>
                    <View style={[styles.statusPill, healthy ? styles.healthyPill : styles.diseasedPill]}>
                      <Ionicons name={healthy ? 'checkmark-circle' : 'alert-circle'} size={11} color={healthy ? Colors.primary : Colors.danger} />
                      <Text style={[styles.statusText, healthy ? styles.healthyText : styles.diseasedText]}>
                        {healthy ? 'Healthy' : 'Diseased'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.diseaseName}>{item.disease_name.replace(/_/g, ' ')}</Text>
                  <View style={styles.cardBottom}>
                    <View style={styles.confRow}>
                      <View style={[styles.confBar, { width: `${Math.round(item.confidence * 100)}%` as any }]} />
                    </View>
                    <Text style={styles.confText}>{(item.confidence * 100).toFixed(0)}%</Text>
                    <Text style={styles.dateText}>{formatDate(item.timestamp)}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  topBar: { backgroundColor: Colors.surface, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: Colors.border, gap: 10 },
  searchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.background, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: Colors.border, gap: 8 },
  searchIcon: { },
  input: { flex: 1, fontSize: 14, color: Colors.text },

  actionsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  selectAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkbox: { width: 20, height: 20, borderRadius: 6, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' },
  checkboxActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  selectAllText: { fontSize: 13, color: Colors.textMuted, fontWeight: '500' },

  rightActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  exportBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  exportBtnText: { color: Colors.surface, fontSize: 13, fontWeight: '700' },
  trashBtn: { width: 36, height: 36, borderRadius: 10, borderWidth: 1, borderColor: Colors.dangerLight, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.surface },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 40 },
  loadingText: { color: Colors.textMuted, fontSize: 14 },
  emptyIcon: { width: 90, height: 90, borderRadius: 45, backgroundColor: Colors.borderLight, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.text },
  emptySub: { fontSize: 13, color: Colors.textMuted, textAlign: 'center', lineHeight: 20 },

  list: { padding: 16, gap: 10, paddingBottom: 40 },
  card: { flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: 16, padding: 14, borderWidth: 1.5, borderColor: Colors.border, gap: 12 },
  cardSelected: { borderColor: Colors.primary, backgroundColor: '#f0fdf4' },
  cardLeft: { justifyContent: 'center' },
  cardBody: { flex: 1, gap: 6 },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cropBadge: { backgroundColor: Colors.primaryLight, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  cropBadgeText: { color: Colors.primaryMid, fontSize: 12, fontWeight: '700' },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  healthyPill: { backgroundColor: '#dcfce7' },
  diseasedPill: { backgroundColor: '#fee2e2' },
  statusText: { fontSize: 11, fontWeight: '700' },
  healthyText: { color: Colors.primary },
  diseasedText: { color: Colors.danger },
  diseaseName: { fontSize: 14, fontWeight: '600', color: Colors.text, textTransform: 'capitalize' },
  cardBottom: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  confRow: { flex: 1, height: 4, backgroundColor: Colors.borderLight, borderRadius: 2, overflow: 'hidden' },
  confBar: { height: '100%', backgroundColor: Colors.primary, borderRadius: 2 },
  confText: { fontSize: 12, fontWeight: '700', color: Colors.primary, minWidth: 36 },
  dateText: { fontSize: 11, color: Colors.textLight },
});
