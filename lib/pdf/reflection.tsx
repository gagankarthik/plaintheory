import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { paddingHorizontal: 48, paddingVertical: 48, fontSize: 11, lineHeight: 1.5 },
  brand: { fontSize: 18, marginBottom: 4 },
  caption: {
    fontSize: 9,
    color: "#666",
    marginBottom: 18,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  h1: { fontSize: 22, marginBottom: 12 },
  h2: {
    fontSize: 12,
    marginTop: 18,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#666",
  },
  row: { flexDirection: "row", marginBottom: 4 },
  rowLabel: { width: 100, color: "#666" },
  rowValue: { flex: 1 },
  footer: { position: "absolute", bottom: 32, left: 48, right: 48, fontSize: 9, color: "#888" },
});

type Log = { symptomType: string; severity?: number };

type Props = {
  email: string;
  from: string;
  to: string;
  plansCount: number;
  logs: Log[];
};

function avg(filtered: Log[]): string {
  if (filtered.length === 0) return "—";
  return (filtered.reduce((s, l) => s + (l.severity ?? 0), 0) / filtered.length).toFixed(1);
}

export function buildReflectionPdf({ email, from, to, plansCount, logs }: Props) {
  const moodLogs = logs.filter((l) => l.symptomType === "mood" && l.severity);
  const energyLogs = logs.filter((l) => l.symptomType === "energy" && l.severity);
  const focusLogs = logs.filter((l) => l.symptomType === "focus" && l.severity);
  const sleepLogs = logs.filter((l) => l.symptomType === "sleep" && l.severity);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.brand}>PlainTheory</Text>
        <Text style={styles.caption}>
          Personal reflection · {from} → {to}
        </Text>

        <Text style={styles.h1}>Your last 30 days, in summary</Text>

        <Text style={styles.h2}>Averages (1–5 scale)</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Mood</Text>
          <Text style={styles.rowValue}>
            {avg(moodLogs)} ({moodLogs.length} logs)
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Energy</Text>
          <Text style={styles.rowValue}>
            {avg(energyLogs)} ({energyLogs.length} logs)
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Focus</Text>
          <Text style={styles.rowValue}>
            {avg(focusLogs)} ({focusLogs.length} logs)
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Sleep</Text>
          <Text style={styles.rowValue}>
            {avg(sleepLogs)} ({sleepLogs.length} logs)
          </Text>
        </View>

        <Text style={styles.h2}>Activity</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Daily plans</Text>
          <Text style={styles.rowValue}>{plansCount} generated</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Check-ins</Text>
          <Text style={styles.rowValue}>{logs.length} total</Text>
        </View>

        <Text style={styles.h2}>Notes</Text>
        <Text>
          This is your own copy to keep. PlainTheory is a daily-life coaching companion — general
          guidance, not therapy or medical advice.
        </Text>

        <Text style={styles.footer}>Generated for {email} · plaintheory.com</Text>
      </Page>
    </Document>
  );
}
