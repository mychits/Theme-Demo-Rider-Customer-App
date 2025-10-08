import React, { useState, useEffect, useCallback, useContext, useRef } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    StatusBar,
    Image,
    StyleSheet,
    ScrollView,
    Dimensions,
    Animated,
    Easing,
    Alert,
    Platform,
} from "react-native";
// Assuming relative path for url and axios setup
import url from "../data/url";
import axios from "axios";
import { Ionicons, MaterialCommunityIcons, AntDesign, FontAwesome5 } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
// Assuming context exists
import { ContextProvider } from "../context/UserProvider"; 
import profileImage from "../../assets/profile (2).png"; // Placeholder

const { width, height } = Dimensions.get('window');

// --- UNIFIED PROFESSIONAL VIOLET THEME & COLORS ---
const Colors = {
    primaryViolet: "#5A189A",     
    secondaryViolet: "#9D4EDD",   
    darkText: "#0F0A1F",          
    mediumText: "#5C586B",        
    background: "#F0F0F5",        
    white: "#FFFFFF",
    success: "#2ECC71",           
    profitDarkGreen: '#1E8449',
    lightViolet: "#E0AAFF",       
    
    headerGradientStart: '#2A0050', 
    headerGradientEnd: '#5A189A',   
    
    chartRed: '#E74C3C',
    chartGreen: '#2ECC71',
};

// Util for Indian Number Formatting (Lakhs/Crores)
const formatNumberIndianStyle = (num) => {
    if (num === null || num === undefined) return "0";
    const numValue = Number(num);
    const isNegative = numValue < 0;
    const absNum = Math.abs(numValue);
    
    const parts = absNum.toFixed(2).toString().split(".");
    let integerPart = parts[0];
    let decimalPart = parts.length > 1 ? "." + parts[1] : "";
    
    const lastThree = integerPart.slice(-3);
    const otherNumbers = integerPart.slice(0, -3);
    const formattedOther = otherNumbers
        ? otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + ","
        : "";
        
    return (isNegative ? "-" : "") + formattedOther + lastThree + decimalPart;
};

// ===============================================
// --- MAIN COMPONENT: PortfolioOverview ---
// ===============================================
const PortfolioOverview = ({ navigation }) => {
    const insets = useSafeAreaInsets(); 
    const [appUser] = useContext(ContextProvider);
    const userId = appUser?.userId;
    const [loading, setLoading] = useState(true);
    
    const [netInvestment, setNetInvestment] = useState(0); 
    const [totalProfit, setTotalProfit] = useState(0); 
    const [totalPortfolioValue, setTotalPortfolioValue] = useState(0); 
    
    const [goalTarget, setGoalTarget] = useState(500000); // 5 Lakhs

    // Animations
    const headerScaleAnim = useRef(new Animated.Value(0)).current; 
    const contentFadeAnim = useRef(new Animated.Value(0)).current; 

    useEffect(() => {
        Animated.timing(headerScaleAnim, {
            toValue: 1, 
            duration: 800, 
            easing: Easing.out(Easing.back(1.5)), 
            useNativeDriver: true, 
        }).start();
        
        Animated.timing(contentFadeAnim, {
            toValue: 1,
            duration: 500,
            delay: 300,
            useNativeDriver: true,
        }).start();
    }, []); 

    const fetchPortfolioSummary = useCallback(async () => {
        if (!userId) {
            setLoading(false);
            return;
        }
        try {
            const response = await axios.post(`${url}/enroll/get-user-tickets-report/${userId}`);
            const data = response.data;
            
            const netInv = data.reduce((sum, g) => sum + (g?.payments?.totalPaidAmount || 0), 0);
            const totalProf = data.reduce((sum, g) => sum + (g?.profit?.totalProfit || 0), 0);
            
            setNetInvestment(netInv);
            setTotalProfit(totalProf);
            setTotalPortfolioValue(netInv + totalProf); 
            
        } catch (error) {
            if (error.response?.status === 404) {
                setNetInvestment(0);
                setTotalProfit(0);
                setTotalPortfolioValue(0);
            } else {
                console.error("Error fetching portfolio overview:", error); 
                Alert.alert("Error", "Could not load portfolio data.");
            }
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useFocusEffect(
        useCallback(() => {
            fetchPortfolioSummary();
        }, [fetchPortfolioSummary])
    );
    
    // --- Calculated Metrics ---
    const goalProgress = Math.min(100, Math.round((totalPortfolioValue / goalTarget) * 100));
    const profitPercentage = netInvestment > 0 
        ? ((totalProfit / netInvestment) * 100).toFixed(2) 
        : "0.00";
    const totalInvestment = netInvestment; 
    
    const profitSign = totalProfit >= 0 ? '+' : '-';
    const profitColor = totalProfit >= 0 ? Colors.chartGreen : Colors.chartRed;
    
    // --- Sub-Components ---
    
    const MetricCard = ({ label, value, valueColor = Colors.darkText, icon }) => (
        <View style={customerStyles.metricCard}>
            <Text style={customerStyles.metricLabel}>{label}</Text>
            <View style={customerStyles.metricValueRow}>
                {icon && <Ionicons name={icon} size={18} color={valueColor} style={{ marginRight: 5 }} />}
                <Text style={[customerStyles.metricValue, { color: valueColor }]}>
                    ₹ {formatNumberIndianStyle(value)}
                </Text>
            </View>
        </View>
    );

    const GoalTracker = () => (
        <View style={customerStyles.goalCard}>
            <View style={customerStyles.goalHeader}>
                <MaterialCommunityIcons name="target-variant" size={28} color={Colors.primaryViolet} />
                <Text style={customerStyles.goalTitle}>Total Dividend/Profit</Text>
                <TouchableOpacity onPress={() => Alert.alert("Goal Settings", "Feature under development.")}>
                     <Ionicons name="settings-outline" size={20} color={Colors.mediumText} />
                </TouchableOpacity>
            </View>
            
            <View style={customerStyles.goalBarWrapper}>
                <View style={[customerStyles.goalBar, { width: `${goalProgress}%`, backgroundColor: Colors.secondaryViolet }]} />
            </View>
            
            <View style={customerStyles.goalDetails}>
                <Text style={customerStyles.chartLabel}>
                 Total Dividend/Profit:{ <Text style={{ color: profitColor, fontWeight: '700' }}> {profitSign}{formatNumberIndianStyle(totalProfit)}</Text>
}
                </Text>
               
            </View>
        </View>
    );
    
    // --- NEW: Explore Groups Card ---
    const ExploreGroupsCard = () => (
        <View style={customerStyles.exploreCard}>
            <View style={customerStyles.exploreContent}>
                <MaterialCommunityIcons name="rocket-launch-outline" size={36} color={Colors.primaryViolet} />
                <View style={{ marginLeft: 15, flex: 1 }}>
                    <Text style={customerStyles.exploreTitle}>Discover New Opportunities</Text>
                    <Text style={customerStyles.exploreSubtitle}>
                        Ready to diversify? Find the next best group to join.
                    </Text>
                </View>
            </View>
            <TouchableOpacity 
                style={customerStyles.exploreButton}
                onPress={() => navigation.navigate("BottomTab", { screen: "EnrollTab" })}
            >
                <Text style={customerStyles.exploreButtonText}>Explore Groups</Text>
                <Ionicons name="arrow-forward" size={18} color={Colors.white} style={{ marginLeft: 8 }} />
            </TouchableOpacity>
        </View>
    );

    // --- Main Render ---
    return (
        <View style={customerStyles.container}>
            
            <StatusBar 
                barStyle="light-content" 
                backgroundColor={Colors.headerGradientStart} 
                translucent={true} 
            />
            
            {/* --- FIXED HEADER --- */}
            <LinearGradient 
                colors={[Colors.headerGradientStart, Colors.headerGradientEnd]} 
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[customerStyles.topHeaderContainer, { paddingTop: insets.top + 10 }]} 
            >
                <View style={customerStyles.headerRow}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={customerStyles.backButton}
                    >
                        <Ionicons name="arrow-back" size={28} color="#fff" />
                    </TouchableOpacity>
                    <Text style={customerStyles.headerTitle}>Portfolio Overview</Text>
                    <TouchableOpacity
                        onPress={() => navigation.navigate("BottomTab", { screen: "ProfileScreen" })}
                        style={customerStyles.profileImageContainer}
                    >
                        <Image source={profileImage} style={customerStyles.profileImage} />
                    </TouchableOpacity>
                </View>
                
                <Animated.View style={[customerStyles.totalValueWrapper, { transform: [{ scale: headerScaleAnim }] }]}>
                    <Text style={customerStyles.totalValueLabel}>Total Portfolio Value</Text>
                    <Text style={customerStyles.totalValueText}>
                        ₹ {formatNumberIndianStyle(totalPortfolioValue)}
                    </Text>
                </Animated.View>
                
            </LinearGradient>
            
            {/* --- MAIN SCROLLABLE CONTENT --- */}
            <ScrollView 
                style={customerStyles.mainWrapper}
                contentContainerStyle={customerStyles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {loading ? (
                    <View style={customerStyles.loadingContainer}>
                        <ActivityIndicator size="large" color={Colors.primaryViolet} />
                        <Text style={customerStyles.loadingText}>Analyzing portfolio data...</Text>
                    </View>
                ) : (
                    <Animated.View style={{ opacity: contentFadeAnim, width: '100%' }}>
                        
                        {/* Summary Metrics Row */}
                        <View style={customerStyles.metricsRow}>
                            <MetricCard 
                                label="Net Investment" 
                                value={totalInvestment} 
                                icon="trending-up"
                                valueColor={Colors.primaryViolet}
                            />
                            <MetricCard 
                                label="Total Dividend/Profit" 
                                value={totalProfit} 
                                // icon={totalProfit >= 0 ? "arrow-up-right" : "arrow-down-right"}
                                valueColor={profitColor}
                            />
                        </View>
                        
                        {/* Performance Chart Placeholder */}
                        <View style={customerStyles.chartCard}>
                            <Text style={customerStyles.sectionTitle}>Total Investment</Text>
                            <View style={customerStyles.chartPlaceholder}>
                                <View style={customerStyles.chartPlaceholderBar}>
                                    <View style={{ height: '100%', width: `${Math.min(100, (netInvestment / 200000) * 100)}%`, backgroundColor: Colors.secondaryViolet, borderRadius: 5 }} />
                                </View>
                                <View style={customerStyles.performanceDetails}>
                                    <Text style={customerStyles.chartLabel}>
                                        Total Investment: 
                                        <Text style={{ color: profitColor, fontWeight: '700' }}> {profitSign}{formatNumberIndianStyle(netInvestment)}</Text>
                                    </Text>
                                    {/* <Text style={customerStyles.chartLabel}>
                                        ({profitSign}{profitPercentage}%)
                                    </Text> */}
                                </View>
                            </View>
                        </View>
                        
                        {/* Goal Tracker Card */}
                        <GoalTracker />
                        
                        {/* --- NEW: Explore Groups Card --- */}
                        <ExploreGroupsCard />
                        
                    </Animated.View>
                )}
            </ScrollView>
        </View>
    );
};

// --- STYLESHEET (UPDATED WITH NEW EXPLORE CARD STYLES) ---
const customerStyles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },

    // ===============================================
    // --- HEADER STYLES ---
    // ===============================================
    topHeaderContainer: {
        borderBottomLeftRadius: 35,
        borderBottomRightRadius: 35,
        paddingHorizontal: 20, 
        paddingBottom: 40, 
        shadowColor: Colors.darkText,
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
        alignItems: 'center',
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: '100%',
        marginBottom: 20,
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        color: Colors.white,
        fontSize: 20,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    profileImageContainer: {
        width: 38,
        height: 38,
        borderRadius: 19,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.7)',
        overflow: 'hidden',
    },
    profileImage: {
        width: '100%',
        height: '100%',
    },
    totalValueWrapper: {
        alignItems: 'center',
        marginTop: 10,
    },
    totalValueLabel: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    totalValueText: {
        color: Colors.white,
        fontSize: 34,
        fontWeight: '900',
        marginTop: 5,
    },
    
    // ===============================================
    // --- MAIN CONTENT STYLES ---
    // ===============================================
    mainWrapper: {
        flex: 1,
        marginTop: -20, 
        paddingHorizontal: 20,
    },
    scrollContent: {
        paddingBottom: 50,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 200,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: Colors.mediumText,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: Colors.darkText,
        marginBottom: 15,
    },
    
    // --- Metrics Row ---
    metricsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        marginTop: 10,
    },
    metricCard: {
        backgroundColor: Colors.white,
        borderRadius: 15,
        padding: 15,
        flex: 1,
        marginHorizontal: 5,
        shadowColor: Colors.darkText,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
    },
    metricLabel: {
        fontSize: 13,
        color: Colors.mediumText,
        fontWeight: '500',
        marginBottom: 5,
    },
    metricValueRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metricValue: {
        fontSize: 18,
        fontWeight: '800',
    },
    
    // --- Chart Card ---
    chartCard: {
        backgroundColor: Colors.white,
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
        shadowColor: Colors.darkText,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
    },
    chartPlaceholder: {
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.background,
        borderRadius: 10,
        padding: 10,
    },
    chartPlaceholderBar: {
        width: '90%',
        height: 10,
        backgroundColor: Colors.lightViolet,
        borderRadius: 5,
    },
    performanceDetails: {
        marginTop: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 10,
    },
    chartLabel: {
        fontSize: 14,
        color: Colors.mediumText,
    },

    // --- Goal Tracker Card ---
    goalCard: {
        backgroundColor: Colors.lightViolet + '20',
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: Colors.secondaryViolet + '30',
    },
    goalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    goalTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.darkText,
        flex: 1,
        marginLeft: 10,
    },
    goalBarWrapper: {
        height: 15,
        backgroundColor: Colors.white,
        borderRadius: 8,
        overflow: 'hidden',
        marginBottom: 10,
    },
    goalBar: {
        height: '100%',
    },
    goalDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 5,
    },
    goalProgressText: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.primaryViolet,
    },
    goalTargetText: {
        fontSize: 14,
        color: Colors.mediumText,
    },
    
    // --- NEW: Explore Card Styles ---
    exploreCard: {
        backgroundColor: Colors.white,
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
        shadowColor: Colors.darkText,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
        borderLeftWidth: 5,
        borderLeftColor: Colors.secondaryViolet,
    },
    exploreContent: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    exploreTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.darkText,
    },
    exploreSubtitle: {
        fontSize: 13,
        color: Colors.mediumText,
        marginTop: 2,
    },
    exploreButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.primaryViolet,
        paddingVertical: 12,
        borderRadius: 25,
        elevation: 3,
    },
    exploreButtonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: '700',
    }
});

export default PortfolioOverview;