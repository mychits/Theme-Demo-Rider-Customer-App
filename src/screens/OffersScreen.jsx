import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ContextProvider } from '../context/UserProvider';

import ReferFriend from '../../assets/ReferFriend.png';
import FirstTime from '../../assets/FirstTime.png';
import PrimeMember from '../../assets/PrimeMember.png';

const Colors = {
  violet: '#7B61FF',
  violetDark: '#4B3BA8',
  violetLight: '#E9E3FF',
  white: '#fff',
  grayText: '#666',
  button: '#4B3BA8',
  buttonLight: '#B7A6FF',
  headerText: '#fff',
  cardText: '#333',
};

const HEADER_HEIGHT = 80;

const OffersScreen = ({ navigation }) => {
  const [appUser] = useContext(ContextProvider);
  const userId = appUser?.userId || null;

  const offers = [
    {
      id: '1',
      title: 'Refer a friend, get ₹500',
      description: 'Your friend joins a chit, you get instant rewards.',
      image: ReferFriend,
    },
    {
      id: '2',
      title: 'First time user offer',
      description: 'Get a reduced entry fee on your first chit.',
      image: FirstTime,
    },
    {
      id: '3',
      title: 'Exclusive for Prime Members',
      description: 'Enjoy priority access and bonuses on certain chits.',
      image: PrimeMember,
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.violetDark} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.headerText} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Special Offers</Text>
      </View>

      {/* Scroll Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {offers.map((offer) => (
          <View key={offer.id} style={styles.card}>
            <Image source={offer.image} style={styles.cardImage} />
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{offer.title}</Text>
              <Text style={styles.cardDescription}>{offer.description}</Text>
              <TouchableOpacity
                style={styles.button}
                onPress={() =>
                  navigation.navigate('OfferDetails', { offerId: offer.id })
                }
              >
                <Text style={styles.buttonText}>View Details</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.violetLight,
  },
  header: {
    backgroundColor: Colors.violetDark,
    height: HEADER_HEIGHT + (Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 40),
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingBottom: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  backBtn: {
    position: 'absolute',
    left: 20,
    bottom: 15,
    padding: 5,
  },
  headerTitle: {
    color: Colors.headerText,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  scrollContent: {
    paddingTop: HEADER_HEIGHT + 40, // ensures content starts below header
    paddingHorizontal: 15,
    paddingBottom: 50,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  cardContent: {
    padding: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.cardText,
    marginBottom: 5,
  },
  cardDescription: {
    fontSize: 14,
    color: Colors.grayText,
    marginBottom: 10,
  },
  button: {
    backgroundColor: Colors.button,
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: 'flex-start',
  },
  buttonText: {
    color: Colors.white,
    fontWeight: 'bold',
  },
});

export default OffersScreen;
