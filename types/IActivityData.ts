export interface IActivityData {
    id: string
    mainPhotoRef: string
    name: string
    cityAdmin: string
    cityName: string
    streetName: string
    houseNumber:  string
    category: string
    activityDates: {start: number, end: number}[]
}