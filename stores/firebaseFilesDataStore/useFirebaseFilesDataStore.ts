import {defineStore} from 'pinia'
import {getStorage, ref as storageRef, uploadBytes} from 'firebase/storage'

export const useFirebaseFilesDataStore = defineStore('firebaseFilesData', () => {
    const storage = getStorage()

    // optimaze it: add if(files.length > 1) {}
    // if(files.length === 1) {}
    // if(!files.length) {}
    async function postFiles(collectionName: string, fileName: string, files: any): Promise<string[]> {
        let fileUrls = []
        const dateNow: string = Date.now().toString()

        try {
            for(let i = 0; i < files.length; i++) {
                const url = 'images/' + collectionName + fileName + i.toString() + dateNow
                fileUrls.push(url)
                const fileRef = storageRef(storage, url)
                await uploadBytes(fileRef, files[i])
            }

            return fileUrls
        } catch (e) {
            console.log("Error during upload image: ", e)
            throw e
        }
    }

    return{
        postFiles
    }
})
