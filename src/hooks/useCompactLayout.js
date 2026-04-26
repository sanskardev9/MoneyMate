import { useWindowDimensions } from "react-native";

export default function useCompactLayout() {
  const { width, height } = useWindowDimensions();
  return width <= 375 || height <= 700;
}
