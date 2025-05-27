import moment from 'moment'

export function extractTime ({time}){
    return moment(time).format("HH:mm:ss");
}