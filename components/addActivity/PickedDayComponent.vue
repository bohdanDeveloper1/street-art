<script setup lang="ts">
import VueDatePicker from "@vuepic/vue-datepicker";
import {useDateListStore} from "~/stores/datesList";
import SvgComponent from '~/components/ui/SvgComponent.vue'
import type {IDateList} from '~/types/IDateList'

const props = defineProps<{
  dateStart: Date,
  dateEnd: Date,
  timeStart: IDateList['timeStart'] | null,
  timeEnd: IDateList['timeEnd'] | null,
}>();
const dateListStore = useDateListStore()
const localTimeStart = ref(props.timeStart)
const localTimeEnd = ref(props.timeEnd)
const emit = defineEmits<{
  (e: 'changeLocalTimeStart', dateStart: Date, dateEnd: Date, newLocalTimeStart: IDateList['timeStart']): void;
  (e: 'changeLocalTimeEnd', dateStart: Date, dateEnd: Date, newLocalTimeStart: IDateList['timeEnd'] ): void;
  (e: 'deleteActivityDay',  dateStart: Date, dateEnd: Date, timeStart: IDateList['timeStart'] | null, timeEnd: IDateList['timeEnd'] | null ): void;
}>()

function deleteActivityDay() {
  emit('deleteActivityDay', props.dateStart, props.dateEnd, props.timeStart, props.timeEnd);
}

function setNewEndDate() {
  if (!localTimeStart.value || !localTimeEnd.value) return
    if(
        (localTimeStart.value.hours > localTimeEnd.value.hours) ||
        (localTimeStart.value.hours === localTimeEnd.value.hours && localTimeStart.value.minutes >= localTimeEnd.value.minutes)
    ){
      if(props.dateStart.getDate() === props.dateEnd.getDate()){
        const index = dateListStore.datesList.findIndex(item => (item.dateStart === props.dateStart));

        const dateEnd: number = dateListStore.datesList[index].dateEnd.getDate();
        dateListStore.datesList[index].dateEnd = new Date(dateListStore.datesList[index].dateEnd.setDate(dateEnd + 1));
      }
    }else{
      if(props.dateEnd.getDate() - props.dateStart.getDate() === 1){
        const index = dateListStore.datesList.findIndex(item => (item.dateStart === props.dateStart));

        const dateEnd: number = dateListStore.datesList[index].dateEnd.getDate();
        dateListStore.datesList[index].dateEnd = new Date(dateListStore.datesList[index].dateEnd.setDate(dateEnd - 1));
      }
    }
}

watch(localTimeStart, (newLocalTimeStart) => {
  emit('changeLocalTimeStart', props.dateStart, props.dateEnd, newLocalTimeStart)
  setNewEndDate();
})

watch(localTimeEnd, (newLocalTimeEnd) => {
  emit('changeLocalTimeEnd', props.dateStart, props.dateEnd, newLocalTimeEnd)
  setNewEndDate();
})
</script>

<template>
  <div class="chosen-day roboto-light">
    <div class="card-content">
      <div class="time-pickers">
        <div class="time-picker">
          <div class="picked-day">
            {{props.dateStart.toDateString()}}
          </div>
          <VueDatePicker placeholder="Start" v-model="localTimeStart" time-picker/>
        </div>
        <div class="time-picker">
          <div class="picked-day">
            {{props.dateEnd.toDateString()}}
          </div>
          <VueDatePicker placeholder="End" v-model="localTimeEnd" time-picker/>
        </div>
      </div>
    </div>
    <SvgComponent
      class="close-icon"
      svg-name="m8.382 17.025l-1.407-1.4L10.593 12L6.975 8.4L8.382 7L12 10.615L15.593 7L17 8.4L13.382 12L17 15.625l-1.407 1.4L12 13.41z"
      @click="deleteActivityDay"
    />
  </div>
</template>

<style scoped lang="scss">
.chosen-day{
  position: relative;
  padding: 16px 8px;
  border: 1px solid lightgrey;
  border-radius: 4px;
  background: white;
}

.close-icon{
  position: absolute;
  top: 8px;
  right: 8px;

  &:hover{
    :deep(path) {
      fill: black;
    }
  }
}

.time-pickers{
  display: flex;
  gap: 24px;
}

.time-picker{
  max-width: 180px;
  display: flex;
  flex-direction: column;
  gap: 8px;

  .picked-day{
    font-weight: 400;
  }
}
</style>