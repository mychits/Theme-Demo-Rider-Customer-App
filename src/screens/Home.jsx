import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import {
  View,Image,StyleSheet,Dimensions,Text, TouchableOpacity,Linking,StatusBar,SafeAreaView,
  FlatList,ActivityIndicator,BackHandler, ScrollView, Platform, Modal, Alert,Animated, PanResponder,TextInput,
} from 'react-native';
import { Ionicons, MaterialIcons, MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import url from '../data/url';
import { NetworkContext } from '../context/NetworkProvider';
import Toast from 'react-native-toast-message';
import { useFocusEffect, StackActions } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { ContextProvider } from '../context/UserProvider';
import CityChits from '../../assets/CityChits.png';

const screenWidth = Dimensions.get('window').width;
const Home = ({ route, navigation }) => {
  // Context & States
  const [appUser] = useContext(ContextProvider);
  const userId = appUser.userId || null;
  const insets = useSafeAreaInsets();
  const [greeting, setGreeting] = useState('');
  const [userData, setUserData] = useState({ full_name: '', phone_number: '', address: '' });
  const [isLoadingUserData, setIsLoadingUserData] = useState(true);
  const [userDataError, setUserDataError] = useState(null);
  const { isConnected, isInternetReachable } = useContext(NetworkContext);
  const [isHelpModalVisible, setHelpModalVisible] = useState(false);
  const [isSideMenuVisible, setSideMenuVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [relationshipManagers, setRelationshipManagers] = useState([]);
  const bannerImages = [
  { uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS7RoGJlPs8_9bAJzP7EcBFgh2n5EOTHGstsw&s' },
  { uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRjWelb8fKzz7Gn4uX9tlcaAlIFIFzJt4Joqw&s' },
    { uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRn8CmQKTuihGMhCuwW8Gjizbx0wKk5FSmtQQ&s' },
      { uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSZK_0mWCjonGnSkVhaz0RNpnKB4dhvF4cRAo5a7XoW9xs6t9ufqTH32xBAGpjPTsF0dAw&usqp=CAU' },

];
const [currentIndex, setCurrentIndex] = useState(0);
const flatListRef = useRef(null);

useEffect(() => {
  const interval = setInterval(() => {
    const nextIndex = (currentIndex + 1) % bannerImages.length;
    setCurrentIndex(nextIndex);
    flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
  }, 3000); // change every 3 seconds

  return () => clearInterval(interval);
}, [currentIndex]);

  // Animation for side menu
  const slideAnim = useRef(new Animated.Value(-screenWidth)).current;
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => isSideMenuVisible && gestureState.dx < -10,
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dx < 0)
          slideAnim.setValue(Math.max(gestureState.dx, -screenWidth));
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx < -screenWidth / 2) {
          closeSideMenu();
        } else {
          openSideMenu();
        }
      },
    })
  ).current;
  const openSideMenu = () => {
    if (!isConnected || !isInternetReachable) {
      Toast.show({
        type: 'error',
        text1: 'Offline',
        text2: 'Please connect to the internet to access menu options.',
        position: 'bottom',
        visibilityTime: 4000,
      });
      return;
    }
    setSideMenuVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };
  const closeSideMenu = () => {
    Animated.timing(slideAnim, {
      toValue: -screenWidth,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setSideMenuVisible(false));
  };
  
  // WhatsApp support handler
  const handleWhatsAppPress = async () => {
    const countryCode = '91';
    const localPhoneNumber = '9483900777';
    const fullPhoneNumber = `${countryCode}${localPhoneNumber}`;
    const message = "Hello, I need assistance with MyChits App.";
    const whatsappUrl = `https://wa.me/${fullPhoneNumber}?text=${encodeURIComponent(message)}`;
    try {
      const supported = await Linking.canOpenURL(whatsappUrl);
      if (supported) await Linking.openURL(whatsappUrl);
      else Alert.alert("WhatsApp Not Found", "Please install WhatsApp and try again.", [{ text: "OK" }]);
    } catch (error) {
      console.error("Error opening WhatsApp:", error);
      Alert.alert("Error", "Could not open WhatsApp. Please try again later.", [{ text: "OK" }]);
    }
  };
  // Rate App handler
  const handleRateApp = async () => {
    const appId = Platform.OS === 'ios' ? 'com.mychits.app' : 'com.mychits';
    const appStoreLink = Platform.OS === 'ios'
      ? `itms-apps://itunes.apple.com/app/id${appId}`
      : `market://details?id=${appId}`;
    if (!isConnected || !isInternetReachable) {
      Toast.show({
        type: 'error',
        text1: 'Offline',
        text2: 'Please connect to the internet to rate the app.',
        position: 'bottom',
        visibilityTime: 4000,
      });
      return;
    }
    try {
      const supported = await Linking.canOpenURL(appStoreLink);
      if (supported) await Linking.openURL(appStoreLink);
      else Toast.show({
        type: 'error',
        text1: 'Cannot Open Store',
        text2: 'Please check your settings.',
        position: 'bottom',
        visibilityTime: 4000,
      });
    } catch (error) {
      console.error("Error opening app store:", error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'An unexpected error occurred.',
        position: 'bottom',
        visibilityTime: 4000,
      });
    }
  };
  // Menu Items for modal and side menu
  const menuItems = [
    { title: "About Us", icon: "info", link: "About" },
    { title: "Privacy Policy", icon: "privacy-tip", link: "Privacy" },
    { title: "Help", icon: "help-outline", link: "Help" },
    { title: "F&Q", icon: "question-answer", link: "Fq" },
    { title: "WhatsApp", icon: "logo-whatsapp", onPress: handleWhatsAppPress },
  ];
  const sideMenuItems = [
    { title: "Chat with MyChit", icon: "chatbubbles-outline", onPress: handleWhatsAppPress },
    { title: "Get Help", icon: "help-circle-outline", link: "Help" },
    { title: "Earn Rewards", icon: "gift-outline", link: "FeatureComingSoon", featureTitle: "Rewards" },
    { title: "My Profile", icon: "person-outline", link: "ProfileScreen" },
  ];
  const handleNeedHelp = () => {
    if (!isConnected || !isInternetReachable) {
      Toast.show({
        type: 'error',
        text1: 'Offline',
        text2: 'Please connect to the internet to access help options.',
        position: 'bottom',
        visibilityTime: 4000,
      });
      return;
    }
    setHelpModalVisible(true);
  };
  const handleOpenSideMenu = () => {
    if (!isConnected || !isInternetReachable) {
      Toast.show({
        type: 'error',
        text1: 'Offline',
        text2: 'Please connect to the internet to access menu options.',
        position: 'bottom',
        visibilityTime: 4000,
      });
      return;
    }
    openSideMenu();
  };
  const handleCallUs = () => {
    const phoneNumber = '9483900777';
    Linking.canOpenURL(`tel:${phoneNumber}`)
      .then((supported) => {
        if (supported) Linking.openURL(`tel:${phoneNumber}`).catch(error => {
          console.error("Error opening dialer:", error);
          Toast.show({
            type: 'error',
            text1: 'Call Error',
            text2: 'Could not open phone dialer.',
            position: 'bottom',
            visibilityTime: 4000,
          });
        });
        else Toast.show({
          type: 'info',
          text1: 'Not Supported',
          text2: 'Phone calls are not supported on this device.',
          position: 'bottom',
          visibilityTime: 4000,
        });
      })
      .catch(error => {
        console.error("Error checking dialer:", error);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'An error occurred while checking phone call availability.',
          position: 'bottom',
          visibilityTime: 4000,
        });
      });
  };
  const handleRelationshipManagerCall = (phoneNumber) => {
    if (!phoneNumber) {
      Toast.show({
        type: 'error',
        text1: 'Call Error',
        text2: 'Relationship Manager phone number is not available.',
        position: 'bottom',
        visibilityTime: 4000,
      });
      return;
    }
    Linking.canOpenURL(`tel:${phoneNumber}`)
      .then((supported) => {
        if (supported) Linking.openURL(`tel:${phoneNumber}`).catch(error => {
          console.error("Error opening dialer:", error);
          Toast.show({
            type: 'error',
            text1: 'Call Error',
            text2: 'Could not open phone dialer.',
            position: 'bottom',
            visibilityTime: 4000,
          });
        });
        else Toast.show({
          type: 'info',
          text1: 'Not Supported',
          text2: 'Phone calls are not supported on this device.',
          position: 'bottom',
          visibilityTime: 4000,
        });
      })
      .catch(error => {
        console.error("Dialer check error:", error);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'An error occurred while checking call availability.',
          position: 'bottom',
          visibilityTime: 4000,
        });
      });
  };
  const handleWebsiteLink = async () => {
    const websiteUrl = 'https://mychits.co.in/';
    if (!isConnected || !isInternetReachable) {
      Toast.show({
        type: 'error',
        text1: 'Offline',
        text2: 'Please connect to the internet to open the website.',
        position: 'bottom',
        visibilityTime: 4000,
      });
      return;
    }
    try {
      const supported = await Linking.canOpenURL(websiteUrl);
      if (supported) await Linking.openURL(websiteUrl);
      else Toast.show({
        type: 'error',
        text1: 'Cannot Open URL',
        text2: `Can't open this URL: ${websiteUrl}`,
        position: 'bottom',
        visibilityTime: 4000,
      });
    } catch (error) {
      console.error("Website link error:", error);
      Toast.show({
        type: 'error',
        text1: 'Error Opening Website',
        text2: 'An error occurred while trying to open the website.',
        position: 'bottom',
        visibilityTime: 4000,
      });
    }
  };
  const handleMenuItemPress = (item) => {
    setHelpModalVisible(false);
    setSideMenuVisible(false);
    if (item.onPress) {
      item.onPress();
    } else if (item.link && typeof item.link === 'string') {
      navigation.navigate(item.link, { user: route.params.user || {} });
    } else {
      Alert.alert("Navigation Error", `Could not navigate to ${item.title}.`);
    }
  };
  const handleLogout = () => {
    closeSideMenu();
    navigation.dispatch(StackActions.replace('Login'));
  };
  const handleCustomerSupportCall = (phoneNumber) => {
    if (!phoneNumber) {
      Toast.show({
        type: 'error',
        text1: 'Call Error',
        text2: 'Phone number not provided.',
        position: 'bottom',
        visibilityTime: 4000,
      });
      return;
    }
    Linking.canOpenURL(`tel:${phoneNumber}`)
      .then((supported) => {
        if (supported) {
          Linking.openURL(`tel:${phoneNumber}`).catch(error => {
            console.error("Dialer error:", error);
            Toast.show({
              type: 'error',
              text1: 'Call Error',
              text2: 'Could not open phone dialer.',
              position: 'bottom',
              visibilityTime: 4000,
            });
          });
        } else {
          Toast.show({
            type: 'info',
            text1: 'Not Supported',
            text2: 'Phone calls are not supported on this device.',
            position: 'bottom',
            visibilityTime: 4000,
          });
        }
      })
      .catch(error => {
        console.error("Dialer check error:", error);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Error while checking call availability.',
          position: 'bottom',
          visibilityTime: 4000,
        });
      });
  };
  const fetchUserData = async () => {
    if (!isConnected || !isInternetReachable) {
      setIsLoadingUserData(false);
      setUserDataError("No internet connection.");
      setUserData({ full_name: '', phone_number: '', address: '' });
      return;
    }
    setIsLoadingUserData(true);
    setUserDataError(null);
    try {
      if (!userId) {
        setUserDataError("User ID not found. Please log in again.");
        setIsLoadingUserData(false);
        return;
      }
      const response = await axios.get(`${url}/user/get-user-by-id/${userId}`);
      setUserData(response.data);
      setIsLoadingUserData(false);
    } catch (error) {
      console.error("User data fetch error:", error);
      setUserDataError("Failed to fetch user data. Please try again.");
      Toast.show({
        type: 'error',
        text1: 'User Data Error',
        text2: 'Could not fetch user information.',
        position: 'bottom',
        visibilityTime: 4000,
      });
      setIsLoadingUserData(false);
    }
  };
  const fetchRelationshipManagerDetails = async () => {
    if (!isConnected || !isInternetReachable || !userId) return;
    try {
      const response = await axios.post(`${url}/enroll/get-user-tickets/${userId}`);
      if (response.data && response.data.length > 0) {
        const uniqueGroups = new Map();
        response.data.forEach(ticket => {
          const rmDetails = ticket.group_id?.relationship_manager;
          const groupName = ticket.group_id?.group_name;
          const groupId = ticket.group_id?._id;
          if (rmDetails && rmDetails.phone_number && groupName && groupId) {
            uniqueGroups.set(groupId, {
              groupName,
              name: rmDetails.name,
              phoneNumber: rmDetails.phone_number,
            });
          }
        });
        setRelationshipManagers(Array.from(uniqueGroups.values()));
      } else {
        setRelationshipManagers([]);
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'RM Data Error',
        text2: 'Could not fetch Relationship Manager details.',
        position: 'bottom',
        visibilityTime: 4000,
      });
      setRelationshipManagers([]);
    }
  };
  // Set greeting on load
  useEffect(() => {
    fetchUserData();
    fetchRelationshipManagerDetails();
  }, [userId, isConnected, isInternetReachable]);
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);
  useFocusEffect(
    useCallback(() => {
      if (Platform.OS === 'android') {
        const onBackPress = () => {
          if (isHelpModalVisible) {
            setHelpModalVisible(false);
            return true;
          }
          if (isSideMenuVisible) {
            closeSideMenu();
            return true;
          }
          BackHandler.exitApp();
          return true;
        };
        const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
        return () => subscription.remove();
      }
      return undefined;
    }, [isHelpModalVisible, isSideMenuVisible])
  );
  // Services grid data with improved border and color styling
  const services = [
    { navigateTo: 'Mygroups', icon: 'group', title: 'My Groups', bgColor: '#F9F9F9', iconBg: '#053B90', disabled: false },
    { navigateTo: 'EnrollTab', screen: 'EnrollScreenMain', icon: 'user-plus', title: 'New Groups', bgColor: '#F9F9F9', iconBg: '#007AFF', filter: 'New Groups', disabled: false },
    { navigateTo: 'PaymentScreen', icon: 'credit-card', title: 'My Payments', bgColor: '#F9F9F9', iconBg: '#FF7707', disabled: false },
    { navigateTo: 'ReportScreen', icon: 'bar-chart', title: 'Reports', bgColor: '#F9F9F9', iconBg: '#475a07', disabled: false },
    { navigateTo: 'MyPassbook', icon: 'book', title: 'My Passbook', bgColor: '#F9F9F9', iconBg: '#04595c', disabled: false },
    { navigateTo: 'AuctionList', icon: 'gavel', title: 'Auction', bgColor: '#F9F9F9', iconBg: '#8e8c05', disabled: false, featureTitle: 'Auction' },
    { navigateTo: 'IntroduceNewCustomers', icon: 'user-plus', title: 'Refer friend', bgColor: '#F9F9F9', iconBg: '#a16400', disabled: false },
    { navigateTo: 'MyLoan', screen: 'MyLoan', icon: 'wallet', title: 'My Loan', bgColor: '#F9F9F9', iconBg: '#e40000', filter: 'My Loan', disabled: false },
    { navigateTo: 'PayYourDues', icon: 'rupee', title: 'Pay Your Dues', bgColor: '#F9F9F9', iconBg: '#9d00a5', disabled: false },
  ];
  // Advantages or offers section
  const mychitsAdvantages = [
    { icon: 'lock', text1: '2 mins onboarding', text2: '& 24Hrs Payouts', iconColor: '#ff0000' },
    { icon: 'gavel', text1: 'In App Auctions', text2: 'for best deals', iconColor: '#581c06', action: 'navigate', targetScreen: 'AuctionList' },
    { icon: 'calendar', text1: 'Monthly Auctions', text2: 'exciting deals', iconColor: '#ffb701', action: 'navigate', targetScreen: 'AuctionList' },
    { icon: 'headset', text1: '1 Click', text2: 'support', iconColor: '#00aaff', action: 'call', phoneNumber: '+919483900777' },
    { icon: 'check', text1: 'Fully Compliant', text2: 'with regulations', iconColor: '#0026ff' },
    { icon: 'users', text1: 'Chit Plans', text2: 'for everyone', iconColor: '#00ff08' },
  ];
  // Customer reviews section
  const customerReviews = [
    { id: '1', name: 'Prakash', rating: 5, review: 'Great service! The app is very user-friendly and I got my money on time.', location: 'Bangalore' },
    { id: '2', name: 'Geetha Kumari', rating: 4, review: 'Transparent, trustworthy, and super supportive team!', location: 'Chamarajanagr' },
    { id: '3', name: 'Ravi Kumar', rating: 5, review: 'Simple interface and reliable payments.', location: 'Bangalore' },
  ];
  const ReviewsSection = () => {
    const renderStarRating = (rating) => {
      const stars = [];
      for (let i = 1; i <= 5; i++) {
        stars.push(
          <Ionicons
            key={i}
            name={i <= rating ? 'star' : 'star-outline'}
            size={20}
            color={i <= rating ? '#FFA500' : '#ccc'}
            style={styles.reviewStar}
          />
        );
      }
      return <View style={styles.reviewRatingContainer}>{stars}</View>;
    };
    const renderReviewCard = ({ item }) => (
      <View style={styles.reviewCard}>
        <Text style={styles.reviewName}>{item.name}</Text>
        <Text style={styles.reviewLocation}>{item.location}</Text>
        {renderStarRating(item.rating)}
        <Text style={styles.reviewText}>{item.review}</Text>
      </View>
    );
    return (
      <View style={styles.reviewsContainer}>
        <Text style={styles.reviewTitle}>What Our Customers Say</Text>
        <FlatList
          data={customerReviews}
          renderItem={renderReviewCard}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.reviewListContent}
        />
      </View>
    );
  };
  if (isLoadingUserData) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <ActivityIndicator size="large" color="#053B90" />
      </SafeAreaView>
    );
  }
  if (!isConnected || !isInternetReachable) {
    return (
      <SafeAreaView style={styles.offlineContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.offlineContent}>
          <MaterialIcons name="cloud-off" size={80} color="#999" />
          <Text style={styles.offlineTextTitle}>No Internet Connection</Text>
          <Text style={styles.offlineTextMessage}>Please check your network settings and try again.</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchUserData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
        <Toast />
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2f164fff" />
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={handleOpenSideMenu} style={styles.hamburgerIconContainer}>
          <View style={styles.hamburgerLine} />
          <View style={styles.hamburgerLine} />
          <View style={styles.hamburgerLine} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Demo Rider Plans</Text>
        <TouchableOpacity style={styles.helpButton} onPress={handleNeedHelp}>
          <Ionicons name="information-circle-outline" size={18} color="#620590ff" style={{ marginRight: 5 }} />
          <Text style={styles.helpText}>Need Help?</Text>
        </TouchableOpacity>
      </View>
      {/* Search Bar */}
      <View style={styles.searchBarContainer}>
        <Ionicons name="search" size={20} color="#666" style={{ marginHorizontal: 8 }} />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search services or news..."
          placeholderTextColor="#888"
          style={styles.searchInput}
        />
      </View>
      <ScrollView style={styles.mainScrollView} contentContainerStyle={styles.contentContainer}>
        {/* Greeting Section */}
        <View style={styles.greetingSection}>
          {userDataError ? (
            <Text style={styles.errorTextSmall}>{userDataError}</Text>
          ) : (
            <View style={styles.welcomeContainer}>
              <Text style={styles.greetingText}>{greeting}!</Text>
              <Text style={styles.userNameText}>{userData.full_name || 'User'}</Text>
            </View>
          )}
        </View>
        <View style={{ marginVertical: 20 }}>
  <FlatList
    ref={flatListRef}
    data={bannerImages}
    keyExtractor={(item, index) => index.toString()}
    horizontal
    pagingEnabled
    showsHorizontalScrollIndicator={false}
    renderItem={({ item }) => (
      <Image
        source={{ uri: item.uri }}
        style={{
          width: Dimensions.get('window').width * 0.9,
          height: 150,
          borderRadius: 15,
          marginHorizontal: Dimensions.get('window').width * 0.05 / 2,
        }}
        resizeMode="cover"
      />
    )}
  />
</View>
<View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 8 }}>
  {bannerImages.map((_, index) => (
    <View
      key={index}
      style={{
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: currentIndex === index ? '#FFD700' : '#ccc',
        marginHorizontal: 4,
      }}
    />
  ))}
</View>

        {/* Services Grid */}
        <View style={styles.servicesSection}>
          <Text style={styles.servicesTitle}>Services</Text>
          <FlatList
            data={services}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.gridItemBox,
                  { backgroundColor: item.bgColor },
                  item.disabled && { opacity: 0.6 },
                ]}
                onPress={() => {
                  if (!item.disabled) {
                    if (item.screen) {
                      navigation.navigate(item.navigateTo, {
                        screen: item.screen,
                        params: {
                          userId,
                          ...(item.filter && { groupFilter: item.filter }),
                        },
                      });
                    } else {
                      navigation.navigate(item.navigateTo, {
                        userId,
                        featureTitle: item.featureTitle || item.title,
                      });
                    }
                  }
                }}
                disabled={item.disabled}
              >
                <View style={[styles.iconCircle, { backgroundColor: item.iconBg }]}>
                  {item.icon === 'credit-card' ? (
                    <FontAwesome name="credit-card" size={26} color="#fff" />
                  ) : item.icon === 'rupee' ? (
                    <MaterialCommunityIcons name="currency-inr" size={26} color="#fff" />
                  ) : item.icon === 'wallet' ? (
                    <FontAwesome name="money" size={26} color="#fff" />
                  ) : item.icon === 'user-plus' ? (
                    <FontAwesome name="user-plus" size={26} color="#fff" />
                  ) : (
                    <MaterialIcons name={item.icon} size={26} color="#fff" />
                  )}
                </View>
                <Text style={styles.serviceTitle}>{item.title}</Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item, index) => index.toString()}
            numColumns={3}
            scrollEnabled={false}
            columnWrapperStyle={styles.row}
          />
          {/* Extra blue grid for rewards and offers */}
          <View style={styles.blueContainer}>
            <TouchableOpacity
              style={styles.blueGridItem}
              onPress={() => navigation.navigate('RewardsScreen', { userId, featureTitle: 'Rewards' })}
            >
              <View style={styles.iconCircleBlue}>
                <MaterialIcons name="emoji-events" size={30} color="#053B90" />
              </View>
              <Text style={styles.blueGridItemText}>Rewards</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.blueGridItem}
              onPress={() => navigation.navigate('OffersScreen', { userId, featureTitle: 'Offers' })}
            >
              <View style={styles.iconCircleBlue}>
                <MaterialIcons name="local-offer" size={30} color="#053B90" />
              </View>
              <Text style={styles.blueGridItemText}>Offers</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.blueGridItem}
              onPress={() => navigation.navigate('EligibilityScreen', { userId, featureTitle: 'Eligibility' })}
            >
              <View style={styles.iconCircleBlue}>
                <MaterialIcons name="check-circle" size={30} color="#053B90" />
              </View>
              <Text style={styles.blueGridItemText}>Eligibility</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.blueGridItem}
              onPress={() => navigation.navigate('MoreInformation', { userId, featureTitle: 'More Features' })}
            >
              <View style={styles.iconCircleBlue}>
                <MaterialIcons name="more-horiz" size={30} color="#053B90" />
              </View>
              <Text style={styles.blueGridItemText}>More</Text>
            </TouchableOpacity>
          </View>
          {/* Bottom Navigation */}
          <View style={styles.bottomContainer}>
            <TouchableOpacity style={styles.bottomGridItem} onPress={() => navigation.navigate('ProfileScreen', { userId })}>
              <View style={styles.bottomIcon}>
                <MaterialIcons name="person" size={34} color="#053B90" />
              </View>
              <Text style={styles.bottomServiceTitle}>My Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.bottomGridItem} onPress={() => navigation.navigate('MoreInformation', { userId, featureTitle: 'More Information' })}>
              <View style={styles.bottomIcon}>
                <MaterialIcons name="more" size={34} color="#053B90" />
              </View>
              <Text style={styles.bottomServiceTitle}>More Info</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.bottomGridItem} onPress={() => navigation.navigate('Insurance', { userId })}>
              <View style={styles.bottomIcon}>
                <MaterialIcons name="health-and-safety" size={34} color="#053B90" />
              </View>
              <Text style={styles.bottomServiceTitle}>Insurance</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.bottomGridItem} onPress={() => navigation.navigate('Becomeanagent', { userId })}>
              <View style={styles.bottomIcon}>
                <MaterialCommunityIcons name="account-tie" size={34} color="#053B90" />
              </View>
              <Text style={styles.bottomServiceTitle}>Agent</Text>
            </TouchableOpacity>
          </View>
          {/* Advantages/Offers Section */}
          {/* <View style={styles.benefitsSection}>
            <Text style={styles.benefitsTitle}>Why Choose MyChits?</Text>
            {mychitsAdvantages.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.advantageItem}
                onPress={() => {
                  if (item.action === 'call' && item.phoneNumber) {
                    handleCustomerSupportCall(item.phoneNumber);
                  } else if (item.action === 'navigate' && item.targetScreen) {
                    navigation.navigate(item.targetScreen);
                  }
                }}
              >
                <View style={styles.advantageIconContainer}>
                  <MaterialIcons name={item.icon} size={28} color={item.iconColor} />
                </View>
                <Text style={styles.advantageText1}>{item.text1}</Text>
                <Text style={styles.advantageText2}>{item.text2}</Text>
              </TouchableOpacity>
            ))}
          </View> */}
          <View style={styles.benefitsSection}>
  <Text style={styles.benefitsTitle}>Why Choose MyChits?</Text>
  <View style={styles.advantagesContainer}>
    {mychitsAdvantages.map((item, index) => (
      <TouchableOpacity
        key={index}
        style={styles.advantageItem}
        onPress={() => {
          if (item.action === 'call' && item.phoneNumber) {
            handleCustomerSupportCall(item.phoneNumber);
          } else if (item.action === 'navigate' && item.targetScreen) {
            navigation.navigate(item.targetScreen);
          }
        }}
        activeOpacity={0.8}
      >
        <View style={[styles.advantageIconContainer, { borderColor: item.iconColor }]}>
          <MaterialIcons name={item.icon} size={28} color={item.iconColor} />
        </View>
        <Text style={styles.advantageText1}>{item.text1}</Text>
        <Text style={styles.advantageText2}>{item.text2}</Text>
      </TouchableOpacity>
    ))}
  </View>
</View>

          <TouchableOpacity style={styles.viewLicenseLink} onPress={() => navigation.navigate('LicenseAndCertificate')}>
            <View style={styles.viewLicenseContent}>
              <MaterialIcons name="link" size={16} color="#053B90" />
              <Text style={styles.viewLicenseText}>View License & Certificate</Text>
            </View>
          </TouchableOpacity>
          <LinearGradient
            colors={['#F0F8FF', '#F8F8F8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.appInfoFooter}
          >
            <TouchableOpacity onPress={handleWebsiteLink}>
              <Text style={styles.appInfoWebsiteLink}>
                Visit our Website: <Text style={{ fontWeight: 'bold' }}>mychits.co.in</Text>
              </Text>
            </TouchableOpacity>
            <View style={styles.madeWithLoveContainer}>
              <Text style={styles.appInfoMadeWithLove}>
                Made with <Text style={{ color: '#E53935' }}>❤️</Text> in India
              </Text>
              <MaterialIcons name="public" size={16} color="#4CAF50" style={styles.madeInIndiaIcon} />
            </View>
          </LinearGradient>
        </View>
        <ReviewsSection />
      </ScrollView>
      {/* Help Modal */}
      <Modal
        animationType="slide"
        transparent
        visible={isHelpModalVisible}
        onRequestClose={() => setHelpModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setHelpModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>How can we help?</Text>
              <TouchableOpacity onPress={() => setHelpModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#585858" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {menuItems.map((item, index) => (
                <TouchableOpacity
                  key={`help-item-${index}`}
                  style={styles.modalMenuItem}
                  onPress={() => handleMenuItemPress(item)}
                >
                  <View style={styles.modalMenuItemLeft}>
                    {item.icon === "logo-whatsapp" ? (
                      <Ionicons name={item.icon} size={24} color="#053B90" />
                    ) : (
                      <MaterialIcons name={item.icon} size={24} color="#053B90" />
                    )}
                    <Text style={styles.modalMenuText}>{item.title}</Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={24} color="#585858" />
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.modalCallSection}>
              <Text style={styles.modalCallText}>Still need help? Give us a call.</Text>
              <TouchableOpacity style={styles.modalCallButton} onPress={handleCallUs}>
                <MaterialIcons name="phone" size={20} color="#fff" style={styles.modalCallIcon} />
                <Text style={styles.modalCallButtonText}>Call Us Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
      {/* Side Menu */}
      {isSideMenuVisible && (
        <TouchableOpacity style={styles.modalOverlaySideMenu} activeOpacity={1} onPress={closeSideMenu}>
          <Animated.View style={[styles.sideMenuContent, { transform: [{ translateX: slideAnim }] }]} {...panResponder.panHandlers}>
            <TouchableOpacity onPress={closeSideMenu} style={styles.sideMenuCloseButton}>
              <MaterialIcons name="close" size={24} color="#585858" />
            </TouchableOpacity>
            <ScrollView contentContainerStyle={styles.sideMenuScrollContent}>
              <View style={styles.sideMenuHeader}>
                <Image source={CityChits} style={styles.headerImage} resizeMode="contain" />
                <View style={styles.headerTextContainer}>
                  <Text style={styles.sideMenuUserName}>{userData.full_name || 'User'}</Text>
                  <Text style={styles.sideMenuOnTrackText}>
                    You're on track, {userData.full_name.split(' ')[0] || 'User'}!
                  </Text>
                </View>
                {relationshipManagers.length > 0 && (
                  <View style={styles.rmListBox}>
                    {relationshipManagers.map((rm, index) => (
                      <View key={index} style={styles.relationshipManagerCard}>
                        <Text style={styles.rmGroupName}>{rm.groupName}</Text>
                        <View style={styles.managerDetailsRow}>
                          <Text style={styles.rmManagerName}>Manager: {rm.name}</Text>
                          <Text style={styles.rmPhoneNumberText}>{rm.phoneNumber}</Text>
                          <TouchableOpacity onPress={() => handleRelationshipManagerCall(rm.phoneNumber)} style={styles.inlineCallButton}>
                            <MaterialIcons name="phone" size={16} color="#053B90" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
              {sideMenuItems.map((item, index) => (
                <TouchableOpacity
                  key={`side-menu-item-${index}`}
                  style={styles.sideMenuItem}
                  onPress={() => {
                    closeSideMenu();
                    if (item.onPress) item.onPress();
                    else if (item.link) {
                      navigation.navigate(item.link, { userId, featureTitle: item.featureTitle });
                    }
                  }}
                >
                  <Ionicons name={item.icon} size={24} color="#333" style={styles.sideMenuIcon} />
                  <Text style={styles.sideMenuText}>{item.title}</Text>
                </TouchableOpacity>
              ))}
              <View style={styles.sideMenuSeparator} />
              <TouchableOpacity style={styles.sideMenuItem} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={24} color="red" style={styles.sideMenuIcon} />
                <Text style={[styles.sideMenuText, { color: 'red' }]}>Sign Out</Text>
              </TouchableOpacity>
              <View style={styles.sideMenuFooter}>
                <TouchableOpacity onPress={handleRateApp}>
                  <Text style={styles.sideMenuFooterText}>
                    Love us? Rate the app! <Ionicons name="star" size={16} color="#F7C641" />
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </Animated.View>
        </TouchableOpacity>
      )}
      <Toast />
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#6A0DAD' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 10,
    paddingHorizontal: 15,
    justifyContent: 'space-between',
    backgroundColor: '#6A0DAD',
  },
  headerTitle: { color: '#FFD700', fontSize: 22, fontWeight: 'bold', marginLeft: 10, marginTop: 10 },
  hamburgerIconContainer: { marginTop: 10, marginLeft: 7 },
  hamburgerLine: { width: 25, height: 3, backgroundColor: '#fff', borderRadius: 2, marginVertical: 3 },
  helpButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 5, paddingHorizontal: 10, backgroundColor: '#fff', borderRadius: 15, marginTop: 10 },
  helpText: { color: '#053B90', fontSize: 13, fontWeight: '500' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' },
  mainScrollView: { flex: 1 },
  contentContainer: { paddingBottom: 50 },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECECEC',
    marginHorizontal: 20,
    borderRadius: 25,
    paddingHorizontal: 10,
    marginTop: 10,
  },
  searchInput: { flex: 1, fontSize: 16, color: '#333', paddingVertical: 8 },
  greetingSection: {
    backgroundColor: '#F2F4F7',
    marginHorizontal: 20,
    marginTop: 15,
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: '#053B90',
  },
  welcomeContainer: { alignItems: 'center' },
  greetingText: { fontSize: 22, color: '#053B90', fontWeight: 'bold' },
  userNameText: { fontSize: 20, color: '#053B90', marginTop: 4 },
  errorTextSmall: { fontSize: 13, color: 'red', textAlign: 'center' },
  servicesSection: {
    marginTop: 25,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 30,
    paddingHorizontal: 10,
    width: '95%',
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: 'black',
    elevation: 3,
  },
  servicesTitle: {
    position: 'absolute',
    top: -18,
    alignSelf: 'center',
    backgroundColor: '#FFD700',
    width: 240,
    height: 36,
    borderRadius: 18,
    textAlign: 'center',
    textAlignVertical: 'center',
    color: '#053B90',
    fontSize: 20,
    fontWeight: 'bold',
    borderWidth: 1,
    borderColor: 'black',
  },
  row: { justifyContent: 'space-around', marginVertical: 10 },
  gridItemBox: {
    width: '28%',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'black',
  },
  iconCircle: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  serviceTitle: { fontSize: 11, textAlign: 'center', fontWeight: '600', color: '#053B90', marginTop: 2 },
  blueContainer: {
    backgroundColor: '#E8F0FE',
    borderRadius: 10,
    marginTop: 20,
    paddingVertical: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginHorizontal: 10,
  },
  blueGridItem: { width: '22%', alignItems: 'center', marginVertical: 8 },
  iconCircleBlue: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#053B90' },
  blueGridItemText: { marginTop: 4, fontSize: 11, color: '#053B90', textAlign: 'center', fontWeight: '600' },
  bottomContainer: { marginTop: 25, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', width: '100%' },
  bottomGridItem: { width: '22%', alignItems: 'center', paddingVertical: 8, borderWidth: 1, borderRadius: 10, borderColor: '#053B90' },
  bottomIcon: { marginBottom: 2 },
  bottomServiceTitle: { fontSize: 11, color: '#053B90', textAlign: 'center', fontWeight: '600' },
  benefitsSection: { marginTop: 30, paddingHorizontal: 15, paddingBottom: 30, backgroundColor: '#F2F4F7', borderRadius: 10, borderWidth: 1, borderColor: '#053B90',     marginVertical: 20,    paddingHorizontal: 15,
 },
  benefitsTitle: { fontSize: 20, fontWeight: 'bold', color: '#053B90', textAlign: 'center', marginBottom: 20 },
  advantageItem: { alignItems: 'center', marginVertical: 10 },
   advantagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  advantageIconContainer: { width: 45, height: 45, borderRadius: 22.5, justifyContent: 'center', alignItems: 'center', marginBottom: 4, borderWidth: 1, borderColor: '#053B90' },
  advantageText1: { fontSize: 12, fontWeight: 'bold', color: 'black', textAlign: 'center' },
  advantageText2: { fontSize: 10, textAlign: 'center', color: '#053B90' },
  viewLicenseLink: { alignSelf: 'center', marginTop: 10 },
  viewLicenseContent: { flexDirection: 'row', alignItems: 'center' },
  viewLicenseText: { color: '#053B90', fontSize: 15, fontWeight: '600', textDecorationLine: 'underline', marginLeft: 5 },
  appInfoFooter: { alignItems: 'center', marginTop: 20, marginBottom: 20, paddingVertical: 15, paddingHorizontal: 25, borderRadius: 15, borderWidth: 1, borderColor: '#053B90', width: '90%', alignSelf: 'center' },
  appInfoWebsiteLink: { fontSize: 16, color: '#053B90', textDecorationLine: 'underline', textAlign: 'center', fontWeight: '500' },
  madeWithLoveContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  appInfoMadeWithLove: { fontSize: 15, color: '#053B90' },
  madeInIndiaIcon: { marginLeft: 8 },
  reviewsContainer: { marginTop: 25, paddingVertical: 10, width: '95%', alignSelf: 'center' },
  reviewTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 10, textAlign: 'center' },
  reviewCard: { backgroundColor: '#fff', borderRadius: 8, padding: 10, marginHorizontal: 8, width: 250, borderWidth: 1, borderColor: '#053B90' },
  reviewName: { fontSize: 16, fontWeight: 'bold', color: '#053B90', textAlign: 'center' },
  reviewLocation: { fontSize: 13, color: '#666', textAlign: 'center', marginBottom: 5 },
  reviewRatingContainer: { flexDirection: 'row', justifyContent: 'center', marginVertical: 4 },
  reviewStar: { marginHorizontal: 1 },
  reviewText: { fontSize: 13, lineHeight: 20, color: '#333', fontStyle: 'italic', textAlign: 'center' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  modalContent: { width: '100%', backgroundColor: '#FFFFFF', borderTopLeftRadius: 25, borderTopRightRadius: 25, paddingHorizontal: 25, paddingBottom: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#ddd' },
  modalTitle: { fontSize: 22, fontWeight: '800', color: '#053B90' },
  modalMenuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  modalMenuItemLeft: { flexDirection: 'row', alignItems: 'center' },
  modalMenuText: { fontSize: 17, color: '#333', marginLeft: 16, fontWeight: '500' },
  modalCallSection: { marginTop: 25, alignItems: 'center', paddingVertical: 15 },
  modalCallText: { fontSize: 17, color: '#666', marginBottom: 15, textAlign: 'center' },
  modalCallButton: { flexDirection: 'row', backgroundColor: '#007AFF', paddingVertical: 12, paddingHorizontal: 25, borderRadius: 30, alignItems: 'center' },
  modalCallIcon: { marginRight: 12 },
  modalCallButtonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  modalOverlaySideMenu: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 10 },
  sideMenuContent: { width: '80%', height: '100%', backgroundColor: '#FFFFFF', borderTopRightRadius: 30, borderBottomRightRadius: 30, paddingBottom: 20, borderWidth: 1, borderColor: '#EEE' },
  sideMenuCloseButton: { position: 'absolute', right: 20, top: 50, zIndex: 1, backgroundColor: '#ccc', borderRadius: 20, padding: 8 },
  sideMenuScrollContent: { paddingBottom: 30 },
  sideMenuHeader: { width: '100%', backgroundColor: '#053B90', borderTopRightRadius: 30, paddingHorizontal: 25, justifyContent: 'center', paddingVertical: 20 },
  headerImage: { width: 200, height: 60, alignSelf: 'center', marginVertical: 15 },
  sideMenuUserName: { fontSize: 24, fontWeight: 'bold', color: '#FFD700', textAlign: 'center', marginBottom: 5 },
  sideMenuOnTrackText: { fontSize: 16, color: '#fff', textAlign: 'center' },
  rmListBox: { backgroundColor: '#FFECB3', borderRadius: 10, borderWidth: 1, borderColor: '#FFD54F', marginTop: 15, padding: 8 },
  relationshipManagerCard: { paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8, marginBottom: 8, backgroundColor: '#fff' },
  rmGroupName: { fontSize: 15, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  managerDetailsRow: { flexDirection: 'row', alignItems: 'center' },
  rmManagerName: { fontSize: 14, color: '#555', fontWeight: '600', marginRight: 5 },
  rmPhoneNumberText: { fontSize: 13, color: '#555' },
  inlineCallButton: { backgroundColor: '#B3E5FC', padding: 5, borderRadius: 15, marginLeft: 8 },
  sideMenuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, marginLeft: 20 },
  sideMenuIcon: { marginRight: 20 },
  sideMenuText: { fontSize: 16, color: '#333' },
  sideMenuSeparator: { height: 1, backgroundColor: '#EEE', marginVertical: 10 },
  sideMenuFooter: { paddingVertical: 12, alignItems: 'center', borderTopWidth: 1, borderTopColor: '#EEE', backgroundColor: '#F9F9F9' },
  sideMenuFooterText: { fontSize: 14, color: '#666', fontWeight: '600' },
});
export default Home;