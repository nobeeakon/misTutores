import { getAllTutors } from "../models/tutors.mjs";

export async function get() {
    const baseUrl = `https://mistutores.mx`;

    const tutorsData = await getAllTutors();

    const tutorKeys = tutorsData.map(tutorItem => tutorItem.key).filter(Boolean)
    
    const tutorXml = tutorKeys.map(tutorKey => 
        `<url>
        <loc>${baseUrl}/${tutorKey}</loc>
        <lastmod>2023-07-01</lastmod>
        </url>`
    ).join('')

    // <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    const sitemap = `
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
    <loc>${baseUrl}</loc>
    <lastmod>2023-07-01</lastmod>
    </url>
    <url>
    <loc>${baseUrl}/about</loc>
    <lastmod>2023-07-01</lastmod>
    </url>

    ${tutorXml}


    </urlset>
`

    return {
        xml:sitemap
    }

}