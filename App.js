// import { StatusBar } from "expo-status-bar";
// import { useEffect, useState } from "react";
// import { View, ActivityIndicator } from "react-native";
// import "react-native-url-polyfill/auto";
// import "react-native-get-random-values";
// import { supabase } from "./src/lib/supabase";
// import AuthScreen from "./src/screens/AuthScreen";
// import HomeScreen from "./src/screens/HomeScreen";
// import BudgetCategoriesScreen from "./src/screens/BudgetCategoriesScreen";
// import Toast from "react-native-toast-message";
// import ExpenseScreen from "./src/screens/ExpenseScreen";
// import ExpenseHistoryScreen from "./src/screens/ExpenseHistoryScreen";

// // ✅ Navigation
// import { NavigationContainer } from "@react-navigation/native";
// import { createNativeStackNavigator } from "@react-navigation/native-stack";
// import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
// const Stack = createNativeStackNavigator();

// export default function App() {
//   const [session, setSession] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [income, setIncome] = useState(null);
//   const [categories, setCategories] = useState([]);
//   const [initialRoute, setInitialRoute] = useState(null);

//   useEffect(() => {
//     const getSession = async () => {
//       const { data } = await supabase.auth.getSession();
//       setSession(data.session);
//       setLoading(false);
//     };
//     getSession();
//     const {
//       data: { subscription },
//     } = supabase.auth.onAuthStateChange((_event, session) => {
//       setSession(session);
//     });
//     return () => {
//       subscription.unsubscribe();
//     };
//   }, []);

//   useEffect(() => {
//     const fetchUserData = async () => {e
//       if (!session) return;
//       setLoading(true);
//       const user_id = session.user.id;
//       // Fetch income
//       const { data: incomeData } = await supabase
//         .from("incomes")
//         .select("amount")
//         .eq("user_id", user_id)
//         .order("created_at", { ascending: false })
//         .limit(1);
//       const userIncome = incomeData && incomeData.length > 0 ? incomeData[0].amount : null;
//       setIncome(userIncome);
//       // Fetch categories
//       const { data: catData } = await supabase
//         .from("budget_categories")
//         .select("amount")
//         .eq("user_id", user_id);
//       setCategories(catData || []);
//       // Decide initial route
//       if (!userIncome) {
//         setInitialRoute("Home");
//       } else {
//         const totalAllocated = (catData || []).reduce((sum, c) => sum + Number(c.amount), 0);
//         if (totalAllocated < userIncome) {
//           setInitialRoute("BudgetCategories");
//         } else {
//           setInitialRoute("Expense");
//         }
//       }
//       setLoading(false);
//     };
//     if (session) fetchUserData();
//   }, [session]);

//   if (loading || (session && !initialRoute)) {
//     return (
//       <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
//         <ActivityIndicator size="large" />
//       </View>
//     );
//   }

//   return (
//     <PaperProvider theme={DefaultTheme}>
//     <NavigationContainer>
//         <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRoute}>
//         {!session ? (
//           <Stack.Screen name="Auth" component={AuthScreen} />
//         ) : (
//           <>
//             <Stack.Screen name="Home" component={HomeScreen} />
//             <Stack.Screen name="BudgetCategories" component={BudgetCategoriesScreen} />
//               <Stack.Screen name="Expense" component={ExpenseScreen} />
//             <Stack.Screen name="ExpenseHistory" component={ExpenseHistoryScreen} />
//           </>
//         )}
//       </Stack.Navigator>
//       <StatusBar style="auto" />
//       <Toast />
//     </NavigationContainer>
//     </PaperProvider>
//   );
// }


import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import "react-native-url-polyfill/auto";
import "react-native-get-random-values";
import { supabase } from "./src/lib/supabase";

// Screens
import AuthScreen from "./src/screens/AuthScreen";
import HomeScreen from "./src/screens/HomeScreen";
import BudgetCategoriesScreen from "./src/screens/BudgetCategoriesScreen";
import BudgetDetailsScreen from "./src/screens/BudgetDetailsScreen";
import CategoryExpenseHistoryScreen from "./src/screens/CategoryExpenseHistoryScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import AppearanceScreen from "./src/screens/AppearanceScreen";
import ExpenseScreen from "./src/screens/ExpenseScreen";

import ExpenseHistoryScreen from "./src/screens/ExpenseHistoryScreen";
import UserProfileScreen from "./src/screens/UserProfileScreen";
import HistoryScreen from "./src/screens/HistoryScreen";
import ReportsScreen from "./src/screens/ReportsScreen";


// Navigation & UI
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Provider as PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { ThemeProvider, useAppTheme } from "./src/context/ThemeContext";
import BottomNavBar from "./src/components/BottomNavBar";
import { TabShellProvider } from "./src/context/TabShellContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";


const Stack = createNativeStackNavigator();

const TAB_SCREENS = {
  Expense: ExpenseScreen,
  BudgetDetails: BudgetDetailsScreen,
  History: HistoryScreen,
  Reports: ReportsScreen,
};

function MainTabsShell({ navigation, route, initialTab = "Expense" }) {
  const { colors } = useAppTheme();
  const [activeTab, setActiveTab] = useState(route.params?.tab || initialTab);

  useEffect(() => {
    if (route.params?.tab && route.params.tab !== activeTab) {
      setActiveTab(route.params.tab);
    }
  }, [route.params?.tab, activeTab]);

  const ActiveScreen = TAB_SCREENS[activeTab] || ExpenseScreen;

  return (
    <TabShellProvider
      value={{
        activeRoute: activeTab,
        setActiveRoute: setActiveTab,
      }}
    >
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ flex: 1 }}>
          <ActiveScreen navigation={navigation} route={route} />
        </View>
        <View style={{ position: "absolute", left: 0, right: 0, bottom: 0 }}>
          <BottomNavBar
            navigation={navigation}
            currentRoute={activeTab}
            onTabPress={setActiveTab}
          />
        </View>
      </View>
    </TabShellProvider>
  );
}

function AppContent() {
  const { paperTheme } = useAppTheme();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [income, setIncome] = useState(null);
  const [categories, setCategories] = useState([]);
  const [initialRoute, setInitialRoute] = useState(null);
  const [initialTab, setInitialTab] = useState("Expense");

  useEffect(() => {
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) console.error("Session fetch error:", error);
      setSession(data.session);
      setLoading(false);
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!session) return;

      try {
        setLoading(true);
        const user_id = session.user.id;

        // Fetch income
        const { data: incomeData, error: incomeError } = await supabase
          .from("incomes")
          .select("amount")
          .eq("user_id", user_id)
          .order("created_at", { ascending: false })
          .limit(1);

        if (incomeError) throw incomeError;

        const userIncome = incomeData?.[0]?.amount || null;
        setIncome(userIncome);

        // Fetch budget categories
        const { data: catData, error: catError } = await supabase
          .from("budget_categories")
          .select("amount")
          .eq("user_id", user_id);

        if (catError) throw catError;

        setCategories(catData || []);

        // Decide route
        if (!userIncome) {
          setInitialRoute("Home");
        } else {
          const totalAllocated = (catData || []).reduce(
            (sum, c) => sum + Number(c.amount),
            0
          );
          if (totalAllocated < userIncome) {
            setInitialRoute("BudgetCategories");
          } else {
            setInitialRoute("MainTabs");
            setInitialTab("Expense");
          }
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (session) fetchUserData();
  }, [session]);

  if (loading || (session && !initialRoute)) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PaperProvider theme={paperTheme}>
          <NavigationContainer>
            <Stack.Navigator
              screenOptions={{ headerShown: false }}
              initialRouteName={initialRoute}
            >
              {!session ? (
                <Stack.Screen name="Auth" component={AuthScreen} />
              ) : (
                <>
                  <Stack.Screen name="Home" component={HomeScreen} />
                  <Stack.Screen
                    name="BudgetCategories"
                    component={BudgetCategoriesScreen}
                  />
                  <Stack.Screen name="CategoryExpenseHistory" component={CategoryExpenseHistoryScreen} />
                  <Stack.Screen name="MainTabs">
                    {(props) => <MainTabsShell {...props} initialTab={initialTab} />}
                  </Stack.Screen>
                  <Stack.Screen name="Settings" component={SettingsScreen} />
                  <Stack.Screen name="Appearance" component={AppearanceScreen} />
                  <Stack.Screen name="UserProfile" component={UserProfileScreen} />
                  <Stack.Screen
                    name="ExpenseHistory"
                    component={ExpenseHistoryScreen}
                  />
                </>
              )}
            </Stack.Navigator>
            <StatusBar style={paperTheme.dark ? "light" : "dark"} />
            <Toast />
          </NavigationContainer>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
