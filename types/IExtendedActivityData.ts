import type {IActivityData} from '~/types/IActivityData'

export interface IExtendedActivityData extends IActivityData {
    artistUid: string
    additionalPhotosRefs: string[]
    coordinatesLat: number
    coordinatesLng: number
    description: string
    //activityEnd: number
}