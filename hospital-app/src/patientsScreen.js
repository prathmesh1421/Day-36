import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Platform,
  Alert,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

// --- ANIMATED PATIENT CARD ---
const PatientCard = ({ item, index, onDelete }) => {
  const animationEnter = FadeIn.delay(index * 80).duration(400);
  const translateX = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      const x = e.translationX;
      translateX.value = x < 0 ? x : 0;
    })
    .onEnd(() => {
      if (translateX.value < -80) {
        onDelete();
        translateX.value = withSpring(-500, {}, () => (translateX.value = 0));
      } else {
        translateX.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View entering={animationEnter} style={styles.patientContainer}>
        {/* Delete Background */}
        <View style={styles.deleteBackground}>
          <Text style={styles.deleteIcon}>🗑️</Text>
          <Text style={styles.deleteLabel}>Swipe to Delete</Text>
        </View>

        {/* Card */}
        <Animated.View style={[styles.patientCard, animatedStyle]}>
          <View style={styles.cardTopRow}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>🧑‍⚕️</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.patientName}>{item.name}</Text>
              <Text style={styles.patientId}>ID: #{item.id.slice(-4)}</Text>
            </View>
            <View style={styles.diseaseBadge}>
              <Text style={styles.diseaseText}>{item.disease}</Text>
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
};

// --- MAIN SCREEN ---
export default function PatientsScreen({ navigation }) {
  const [patients, setPatients] = useState([]);
  const [name, setName] = useState("");
  const [disease, setDisease] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadInitialPatients();
  }, []);

  const loadInitialPatients = () => {
    setPatients([
      { id: "1001", name: "Rahul Sharma", disease: "Fever" },
      { id: "1002", name: "Priya Mehta", disease: "Diabetes" },
      { id: "1003", name: "Amit Shah", disease: "Flu" },
      { id: "1004", name: "Sneha Joshi", disease: "Cold" },
    ]);
    setPage(1);
  };

  const handleAdd = () => {
    if (!name.trim() || !disease.trim()) {
      Alert.alert("Error", "Please enter name and disease");
      return;
    }
    setPatients((prev) => [
      { id: Date.now().toString(), name: name.trim(), disease: disease.trim() },
      ...prev,
    ]);
    setName("");
    setDisease("");
  };

  const handleDelete = (id) => {
    setPatients((prev) => prev.filter((p) => p.id !== id));
  };

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      loadInitialPatients();
      setRefreshing(false);
    }, 1000);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (loadingMore) return;
    setLoadingMore(true);
    setTimeout(() => {
      const newData = Array.from({ length: 5 }).map((_, i) => ({
        id: Date.now().toString() + i,
        name: `Patient ${page * 5 + i + 1}`,
        disease: "General Checkup",
      }));
      setPatients((prev) => [...prev, ...newData]);
      setPage((prev) => prev + 1);
      setLoadingMore(false);
    }, 1000);
  }, [page, loadingMore]);

  const renderFooter = () =>
    loadingMore ? (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#6366f1" />
        <Text style={styles.footerText}>Loading more...</Text>
      </View>
    ) : null;

  const handleLogout = () =>
    navigation.getParent().reset({ index: 0, routes: [{ name: "Login" }] });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerSub}>Hospital System</Text>
            <Text style={styles.headerTitle}>Patients</Text>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={patients}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={["#6366f1"]}
              tintColor="#6366f1"
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={renderFooter}
          ListHeaderComponent={
            <>
              {/* Add Patient Card */}
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardIconWrap}>
                    <Text style={styles.cardIconEmoji}>🧑‍⚕️</Text>
                  </View>
                  <Text style={styles.cardTitle}>Add Patient</Text>
                </View>

                <Text style={styles.inputLabel}>Patient Name</Text>
                <TextInput
                  placeholder="Enter patient name"
                  placeholderTextColor="#a5b4fc"
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                />

                <Text style={styles.inputLabel}>Disease / Condition</Text>
                <TextInput
                  placeholder="Enter disease or condition"
                  placeholderTextColor="#a5b4fc"
                  style={styles.input}
                  value={disease}
                  onChangeText={setDisease}
                />

                <TouchableOpacity style={styles.button} onPress={handleAdd}>
                  <Text style={styles.buttonText}>Add Patient 🚀</Text>
                </TouchableOpacity>
              </View>

              {/* Section Title */}
              <Text style={styles.sectionTitle}>
                Patient Records ({patients.length})
              </Text>
            </>
          }
          renderItem={({ item, index }) => (
            <PatientCard
              item={item}
              index={index}
              onDelete={() => handleDelete(item.id)}
            />
          )}
          ListEmptyComponent={
            !refreshing ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyEmoji}>📭</Text>
                <Text style={styles.emptyTitle}>No Patients Yet</Text>
                <Text style={styles.emptySubtitle}>
                  Add your first patient above
                </Text>
              </View>
            ) : null
          }
        />
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f4ff",
  },

  // ── Header ──
  header: {
    backgroundColor: "#1e1b4b",
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 28,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerSub: {
    color: "#a5b4fc",
    fontSize: 13,
    marginBottom: 4,
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "bold",
  },
  logoutBtn: {
    backgroundColor: "#312e81",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: "#4338ca",
  },
  logoutText: {
    color: "#a5b4fc",
    fontSize: 14,
    fontWeight: "bold",
  },

  listContent: {
    padding: 20,
    paddingBottom: 100,
    alignItems: "center",
  },

  // ── Add Patient Card ──
  card: {
    width: Platform.OS === "web" ? 500 : "100%",
    backgroundColor: "#ffffff",
    padding: 24,
    borderRadius: 24,
    borderWidth: 0.5,
    borderColor: "#e0e7ff",
    elevation: 4,
    marginTop: 24,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    gap: 12,
  },
  cardIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#e0e7ff",
    alignItems: "center",
    justifyContent: "center",
  },
  cardIconEmoji: { fontSize: 22 },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e1b4b",
  },

  // ── Inputs ──
  inputLabel: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#4338ca",
    marginBottom: 6,
    marginLeft: 2,
  },
  input: {
    backgroundColor: "#eef2ff",
    padding: 14,
    borderRadius: 14,
    marginBottom: 16,
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#c7d2fe",
    color: "#1e1b4b",
  },

  // ── Button ──
  button: {
    backgroundColor: "#1e1b4b",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 6,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "bold",
  },

  // ── Section Title ──
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 32,
    marginBottom: 16,
    color: "#1e1b4b",
    width: Platform.OS === "web" ? 500 : "100%",
  },

  // ── Patient Card ──
  patientContainer: {
    width: Platform.OS === "web" ? 500 : "100%",
    marginBottom: 14,
    position: "relative",
    overflow: "hidden",
    borderRadius: 20,
  },
  deleteBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#ef4444",
    justifyContent: "center",
    alignItems: "flex-end",
    paddingRight: 25,
    borderRadius: 20,
    flexDirection: "row",
    // alignItems: "center",
  },
  deleteIcon: { fontSize: 20, marginRight: 8 },
  deleteLabel: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  patientCard: {
    backgroundColor: "#ffffff",
    padding: 18,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: "#e0e7ff",
    elevation: 3,
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#e0e7ff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 4,
  },
  avatarText: { fontSize: 20 },
  patientName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e1b4b",
    marginBottom: 2,
  },
  patientId: {
    fontSize: 12,
    color: "#94a3b8",
  },
  diseaseBadge: {
    backgroundColor: "#eef2ff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: "#c7d2fe",
  },
  diseaseText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#4338ca",
  },

  // ── Footer Loader ──
  footerLoader: {
    marginTop: 10,
    marginBottom: 10,
    alignItems: "center",
    gap: 6,
  },
  footerText: {
    fontSize: 13,
    color: "#6366f1",
  },

  // ── Empty State ──
  emptyCard: {
    backgroundColor: "#ffffff",
    padding: 36,
    borderRadius: 20,
    width: Platform.OS === "web" ? 500 : "100%",
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: "#e0e7ff",
  },
  emptyEmoji: { fontSize: 40, marginBottom: 12 },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e1b4b",
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#6366f1",
    textAlign: "center",
  },
});
