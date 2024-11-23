import type {IActivityData} from '~/types/IActivityData'

export interface IExtendedActivityData extends IActivityData {
    additionalPhotosRefs: string[];
    artistUid: string;
    coordinatesLat: number;
    coordinatesLng: number;
    description: string;
}