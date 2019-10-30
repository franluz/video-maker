const google = require('googleapis').google
const imageDownload = require('image-downloader')
const custumerSearch = google.customsearch('v1')
const state = require('./state.js')
const googleSearchCredentials = require('../credentials/google-search.json')
async function robot(){
    const content = state.load()
    await fetchImagesOfAllSentences(content)
    state.save(content)
    await downloadAllImages(content)
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
            num:7
        })

        let  imagesUrl = []
        if(response.data.items){
          imagesUrl = response.data.items.map(item=>{
                return item.link
            })
        }

        return imagesUrl
    }
    
    async function downloadAllImages(content){
        content.downloadedImages = []
        
        for(let sentenceIndex = 0; sentenceIndex<= content.sentences.length; sentenceIndex++ ){
            let images = []
            if(content.sentences[sentenceIndex]){
                images = content.sentences[sentenceIndex].images 
            }
            for(let imageIndex=0 ; imageIndex<images.length ; imageIndex++){
                const imageUrl = images[imageIndex]     
                try{
                    if(content.downloadedImages.includes(imageUrl)){
                        throw new Error('imagem já foi baixada')
                    }
                    await downloadImageAndSave(imageUrl,`${sentenceIndex}-original.png`)
                    content.downloadedImages.push(imageUrl)
                    content.imagesLocal.push(`./content/${sentenceIndex}-original.png`)
                    console.log(`>[${sentenceIndex}][${imageIndex}] Baixou com sucesso: ${imageUrl} `)
                    break
                }catch(err){
                    console.log(`> [${sentenceIndex}][${imageIndex}] Erro ao baixar (${imageUrl}):${err}`)
                }
            }
        }
    }
    async function downloadImageAndSave(url,fileName){
        
        return imageDownload.image({
            url:url,
            dest:`./content/${fileName}`
        })
       
    }
}
module.exports = robot