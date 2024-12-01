<template>
  <div class="_container">
    <div v-if="!ifActivityWasAdded">
      <div class="form-container">
        <!-- Error alert -->
        <div v-if="exceptionMessage !== '' ">
          <v-alert
              :title="exceptionTitle"
              :text="exceptionMessage"
              type="error"
          ></v-alert>
        </div>
        <form>
          <h2 class="form-header">Create an activity</h2>
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
            <add-activity-date-picker-component
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
                label="Main photo to describe activity"
                @input="setMainActivityImage"
                :error-messages="activityMainPhotoFileErrorMessage"
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
                label="Additional photos (max 12, optional)"
                @input="setAdditionalActivityImage"
                :error-messages="activityAdditionalPhotoFilesErrorMessage"
                accept="image/*"
                variant="solo"
                chips
                multiple
                counter
                density="compact"
            ></v-file-input>
          </div>
          <!-- submitBTN -->
          <v-btn
              class="me-4 submit-button"
              :loading="isActivityCreating"
              @click="addActivity"
          >
            create an activity
          </v-btn>
        </form>
      </div>
    </div>
    <div v-else class="activity-added-container">
      <div class="activity-added-img">
        <img class="form-added-success-img" src="/images/success_icon.png" alt="success">
      </div>
      <h2>Success!</h2>
      <h5>Activity was added</h5>
      <v-btn
          class="link-button"
      >
        <NuxtLink to="/admin/myActivities" class="link-item">go to my activities</NuxtLink>
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import '@vuepic/vue-datepicker/dist/main.css';
import { getStorage, ref as storageRef, uploadBytes } from "firebase/storage";
import {useDateListStore} from "~/stores/datesList";
import {useFirebaseRequestStore} from '~/stores/api/useFirebaseRequestStore'
import {useFirebaseFilesDataStore} from '~/stores/firebaseFilesDataStore/useFirebaseFilesDataStore'
import type {IExtendedActivityData} from '~/types/IExtendedActivityData'

const storage = getStorage()
const authStore = useAuthStore()

// activity was added
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
const artCategoriesList = await getArtCategoriesList();
const artCategories = computed(() => {
  return artCategoriesList.map(item => item.name);
})

// activity cities
const citiesDataJSON = await getCitiesData()

// citiesDataArray to autocomplete
const citiesDataArray = computed(() =>{
  return citiesDataJSON.map(city => city.name + ', ' + city.admin_name)
});

// datePicker variables
const dateListStore = useDateListStore()
onMounted(() => {
  dateListStore.datesList.length = 0
})
const {datesList, datesListLength} = storeToRefs(dateListStore)
const dateListStartEndArray = reactive<{start: number, end: number}[]>([])
const isActivityCreating = ref(false);

// validation
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

async function onActivityCityChanged() {
  validateActivityCity(true)

  if(!activityCityErrorMessage.value) {
    await showCityOnMap()
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

const activityMainPhotoFile = ref();
const triggerActivityMainPhotoFileValidation = ref<boolean>(false)
const activityMainPhotoFileErrorMessage = ref<string>('')
function validateActivityMainPhotoFile(startValidation?: boolean) {
  if(startValidation) triggerActivityMainPhotoFileValidation.value = true

  if(triggerActivityMainPhotoFileValidation.value) {
    if (!activityMainPhotoFile.value) return activityMainPhotoFileErrorMessage.value = 'Select a photo'

    return activityMainPhotoFileErrorMessage.value = ''
  }
}

const activityAdditionalPhotoFiles = reactive([]);
const triggerActivityAdditionalPhotoFiles = ref<boolean>(false)
const activityAdditionalPhotoFilesErrorMessage = ref<string>('')
function validateActivityAdditionalPhotoFiles(startValidation?: boolean) {
  if(startValidation) triggerActivityAdditionalPhotoFiles.value = true

  if(triggerActivityAdditionalPhotoFiles.value) {
    if (activityAdditionalPhotoFiles.length > 12) return activityAdditionalPhotoFilesErrorMessage.value = 'Max number of photos is 12'

    return activityAdditionalPhotoFilesErrorMessage.value = ''
  }
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

const firebaseRequestStore = useFirebaseRequestStore()
const firebaseFilesDataStore = useFirebaseFilesDataStore()
async function addActivity() {
  if(!validateForm()) return
  if(!processDateList()) return
  isActivityCreating.value = true

  try{
    const activityCityData = await getActivityCityData()
    const mainPhotoRef: string[] = await firebaseFilesDataStore.postFiles(
      'activityPhoto',
      activityName.value,
      activityMainPhotoFile.value
    )
    const additionalPhotoRefs: string[] = await firebaseFilesDataStore.postFiles(
      'additionalPhoto',
      activityName.value,
      activityAdditionalPhotoFiles
    )
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
      houseNumber: activityHouseNumber.value ? activityHouseNumber.value : null,
      description: activityDescription.value.trim(),
      mainPhotoRef: mainPhotoRef[0],
      additionalPhotosRefs: additionalPhotoRefs,
    }

    await firebaseRequestStore.post('activities', activityData)
    ifActivityWasAdded.value = true
  } catch (error) {
    console.log(error)
  } finally {
    isActivityCreating.value = false
  }
}

function processDateList(): boolean {
  dateListStartEndArray.length = 0;

  if (datesListLength.value){
    for(let i = 0; i < datesListLength.value; i++){
      const startDate = datesList[i].dateStart;
      const endDate = datesList[i].dateEnd;

      const timeStart = datesList[i].timeStart;
      const timeEnd = datesList[i].timeEnd;

      if (timeStart && timeEnd) {
        const startDateTime = startDate.setHours(timeStart.hours, timeStart.minutes, timeStart.seconds);
        const endDateTime = endDate.setHours(timeEnd.hours, timeEnd.minutes, timeEnd.seconds);

        dateListStartEndArray.push({
          start: startDateTime,
          end: endDateTime,
        });
      }else{
        const unChosenTime = new Date(datesList[i].dateStart);

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

// todo: add to storage
async function getCitiesData(){
  // отримую дані від сервера
  const { data } = await useFetch('/api/citiesList');
  // повертаю - тільки потрібний масив данних: citiesListData
  return data.value.sortedCitiesListData;
}

// todo: add to storage
async function getArtCategoriesList(){
  // отримую дані від сервера
  const { data } = await useFetch('/api/artCategoriesList');
  // повертаю - тільки потрібний масив данних:
  return data.value.artCategoriesList;
}

// todo: add to storage
function getActivityCityData() {
  const cityData = activityCity.value;
  const parts = cityData.split(", ");

  const cityName = parts[0];
  const cityAdminName = parts[1];

  return  citiesDataJSON.find(city => {
    return city.name === cityName && city.admin_name === cityAdminName
  });
}

// todo: add to storage
function setMainActivityImage(event) {
  if(event.target.files.length) {
    activityMainPhotoFile.value = event.target.files[0]
  }
}

function setAdditionalActivityImage(event) {
  if(event.target.files.length && event.target.files.length <= 12) {
    for(let i = 0; i < event.target.files.length; i++) {
      activityAdditionalPhotoFiles.push(event.target.files[i])
    }
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
    console.log('cityData fetching')
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
      console.log('fetching CityAndStreet data')
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
async function updateDataAfterMarkerDragged(lat, lon){
  try {
    const response  = await fetch(`https://geocode.maps.co/reverse?lat=${lat}&lon=${lon}&api_key=659450539ff1f762862410sea796255`);
    const data = await response.json();
    activityStreet.value = data.address.road;
    activityHouseNumber.value = data.address.house_number ? data.address.house_number : "";
  } catch (error) {
    console.log('Error during dragging the marker:', error);
  }
}

// todo: add to storage
const updateMarkerLatLng = async (event) => {
  const updatedMarkerCoordinates = event.target.getLatLng();
  markerLat.value = updatedMarkerCoordinates.lat;
  markerLng.value = updatedMarkerCoordinates.lng;
  await updateDataAfterMarkerDragged(updatedMarkerCoordinates.lat, updatedMarkerCoordinates.lng);
}

// todo: make handle form reset
</script>

<style scoped>
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

.link-button{
  margin-top: 25px;
  background: #000;
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
</style>