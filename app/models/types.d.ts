
export type UniversityType = {
    key: string;
    name:string;
    abbreviation: string;
    faculties: Array<{
        key: string;
        name: string;
        abbreviation: string;
        stateId: string;
    }>
}


export type TutorType = {
    key: string;
    name: string;
    surname1: string;
    surname2: string;
    flagged: string[];
    worksIn: {
        universityId: string;
        facultyId: string;
    }
    reviews: Array< {
        userId: string;
        key: string;
        votes: {
            favor: string[];
            against: string[];
            flagged: string[];
        };
        createdAt: string;
    } & Record<string, string>
    >
}

export type CommentType = {
    key: string;
    comment: string;
}