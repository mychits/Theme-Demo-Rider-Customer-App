import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import url from "../data/url";
import Header from "../components/layouts/Header";
import { ContextProvider } from "../context/UserProvider";

const Profile = ({ navigation }) => {
  const [appUser, setAppUser] = useContext(ContextProvider);
  const userId = appUser.userId || {};
  const [userData, setUserData] = useState({
    full_name: "",
    phone_number: "",
    address: "",
  });

  const menuItems = [
    { title: "Basic Details", icon: "person", link: "MyAccount" },
    { title: "About Us", icon: "info", link: "About" },
    { title: "Privacy Policy", icon: "privacy-tip", link: "Privacy" },
    { title: "Help", icon: "help-outline", link: "Help" },
    { title: "F&Q", icon: "question-answer", link: "Fq" },
    { title: "Reset Password", icon: "lock-reset", link: "ConformNewPassword" },
  ];

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`${url}/user/get-user-by-id/${userId}`);
        setUserData(response.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [userId]);

  return (
    <SafeAreaView style={styles.fullScreenContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#6A0DAD" />
      <View style={styles.headerWrapper}>
        <Header userId={userId} navigation={navigation} />
      </View>

      <View style={styles.mainContentWrapper}>
        <View style={styles.contentCard}>
          <Text style={styles.titleText}>My Profile</Text>

          <View style={styles.profileImageContainer}>
            <Image
              source={require("../../assets/profile (2).png")}
              style={styles.profileImage}
            />
            <Text style={styles.userName}>{userData.full_name}</Text>
            <Text style={styles.phoneNumber}>{userData.phone_number}</Text>
          </View>

          <ScrollView
            style={styles.menuContainer}
            showsVerticalScrollIndicator={false}
          >
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.menuItem}
                onPress={() =>
                  navigation.navigate(item.link, { userId: userId })
                }
              >
                <View style={styles.menuItemLeft}>
                  <MaterialIcons name={item.icon} size={24} color="#6A0DAD" />
                  <Text style={styles.menuText}>{item.title}</Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#6A0DAD" />
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.logoutButton}
              onPress={() => navigation.navigate("Login")}
            >
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: "#6A0DAD", // Violet background
  },
  headerWrapper: {
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    backgroundColor: "#6A0DAD",
  },
  mainContentWrapper: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#6A0DAD",
    paddingVertical: 10,
  },
  contentCard: {
    flex: 1,
    backgroundColor: "#FFFFFF", // White card
    width: "95%",
    borderRadius: 14,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
  titleText: {
    fontWeight: "900",
    fontSize: 22,
    color: "#6A0DAD",
    textAlign: "center",
    marginBottom: 10,
  },
  profileImageContainer: {
    alignItems: "center",
    marginBottom: 15,
  },
  profileImage: {
    width: 75,
    height: 75,
    borderRadius: 75,
    marginBottom: 10,
    borderWidth: 3,
    borderColor: "#6A0DAD",
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 3,
  },
  phoneNumber: {
    fontSize: 15,
    color: "#333333",
  },
  menuContainer: {
    width: "100%",
    paddingBottom: 70,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F9F6FF", // Light violet-white tone
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E2D4F5",
    shadowColor: "#6A0DAD",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuText: {
    fontSize: 15,
    color: "#000",
    marginLeft: 15,
    fontWeight: "500",
  },
  logoutButton: {
    paddingVertical: 13,
    alignItems: "center",
    backgroundColor: "#6A0DAD",
    borderRadius: 12,
    marginHorizontal: 40,
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  logoutText: {
    fontSize: 17,
    color: "#fff",
    fontWeight: "bold",
  },
});

export default Profile;
