import data from "@begin/data";
import { tables } from "./constants.mjs";



export const viewCountersPageNames = {
    home: 'home_page',
    search: 'search_page',
    about: 'about_page',
    terms: 'terms_page',
    addTutor: 'addTutor_page',
    addInstitution: 'addInstitution_page',
    tutorInfo: 'tutorInfo_page',
}

export const incrementViewsCounters =  async(page)=> 
    data.incr({table: tables.counters, key: 'pageViews', prop: page })


export const getCounts = async() => {
    const countersData = await data.get({
        table: tables.counters,
    })



    return {
        views: countersData,}
        ;
}