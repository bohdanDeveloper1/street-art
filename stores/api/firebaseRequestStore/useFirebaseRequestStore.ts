import {defineStore} from 'pinia'
import {
    addDoc,
    collection,
    getDocs,
    query,
    where,
    updateDoc,
    doc,
    deleteDoc,
} from 'firebase/firestore'
import {useNuxtApp} from '#build/imports'

export const useFirebaseRequestStore = defineStore('firebaseRequest', () => {
    const {$firestore}: any = useNuxtApp()

    async function post(collectionName: string, data: object): Promise<string | unknown> {
        try {
            const docRef = await addDoc(collection($firestore, collectionName), data)
            return docRef.id
        } catch (e) {
            console.error("Error adding document: ", e)
            return e
        }
    }

    // async function get(collectionName: string): Promise<object[] | unknown> {
    //     try {
    //        return  await getDocs(collection($firestore, collectionName));
    //     } catch (e) {
    //         console.error("Error adding document: ", e)
    //         return e
    //     }
    // }

    async function get(
        collectionName: string,
        whereConditions?: [string, FirebaseFirestore.WhereFilterOp, unknown][]
    ): Promise<object[] | unknown> {
        try {
            const colRef = collection($firestore, collectionName)
            const q = whereConditions ? query(colRef, ...whereConditions.map(condition => where(...condition))) : colRef

            const querySnapshot = await getDocs(q)
            // Mapowanie wyników zapytania do tablicy obiektów
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (e) {
            console.error("Error fetching documents: ", e);
            return e;
        }
    }

    // to update data
    async function patch(collectionName: string, docId: string, dataToSet: object): Promise<boolean> {
        try{
            const docRef = doc($firestore, collectionName, docId)
            // Set new data
            await updateDoc(docRef, dataToSet)

            return true
        } catch (e) {
            console.error("Error updating document: ", e)
            return false
        }
    }

    async function deleteDocument(collectionName: string, docId: string, fieldsToDelete?: object): Promise<boolean> {
        try {
            const docRef = doc($firestore, collectionName, docId)
            if(fieldsToDelete) {
                await updateDoc(docRef, fieldsToDelete)
                return true
            } else {
                await deleteDoc(doc($firestore, collectionName, docId))
                return true
            }
        } catch (e) {
            console.error("Error adding document: ", e)
            return false
        }
    }
})
