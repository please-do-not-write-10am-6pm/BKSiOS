import {useNavigation} from '@react-navigation/core';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSelector} from 'react-redux';
import collectionAvatar from '../../assets/img/avatars/avatar2.jpg';
import likeBlueImg from '../../assets/img/icons/like-fill.png';
import likeImg from '../../assets/img/icons/liked-white.png';
import badgeMark from '../../assets/img/icons/verified.png';
import Currency from '../components/currency/Currency';
import CurrencySymbol from '../components/currency/CurrencySymbol';
import {EventCard} from '../components/eventCard';
import {Loading} from '../components/loading';
import config from '../helper/config';
import {
  getAllEventCards,
  getEventPrice,
  updateEventLike,
} from '../helper/event';
import {getLikesNumber} from '../utils';

export const SLIDER_WIDTH = Dimensions.get('window').width;
export const ITEM_WIDTH = Math.round(SLIDER_WIDTH * 0.9);

export const ExplorerScreen = () => {
  const [originEvents, setOriginEvents] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState();

  const _userInfo = useSelector(state => state.userInfoReducer).userInfo;
  const searchInfo = useSelector(state => state.searchInfoReducer).searchInfo;

  const {t} = useTranslation();
  const filterEvents = events_ => {
    let res = [];
    if (searchInfo !== null) {
      res = events_.filter(card => card.name.includes(searchInfo));
      setEvents([...res]);
    } else {
      setEvents(events_);
    }
  };

  const onClickLike = index => {
    console.log('Onclick Func>>', index);
    if (!userInfo) return;
    let likes = [];
    try {
      likes = JSON.parse(originEvents[index].likes_number);
    } catch (err) {
      likes = [];
      console.log(err);
    }
    if (typeof likes !== 'object' || likes === null) likes = [];
    const userId = userInfo?.user?.id;
    if (likes.includes(userId)) {
      const index = likes.indexOf(userId);
      likes.splice(index, 1);
    } else {
      likes.push(userId);
    }
    updateEventLike({
      id: originEvents[index]?.id,
      likes_number: JSON.stringify(likes),
    }).then(res => {
      if (res.success) {
        const _eventCards = [...originEvents];
        _eventCards[index].likes_number = JSON.stringify(likes);
        setOriginEvents(_eventCards);
      }
    });
  };

  useEffect(() => {
    setUserInfo(JSON.parse(_userInfo));
  }, [_userInfo]);

  useEffect(() => {
    console.log('SearchInfo>>', searchInfo);
    filterEvents(originEvents);
  }, [searchInfo]);

  useEffect(() => {
    getAllEventCards().then(res => {
      if (res.success) {
        setLoading(false);
        setOriginEvents(res.eventcards);
        filterEvents(res.eventcards);
      }
    });
  }, []);
  const Card = ({item, index}) => {
    const navigation = useNavigation();
    const creatorAvatar = () => {
      if (item.creator.avatar === '/img/avatars/avatar.jpg') {
        return require('../../assets/img/avatars/avatar.jpg');
      } else if (item.creator.avatar === '/img/avatars/avatar2.jpg') {
        return require('../../assets/img/avatars/avatar2.jpg');
      } else if (item.creator.avatar === '/img/avatars/avatar3.jpg') {
        return require('../../assets/img/avatars/avatar3.jpg');
      } else if (item.creator.avatar === '/img/avatars/avatar4.jpg') {
        return require('../../assets/img/avatars/avatar4.jpg');
      } else if (item.creator.avatar === '/img/avatars/avatar5.jpg') {
        return require('../../assets/img/avatars/avatar5.jpg');
      } else if (item.creator.avatar === '/img/avatars/avatar6.jpg') {
        return require('../../assets/img/avatars/avatar6.jpg');
      } else if (item.creator.avatar === '/img/avatars/avatar7.jpg') {
        return require('../../assets/img/avatars/avatar7.jpg');
      } else if (item.creator.avatar === '/img/avatars/avatar8.jpg') {
        return require('../../assets/img/avatars/avatar8.jpg');
      }
    };
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('EventDetail', {item: item})}
        style={styles.cardContainer}>
        <View style={styles.imageDiv}>
          <Image
            source={{
              uri:
                config.API_BASE_URL +
                '/api/upload/get_file?path=' +
                item.picture_small,
            }}
            style={styles.img}
            resizeMode="cover"
          />
        </View>
        <View style={styles.cardMeta}>
          <Text style={styles.name}>{item.name}sfd</Text>
          <View style={styles.detailContainer}>
            <View style={styles.collectionContainer}>
              <Text style={styles.info}>{t('collection')}</Text>
              <View style={styles.collectionSub}>
                <Image source={collectionAvatar} style={styles.avatar} />
                <Text style={styles.owner}>{item.collection.name}</Text>
              </View>
            </View>
            <View>
              <Text style={styles.info}>{t('creator')}</Text>
              <View style={styles.creatorContainer}>
                <Image source={creatorAvatar()} style={styles.avatar} />
                <Text style={styles.owner}>{item.creator.name}</Text>
                <Image source={badgeMark} style={styles.badgeMark} />
              </View>
            </View>
          </View>
          {item.totoal_ticekts === item.buy_count && (
            <View>
              <Text style={{color: 'brown', fontSize: 16}}>
                {t('sold out')}!
              </Text>
            </View>
          )}
          <View style={styles.divider} />
          <View style={styles.footerContainer}>
            <View>
              <Text style={styles.info}>{t('reserve price')}</Text>
              <Text style={styles.price}>
                <Currency price={getEventPrice(item)} /> <CurrencySymbol />
              </Text>
            </View>
            <View style={styles.flexRow}>
              <TouchableOpacity onPress={() => onClickLike(index)}>
                <Image
                  source={
                    userInfo &&
                    item.likes_number &&
                    item.likes_number.includes(userInfo?.user?.id)
                      ? likeBlueImg
                      : likeImg
                  }
                />
              </TouchableOpacity>
              <Text style={styles.likeNum}>{getLikesNumber(item)}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  return (
    <ScrollView style={styles.container}>
      <View style={styles.eventContainer}>
        {loading && <Loading />}
        {events.map((item, index) => (
          <EventCard
            userInfo={userInfo}
            item={item}
            index={index}
            onClickLike={onClickLike}
            key={'exc' + index}
          />
          // <Card item={item} index={index} key={item.id} />
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#14142f',
  },
  eventContainer: {
    flex: 1,
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  cardContainer: {
    marginBottom: 30,
    height: 440,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    overflow: 'hidden',
    borderRadius: 12,
  },
  img: {
    width: '100%',
    height: '100%',
  },
  imageDiv: {
    position: 'relative',
    height: 220,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
  },
  cardMeta: {
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    width: '100%',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  detailContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
  },
  collectionContainer: {
    width: '50%',
  },
  collectionSub: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 8,
  },
  creatorContainer: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  divider: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    height: 1,
    marginVertical: 20,
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  name: {
    fontFamily: 'SpaceGrotesk-Medium',
    fontSize: 24,
    fontWeight: Platform.OS === 'ios' ? '700' : '500',
    color: '#fff',
    lineHeight: 24,
    width: '100%',
    textAlign: 'left',
    letterSpacing: 0.5,
    marginBottom: 20,
  },
  info: {
    fontFamily: 'SpaceGrotesk-Medium',
    color: 'rgba(255, 255, 255, 0.66)',
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 12,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  owner: {
    fontFamily: 'SpaceGrotesk-Medium',
    textAlign: 'left',
    fontSize: 16,
    lineHeight: 20,
    color: '#fff',
    fontWeight: Platform.OS === 'ios' ? '700' : '500',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  price: {
    fontFamily: 'SpaceGrotesk-Medium',
    fontSize: 24,
    fontWeight: Platform.OS === 'ios' ? '700' : '500',
    color: '#fff',
    lineHeight: 28,
    textAlign: 'left',
    marginTop: 5,
    letterSpacing: 0.5,
  },
  badgeMark: {
    backgroundColor: '#2f80ed',
    borderRadius: 20,
    borderColor: '#fff',
    borderWidth: 1,
    width: 16,
    height: 16,
    marginLeft: 10,
  },
  flexRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeNum: {
    fontFamily: 'SpaceGrotesk-Medium',
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.66)',
    fontWeight: '400',
    letterSpacing: 2,
    textAlign: 'center',
    marginLeft: 10,
  },
});
