import { defineStore } from 'pinia';
import type {IDateList} from '~/types/IDateList'


export const useDateListStore = defineStore('dateList', () => {
    const datesList = reactive<IDateList[]>([])
    const datesListLength = computed(() => {
        return datesList.length
    })

    return {
        datesList,
        datesListLength,
    }
})
