import { getCounts } from '../../models/counters.mjs';
import {validateAuthorizedMiddleWare} from './login.mjs';


export const get = [validateAuthorizedMiddleWare, getCountsData];

/** @type {import('@enhance/types').EnhanceApiFn} */
export async function getCountsData() {
    const countersData = await getCounts();

    return {
        json: countersData
    }

}