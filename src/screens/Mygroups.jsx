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
} from "react-native";
import url from "../data/url";
import axios from "axios";
import { FontAwesome5, Ionicons, MaterialCommunityIcons, AntDesign } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import NoGroupImage from "../../assets/Nogroup.png"; 
import { ContextProvider } from "../context/UserProvider"; 
import profileImage from "../../assets/profile (2).png";
// Ensure all necessary dependencies are imported or assumed to be available:
// - @expo/vector-icons (for icons)
// - @react-navigation/native (for useFocusEffect)
// - react-native-safe-area-context (for useSafeAreaInsets)
// - expo-linear-gradient (for LinearGradient)
// - axios (for API calls)

// Enable LayoutAnimation on Android
if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

const { width, height } = Dimensions.get('window');

// --- UNIFIED PROFESSIONAL VIOLET THEME & COLORS ---
const Colors = {
    // Core App Theme
    primaryViolet: "#5A189A",     
    secondaryViolet: "#9D4EDD",   
    darkText: "#0F0A1F",          
    mediumText: "#5C586B",        
    background: "#F8F7F9",        
    white: "#FFFFFF",
    error: "#E74C3C",             
    success: "#2ECC71",           
    profitDarkGreen: '#1E8449',
    lightViolet: "#E0AAFF",
    
    // Header Gradient - Deep Indigo/Violet
    headerGradientStart: '#2A0050', 
    headerGradientEnd: '#5A189A',   
    
    // Summary Card Gradient Colors
    investmentStart: '#0F1A3A',   
    investmentEnd: '#293C70',     
};

// Util for Indian Number Formatting
const formatNumberIndianStyle = (num) => {
    if (num === null || num === undefined) return "0";
    const parts = num.toString().split(".");
    let integerPart = parts[0];
    let decimalPart = parts.length > 1 ? "." + parts[1] : "";
    let isNegative = false;
    if (integerPart.startsWith("-")) {
        isNegative = true;
        integerPart = integerPart.substring(1);
    }
    const lastThree = integerPart.slice(-3);
    const otherNumbers = integerPart.slice(0, -3);
    const formattedOther = otherNumbers
        ? otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + ","
        : "";
    return (isNegative ? "-" : "") + formattedOther + lastThree + decimalPart;
};

// ===============================================
// --- HEADER COMPONENT (Fixed) ---
// ===============================================
const Header = ({ userId, navigation, safeAreaTopInset }) => {
    const [userData, setUserData] = useState({
        full_name: "",
        phone_number: "",
        address: "",
    });

    const headerAnim = useRef(new Animated.Value(-height * 0.2)).current; 

    useEffect(() => {
        const fetchUserData = async () => {
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
        };

        fetchUserData();

        Animated.timing(headerAnim, {
            toValue: 0, 
            duration: 1000, 
            easing: Easing.out(Easing.ease), 
            useNativeDriver: true, 
        }).start();
    }, [userId]); 

    const handleInfoIconPress = () => {
        Alert.alert(
            "Report Issue",
            "Please go to the Contact page and report your issue.",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                { 
                    text: "Go to Contact", 
                    onPress: () => navigation.navigate("ContactScreen") 
                }
            ]
        );
    };

    return (
        <Animated.View 
            style={[
                customerStyles.animatedHeaderWrapper,
                { transform: [{ translateY: headerAnim }] },
            ]}
        >
            {/* The inner header content container now gets the dynamic padding for the status bar */}
            <View style={[customerStyles.headerContainer, { paddingTop: safeAreaTopInset + 5 }]}>
                
                <View style={customerStyles.leftContainer}>
                    
                    {/* --- BACK BUTTON (Cleaned Spacing) --- */}
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={customerStyles.backButton}
                    >
                        <Ionicons name="arrow-back" size={28} color="#fff" />
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        style={customerStyles.profileContainer}
                        onPress={() =>
                            navigation.navigate("BottomTab", {
                                screen: "ProfileScreen",
                                params: { userId: userId },
                            })
                        }
                    >
                        <Image
                            source={profileImage} 
                            style={customerStyles.profileImage}
                            resizeMode="cover"
                        />
                        <View>
                            <Text style={customerStyles.profileName}>
                                {userData.full_name || "Guest"}
                            </Text>
                            <Text style={customerStyles.customerId}>
                                {userData.phone_number || "ID: --"}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* --- INFO ICON (Tucked in) --- */}
                <TouchableOpacity
                    onPress={handleInfoIconPress}
                    style={customerStyles.infoIconContainer}
                >
                    <AntDesign name="infocirlceo" size={22} color="#fff" />
                </TouchableOpacity>
                
            </View>
        </Animated.View>
    );
};

// ===============================================
// --- CUSTOMER GROUP CARD COMPONENT ---
// ===============================================
const CustomerGroupCard = React.forwardRef(({ 
    card, 
    onPress, 
    individualPaidAmount, 
    paidPercentage, 
    isHighlighted,
}, ref) => {
    const isDeleted = card.deleted; 
    const isCompleted = card.completed;
    const highlightAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (isHighlighted) {
            Animated.sequence([
                Animated.timing(highlightAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
                Animated.delay(2000),
                Animated.timing(highlightAnim, { toValue: 0, duration: 300, useNativeDriver: true })
            ]).start();
        }
    }, [isHighlighted, highlightAnim]);
    
    const elevationInterpolate = highlightAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [5, 12], 
    });
    
    let statusColor = Colors.primaryViolet;
    let statusText = 'ACTIVE';
    if (isCompleted) {
        statusColor = Colors.success;
        statusText = 'COMPLETED';
    } else if (isDeleted) {
        statusColor = Colors.error;
        statusText = 'REMOVED';
    }
    
    const cardStyle = {
        transform: [
            { 
                scale: highlightAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.02],
                }),
            }
        ],
        elevation: elevationInterpolate,
        shadowColor: Colors.darkText,
        ...customerStyles.card,
        ...(isDeleted ? customerStyles.cardDeleted : {}),
    };

    return (
        <Animated.View style={cardStyle}>
            <TouchableOpacity
                ref={ref}
                onPress={onPress}
                disabled={isDeleted}
                style={customerStyles.cardTouchable}
            >
                {/* Visual Status Bar (Top Accent) */}
                <View style={[customerStyles.statusBarTop, { backgroundColor: statusColor }]} />

                <View style={customerStyles.cardContent}>
                    
                    {/* Header: Name and Ticket */}
                    <View style={customerStyles.cardHeader}>
                        <Text style={[
                            customerStyles.cardTitle, 
                            { color: isDeleted ? Colors.mediumText : Colors.darkText }
                        ]} 
                        numberOfLines={1}>
                            {card.group_id.group_name}
                        </Text>
                        <View style={[customerStyles.statusPill, { backgroundColor: statusColor }]}>
                            <Text style={customerStyles.statusPillText}>{statusText}</Text>
                        </View>
                    </View>
                    
                    <Text style={customerStyles.ticketText}>
                        <MaterialCommunityIcons name="ticket" size={14} color={Colors.mediumText} />
                        &nbsp;Ticket No: <Text style={{ fontWeight: '700' }}>{card.tickets}</Text>
                    </Text>

                    {/* Financial Row */}
                    <View style={customerStyles.financialRow}>
                        <View style={customerStyles.financialColumn}>
                            <Text style={customerStyles.amountLabel}>Total Group Value</Text>
                            <Text style={customerStyles.amountValue}>₹ {formatNumberIndianStyle(card.group_id.group_value)}</Text>
                        </View>
                        <View style={customerStyles.financialColumn}>
                            <Text style={customerStyles.amountLabel}>Your Contribution</Text>
                            <Text style={[customerStyles.amountValue, { color: Colors.primaryViolet }]}>
                                ₹ {formatNumberIndianStyle(individualPaidAmount)}
                            </Text>
                        </View>
                    </View>

                    {/* Progress Bar */}
                    <View style={customerStyles.progressContainer}>
                        <View style={customerStyles.progressBarWrapper}>
                            <View style={{ width: `${paidPercentage}%`, height: 8, borderRadius: 3, backgroundColor: statusColor }} />
                        </View>
                        <Text style={customerStyles.paidPercentageText}>
                            <Text style={{ fontWeight: '700', color: statusColor }}>{paidPercentage}%</Text> Paid
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
});


// ===============================================
// --- MAIN COMPONENT: Mygroups (Full Code) ---
// ===============================================
const Mygroups = ({ navigation }) => {
    const insets = useSafeAreaInsets(); // Hook for safe area insets
    const [appUser] = useContext(ContextProvider);
    const userId = appUser?.userId;
    const [cardsData, setCardsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [Totalpaid, setTotalPaid] = useState(null); 
    const [Totalprofit, setTotalProfit] = useState(null); 
    const [individualGroupReports, setIndividualGroupReports] = useState({});
    const [enrolledGroupsCount, setEnrolledGroupsCount] = useState(null);
    const [highlightedCardIndex, setHighlightedCardIndex] = useState(null);
    
    const fadeInAnim = useRef(new Animated.Value(0)).current;
    const summaryAnim = useRef(new Animated.Value(0)).current; 

    useEffect(() => {
        if (!loading) {
            Animated.timing(fadeInAnim, {
                toValue: 1,
                duration: 500,
                delay: 200,
                useNativeDriver: true,
            }).start();
            
            Animated.timing(summaryAnim, {
                toValue: 1,
                duration: 600,
                easing: Easing.out(Easing.back(1)), 
                useNativeDriver: true,
                delay: 100,
            }).start();
        }
    }, [loading, fadeInAnim, summaryAnim]); 

    const fetchTickets = useCallback(async () => {
        if (!userId) {
            setCardsData([]);
            return [];
        }
        try {
            const response = await axios.get(`${url}/enroll/users/${userId}`);
            setCardsData(response.data || []);
            return response.data || [];
        } catch (error) {
            console.error("Error fetching tickets:", error);
            setCardsData([]);
            return [];
        }
    }, [userId]);

    const fetchAllOverview = useCallback(async () => {
        if (!userId) return;
        try {
            const response = await axios.post(`${url}/enroll/get-user-tickets-report/${userId}`);
            const data = response.data;
            
            const totalPaid = data.reduce((sum, g) => sum + (g?.payments?.totalPaidAmount || 0), 0);
            const totalProfit = data.reduce((sum, g) => sum + (g?.profit?.totalProfit || 0), 0);

            setTotalPaid(totalPaid);
            setTotalProfit(totalProfit);

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
            
            const activeAndCompletedGroups = data.filter(g => !g.enrollment?.deleted);
            setEnrolledGroupsCount(activeAndCompletedGroups.length);

        } catch (error) {
            if (error.response?.status === 404) {
                setTotalPaid(0);
                setTotalProfit(0);
                setIndividualGroupReports({});
                setEnrolledGroupsCount(0);
            } else {
                console.error("Error fetching overview:", error); 
                setTotalPaid(0);
                setTotalProfit(0);
                setEnrolledGroupsCount(0);
            }
        }
    }, [userId]);

    const loadData = useCallback(async () => {
        setLoading(true);
        fadeInAnim.setValue(0); 
        summaryAnim.setValue(0); 
        if (userId) {
            await Promise.all([fetchTickets(), fetchAllOverview()]);
        } else {
            setCardsData([]);
            setEnrolledGroupsCount(0);
            setTotalPaid(0);
            setTotalProfit(0);
        }
        setLoading(false);
    }, [userId, fetchTickets, fetchAllOverview, fadeInAnim, summaryAnim]);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [loadData])
    );

    const filteredCards = cardsData.filter((card) => card.group_id !== null);
    const activeCards = filteredCards.filter(c => !c.deleted); 

    const handleCardPress = (groupId, ticket) => {
        navigation.navigate("BottomTab", {
            screen: "EnrollTab",
            params: { screen: "EnrollGroup", params: { userId, groupId, ticket } },
        });
    };
    
    const calculatePaidPercentage = (group_value, paid_amount) => {
        if (!group_value || group_value <= 0) return 0;
        return Math.min(100, Math.round((paid_amount / group_value) * 100));
    };
    
    const paidDisplay = Totalpaid !== null ? `₹ ${formatNumberIndianStyle(Totalpaid)}` : '--';
    const profitDisplay = Totalprofit !== null ? `₹ ${formatNumberIndianStyle(Totalprofit)}` : '--';
    const groupCountDisplay = enrolledGroupsCount !== null ? enrolledGroupsCount.toString() : '0';

    const renderCard = ({ item, index }) => {
        const card = item;
        const groupIdFromCard = card.group_id?._id || card.group_id;
        const groupReportKey = `${groupIdFromCard}-${card.tickets}`;
        const individualPaidAmount = individualGroupReports[groupReportKey]?.totalPaid || 0;
        
        if (!card.group_id?.group_value) return null; 

        const paidPercentage = calculatePaidPercentage(card.group_id.group_value, individualPaidAmount);
        const onPress = () => handleCardPress(card.group_id._id, card.tickets);
        
        return (
            <CustomerGroupCard
                card={card}
                onPress={onPress}
                individualPaidAmount={individualPaidAmount}
                paidPercentage={paidPercentage}
                isHighlighted={index === highlightedCardIndex}
            />
        );
    };

    // --- Summary Metric Component ---
    const SummaryMetric = ({ label, amount, iconName, isProfit, animatedStyle }) => {
        
        const gradientColors = isProfit 
            ? [Colors.profitDarkGreen, Colors.success]
            : [Colors.investmentStart, Colors.investmentEnd];

        const iconColor = isProfit ? Colors.success : Colors.primaryViolet; 
        
        const cardBorderStyle = { 
            borderColor: Colors.white, 
            borderWidth: 2,
            overflow: 'hidden', 
        };

        return (
            <Animated.View style={[{ flex: 1, marginHorizontal: 4 }, animatedStyle]}>
                <LinearGradient 
                    colors={gradientColors} 
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[customerStyles.summaryCard, cardBorderStyle]} 
                >
                    <View style={customerStyles.summaryIconCircle}>
                        <FontAwesome5 
                            name={iconName} 
                            size={20} 
                            color={iconColor} 
                        />
                    </View>
                    <View style={customerStyles.summaryTextWrapper}>
                        <Text style={customerStyles.summaryLabel_White} numberOfLines={2}>{label}</Text>
                        <Text style={customerStyles.summaryAmount_White} numberOfLines={1}>{amount}</Text>
                    </View>
                </LinearGradient>
            </Animated.View>
        );
    };
    
    // Animation styles
    const investmentCardStyle = {
        opacity: summaryAnim,
        transform: [
            {
                translateY: summaryAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-80, 0], 
                }),
            },
        ],
    };

    const profitCardStyle = {
        opacity: summaryAnim.interpolate({
            inputRange: [0, 0.5, 1], 
            outputRange: [0, 0, 1],
        }),
        transform: [
            {
                translateY: summaryAnim.interpolate({
                    inputRange: [0, 0.5, 1], 
                    outputRange: [-80, -80, 0],
                }),
            },
        ],
    };
    
    // --- Main Render ---
    return (
        <View style={customerStyles.container}>
            
            {/* --- STATUS BAR FIX: Make it translucent so the LinearGradient shows through --- */}
            <StatusBar 
                barStyle="light-content" 
                backgroundColor={Colors.headerGradientStart} 
                translucent={true} 
            />
            
            {/* Header Background (Extends to top of screen) */}
            <LinearGradient 
                colors={[Colors.headerGradientStart, Colors.headerGradientEnd]} 
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={customerStyles.topHeaderContainer} // No need for manual padding here
            >
                {/* Custom Header Component - sends the top inset for content padding */}
                <Header 
                    userId={userId} 
                    navigation={navigation} 
                    safeAreaTopInset={insets.top} 
                />

                {/* --- Summary Section (with fixed horizontal padding) --- */}
                <View style={customerStyles.summarySectionContent}>
                    <Text style={customerStyles.pageTitle}>Group Portfolio</Text>
                    
                    <View style={customerStyles.summaryRow}>
                        <SummaryMetric
                            label="Total Investment"
                            amount={paidDisplay}
                            iconName="wallet"
                            isProfit={false}
                            animatedStyle={investmentCardStyle} 
                        />
                        <SummaryMetric
                            label="Total Dividend/Profit"
                            amount={profitDisplay}
                            iconName="chart-line"
                            isProfit={true}
                            animatedStyle={profitCardStyle} 
                        />
                    </View>
                </View>
            </LinearGradient>

            {/* Main Content Wrapper */}
            <View style={customerStyles.mainWrapper}>
                
                {loading ? (
                    <View style={customerStyles.fullScreenLoader}>
                        <ActivityIndicator size="large" color={Colors.primaryViolet} />
                        <Text style={customerStyles.loadingText}>Loading your financial portfolio...</Text>
                    </View>
                ) : (
                    <Animated.View style={{ flex: 1, opacity: fadeInAnim, width: '100%' }}>
                        
                        <View style={customerStyles.groupCountBanner}>
                            <Ionicons name="people-circle" size={20} color={Colors.primaryViolet} />
                            <Text style={customerStyles.groupCountText}>
                                Enrolled in <Text style={{ fontWeight: '900', color: Colors.primaryViolet }}>{groupCountDisplay}</Text> active groups.
                            </Text>
                        </View>
                        
                        <Text style={customerStyles.sectionTitle}>Your Enrollments</Text>

                        {activeCards.length === 0 ? (
                            <View style={customerStyles.noGroupWrapper}>
                                <Image source={NoGroupImage} style={customerStyles.noGroupImage} resizeMode="contain" />
                                <Text style={customerStyles.noGroupText}>You haven't joined any groups yet!</Text>
                                <TouchableOpacity 
                                    style={customerStyles.exploreButton}
                                    onPress={() => navigation.navigate("BottomTab", { screen: "EnrollTab" })}
                                >
                                    <Text style={customerStyles.exploreButtonText}>Explore Groups Now</Text>
                                    <Ionicons name="arrow-forward" size={16} color={Colors.white} style={{ marginLeft: 8 }} />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <FlatList
                                data={activeCards}
                                keyExtractor={(item, index) => `${item.group_id?._id || index}-${item.tickets}`}
                                renderItem={renderCard}
                                contentContainerStyle={customerStyles.flatListContent}
                                showsVerticalScrollIndicator={false}
                            />
                        )}
                    </Animated.View>
                )}
            </View>
        </View>
    );
};

// --- UNIFIED STYLESHEET ---
const customerStyles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },

    // ===============================================
    // --- HEADER STYLES ---
    // ===============================================
    // This container holds the entire header gradient and extends to the very top edge.
    topHeaderContainer: {
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        paddingHorizontal: 20, // Padding for summary content below
        paddingBottom: 25,
        shadowColor: Colors.darkText,
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
        // The header must start at the very top (y:0)
        paddingTop: 0, 
    },
    animatedHeaderWrapper: {
        position: "relative",
        zIndex: 10,
    },
    // The inner content area receives dynamic padding from insets.top
    headerContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: width * 0.04, // Small padding for profile/icon spacing
        paddingBottom: height * 0.01,
        // paddingTop is set dynamically: { paddingTop: safeAreaTopInset + 5 }
    },
    leftContainer: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1, 
    },
    backButton: {
        padding: width * 0.01,
        marginRight: width * 0.02, 
    },
    profileContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    profileImage: {
        width: width * 0.1,
        height: width * 0.1,
        borderRadius: width * 0.05,
        marginRight: width * 0.015,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.5)",
    },
    profileName: {
        color: "#fff",
        fontSize: width * 0.045,
        fontWeight: "700",
    },
    customerId: {
        color: "rgba(255,255,255,0.8)",
        fontSize: width * 0.028,
    },
    // Tucked-in Info Icon
    infoIconContainer: {
        paddingVertical: width * 0.02, 
        paddingLeft: width * 0.04, 
        paddingRight: width * 0.01, 
    },
    
    // --- Summary Section ---
    summarySectionContent: {
        paddingHorizontal: 0, // Content is already horizontally contained by topHeaderContainer
    },
    pageTitle: {
        fontSize: 26,
        fontWeight: "900",
        color: Colors.white,
        marginTop: 10,
        marginBottom: 20,
        textAlign: 'left',
    },
    summaryRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 10,
    },
    summaryCard: {
        borderRadius: 15,
        padding: 15,
        alignItems: "center",
        flexDirection: 'row',
        shadowColor: Colors.darkText,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
        minHeight: 70, 
    },
    summaryIconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        opacity: 0.9,
        flexShrink: 0,
    },
    summaryTextWrapper: {
        marginLeft: 10,
        alignItems: 'flex-start',
        flex: 1, 
    },
    summaryAmount_White: { 
        fontSize: 16, 
        fontWeight: "bold", 
        color: Colors.white, 
        lineHeight: 20,
    },
    summaryLabel_White: { 
        fontSize: 10, 
        fontWeight: '600',
        color: Colors.white, 
        textTransform: 'uppercase',
        opacity: 0.8,
        lineHeight: 14, 
    },
    
    // --- Main Content Wrapper ---
    mainWrapper: {
        flex: 1,
        backgroundColor: Colors.background,
        paddingHorizontal: 20,
        marginTop: -15, // Pulls the card content up slightly under the header
    },
    groupCountBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        backgroundColor: Colors.lightViolet + '30',
        borderRadius: 10,
        marginBottom: 15,
        marginTop: 15,
        borderWidth: 1,
        borderColor: Colors.secondaryViolet + '50',
    },
    groupCountText: {
        fontSize: 14,
        color: Colors.darkText,
        marginLeft: 8,
        fontWeight: '500',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: Colors.darkText,
        marginBottom: 10,
    },

    // --- Card List Styles ---
    flatListContent: {
        paddingBottom: 40,
        paddingHorizontal: 0,
    },
    card: {
        backgroundColor: Colors.white,
        borderRadius: 12,
        marginVertical: 8,
        shadowColor: Colors.darkText,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
        overflow: 'hidden',
    },
    cardTouchable: {
        flex: 1,
    },
    statusBarTop: {
        height: 4,
        width: '100%',
    },
    cardContent: {
        padding: 15,
    },
    cardDeleted: {
        opacity: 0.5,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    cardTitle: { 
        fontSize: 18, 
        fontWeight: "800", 
        flex: 1,
        color: Colors.darkText,
    },
    ticketText: { 
        fontSize: 13, 
        color: Colors.mediumText, 
        marginBottom: 10,
    },
    statusPill: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        alignSelf: 'flex-start',
        marginLeft: 10,
    },
    statusPillText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: Colors.white,
        textTransform: 'uppercase',
    },
    financialRow: { 
        flexDirection: "row", 
        justifyContent: "space-between",
        paddingTop: 10,
        paddingBottom: 5,
        marginBottom: 10,
        borderTopWidth: 1,
        borderTopColor: Colors.background,
    },
    financialColumn: { 
        alignItems: "flex-start",
        width: '50%',
    },
    amountLabel: { 
        fontSize: 11, 
        color: Colors.mediumText,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    amountValue: { 
        fontSize: 17, 
        fontWeight: "bold",
        marginTop: 2,
        color: Colors.darkText,
    },
    progressContainer: {
        alignItems: 'flex-end',
        marginTop: 5,
    },
    progressBarWrapper: {
        width: '100%',
        height: 8,
        backgroundColor: Colors.background,
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 6,
        borderWidth: 1,
        borderColor: Colors.lightViolet,
    },
    paidPercentageText: {
        fontSize: 12,
        color: Colors.mediumText,
        fontWeight: '500',
    },

    // --- No Group State & Loading ---
    noGroupWrapper: { 
        flex: 1, 
        justifyContent: "center", 
        alignItems: "center", 
        padding: 30,
        minHeight: 300,
        backgroundColor: Colors.white,
        borderRadius: 15,
        marginTop: 10,
        borderWidth: 1,
        borderColor: Colors.lightViolet,
    },
    noGroupImage: { 
        width: 120, 
        height: 120, 
        marginBottom: 20,
        tintColor: Colors.primaryViolet,
    },
    noGroupText: { 
        fontSize: 18, 
        fontWeight: "700", 
        color: Colors.darkText, 
        textAlign: "center" 
    },
    exploreButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 25,
        backgroundColor: Colors.primaryViolet,
        paddingHorizontal: 25,
        paddingVertical: 12,
        borderRadius: 10,
        shadowColor: Colors.primaryViolet,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 5,
        elevation: 8,
    },
    exploreButtonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    fullScreenLoader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 50,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: Colors.mediumText,
        fontWeight: '500',
    },
});

export default Mygroups;