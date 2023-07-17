import { getCounts } from '../../models/counters.mjs';


/** @type {import('@enhance/types').EnhanceApiFn} */
export async function get() {
    const countersData = await getCounts();

    return {
        json: countersData
    }

}