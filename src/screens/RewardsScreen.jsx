import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Platform, Alert, Dimensions, Linking } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from "react-native-safe-area-context";

// NOTE: These components and context are assumed to be defined elsewhere in your project.
import Header from "../components/layouts/Header";
import { ContextProvider } from "../context/UserProvider"; 

const { width } = Dimensions.get('window');

// --- THEME COLORS ---
const DEEP_VIOLET_BLACK = '#1A0033'; // Dark, off-black violet
const VIBRANT_VIOLET = '#AA00FF';    // Vibrant accent color
const LIGHT_TEXT = '#E0E0E0';        // Light gray text
const ACCENT_GOLD = '#fcd34d';       // Gold for points/trophy

const RewardsScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const [rewardPoints, setRewardPoints] = useState(1500);
    const [isSharing, setIsSharing] = useState(false); // State to control sharing options visibility

    // Get user ID from context (Mocking usage based on existing structure)
    const [appUser] = useContext(ContextProvider);
    const userId = appUser?.userId || 'GUEST-12345'; // Use optional chaining for safety

    // Mock referral data (In a real app, this would generate a deep link)
    const referralCode = userId.slice(0, 8).toUpperCase();
    const shareMessage = `Start saving smart with MyChits! 💰

Use my referral code ${referralCode} and unlock amazing benefits.
Check it out: https://mychits.co.in/

📍 11/36-25, 3rd Floor, 2nd Main, Kathriguppe Main Rd, Banashankari Stage 3, Bengaluru
📞 +91 94839 00777 | ✉️ info.mychits@gmail.com

Don’t miss out—start your savings journey today! 🚀`;
    // URL encode the message for safe use in deep links
    const encodedShareMessage = encodeURIComponent(shareMessage);

    const socialMediaOptions = [
        { name: 'WhatsApp',icon: 'whatsapp', color: '#25D366' },
        { name: 'Facebook', icon: 'facebook', color: '#4267B2' },
        { name: 'Telegram', icon: 'telegram', color: '#0088CC' },
        { name: 'Gmail', icon: 'gmail', color: '#D44638' },
        { name: 'SMS', icon: 'message', color: '#34B7F1' },
        // { name: 'Google Pay', icon: 'google', color: '#4285F4' },
        // { name: 'PhonePe', icon: 'phone', color: '#673AB7' },
        // { name: 'Paytm', icon: 'wallet', color: '#0033A0' },
        // { name: 'Other Apps', icon: 'share-variant', color: VIBRANT_VIOLET },
    ];
    

    /**
     * Handles the sharing action for a specific platform using deep linking (where possible).
     */
    const handleShare = async (platform) => {
        let url = '';
        
        switch (platform.name) {
            case 'WhatsApp':
                // Standard WhatsApp deep link to send a text message
                url = `whatsapp://send?text=${encodedShareMessage}`;
                break;
            case 'Telegram':
                // Standard Telegram deep link to send a text message
                url = `tg://msg?text=${encodedShareMessage}`;
                break;
            case 'Facebook':
                // Facebook doesn't support easy deep-linked text sharing. 
                // We'll use a generic URL that attempts to open the share dialog in a browser/app.
                url = `https://www.facebook.com/sharer/sharer.php?quote=${encodedShareMessage}`;
                break;
            // case 'Instagram':
            //     // Instagram sharing is complex and usually requires media/stories API or the native Share sheet.
            //     Alert.alert(
            //         "Action Required", 
            //         "Instagram does not support direct deep-linked text sharing. In a production app, use the native React Native `Share` API."
            //     );
            
                // return;
                case 'Gmail':
            url = `mailto:?subject=Join MyChits&body=${encodedShareMessage}`;
            break;
        case 'SMS':
            url = `sms:?body=${encodedShareMessage}`;
            break;
        // case 'Google Pay':
        // case 'PhonePe':
        // case 'Paytm':
        //     const upiId = "someone@upi"; // Replace with your business UPI
        //     const name = "MyChits";
        //     const amount = "0"; // Optional
        //     const currency = "INR";
        //     url = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${amount}&cu=${currency}`;
        //     break;

        //     case 'Other Apps':
        //         // This option is designed for the native Share sheet.
        //         Alert.alert(
        //             "Native Share", 
        //             "For 'Other Apps', please use the native React Native `Share` API in your production environment to open the system share menu."
        //         );
        //         return;
            default:
                Alert.alert("Error", "Unsupported platform.");
                return;
        }

        try {
            // Attempt to open the constructed URL
            const supported = await Linking.canOpenURL(url);
            

            if (supported) {
                await Linking.openURL(url);
                // The app will attempt to leave the current screen to open the other app.
            } else {
                Alert.alert(
                    "App Not Found",
                    `The ${platform.name} app or its sharing link could not be opened.`
                );
            }
        } catch (error) {
            console.error(`Error opening share link for ${platform.name}:`, error);
            Alert.alert("Share Failed", `Could not initiate sharing via ${platform.name}.`);
        }
        
        // Do not hide options immediately, allow user to try another platform if the first failed.
    };

    /**
     * The main button action to toggle the sharing options visibility.
     */
    const handleReferAndEarn = () => {
        setIsSharing(!isSharing);
    };


    // --- UI RENDER ---

    const renderShareOptions = () => (
        <View style={styles.shareOptionsContainer}>
            <Text style={styles.shareHeader}>Share Your Link</Text>
            <View style={styles.shareButtonsGrid}>
                {socialMediaOptions.map((platform) => (
                    <TouchableOpacity 
                        key={platform.name}
                        style={styles.shareButton} 
                        onPress={() => handleShare(platform)}
                    >
                        <MaterialCommunityIcons 
                            name={platform.icon} 
                            size={40} 
                            color={platform.color} 
                        />
                        <Text style={styles.shareLabel}>{platform.name}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>



    );

    return (
        <SafeAreaView
            style={[
                styles.safeArea,
                {
                    paddingTop:
                        Platform.OS === "android" ? StatusBar.currentHeight : insets.top,
                },
            ]}
        >
            {/* Status bar uses the same dark violet background */}
            <StatusBar barStyle="light-content" backgroundColor={DEEP_VIOLET_BLACK} />
            <Header userId={userId} navigation={navigation} />
            
            {/* Main content area box */}
            <View style={styles.mainContentArea}>
                <ScrollView contentContainerStyle={styles.container}>
                    <View style={styles.headerContainer}>
                        <Text style={styles.headerTitle}>Refer & Earn Rewards</Text>
                    </View>
                    
                    {/* Points Card */}
                    <View style={styles.pointsCard}>
                        <MaterialCommunityIcons name="trophy-award" size={32} color={ACCENT_GOLD} />
                        <Text style={styles.pointsText}>{rewardPoints}</Text>
                        <Text style={styles.pointsLabel}>Chit Points</Text>
                    </View>

                    {/* Refer & Earn Button */}
                    <Text style={styles.sectionHeader}>Referral Program</Text>
                    <TouchableOpacity 
                        onPress={handleReferAndEarn}
                        activeOpacity={0.8}
                        style={styles.referButtonContainer}
                    >
                        <LinearGradient
                            colors={[VIBRANT_VIOLET, DEEP_VIOLET_BLACK]} // Gradient from vibrant violet to deep violet black
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.referButtonContent}
                        >
                            <MaterialCommunityIcons name="account-plus" size={28} color={LIGHT_TEXT} style={{ marginRight: 10 }} />
                            <Text style={styles.referButtonText}>
                                {isSharing ? 'Hide Share Options' : 'Refer a Friend & Earn'}
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>
                    <Text style={styles.referInfoText}>
                        Share your unique referral code ({referralCode}) to invite new users and get 500 points when they complete their first chits cycle!
                    </Text>

                    {/* Conditional Share Options */}
                    {isSharing && renderShareOptions()}

                </ScrollView>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        // VIOLATE BLACK THEME: Main screen background
        backgroundColor: DEEP_VIOLET_BLACK, 
    },
    mainContentArea: {
        flex: 1,
        // White foreground container
        backgroundColor: '#fff', 
        marginHorizontal: 10,
        marginBottom: 50,
        borderRadius: 12,
        overflow: "hidden",
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.1,
                shadowRadius: 10,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    container: {
        flexGrow: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    headerContainer: {
        alignItems: 'center',
        paddingVertical: 10,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: DEEP_VIOLET_BLACK, // Dark text on white background
    },
    pointsCard: {
        // Updated Points Card to use the violate black theme
        backgroundColor: DEEP_VIOLET_BLACK, 
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20, 
        shadowColor: VIBRANT_VIOLET,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5, // Increased shadow for dramatic effect
        shadowRadius: 10,
        elevation: 10,
    },
    pointsText: {
        fontSize: 50,
        fontWeight: 'bold',
        color: ACCENT_GOLD, // Gold color remains for the score
    },
    pointsLabel: {
        fontSize: 14,
        color: LIGHT_TEXT,
        marginTop: 4,
    },
    sectionHeader: {
        fontSize: 20,
        fontWeight: 'bold',
        color: DEEP_VIOLET_BLACK,
        marginBottom: 15,
        marginTop: 10,
    },

    // --- REFER BUTTON STYLES ---
    referButtonContainer: {
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 15,
        shadowColor: VIBRANT_VIOLET,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 6,
    },
    referButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
    },
    referButtonText: {
        color: LIGHT_TEXT,
        fontSize: 18,
        fontWeight: 'bold',
    },
    referInfoText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
        paddingHorizontal: 10,
        lineHeight: 20,
    },

    // --- SHARE OPTIONS STYLES ---
    shareOptionsContainer: {
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    shareHeader: {
        fontSize: 16,
        fontWeight: '600',
        color: DEEP_VIOLET_BLACK,
        marginBottom: 15,
        textAlign: 'center',
    },
    shareButtonsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        paddingHorizontal: 10,
    },
    shareButton: {
        width: width / 5, // Responsive width for a tight grid
        alignItems: 'center',
        justifyContent: 'center',
        margin: 8,
    },
    shareLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 5,
        textAlign: 'center',
    },
});

export default RewardsScreen;
