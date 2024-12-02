interface ITime {
    hours: number
    minutes: number
    seconds: number
}

export interface IDateList {
    dateStart: Date
    dateEnd: Date
    timeStart: ITime | null
    timeEnd: ITime | null
}