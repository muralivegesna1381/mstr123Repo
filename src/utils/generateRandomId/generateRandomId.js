
import moment from 'moment';

export async function generateRandomNumber  () {
    let rNumber = Math.floor(Math.random() * 1000000000000000);
    return rNumber+'_'+new Date().getTime();
}
