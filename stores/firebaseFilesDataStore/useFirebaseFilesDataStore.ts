import {defineStore} from 'pinia'
import {getStorage, ref as storageRef, uploadBytes, deleteObject } from 'firebase/storage'

export const useFirebaseFilesDataStore = defineStore('firebaseFilesData', () => {
    const storage = getStorage()

    async function postFiles(collectionName: string, fileName: string, files: any): Promise<string[]> {
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
            } else {
                const url = 'images/' + collectionName + fileName + dateNow
                fileUrls.push(url)
                const fileRef = storageRef(storage, url)
                await uploadBytes(fileRef, files)

                return fileUrls
            }
        } catch (e) {
            console.log("Error during upload image: ", e)
            throw e
        }
    }

    async function deleteFile(url: string) {
        try{
            //Uncaught (in promise) FirebaseError: Firebase Storage: The operation 'deleteObject' cannot be performed on a root reference, create a non-root reference using child, such as .child('file.png'). (storage/invalid-root-operation)
            const fileRef = storageRef(storage, url)
            await deleteObject(fileRef)
        } catch(error) {
            throw error
        }
    }

    return{
        postFiles,
        deleteFile,
    }
})
