<script setup lang="ts">
import type {IActivityData} from '~/types/IActivityData'
import ActivityComponent from '~/components/ActivityComponent.vue'
import PageLoaderComponent from '~/components/pageLoaderComponent.vue'
import {useFirebaseApiStore} from '~/stores/api/useFirebaseApiStore'
import ActivityCardsCarousel from '~/components/ui/ActivityCardsCarousel.vue'
import type {IExtendedActivityData} from '~/types/IExtendedActivityData'
import {useAuthStore} from '~/stores/authStore/useAuthStore'
import {LocalStorageVariables} from '~/types/LocalStorageVariablesType'
import {useRouter} from '#vue-router'

interface Props {
  cityName?: string
  activityId?: string
  showArtistActivities?: boolean
  showCardsInCarousel?: boolean
}

const router = useRouter()
const props = withDefaults(defineProps<Props>(), {
  cityName: '',
  activityId: '',
  showArtistActivities: false,
  showCardsInCarousel: false,
})
const activitiesData = reactive<IActivityData[]>([])
const firebaseApiStore = useFirebaseApiStore()
const isActivitiesFetching = ref<boolean>(false)

const authStore = useAuthStore()
async function makeWhereConditions(): Promise<[string, FirebaseFirestore.WhereFilterOp, unknown][]>  {
  const whereConditions: [string, FirebaseFirestore.WhereFilterOp, unknown][] = []

  // get all activities where: activityEnd > new Date().getTime()
  if(!props.showArtistActivities) {
    whereConditions.push(["activityEnd", '>', new Date().getTime()])
  }
  // get activities for selected city
  if(props.cityName && props.activityId) {
    whereConditions.push(["cityName", '==', props.cityName])
  }
  // get only artist activities
  if(props.showArtistActivities) {
    const userUid = localStorage.getItem(LocalStorageVariables.UserUid)
    if(!userUid) {
      await router.push('/userComponent')
    }
    whereConditions.push(["artistUid", '==', userUid])
  }

  return whereConditions
}

async function getActivities(whereConditions?: [string, FirebaseFirestore.WhereFilterOp, unknown][]): Promise<void> {
  let activities: IExtendedActivityData[] = await firebaseApiStore.get<IExtendedActivityData>("activities", whereConditions)

  if(activities.length) {
    if(props.cityName && props.activityId) {
      activities = activities.filter(activity => activity.id !== props.activityId)
    }

    activitiesData.length = 0
    activities.forEach((activity: IActivityData) => {
      activitiesData.push({
        id: activity.id,
        mainPhotoRef: activity.mainPhotoRef,
        name: activity.name,
        cityAdmin: activity.cityAdmin,
        cityName: activity.cityName,
        streetName: activity.streetName,
        houseNumber:  activity.houseNumber,
        category: activity.category,
        activityDates: activity.activityDates,
      })
    })
  }
}

async function fetchActivities() {
  isActivitiesFetching.value = true
  const whereConditions = await makeWhereConditions()
  await getActivities(whereConditions)
  isActivitiesFetching.value = false
}

onMounted(async () => {
  await fetchActivities()
})

async function deleteActivity(activityId: string): Promise<void> {
  await firebaseApiStore.deleteDocument('activities', activityId)
  await fetchActivities()
}
</script>

<template>
  <div class="_container">
    <h2 class="other-activities-title" v-if="cityName && activitiesData.length">Other activities in {{props.cityName}}</h2>
    <div v-if="activitiesData.length && !isActivitiesFetching">
      <ActivityCardsCarousel
        :activitiesData="activitiesData"
        v-if="showCardsInCarousel"
      />
      <div
        class="cards-container"
        v-else
      >
        <ActivityComponent
            v-for="activity in activitiesData"
            :key="activity.id"
            :id="activity.id"
            :mainPhotoRef="activity.mainPhotoRef"
            :name="activity.name"
            :cityAdmin="activity.cityAdmin"
            :cityName="activity.cityName"
            :streetName="activity.streetName"
            :houseNumber="activity.houseNumber"
            :category="activity.category"
            :activityDates="activity.activityDates"
            :showArtistActivities="showArtistActivities"
            @deleteActivity="deleteActivity"
        />
      </div>
    </div>
    <div v-if="isActivitiesFetching">
      <PageLoaderComponent/>
    </div>
    <div v-if="!activitiesData.length && !isActivitiesFetching && showArtistActivities && authStore.isLoggedIn">
      <div class="no-activities-container">
        <div class="no-activities-info">
          <h3>You have not activities yet.</h3>
        </div>
        <NuxtLink to="/artist/addActivity/">
          <v-btn>
            Add your first activity
          </v-btn>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.other-activities-title{
  margin-bottom: 12px;
  display: flex;
  justify-content: center;
}

.cards-container{
  padding: 24px 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 36px;
}

.no-activities-container{
  margin: 60px auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 40px;
  align-items: center;
  width: 450px;
  height: 350px;
  border-radius: 15px;

  /* shadow */
  -webkit-box-shadow: 8px 8px 42px -20px rgba(66, 68, 90, 1);
  -moz-box-shadow: 8px 8px 42px -20px rgba(66, 68, 90, 1);
  box-shadow: 8px 8px 42px -20px rgba(66, 68, 90, 1);
}
</style>