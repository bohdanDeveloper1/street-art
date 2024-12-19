<script setup lang="ts">
import { getStorage, ref as storageRef, getDownloadURL} from "firebase/storage"
import type {IActivityData} from '~/types/IActivityData'
import {useFirebaseApiStore} from '~/stores/api/useFirebaseApiStore'
import { useAuthStore } from '~/stores/authStore/useAuthStore'
import { useAddCommentStore } from "~/stores/addComment"

interface IDateList{
  start: string,
  end: string,
}

interface IIfShowArtistActivities extends IActivityData {
  showArtistActivities?: boolean
}
interface Emits {
  (e: 'deleteActivity', activityId: string): void
}

const storage = getStorage()
const props = defineProps<IIfShowArtistActivities>()
const emit = defineEmits<Emits>()
const router = useRouter()

const isImgFetching = ref<boolean>(false)
const activityMainPhoto = ref();
const isAdditionalInfoHovered = ref<boolean>(false);
// дати початку та кінця активності, які > Date.now()
const filteredDatesStartEnd = computed(() => {
  const datesStartEnd = reactive<IDateList[]>([]);

  for(let i = 0; i < props.activityDates.length; i++) {
    if(props.activityDates[i].end > Date.now()){
      const dateStart = new Date(props.activityDates[i].start);
      const dateEnd = new Date(props.activityDates[i].end);

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
});

const authStore = useAuthStore()
const firebaseApiStore = useFirebaseApiStore()
const addCommentStore = useAddCommentStore()

const {savedActivityIds} = storeToRefs(authStore)
const isFavorite = computed(() => {
  if(savedActivityIds.value.includes(props.id as string)) return true
  return false
})

async function saveActivity() {
  if(authStore.userInfo.uid) {
    await firebaseApiStore.updateDocumentArrayField('users', authStore.userInfo.uid, 'savedActivities', props.id as string)
    savedActivityIds.value.push(props.id as string)
  } else{
    addCommentStore.showFirebaseAuthComponent = true
  }
}

async function removeFromSaved() {
  await firebaseApiStore.updateDocumentArrayField('users', authStore.userInfo.uid, 'savedActivities', props.id as string, true)
  savedActivityIds.value.splice(savedActivityIds.value.indexOf(props.id as string), 1)
}

async function showActivityDetails() {
  await router.push(`/activityDetails/${props.id}`)
}

onMounted(async () => {
  isImgFetching.value = true
  activityMainPhoto.value = await getDownloadURL(storageRef(storage, props.mainPhotoRef))
  isImgFetching.value = false
})

const showDeleteActivityAlert = ref<boolean>(false)
const isActivityDeleting = ref<boolean>(false)

function deleteActivity() {
  showDeleteActivityAlert.value = false
  isActivityDeleting.value = true
  emit('deleteActivity', props.id || '')
  isActivityDeleting.value = false
}

async function updateActivity() {
  await router.push({
    path: `/artist/addActivity/${props.id}`,
  })
}
</script>

<template>
  <v-alert
    :title="`Are you sure, you want to delete ${props.name}?`"
    type="error"
    class="alert"
    v-if="showDeleteActivityAlert"
  >
    <div class="alert-btn-container">
      <v-btn
        class="alert-btn"
        @click="showDeleteActivityAlert = false"
      >
        no
      </v-btn>
      <v-btn
        class="alert-btn"
        @click="deleteActivity"
      >
        yes
      </v-btn>
    </div>
  </v-alert>
  <div v-if="isImgFetching">
    <v-skeleton-loader
        class="mx-auto border"
        width="250"
        height="400"
        type="image, article"
    />
  </div>
  <div class="card" v-else>
    <img :src="activityMainPhoto" class="card-img" alt="activity photo">
    <div class="card-body activity">
      <div class="activity-category roboto-regular">{{props.category}}</div>
      <h4 class="activity-title">{{props.name}}</h4>
      <div class="activity-time">
        <div class="activity-date">{{filteredDatesStartEnd[0].start}}</div>
        <div class="info-svg-container"
           @mouseover="isAdditionalInfoHovered = true"
           @mouseout="isAdditionalInfoHovered = false"
           @click="isAdditionalInfoHovered = !isAdditionalInfoHovered"
           v-if="filteredDatesStartEnd.length > 1"
        >
          <svg
               xmlns="http://www.w3.org/2000/svg"
               width="1.4em"
               height="1.4em"
               viewBox="0 0 24 24"
          >
            <path fill="black" d="M11 17h2v-6h-2zm1-8q.425 0 .713-.288T13 8t-.288-.712T12 7t-.712.288T11 8t.288.713T12 9m0 13q-2.075 0-3.9-.788t-3.175-2.137T2.788 15.9T2 12t.788-3.9t2.137-3.175T8.1 2.788T12 2t3.9.788t3.175 2.137T21.213 8.1T22 12t-.788 3.9t-2.137 3.175t-3.175 2.138T12 22m0-2q3.35 0 5.675-2.325T20 12t-2.325-5.675T12 4T6.325 6.325T4 12t2.325 5.675T12 20m0-8"></path>
          </svg>
          <div
             :class="[
               'additional-info-dates-container',
               {'content-visible': isAdditionalInfoHovered},
               {'container-scrollable': filteredDatesStartEnd.length > 6}
             ]"
          >
            <div class="start-end-dates-info">Also at:</div>
            <div v-for="item in filteredDatesStartEnd">
              <div v-if="item != filteredDatesStartEnd[0]">
                <div>
                  <span>{{item.start}}</span>
                  <span style="margin-left: 8px;">-</span>
                  <span style="margin-left: 8px;">{{item.end}}</span>
                </div>
                <hr style="margin-top: 8px">
              </div>
            </div>
          </div>
        </div>
      </div>
      <p class="activity-address roboto-regular">{{props.cityName}}, {{props.streetName}} {{props.houseNumber}}</p>
      <div class="activity-buttons" v-if="showArtistActivities">
        <v-btn
          color="red-darken-1"
          :loading="isActivityDeleting"
          @click="showDeleteActivityAlert = true"
        >
          delete
        </v-btn>
        <v-btn
          color="black"
          @click="updateActivity"
        >
          update
        </v-btn>
      </div>
      <div class="activity-buttons" v-else>
        <div v-if="isFavorite">
          <button title="remove from Favorites" @click="removeFromSaved">
            <img src="/images/addedToFavorite.svg" alt="addToFavorite">
          </button>
        </div>
        <div v-else>
          <button title="add to Favorites" @click="saveActivity">
            <img src="/images/addToFavorite.svg" alt="addToFavorite">
          </button>
        </div>
        <v-btn
            class="see-details_btn"
            @click="showActivityDetails"
        >
          see details
        </v-btn>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.alert{
  position: fixed;
  top: 94px;
  z-index: 9999;

  .alert-btn-container{
    margin-top: 8px;
    display: flex;
    justify-content: start;
    gap: 16px;
  }
}

.card{
  width: 250px;
  border-radius: 12px;
  border: 2px solid darkgrey;
  padding-bottom: 2px;
}

.card-img{
  width: 100%;
  height: 180px;
  border-radius: 10px 10px 0 0;
  margin-bottom: -4px;
}

.see-details_btn{
  background: #000;
  color: white;
}

.activity-category{
  display: inline-block;
  padding: 4px 5px;
  border: 1px solid darkgrey;
  border-radius: 5px;
  background-color: darkgrey;
  margin-top: 0;
  margin-bottom: 4px;
}

.info-svg-container{
  position: relative;
}

.info-svg-container > svg{
  margin-top: -4px;
  margin-left: 8px;
  cursor: pointer;
}

.activity-time{
  display: flex;
  justify-content: space-between;
  margin-top: 35px;
  margin-bottom: 8px;
}

.additional-info-dates-container{
  visibility: hidden;
  position: absolute;
  padding: 16px 12px 8px 12px;
  top: 18px;
  left: -200px;
  width: 400px;
  background-color: white;
  border-radius: 10px;
  z-index: 100;

  -webkit-box-shadow: 1px 5px 16px 0px rgba(66, 68, 90, 1);
  -moz-box-shadow: 1px 5px 16px 0px rgba(66, 68, 90, 1);
  box-shadow: 1px 5px 16px 0px rgba(66, 68, 90, 1);
}

.content-visible{
  visibility: visible;
}

.container-scrollable {
  cursor: pointer;
  max-height: 280px;
  overflow: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    width: 0;
    height: 0;
  }

  &:hover {
    scrollbar-width: auto;

    &::-webkit-scrollbar {
      width: 8px;
    }

    &::-webkit-scrollbar-thumb {
      background-color: rgba(0, 0, 0, 0.5);
      border-radius: 10px;
    }

    &::-webkit-scrollbar-track{
      background: lightgrey;
      border-radius: 10px;
    }
  }
}

.start-end-dates-info{
  margin-bottom: 16px;
  font-weight: bold;
}

.activity-address{
  color: darkgrey;
  margin-bottom: 18px;
}

.activity-buttons{
  display: flex;
  justify-content: space-between;
}
</style>