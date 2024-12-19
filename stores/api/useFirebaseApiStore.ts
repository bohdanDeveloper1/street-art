import {defineStore} from 'pinia'
import {addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, updateDoc, where,} from 'firebase/firestore'
import {useNuxtApp} from '#build/imports'
import {
    orderBy,
    arrayUnion,
    arrayRemove,
} from '@firebase/firestore'

export const useFirebaseApiStore = defineStore('activityApi', () => {
    const {$firestore}: any = useNuxtApp()

    async function post(collectionName: string, data: object): Promise<string> {
        try {
            const docRef = await addDoc(collection($firestore, collectionName), data)
            return docRef.id
        } catch (e) {
            console.error("Error adding document: ", e)
            throw e
        }
    }

    async function get<T>(
        collectionName: string,
        whereConditions?: [string, FirebaseFirestore.WhereFilterOp, unknown][],
        documentId?: string
    ): Promise<T[]> {
        try {
            const collectionRef = collection($firestore, collectionName)
            let q = whereConditions ? query(collectionRef, ...whereConditions.map(condition => where(...condition))) : collectionRef
            q = query(q, orderBy('activityEnd'))
            if (documentId) {
                const docRef = doc(collectionRef, documentId)
                const docSnapshot = await getDoc(docRef)
                return [{
                    id: docSnapshot.id,
                    ...docSnapshot.data(),
                } as T]
            }

            const querySnapshot = await getDocs(q)
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as T[]
        } catch (e) {
            console.log("Error fetching documents: ", e)
            throw e
        }
    }

    // to update document
    async function patch(collectionName: string, docId: string, dataToSet: object): Promise<void> {
        try{
            const docRef = doc($firestore, collectionName, docId)
            await updateDoc(docRef, dataToSet)
        } catch (e) {
            console.error("Error updating document: ", e)
            throw e
        }
    }

    // add or remove data to document array field
    async function updateDocumentArrayField(collectionName: string, docId: string, docFieldName: string, data: string, removeData: boolean = false) {
        try{
            const docRef = doc($firestore, collectionName, docId)

            if(removeData) {
                await updateDoc(docRef, {
                    [docFieldName]: arrayRemove(data)
                })
            } else{
                await updateDoc(docRef, {
                    [docFieldName]: arrayUnion(data)
                })
            }
        } catch (e) {
            console.error("Error updating document: ", e)
            throw e
        }
    }

    async function deleteDocument(collectionName: string, docId: string): Promise<void> {
        try {
            await deleteDoc(doc($firestore, collectionName, docId))
        } catch (e) {
            console.error("Error during delete document: ", e)
            throw e
        }
    }

    return{
        post,
        get,
        patch,
        deleteDocument,
        updateDocumentArrayField,
    }
})
