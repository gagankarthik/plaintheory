import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

export type WellnessStats = {
  email: string;
  generatedAt: string;
  range: { from: string; to: string };
  totals: {
    logs: number;
    plansCompleted: number;
    waterGlasses: number;
    chatMessages: number;
    habitsActive: number;
    habitCompletions: number;
  };
  averages: {
    mood?: number;
    energy?: number;
    focus?: number;
  };
  streaks: {
    currentCheckIn: number;
    bestHabit: number;
    bestPlan: number;
  };
  logsByType: Array<{ type: string; count: number }>;
  recentLogs: Array<{ date: string; type: string; severity?: number; notes?: string }>;
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 48,
    paddingBottom: 56,
    paddingHorizontal: 56,
    fontSize: 11,
    fontFamily: "Helvetica",
    color: "#1f2933",
    backgroundColor: "#ffffff",
    lineHeight: 1.4,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  brandDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#3a6a4a",
    marginRight: 8,
  },
  brandText: {
    fontSize: 12,
    color: "#3a6a4a",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 26,
    fontFamily: "Times-Roman",
    color: "#111",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 11,
    color: "#6b7280",
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 9,
    color: "#6b7280",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginTop: 22,
    marginBottom: 10,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 0,
    marginBottom: 4,
  },
  statCell: {
    width: "33.33%",
    paddingVertical: 10,
    paddingRight: 12,
  },
  statLabel: {
    fontSize: 9,
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontFamily: "Times-Roman",
    color: "#111",
  },
  card: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 14,
    marginBottom: 10,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: "#f1f1f4",
  },
  rowLast: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 56,
    right: 56,
    fontSize: 9,
    color: "#9ca3af",
    textAlign: "center",
  },
});

function bandLabel(value?: number): string {
  if (value === undefined) return "—";
  if (value < 250) return "Low";
  if (value < 500) return "Below avg";
  if (value < 750) return "Okay";
  return "High";
}

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

export function WellnessSummary({ stats }: { stats: WellnessStats }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.brandRow}>
          <View style={styles.brandDot} />
          <Text style={styles.brandText}>PlainTheory</Text>
        </View>
        <Text style={styles.title}>Wellness summary</Text>
        <Text style={styles.subtitle}>
          {stats.email} · {fmtDate(stats.range.from)} – {fmtDate(stats.range.to)}
        </Text>

        <Text style={styles.sectionHeader}>At a glance</Text>
        <View style={styles.grid}>
          <View style={styles.statCell}>
            <Text style={styles.statLabel}>Total check-ins</Text>
            <Text style={styles.statValue}>{stats.totals.logs}</Text>
          </View>
          <View style={styles.statCell}>
            <Text style={styles.statLabel}>Plans done</Text>
            <Text style={styles.statValue}>{stats.totals.plansCompleted}</Text>
          </View>
          <View style={styles.statCell}>
            <Text style={styles.statLabel}>Chat replies</Text>
            <Text style={styles.statValue}>{stats.totals.chatMessages}</Text>
          </View>
          <View style={styles.statCell}>
            <Text style={styles.statLabel}>Water (glasses)</Text>
            <Text style={styles.statValue}>{stats.totals.waterGlasses}</Text>
          </View>
          <View style={styles.statCell}>
            <Text style={styles.statLabel}>Active habits</Text>
            <Text style={styles.statValue}>{stats.totals.habitsActive}</Text>
          </View>
          <View style={styles.statCell}>
            <Text style={styles.statLabel}>Habit completions</Text>
            <Text style={styles.statValue}>{stats.totals.habitCompletions}</Text>
          </View>
        </View>

        <Text style={styles.sectionHeader}>How you've felt</Text>
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <Text>Mood (avg)</Text>
            <Text>{bandLabel(stats.averages.mood)}</Text>
          </View>
          <View style={styles.rowBetween}>
            <Text>Energy (avg)</Text>
            <Text>{bandLabel(stats.averages.energy)}</Text>
          </View>
          <View style={styles.rowLast}>
            <Text>Focus (avg)</Text>
            <Text>{bandLabel(stats.averages.focus)}</Text>
          </View>
        </View>

        <Text style={styles.sectionHeader}>Streaks</Text>
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <Text>Current check-in streak</Text>
            <Text>{stats.streaks.currentCheckIn} days</Text>
          </View>
          <View style={styles.rowBetween}>
            <Text>Best plan streak</Text>
            <Text>{stats.streaks.bestPlan} days</Text>
          </View>
          <View style={styles.rowLast}>
            <Text>Best habit streak</Text>
            <Text>{stats.streaks.bestHabit} days</Text>
          </View>
        </View>

        <Text style={styles.sectionHeader}>Logs by type</Text>
        <View style={styles.card}>
          {stats.logsByType.length === 0 ? (
            <Text>No logs yet.</Text>
          ) : (
            stats.logsByType.map((row, i) => (
              <View
                key={row.type}
                style={i === stats.logsByType.length - 1 ? styles.rowLast : styles.rowBetween}
              >
                <Text>{row.type}</Text>
                <Text>{row.count}</Text>
              </View>
            ))
          )}
        </View>

        <Text style={styles.footer}>
          Generated {fmtDate(stats.generatedAt)} · General coaching, not therapy or medical advice.
        </Text>
      </Page>

      {stats.recentLogs.length > 0 ? (
        <Page size="A4" style={styles.page}>
          <Text style={styles.title}>Recent logs</Text>
          <Text style={styles.subtitle}>Most recent 30 entries.</Text>
          <View style={styles.card}>
            {stats.recentLogs.map((log, i) => (
              <View
                key={i}
                style={i === stats.recentLogs.length - 1 ? styles.rowLast : styles.rowBetween}
              >
                <Text>
                  {fmtDate(log.date)} · {log.type}
                  {log.severity !== undefined ? ` · ${log.severity}` : ""}
                </Text>
                <Text style={{ color: "#6b7280", maxWidth: 220 }}>
                  {log.notes ? log.notes.slice(0, 60) : ""}
                </Text>
              </View>
            ))}
          </View>
          <Text style={styles.footer}>
            Page 2 · General coaching, not therapy or medical advice.
          </Text>
        </Page>
      ) : null}
    </Document>
  );
}
