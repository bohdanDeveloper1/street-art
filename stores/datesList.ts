import { defineStore } from 'pinia';


interface IDateList{
    dateStart: Date,
    dateEnd: Date,
    timeStart: object | null,
    timeEnd: object | null,
}

export const useDateListStore = defineStore('dateList', () => {
    const datesList = reactive<IDateList[]>([])
    const datesListLength = computed(() => {
        return datesList.length
    })

    return {
        datesList,
        datesListLength,
    }
});
