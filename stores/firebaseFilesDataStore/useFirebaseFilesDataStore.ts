import {defineStore} from 'pinia'
import {getStorage, ref as storageRef, uploadBytes} from 'firebase/storage'

export const useFirebaseFilesDataStore = defineStore('firebaseFilesData', () => {
    const storage = getStorage()

    async function postFiles(collectionName: string, fileName: string, files: any): Promise<string[] | null> {
        const dateNow: string = Date.now().toString()
        const fileUrls: string[] = []

        try{
            if(files && files.length > 1) {
                for(let i = 0; i < files.length; i++) {
                    const url = 'images/' + collectionName + fileName + i.toString() + dateNow
                    fileUrls.push(url)
                    const fileRef = storageRef(storage, url)
                    await uploadBytes(fileRef, files[i])
                }

                return fileUrls
            } else if(files) {
                const url = 'images/' + collectionName + fileName + dateNow
                fileUrls.push(url)
                const fileRef = storageRef(storage, url)
                await uploadBytes(fileRef, files)

                return fileUrls
            } else{
                return null
            }
        } catch (e) {
            console.log("Error during upload image: ", e)
            throw e
        }
    }

    return{
        postFiles
    }
})
