import React, {
  useState,
  useEffect,
  useCallback,
  useContext,
} from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Image,
  Platform,
  Vibration,
  LayoutAnimation,
  NativeModules,
  Dimensions,
} from "react-native";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import {
  MaterialIcons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// --- Local Imports ---
import url from "../data/url";
import NoGroupImage from "../../assets/Nogroup.png";
import NoRecordFoundImage from "../../assets/NoRecordFound.png";
import { ContextProvider } from "../context/UserProvider"; // Assuming this is correct

// Enable LayoutAnimation for Android
if (Platform.OS === "android") {
  if (NativeModules.UIManager) {
    NativeModules.UIManager.setLayoutAnimationEnabledExperimental &&
      NativeModules.UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

// --- CONSTANTS & COLOR PALETTE (Unified Violet Dawn) ---
const { width } = Dimensions.get("window");

const Colors = {
  primary: "#5D3FD3", // Deep Violet/Indigo - Main brand color
  primaryLight: "#8A2BE2", // Bright Violet for accents
  primaryDark: "#4B0082", // Deep Indigo for shadows/background contrast
  backgroundLight: "#F8F8FF", // Ghost White
  card: "#FFFFFF",
  textDark: "#1C1C1C", // Near Black
  textMedium: "#708090", // Slate Gray
  accentMagenta: "#FF00FF", // Vibrant Magenta for Free Auction/Highlight
  accentCyan: "#00CED1", // Medium Turquoise for Dates/Secondary Icon
  successDark: "#4B0082", // Deep Indigo for metrics background
  gold: "#FFD700",
  border: "#E6E6FA", // Lavender lighter border
  shadow: "rgba(93, 63, 211, 0.4)", // Primary-tinted shadow (40% opacity)
  selectedBorder: "#FF00FF", // Magenta for selection
  selectedBackground: "#F5E6FF", // Lightest Lavender
  lightDivider: "#F0F0F0",
  dataPanelBg: "#F3F0FF", // Light Lavender background for segmented details

  headerGradientStart: "#4B0082", // Deep Indigo for depth
  headerGradientEnd: "#5D3FD3", // primary
  headerText: "#FFFFFF",
};

// ===============================================
// --- UTILITY FUNCTIONS ---
// ===============================================

/**
 * Formats a number into the Indian numbering style (lakhs, crores).
 * @param {number|string} num - The number to format.
 * @returns {string} The formatted number string (e.g., "1,23,456").
 */
const formatNumberIndianStyle = (num) => {
  if (num === null || num === undefined || isNaN(num)) {
    return "0";
  }
  const numValue = Number(num);
  const isNegative = numValue < 0;
  let integerPart = Math.abs(numValue).toFixed(0).toString();
  // Using Intl.NumberFormat for better localization support if needed, but sticking to provided logic for consistency.
  
  const lastThree = integerPart.slice(-3);
  const otherNumbers = integerPart.slice(0, -3);
  const formattedOther = otherNumbers
    ? otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + ","
    : "";

  const decimalPart = numValue % 1 !== 0 ? numValue.toFixed(2).toString().split(".")[1] : null;

  return (
    (isNegative ? "-" : "") +
    formattedOther +
    lastThree +
    (decimalPart ? "." + decimalPart : "")
  );
};

/**
 * Formats a date string into a standard, readable format (e.g., "01 Jan 2023").
 * @param {string} dateString - The date string to format.
 * @returns {string} The formatted date string.
 */
const formatDate = (dateString) => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      const options = { year: "numeric", month: "short", day: "numeric" };
      // This logic replicates the original's custom output "01 Jan 2023" style.
      const parts = date.toLocaleDateString("en-US", options).split(" ");
      return `${parts[1].replace(",", "")} ${parts[0]} ${parts[2]}`;
    }
  } catch (error) {
    console.warn("Error parsing date:", dateString); // Using warn as date parsing errors are common
  }
  return "";
};

// ===============================================
// --- CUSTOM HEADER COMPONENT ---
// ===============================================
const CustomHeader = React.memo(({ navigation, insets }) => {
  return (
    <LinearGradient
      colors={[Colors.headerGradientStart, Colors.headerGradientEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0.5 }}
      style={[
        headerStyles.headerContainer,
        { paddingTop: insets.top + 15 },
      ]}
    >
      <View style={headerStyles.titleRow}>
        <TouchableOpacity
          style={headerStyles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialIcons name="arrow-back" size={28} color={Colors.headerText} />
        </TouchableOpacity>

        <Text style={headerStyles.pageTitle} numberOfLines={1}>
          AUCTION CENTER
        </Text>

        <MaterialCommunityIcons
          name="gavel"
          size={28}
          color={Colors.headerText}
          style={headerStyles.pageIcon}
        />
      </View>
    </LinearGradient>
  );
});

// ===============================================
// --- GROUP CARD COMPONENT ---
// ===============================================
const GroupCard = React.memo(({ card, onSelect, isHighlighted }) => {
  const { group_id, tickets, _id: enrollmentId } = card;
  const { group_name, group_value, auction_type, _id: groupId } = group_id || {};

  const safeAuctionType = auction_type || "";
  const formattedAuctionType =
    safeAuctionType !== ""
      ? safeAuctionType.charAt(0).toUpperCase() + safeAuctionType.slice(1)
      : "";
  const isFreeAuction = safeAuctionType.toLowerCase() === "free";

  // Action handler to pass all necessary data
  const handlePress = useCallback(() => {
    onSelect(enrollmentId, groupId, tickets);
  }, [onSelect, enrollmentId, groupId, tickets]);


  return (
    <View
      style={[
        styles.newGroupCard,
        isHighlighted && styles.selectedNewGroupCard,
      ]}
    >
      <LinearGradient
        colors={[Colors.primary, Colors.primaryLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardHeader}
      >
        <View style={styles.cardHeaderContent}>
          <Text style={styles.cardHeaderTitle} numberOfLines={1}>
            {group_name || "N/A Group"}
          </Text>
          {formattedAuctionType ? (
            <View style={styles.auctionTypeTag}>
              <Text
                style={[
                  styles.auctionTypeTagText,
                  isFreeAuction
                    ? styles.auctionTypeMagentaText
                    : styles.auctionTypeDefaultText,
                ]}
              >
                {formattedAuctionType.toUpperCase()}
              </Text>
            </View>
          ) : null}
        </View>
      </LinearGradient>

      <View style={styles.cardBody}>
        <View style={styles.infoColumn}>
          <Text style={styles.infoTitle}>GROUP VALUE</Text>
          <Text style={styles.infoValue}>
            ₹ {formatNumberIndianStyle(group_value)}
          </Text>
        </View>
      </View>

      <View style={styles.actionButtonsRow}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handlePress}
          activeOpacity={0.8}
        >
          <MaterialIcons name="list-alt" size={24} color={Colors.primary} />
          <Text style={styles.actionButtonLabel}>VIEW RECORDS</Text>
        </TouchableOpacity>
        <View style={styles.actionButtonDivider} />
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handlePress}
          activeOpacity={0.8}
        >
          <MaterialIcons name="timeline" size={24} color={Colors.primary} />
          <Text style={styles.actionButtonLabel}>AUCTION DETAILS</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

// ===============================================
// --- AUCTION RECORDS VIEW COMPONENT ---
// ===============================================
const AuctionRecordsView = React.memo(({ records, onBack, isLoading, error }) => {

  const showNoRecordsMessage = records.length === 0 || error;

  if (isLoading) {
    return (
      <View style={styles.auctionRecordsContainer}>
        <ActivityIndicator
          size="large"
          color={Colors.primary}
          style={styles.loader}
        />
      </View>
    );
  }

  if (showNoRecordsMessage) {
    return (
      <View style={styles.auctionRecordsContainer}>
        <TouchableOpacity
          onPress={onBack}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <MaterialIcons name="arrow-back" size={24} color={Colors.primary} />
          <Text style={styles.backButtonText}>Back to Groups</Text>
        </TouchableOpacity>
        <View style={styles.noDataContainer}>
          <Image
            source={NoRecordFoundImage}
            style={styles.noDataImage}
            resizeMode="contain"
          />
          <Text style={styles.noDataText}>
            {error || "No auction records found for this group."}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.auctionRecordsContainer}>
      <TouchableOpacity
        onPress={onBack}
        style={styles.backButton}
        activeOpacity={0.7}
      >
        <MaterialIcons name="arrow-back" size={24} color={Colors.primary} />
        <Text style={styles.backButtonText}>Back to Groups</Text>
      </TouchableOpacity>
      <Text style={styles.recordsListTitle}>AUCTION RECORDS</Text>
      <ScrollView
        contentContainerStyle={styles.auctionRecordsScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {records.map((record, index) => {
          const isFreeAuctionRecord =
            record.auction_type?.toLowerCase() === "free";
          const formattedAuctionType = record.auction_type
            ? record.auction_type.charAt(0).toUpperCase() +
              record.auction_type.slice(1)
            : "Normal";

          // Calculate sequential record number, starting from 1 for the first element
          const recordNumber = index + 1;

          return (
            <View
              key={record._id || `auction-${index}`}
              style={styles.auctionRecordCard}
            >
              {/* 1. Sequential Number Chip (Header) */}
              <View style={styles.recordNumberChip}>
                <MaterialCommunityIcons
                  name="gavel"
                  size={16}
                  color={Colors.card}
                />
                <Text style={styles.recordNumberChipText}>
                  RECORD {recordNumber}
                </Text>
              </View>

              {/* 2. Segmented Date Block */}
              <View style={styles.dateSegmentContainer}>
                {/* Auction Date */}
                <View style={styles.dateSegment}>
                  <MaterialCommunityIcons
                    name="calendar-start"
                    size={20}
                    color={Colors.accentCyan}
                  />
                  <Text style={styles.dateSegmentTitle}>AUCTION DATE</Text>
                  <Text style={styles.dateSegmentValue}>
                    {formatDate(record.auction_date)}
                  </Text>
                </View>

                {/* Next Date */}
                <View style={[styles.dateSegment, styles.dateSegmentSeparator]}>
                  <MaterialCommunityIcons
                    name="calendar-end"
                    size={20}
                    color={Colors.accentCyan}
                  />
                  <Text style={styles.dateSegmentTitle}>NEXT DATE</Text>
                  <Text style={styles.dateSegmentValue}>
                    {formatDate(record.next_date)}
                  </Text>
                </View>
              </View>

              {/* 3. Secondary Info List */}
              <View style={styles.secondaryInfoList}>
                {/* Auction Type */}
                <View style={styles.infoRow}>
                  <Text style={styles.infoTitle}>AUCTION TYPE</Text>
                  <Text
                    style={[
                      styles.infoValue,
                      {
                        color: isFreeAuctionRecord
                          ? Colors.accentMagenta
                          : Colors.textDark,
                      },
                    ]}
                  >
                    {formattedAuctionType.toUpperCase()}
                  </Text>
                </View>
                <View style={styles.infoListDivider} />

                {/* Bid Percentage */}
                <View style={styles.infoRow}>
                  <Text style={styles.infoTitle}>BID PERCENTAGE</Text>
                  <Text style={styles.infoValue}>
                    {record.bid_percentage || "0"}%
                  </Text>
                </View>
              </View>

              {/* 4. Footer Metrics Panel (Inverted Colors) */}
              <LinearGradient
                colors={[Colors.successDark, Colors.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.footerMetricsPanel}
              >
                {/* Win Ticket */}
                <View style={styles.metricItem}>
                  <Text style={[styles.metricLabel, { color: Colors.card }]}>
                    WINNING TICKET
                  </Text>
                  <Text style={styles.metricTicketValueInverted}>
                    {record.ticket || "N/A"}
                  </Text>
                </View>

                {/* Bid Amount (Highlighted Segment) */}
                <View style={[styles.metricItem, styles.metricItemSeparator]}>
                  <Text style={[styles.metricLabel, { color: Colors.card }]}>
                    BID AMOUNT
                  </Text>
                  <Text style={styles.metricAmountValue}>
                    ₹ {formatNumberIndianStyle(record.bid_amount)}
                  </Text>
                </View>
              </LinearGradient>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
});

// ===============================================
// --- MAIN COMPONENT: AuctionList ---
// ===============================================

const AuctionList = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [appUser] = useContext(ContextProvider);
  const userId = appUser?.userId;

  const [isLoading, setIsLoading] = useState(true);
  const [userTickets, setUserTickets] = useState([]);
  const [isShowingRecords, setIsShowingRecords] = useState(false);
  const [auctionData, setAuctionData] = useState({
    records: [],
    loading: false,
    error: null,
    highlightedCardId: null, // ID of the enrollment document
  });

  // --- Data Fetching Logic ---

  // 1. Fetching user tickets (groups they are enrolled in)
  const fetchUserTickets = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const ticketsResponse = await axios.post(
        `${url}/enroll/get-user-tickets/${userId}`
      );
      setUserTickets(ticketsResponse.data || []);
    } catch (error) {
      console.error("Error fetching tickets:", error.message);
      setUserTickets([]);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // 2. Fetching auction records for a selected group
  const fetchAuctionDetails = useCallback(async (groupId) => {
    if (!groupId) {
      setAuctionData((prev) => ({ ...prev, error: "No Group ID provided." }));
      return;
    }
    setAuctionData((prev) => ({
      ...prev,
      loading: true,
      error: null,
      records: [],
    }));
    try {
      const response = await axios.get(`${url}/auction/group/${groupId}`);
      if (response.status === 200) {
        // Auction records are typically displayed from most recent to oldest.
        // We'll reverse the array if the backend returns oldest first.
        // Assuming records are ordered by date, reversing them for chronological display if needed.
        const sortedRecords = (response.data || []).sort((a, b) => new Date(a.auction_date) - new Date(b.auction_date));
        setAuctionData((prev) => ({
          ...prev,
          records: sortedRecords,
        }));
      } else {
        setAuctionData((prev) => ({
          ...prev,
          error: "Failed to fetch auction records.",
        }));
      }
    } catch (error) {
      console.error("Error fetching auction details:", error.message);
      setAuctionData((prev) => ({
        ...prev,
        error:
          "No auction records found for this group. The auction may not have started yet or an error occurred.",
      }));
    } finally {
      setAuctionData((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  // --- Effects and Handlers ---

  useEffect(() => {
    fetchUserTickets();
  }, [fetchUserTickets]);

  // Reset state on screen focus
  useFocusEffect(
    useCallback(() => {
      fetchUserTickets();
      setIsShowingRecords(false);
      setAuctionData({
        records: [],
        loading: false,
        error: null,
        highlightedCardId: null,
      });
      // Cleanup function is unnecessary here but good practice for subscriptions
    }, [fetchUserTickets])
  );

  const handleViewDetails = useCallback((enrollmentId, groupId) => {
    Vibration.vibrate(50);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setAuctionData((prev) => ({
      ...prev,
      highlightedCardId: enrollmentId,
    }));
    setIsShowingRecords(true);
    fetchAuctionDetails(groupId);
  }, [fetchAuctionDetails]);

  const handleBackToGroups = useCallback(() => {
    Vibration.vibrate(50);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsShowingRecords(false);
    setAuctionData((prev) => ({
      ...prev,
      highlightedCardId: null,
      records: [],
      error: null,
    }));
  }, []);

  // Filter out invalid/null groups before rendering
  const validGroupCards = userTickets.filter((card) => card.group_id !== null);

  // --- Render Functions ---

  const renderGroupList = () => {
    if (isLoading) {
      return (
        <ActivityIndicator
          size="large"
          color={Colors.primary}
          style={styles.loader}
        />
      );
    }
    if (validGroupCards.length === 0) {
      return (
        <View style={styles.noGroupsContainer}>
          <Image
            source={NoGroupImage}
            style={styles.noGroupImage}
            resizeMode="contain"
          />
          <Text style={styles.noGroupsText}>
            You haven't joined any groups yet.
          </Text>
          <Text style={styles.noGroupsSubText}>
            Join a group to track your auction history here.
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.groupsWrapperBox}>
        <ScrollView
          contentContainerStyle={styles.groupListContentContainer}
          showsVerticalScrollIndicator={false}
        >
          {validGroupCards.map((card) => (
            <GroupCard
              key={card._id}
              card={card}
              onSelect={handleViewDetails}
              isHighlighted={auctionData.highlightedCardId === card._id}
            />
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={styles.screenContainer}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primaryDark} />
      
      {/* --- CUSTOM HEADER --- */}
      <CustomHeader
        navigation={navigation}
        insets={insets}
      />
      {/* -------------------------------- */}

      <View style={styles.outerBoxContainer}>
        <View style={styles.mainContentWrapper}>
          {!isShowingRecords ? (
            <>
              <Text style={styles.subSentenceTop}>
                Tap any group below to see its complete auction history.
              </Text>
              {renderGroupList()}
            </>
          ) : (
            <AuctionRecordsView
              records={auctionData.records}
              onBack={handleBackToGroups}
              isLoading={auctionData.loading}
              error={auctionData.error}
            />
          )}
        </View>
      </View>
    </View>
  );
};

// ===============================================
// --- STYLES ---
// ===============================================

// --- Custom Header Styles (Moved outside of main styles for clarity) ---
const headerStyles = StyleSheet.create({
  headerContainer: {
    width: "100%",
    paddingBottom: 25,
    paddingHorizontal: 20,
    backgroundColor: Colors.primary,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    ...Platform.select({
      ios: {
        shadowColor: Colors.headerGradientStart,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
      },
      android: {
        elevation: 15,
      },
    }),
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    padding: 5,
  },
  pageTitle: {
    fontSize: 22, // Slightly more refined size
    fontWeight: "900",
    color: Colors.headerText,
    letterSpacing: 1.5,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
  },
  pageIcon: {
    padding: 5,
  },
});

// --- AuctionList General Styles ---
const styles = StyleSheet.create({
  // Global Layout
  screenContainer: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
  },
  outerBoxContainer: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
    marginHorizontal: 10,
    marginBottom: 10,
    borderRadius: 25,
  },
  mainContentWrapper: {
    flex: 1,
    backgroundColor: Colors.card,
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  subSentenceTop: {
    fontSize: 15,
    color: Colors.textDark, // Darker text for prominence
    marginBottom: 15,
    textAlign: "center",
    paddingHorizontal: 10,
    lineHeight: 24,
    fontWeight: '700', // Increased weight
    backgroundColor: Colors.dataPanelBg,
    paddingVertical: 12, // Increased padding
    borderRadius: 15,
  },
  groupsWrapperBox: {
    borderRadius: 20,
    paddingVertical: 5,
    flex: 1,
  },
  groupListContentContainer: {
    paddingBottom: 20,
    paddingHorizontal: 5, // Small padding for cards
    alignItems: "center",
  },

  // === GroupCard Unique Design Styles ===
  newGroupCard: {
    width: "100%",
    backgroundColor: Colors.card,
    marginVertical: 10, // Adjusted margin
    borderRadius: 20, // Slightly smaller radius for refinement
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.border,
    ...Platform.select({
      ios: {
        shadowColor: Colors.shadow, // Use the primary-tinted shadow
        shadowOffset: { width: 0, height: 6 }, // Softer shadow
        shadowOpacity: 0.35,
        shadowRadius: 12,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  selectedNewGroupCard: {
    borderColor: Colors.selectedBorder,
    borderWidth: 3,
    backgroundColor: Colors.selectedBackground,
    // Ensure the shadow is slightly more pronounced when selected
    ...Platform.select({
      ios: { shadowOpacity: 0.5 },
      android: { elevation: 15 },
    }),
  },
  cardHeader: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: "center",
    position: "relative",
  },
  cardHeaderContent: {
    flexDirection: "row",
    justifyContent: "space-between", // Space between title and tag
    alignItems: "center",
    width: "100%",
  },
  cardHeaderTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: Colors.card,
    textAlign: "left", // Align to left/center in context
    flex: 1,
    letterSpacing: 0.5,
    paddingRight: 70, // Make room for the tag
  },
  auctionTypeTag: {
    position: "absolute",
    right: 15, // Adjusted for padding
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 15,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    alignItems: "center",
    justifyContent: "center",
  },
  auctionTypeTagText: {
    fontWeight: "800",
    fontSize: 11, // Slightly smaller
  },
  auctionTypeDefaultText: {
    color: Colors.primaryDark, // Darker contrast
  },
  auctionTypeMagentaText: {
    color: Colors.accentMagenta,
  },
  cardBody: {
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 20, // Slightly reduced padding
    backgroundColor: "transparent",
  },
  infoColumn: {
    alignItems: "center",
  },
  infoTitle: {
    fontSize: 13, // Smaller size
    color: Colors.textMedium,
    fontWeight: "700",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1.5, // Increased spacing
  },
  infoValue: {
    fontSize: 42, // Slightly smaller for better fit
    fontWeight: "900",
    color: Colors.primaryDark,
  },
  actionButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 15,
    backgroundColor: Colors.dataPanelBg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  actionButton: {
    alignItems: "center",
    flex: 1,
    paddingHorizontal: 5,
  },
  actionButtonDivider: {
    width: 1,
    backgroundColor: Colors.border, // Use border color
    marginVertical: 5,
  },
  actionButtonLabel: {
    marginTop: 6, // Reduced margin
    fontSize: 10,
    fontWeight: "700",
    color: Colors.textDark,
    textAlign: "center",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 200,
  },

  // No Groups Container
  noGroupsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 50,
    marginVertical: 20,
  },
  noGroupImage: {
    width: width * 0.5,
    height: width * 0.5,
    marginBottom: 20,
  },
  noGroupsText: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.primaryDark,
    textAlign: 'center',
    marginBottom: 10,
  },
  noGroupsSubText: {
    fontSize: 16,
    color: Colors.textMedium,
    textAlign: 'center',
  },

  // Auction Records View Styles
  auctionRecordsContainer: {
    flex: 1,
    paddingHorizontal: 0,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingVertical: 10,
    paddingHorizontal: 15, // Reduced padding
    marginBottom: 20,
    borderRadius: 10,
    backgroundColor: Colors.dataPanelBg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Platform.select({
      ios: {
        shadowColor: Colors.primaryDark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 5,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  backButtonText: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: "bold",
    color: Colors.primary,
  },
  recordsListTitle: {
    fontSize: 24, // Slightly smaller
    fontWeight: "900",
    color: Colors.primaryDark,
    marginBottom: 15,
    textAlign: "center",
    letterSpacing: 1,
  },
  auctionRecordsScrollContent: {
    paddingBottom: 40,
    paddingHorizontal: 5,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  noDataImage: {
    width: width * 0.4,
    height: width * 0.4,
    marginBottom: 20,
  },
  noDataText: {
    fontSize: 17,
    color: Colors.textMedium,
    textAlign: 'center',
    fontWeight: '600',
  },
  // === UNIQUE STYLES FOR AUCTION RECORD CARDS ===
  auctionRecordCard: {
    backgroundColor: Colors.card,
    borderRadius: 15, // Smaller radius for individual records
    marginVertical: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: Colors.primaryDark,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
      },
      android: {
        elevation: 5,
      },
    }),
  },

  // 1. Sequential Number Chip
  recordNumberChip: {
    flexDirection: "row",
    alignSelf: "flex-start",
    alignItems: "center",
    backgroundColor: Colors.primaryLight,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderBottomRightRadius: 15, // Match card radius
  },
  recordNumberChipText: {
    marginLeft: 6,
    color: Colors.card,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  // 2. Segmented Date Block
  dateSegmentContainer: {
    flexDirection: "row",
    backgroundColor: Colors.dataPanelBg,
    paddingVertical: 15, // Reduced padding
    borderBottomWidth: 1,
    borderColor: Colors.lightDivider,
  },
  dateSegment: {
    flex: 1,
    alignItems: "center",
  },
  dateSegmentSeparator: {
    borderLeftWidth: 1,
    borderColor: Colors.border,
  },
  dateSegmentTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: Colors.textMedium,
    marginTop: 5,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  dateSegmentValue: {
    fontSize: 16, // Reduced size
    fontWeight: "900",
    color: Colors.textDark,
    marginTop: 4,
  },

  // 3. Secondary Info List
  secondaryInfoList: {
    paddingHorizontal: 20, // Reduced padding
    paddingVertical: 5,
    backgroundColor: Colors.card,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10, // Reduced padding
  },
  infoTitle: {
    flex: 1,
    fontSize: 13, // Adjusted size to match GroupCard's infoTitle
    color: Colors.textMedium,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  infoValue: {
    fontSize: 15,
    fontWeight: "800",
  },
  infoListDivider: {
    height: 1,
    backgroundColor: Colors.lightDivider,
  },

  // 4. Footer Metrics Panel (Inverted Colors)
  footerMetricsPanel: {
    flexDirection: "row",
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    overflow: "hidden",
  },
  metricItem: {
    flex: 1,
    padding: 15, // Reduced padding
    alignItems: "center",
    backgroundColor: "transparent",
  },
  metricItemSeparator: {
    borderLeftWidth: 1,
    borderColor: Colors.primaryLight,
  },
  metricLabel: {
    fontSize: 9, // Smaller size
    fontWeight: "700",
    color: Colors.card,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  metricTicketValueInverted: {
    fontSize: 24, // Reduced size
    fontWeight: "900",
    color: Colors.accentMagenta,
  },
  metricAmountValue: {
    fontSize: 24,
    fontWeight: "900",
    color: Colors.gold,
  },
});

export default AuctionList;