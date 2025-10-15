
import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
  Linking,
} from "react-native";
import Header from "../components/layouts/Header";
import { ContextProvider } from "../context/UserProvider";
const { width, height } = Dimensions.get("window");
const Privacy = ({ route, navigation }) => {
  const { userName, userNumber } = route.params || {};
  const [appUser] = useContext(ContextProvider);
  const userId = appUser.userId || {};
  const handleLinkPress = (url) => {
    Linking.openURL(url).catch((err) =>
      console.error("Couldn't load page", err)
    );
  };
  return (
    <SafeAreaView style={styles.violetBackgroundContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#6A0DAD" />
      <Header
        title="Privacy Policy"
        userId={userId}
        userName={userName}
        userNumber={userNumber}
        navigation={navigation}
      />
      <ScrollView
        style={styles.scrollViewStyle}
        contentContainerStyle={styles.whiteContentContainer}
      >
        <View style={styles.innerContentPadding}>
          <Text style={styles.header}>Privacy Policy</Text>
          <View>
            <Text style={styles.paragraph}>
              For the purpose of this privacy policy,{" "}
              <Text style={styles.boldText}>"We"</Text>,{" "}
              <Text style={styles.boldText}>"Us"</Text>,{" "}
              <Text style={styles.boldText}>"Our"</Text>,{" "}
              <Text style={styles.boldText}>"Company"</Text> means VIJAYA
              VINAYAK CHITFUNDS PRIVATE LIMITED and{" "}
              <Text style={styles.boldText}>"You"</Text>,{" "}
              <Text style={styles.boldText}>"Your"</Text> and{" "}
              <Text style={styles.boldText}>"User"</Text> means any person who
              accesses or uses our website/application. This website is owned
              and operated by the Company.
            </Text>
            <Text style={styles.paragraph}>
              This Data Policy applies to{" "}
              <Text
                style={styles.linkText}
                onPress={() => handleLinkPress("https://mychits.co.in/")}
              >
                https://mychits.co.in/
              </Text>
              , the website (<Text style={styles.boldText}>"Website"</Text>) and
              the 'MyChits' Mobile Application (
              <Text style={styles.boldText}>"App"</Text>). This Data Privacy
              Policy describes practices for handling User information collected
              in connection with the services rendered by this Website and App.
            </Text>
            <Text style={styles.paragraph}>
              VIJAYA VINAYAK CHITFUNDS PRIVATE LIMITED and their affiliates are
              committed to protecting and respecting User privacy and providing
              you with the information, options and choices necessary for you to
              control how we use your information. This Privacy Policy describes
              how the Website collects and uses personal information to provide
              services operated by or on behalf of the Website/App. This Privacy
              Policy is to be read along with the Terms of Use available at{" "}
              <Text
                style={styles.linkText}
                onPress={() => handleLinkPress("https://mychits.co.in/")}
              >
                https://mychits.co.in/
              </Text>
            </Text>
          </View>
          <Text style={styles.sectionTitle}>This Policy Sets Out:</Text>
          <View>
            <View style={styles.bulletPointContainer}>
              <Text style={styles.bulletIcon}>•</Text>
              <Text style={styles.bulletText}>Collection of Information</Text>
            </View>
            <View style={styles.bulletPointContainer}>
              <Text style={styles.bulletIcon}>•</Text>
              <Text style={styles.bulletText}>Usage of Information</Text>
            </View>
            <View style={styles.bulletPointContainer}>
              <Text style={styles.bulletIcon}>•</Text>
              <Text style={styles.bulletText}>
                Promotional Updates and Communications
              </Text>
            </View>
            <View style={styles.bulletPointContainer}>
              <Text style={styles.bulletIcon}>•</Text>
              <Text style={styles.bulletText}>Information Sharing</Text>
            </View>
            <View style={styles.bulletPointContainer}>
              <Text style={styles.bulletIcon}>•</Text>
              <Text style={styles.bulletText}>Storage of Information</Text>
            </View>
            <View style={styles.bulletPointContainer}>
              <Text style={styles.bulletIcon}>•</Text>
              <Text style={styles.bulletText}>Data Retention</Text>
            </View>
            <View style={styles.bulletPointContainer}>
              <Text style={styles.bulletIcon}>•</Text>
              <Text style={styles.bulletText}>Data Transfers</Text>
            </View>
            <View style={styles.bulletPointContainer}>
              <Text style={styles.bulletIcon}>•</Text>
              <Text style={styles.bulletText}>Amendments to Policy</Text>
            </View>
          </View>
          <Text style={styles.sectionTitle}>Collection of Information</Text>
          <Text style={styles.paragraph}>
            The following information may be collected or received by Us:
          </Text>
          <Text style={styles.subSectionTitle}>
            Direct Sharing of Information by the User:
          </Text>
          <Text style={styles.paragraph}>
            In the course of registering for and availing the various services
            we provide from time to time through the Website/App, we directly
            collect information containing User - name, address, contact number,
            email address and the chit fund(s) that are being subscribed to by
            the User.
          </Text>
          <Text style={styles.paragraph}>
            You acknowledge that you are disclosing User Information
            voluntarily. Prior to the completion of any registration process on
            the Website/App or prior to availing any services offered on our
            website, if you wish not to disclose any Personal Information you
            may refrain from doing so; however, if you don’t provide information
            that is requested, it is possible that the registration process
            would be incomplete and/or you may not be able to avail our Services.
          </Text>
          <Text style={styles.subSectionTitle}>
            Information being collected automatically by the Website/App:
          </Text>
          <Text style={styles.paragraph}>
            Internet protocol (IP) address, browser type, mobile device identifier,
            Internet service provider, operating system, pages that have been visited
            before and after using the Website, the date and time of visit, information
            about the links clicked and pages viewed within the Website/App, and other
            standard server log information may be collected automatically by
            visiting the Website/App. The Website uses cookies and similar technologies
            to automatically collect this information. By using the Website, you
            consent to the Website's use of cookies and similar technologies.
          </Text>
          <Text style={styles.subSectionTitle}>Device information:</Text>
          <Text style={styles.paragraph}>
            The devices used (mobile phones, computers, tablets, etc.) to access
            Website services such as the hardware models, operating system
            information, software information and version, file names, language
            preferences, IP address, cookie information, advertising identifiers,
            browser version, device settings, and mobile network information.
            The Website may recognize the User's devices to provide personalized
            experiences and advertising across the services available.
          </Text>
          <Text style={styles.subSectionTitle}>Camera & storage:</Text>
          <Text style={styles.paragraph}>
            To upload image or photo and proofs related to KYC and document upload.
          </Text>
          <Text style={styles.subSectionTitle}>Location:</Text>
          <Text style={styles.paragraph}>
            MyChits collects and monitors information about the location of your
            device for risk assessment.
          </Text>
          <Text style={styles.subSectionTitle}>Phone:</Text>
          <Text style={styles.paragraph}>
            MyChits collects, monitors, transmits, syncs, and stores specific
            information about your device including storage, hardware model,
            operating system and version, unique device identifier, wi-fi
            information, mobile network information, and information about your
            device's interaction with our service to uniquely identify the
            devices, to ensure that unauthorized devices are not able to act on
            your behalf and to prevent fraud.
          </Text>
          <Text style={styles.subSectionTitle}>Information Sharing:</Text>
          <Text style={styles.paragraph}>
            MyChits will not sell or rent your Information to anyone, for any
            reason, at any time. However, we will share your Information with our
            financial partners, affiliates and business partners, and the User hereby
            consents to the same. We will take reasonable steps to ensure that these third-party
            service providers are obligated to protect your information and are also subject to confidentiality/non-disclosure
            obligations and comply with the applicable data protection laws.
          </Text>
          <Text style={styles.subSectionTitle}>
            Information received from other sources:
          </Text>
          <View>
            <View style={styles.bulletPointContainer}>
              <Text style={styles.bulletIcon}>•</Text>
              <Text style={styles.bulletText}>
                If there is use of any of the other websites or apps we operate, or other services provided by us.
              </Text>
            </View>
            <View style={styles.bulletPointContainer}>
              <Text style={styles.bulletIcon}>•</Text>
              <Text style={styles.bulletText}>
                From third parties through whom the User is able to access or register for the services (e.g. logging in with a Google account).
              </Text>
            </View>
            <View style={styles.bulletPointContainer}>
              <Text style={styles.bulletIcon}>•</Text>
              <Text style={styles.bulletText}>
                From third parties that are closely worked with.
              </Text>
            </View>
          </View>
          <Text style={styles.paragraph}>
            In case the Website/App receives or collects any such data as
            mentioned, the User will be informed when such data is being collected and if such data is intended to be shared internally
            and/or combined with data automatically collected on the Website/App. The purpose of such usage shall also be intimated to the User.
          </Text>
          <Text style={styles.paragraph}>
            The Website/App works closely with third parties (including but not limited to business partners, sub-contractors, payment services,
            advertising networks, analytics providers, and search information providers). The User will be notified when and if the Website/App receives
            information about the User from such third parties and the purposes for which it intends to use that information.
          </Text>
          <Text style={styles.paragraph}>
            The User may be given the option to access or register for any and all services through the use of a user name and password (or any other identifier)
            for services provided by third parties (each, an <Text style={styles.boldText}>"Integrated Service"</Text>), such as via your Google account,
            accounts with payment systems or wallet providers, or otherwise authorizing an integrated service to provide personal data to the Website/App.
            By authorizing the Website/App to connect with an Integrated Service, the User authorizes us to access and store their personal data that the
            Integrated Service makes available to the Website/App, and to use and disclose it in accordance with this policy. Please review the terms and conditions
            of each integrated service carefully before using their services and integrating with our services. Check your privacy settings on each integrated
            device to understand what personal data is shared.
          </Text>
          <Text style={styles.paragraph}>
            Depending on the nature of dealings with the User and/or the services provided, the Website/App may collect other types of personal data from third parties, including:
          </Text>
          <View>
            <View style={styles.bulletPointContainer}>
              <Text style={styles.bulletIcon}>•</Text>
              <Text style={styles.bulletText}>
                Personal data relating to any complaints you make or that are made about you, including call recordings.
              </Text>
            </View>
            <View style={styles.bulletPointContainer}>
              <Text style={styles.bulletIcon}>•</Text>
              <Text style={styles.bulletText}>
                Personal data collected and held via financial or payment systems regarding payment mechanism details
                (such as credit card, debit card, or UPI details) and payments for any services procured via the Website/App.
              </Text>
            </View>
            <View style={styles.bulletPointContainer}>
              <Text style={styles.bulletIcon}>•</Text>
              <Text style={styles.bulletText}>
                Personal data collected by third-party marketing, survey, and advertising service providers.
              </Text>
            </View>
            <View style={styles.bulletPointContainer}>
              <Text style={styles.bulletIcon}>•</Text>
              <Text style={styles.bulletText}>
                Personal data provided to any partners through which the User creates or accesses their account for the services,
                such as employee information provided to companies engaging in our corporate or other services, payment providers,
                or other integrated websites (such as search engines).
              </Text>
            </View>
            <View style={styles.bulletPointContainer}>
              <Text style={styles.bulletIcon}>•</Text>
              <Text style={styles.bulletText}>
                Device-related or device-generated personal data including device details, device IDs, location, network connections,
                network access, and session data. Location data may also be derived from IP addresses, mobile numbers, and network information.
              </Text>
            </View>
          </View>
          <Text style={styles.sectionTitle}>Usage of Information</Text>
          <Text style={styles.paragraph}>
            Information collected by the Website will help enhance the design and implementation of our services on the Website/App.
            The Services may also use information provided by the User to operate and improve functionality. In addition, such information
            will be used for fulfilling contracts or service obligations between the User and us, including:
          </Text>
          <View>
            <View style={styles.bulletPointContainer}>
              <Text style={styles.bulletIcon}>•</Text>
              <Text style={styles.bulletText}>
                Administering the User account within the site;
              </Text>
            </View>
            <View style={styles.bulletPointContainer}>
              <Text style={styles.bulletIcon}>•</Text>
              <Text style={styles.bulletText}>
                Verification of any financial transactions conducted via the site and/or App.
              </Text>
            </View>
            <View style={styles.bulletPointContainer}>
              <Text style={styles.bulletIcon}>•</Text>
              <Text style={styles.bulletText}>
                Providing information about available goods and services to tailor content:
                <View style={styles.nestedBulletContainer}>
                  <View style={styles.bulletPointContainer}>
                    <Text style={styles.nestedBulletIcon}>-</Text>
                    <Text style={styles.bulletText}>
                      To present the content in the most effective manner.
                    </Text>
                  </View>
                  <View style={styles.bulletPointContainer}>
                    <Text style={styles.nestedBulletIcon}>-</Text>
                    <Text style={styles.bulletText}>
                      To provide products and services requested by the User.
                    </Text>
                  </View>
                </View>
              </Text>
            </View>
          </View>
          <Text style={styles.subSectionTitle}>
            Information collected by the User from use of Services:
          </Text>
          <Text style={styles.paragraph}>
            We will use information for our legitimate interests, provided these do not override the User’s rights:
          </Text>
          <View>
            <View style={styles.bulletPointContainer}>
              <Text style={styles.bulletIcon}>•</Text>
              <Text style={styles.bulletText}>
                To administer the Services and for internal operations including troubleshooting, data analysis, and research.
              </Text>
            </View>
            <View style={styles.bulletPointContainer}>
              <Text style={styles.bulletIcon}>•</Text>
              <Text style={styles.bulletText}>
                To keep the Services safe and secure.
              </Text>
            </View>
            <View style={styles.bulletPointContainer}>
              <Text style={styles.bulletIcon}>•</Text>
              <Text style={styles.bulletText}>
                To measure and understand the effectiveness of advertising and provide relevant ads.
              </Text>
            </View>
            <View style={styles.bulletPointContainer}>
              <Text style={styles.bulletIcon}>•</Text>
              <Text style={styles.bulletText}>
                To improve the Services, ensuring content is effectively presented.
              </Text>
            </View>
            <View style={styles.bulletPointContainer}>
              <Text style={styles.bulletIcon}>•</Text>
              <Text style={styles.bulletText}>
                To allow you to participate in interactive features if you choose.
              </Text>
            </View>
          </View>
          <Text style={styles.subSectionTitle}>
            User Information received from other sources:
          </Text>
          <Text style={styles.paragraph}>
            The Website will combine such information with that provided by the User, and use it for the purposes mentioned above.
          </Text>
          <Text style={styles.sectionTitle}>
            Promotional Updates and Communications
          </Text>
          <Text style={styles.paragraph}>
            The Website/App will share promotional updates with your consent or, where applicable, in our legitimate interest.
          </Text>
          <Text style={styles.paragraph}>
            When permitted in our legitimate interest, we may use your personal information for marketing analysis and to send promotional updates by email,
            phone, text, in-app, or push notifications. The Website may also share your personal information with third-party social media and partner
            platforms for such updates.
          </Text>
          <Text style={styles.paragraph}>
            You can object to further marketing at any time via your profile settings or by selecting the "unsubscribe" link in our communications.
          </Text>
          <Text style={styles.paragraph}>
            By using and registering on the Website/App, you authorize us and our partners to contact you for product updates, promotional offers,
            and web aggregation, including via email, phone, or SMS for a period of 90 days from registration.
          </Text>
          <Text style={styles.paragraph}>
            Additionally, by registering, you authorize us to send SMS/email alerts for your login details, service requirements, or advertising messages.
            If we call you for further details, you authorize us to record the conversation for quality and training purposes.
          </Text>
          <Text style={styles.sectionTitle}>Sharing of Information</Text>
          <Text style={styles.paragraph}>
            We may share your information with certain third parties as outlined below:
          </Text>
          <Text style={styles.subSectionTitle}>
            Authorized third-party vendors and service providers.
          </Text>
          <Text style={styles.paragraph}>
            Your information may be shared with service providers who support the Website/App, such as technical infrastructure, analytics, and data processing,
            in accordance with applicable Data Protection Laws.
          </Text>
          <Text style={styles.paragraph}>
            Information may also be shared with partners ("Partners") or with any member of our group – including subsidiaries – who support personal data processing.
          </Text>
          <Text style={styles.subSectionTitle}>
            Disclosure to respond to legal obligations:
          </Text>
          <Text style={styles.paragraph}>
            We may disclose your information to comply with subpoenas, court orders, legal process, or law enforcement requests, and to protect the rights,
            interests, safety, and security of the Website, affiliates, users, or the public.
          </Text>
          <Text style={styles.subSectionTitle}>
            Sharing in connection with corporate transactions:
          </Text>
          <Text style={styles.paragraph}>
            Information may be shared in relation to a significant corporate transaction, such as a sale, merger, consolidation, or bankruptcy.
          </Text>
          <Text style={styles.subSectionTitle}>
            Sharing for other disclosed purposes:
          </Text>
          <Text style={styles.paragraph}>
            If you request services as a customer, we will share only the information necessary to facilitate those services.
          </Text>
          <Text style={styles.subSectionTitle}>
            Sharing via third-party services:
          </Text>
          <Text style={styles.paragraph}>
            Third-party services accessed through the Website/App may collect your information in accordance with their own privacy policies.
          </Text>
          <Text style={styles.paragraph}>
            We do not sell or rent your information except as specifically provided herein. We may share or transfer your information to an affiliate or partner
            under agreed terms and in accordance with this policy.
          </Text>
          <Text style={styles.subSectionTitle}>
            Legal obligations for processing Information:
          </Text>
          <Text style={styles.paragraph}>
            The Website/App relies on various legal bases for processing data, including:
          </Text>
          <View>
            <View style={styles.bulletPointContainer}>
              <Text style={styles.bulletIcon}>•</Text>
              <Text style={styles.bulletText}>
                As necessary to fulfill site Terms;
              </Text>
            </View>
            <View style={styles.bulletPointContainer}>
              <Text style={styles.bulletIcon}>•</Text>
              <Text style={styles.bulletText}>
                Consistent with your consent, which can be withdrawn at any time;
              </Text>
            </View>
            <View style={styles.bulletPointContainer}>
              <Text style={styles.bulletIcon}>•</Text>
              <Text style={styles.bulletText}>
                As necessary to comply with legal obligations;
              </Text>
            </View>
            <View style={styles.bulletPointContainer}>
              <Text style={styles.bulletIcon}>•</Text>
              <Text style={styles.bulletText}>
                To protect your vital interests or those of others;
              </Text>
            </View>
            <View style={styles.bulletPointContainer}>
              <Text style={styles.bulletIcon}>•</Text>
              <Text style={styles.bulletText}>
                As necessary in the public interest; and
              </Text>
            </View>
            <View style={styles.bulletPointContainer}>
              <Text style={styles.bulletIcon}>•</Text>
              <Text style={styles.bulletText}>
                For our or third parties’ legitimate interests, unless overridden by your rights or freedoms.
              </Text>
            </View>
          </View>
          <Text style={styles.paragraph}>
            You may withdraw consent at any time; however, this will not affect the lawfulness of processing based on your consent prior to withdrawal.
          </Text>
          <Text style={styles.paragraph}>
            Under applicable laws, you have the:
          </Text>
          <View>
            <View style={styles.bulletPointContainer}>
              <Text style={styles.bulletIcon}>•</Text>
              <Text style={styles.bulletText}>
                Right to access, rectify, port, and erase your information,
              </Text>
            </View>
            <View style={styles.bulletPointContainer}>
              <Text style={styles.bulletIcon}>•</Text>
              <Text style={styles.bulletText}>
                Right to restrict or object to certain processing activities.
              </Text>
            </View>
            <View style={styles.bulletPointContainer}>
              <Text style={styles.bulletIcon}>•</Text>
              <Text style={styles.bulletText}>
                Right to withdraw consent for processing of your personal data.
              </Text>
            </View>
            <View style={styles.bulletPointContainer}>
              <Text style={styles.bulletIcon}>•</Text>
              <Text style={styles.bulletText}>
                Right to object to processing for direct marketing by contacting{" "}
                <Text
                  style={styles.linkText}
                  onPress={() => handleLinkPress("mailto:admin@mychits.co.in")}
                >
                  admin@mychits.co.in
                </Text>
              </Text>
            </View>
            <View style={styles.bulletPointContainer}>
              <Text style={styles.bulletIcon}>•</Text>
              <Text style={styles.bulletText}>
                Right to opt out of further access and deletion of your personal information.
              </Text>
            </View>
          </View>
          <Text style={styles.paragraph}>
            You may delete your information at any time by contacting{" "}
            <Text
              style={styles.linkText}
              onPress={() => handleLinkPress("mailto:admin@mychits.co.in")}
            >
              admin@mychits.co.in
            </Text>
            . All information collected (such as cookies and data given under this policy)
            shall be deleted accordingly.
          </Text>
          <Text style={styles.sectionTitle}>Storage of Information</Text>
          <Text style={styles.subSectionTitle}>Data Storage:</Text>
          <Text style={styles.paragraph}>
            You acknowledge that all information, content and data entered into the Website/App will be securely stored at designated data centres.
            We use physical and technical measures (including encrypted data connections and storage, firewalls, and surveillance) to protect your data.
          </Text>
          <Text style={styles.subSectionTitle}>Payment:</Text>
          <Text style={styles.paragraph}>
            Payment details you provide will be encrypted using SSL technology when submitted to the Website.
            Payments made on the Website/App are processed via our payment gateway provider Hypto.
          </Text>
          <Text style={styles.subSectionTitle}>Security Disclosure:</Text>
          <Text style={styles.paragraph}>
            While we strive to use commercially acceptable means to protect your data,
            no method of transmission or electronic storage is 100% secure.
          </Text>
          <Text style={styles.sectionTitle}>Data Retention</Text>
          <Text style={styles.paragraph}>
            The Website/App will retain your personal data:
          </Text>
          <View>
            <View style={styles.bulletPointContainer}>
              <Text style={styles.bulletIcon}>•</Text>
              <Text style={styles.bulletText}>
                As long as your account is active to meet contractual obligations;
              </Text>
            </View>
            <View style={styles.bulletPointContainer}>
              <Text style={styles.bulletIcon}>•</Text>
              <Text style={styles.bulletText}>
                For 3 months after termination or account closure to resolve any issues or legal proceedings.
              </Text>
            </View>
          </View>
          <Text style={styles.paragraph}>
            We may retain information beyond this period for research purposes or service improvements with your consent.
          </Text>
          <Text style={styles.paragraph}>
            Generally, data is kept only as long as necessary to serve its original purpose.
          </Text>
          <Text style={styles.sectionTitle}>Data Transfers</Text>
          <Text style={styles.paragraph}>
            Standard contract clauses govern data transfers across countries in compliance with applicable laws.
          </Text>
          <Text style={styles.sectionTitle}>Amendments to Policy</Text>
          <Text style={styles.paragraph}>
            Any future changes to this policy will be posted on this page and, for substantive changes, you will be notified via e-mail.
            We encourage you to review this policy periodically for updates.
          </Text>
          <Text style={[styles.paragraph, styles.lastUpdated]}>
            This policy was last updated on 21/05/2025.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  violetBackgroundContainer: {
    flex: 1,
    backgroundColor: "#6A0DAD", // Primary violet background for the safe area
    paddingTop: StatusBar.currentHeight || 0,
  },
  scrollViewStyle: {
    flex: 1,
    backgroundColor: "#6A0DAD", // Same violet background for seamless integration
  },
  whiteContentContainer: {
    backgroundColor: "#fff", // Light violet tone for the neumorphic card feel
    borderRadius: 30,
    marginHorizontal: width * 0.04,
    marginTop: height * 0.02,
    marginBottom: height * 0.04,
    shadowColor: "rgba(174, 174, 192, 0.5)",
    shadowOffset: { width: -10, height: -10 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 10,
    ...Platform.select({
      ios: {
        shadowColor: "rgba(94, 104, 121, 0.5)",
        shadowOffset: { width: 10, height: 10 },
        shadowOpacity: 1,
        shadowRadius: 12,
      },
      android: {},
    }),
  },
  innerContentPadding: {
    paddingHorizontal: width * 0.06,
    paddingTop: height * 0.04,
    paddingBottom: height * 0.1,
  },
  header: {
    fontSize: width * 0.085,
    fontWeight: "bold",
    color: "#6A0DAD",
    marginBottom: height * 0.02,
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  sectionTitle: {
    fontSize: width * 0.068,
    fontWeight: "600",
    color: "#6A0DAD",
    marginTop: height * 0.05,
    marginBottom: height * 0.018,
    textAlign: "left",
    textTransform: "capitalize",
    letterSpacing: 1.3,
    borderBottomWidth: 2,
    borderColor: "#D0E0FF",
    paddingBottom: height * 0.015,
  },
  subSectionTitle: {
    fontSize: width * 0.055,
    fontWeight: "bold",
    color: "#6A0DAD",
    marginTop: height * 0.03,
    marginBottom: height * 0.01,
    textAlign: "left",
  },
  paragraph: {
    fontSize: width * 0.046,
    lineHeight: width * 0.075,
    color: "#333",
    marginBottom: height * 0.025,
    textAlign: "justify",
    fontWeight: "400",
  },
  boldText: {
    fontWeight: "bold",
    color: "#6A0DAD",
  },
  linkText: {
    color: "#8E44AD",
    textDecorationLine: "underline",
  },
  lastUpdated: {
    textAlign: "right",
    fontSize: width * 0.038,
    marginTop: height * 0.04,
    color: "#666",
  },
  bulletPointContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: height * 0.015,
    marginLeft: width * 0.02,
  },
  bulletIcon: {
    fontSize: width * 0.055,
    color: "#8E44AD", // Violet accent for bullet icons
    marginRight: width * 0.025,
  },
  bulletText: {
    flex: 1,
    fontSize: width * 0.046,
    lineHeight: width * 0.075,
    color: "#444",
    fontWeight: "400",
  },
  nestedBulletContainer: {
    marginLeft: width * 0.04,
    marginTop: height * 0.01,
  },
  nestedBulletIcon: {
    fontSize: width * 0.045,
    color: "#666",
    marginRight: width * 0.015,
  },
});
export default Privacy;