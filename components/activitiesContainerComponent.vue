<script setup lang="ts">
import type {IActivityData} from '~/types/IActivityData'
import ActivityComponent from '~/components/ActivityComponent.vue'
import PageLoaderComponent from '~/components/pageLoaderComponent.vue'
import {useActivityApiStore} from '~/stores/api/useActivityApiStore'
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
const activityApiStore = useActivityApiStore()
const isActivitiesFetching = ref<boolean>(false)

const authStore = useAuthStore()
async function makeWhereConditions() {
  const whereConditions: [string, FirebaseFirestore.WhereFilterOp, unknown][] = []
  //let orderBy: string

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
    // todo: add: orderBy('activityEnd')
  }

  return whereConditions
}

async function getActivities(whereConditions?: [string, FirebaseFirestore.WhereFilterOp, unknown][]): Promise<void> {
  let activities: IExtendedActivityData[] = await activityApiStore.get("activities", whereConditions)

  if(activities.length) {
    if(props.cityName && props.activityId) {
      activities = activities.filter(activity => activity.id !== props.activityId)
    }

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

onMounted(async () => {
  isActivitiesFetching.value = true
  const whereConditions = await makeWhereConditions()
  await getActivities(whereConditions)
  isActivitiesFetching.value = false
})
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
        <NuxtLink to="/admin/addActivity">
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
  //padding: 24px 0;
  //display: grid;
  //justify-content: center;
  //grid-template-columns: repeat(4, 250px);
  //grid-column-gap: 36px;
  //grid-row-gap: 40px;

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