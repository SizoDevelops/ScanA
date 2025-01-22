import { doc, setDoc,CACHE_SIZE_UNLIMITED, getDoc, updateDoc } from "firebase/firestore"; 
import app from "@/lib/firebase";
import { initializeFirestore} from "firebase/firestore";



const db = initializeFirestore(app,{
  cacheSizeBytes: CACHE_SIZE_UNLIMITED
})

 // This gets the user from the database

export const getUserCollection = async (key) => {
    const user = await getDoc(doc(db, "users", key))

    if(user.exists()){
       return user.data() 
    }
    else{
        return null
    }
}

// This sets the user in the database

export const setFeedbackCollection = async (key, data) => {

    const user = await getDoc(doc(db, "feedback", key))
    
    if(!user.exists()){
        await setDoc(doc(db, "feedback", key), data);

        return true
    }

    else{
        return false
    }
}

//  Update Members

export const updateCollectionMembers = async (key, data) => {
    
    const updatedUser = await  updateDoc(doc(db, "users", key), {members: data})

    if(updatedUser){
        return updatedUser
    }

    else{
        return null
    }
}

export const getFeedbackCollection = async (key) => {
    const user = await getDoc(doc(db, "feedback", key))

    if(user.exists()){
       return user.data() 
    }
    else{
        return null
    }
}