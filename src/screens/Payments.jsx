import React, { useState, useEffect, useCallback, useContext, useRef } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    StatusBar,
    Image,
    StyleSheet,
    LayoutAnimation, 
    Platform, 
    UIManager,
    Animated,
    FlatList,
    Dimensions,
    Easing, 
    SafeAreaView,
    Alert, 
    Vibration, 
} from "react-native";
import url from "../data/url";
import axios from "axios";
import { FontAwesome5, Ionicons, MaterialCommunityIcons, AntDesign } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
// Assuming these asset paths are correct:
import NoGroupImage from "../../assets/Nogroup.png"; 
import { ContextProvider } from "../context/UserProvider"; 
import profileImage from "../../assets/profile (2).png";


// Enable LayoutAnimation on Android
if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

const { width, height } = Dimensions.get('window');

// ===============================================
// --- PROFESSIONAL VIOLET THEME & COLORS ---
// ===============================================
const Colors = {
    // Core App Theme
    primaryViolet: "#4A148C",       // Deep Violet (Main App Color)
    secondaryViolet: "#7B1FA2",     // Medium Violet (Accent)
    vibrantPurple: "#9C27B0",       // **NEW:** Vibrant Purple for active card gradient 
    darkText: "#212121",            // Dark Charcoal
    mediumText: "#757575",          // Medium Grey
    background: "#F0F0F5",          // Light Background Grey
    white: "#FFFFFF",
    error: "#C62828",               // Dark Red for removed
    success: "#2E7D32",             // Dark Green for completed
    profitGreen: '#4CAF50',
    lightViolet: "#E1BEE7",         // Very Light Violet for progress bar base
    
    // Header Gradient - Deep Indigo/Violet
    headerGradientStart: '#1A0033', 
    headerGradientEnd: '#4A148C',   
    
    // Summary Card Gradient Colors
    investmentStart: '#1C313A',     // Dark Slate Blue
    investmentEnd: '#455A64',       // Medium Slate Grey
    profitStart: '#4CAF50',
    profitEnd: '#2E7D32',
};

// ===============================================
// --- UTILITY FUNCTIONS ---
// ===============================================
const formatNumberIndianStyle = (num) => {
    if (num === null || num === undefined) return "0";
    const numValue = Number(num);
    // Ensure 2 decimal places are used for financial numbers
    const parts = numValue.toFixed(2).toString().split(".");
    let integerPart = parts[0];
    let decimalPart = parts.length > 1 ? "." + parts[1] : "";
    let isNegative = false;
    if (integerPart.startsWith("-")) {
        isNegative = true;
        integerPart = integerPart.substring(1);
    }
    // Logic for Indian number grouping (XXX,XX,XX,XXX)
    let lastThree = integerPart.slice(-3);
    let otherNumbers = integerPart.slice(0, -3);
    const formattedOther = otherNumbers
        ? otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + ","
        : "";
    return (isNegative ? "-" : "") + formattedOther + lastThree + decimalPart;
};

const calculatePaidPercentage = (group_value, paid_amount) => {
    if (!group_value || !paid_amount) return 0;
    return Math.min(100, Math.round((paid_amount / group_value) * 100));
};

// ===============================================
// --- CUSTOMER HEADER COMPONENT ---
// ===============================================
const AppHeader = ({ userId, navigation, safeAreaTopInset }) => {
    const [userData, setUserData] = useState({
        full_name: "",
        phone_number: "",
    });

    const headerAnim = useRef(new Animated.Value(-height * 0.2)).current; 

    const fetchUserData = useCallback(async () => {
        try {
            if (userId) {
                const response = await axios.get(
                    `${url}/user/get-user-by-id/${userId}`
                );
                setUserData(response.data);
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    }, [userId]);

    useEffect(() => {
        fetchUserData();
        Animated.timing(headerAnim, {
            toValue: 0, 
            duration: 800, 
            easing: Easing.out(Easing.ease), 
            useNativeDriver: true, 
        }).start();
    }, [fetchUserData, headerAnim]); 

    const handleInfoIconPress = () => {
        Alert.alert(
            "Report Issue",
            "For technical support or to report an issue, please navigate to the Contact page.",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Go to Contact", onPress: () => navigation.navigate("ContactScreen") }
            ]
        );
    };

    return (
        <LinearGradient 
            colors={[Colors.headerGradientStart, Colors.headerGradientEnd]} 
            style={styles.headerGradient}
        >
            <Animated.View 
                style={[
                    styles.animatedHeaderWrapper,
                    { transform: [{ translateY: headerAnim }] },
                ]}
            >
                <View style={[styles.headerContainer, { paddingTop: safeAreaTopInset + 5 }]}>
                    
                    <View style={styles.leftContainer}>
                        
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            style={styles.backButton}
                        >
                            <Ionicons name="arrow-back" size={26} color={Colors.white} />
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                            style={styles.profileContainer}
                            onPress={() =>
                                navigation.navigate("BottomTab", {
                                    screen: "ProfileScreen",
                                    params: { userId: userId },
                                })
                            }
                        >
                            <Image
                                source={profileImage} 
                                style={styles.profileImage}
                                resizeMode="cover"
                            />
                            <View style={{ flex: 1, overflow: 'hidden' }}> 
                                <Text style={styles.profileName} numberOfLines={1}>
                                    {userData.full_name || "Guest User"}
                                </Text>
                                <Text style={styles.customerId}>
                                    {userData.phone_number || "ID: --"}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        onPress={handleInfoIconPress}
                        style={styles.infoIconContainer}
                    >
                        <AntDesign name="infocirlceo" size={20} color={Colors.white} />
                    </TouchableOpacity>
                    
                </View>
            </Animated.View>
        </LinearGradient>
    );
};

// ===============================================
// --- CUSTOMER GROUP CARD COMPONENT (UNIQUE) ---
// ===============================================
const CustomerGroupCard = ({ 
    card, 
    onPress, 
    individualPaidAmount, 
    paidPercentage, 
    isHighlighted,
    scaleAnim,
    slideAnim,
}) => {
    const isDeleted = card.deleted; 
    const isCompleted = card.completed;
    const groupReportKey = `${card.group_id?._id || card.group_id}-${card.tickets}`;
    const individualProfitAmount = card.individualGroupReports?.[groupReportKey]?.totalProfit || 0;
    
    // **UNIQUE ENHANCEMENT: Tilt Animation for Highlight**
    const tiltAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (isHighlighted) {
            // Apply slight tilt and scale effect on highlight
            Animated.sequence([
                Animated.timing(tiltAnim, { toValue: 1, duration: 150, useNativeDriver: true, easing: Easing.out(Easing.ease) }),
                Animated.timing(tiltAnim, { toValue: 0, duration: 2000, useNativeDriver: true, easing: Easing.elastic(1) }),
            ]).start();
        }
    }, [isHighlighted, tiltAnim]);

    const rotateZ = tiltAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '1.5deg'], // Subtle Tilt
    });
    const cardScale = tiltAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.02], // Subtle Pop
    });
    // **END UNIQUE ENHANCEMENT**

    const activeCardGradient = [Colors.vibrantPurple, Colors.secondaryViolet];

    const gradientColors = isDeleted
        ? ["#EEEEEE", "#BDBDBD"] // Light Grey for Deleted
        : isCompleted
        ? [Colors.profitStart, Colors.profitEnd] // Green for Completed
        : activeCardGradient; // Vibrant Purple for Active

    const titleColor = isDeleted 
        ? Colors.error 
        : isCompleted 
        ? Colors.darkText 
        : Colors.darkText;

    const iconBgColor = isDeleted 
        ? "#BDBDBD" 
        : isCompleted 
        ? Colors.profitEnd 
        : Colors.primaryViolet;

    return (
        <TouchableOpacity
            onPress={() => onPress(card.group_id._id, card.tickets)}
            disabled={isDeleted}
            style={styles.cardTouchable}
        >
            <Animated.View style={[
                styles.cardGradientWrapper,
                isHighlighted && styles.highlightedCard,
                { 
                    transform: [{ rotateZ }, { scale: cardScale }],
                }
            ]}>
                <LinearGradient 
                    colors={gradientColors} 
                    style={styles.cardGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <View style={styles.cardInner}>
                        
                        {/* Header and Status */}
                        <View style={styles.cardHeader}>
                            <View style={[styles.iconCircle, { backgroundColor: iconBgColor }]}>
                                <MaterialCommunityIcons 
                                    name="currency-inr" 
                                    size={24} 
                                    color={Colors.white} 
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.cardTitle, { color: titleColor }]} numberOfLines={1}>
                                    {card.group_id.group_name}
                                </Text>
                                <Text style={styles.ticketText}>Ticket: {card.tickets}</Text>
                                {isDeleted && <Text style={styles.removalReason}>STATUS: Removed ({card.removal_reason?.toUpperCase() !== "OTHERS" ? card.removal_reason : "Unknown"})</Text>}
                                {isCompleted && <Text style={styles.completedTextLabel}>STATUS: Completed</Text>}
                            </View>
                            <Ionicons name="chevron-forward" size={24} color={Colors.mediumText} />
                        </View>

                        {/* Progress Bar */}
                        <View style={{ opacity: isDeleted ? 0.6 : 1, marginTop: 5 }}>
                            <View style={styles.progressHeader}>
                                <Text style={styles.progressText}>Funding Progress</Text>
                                <Text style={styles.progressTextBold}>{paidPercentage}% Paid</Text>
                            </View>
                            <View style={styles.progressBar}>
                                <View style={{ 
                                    width: `${paidPercentage}%`, 
                                    height: '100%', 
                                    borderRadius: 10, 
                                    backgroundColor: isCompleted ? Colors.success : Colors.secondaryViolet,
                                }} />
                            </View>
                        </View>

                        {/* Amount Details */}
                        <View style={styles.amountRow}>
                            <View style={styles.amountColumn}>
                                <Text style={styles.amountLabel}>Total Value</Text>
                                <Text style={styles.amountValue}>₹ {formatNumberIndianStyle(card.group_id.group_value)}</Text>
                            </View>
                            <View style={styles.amountColumn}>
                                <Text style={styles.amountLabel}>You Paid</Text>
                                <Text style={[styles.amountValue, { color: Colors.secondaryViolet }]}>₹ {formatNumberIndianStyle(individualPaidAmount)}</Text>
                            </View>
                            <View style={styles.amountColumn}>
                                <Text style={styles.amountLabel}>Profit/Div.</Text>
                                <Text style={[styles.amountValue, { color: Colors.profitGreen }]}>₹ {formatNumberIndianStyle(individualProfitAmount)}</Text>
                            </View>
                        </View>
                        
                        {/* Animated Payments Button */}
                        <LinearGradient 
                            colors={[Colors.primaryViolet, Colors.headerGradientEnd]} 
                            style={styles.paymentsButtonGradient}
                        >
                            <View style={styles.paymentsButton}>
                                <Text style={styles.paymentsButtonText}>View Payments & Details</Text>
                                <Animated.View style={{ transform: [{ scale: scaleAnim }, { translateX: slideAnim }] }}>
                                    <Ionicons name="arrow-forward-circle-outline" size={22} color={Colors.white} />
                                </Animated.View>
                            </View>
                        </LinearGradient>

                    </View>
                </LinearGradient>
            </Animated.View>
        </TouchableOpacity>
    );
};


// ===============================================
// --- MY GROUPS MAIN COMPONENT ---
// ===============================================
const Mygroups = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const [appUser] = useContext(ContextProvider);
    const userId = appUser?.userId || {};
    const [cardsData, setCardsData] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [Totalpaid, setTotalPaid] = useState(null); 
    const [Totalprofit, setTotalProfit] = useState(null); 
    
    const [individualGroupReports, setIndividualGroupReports] = useState({});
    const [highlightedCardIndex, setHighlightedCardIndex] = useState(null);
    
    const flatListRef = useRef(null); 
    
    // --- Animation Refs (Payments Button Pulse) ---
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const slideAnim = useRef(new Animated.Value(0)).current;

    // --- Animation Refs (Navigation Buttons Scale) ---
    const auctionScaleAnim = useRef(new Animated.Value(1)).current;
    const insuranceScaleAnim = useRef(new Animated.Value(1)).current;

    // Payments Button Animation Effect
    useEffect(() => {
        const pulseAndSlide = () => {
            Animated.loop(
                Animated.parallel([
                    Animated.sequence([
                        Animated.timing(scaleAnim, { toValue: 1.1, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
                        Animated.timing(scaleAnim, { toValue: 1, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
                    ]),
                    Animated.sequence([
                        Animated.timing(slideAnim, { toValue: 3, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
                        Animated.timing(slideAnim, { toValue: 0, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
                    ]),
                ])
            ).start();
        };
        pulseAndSlide();
    }, [scaleAnim, slideAnim]);
    
    // Navigation Button Press Handlers
    const handlePressIn = (anim) => {
        Animated.timing(anim, { toValue: 0.95, duration: 100, useNativeDriver: true }).start();
    };

    const handlePressOut = (anim, callback) => {
        Animated.timing(anim, { toValue: 1, duration: 150, useNativeDriver: true }).start(() => {
            if (callback) callback();
        });
    };

    // --- Data Fetching and Initialization ---
    const fetchTickets = useCallback(async () => {
        if (!userId) { setCardsData([]); return; }
        try {
            const response = await axios.get(`${url}/enroll/users/${userId}`);
            setCardsData(response.data || []);
        } catch (error) {
            console.error("Error fetching tickets:", error);
            setCardsData([]);
        }
    }, [userId]);

    const fetchAllOverview = useCallback(async () => {
        if (!userId) return;
        try {
            const response = await axios.post(`${url}/enroll/get-user-tickets-report/${userId}`);
            const data = response.data;
            
            setTotalPaid(data.reduce((sum, g) => sum + (g?.payments?.totalPaidAmount || 0), 0));
            setTotalProfit(data.reduce((sum, g) => sum + (g?.profit?.totalProfit || 0), 0));

            const reportsMap = {};
            data.forEach((groupReport) => {
                if (groupReport.enrollment && groupReport.enrollment.group && groupReport.enrollment.tickets !== undefined) {
                    const key = `${groupReport.enrollment.group._id || groupReport.enrollment.group}-${groupReport.enrollment.tickets}`;
                    reportsMap[key] = {
                        totalPaid: groupReport.payments?.totalPaidAmount || 0,
                        totalProfit: groupReport.profit?.totalProfit || 0,
                    };
                }
            });
            setIndividualGroupReports(reportsMap);
        } catch (error) {
            if (error.response?.status === 404) {
                setTotalPaid(0);
                setTotalProfit(0);
                setIndividualGroupReports({});
            } else {
                console.error(error);
            }
        }
    }, [userId]);

    const loadData = useCallback(async () => {
        setLoading(true);
        if (userId) {
            await Promise.all([fetchTickets(), fetchAllOverview()]);
        } else {
            setCardsData([]);
            setTotalPaid(null);
            setTotalProfit(null);
            setIndividualGroupReports({});
        }
        setLoading(false);
    }, [userId, fetchTickets, fetchAllOverview]);

    useEffect(() => { loadData(); }, [loadData]);
    useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

    // --- List Preparation ---
    const filteredCards = cardsData.filter((card) => card.group_id !== null);
    const activeCards = filteredCards.filter(c => !c.deleted);
    
    // --- Scroll and Highlight (For external navigation) ---
    const handleScrollToCard = (groupId, ticket) => {
        const index = activeCards.findIndex(c => 
            (c.group_id._id === groupId || c.group_id === groupId) && c.tickets === ticket
        );

        if (index !== -1 && flatListRef.current) {
            flatListRef.current.scrollToIndex({ animated: true, index: index, viewPosition: 0.1 });

            // Using LayoutAnimation for non-animated changes like border and shadow
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setHighlightedCardIndex(index); 
            Vibration.vibrate(50); 

            setTimeout(() => { setHighlightedCardIndex(null); }, 3000); 
        }
    };

    const handleCardPress = (groupId, ticket) => {
        // Stop the looping animation on tap for a cleaner transition
        scaleAnim.stopAnimation();
        slideAnim.stopAnimation();

        // Quick tap animation before navigating
        Animated.sequence([
            Animated.parallel([
                Animated.timing(scaleAnim, { toValue: 1.1, duration: 100, useNativeDriver: true }),
                Animated.timing(slideAnim, { toValue: 3, duration: 100, useNativeDriver: true }),
            ]),
            Animated.parallel([
                Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
                Animated.timing(slideAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
            ]),
        ]).start(() => {
            navigation.navigate("BottomTab", {
                screen: "EnrollTab",
                params: { screen: "EnrollGroup", params: { userId, groupId, ticket } },
            });
        });
    };
    
    // Summary display logic
    const displayTotalProfit = Totalpaid === null || Totalpaid === 0 ? 0 : Totalprofit; 
    const paidDisplay = Totalpaid !== null ? `₹ ${formatNumberIndianStyle(Totalpaid)}` : '...';
    const profitDisplay = Totalprofit !== null ? `₹ ${formatNumberIndianStyle(displayTotalProfit)}` : '...';

    // Render item for FlatList
    const renderCard = ({ item, index }) => {
        const groupIdFromCard = item.group_id?._id || item.group_id;
        const groupReportKey = `${groupIdFromCard}-${item.tickets}`;
        const individualPaidAmount = individualGroupReports[groupReportKey]?.totalPaid || 0;
        const paidPercentage = calculatePaidPercentage(item.group_id.group_value, individualPaidAmount);
        
        return (
            <CustomerGroupCard
                card={{...item, individualGroupReports}}
                onPress={handleCardPress}
                individualPaidAmount={individualPaidAmount}
                paidPercentage={paidPercentage}
                isHighlighted={index === highlightedCardIndex}
                scaleAnim={scaleAnim} 
                slideAnim={slideAnim}
            />
        );
    };

    // Render loading/empty state
    const renderContent = () => {
        if (loading) {
            return (
                <View style={styles.fullScreenLoader}>
                    <ActivityIndicator size="large" color={Colors.primaryViolet} />
                    <Text style={styles.loadingText}>Loading your groups...</Text>
                </View>
            );
        }

        if (activeCards.length === 0) {
            return (
                <View style={styles.noGroupContainer}>
                    <View style={styles.noGroupWrapper}>
                        <Image source={NoGroupImage} style={styles.noGroupImage} resizeMode="contain" />
                        <Text style={styles.noGroupText}>No Active Enrollments Found</Text>
                        <Text style={styles.noGroupSubText}>
                            It looks like you haven't joined any active groups yet.
                        </Text>
                        <TouchableOpacity 
                            onPress={() => navigation.navigate('EnrollTab')} 
                            style={styles.discoverButton}
                        >
                            <MaterialCommunityIcons name="rocket-launch-outline" size={20} color={Colors.white} style={{ marginRight: 8 }} />
                            <Text style={styles.discoverButtonText}>Explore New Groups</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            );
        }
        
        return (
            <FlatList
                ref={flatListRef}
                data={activeCards}
                renderItem={renderCard}
                keyExtractor={(item, index) => `${item.group_id?._id || item.group_id}-${item.tickets}-${index}`}
                contentContainerStyle={styles.flatListContent}
                showsVerticalScrollIndicator={false}
                initialNumToRender={5}
                maxToRenderPerBatch={10}
            />
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.headerGradientStart} />
            
            <AppHeader userId={userId} navigation={navigation} safeAreaTopInset={insets.top} />

            <View style={styles.mainWrapper}>
                
                <Text style={styles.title}>My Groups & Enrollments</Text>

                {/* Fixed Summary Cards (Professional Look) */}
                <View style={styles.fixedSummaryWrapper}>
                    <LinearGradient colors={[Colors.investmentStart, Colors.investmentEnd]} style={styles.summaryCardLeft}>
                        <FontAwesome5 name="wallet" size={20} color={Colors.white} />
                        <Text style={styles.summaryAmount}>{paidDisplay}</Text>
                        <Text style={styles.summaryText}>Total Investment</Text>
                    </LinearGradient>

                    <LinearGradient colors={[Colors.profitStart, Colors.profitEnd]} style={styles.summaryCardRight}>
                        <FontAwesome5 name="chart-line" size={20} color={Colors.white} />
                        <Text style={styles.summaryAmount}>{profitDisplay}</Text>
                        <Text style={styles.summaryText}>Total Dividend/Profit</Text>
                    </LinearGradient>
                </View>

                {/* Navigation Buttons (Refined Style) */}
                <View style={[styles.navigationButtonsContainer, { paddingHorizontal: 20 }]}>
                    <TouchableOpacity
                        style={styles.navButton}
                        onPressIn={() => handlePressIn(auctionScaleAnim)}
                        onPressOut={() => handlePressOut(auctionScaleAnim, () => { /* Add Auction Navigation */ })}
                    >
                        <Animated.View style={[styles.navButtonGradient, { transform: [{ scale: auctionScaleAnim }] }]}>
                            <LinearGradient
                                colors={[Colors.secondaryViolet, Colors.primaryViolet]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={StyleSheet.absoluteFillObject}
                            />
                            <Text style={styles.navButtonText}>View Auction</Text>
                        </Animated.View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.navButton}
                        onPressIn={() => handlePressIn(insuranceScaleAnim)}
                        onPressOut={() => handlePressOut(insuranceScaleAnim, () => { /* Add Insurance Navigation */ })}
                    >
                        <Animated.View style={[styles.navButtonGradient, { transform: [{ scale: insuranceScaleAnim }] }]}>
                            <LinearGradient
                                colors={[Colors.investmentEnd, Colors.investmentStart]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={StyleSheet.absoluteFillObject}
                            />
                            <Text style={styles.navButtonText}>View Insurance</Text>
                        </Animated.View>
                    </TouchableOpacity>
                </View>

                {/* Group List Content */}
                <View style={styles.scrollWrapper}>
                    {renderContent()}
                </View>

            </View>
        </SafeAreaView>
    );
};

// ===============================================
// --- STYLESHEET (UPDATED) ---
// ===============================================
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    
    // --- Header Styles ---
    headerGradient: { width: '100%', paddingBottom: 15, zIndex: 10 },
    animatedHeaderWrapper: { paddingHorizontal: 15 },
    headerContainer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    leftContainer: { flexDirection: "row", alignItems: "center", flex: 1 },
    backButton: { paddingRight: 15, paddingVertical: 5 },
    profileContainer: { 
        flexDirection: "row", 
        alignItems: "center", 
        padding: 5, 
        borderRadius: 20, 
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        flex: 1, 
        marginRight: 10, 
    },
    profileImage: { width: 36, height: 36, borderRadius: 18, marginRight: 10, borderWidth: 2, borderColor: Colors.lightViolet },
    profileName: { fontSize: 14, fontWeight: "bold", color: Colors.white, },
    customerId: { fontSize: 10, color: Colors.lightViolet },
    infoIconContainer: { padding: 8, borderRadius: 15, backgroundColor: 'rgba(255, 255, 255, 0.1)' },
    // --- End Header Styles ---

    mainWrapper: { flex: 1, backgroundColor: Colors.background, overflow: "hidden" },
    
    fullScreenLoader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.white, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
    loadingText: { marginTop: 10, fontSize: 16, color: Colors.mediumText },

    title: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginTop: 15, marginBottom: 10, color: Colors.darkText },
    
    // --- Summary Card Styles (Refined) ---
    fixedSummaryWrapper: { 
        flexDirection: "row", 
        justifyContent: "space-between", 
        paddingHorizontal: 20, 
        paddingBottom: 10, 
        zIndex: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    summaryCardLeft: { flex: 1, marginRight: 8, borderRadius: 12, padding: 15, alignItems: "center", justifyContent: 'center', },
    summaryCardRight: { flex: 1, marginLeft: 8, borderRadius: 12, padding: 15, alignItems: "center", justifyContent: 'center', },
    summaryAmount: { color: Colors.white, fontSize: 17, fontWeight: "900", marginTop: 5 },
    summaryText: { color: Colors.white, fontSize: 10, textAlign: "center", marginTop: 3 },
    
    // --- NAVIGATION BUTTON STYLES (Refined) ---
    navigationButtonsContainer: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20, marginTop: 5 },
    navButton: { flex: 1, marginHorizontal: 5, borderRadius: 12, overflow: 'hidden', elevation: 4 },
    navButtonGradient: { paddingVertical: 14, alignItems: 'center', justifyContent: 'center' }, 
    navButtonText: { color: Colors.white, fontSize: 14, fontWeight: '900', textAlign: 'center' }, 
    // -----------------------------------
    
    scrollWrapper: { flex: 1, backgroundColor: Colors.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, overflow: 'hidden' },
    flatListContent: { padding: 20, paddingBottom: 100 },

    // --- Card Styles (Refined) ---
    cardTouchable: { marginVertical: 8 },
    cardGradientWrapper: { 
        borderRadius: 18, 
        overflow: 'hidden', 
        shadowColor: Colors.darkText, 
        shadowOffset: { width: 0, height: 4 }, 
        shadowOpacity: 0.15, 
        shadowRadius: 8, 
        elevation: 6 
    },
    // Enhanced Highlight Effect
    highlightedCard: { borderWidth: 3, borderColor: Colors.vibrantPurple, borderRadius: 20, shadowColor: Colors.vibrantPurple, shadowOpacity: 0.8, shadowRadius: 10, elevation: 15 },
    cardGradient: { borderRadius: 18, padding: 1 },
    cardInner: { borderRadius: 17, padding: 15, backgroundColor: Colors.white, },
    cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 15, justifyContent: 'space-between' },
    iconCircle: { width: 45, height: 45, borderRadius: 22.5, justifyContent: "center", alignItems: "center", marginRight: 15, flexShrink: 0 },
    cardTitle: { fontSize: 17, fontWeight: "900", color: Colors.darkText },
    ticketText: { fontSize: 12, color: Colors.mediumText, marginTop: 2 },
    removalReason: { fontSize: 11, color: Colors.error, marginTop: 2, fontWeight: '600' },
    completedTextLabel: { fontSize: 11, color: Colors.success, fontWeight: "600", marginTop: 2 },

    progressHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 5, marginTop: 5 },
    progressText: { fontSize: 12, color: Colors.mediumText },
    progressTextBold: { fontSize: 12, fontWeight: "900", color: Colors.darkText },
    progressBar: { height: 8, backgroundColor: Colors.lightViolet, borderRadius: 10, marginBottom: 15 }, 

    amountRow: { flexDirection: "row", justifyContent: "space-around", borderTopWidth: 1, borderTopColor: Colors.background, paddingTop: 10 },
    amountColumn: { alignItems: "center", flex: 1 },
    amountLabel: { fontSize: 11, color: Colors.mediumText, marginBottom: 4 },
    amountValue: { fontSize: 15, fontWeight: "900", color: Colors.darkText },
    
    paymentsButtonGradient: { borderRadius: 10, marginTop: 15, elevation: 3 },
    paymentsButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 15 },
    paymentsButtonText: { fontSize: 14, fontWeight: '700', color: Colors.white, marginRight: 8 },
    // --- End Card Styles ---

    // --- NO GROUP STYLES ---
    noGroupContainer: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        paddingHorizontal: 20,
    },
    noGroupWrapper: { 
        padding: 30, 
        backgroundColor: Colors.white, 
        borderRadius: 15, 
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    noGroupImage: { 
        width: width * 0.5, 
        height: width * 0.4, 
        marginBottom: 20 
    },
    noGroupText: { 
        fontSize: 18, 
        fontWeight: 'bold', 
        color: Colors.darkText, 
        marginBottom: 8 
    },
    noGroupSubText: { 
        fontSize: 14, 
        color: Colors.mediumText, 
        textAlign: 'center', 
        marginBottom: 25 
    },
    discoverButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.secondaryViolet,
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 25,
        elevation: 5,
    },
    discoverButtonText: {
        color: Colors.white,
        fontWeight: '700',
        fontSize: 15,
    }
});

export default Mygroups;