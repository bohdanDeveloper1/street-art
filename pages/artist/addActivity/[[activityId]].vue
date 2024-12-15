<template>
  <div>
    <PageLoaderComponent v-if="isActivityDataFetching"/>
    <div
      class="_container"
      :class="{'container-hidden': isActivityDataFetching}"
    >
      <div v-if="!ifActivityWasAdded">
        <div class="form-container">
          <!-- Error alert -->
          <div v-if="exceptionMessage !== '' ">
            <v-alert
                :title="exceptionTitle"
                :text="exceptionMessage"
                type="error"
            />
          </div>
          <div>
            <h2 class="form-header">{{isActivityInUpdateMode ? 'Update your activity' : 'Create an activity'}}</h2>
            <div class="flex-container">
              <div class="left-group-container">
                <!--activityName-->
                <div class="form-item-container">
                  <v-text-field
                      v-model="activityName"
                      :counter="50"
                      :error-messages="activityNameErrorMessage"
                      label="Activity name"
                      variant="solo"
                      density="compact"
                      @input="validateActivityName(false)"
                      @blur="validateActivityName(true)"
                  ></v-text-field>
                </div>
                <!-- Categories selector  -->
                <div class="form-item-container">
                  <v-autocomplete
                      label="Category"
                      v-model="activityCategory"
                      :items="artCategories"
                      :error-messages="activityCategoryErrorMessage"
                      variant="solo"
                      density="compact"
                      @update:model-value="validateActivityCategory(false)"
                      @blur="validateActivityCategory(true)"
                  ></v-autocomplete>
                </div>
                <!--   Cities selector-->
                <div class="form-item-container">
                  <v-autocomplete
                      label="City"
                      v-model="activityCity"
                      :items="citiesDataArray"
                      :error-messages="activityCityErrorMessage"
                      variant="solo"
                      density="compact"
                      @blur="onActivityCityChanged"
                      @update:model-value="onActivityCityChanged"
                  ></v-autocomplete>
                </div>
                <!--   Street input -->
                <div class="form-item-container">
                  <v-text-field
                      v-model="activityStreet"
                      :counter="50"
                      :error-messages="activityStreetErrorMessage"
                      label="Street"
                      variant="solo"
                      density="compact"
                      @input="validateActivityStreet(false)"
                      @blur="onActivityStreetChanged"
                      @keyup.enter="onActivityStreetChanged"
                  ></v-text-field>
                </div>
                <!--   HouseNumber input -->
                <div class="form-item-container">
                  <v-text-field
                      v-model="activityHouseNumber"
                      @input="validateActivityHouseNumber(false)"
                      @blur="validateActivityHouseNumber(true)"
                      @change="showCityAndStreetAndHouseOnMap"
                      label="House number (optional)"
                      variant="solo"
                      density="compact"
                  ></v-text-field>
                </div>
              </div>
              <!-- Map component -->
              <div class="leafletMapContainer">
                 <LMap class="leafletMap" style="height: 100%; width: 100%" :zoom="mapZoom" :center="[mapCenterLat, mapCenterLng]">
                   <LTileLayer
                       url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                       attribution="&amp;copy; <a href=&quot;https://www.openstreetmap.org/&quot;>OpenStreetMap</a> contributors"
                       layer-type="base"
                       name="OpenStreetMap"
                   />
                   <LMarker v-if="showMarker" :lat-lng="[markerLat, markerLng]" draggable @dragend="updateMarkerLatLng" />
                 </LMap>
              </div>
            </div>
            <!--  activityDateTime   -->
            <div class="form-datepicker-container">
              <DatePickerComponent
                @onChange="triggerDatesListValidation = true"
              />
              <p class="my-error-message" v-if="activityDatesErrorMessage">{{ activityDatesErrorMessage }}</p>
            </div>
            <!-- activityDescription -->
            <div class="form-item-container">
              <v-textarea
                label="Describe your activity"
                v-model="activityDescription"
                :error-messages="activityDescriptionErrorMessage"
                variant="solo"
                :counter="1500"
                @input="validateActivityDescription(false)"
                @blur="validateActivityDescription(true)"
              >
              </v-textarea>
            </div>
            <!-- activityMainPhoto -->
            <div class="form-item-container">
              <v-file-input
                  :label="isActivityInUpdateMode ? 'Change activity photo (optional)' : 'Main photo to describe activity'"
                  v-model="activityMainPhotoFile"
                  :error-messages="activityMainPhotoFileErrorMessage"
                  @update:model-value="validateActivityMainPhotoFile(true)"
                  accept="image/*"
                  variant="solo"
                  chips
                  density="compact"
                  show-size
              ></v-file-input>
            </div>
            <!-- activityAdditionalPhotos -->
            <div class="form-item-container">
              <v-file-input
                  :label="isActivityInUpdateMode ? 'Change additional photos (optional)' : 'Additional photos (optional)'"
                  v-model="activityAdditionalPhotoFiles"
                  :error-messages="activityAdditionalPhotoFilesErrorMessage"
                  @update:model-value="validateActivityAdditionalPhotoFiles(true)"
                  accept="image/*"
                  variant="solo"
                  multiple
                  counter
                  density="compact"
              />
              <div
                  class="input-chips-container"
                  v-if="activityAdditionalPhotoFiles && activityAdditionalPhotoFiles.length"
              >
                <div
                    v-for="photo in activityAdditionalPhotoFiles"
                    :key="photo.name"
                    class="input-chip"
                    @click.stop="deleteAdditionalPhoto(photo.name)"
                >
                  {{ photo.name }}
                </div>
              </div>
            </div>
            <!-- submitBTN -->
            <v-btn
              class="me-4 submit-button"
              :loading="isActivityUpdating"
              @click="updateActivity"
              v-if="isActivityInUpdateMode"
            >
              update an activity
            </v-btn>
            <v-btn
                class="me-4 submit-button"
                :loading="isActivityCreating"
                @click="addActivity"
                v-else
            >
              create an activity
            </v-btn>
          </div>
        </div>
      </div>
      <div v-else class="activity-added-container">
        <div class="activity-added-img">
          <img class="form-added-success-img" src="/images/success_icon.png" alt="success">
        </div>
        <h2>Success!</h2>
        <h5>Activity was added</h5>
        <div class="btn-container">
          <v-btn
            class="btn-add-one-more"
            @click="addOneMoreActivity"
          >
            add one more
          </v-btn>
          <v-btn
              class="link-button"
          >
            <NuxtLink to="/artist/myActivities" class="link-item">go to my activities</NuxtLink>
          </v-btn>
      </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import '@vuepic/vue-datepicker/dist/main.css';
import { getStorage } from "firebase/storage";
import {useDateListStore} from "~/stores/datesList";
import {useFirebaseFilesDataStore} from '~/stores/firebaseFilesDataStore/useFirebaseFilesDataStore'
import {useAuthStore} from '~/stores/authStore/useAuthStore'
import type {ICityData} from '~/types/ICityData'
import type {IExtendedActivityData} from '~/types/IExtendedActivityData'
import type {IDateList} from '~/types/IDateList'
import {useRoute} from 'vue-router'
import {useFirebaseApiStore} from '~/stores/api/useFirebaseApiStore'
import DatePickerComponent from '~/components/addActivity/DatePickerComponent.vue'
import PageLoaderComponent from '~/components/pageLoaderComponent.vue'

const storage = getStorage()
const authStore = useAuthStore()
const ifActivityWasAdded = ref(false)

// map configuration
const mapZoom = ref(6);
const mapCenterLat = ref(52.215933);
const mapCenterLng = ref(19.134422);
const showMarker = ref(false);
const markerLat = ref<number>(0)
const markerLng = ref<number>(0)
const exceptionMessage = ref('');
const exceptionTitle = ref('');

// activity categories
const artCategoriesList: {name: string}[] = await getArtCategoriesList()
const artCategories = computed(() => {
  return artCategoriesList.map(item => item.name)
})

// activity cities
const citiesDataJSON: ICityData[] = await getCitiesData()
const citiesDataArray = computed(() => {
  return citiesDataJSON.map(city => city.name + ', ' + city.admin_name)
})

// datePicker variables
const dateListStore = useDateListStore()
const {datesListLength} = storeToRefs(dateListStore)
const dateListStartEndArray = reactive<{start: number, end: number}[]>([])
const isActivityCreating = ref(false);

/////////////////////////////////////////////////////////  VALIDATION
const activityName = ref<string>('')
const triggerActivityNameValidation = ref<boolean>(false)
const activityNameErrorMessage = ref<string>('')
function validateActivityName(startValidation?: boolean) {
  if(startValidation) triggerActivityNameValidation.value = true

  if(triggerActivityNameValidation.value) {
    if (activityName.value.length <= 2) return activityNameErrorMessage.value = 'Name needs to be at least 3 characters'
    if (activityName.value.length > 50) return activityNameErrorMessage.value = 'Name is too long'

    return activityNameErrorMessage.value = ''
  }
}

const activityCategory = ref<string>('')
const triggerActivityCategoryValidation = ref<boolean>(false)
const activityCategoryErrorMessage = ref<string>('')
function validateActivityCategory(startValidation?: boolean) {
  if(startValidation) triggerActivityCategoryValidation.value = true

  if(triggerActivityCategoryValidation.value) {
    if (!activityCategory.value) return activityCategoryErrorMessage.value = 'Select a category'

    return activityCategoryErrorMessage.value = ''
  }
}

const triggerDatesListValidation = ref<boolean>(false)
const activityDatesErrorMessage = computed(() => {
  if(triggerDatesListValidation.value && !datesListLength.value) return 'Choose at least 1 date'

  return ''
})

const activityCity = ref<string>('')
const triggerActivityCityValidation = ref<boolean>(false)
const activityCityErrorMessage = ref<string>('')
function validateActivityCity(startValidation?: boolean) {
  if(startValidation) triggerActivityCityValidation.value = true

  if(triggerActivityCityValidation.value) {
    if (!activityCity.value) return activityCityErrorMessage.value = 'Select a city'

    return activityCityErrorMessage.value = ''
  }
}

const activityStreet = ref<string>('')
const triggerActivityStreetValidation = ref<boolean>(false)
const activityStreetErrorMessage = ref<string>('')
function validateActivityStreet(startValidation?: boolean) {
  if(startValidation) triggerActivityStreetValidation.value = true

  if(triggerActivityStreetValidation.value) {
    if (activityStreet.value.length <= 2) return activityStreetErrorMessage.value = 'Invalid street name'
    return activityStreetErrorMessage.value = ''
  }
}

let lastSelectedCity: string
async function onActivityCityChanged() {
  validateActivityCity(true)

  if(!activityCityErrorMessage.value && lastSelectedCity !== activityCity.value) {
    await showCityOnMap()
    lastSelectedCity = activityCity.value
  }
}

let lastActivityStreetValue = ''
async function onActivityStreetChanged() {
  validateActivityStreet(true)
  if (activityStreetErrorMessage.value || lastActivityStreetValue === activityStreet.value) return

  lastActivityStreetValue = activityStreet.value
  await showCityAndStreetOnMap()
}

const activityDescription = ref<string>('')
const triggerActivityDescriptionValidation = ref<boolean>(false)
const activityDescriptionErrorMessage = ref<string>('')
function validateActivityDescription(startValidation?: boolean) {
  if(startValidation) triggerActivityDescriptionValidation.value = true

  if(triggerActivityDescriptionValidation.value) {
    if (activityDescription.value.length <= 2) return activityDescriptionErrorMessage.value = 'Description needs to be at least 3 characters'
    if (activityDescription.value.length > 1500) return activityDescriptionErrorMessage.value = 'Description is too long'

    return activityDescriptionErrorMessage.value = ''
  }
}

const activityMainPhotoFile = ref()
const triggerActivityMainPhotoFileValidation = ref<boolean>(false)
const activityMainPhotoFileErrorMessage = ref<string>('')
function validateActivityMainPhotoFile(startValidation?: boolean) {
  if(startValidation) triggerActivityMainPhotoFileValidation.value = true

  if(triggerActivityMainPhotoFileValidation.value) {
    if (!activityMainPhotoFile.value) return activityMainPhotoFileErrorMessage.value = 'Select a photo'

    return activityMainPhotoFileErrorMessage.value = ''
  }
}

const activityAdditionalPhotoFiles = ref()
const triggerActivityAdditionalPhotoFilesValidation = ref<boolean>(false)
const activityAdditionalPhotoFilesErrorMessage = ref<string>('')
function validateActivityAdditionalPhotoFiles(startValidation?: boolean) {
  if(startValidation) triggerActivityAdditionalPhotoFilesValidation.value = true

  if(triggerActivityAdditionalPhotoFilesValidation.value) {
    if (activityAdditionalPhotoFiles.value && activityAdditionalPhotoFiles.value.length > 12) return activityAdditionalPhotoFilesErrorMessage.value = 'Max number of photos is 12'

    return activityAdditionalPhotoFilesErrorMessage.value = ''
  }
}

function deleteAdditionalPhoto(name: string) {
  activityAdditionalPhotoFiles.value = activityAdditionalPhotoFiles.value.filter(photo => {
    return photo.name === name
  })
}

const activityHouseNumber = ref<string>('')
const triggerActivityHouseNumberValidation = ref<boolean>(false)
const activityHouseNumberErrorMessage = ref<string>('')
function validateActivityHouseNumber(startValidation?: boolean) {
  if(startValidation) triggerActivityHouseNumberValidation.value = true

  if(triggerActivityHouseNumberValidation.value) {
    if (activityHouseNumber.value.length > 7) return activityHouseNumberErrorMessage.value = 'Enter valid house number'

    return activityHouseNumberErrorMessage.value = ''
  }
}

const route = useRoute()
const firebaseApiStore = useFirebaseApiStore()
const isActivityInUpdateMode = ref<boolean>(false)
const isActivityDataFetching = ref<boolean>(false)
onMounted(async () => {
  dateListStore.datesList.length = 0

  if(route.params.activityId) {
    isActivityInUpdateMode.value = true
    isActivityDataFetching.value = true

    const response: IExtendedActivityData[] = await firebaseApiStore.get<IExtendedActivityData>(
      'activities',
      undefined,
      route.params.activityId as string
    )
    const activity: IExtendedActivityData = response[0]

    // todo:
    // await get activity photos

    activityName.value = activity.name
    activityCategory.value = activity.category
    activityCity.value = activity.cityName
    activityStreet.value = activity.streetName
    activityHouseNumber.value = activity.houseNumber
    activityDescription.value = activity.description
    mapZoom.value = 17
    mapCenterLat.value = activity.coordinatesLat
    mapCenterLng.value = activity.coordinatesLng
    showMarker.value = true
    markerLat.value = activity.coordinatesLat
    markerLng.value = activity.coordinatesLng

    activity.activityDates.forEach(date => {
      const dateStart: Date = new Date(date.start)
      const dateEnd: Date = new Date(date.end)

      const activityDateInfo: IDateList = {
        dateStart: dateStart,
        dateEnd: dateEnd,
        timeStart: {
          hours: dateStart.getHours(),
          minutes: dateStart.getMinutes(),
          seconds: 0,
        },
        timeEnd: {
          hours: dateEnd.getHours(),
          minutes: dateEnd.getMinutes(),
          seconds: 0,
        }
      }
      dateListStore.datesList.push(activityDateInfo)
    })
    isActivityDataFetching.value = false
  }
})

function validateForm(): boolean {
  const formErrors: string[] = []

  validateActivityName(true)
  formErrors.push(activityNameErrorMessage.value)
  validateActivityCategory(true)
  formErrors.push(activityCategoryErrorMessage.value)
  validateActivityCity(true)
  formErrors.push(activityCityErrorMessage.value)
  validateActivityStreet(true)
  formErrors.push(activityStreetErrorMessage.value)
  validateActivityHouseNumber(true)
  formErrors.push(activityHouseNumberErrorMessage.value)
  triggerDatesListValidation.value = true
  formErrors.push(activityDatesErrorMessage.value)
  validateActivityDescription(true)
  formErrors.push(activityDescriptionErrorMessage.value)
  validateActivityMainPhotoFile(true)
  formErrors.push(activityMainPhotoFileErrorMessage.value)
  validateActivityAdditionalPhotoFiles(true)
  formErrors.push(activityAdditionalPhotoFilesErrorMessage.value)

  for(let i = 0; i < formErrors.length; i++) {
    if(formErrors[i]) return false
  }

  return true
}

////////////////////////////////////////////////////////////      UPDATE ACTIVITY
const isActivityUpdating = ref<boolean>(false)
async function updateActivity() {
  if(!validateForm()) return
  if(!processDateList()) return
  isActivityUpdating.value = true

  try{
    const activityCityData: {name: string, admin_name: string} = getActivityCityData()
    // const mainPhotoRef: string[] | null = await firebaseFilesDataStore.postFiles(
    //     'activityPhoto',
    //     activityName.value,
    //     activityMainPhotoFile.value
    // )
    // const additionalPhotoRefs: string[] | null = await firebaseFilesDataStore.postFiles(
    //     'additionalPhoto',
    //     activityName.value,
    //     activityAdditionalPhotoFiles.value
    // )
    //   activityData: IExtendedActivityData
    const activityData = {
      artistUid: authStore.userInfo.uid,
      name: activityName.value.trim(),
      activityDates: dateListStartEndArray,
      activityEnd: dateListStartEndArray[dateListStartEndArray.length - 1].end,
      category: activityCategory.value,
      // city coordinates
      cityName: activityCityData.name,
      cityAdmin: activityCityData.admin_name,
      coordinatesLat: markerLat.value,
      coordinatesLng: markerLng.value,
      // street and house info
      streetName: activityStreet.value.trim(),
      houseNumber: activityHouseNumber.value ? activityHouseNumber.value : '',
      description: activityDescription.value.trim(),
      // mainPhotoRef: (mainPhotoRef && mainPhotoRef[0]) ? mainPhotoRef[0] : '',
      // additionalPhotosRefs: additionalPhotoRefs ? additionalPhotoRefs : null,
    }
    await firebaseApiStore.patch('activities', route.params.activityId as string, activityData)
  } catch (error) {
    console.log(error)
    throw error
  } finally {
    isActivityUpdating.value = false
  }
}

////////////////////////////////////////////////////////////      ADD ACTIVITY
const firebaseFilesDataStore = useFirebaseFilesDataStore()
async function addActivity() {
  if(!validateForm()) return
  if(!processDateList()) return
  isActivityCreating.value = true

  try{
    const activityCityData: {name: string, admin_name: string} = getActivityCityData()
    const mainPhotoRef: string[] | null = await firebaseFilesDataStore.postFiles(
      'activityPhoto',
      activityName.value,
      activityMainPhotoFile.value
    )
    const additionalPhotoRefs: string[] | null = await firebaseFilesDataStore.postFiles(
      'additionalPhoto',
      activityName.value,
      activityAdditionalPhotoFiles.value
    )
    const activityData: IExtendedActivityData = {
      artistUid: authStore.userInfo.uid,
      name: activityName.value.trim(),
      activityDates: dateListStartEndArray,
      activityEnd: dateListStartEndArray[dateListStartEndArray.length - 1].end,
      category: activityCategory.value,
      // city coordinates
      cityName: activityCityData.name,
      cityAdmin: activityCityData.admin_name,
      coordinatesLat: markerLat.value,
      coordinatesLng: markerLng.value,
      // street and house info
      streetName: activityStreet.value.trim(),
      houseNumber: activityHouseNumber.value ? activityHouseNumber.value : '',
      description: activityDescription.value.trim(),
      mainPhotoRef: (mainPhotoRef && mainPhotoRef[0]) ? mainPhotoRef[0] : '',
      additionalPhotosRefs: additionalPhotoRefs ? additionalPhotoRefs : null,
    }
    await firebaseApiStore.post('activities', activityData)
    ifActivityWasAdded.value = true
  } catch (error) {
    console.log(error)
  } finally {
    isActivityCreating.value = false
  }
}

function addOneMoreActivity() {
  activityName.value = ''
  triggerActivityNameValidation.value = false
  dateListStore.datesList.length = 0
  triggerDatesListValidation.value = false
  dateListStartEndArray.length = 0
  activityDescription.value = ''
  triggerActivityDescriptionValidation.value = false
  activityMainPhotoFile.value = null
  triggerActivityMainPhotoFileValidation.value = false
  activityAdditionalPhotoFiles.value = null
  triggerActivityAdditionalPhotoFilesValidation.value = false

  ifActivityWasAdded.value = false
}

function processDateList(): boolean {
  dateListStartEndArray.length = 0;

  if (datesListLength.value){
    for(let i = 0; i < datesListLength.value; i++) {
      const startDate: Date = dateListStore.datesList[i].dateStart;
      const endDate: Date = dateListStore.datesList[i].dateEnd;
      const timeStart: IDateList['timeStart'] = dateListStore.datesList[i].timeStart;
      const timeEnd: IDateList['timeEnd'] = dateListStore.datesList[i].timeEnd;

      if (timeStart && timeEnd) {
        const startDateTime: number = startDate.setHours(timeStart.hours, timeStart.minutes, timeStart.seconds)
        const endDateTime: number = endDate.setHours(timeEnd.hours, timeEnd.minutes, timeEnd.seconds);

        dateListStartEndArray.push({
          start: startDateTime,
          end: endDateTime,
        });
      }else{
        const unChosenTime = new Date(dateListStore.datesList[i].dateStart);

        exceptionTitle.value = `Unselected time start or time end`;
        exceptionMessage.value = `Please select timeStart and timeEnd for ${unChosenTime.toDateString()}`;
        scrollToTop();

        return false;
      }
    }
  } else {
    exceptionTitle.value = `Unselected activity date`;
    exceptionMessage.value = `Please select at least 1 date to your activity`;
    scrollToTop();

    return false;
  }

  exceptionTitle.value = '';
  exceptionMessage.value = '';

  return true;
}

async function getCitiesData(): Promise<ICityData[]> {
  try{
    const {data} = await useFetch('/api/citiesList')
    // @ts-ignore
    return data.value.sortedCitiesListData
  } catch (e) {
    console.log(e)
    throw e
  }
}

async function getArtCategoriesList(): Promise<{name: string}[]> {
  try{
    const {data} = await useFetch('/api/artCategoriesList')
    // @ts-ignore
    return data.value.artCategoriesList
  } catch (e) {
    console.log(e)
    throw e
  }
}

function getActivityCityData(): {name: string, admin_name: string} {
  const cityData = activityCity.value
  const parts = cityData.split(", ")

  const cityName = parts[0]
  const cityAdminName = parts[1]

  return {
    name: cityName,
    admin_name: cityAdminName
  }
}

function scrollToTop() {
  document.documentElement.scrollTop = 0 // For modern browsers
  document.body.scrollTop = 0 // For older browsers
}

// todo: add to storage
async function showCityOnMap() {
  try {
    const cityData = activityCity.value;
    // Розділення рядка за допомогою коми та пробілу
    const [city, district] = cityData.split(", ");
    // запит до API для отримання координат міста
    const response  = await fetch(`https://geocode.maps.co/search?q=${city}+${district}+Poland&api_key=659450539ff1f762862410sea796255`);
    const data = await response.json();

    // Якщо результати є, беремо перший результат
    if (data.length > 0) {
      const activityCoordinates = data[0];

      mapCenterLat.value = Number(activityCoordinates.lat);
      mapCenterLng.value = Number(activityCoordinates.lon);
      mapZoom.value = 12;
      activityStreet.value = '';
      activityHouseNumber.value = '';
    }
  } catch (error) {
    // Обробка помилок, наприклад, у випадку невдалих запитів до API
    console.log('Error during fetching data for mapCenter from geocode.maps API:', error);
  }
}

// todo: add to storage
async function showCityAndStreetOnMap() {
  if(activityCity.value){
    try {
      const cityData = activityCity.value;
      const [city, district] = cityData.split(", ");
      // запит до API для отримання координат міста та вулиці
      const response  = await fetch(`https://geocode.maps.co/search?q=${activityStreet.value.trim()}+${city}+${district}+Poland&api_key=659450539ff1f762862410sea796255`);
      const data = await response.json();

      // Якщо результати є, беремо перший результат
      if (data.length) {
        const activityCoordinates = data[0];

        mapCenterLat.value = Number(activityCoordinates.lat);
        mapCenterLng.value = Number(activityCoordinates.lon);
        markerLat.value = mapCenterLat.value;
        markerLng.value = mapCenterLng.value;
        showMarker.value = true;
        mapZoom.value = 17;

        activityHouseNumber.value = '';
        exceptionTitle.value = '';
        exceptionMessage.value = '';
      }else{ // якщо не знайдено координати
        exceptionTitle.value = `No such street in ${activityCity.value}`;
        exceptionMessage.value = `Please enter valid street name.`;
        scrollToTop();
      }
    } catch (error) {
      // Обробка помилок, наприклад, у випадку невдалих запитів до API
      console.log('Error during fetching data for mapCenter from geocode.maps API:', error);
      exceptionTitle.value = `No such street in ${activityCity.value}`;
      exceptionMessage.value = `Please enter valid street name.`;
      scrollToTop();
    }
  }else{ // якщо не обрано місто
    activityCity.value = '';
    activityStreet.value = '';
    exceptionTitle.value = `Unselected city`;
    exceptionMessage.value = 'Select city, then input street name';
    scrollToTop();
  }
}

// todo: add to storage
async function showCityAndStreetAndHouseOnMap(){
  if(activityCity.value !== undefined && activityCity.value !== '' && activityStreet.value !== undefined && activityStreet.value !== ''){
    try {
      const cityData = activityCity.value;
      const [city, district] = cityData.split(", ");
      // запит до API для отримання координат міста та вулиці
      const response  = await fetch(`https://geocode.maps.co/search?street=${activityStreet.value.trim()}+${activityHouseNumber.value.trim()}&city=${city}&country=Poland&api_key=659450539ff1f762862410sea796255`);
      const data = await response.json();

      // Якщо результати є, беремо перший результат
      if (data.length > 0) {
        const activityCoordinates = data[0];

        mapCenterLat.value = Number(activityCoordinates.lat);
        mapCenterLng.value = Number(activityCoordinates.lon);
        markerLat.value = mapCenterLat.value;
        markerLng.value = mapCenterLng.value
        showMarker.value = true;
        mapZoom.value = 17;

        exceptionTitle.value = '';
        exceptionMessage.value = '';
      }else{
        exceptionTitle.value = `No such house number in ${activityCity.value}, ${activityStreet.value}`;
        exceptionMessage.value = 'Please enter valid house number';
        scrollToTop();
      }
    } catch (error) {
      // Обробка помилок, наприклад, у випадку невдалих запитів до API
      console.log('Error during fetching data for mapCenter from geocode.maps API:', error);
      exceptionTitle.value = `No such house number in ${activityCity.value}, ${activityStreet.value}`;
      exceptionMessage.value = 'Please enter valid house number';
      scrollToTop();
    }
  }else{
    activityCity.value = '';
    activityStreet.value = '';
    activityHouseNumber.value = '';
    exceptionTitle.value = 'Unselected city or street';
    exceptionMessage.value = 'Please select city and street, then enter valid house number';
    scrollToTop();
  }
}

// todo: add to storage
async function updateDataAfterMarkerDragged(lat: number, lon: number) {
  try {
    const response  = await fetch(`https://geocode.maps.co/reverse?lat=${lat.toString()}&lon=${lon.toString()}&api_key=659450539ff1f762862410sea796255`);
    const data = await response.json();
    activityStreet.value = data.address.road;
    activityHouseNumber.value = data.address.house_number ? data.address.house_number : "";
  } catch (error) {
    console.log('Error during dragging the marker:', error);
  }
}

// todo: add to storage
const updateMarkerLatLng = async (event: any) => {
  const updatedMarkerCoordinates: {lat: number, lng: number} = event.target.getLatLng()
  markerLat.value = updatedMarkerCoordinates.lat;
  markerLng.value = updatedMarkerCoordinates.lng;
  await updateDataAfterMarkerDragged(updatedMarkerCoordinates.lat, updatedMarkerCoordinates.lng);
}
</script>

<style scoped lang="scss">
.container-hidden {
  visibility: hidden;
}

/* form-container ------------------------------------------------------*/
.form-container{
  margin: 24px auto 40px auto;
  padding: 0 15px;
}

.form-item-container{
  margin-bottom: 8px;
}

.leafletMapContainer{
  height: 400px;
  margin-bottom: 24px;
}

.form-datepicker-container{
  margin-bottom: 22px;
}

.form-header{
  margin-bottom: 20px;
}

/* make RWD  -----------------------------------------------------------------*/
@media (max-width: 430px) {
  ._container{
    padding: 0 10px 0 10px;
  }

  .form-container{
    margin-top: 16px;
    width: 300px;
    padding: 0 0;
  }
}

@media (min-width: 1000px) {
  .form-container{
    width: 900px;
    background-color: white;
    border-radius: 15px;
    padding: 15px 15px 25px 15px;


    /* shadow */
   -webkit-box-shadow: 8px 8px 42px -20px rgba(66, 68, 90, 1);
   -moz-box-shadow: 8px 8px 42px -20px rgba(66, 68, 90, 1);
   box-shadow: 8px 8px 42px -20px rgba(66, 68, 90, 1);
  }

  .flex-container{
    display: flex;
    justify-content: space-between;
  }

  .left-group-container{
    width: 300px;
  }

  .leafletMapContainer{
    height: 320px;
    width: 550px;
  }
}

/* activity-added-container --------------------------------------------------*/
.activity-added-container{
  margin: 60px auto 50px auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 450px;
  height: 350px;
  border-radius: 15px;

  /* shadow */
  -webkit-box-shadow: 8px 8px 42px -20px rgba(66, 68, 90, 1);
  -moz-box-shadow: 8px 8px 42px -20px rgba(66, 68, 90, 1);
  box-shadow: 8px 8px 42px -20px rgba(66, 68, 90, 1);
}

.activity-added-img{
  margin-bottom: 20px;
}

.form-added-success-img{
  width: 150px;
  height: 150px;
}

/* make RWD  --------------------------------------------------------------------*/
@media (max-width: 515px) {
  .activity-added-container{
    width: 320px;
  }
}
@media (max-width: 355px) {
  .activity-added-container{
    width: 290px;
  }
}

.my-error-message{
  margin-top: -10px;
  padding-left: 14px;
  line-height: 12px;
  transition-duration: 150ms;
  color: rgb(176, 0, 32);
  font-weight: 400;
  font-size: 12px;
}

.submit-button{
  background: #000;
  color: white;
}

.btn-container{
  display: flex;
  gap: 12px;

  .link-button{
    margin-top: 18px;
    background: #000;
  }

  .btn-add-one-more{
    margin-top: 18px;
  }
}

.link-item{
  display: flex;
  justify-content: center;
  color: white;
}

.valid input,
.valid select,
.valid textarea,
.valid select{
  border: 1px solid green;
}

.error input,
.error select,
.error textarea,
.error select{
  border: 1px solid red;
}

.input-chips-container{
  display: flex;
  gap: 4px;
  position: absolute;
  z-index: 9999;

  .input-chip{
    padding: 2px 4px;
    background: grey;
    border: 25px;
    cursor: pointer;
  }
}
</style>