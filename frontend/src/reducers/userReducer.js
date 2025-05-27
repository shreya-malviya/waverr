import{ 
    CLEAR_ERRORS, 
    LOAD_USER_FAIL, 
    LOAD_USER_REQUEST, 
    LOAD_USER_SUCCESS, 
    LOGIN_FAIL, 
    LOGIN_REQUEST, 
    LOGIN_SUCCESS, 
    REGISTER_USER_FAIL, 
    REGISTER_USER_REQUEST,
    REGISTER_USER_SUCCESS,
    UPDATE_PROFILE_FAIL,
    UPDATE_PROFILE_RESET,
    UPDATE_PROFILE_REQUEST,
    UPDATE_PROFILE_SUCCESS,
    LOGOUT_SUCCESS,
    LOGOUT_FAIL,
    FILTERED_USER_REQUEST,
    FILTERED_USER_SUCCESS,
    FILTERED_USER_FAIL
} from '../constants/userConstants'


let userInitialState = {
    loading : false,
    isAuthenticated: false,
    user: {},
    error : null
}

export const userReducer = (state = userInitialState, action) => {
    switch (action.type) {
        // Auth Requests
        case LOGIN_REQUEST:
        case REGISTER_USER_REQUEST:
        case LOAD_USER_REQUEST:
            return {
                ...state,
                loading: true,
                isAuthenticated: false,
            };

        // Auth Success
        case LOGIN_SUCCESS:
        case REGISTER_USER_SUCCESS:
        case LOAD_USER_SUCCESS:
            return {
                ...state,
                loading: false,
                isAuthenticated: true,
                user: action.payload,
            };

        // Logout Success
        case LOGOUT_SUCCESS:
            return {
                ...state,
                loading: false,
                user: null,
                isAuthenticated: false,
            };

        // Auth Failures
        case LOAD_USER_FAIL:
            return {
                ...state,
                loading: false,
                isAuthenticated: false,
                user: null,
                error: action.payload,
            };

        case LOGIN_FAIL:
        case REGISTER_USER_FAIL:
            return {
                ...state,
                loading: false,
                isAuthenticated: false,
                user: null,
                error: action.payload,
            };

        case LOGOUT_FAIL:
            return {
                ...state,
                error: action.payload,
            };

        // Profile Update
        case UPDATE_PROFILE_REQUEST:
            return {
                ...state,
                loading: true,
            };

        case UPDATE_PROFILE_SUCCESS:
            return {
                ...state,
                loading: false,
                isUpdated: true,
            };

        case UPDATE_PROFILE_FAIL:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };

        case UPDATE_PROFILE_RESET:
            return {
                ...state,
                isUpdated: false,
            };

        // Clear Errors
        case CLEAR_ERRORS:
            return {
                ...state,
                error: null,
            };

        default:
            return state;
    }
};

// let initialState = {
//     loading : false,
//     users: [],
//     error : null
// }

// export const filteredUser = (state = initialState, action)=>{
//     switch(action.type){
//         case FILTERED_USER_REQUEST:
//             return{
//                 ...state,
//                 loading:true
//             }
//         case FILTERED_USER_SUCCESS:
//             return{
//                 ...state,
//                 users:action.payload,
//                 loading:false
//             }
//         case FILTERED_USER_FAIL:
//             return{
//                 ...state,
//                 users:null,
//                 loading:false,
//                 error:action.payload
//             }
//         case CLEAR_ERRORS:
//             return {
//                 ...state,
//                 error: null,
//             };
//         default:
//             return state;
//     }
// }


// export const profileReducer = (state = {},action)=>{
//     switch(action.type){
//         case UPDATE_PROFILE_REQUEST:
//             return{
//                 ...state,
//                 loading:true,
//             }
//         case UPDATE_PROFILE_SUCCESS:
//             return{
//                 ...state,
//                 loading:false,
//                 isUpdated:action.payload
//             }
//         case LOGOUT_SUCCESS:
//                 return{
//                     loading:false,
//                     user:null,
//                     isAuthenticated:false,
//                 }
//         case LOGOUT_FAIL:
//             return{
//                 ...state,
//                 loading:false,
//                 error:action.payload,
//             }
//         case UPDATE_PROFILE_FAIL:
//             return{
//                 ...state,
//                 loading:false,
//                 error:action.payload
//             }
//             case CLEAR_ERRORS:
//                 return{
//                     ...state,
//                     error:null,
//                 }
//             case UPDATE_PROFILE_RESET:
//                 return{
//                     ...state,
//                     isUpdated:false,
//                 };
//             default:
//                 return state;
//     }
// }