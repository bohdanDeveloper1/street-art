<script setup lang="ts">
import type {IExtendedActivityData} from '~/types/IExtendedActivityData'

interface Props {
  activityData: IExtendedActivityData
  filteredDatesStartEnd: {
    start: string
    end: string
  }[]
}

const props = defineProps<Props>()
</script>

<template>
  <div class="info-card">
    <div class="card-dates-item">
      <img src="/images/calendarIcon.svg" alt="Time:">
      <div class="activity-dates">
        <div style="margin: 8px 0;">
          <div style="margin-bottom: 8px">
            <span class="roboto-bold" style="margin-right: 8px">Start:</span>{{filteredDatesStartEnd[0].start}}
          </div>
          <div>
            <span class="roboto-bold" style="margin-right: 16px">End:</span>{{filteredDatesStartEnd[0].end}}
          </div>
        </div>
        <div class="start-end-dates-info" style="margin-bottom: 8px;">Also at:</div>
        <div
            :class="['start-end-dates-container', {'container-scrollable': filteredDatesStartEnd.length > 5}]"
        >
          <div
            v-for="(item, index) in filteredDatesStartEnd.slice(1)"
            :key="index"
            class="start-end-date-item"
          >
            <div>
              <div style="margin-bottom: 4px;"><span class="roboto-bold">Start:</span> {{item.start}}</div>
              <div><span class="roboto-bold">End:</span> {{item.end}}</div>
            </div>
            <hr style="margin-top: 4px">
          </div>
        </div>
      </div>
    </div>
    <div class="card-item">
      <img src="/images/locationIcon.svg" alt="Location:">
      <div class="activity-address roboto-bold">{{activityData.cityName}}, {{activityData.streetName}} {{activityData.houseNumber}}</div>
    </div>
    <div class="artist-card-container">
      <img src="/images/artist_test_photo.jpg" alt="artist_test_photo">
      <div class="see-artist-info-btn_container">
        <button class="see-artist-info-btn roboto-medium">
          See artist
        </button>
      </div>
    </div>
    <!--        <div class="add-to-favourite-btn-container">-->
    <!--          <v-btn-->
    <!--              class="add-to-favourite-btn"-->
    <!--          >-->
    <!--            save activity-->
    <!--          </v-btn>-->
    <!--        </div>-->
  </div>
</template>

<style scoped lang="scss">
.info-card{
  position: sticky;
  top: 12px;
  width: 350px;
  height: fit-content;
  border-radius: 12px;
  border: 1px solid darkgrey;
  padding: 16px;
}

.card-item{
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.activity-dates{
  width: 100%;
}

.card-dates-item{
  display: flex;
  margin-bottom: 8px;
  align-items: start;
}

.container-scrollable {
  cursor: pointer;
  max-height: 220px;
  width: 100%;
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

.card-item > img, .card-dates-item > img{
  margin-right: 8px;
}

.add-to-favourite-btn-container{
  margin-top: 12px;
}

.add-to-favourite-btn{
  width: 100%;
  background: #000;
  color: white;
}

.artist-card-container{
  width: 100%;
  height: 130px;
  display: flex;
}

.artist-card-container > img{
  width: 50%;
  height: 100%;
  border-radius: 15px 0 0 15px;
}

.see-artist-info-btn_container{
  width: 50%;
  display: flex;
  justify-content: center;
  align-items: end;
  border-radius: 0 15px 15px 0;
  background-color: lightgrey;
}

.see-artist-info-btn{
  color: black;
  font-size: large;
  margin-bottom: 20px;
}

@media (max-width: 1120px) {
  .info-card{
    position: relative;
    width: fit-content;
    border: none;
    background-color: white;
    border-radius: 10px;
    padding: 12px;
  }

  .start-end-dates-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: start;
    gap: 16px;
  }

  .artist-card-container{
    max-width: 400px;
  }
}
</style>