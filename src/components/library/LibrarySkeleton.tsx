import { StyleSheet, View } from "react-native";

import { authColors, authRadii, authSpacing } from "../../theme/authTheme";

function Block({
  width,
  height,
}: {
  width: number | `${number}%`;
  height: number;
}) {
  return <View style={[styles.block, { width, height }]} />;
}

export function LibrarySkeleton() {
  return (
    <View style={styles.container}>
      <Block width="55%" height={28} />
      <Block width="35%" height={14} />
      <View style={styles.row}>
        <Block width={120} height={120} />
        <Block width={120} height={120} />
        <Block width={120} height={120} />
      </View>
      <Block width="40%" height={20} />
      <View style={styles.row}>
        <Block width={100} height={100} />
        <Block width={100} height={100} />
        <Block width={100} height={100} />
      </View>
      <View style={styles.grid}>
        <Block width="47%" height={160} />
        <Block width="47%" height={160} />
        <Block width="47%" height={160} />
        <Block width="47%" height={160} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: authSpacing.lg,
    gap: authSpacing.md,
    paddingTop: authSpacing.md,
  },
  block: {
    backgroundColor: authColors.surfaceHighlight,
    borderRadius: authRadii.md,
    opacity: 0.55,
  },
  row: {
    flexDirection: "row",
    gap: authSpacing.md,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: authSpacing.md,
  },
});
