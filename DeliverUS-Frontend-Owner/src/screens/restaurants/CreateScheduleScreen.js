import React, { useEffect, useState } from 'react'
import { Image, Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native'
import * as ExpoImagePicker from 'expo-image-picker'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import InputItem from '../../components/InputItem'
import TextRegular from '../../components/TextRegular'
import * as GlobalStyles from '../../styles/GlobalStyles'
import { create } from '../../api/SchedulesEndpoints'
import { showMessage } from 'react-native-flash-message'
import * as yup from 'yup'
import { ErrorMessage, Formik } from 'formik'
import TextError from '../../components/TextError'
import TextSemiBold from '../../components/TextSemibold'

export default function CreateScheduleScreen ({ navigation, route }) {
  const [backendErrors, setBackendErrors] = useState()
  const restaurantId = route?.params?.id

  const initialScheduleValues = { startTime: null, endTime: null, restaurantId: restaurantId }

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

  const createSchedule = async (values) => {
    setBackendErrors([])
    try {
      const createdSchedule = await create(restaurantId,values)
      showMessage({
        message: `Schedule with id: ${createdSchedule.id} succesfully created`,
        type: 'success',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
      navigation.navigate('ScheduleListScreen', { id: restaurantId, dirty: true })
    } catch (error) {
      console.log(error)
      setBackendErrors(error.errors)
    }
  }
  return (
    <Formik
      validationSchema={validationSchema}
      initialValues={initialScheduleValues}
      onSubmit={createSchedule}>
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

              <TextSemiBold>El formato esperado es: HH:mm:ss</TextSemiBold>

              <Pressable
                onPress={ handleSubmit }
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
  },
  switch: {
    marginTop: 5
  }
})
