import React, { useEffect, useState } from 'react'
import { Image, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native'
import * as ExpoImagePicker from 'expo-image-picker'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import * as yup from 'yup'
import DropDownPicker from 'react-native-dropdown-picker'
import InputItem from '../../components/InputItem'
import TextRegular from '../../components/TextRegular'
import * as GlobalStyles from '../../styles/GlobalStyles'
import { showMessage } from 'react-native-flash-message'
import { ErrorMessage, Formik } from 'formik'
import TextError from '../../components/TextError'
import { prepareEntityImages } from '../../api/helpers/FileUploadHelper'
import { buildInitialValues } from '../Helper'
import { getOneSchedule, getSchedule, getSchedules, update } from '../../api/SchedulesEndpoints'

export default function EditScheduleScreen ({ navigation, route }) {
  const [backendErrors, setBackendErrors] = useState()
  const [schedule, setSchedule] = useState({})
  const { id, restaurantId } = route.params
  
  const [initialScheduleValues, setInitialScheduleValues] = useState({ startTime: null, endTime: null, restaurantId: route.params.id })
  
   //he creado un formato de la hora que debe ser cumplido por start y end.
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;

  const validationSchema = yup.object().shape({
  startTime: yup
      .string()
      .matches(timeRegex, 'Start time must be in HH:mm:ss format')
      .required('Start Time is required'),
  endTime: yup
      .string()
      .matches(timeRegex, 'End time must be in HH:mm:ss format')
      .required('End Time is required')
      //aqui se hace el test de endTime > startTime
    .test('is-greater', 'End time must be later than start time', function(value) {
        const { startTime } = this.parent

        if (!startTime || !value) return true

        const toSeconds = time => {
          const [h, m, s] = time.split(':').map(Number)
          return h * 3600 + m * 60 + s;
        }
        return toSeconds(value) > toSeconds(startTime)
      })
  })

  
  useEffect(() => {
    async function fetchSchedule() {
      try {                                         
        const allSchedules = await getSchedules(restaurantId)
        const selectedSchedule = allSchedules.find(s => s.id == id)

        if(!selectedSchedule){
          throw new Error('Schedule Not Found')
        }
        setSchedule(selectedSchedule)
        setInitialScheduleValues({
          startTime: selectedSchedule.startTime,
          endTime: selectedSchedule.endTime
        })

      } catch (error) {
        showMessage({
          message: `There was an error while retrieving schedule (id ${id}). ${error}`,
          type: 'error',
          style: GlobalStyles.flashStyle,
          titleStyle: GlobalStyles.flashTextStyle
        })
      }
    }
    fetchSchedule()
  }, [id])


  const updateSchedule = async (values) => {
    setBackendErrors([])
    try {
      const updatedSchedule = await update(restaurantId, schedule.id, values)
      showMessage({
        message: `Schedule ${updatedSchedule.id} succesfully updated`,
        type: 'success',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
      navigation.navigate('ScheduleListScreen', { id: route.params.id, dirty: true })
    } catch (error) {
      console.log(error)
      setBackendErrors(error.errors)
    }
  }

  return (
    <Formik
      enableReinitialize
      validationSchema={validationSchema}
      initialValues={initialScheduleValues}
      onSubmit={updateSchedule}>
      {({ handleSubmit, setFieldValue, values }) => (
        <ScrollView>
          <View style={{ alignItems: 'center' }}>
            <View style={{ width: '60%' }}>
              <InputItem
                name='startTime'
                label='Start Time:'
              />
              <InputItem
                name='endTime'
                label='End Time:'
              />

              {backendErrors &&
                backendErrors.map((error, index) => <TextError key={index}>{error.param}-{error.msg}</TextError>)
              }

              <Pressable
                onPress={handleSubmit}
                style={({ pressed }) => [
                  {
                    backgroundColor: pressed
                      ? GlobalStyles.brandSuccessTap
                      : GlobalStyles.brandSuccess
                  },
                  styles.button
                ]}>
                <View style={[{ flex: 1, flexDirection: 'row', justifyContent: 'center' }]}>
                  <MaterialCommunityIcons name='content-save' color={'white'} size={20}/>
                  <TextRegular textStyle={styles.text}>
                    Save
                  </TextRegular>
                </View>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      )}
    </Formik>
  )
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    height: 40,
    padding: 10,
    width: '100%',
    marginTop: 20,
    marginBottom: 20
  },
  text: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginLeft: 5
  },
  imagePicker: {
    height: 40,
    paddingLeft: 10,
    marginTop: 20,
    marginBottom: 80
  },
  image: {
    width: 100,
    height: 100,
    borderWidth: 1,
    alignSelf: 'center',
    marginTop: 5
  }
})
