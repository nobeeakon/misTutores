import data from "@begin/data";
import { tables } from "./constants.mjs";
import {getAllUniversities} from './universities.mjs';
import {getAllTutors} from './tutors.mjs'

const getDataCounts = async() => {
    const universities = await getAllUniversities();
    const faculties = universities.map(({faculties}) => faculties).flat()

    const tutorsInfo = await getAllTutors();
    const reviews = tutorsInfo.map(({reviews}) => reviews).flat()


    return {universities: universities.length,
        faculties: faculties.length,
        tutors: tutorsInfo.length,
        reviews: reviews.length,
    }
}


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

    const dataCounts = await getDataCounts()


    return {
        data: dataCounts,
        views: countersData,}
        ;
}