<script setup lang="ts">
import type {IActivityData} from '~/types/IActivityData'
import ActivityComponent from '~/components/ActivityComponent.vue'
import PageLoaderComponent from '~/components/pageLoaderComponent.vue'
import {useFirebaseRequestStore} from '~/stores/api/useFirebaseRequestStore'
import ActivityCardsCarousel from '~/components/ui/ActivityCardsCarousel.vue'

interface Props {
  cityName?: string
  activityId?: string
  showArtistActivities?: boolean
  artistUid?: string
  showCardsInCarousel?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  cityName: '',
  activityId: '',
  showArtistActivities: false,
  artistUid: '',
  showCardsInCarousel: false,
})
const activitiesData = reactive<IActivityData[]>([])
const requestStore = useFirebaseRequestStore()
const isActivitiesFetching = ref<boolean>(false)

function makeWhereConditions() {
  const whereConditions: [string, FirebaseFirestore.WhereFilterOp, unknown][] = []
  whereConditions.push(["activityEnd", '>', new Date().getTime()])
  // todo: add if() {whereConditions.push} if additional props related with activities filtration

  if(props.cityName && props.activityId) {
    whereConditions.push(["cityName", '==', props.cityName])
  }

  // get only artist activities
  if(props.showArtistActivities && props.artistUid) {
    whereConditions.push(["artistUid", '==', props.artistUid])
  }

  return whereConditions
}

async function getActivities(whereConditions?: [string, FirebaseFirestore.WhereFilterOp, unknown][]): Promise<void> {
  let activities: object[] | unknown

  if(whereConditions) {
    activities = await requestStore.get("activities", whereConditions)
  } else {
    activities = await requestStore.get("activities")
  }

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

onBeforeMount(async () => {
  isActivitiesFetching.value = true
  const whereConditions = makeWhereConditions()
  await getActivities(whereConditions)

  isActivitiesFetching.value = false
})
</script>

<template>
  <div class="_container">
    <h2 class="other-activities-title" v-if="cityName && activitiesData.length > 0">Other activities in {{props.cityName}}</h2>
    <div v-if="activitiesData.length > 0 && !isActivitiesFetching">
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
    <div v-else-if="isActivitiesFetching">
      <PageLoaderComponent/>
    </div>
    <div v-else-if="activitiesData.length === 0 && !isActivitiesFetching && showArtistActivities">
      <div class="no-activities-container">
        <div class="no-activities-info">
          <h3>You have not activities yet.</h3>
        </div>
        <v-btn>
          Add your first activity
        </v-btn>
      </div>
    </div>
  </div>
</template>

<style scoped>
.other-activities-title{
  margin-bottom: 12px;
  display: flex;
  justify-content: center;
}

.cards-container{
  padding: 24px 0;
  display: grid;
  justify-content: center;
  grid-template-columns: repeat(4, 250px);
  grid-column-gap: 36px;
  grid-row-gap: 40px;
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