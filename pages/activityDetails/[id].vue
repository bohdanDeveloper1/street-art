<script setup lang="ts">
import { doc, getDoc } from "firebase/firestore";
import { collection, query, where, getDocs } from "firebase/firestore";
import { getStorage, ref as storageRef, getDownloadURL  } from "firebase/storage";
import { getAuth } from "firebase/auth";
import FirebaseAuthComponent from "~/components/auth/FirebaseAuthComponent.vue";
import { useAddCommentStore } from "~/stores/addComment";
import { storeToRefs } from 'pinia'
import CommentRating from "~/components/activityDetails/CommentRating.vue";
import {ref, reactive, watch} from 'vue'
import InfoCardComponent from '~/components/activityDetails/InfoCardComponent.vue'
import type {IActivityComment} from '~/types/IActivityComment'
import type {IArtistData} from '~/types/IArtistData'
import type {IExtendedActivityData} from '~/types/IExtendedActivityData'

interface IDateList{
  start: string
  end: string
}

const {$firestore}: any = useNuxtApp()
const storage = getStorage();
const route = useRoute();
const addCommentStore = useAddCommentStore();
const {showAddCommentComponent} = storeToRefs(addCommentStore);
const userUid = ref<string>('');

const activityData = reactive<IExtendedActivityData>({
    id: '',
    additionalPhotosRefs: null,
    artistUid: '',
    category: '',
    cityAdmin: '',
    cityName: '',
    coordinatesLat: 0,
    coordinatesLng: 0,
    activityDates: [],
    description: '',
    houseNumber: '',
    mainPhotoRef: '',
    name: '',
    streetName: '',
    activityEnd: 0,
})
const artistData = reactive<IArtistData>({
  name: '',
});
const activityPhotos = reactive<string[]>([]);
const activityComments = reactive<IActivityComment[]>([]);
const dateNow = new Date();

// rating variables
const showRatingLoader = ref(false);
const showActivityComments = ref(false);
const oneStarRating = ref(0);
const twoStarRating = ref(0);
const threeStarRating = ref(0);
const fourStarRating = ref(0);
const fiveStarRating = ref(0);
const ratingSum = ref(0);
const averageRating = ref(0);

// filteredDatesStartEnd дати початку та кінця активності, які > new Date().
const filteredDatesStartEnd = computed(() => {
  const datesStartEnd: IDateList[] = []

  for(let i = 0; i < activityData.activityDates.length; i++){
    if(activityData.activityDates[i].end > dateNow.getTime()){
      const dateStart = new Date(activityData.activityDates[i].start);
      const dateEnd = new Date(activityData.activityDates[i].end);

      let minutes: string = '';
      if(dateStart.getMinutes() < 10){
        minutes = `0${dateStart.getMinutes()}`
      }else{
        minutes = dateStart.getMinutes().toString()
      }
      const timeStart = dateStart.toDateString() + ', ' + dateStart.getHours() + ':' + minutes;

      if(dateEnd.getMinutes() < 10){
        minutes = `0${dateEnd.getMinutes()}`
      }else{
        minutes = dateEnd.getMinutes().toString()
      }
      const timeEnd = dateEnd.toDateString() + ', ' + dateEnd.getHours() + ':' + minutes;

      datesStartEnd.push({start: timeStart, end: timeEnd});
    }
  }

  return datesStartEnd;
})

const isActivityDataFetching = ref<boolean | null>(null)

async function getActivityData() {
  const docRef = doc($firestore, "activities", `${route.params.id}`)
  const docSnap = await getDoc(docRef)

  if (docSnap.exists()) {
    activityData.id = docSnap.id;
    activityData.additionalPhotosRefs = docSnap.data().additionalPhotosRefs
    activityData.artistUid = docSnap.data().artistUid
    activityData.category = docSnap.data().category
    activityData.cityAdmin = docSnap.data().cityAdmin
    activityData.cityName = docSnap.data().cityName
    activityData.coordinatesLat = docSnap.data().coordinatesLat
    activityData.coordinatesLng = docSnap.data().coordinatesLng
    activityData.activityDates = docSnap.data().activityDates
    activityData.description = docSnap.data().description
    activityData.houseNumber = docSnap.data().houseNumber
    activityData.mainPhotoRef = docSnap.data().mainPhotoRef
    activityData.name = docSnap.data().name
    activityData.streetName = docSnap.data().streetName
    activityData.activityEnd = docSnap.data().activityEnd

    await getArtistData()
  } else {
    console.log("No such document!")
  }
}

async function getArtistData() {
  const docRef = doc($firestore, "users", `${activityData.artistUid}`);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    artistData.name = docSnap.data()?.name
  } else {
    console.log("No such document!");
  }
}

async function getActivityPhotos() {
  // get main photo
  if(activityData.mainPhotoRef){
    let mainPhoto: string = await getDownloadURL(storageRef(storage, activityData.mainPhotoRef));
    activityPhotos.push(mainPhoto);
  }

  // get additional photo
  if(activityData.additionalPhotosRefs && activityData.additionalPhotosRefs?.length){
    for(let i = 0; i < activityData.additionalPhotosRefs?.length; i++){
      let additionalPhoto: string = await getDownloadURL(storageRef(storage,  activityData.additionalPhotosRefs[i]));
      activityPhotos.push(additionalPhoto);
    }
  }
}

async function getActivityComments() {
  showRatingLoader.value = true;

  // оновлення значень для рейтингу
  activityComments.length = 0;
  oneStarRating.value = 0;
  twoStarRating.value = 0;
  threeStarRating.value = 0;
  fourStarRating.value = 0;
  fiveStarRating.value = 0;
  ratingSum.value = 0;
  averageRating.value = 0;

  const q = query(collection($firestore, "comments"), where("activityUid", "==", `${activityData.id}`));
  const querySnapshot = await getDocs(q);

  querySnapshot.forEach((doc) => {
    const activityComment: IActivityComment = {
      authorName: doc.data().authorName,
      ratingInStars: doc.data().ratingInStars,
      message: doc.data().message,
      date: doc.data().date
    }

    if(activityComment.ratingInStars === 1) oneStarRating.value++;
    if(activityComment.ratingInStars === 2) twoStarRating.value++;
    if(activityComment.ratingInStars === 3) threeStarRating.value++;
    if(activityComment.ratingInStars === 4) fourStarRating.value++;
    if(activityComment.ratingInStars === 5) fiveStarRating.value++;
    ratingSum.value += activityComment.ratingInStars;

    activityComments.push(activityComment)
  });

  averageRating.value = parseFloat((ratingSum.value / activityComments.length).toFixed(1));
  showRatingLoader.value = false;
}

async function addActivityComment(){
  const auth = getAuth();
  const user = auth.currentUser;

  if (user !== null && user.emailVerified) {
    addCommentStore.showAddCommentComponent = true;
    userUid.value = user.uid;
  }else{
    addCommentStore.logInDuringAddingComment = true;
    addCommentStore.showFirebaseAuthComponent = true;
  }
}

async function fetchActivityDetailsData() {
  isActivityDataFetching.value = true
  await getActivityData()
  await getActivityPhotos()
  await getActivityComments()
  isActivityDataFetching.value = false
}

onBeforeMount(async () => {
  await fetchActivityDetailsData()
})

const chevronColor = ref<string>('dimgray')

const isNewCommentAdded = ref<boolean>(false)
</script>

<template>
  <div>
    <div class="content" v-if="!isActivityDataFetching">
      <div class="activity-title">
        <h2 class="activity-title-header">{{activityData.name}}</h2>
        <div class="activity-title-category roboto-regular">
          {{activityData.category}}
        </div>
      </div>
      <div class="sections-container">
        <div class="left-section">
          <div class="carousel-container">
            <v-carousel
                class="carousel"
                show-arrows="hover"
            >
              <v-carousel-item
                  v-for="photo in activityPhotos" :key="photo"
                  :src="photo"
                  :alt="photo"
                  cover
              ></v-carousel-item>
            </v-carousel>
          </div>
          <InfoCardComponent
              :activityData="activityData"
              :filteredDatesStartEnd="filteredDatesStartEnd"
              class="info-card-small-screen"
          />
          <div class="activity-description">
            <h4>
              Activity description:
            </h4>
            <div class="roboto-regular">
              {{activityData.description}}
            </div>
          </div>
          <div class="expansion-panels-container">
            <v-expansion-panels>
              <v-expansion-panel
                  title="About artist"
                  text="Artist haven`t provide information about himself yet."
              >
              </v-expansion-panel>
            </v-expansion-panels>
          </div>
          <div class="map-container">
            <LMap class="map" :zoom="16" :center="[activityData.coordinatesLat, activityData.coordinatesLng]">
              <LTileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&amp;copy; <a href=&quot;https://www.openstreetmap.org/&quot;>OpenStreetMap</a> contributors"
                  layer-type="base"
                  name="OpenStreetMap"
              />
              <LMarker :lat-lng="[activityData.coordinatesLat, activityData.coordinatesLng]" />
            </LMap>
          </div>
        </div>
        <div class="right-section">
          <InfoCardComponent
            :activityData="activityData"
            :filteredDatesStartEnd="filteredDatesStartEnd"
            class="info-card-large-screen"
          />
        </div>
      </div>
      <div class="activities-container-component-container">
        <ActivitiesContainerComponent
          :cityName="activityData.cityName"
          :activity-id="activityData.id"
          :showCardsInCarousel="true"
        />
      </div>
      <div class="comments-container">
        <!--  Loader   -->
        <div v-if="showRatingLoader === true" class="show-rating-loader">
          <loader-component width="40px" height="40px"></loader-component>
        </div>
        <!--  Statistics  -->
        <div v-if="showRatingLoader === false">
          <h4 v-if="activityComments.length">Activity comments:</h4>
          <h4 v-else>No comments yet</h4>
          <div v-if="isNewCommentAdded" class="alert-success">
            <v-alert
                color="success"
                icon="$success"
                :closable="true"
                title="Comment was added"
                text="Thank`s for your opinion"
            ></v-alert>
          </div>
          <comment-rating
              :oneStarRating="oneStarRating"
              :twoStarRating="twoStarRating"
              :threeStarRating="threeStarRating"
              :fourStarRating="fourStarRating"
              :fiveStarRating="fiveStarRating"
              :numberOfComments="activityComments.length"
              :averageRating="averageRating"
          >
            <template v-slot:button>
              <button v-if="showAddCommentComponent === false" class="add-comment-btn" @click="addActivityComment">
                Add comment
              </button>
            </template>
          </comment-rating>
        </div>
        <!--  Add comment container      -->
        <div v-if="showAddCommentComponent === true" class="add-comment-container">
          <activity-details-add-comment
              :user-uid="userUid"
              :activity-uid="activityData.id"
              :artist-uid="activityData.artistUid"
              @getComments="getActivityComments"
              @commentWasAdded="isNewCommentAdded = true"
          ></activity-details-add-comment>
        </div>
        <!--  Show see comments btn  -->
        <div
          class="see-comments-btn-wrapper"
          v-if="activityComments.length > 0 && showRatingLoader === false"
        >
          <hr style="width:100%;color:grey">
          <button
            class="see-comments-btn"
            @mouseover="chevronColor = 'black'"
            @mouseout="chevronColor = 'dimgray'"
            @click="showActivityComments = !showActivityComments"
          >
            See comments
            <ui-svg-component
                svgName="M7.41 8.58L12 13.17l4.59-4.59L18 10l-6 6l-6-6z"
                class="chevron-down-svg"
                :pathFill="chevronColor"
                :class="{'chevron-up': showActivityComments}"
            />
          </button>
        </div>
        <!--   Comments  components   -->
        <div v-if="showActivityComments"  v-for="(item, index) in activityComments" :key="index">
          <activity-details-comment
              :author-name="item.authorName"
              :rating-in-stars="item.ratingInStars"
              :message="item.message"
          ></activity-details-comment>
        </div>
      </div>
    </div>
    <div v-else>
      <PageLoaderComponent/>
    </div>
  </div>
</template>

<style scoped lang="scss">
.comments-container{
  background-color: white;
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 60px;
}

.content{
  max-width: 1080px;
  margin: 26px auto 0;
}

/* activity title  -------------------------------------------------------*/
.activity-title-header{
  margin-bottom: 0;
}

.activity-title-category{
  display: inline-block;
  padding: 4px 5px;
  border: 1px solid darkgrey;
  border-radius: 5px;
  background-color: darkgrey;
  margin-top: 0;
  margin-bottom: 14px;
}

/* sections styles  -------------------------------------------------------*/
.sections-container{
  display: flex;
  justify-content: space-between;
  margin-bottom: 32px;
}

/* carousel styles ------------------------------------------------ */
.carousel-container{
  width: 700px;
  height: 500px;
}

.carousel{
  width: 100% !important;
  height: 100% !important;
  border-radius: 25px;
}

/* activity description  -------------------------------------------------------*/
.activity-description{
  width: 700px;
  padding: 15px 5px 15px 5px;
  margin-bottom: 8px;
}

/* expansion panels container  -------------------------------------------------------*/
.expansion-panels-container{
  width: 700px;
  margin-bottom: 16px;
}

.map-container{
  width: 700px;
  height: 350px;
}

.map{
  height: 100%;
  width: 100%;
}

.activities-container-component-container {
  max-width: 1080px;
  margin-bottom: 30px;
}

/* loader ----------------------------------------------------------------------------*/
.show-rating-loader{
  display: flex;
  justify-content: center;
  padding: 80px 0;
}

/* comments  ---------------------------------------------------------------------------*/
.add-comment-btn{
  width: 100%;
  margin-top: 4px;
  padding: 12px 0;
  border-radius: 5px;
  border: 1px solid lightgrey;

  &:hover{
    font-weight: 500;
  }
}

.see-comments-btn-wrapper{
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-bottom: 4px;
}

.see-comments-btn{
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  &:hover{
    font-weight: 500;
  }
}

.chevron-down-svg {
  margin: 0 auto;
  transition: transform 0.2s cubic-bezier(0, 0.6, 0.3, 1.5);
}

.chevron-up{
  transform: rotate(180deg);
}

/* RWD ----------------------------------------------------------------------------*/
@media (min-width: 1120px) {
  .info-card-small-screen{
    display: none;
  }
}

@media (max-width: 1120px) {
  .content{
    max-width: calc(100vw - 30px);
  }

  .info-card-large-screen{
    display: none;
  }

  .add-to-favourite-btn{
    height: 60px;
  }
}

@media (max-width: 760px) {
  .content{
    max-width: 530px;
  }

  .carousel-container{
    width: 500px;
    height: 450px;
    margin-bottom: 50px;
  }

  .activity-description{
    width: 500px;
  }

  .expansion-panels-container{
    width: 500px;
  }

  .map-container{
    width: 500px;
    height: 400px;
    margin-bottom: 32px;
  }
}

@media (max-width: 560px) {
  ._container{
    padding: 0 5px 0 5px;
  }

  .content{
    max-width: 320px;
    padding: 0 0 0 0;
  }

  .carousel-container{
    width: 310px;
    height: 460px;
  }

  .activity-description{
    width: 310px;
  }

  .expansion-panels-container{
    width: 310px;
  }

  .map-container{
    width: 310px;
    height: 400px;
    margin-bottom: 32px;
  }
}
</style>