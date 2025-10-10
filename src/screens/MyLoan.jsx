import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  SafeAreaView,
  Platform,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NetworkContext } from "../context/NetworkProvider";
import { ContextProvider } from "../context/UserProvider";
import Toast from "react-native-toast-message";
import url from "../data/url";
import axios from "axios";

// --- Stylistic Color Palette (Violet Theme) ---
const Colors = {
  primaryViolet: "#5A189A",
  secondaryViolet: "#9D4EDD",
  backgroundLight: "#FFFFFF",
  screenBackground: "#F5F5F7",
  cardBackground: "#FFFFFF",
  textDark: "#333333",
  textMedium: "#6C757D",
  accentColor: "#28A745",
  shadowColor: "rgba(90, 24, 154, 0.2)",
  vibrantCyan: "#17A2B8",
  lightGrayBorder: "#EDE7F6",
  paginationActive: "#5A189A",
  paginationInactive: "#E0E0E0",
  paginationActiveText: "#FFFFFF",
  paginationInactiveText: "#495057",
  successGreen: "#28A745",
  redError: "#D32F2F",
};

// Define contact constants
const CONTACT_EMAIL = "info.mychits@gmail.com";
const CONTACT_PHONE = "+919483900777";

const MyLoan = ({ route, navigation }) => {
  const [appUser] = useContext(ContextProvider);
  const userId = appUser?.userId;
  const { isConnected, isInternetReachable } = useContext(NetworkContext);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loans, setLoans] = useState([]);

  const [paymentsSummary, setPaymentsSummary] = useState(null);
  const [paymentsError, setPaymentsError] = useState(null);

  const [totalPayments, setTotalPayments] = useState([]);
  const [totalPaymentsError, setTotalPaymentsError] = useState(null);

  const [isDataLoading, setIsDataLoading] = useState(false);

  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loanId, setLoanId] = useState(null);

  useEffect(() => {
    if (!userId) return;
    const fetchLoans = async () => {
      setIsLoading(true);
      try {
        const apiUrl = `${url}/loans/get-borrower-by-user-id/${userId}`;
        const response = await axios.get(apiUrl);
        setLoans(response.data || []);
      } catch (err) {
        console.error("Failed to fetch loan data:", err);
        setError("Failed to fetch loan data.");
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Could not load loan data.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchLoans();
  }, [userId]);

  useEffect(() => {
    if (!userId || !loanId) return;
    const fetchData = async () => {
      setIsDataLoading(true);
      try {
        // Fetch Summary
        const summaryApiUrl = `${url}/payment/user/${userId}/loan/${loanId}/summary`;
        const summaryResponse = await axios.get(summaryApiUrl);
        const summary = Array.isArray(summaryResponse.data)
          ? summaryResponse.data[0]
          : summaryResponse.data;
        setPaymentsSummary(summary);

        // Fetch Paginated Payments
        const paymentsApiUrl = `${url}/payment/loan/${loanId}/user/${userId}/total-docs/7/page/${currentPage}`;
        const paymentsResponse = await axios.get(paymentsApiUrl);
        setTotalPayments(paymentsResponse.data);
      } catch (err) {
        console.error("Failed to fetch loan data or payments", err);
        setPaymentsError("Failed to fetch loan summary.");
        setTotalPaymentsError("Failed to fetch total payments.");
      } finally {
        setIsDataLoading(false);
      }
    };
    fetchData();
  }, [userId, loanId, currentPage]);

  useEffect(() => {
    if (!userId || !loanId) return;
    const fetchTotalPages = async () => {
      try {
        const apiUrl = `${url}/payment/loan/totalPages/user/${userId}/loan/${loanId}/total-docs/7`;
        const res = await axios.get(apiUrl);
        setTotalPages(res.data.totalPages || 0);
      } catch (err) {
        console.error("Failed to fetch total pages", err);
      }
    };
    fetchTotalPages();
  }, [userId, loanId]);

  const formatNumberIndianStyle = (num) => {
    if (num === null || num === undefined) return "0.00";
    const number = parseFloat(num).toFixed(2);
    const parts = number.toString().split(".");
    let integerPart = parts[0];
    const decimalPart = parts.length > 1 ? "." + parts[1] : "";
    const isNegative = integerPart.startsWith("-");
    if (isNegative) integerPart = integerPart.substring(1);

    const lastThree = integerPart.substring(integerPart.length - 3);
    const otherNumbers = integerPart.substring(0, integerPart.length - 3);
    const formatted =
      otherNumbers !== ""
        ? otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + lastThree
        : lastThree;

    return (isNegative ? "-" : "") + formatted + decimalPart;
  };

  const getPaginationNumbers = () => {
    const pages = [];
    const limit = 3;
    const start = Math.max(1, currentPage - Math.floor(limit / 2));
    const end = Math.min(totalPages, start + limit - 1);

    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push("...");
    }

    for (let i = start; i <= end; i++) pages.push(i);

    if (end < totalPages) {
      if (end < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }
    return pages.filter((v, i, a) => a.indexOf(v) === i);
  };

  const handleEmailPress = () => Linking.openURL(`mailto:${CONTACT_EMAIL}`);
  const handlePhonePress = () => Linking.openURL(`tel:${CONTACT_PHONE}`);

  // Header with back button
  const HeaderComponent = ({ navigation, userId }) => (
    <View style={headerStyles.headerContainer}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={headerStyles.headerBackButton}
      >
        <Ionicons name="arrow-back-outline" size={28} color={Colors.cardBackground} />
      </TouchableOpacity>

      <Text style={headerStyles.headerTitle}>Loan Portfolio</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primaryViolet} />

      {/* Header */}
      <HeaderComponent userId={userId} navigation={navigation} />

      <View style={styles.outerBoxContainer}>
        {isLoading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={Colors.primaryViolet} />
          </View>
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <ScrollView
            contentContainerStyle={styles.innerContentArea}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.titleContainer}>
              <Text style={styles.sectionTitle}>My Loan</Text>
              <Text style={styles.subHeading}>
                {loanId
                  ? "Recent payment history."
                  : "Your current loan details and payment status."}
              </Text>
            </View>

            {loanId ? (
              isDataLoading ? (
                <View style={styles.loaderContainer}>
                  <ActivityIndicator size="large" color={Colors.primaryViolet} />
                </View>
              ) : (
                <>
                  {/* Total payments summary Card */}
                  <View style={[styles.loanCard, styles.summaryCard]}>
                    <View style={styles.cardHeader}>
                      <View
                        style={[
                          styles.iconContainer,
                          { backgroundColor: Colors.vibrantCyan },
                        ]}
                      >
                        <Ionicons
                          name="stats-chart-outline"
                          size={28}
                          color={Colors.cardBackground}
                        />
                      </View>
                      <View style={styles.cardTitleContainer}>
                        <Text style={styles.cardTitle}>Total Repayment</Text>
                        <Text style={styles.cardSubtitle}>
                          Payments made against Loan ID: {loanId.substring(0, 8)}...
                        </Text>
                      </View>
                    </View>
                    {paymentsError ? (
                      <Text style={styles.errorText}>{paymentsError}</Text>
                    ) : (
                      <Text style={[styles.detailValue, styles.summaryValue]}>
                        ₹{" "}
                        {paymentsSummary
                          ? formatNumberIndianStyle(paymentsSummary.totalPaidAmount || 0)
                          : "N/A"}
                      </Text>
                    )}
                  </View>

                  {/* Payment history */}
                  <View>
                    <Text style={styles.paymentHistoryTitle}>Payment History</Text>
                    {totalPaymentsError ? (
                      <Text style={styles.errorText}>{totalPaymentsError}</Text>
                    ) : totalPayments.length > 0 ? (
                      totalPayments.map((pay) => (
                        <View key={pay._id} style={styles.paymentCard}>
                          <Ionicons
                            name="receipt-outline"
                            size={22}
                            color={Colors.primaryViolet}
                          />
                          <View style={styles.paymentDetailsRow}>
                            <View style={{ flex: 2 }}>
                              <Text style={styles.receiptText} numberOfLines={1}>
                                Receipt: {pay.receipt_no}
                              </Text>
                              <Text style={styles.dateText}>
                                {new Date(pay.pay_date).toLocaleDateString()}
                              </Text>
                            </View>
                            <View style={{ flex: 1, alignItems: "flex-end" }}>
                              <Text style={styles.amountText}>
                                ₹ {formatNumberIndianStyle(pay.amount)}
                              </Text>
                            </View>
                          </View>
                        </View>
                      ))
                    ) : (
                      <Text style={styles.emptyText}>No payments found for this loan.</Text>
                    )}

                    {totalPages > 1 && (
                      <View style={styles.paginationContainer}>
                        <TouchableOpacity
                          disabled={currentPage === 1}
                          onPress={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          style={styles.paginationArrowButton}
                        >
                          <Ionicons
                            name="chevron-back"
                            size={24}
                            color={currentPage === 1 ? Colors.textMedium : Colors.textDark}
                          />
                        </TouchableOpacity>
                        {getPaginationNumbers().map((pageNumber, index) =>
                          pageNumber === "..." ? (
                            <Text key={`ellipsis-${index}`} style={styles.paginationEllipsis}>
                              ...
                            </Text>
                          ) : (
                            <TouchableOpacity
                              key={pageNumber}
                              style={[
                                styles.paginationBox,
                                currentPage === pageNumber && styles.paginationBoxActive,
                              ]}
                              onPress={() => setCurrentPage(pageNumber)}
                            >
                              <Text
                                style={[
                                  styles.paginationBoxText,
                                  currentPage === pageNumber && styles.paginationBoxTextActive,
                                ]}
                              >
                                {pageNumber}
                              </Text>
                            </TouchableOpacity>
                          )
                        )}
                        <TouchableOpacity
                          disabled={currentPage === totalPages}
                          onPress={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          style={styles.paginationArrowButton}
                        >
                          <Ionicons
                            name="chevron-forward"
                            size={24}
                            color={currentPage === totalPages ? Colors.textMedium : Colors.textDark}
                          />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </>
              )
            ) : loans.length > 0 ? (
              loans.map((loan) => (
                <View key={loan._id} style={styles.loanCard}>
                  <View style={styles.cardHeader}>
                    <View style={styles.iconContainer}>
                      <Ionicons
                        name="wallet-outline"
                        size={28}
                        color={Colors.cardBackground}
                      />
                    </View>
                    <View style={styles.cardTitleContainer}>
                      <Text style={styles.cardTitle}>Loan Account</Text>
                      <Text style={styles.cardSubtitle}>
                        ID: {loan.loan_id.substring(0, 10)}...
                      </Text>
                    </View>
                  </View>
                  <View style={styles.detailsRow}>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Amount</Text>
                      <Text style={styles.detailValue}>
                        ₹ {formatNumberIndianStyle(loan.loan_amount)}
                      </Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Tenure</Text>
                      <Text style={styles.detailValue}>{loan.tenure} days</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Start Date</Text>
                      <Text style={styles.detailValue}>
                        {new Date(loan.start_date).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.viewPaymentsButton}
                    onPress={() => {
                      setLoanId(loan._id);
                      setCurrentPage(1);
                    }}
                  >
                    <Text style={styles.viewPaymentsButtonText}>
                      View Payments & Details
                    </Text>
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <View style={styles.noLoanContainer}>
                <View style={styles.noLoanHeader}>
                  <Ionicons name="rocket-outline" size={60} color={Colors.cardBackground} />
                  <Text style={styles.noLoanTitle}>Unlock Your Potential</Text>
                </View>
                <Text style={styles.noLoanMessage}>
                  You currently have no active loans. Ready to make a move?
                  Take a loan and enjoy the flexibility our financing plans offer.
                </Text>
                <View style={styles.contactGroup}>
                  <Text style={styles.noLoanSubMessage}>
                    Contact our executive to get started:
                  </Text>
                  <TouchableOpacity onPress={handlePhonePress} style={styles.contactButtonPhone}>
                    <Ionicons name="call-outline" size={20} color={Colors.cardBackground} />
                    <Text style={styles.contactButtonText}>
                      Call Us Now: {CONTACT_PHONE}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleEmailPress} style={styles.contactButtonEmail}>
                    <Ionicons name="mail-outline" size={20} color={Colors.primaryViolet} />
                    <Text style={styles.contactButtonTextEmail}>Email: {CONTACT_EMAIL}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>
        )}
      </View>
      <Toast />
    </SafeAreaView>
  );
};

// Header styles
const headerStyles = StyleSheet.create({
  headerContainer: {
    padding: 15,
    backgroundColor: Colors.primaryViolet,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.cardBackground,
  },
  headerBackButton: {
    position: "absolute",
    left: 15,
    top: 15,
    zIndex: 10,
  },
});

// Full MyLoan styles
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.primaryViolet,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  outerBoxContainer: {
    flex: 1,
    backgroundColor: Colors.screenBackground,
    margin: 10,
    borderRadius: 20,
    overflow: "hidden",
  },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center", minHeight: 200 },
  innerContentArea: {
    flexGrow: 1,
    backgroundColor: Colors.cardBackground,
    padding: 25,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  titleContainer: { marginBottom: 20, alignItems: "center" },
  sectionTitle: { fontSize: 26, fontWeight: "900", color: Colors.textDark, marginTop: 5 },
  subHeading: { fontSize: 13, color: Colors.textMedium, textAlign: "center" },
  errorText: { textAlign: "center", color: Colors.redError, marginTop: 20, fontSize: 16, fontWeight: "600" },
  loanCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  summaryCard: { borderLeftWidth: 5, borderLeftColor: Colors.primaryViolet },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  iconContainer: {
    backgroundColor: Colors.primaryViolet,
    padding: 10,
    borderRadius: 10,
    marginRight: 10,
  },
  cardTitleContainer: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: "bold", color: Colors.textDark },
  cardSubtitle: { fontSize: 12, color: Colors.textMedium },
  detailValue: { fontSize: 16, fontWeight: "600", color: Colors.textDark },
  summaryValue: { fontSize: 20, fontWeight: "bold", color: Colors.primaryViolet },
  detailsRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  detailItem: { flex: 1, marginRight: 10 },
  detailLabel: { fontSize: 12, color: Colors.textMedium },
  viewPaymentsButton: {
    marginTop: 10,
    backgroundColor: Colors.primaryViolet,
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  viewPaymentsButtonText: { color: Colors.cardBackground, fontWeight: "bold" },
  paymentHistoryTitle: { fontSize: 16, fontWeight: "bold", marginTop: 15, marginBottom: 10 },
  paymentCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#F5F5F7",
    borderRadius: 10,
    marginBottom: 8,
  },
  paymentDetailsRow: { flexDirection: "row", flex: 1, alignItems: "center", marginLeft: 10 },
  receiptText: { fontSize: 14, fontWeight: "600", color: Colors.textDark },
  dateText: { fontSize: 12, color: Colors.textMedium },
  amountText: { fontSize: 14, fontWeight: "bold", color: Colors.primaryViolet },
  emptyText: { textAlign: "center", color: Colors.textMedium, marginTop: 20 },
  paginationContainer: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 10 },
  paginationBox: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginHorizontal: 3,
    borderRadius: 5,
    backgroundColor: Colors.paginationInactive,
  },
  paginationBoxActive: { backgroundColor: Colors.paginationActive },
  paginationBoxText: { color: Colors.paginationInactiveText },
  paginationBoxTextActive: { color: Colors.paginationActiveText },
  paginationEllipsis: { marginHorizontal: 5, fontSize: 16, color: Colors.textMedium },
  paginationArrowButton: { padding: 5 },
  noLoanContainer: { alignItems: "center", marginTop: 20 },
  noLoanHeader: { alignItems: "center", marginBottom: 10 },
  noLoanTitle: { fontSize: 20, fontWeight: "bold", color: Colors.textDark },
  noLoanMessage: { fontSize: 14, textAlign: "center", marginVertical: 10, color: Colors.textMedium },
  contactGroup: { marginTop: 15, width: "100%" },
  noLoanSubMessage: { fontSize: 14, color: Colors.textDark, marginBottom: 10 },
  contactButtonPhone: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.primaryViolet, padding: 10, borderRadius: 8, marginBottom: 8 },
  contactButtonEmail: { flexDirection: "row", alignItems: "center", backgroundColor: "#EDE7F6", padding: 10, borderRadius: 8 },
  contactButtonText: { color: Colors.cardBackground, marginLeft: 10, fontWeight: "bold" },
  contactButtonTextEmail: { color: Colors.primaryViolet, marginLeft: 10, fontWeight: "bold" },
});

export default MyLoan;
