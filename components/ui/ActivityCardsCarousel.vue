<script setup lang="ts">
import type {IActivityData} from '~/types/IActivityData'
import ActivityComponent from '~/components/ActivityComponent.vue'
import SvgComponent from '~/components/ui/SvgComponent.vue'

interface Props {
  activitiesData: IActivityData[]
}

const props = defineProps<Props>()
const carouselTranslateX = ref<number>(0)
const carouselContainer = ref()
const carouselContainerWidth = ref<number>(0)
const carouselTrack = ref()
const carouselTrackWidth = ref<number>(0)

const nextSlide = () => {
  if(carouselTranslateX.value + carouselContainerWidth.value > carouselTrackWidth.value) return

  carouselTranslateX.value = carouselTranslateX.value + carouselContainerWidth.value
}

const previousSlide = () => {
  carouselTranslateX.value = carouselTranslateX.value - carouselContainerWidth.value
}

const isLastSlide = computed(() => {
  return (carouselTranslateX.value + carouselContainerWidth.value) > carouselTrackWidth.value
})

onMounted(() => {
  if(import.meta.client) {
    carouselContainer.value = document.getElementById('carousel-container')
    if(carouselContainer.value) carouselContainerWidth.value = carouselContainer.value.clientWidth

    carouselTrack.value = document.getElementById('carousel-track')
    if(carouselTrack.value) carouselTrackWidth.value = carouselTrack.value.clientWidth

    window.addEventListener('resize', () => {
      if(carouselContainer.value) carouselContainerWidth.value = carouselContainer.value.clientWidth
    })
  }
})
onUnmounted(() => {
  if(import.meta.client) {
    window.removeEventListener('resize', () => {})
  }
})

const hasCarouselTrackOverflow = computed(() => {
  return carouselTrackWidth.value > carouselContainerWidth.value
})
</script>

<template>
  <div
     class="carousel-container"
     id="carousel-container"
  >
    <div class="carousel-track" id="carousel-track" :style="{transform: `translateX(-${carouselTranslateX}px)`}">
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
    <button v-if="carouselTranslateX !== 0 && hasCarouselTrackOverflow" class="carousel-arrow left" @click="previousSlide">
      <SvgComponent
        :width="40"
        :height="40"
        pathFill="white"
        svg-name="m10 18l-6-6l6-6l1.4 1.45L7.85 11H20v2H7.85l3.55 3.55z"
      />
    </button>
    <button v-if="hasCarouselTrackOverflow && !isLastSlide" class="carousel-arrow right" @click="nextSlide">
      <SvgComponent
        :width="40"
        :height="40"
        pathFill="white"
        svg-name="M16.15 13H5q-.425 0-.712-.288T4 12t.288-.712T5 11h11.15L13.3 8.15q-.3-.3-.288-.7t.288-.7q.3-.3.713-.312t.712.287L19.3 11.3q.15.15.213.325t.062.375t-.062.375t-.213.325l-4.575 4.575q-.3.3-.712.288t-.713-.313q-.275-.3-.288-.7t.288-.7z"
      />
    </button>
  </div>
</template>

<style scoped lang="scss">
.carousel-container {
  width: fit-content;
  max-width: 100%;
  position: relative;
  overflow: hidden;
}

.carousel-track {
  width: fit-content;
  display: flex;
  gap: 24px;
  transition: transform 0.75s ease;
}

.carousel-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  justify-content: center;
  align-items: center;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  font-size: 40px;
  color: white;
  background: black;
  cursor: pointer;
}

.carousel-arrow.left {
  left: 0;
}

.carousel-arrow.right {
  right: 0;
}

@media (max-width: 560px) {
  .carousel-track {
    gap: 0;
  }

  :deep(.card) {
    width: 310px;
  }
}
</style>
