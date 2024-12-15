<script setup lang="ts">
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import {useDateListStore} from "~/stores/datesList";
import type {IDateList} from '~/types/IDateList'
import {useRoute} from '#vue-router'
import PickedDayComponent from '~/components/addActivity/PickedDayComponent.vue'

interface Emits {
  (e: 'onChange'): void
}

const emit = defineEmits<Emits>()
// date contain only start date and end date
const date = ref<Date[] | null>(null);
const dateListStore = useDateListStore();
const startDate = ref<Date | null>(null);
const endDate = ref<Date | null>(null);
// global timeStart for each day of activity
const timeStart = ref();
const timeEnd = ref();

const route = useRoute()
watch(dateListStore.datesList, (value) => {
  if(route.params.activityId && dateListStore.datesList.length) {
    date.value = [
      dateListStore.datesList[0].dateStart,
      dateListStore.datesList[dateListStore.datesList.length - 1].dateEnd
    ]
  }
})

function getDatesBetween(start: Date, end: Date) {
  const currentDate = new Date(start);

  while (currentDate <= end) {
    dateListStore.datesList.push({
      dateStart: new Date(currentDate),
      dateEnd: new Date(currentDate),
      timeStart: null,
      timeEnd: null,
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }
}

function deleteActivityDay(dateStart: Date, dateEnd: Date, timeStart: object | null, timeEnd: object | null) {
  const index = dateListStore.datesList.findIndex(item => (item.dateStart === dateStart && item.dateEnd === dateEnd && item.timeStart === timeStart && item.timeEnd === timeEnd));
  if (index !== -1) {
    dateListStore.datesList.splice(index, 1);
  }
}

// changeLocalTimeStart - change timeStart for one day
function changeLocalTimeStart(dateStart: Date, dateEnd: Date, newLocalTimeStart: IDateList['timeStart']) {
  dateListStore.datesList.forEach((item) => {
    if(item.dateStart === dateStart && item.dateEnd === dateEnd){
      item.timeStart = newLocalTimeStart;
    }
  })
}

function changeLocalTimeEnd(dateStart: Date, dateEnd: Date, newLocalTimeEnd: IDateList['timeEnd']) {
  dateListStore.datesList.forEach((item) => {
    if(item.dateStart === dateStart && item.dateEnd === dateEnd){
      item.timeEnd = newLocalTimeEnd;
    }
  })
}

watch(date, (newDate) => {
  if (!newDate) {
    startDate.value = null;
    endDate.value = null;
    timeStart.value = null;
    timeEnd.value = null;
    dateListStore.datesList.length = 0;

    return;
  }

  startDate.value = newDate[0];
  if(newDate[1]) {
    endDate.value = newDate[1];
  } else if(!newDate[1] && !route.params.activityId) { // add only date and time start
    dateListStore.datesList.push({
      dateStart: new Date(newDate[0]),
      dateEnd: new Date(newDate[0]),
      timeStart: null,
      timeEnd: null
    });
  }

  if(startDate.value && endDate.value && !route.params.activityId){
    getDatesBetween(newDate[0], newDate[1]);
  }
});

// change timeStart for each day
watch(timeStart, (newTimeStart) =>{
  dateListStore.datesList.forEach((item) => {
    item.timeStart = newTimeStart;
  })
})

// change timeEnd for each day
watch(timeEnd, (newTimeEnd) =>{
  dateListStore.datesList.forEach((item) => {
    item.timeEnd = newTimeEnd;
  })
})
</script>

<template>
  <div>
    <VueDatePicker
      v-model="date"
      :min-date="new Date()"
      placeholder="Date start - date end"
      :range="{ partialRange: true }"
      :enable-time-picker="false"
      @update:model-value="emit('onChange')"
      @blur="emit('onChange')"
    />
    <div class="time-pickers-container" v-if="date && date?.length">
      <div class="time-picker">
        <VueDatePicker placeholder="Start for each date" v-model="timeStart" time-picker />
      </div>
      <div class="time-picker">
        <VueDatePicker placeholder="End for each date" v-model="timeEnd" time-picker />
      </div>
    </div>
    <div>
      <ul class="chosen-days">
        <li v-for="(item, index) in dateListStore.datesList" :key="index">
          <PickedDayComponent
            :dateStart="item.dateStart"
            :dateEnd="item.dateEnd"
            :timeStart="item.timeStart"
            :timeEnd="item.timeEnd"
            @changeLocalTimeStart="changeLocalTimeStart"
            @changeLocalTimeEnd="changeLocalTimeEnd"
            @deleteActivityDay="deleteActivityDay"
          />
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped lang="scss">
.chosen-days{
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 24px;
  padding: 0;
}

@media (max-width: 890px) {
  .chosen-days{
    flex-wrap: nowrap;
    flex-direction: column;
    gap: 16px;
  }
}

.time-pickers-container{
  margin: 16px 0;
  display: flex;
  justify-content: space-between;
}

.time-picker{
  max-width: 44%;
}
</style>