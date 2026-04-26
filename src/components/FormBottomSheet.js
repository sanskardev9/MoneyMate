import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { StyleSheet, View } from "react-native";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "../context/ThemeContext";
import useCompactLayout from "../hooks/useCompactLayout";

const sanitizeSnapPoints = (points, fallbackPoints) => {
  const source = Array.isArray(points) && points.length ? points : fallbackPoints;
  const normalized = source
    .map((point) => {
      if (typeof point === "number") {
        return point > 0 ? point : null;
      }

      if (typeof point === "string") {
        const trimmed = point.trim();

        if (trimmed.endsWith("%")) {
          const percent = Number(trimmed.slice(0, -1));
          return Number.isFinite(percent) && percent > 0 ? `${percent}%` : null;
        }

        const numeric = Number(trimmed);
        return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
      }

      return null;
    })
    .filter(Boolean);

  return normalized.length ? normalized : fallbackPoints;
};

const FormBottomSheet = ({
  visible,
  title,
  onClose,
  children,
  snapPoints: customSnapPoints,
  reserveTabBarSpace = true,
}) => {
  const { colors } = useAppTheme();
  const isCompact = useCompactLayout();
  const insets = useSafeAreaInsets();
  const sheetRef = useRef(null);
  const visibleRef = useRef(visible);
  const programmaticCloseRef = useRef(false);
  const enableDynamicSizing = false;
  const fallbackSnapPoints = useMemo(
    () => [reserveTabBarSpace ? (isCompact ? "88%" : "65%") : isCompact ? "52%" : "40%"],
    [isCompact, reserveTabBarSpace]
  );
  const snapPoints = useMemo(
    () => sanitizeSnapPoints(customSnapPoints, fallbackSnapPoints),
    [customSnapPoints, fallbackSnapPoints]
  );
  const bottomSpacing = useMemo(
    () =>
      reserveTabBarSpace
        ? Math.max(insets.bottom + 98, 120)
        : Math.max(insets.bottom + 24, 36),
    [insets.bottom, reserveTabBarSpace]
  );

  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        pressBehavior="close"
        opacity={0.45}
      />
    ),
    []
  );

  const handleSheetClose = useCallback(() => {
    if (programmaticCloseRef.current) {
      programmaticCloseRef.current = false;
      return;
    }

    if (visibleRef.current) {
      onClose?.();
    }
  }, [onClose]);

  useEffect(() => {
    visibleRef.current = visible;
  }, [visible]);

  useEffect(() => {
    const node = sheetRef.current;
    if (!node) return;

    if (visible) {
      programmaticCloseRef.current = false;
      node.snapToIndex(0);
    } else {
      programmaticCloseRef.current = true;
      node.close();
    }
  }, [visible]);

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={snapPoints}
      enableDynamicSizing={enableDynamicSizing}
      enablePanDownToClose
      onClose={handleSheetClose}
      backdropComponent={renderBackdrop}
      backgroundStyle={[styles.sheetBackground, { backgroundColor: colors.surface }]}
      handleIndicatorStyle={{ backgroundColor: colors.border, width: 52 }}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      animateOnMount={false}
      bottomInset={reserveTabBarSpace ? insets.bottom : 0}
    >
      <BottomSheetScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: bottomSpacing }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        </View>
        {children}
      </BottomSheetScrollView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  sheetBackground: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 40,
  },
  header: {
    paddingBottom: 14,
    marginBottom: 18,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
  },
});

export default FormBottomSheet;
