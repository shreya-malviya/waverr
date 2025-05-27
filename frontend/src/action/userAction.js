import{ 
    CLEAR_ERRORS, 
    FILTERED_USER_FAIL, 
    FILTERED_USER_REQUEST, 
    FILTERED_USER_SUCCESS, 
    LOAD_USER_FAIL, 
    LOAD_USER_REQUEST, 
    LOAD_USER_SUCCESS, 
    LOGIN_FAIL, 
    LOGIN_REQUEST, 
    LOGIN_SUCCESS, 
    LOGOUT_FAIL, 
    LOGOUT_SUCCESS, 
    REGISTER_USER_FAIL, 
    REGISTER_USER_REQUEST,
    REGISTER_USER_SUCCESS,
    UPDATE_PROFILE_FAIL,
    UPDATE_PROFILE_REQUEST,
    UPDATE_PROFILE_SUCCESS
} from '../constants/userConstants'
import axios from 'axios'
import api, { BASE_URL } from '../util';
export const login = (email,password)=>async(dispatch)=>{
    try{
        dispatch({type:LOGIN_REQUEST});

        const config = {headers:{"Content-Type":"application/json"},
        withCredentials: true}
        const {data} = await api.post(`/api/v1/login`,
        {email,password},
        )
        // console.log("token is : ",data)
        localStorage.setItem("token", data?.token);
        dispatch({type:LOGIN_SUCCESS,payload:data.user});
        // dispatch(loadUser())
    }catch(error){
        // console.log('error is this ',error?.response?.data?.err ?? error?.message,)
        dispatch({type:LOGIN_FAIL,payload:error?.response?.data?.err ?? error?.message,})
    }
}

// REGISTER user
export const register = (firstName,lastName,email,password) => async(dispatch)=>{
    try{
        dispatch({type:REGISTER_USER_REQUEST});

        const config = {headers:{"Content-Type":"application/json"},
    withCredentials: true};
        const {data} = await api.post(`/api/v1/register`,{firstName:firstName,lastName:lastName,email:email,password:password});
        localStorage.setItem("token", data?.token);
        dispatch({type:REGISTER_USER_SUCCESS,payload:data.user})
        // dispatch(loadUser())
    }catch(error){
        dispatch({
            type: REGISTER_USER_FAIL,
            payload:error?.response?.data?.err ?? error?.message,

        })
    }
}

//loading a user who is already logged in 
export const loadUser = () => async(dispatch)=>{
    try{
        dispatch({type:LOAD_USER_REQUEST});
        const {data} = await api.get(`/api/v1/me`,{withCredentials:true})
        dispatch({type:LOAD_USER_SUCCESS, payload: data.user})
    }catch(error){
        dispatch({
            type:LOAD_USER_FAIL,
            payload:error?.response?.data?.err ?? error?.message,
        })
    }
}

//logout
export const logout = () => async(dispatch) =>{
    try{
        await api.get(`/api/v1/logout`)
        localStorage.removeItem('token')
        dispatch({type:LOGOUT_SUCCESS});
    }catch(error){
        dispatch({type:LOGOUT_FAIL,payload:error?.response?.data?.err ?? error?.message,})
    }
}

// update profile 
export const updateProfile = (userData) => async(dispatch) =>{
    try{
        dispatch({type:UPDATE_PROFILE_REQUEST});
        const {data} = await axios.put(`${BASE_URL}/api/v1/me/update`,null,{withCredentials: true})
        dispatch({type:UPDATE_PROFILE_SUCCESS,payload:data.user})
    }catch(error){
        dispatch({type:UPDATE_PROFILE_FAIL,payload:error?.response?.data?.err ?? error?.message,})
    }
}



// clearing errors 
export const clearErrors = () => async(dispatch)=>{
    dispatch({type:CLEAR_ERRORS}) 
}


