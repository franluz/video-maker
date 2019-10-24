const google = require('googleapis').google
const custumerSearch = google.customsearch('v1')
const state = require('./state.js')
const googleSearchCredentials = require('../credentials/google-search.json')
async function robot(){
    const content = state.load()
    await fetchImagesOfAllSentences(content)
    state.save(content)

    async function fetchImagesOfAllSentences(content){
        for (const sentence of content.sentences){
            const query = `${content.searchTerm} ${sentence.keywords[0]}`
            
            sentence.images = await fetchGoogleAndReturnImageLinks(query)
            sentence.googleSearchQuery = query
        }
    }
    async function fetchGoogleAndReturnImageLinks(query){
        console.log(` Termos de busca das imagens: ${query}`)
        const response = await custumerSearch.cse.list({
            auth: googleSearchCredentials.apikey,
            cx: googleSearchCredentials.searchEngineId,
            q: query,
            searchType:'image',
            imgSize: 'huge',
            num:2
        })

        const imagesUrl = response.data.items.map(item=>{
            return item.link
        })

        return imagesUrl
    }
    
    //process.exit(0)
}
module.exports = robot