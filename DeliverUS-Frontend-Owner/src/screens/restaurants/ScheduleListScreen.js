/* eslint-disable react/prop-types */
import React, { useContext, useEffect, useState } from 'react'
import { StyleSheet, FlatList, Pressable, View } from 'react-native'
import ImageCard from '../../components/ImageCard'
import TextSemiBold from '../../components/TextSemibold'
import TextRegular from '../../components/TextRegular'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import * as GlobalStyles from '../../styles/GlobalStyles'
import { AuthorizationContext } from '../../context/AuthorizationContext'
import { showMessage } from 'react-native-flash-message'
import { getSchedules, remove } from '../../api/SchedulesEndpoints'
import restaurantLogo from '../../../assets/restaurantLogo.jpeg'
import { API_BASE_URL } from '@env'
import DeleteModal from '../../components/DeleteModal'

export default function ScheduleListScreen ({ navigation, route }) {
  const [schedules, setSchedules] = useState({})
  const { loggedInUser } = useContext(AuthorizationContext)
  const { id, restaurantId } = route.params
  
  const [ scheduleToBeDeleted, setScheduleToBeDeleted ] = useState(null) 

  useEffect(() => {
    if (loggedInUser) {
      fetchSchedules()
    } else {
      setSchedules(null)
    }
  }, [loggedInUser, route])

  const fetchSchedules = async () => {
    try {
      const fetchedSchedules = await getSchedules(route.params.id)
      setSchedules(fetchedSchedules)
    } catch (error) {
      showMessage({
        message: `There was an error while retrieving schedules. ${error} `,
        type: 'error',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    }
  }
  const renderHeader = () => {
      return (
        <View>
          <Pressable
            onPress={() => navigation.navigate('CreateScheduleScreen', { id: route.params.id })
            }
            style={({ pressed }) => [
              {
                backgroundColor: pressed
                  ? GlobalStyles.brandGreenTap
                  : GlobalStyles.brandGreen
              },
              styles.button
            ]}>
            <View style={[{ flex: 1, flexDirection: 'row', justifyContent: 'center' }]}>
              <MaterialCommunityIcons name='plus-circle' color={'white'} size={20} />
              <TextRegular textStyle={styles.text}>
                Create Schedule
              </TextRegular>
            </View>
          </Pressable>
        </View>
      )
    }
  
  
  const renderSchedule = ({ item }) => {
    return (
      <ImageCard
      imageUri={item.logo ? { uri: API_BASE_URL + '/' + item.logo } : restaurantLogo}
              onPress={() => {
                navigation.navigate('RestaurantDetailScreen', { id: item.id })
              }}>
        <TextSemiBold>Schedule:</TextSemiBold>
        <TextSemiBold>Start Time: {item.startTime}</TextSemiBold>
        <TextSemiBold>End Time: {item.endTime}</TextSemiBold>
        
        <View style={styles.actionButtonsContainer}>
                <Pressable                    //le pasamos los dos parametros que necesitamos 
                onPress={() => navigation.navigate('EditScheduleScreen', { id: item.id, restaurantId: id })}
                style={({ pressed }) => [
                    {
                    backgroundColor: pressed
                        ? GlobalStyles.brandBlueTap
                        : GlobalStyles.brandBlue
                    },
                    styles.actionButton
                ]}>
                <View style={[{ flex: 1, flexDirection: 'row', justifyContent: 'center' }]}>
                <MaterialCommunityIcons name='pencil' color={'white'} size={20}/>
                <TextRegular textStyle={styles.text}>
                    Edit
                </TextRegular>
                </View>
            </Pressable>

            <Pressable                     
                onPress={() => {setScheduleToBeDeleted(item)}}
                style={({ pressed }) => [
                    {
                    backgroundColor: pressed
                        ? GlobalStyles.brandPrimaryTap
                        : GlobalStyles.brandPrimary
                    },
                    styles.actionButton
                ]}>
                <View style={[{ flex: 1, flexDirection: 'row', justifyContent: 'center' }]}>
                <MaterialCommunityIcons name='delete' color={'white'} size={20}/>
                <TextRegular textStyle={styles.text}>
                    Delete
                </TextRegular>
                </View>
            </Pressable>
        </View>
      </ImageCard>
    )
  }

  const renderEmptySchedulesList = () => {
    return (
      <TextRegular textStyle={styles.emptyList}>
        No schedules were retreived. Are you logged in? If so, this restaurant has not schedules.
      </TextRegular>
    )
  }

  const removeSchedule = async (item) => {
    try {       //route.params = id (definido arriba)
      await remove(id, item.id)
      await fetchSchedules()
      setScheduleToBeDeleted(null)
      showMessage({
        message: `Schedule ${item.id} succesfully removed`,
        type: 'success',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    } catch (error) {
      console.log(error)
      setScheduleToBeDeleted(null)
      showMessage({
        message: `Schedule ${item.id} could not be removed.`,
        type: 'error',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    }
  }
  
  return (
    <>
    <FlatList
      style={styles.container}
      data={schedules}
      renderItem={renderSchedule}
      keyExtractor={item => item.id.toString()}
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={renderEmptySchedulesList}
    />
    <DeleteModal
      isVisible={scheduleToBeDeleted !== null}
      onCancel={() => setScheduleToBeDeleted(null)}
      onConfirm={() => removeSchedule(scheduleToBeDeleted)}>
        <TextRegular>This schedule will be deleted</TextRegular>
    </DeleteModal>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  button: {
    borderRadius: 8,
    height: 40,
    marginTop: 12,
    padding: 10,
    alignSelf: 'center',
    flexDirection: 'row',
    width: '80%'
  },
  actionButton: {
    borderRadius: 8,
    height: 40,
    marginTop: 12,
    margin: '1%',
    padding: 10,
    alignSelf: 'center',
    flexDirection: 'column',
    width: '50%'
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    bottom: 5,
    position: 'absolute',
    width: '90%'
  },
  text: {
    fontSize: 16,
    color: 'white',
    alignSelf: 'center',
    marginLeft: 5
  },
  emptyList: {
    textAlign: 'center',
    padding: 50
  }
})
