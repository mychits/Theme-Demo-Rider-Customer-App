
import React, { useContext, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Platform,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Header from "../components/layouts/Header";
import { ContextProvider } from "../context/UserProvider";
const { width, height } = Dimensions.get("window");
const Fq = ({ route, navigation }) => {
  const [appUser] = useContext(ContextProvider);
  const userId = appUser.userId || {};
  const [openIndex, setOpenIndex] = useState(null);
  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };
  const faqData = [
    {
      question: "Is MyChits a safe investment option?",
      answer:
        "Yes, MyChits has a proven track record of over 31 years without any defaults in repayment, ensuring the safety of your money. In case of rare delayed payments, they compensate by paying interest for the delay.",
    },
    {
      question: "What is the role of sureties or guarantors?",
      answer:
        "MyChits requires a minimum of three sureties or guarantors, excluding family members, to safeguard the interests of all non-prized subscribers.",
    },
    {
      question: "Why should I choose MyChits?",
      answer:
        "MyChits is a trusted choice due to its professional management and solid history since 1981. Backed by the socially responsible Meenakshi Group, the company supports charitable causes and scholarships for underprivileged students.",
    },
    {
      question: "Can I withdraw from the chit group?",
      answer:
        "Yes, subscribers can withdraw from the chit group, and the actual amount paid by the subscriber minus company commission will be repaid at the end of the chit period.",
    },
    {
      question: "How does MyChits help with saving?",
      answer:
        "MyChits encourages regular and disciplined savings for planned and unplanned expenses, providing a better saving option for its subscribers.",
    },
    {
      question: "How many chits can I participate in within the same group?",
      answer:
        "Subscribers can participate in a maximum of three chits within the same chit group at MyChits.",
    },
    {
      question: "What is the difference between a prized and non-prized subscriber?",
      answer:
        "A prized subscriber is one who has either lifted their chit or received the chit amount after successful bidding. A non-prized subscriber is still part of the chit group and has not yet received the chit amount.",
    },
    {
      question: "What are the typical chit group durations offered by MyChits?",
      answer:
        "MyChits offers chit groups with durations typically ranging from 25 months, 40 months, or 50 months.",
    },
    {
      question: "What benefits does MyChits offer?",
      answer:
        "MyChits offers higher returns through chit dividends (12-18% per year) compared to traditional bank savings, along with easy access to funds at lower interest rates.",
    },
    {
      question: "What are the accepted modes of payment?",
      answer:
        "MyChits accepts various modes of payment, including cash, cheques, demand drafts, pay orders, and bank transfers.",
    },
    {
      question: "How can I withdraw the chit amount at a discount?",
      answer:
        "Subscribers avail themselves of the chit amount in the initial months at a discount, allowing them to withdraw more money than they have already paid. The excess amount is repaid through future installments.",
    },
    {
      question: "What are the benefits of joining a vacant chit?",
      answer:
        "Joining a vacant chit at MyChits allows the member to earn all the dividends accrued until the date of joining the group.",
    },
    {
      question: "Explain the auction discount and chit dividend.",
      answer:
        "The auction discount is the difference between the chit value and the amount at which a successful bidder takes the chit in a lottery auction. Chit dividend refers to the total group dividend, which is the auction discount minus the company's commission (5% of chit value), distributed equally among all subscribers.",
    },
    {
      question: "Is MyChits associated with Meenakshi Group?",
      answer:
        "Yes, MyChits is backed by the diverse Meenakshi Group, a socially responsible organization with interests in various industries.",
    },
  ];
  return (
    <SafeAreaView style={styles.violetBackgroundContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#6A0DAD" />
      <Header
        title="Frequently Asked Questions"
        userId={userId}
        navigation={navigation}
      />
      <ScrollView
        style={styles.scrollViewStyle}
        contentContainerStyle={styles.whiteContentContainer}
      >
        <Text style={styles.mainTitle}>Frequently Asked Questions</Text>
        {faqData.map((faq, index) => (
          <View key={index} style={styles.faqItem}>
            <TouchableOpacity
              style={[
                styles.questionButton,
                openIndex === index && styles.questionButtonOpen,
              ]}
              onPress={() => toggleAccordion(index)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.questionText,
                  openIndex === index && styles.questionTextOpen,
                ]}
              >
                {faq.question}
              </Text>
              <Ionicons
                name={openIndex === index ? "chevron-up" : "chevron-down"}
                size={width * 0.055}
                color={openIndex === index ? "#FFFFFF" : "#6A0DAD"}
              />
            </TouchableOpacity>
            {openIndex === index && (
              <View style={styles.answerPanel}>
                <Text style={styles.answerText}>{faq.answer}</Text>
              </View>
            )}
          </View>
        ))}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  violetBackgroundContainer: {
    flex: 1,
    backgroundColor: "#6A0DAD", // Primary violet background for the header area
    paddingTop: StatusBar.currentHeight || 0,
  },
  scrollViewStyle: {
    flex: 1,
    backgroundColor: "#6A0DAD", // Use same violet so the card appears to float
  },
  whiteContentContainer: {
    backgroundColor: "#FFFFFF", // White card to contrast the violet background
    borderRadius: 25,
    marginHorizontal: width * 0.04,
    marginTop: height * 0.02,
    marginBottom: height * 0.04,
    paddingVertical: height * 0.03,
    paddingHorizontal: width * 0.05,
    paddingBottom: height * 0.05,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#6A0DAD",
    marginBottom: height * 0.04,
    textAlign: "center",
    textTransform: "uppercase",
  },
  faqItem: {
    marginBottom: height * 0.015,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    shadowColor: "#A7B8D6",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  questionButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: height * 0.022,
    paddingHorizontal: width * 0.04,
    backgroundColor: "#F3EDFF", // Light violet background for questions
    borderWidth: 1,
    borderColor: "#E0D6FF",
    borderRadius: 12,
  },
  questionButtonOpen: {
    backgroundColor: "#6A0DAD", // Violet when open
    borderColor: "#6A0DAD",
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  questionText: {
    flex: 1,
    fontSize: width * 0.042,
    fontWeight: "600",
    color: "#333333",
    marginRight: width * 0.02,
  },
  questionTextOpen: {
    color: "#FFFFFF",
  },
  answerPanel: {
    paddingVertical: height * 0.025,
    paddingHorizontal: width * 0.04,
    backgroundColor: "#F7F2FF", // Soft lavender background for answers
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    borderWidth: 1,
    borderColor: "#D0C2FF",
    borderTopWidth: 0,
    marginTop: -1,
  },
  answerText: {
    fontSize: width * 0.038,
    lineHeight: width * 0.065,
    color: "#555555",
    textAlign: "justify",
  },
  bottomSpacer: {
    height: height * 0.05,
  },
});
export default Fq;