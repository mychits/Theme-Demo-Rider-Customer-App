import React, { useState, useCallback, useContext, useRef, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    ScrollView,
    ActivityIndicator,
    TouchableOpacity,
    Animated,
    Alert,
    Easing,
    useWindowDimensions,
    Vibration,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
// import { LinearGradient } from "expo-linear-gradient"; 
import axios from "axios";
import { MaterialIcons, FontAwesome5, Ionicons, AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

// Assuming these context and data paths are correct for a functional app
import { ContextProvider } from "../context/UserProvider"; 
import url from "../data/url";

// ===============================================
// --- PROFESSIONAL VIOLET THEME & COLORS ---
// ===============================================
const Colors = {
    // Core App Theme - Matching the image's deep violet
    primaryViolet: "#5A189A", 
    secondaryViolet: "#9D4EDD", 
    vibrantPurple: "#9C27B0", 
    darkText: "#212121", 
    mediumText: "#757575", 
    background: "#F8F8F8", // A very light gray for the body background
    white: "#FFFFFF",
    error: "#C62828", 
    success: "#2E7D32", 
    
    // Header Color
    headerColor: '#4A148C', 
    
    // Summary Card Colors
    investmentCard: '#37474F', // Dark Slate Gray (for Investment)
    profitCard: '#4CAF50', // Bright Green (for Profit)
    groupsCard: '#7B1FA2', // Violet (for Enrolled Groups)
};

// ===============================================
// --- UTILITY FUNCTIONS ---
// ===============================================

/**
 * Formats a number into Indian currency style (e.g., 12,34,567.89).
 * Prepends the Indian Rupee symbol (₹).
 * @param {number} num The number to format.
 * @returns {string} The formatted currency string.
 */
const formatNumberIndianStyle = (num) => {
    if (num === null || num === undefined) return "₹ 0.00";
    const numValue = Number(num);
    
    const integerPart = String(Math.floor(Math.abs(numValue))); 
    const decimalPart = numValue.toFixed(2).split(".")[1];
    
    let isNegative = numValue < 0;
    
    // Logic for Indian number formatting (lakhs and crores)
    let lastThree = integerPart.length > 3 ? integerPart.slice(-3) : integerPart;
    let otherNumbers = integerPart.length > 3 ? integerPart.slice(0, -3) : "";
    
    // Use regex to place commas after every two digits in the "otherNumbers" part
    const formattedOther = otherNumbers
        ? otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + ","
        : "";
        
    return (isNegative ? "-₹ " : "₹ ") + formattedOther + lastThree + (decimalPart ? "." + decimalPart : "");
};

// ===============================================
// --- SCREEN HEADER COMPONENT ---
// ===============================================
const ScreenHeader = ({ navigation, safeAreaTopInset, title }) => {
    // Initial position for slide-down animation (starting off-screen)
    const headerAnim = useRef(new Animated.Value(-100)).current; 

    useEffect(() => {
        // Animate the header into view
        Animated.timing(headerAnim, {
            toValue: 0, 
            duration: 500, 
            delay: 100, // Wait a moment after screen load
            easing: Easing.out(Easing.ease), 
            useNativeDriver: true, 
        }).start();
    }, [headerAnim]); 

    const handleInfoIconPress = () => {
        Vibration.vibrate(50);
        Alert.alert(
            "Passbook Information",
            "This view provides a quick summary of your total financial activity across all active groups. For individual group details and payments, please visit the 'My Groups' screen.",
            [{ text: "OK", style: "cancel" }]
        );
    };

    return (
        <View style={[styles.headerGradient, { backgroundColor: Colors.headerColor }]}>
            <Animated.View 
                style={[
                    styles.animatedHeaderWrapper,
                    { transform: [{ translateY: headerAnim }] },
                ]}
            >
                <View style={[styles.headerContainer, { paddingTop: safeAreaTopInset + 5 }]}>
                    
                    <TouchableOpacity
                        onPress={() => { Vibration.vibrate(50); navigation.goBack(); }}
                        style={styles.backButton}
                    >
                        <Ionicons name="arrow-back" size={26} color={Colors.white} />
                    </TouchableOpacity>

                    <Text style={styles.headerTitle}>{title}</Text>

                    <TouchableOpacity
                        onPress={handleInfoIconPress}
                        style={styles.infoIconContainer}
                    >
                        <AntDesign name="infocirlce" size={20} color={Colors.white} />
                    </TouchableOpacity>
                    
                </View>
            </Animated.View>
        </View>
    );
};


// ===============================================
// --- SUMMARY CARD COMPONENT ---
// ===============================================
const SummaryCard = ({ label, amount, iconName, iconSet, color, index }) => {
    
    const isAmountCard = label !== "ENROLLED GROUPS";
    const displayAmount = isAmountCard ? formatNumberIndianStyle(amount) : amount;
    
    // Local animation values for each card
    const cardAnim = useRef(new Animated.Value(50)).current; 
    const opacityAnim = useRef(new Animated.Value(0)).current;
    
    useEffect(() => {
        // Sequential animation: delay based on index for a cascading effect
        Animated.sequence([
            Animated.delay(100 + 100 * index),
            Animated.parallel([
                Animated.timing(cardAnim, { toValue: 0, duration: 600, easing: Easing.out(Easing.quad), useNativeDriver: true }),
                Animated.timing(opacityAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
            ])
        ]).start();
    }, [index, cardAnim, opacityAnim]);

    // Icon rendering logic based on iconSet prop
    const renderIcon = () => {
        const iconProps = { name: iconName, size: isAmountCard ? 20 : 24, color: Colors.white, style: styles.cardIcon };
        switch (iconSet) {
            case 'FontAwesome5':
                return <FontAwesome5 {...iconProps} />;
            case 'MaterialIcons':
                return <MaterialIcons {...iconProps} size={24} />; // MaterialIcons typically need a slightly larger size
            case 'MaterialCommunityIcons':
                return <MaterialCommunityIcons {...iconProps} size={24} />;
            default:
                return null;
        }
    };

    return (
        <Animated.View 
            key={label}
            style={[
                styles.summaryCard,
                { 
                    backgroundColor: color, 
                    transform: [{ translateY: cardAnim }], 
                    opacity: opacityAnim,
                }
            ]}
        >
            <View style={styles.summaryCardContent}>
                
                {/* Top Icon and Label */}
                <View style={styles.summaryTopRow}>
                    {renderIcon()}
                    <Text style={styles.summaryLabel}>{label}</Text>
                </View>

                {/* Amount/Count */}
                <Text style={styles.summaryAmount}>
                    {displayAmount}
                </Text>
            </View>
        </Animated.View>
    );
};


// ===============================================
// --- MY PASSBOOK MAIN SCREEN ---
// ===============================================
const MyPassbookScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { width } = useWindowDimensions(); 
    // ContextProvider is destructured correctly
    const [appUser] = useContext(ContextProvider); 
    const userId = appUser?.userId;

    const [currentUserId, setCurrentUserId] = useState(userId || null);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [dataError, setDataError] = useState(null);
    const [totalPaid, setTotalPaid] = useState(0);
    const [totalProfit, setTotalProfit] = useState(0);
    const [enrolledGroupsCount, setEnrolledGroupsCount] = useState(0);
    
    // The data structure for the summary cards
    const summaryData = [
        { label: "TOTAL INVESTMENT", amount: totalPaid, iconName: "credit-card", iconSet: "FontAwesome5", color: Colors.investmentCard },
        { label: "TOTAL DIVIDEND / PROFIT", amount: totalProfit, iconName: "chart-line", iconSet: "FontAwesome5", color: Colors.profitCard },
        { label: "ENROLLED GROUPS", amount: enrolledGroupsCount, iconName: "account-group", iconSet: "MaterialCommunityIcons", color: Colors.groupsCard },
    ];


    const fetchAllOverview = useCallback(async () => {
        if (!currentUserId) {
            setIsLoadingData(false);
            setDataError("User ID not found. Please log in again.");
            return;
        }
        setIsLoadingData(true);
        setDataError(null);
        
        try {
            // Placeholder: Replace with your actual backend endpoint
            const response = await axios.post(
                `${url}/enroll/get-user-tickets-report/${currentUserId}`
            );
            
            // Assume the response.data is an array of group/ticket reports
            const data = Array.isArray(response.data) ? response.data : [];

            // Calculate Total Paid Amount (Investment)
            const totalPaidAmount = data.reduce(
                (sum, group) => sum + (group?.payments?.totalPaidAmount || 0), 0
            );
            setTotalPaid(totalPaidAmount);

            // Calculate Total Profit/Dividend
            const totalProfitAmount = data.reduce(
                (sum, group) => sum + (group?.profit?.totalProfit || 0), 0
            );
            setTotalProfit(totalProfitAmount);

            // Count Active Groups
            const activeGroups = data.filter(g => !g.enrollment?.deleted);
            setEnrolledGroupsCount(activeGroups.length);

            setIsLoadingData(false);
            
        } catch (error) {
            let errorMessage = "Could not load financial data. Check connection.";
            if (error.response && error.response.status === 404) {
                errorMessage = "No enrollment data found.";
                // Reset state to 0 on 404
                setTotalPaid(0);
                setTotalProfit(0);
                setEnrolledGroupsCount(0);
            } else {
                console.error("Error fetching passbook data:", error);
            }

            setDataError(errorMessage);
            Toast.show({
                type: "error",
                text1: "Data Load Error",
                text2: errorMessage,
                position: "bottom",
                visibilityTime: 4000,
            });
            setIsLoadingData(false);
        }
    }, [currentUserId]);

    useFocusEffect(
        // The useCallback ensures this effect runs once when the component mounts/focuses
        useCallback(() => {
            setCurrentUserId(userId);
            if (userId) {
                fetchAllOverview();
            } else {
                setIsLoadingData(false);
                setDataError("User session expired. Please log in to view your passbook.");
            }
            // Cleanup function to hide Toast message when the screen is blurred
            return () => Toast.hide(); 
        }, [userId, fetchAllOverview])
    );

    // **********************************************
    // --- UPDATED NAVIGATION FUNCTION ---
    // **********************************************
    const handleGoToMyGroups = () => {
        Vibration.vibrate(50);
        // Using the requested nested navigation pattern:
        // Navigate to the Tab Navigator ("BottomTab") and specify the target screen ("EnrollTab").
        navigation.navigate("BottomTab", { screen: "EnrollTab" }); 
    };
    
    
    if (isLoadingData) {
        return (
            <SafeAreaView style={[styles.loadingScreen, { paddingTop: insets.top }]}>
                <ActivityIndicator size="large" color={Colors.primaryViolet} />
                <Text style={styles.loadingText}>Loading Financial Snapshot...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: Colors.headerColor }]}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.headerColor} />
            
            <ScreenHeader
                navigation={navigation}
                title="My Passbook"
                safeAreaTopInset={insets.top}
            />

            {/* Scrollable Main Content Area */}
            <ScrollView 
                style={styles.mainContentContainer}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.contentArea}>
                    
                    {/* Header Text */}
                    <Text style={styles.mainTitle}>Your Financial Snapshot <FontAwesome5 name="chart-area" size={18} color={Colors.primaryViolet} /></Text>
                    <Text style={styles.subtitle}>
                        A quick, centralized view of your total investments and returns.
                    </Text>

                    {/* Summary Cards */}
                    <View style={styles.summaryCardsColumn}>
                        {summaryData.map((data, index) => (
                            <SummaryCard
                                key={data.label}
                                {...data}
                                index={index} // Pass index for sequential animation
                            />
                        ))}
                    </View>
                    
                    {/* Group Summary Footer */}
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Group Summary</Text>
                        <TouchableOpacity
                            onPress={handleGoToMyGroups} // Calls the updated function
                            style={styles.viewAllButton}
                        >
                            <Text style={styles.viewAllText}>
                                View All Details <Ionicons name="arrow-forward" size={16} color={Colors.secondaryViolet} />
                            </Text>
                        </TouchableOpacity>
                    </View>
                    
                    {/* Detailed Info Box (Call to Action) */}
                    <View style={styles.summaryListPlaceholder}>
                        <Text style={styles.summaryListText}>
                            Find detailed payment and profit reports for each group on the **My Groups** screen.
                        </Text>
                        <TouchableOpacity 
                            style={styles.goToGroupsButton}
                            onPress={handleGoToMyGroups} // Calls the updated function
                        >
                            <Text style={styles.goToGroupsButtonText}>Go to My Groups</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Data Error Display */}
                    {dataError && (
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorText}>⚠️ Attention</Text>
                            <Text style={styles.errorSubText}>{dataError}</Text>
                            {/* Refresh button only visible if not currently loading and a user is set */}
                            {!isLoadingData && currentUserId && (
                                <TouchableOpacity onPress={fetchAllOverview} style={styles.refreshButton}>
                                    <Text style={styles.refreshButtonText}>Refresh Data</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}

                </View>
            </ScrollView>
            <Toast />
        </SafeAreaView>
    );
};

// ===============================================
// --- STYLESHEET (PROFESSIONAL MATCH) ---
// ===============================================
const styles = StyleSheet.create({
    // --- General Layout & Safe Area ---
    safeArea: { 
        flex: 1, 
        backgroundColor: Colors.headerColor, 
    },
    loadingScreen: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.background,
    },
    loadingText: {
        marginTop: 15,
        fontSize: 16,
        color: Colors.primaryViolet,
        fontWeight: "600",
    },
    mainContentContainer: {
        flex: 1,
        backgroundColor: Colors.background,
        // The overlap effect: move the content up to cover the header's padding
        marginTop: -15, 
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        overflow: 'hidden',
    },
    scrollContent: {
        paddingBottom: 40, // Ensure content isn't cut off by notch/bottom bar
    },
    contentArea: {
        paddingHorizontal: 20,
        paddingVertical: 30,
        alignItems: "center",
    },
    
    // --- Header Styles ---
    headerGradient: {
        width: '100%',
        paddingBottom: 15, 
    },
    animatedHeaderWrapper: {
        paddingHorizontal: 15,
    },
    headerContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingBottom: 10,
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: "bold",
        color: Colors.white,
        flex: 1,
        textAlign: 'center',
        paddingLeft: 20, // Offset for the back button
    },
    infoIconContainer: {
        padding: 5,
    },

    // --- Typography & Section Headers ---
    mainTitle: {
        fontSize: 20, 
        fontWeight: "700",
        color: Colors.darkText,
        marginBottom: 8,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 13,
        color: Colors.mediumText,
        marginBottom: 30,
        textAlign: "center",
        lineHeight: 18,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        paddingHorizontal: 5,
        marginBottom: 10,
        marginTop: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: Colors.darkText,
    },
    viewAllButton: {
        paddingVertical: 5,
        paddingHorizontal: 10,
    },
    viewAllText: {
        color: Colors.secondaryViolet,
        fontSize: 14,
        fontWeight: "700",
    },

    // --- Summary Cards ---
    summaryCardsColumn: {
        width: "100%",
        gap: 15, // Use gap for clean spacing
        marginBottom: 30,
    },
    summaryCard: {
        width: "100%",
        borderRadius: 15, // Slightly more rounded
        overflow: 'hidden', 
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25, // Increased shadow for depth
        shadowRadius: 5.46,
        elevation: 8,
    },
    summaryCardContent: {
        paddingVertical: 20,
        paddingHorizontal: 25,
        minHeight: 110,
        justifyContent: 'space-between',
    },
    summaryTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    cardIcon: {
        marginRight: 10,
        opacity: 0.9,
    },
    summaryLabel: {
        fontSize: 13,
        color: "#E0E0E0",
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: 0.8, // Slightly more prominent
    },
    summaryAmount: {
        fontSize: 30, // Slightly larger
        fontWeight: "900",
        color: Colors.white,
    },
    
    // --- Group Summary Placeholder/CTA ---
    summaryListPlaceholder: {
        padding: 20,
        backgroundColor: Colors.white,
        borderRadius: 15,
        width: '100%',
        marginTop: 10,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#EFEFEF',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    summaryListText: {
        fontSize: 14,
        color: Colors.mediumText,
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 22,
    },
    goToGroupsButton: {
        backgroundColor: Colors.secondaryViolet,
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 30, // Pill-shaped button
        width: '90%',
        alignItems: 'center',
        // Subtle shadow matching the theme
        shadowColor: Colors.secondaryViolet,
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 10,
    },
    goToGroupsButtonText: {
        color: Colors.white,
        fontWeight: '700',
        fontSize: 16,
    },

    // --- Error Container ---
    errorContainer: {
        backgroundColor: "#FFEBEE",
        padding: 20,
        borderRadius: 12,
        width: "100%",
        alignItems: "center",
        marginTop: 20,
        borderColor: Colors.error,
        borderWidth: 1,
    },
    errorText: {
        color: Colors.error,
        fontSize: 18,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 5,
    },
    errorSubText: {
        color: Colors.error,
        fontSize: 14,
        textAlign: "center",
        marginBottom: 10,
    },
    refreshButton: {
        marginTop: 5,
        backgroundColor: Colors.error,
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 20,
    },
    refreshButtonText: {
        color: Colors.white,
        fontWeight: 'bold',
        fontSize: 14,
    }
});

export default MyPassbookScreen;