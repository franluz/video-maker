const algorithmia = require('algorithmia')
const algorithmiaApiKey = require('../credentials/algorithmia.json').apiKey
const watsonApiKey = require('../credentials/watson-nlu.json')
const sentenceBoundaryDetection = require('sbd')
const NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js')
 
const nlu = new NaturalLanguageUnderstandingV1({
    iam_apikey: watsonApiKey.apikey,
    version: '2018-11-16',
    url: watsonApiKey.url
});
const state = require('./state.js')
 async function robot(){
    state.load()
    const content = state.load()
    await fetchContentFromWikipidia(content)
    sanitizeContent(content)
    breakContentIntoSentences(content)
    limitMaximunSentences(content)
    await fetchKeywordsOfAllSentences(content)
    state.save(content)
   async function fetchContentFromWikipidia(content){
        const algorithmiaAuthenticated = algorithmia(algorithmiaApiKey)
        const wikipediaAlgorithim = algorithmiaAuthenticated.algo('web/WikipediaParser/0.1.2')
        console.log("linguagem: "+  content.lang)
        const wikipediaResponse = await wikipediaAlgorithim.pipe({
            "lang": content.lang,
            "articleName": content.searchTerm
        })
        const wikipediaContent = wikipediaResponse.get()
        content.sourceContentOriginal = wikipediaContent.content
        
    }
    function sanitizeContent(content){
        const withoutBlankLinesAndMarkdown = removeBlankLinesAndMarkdown(content.sourceContentOriginal)
        const withoutDatesInParentheses = removeDatesInParenthesis(withoutBlankLinesAndMarkdown)
        content.sourceContentSanitized = withoutDatesInParentheses 
        function removeBlankLinesAndMarkdown(text){
            const allLines = text.split('\n')
            withoutBlankLinesAndJoinMarks = allLines.filter((line)=>{
                if(line.trim().length === 0 || line.trim().startsWith('=')){
                    return false
                }
                return true
            })
            return withoutBlankLinesAndJoinMarks.join(' ')
        }
        function removeDatesInParenthesis(text){
            return text.replace(/\((?:\([^()]*\)|[^()])*\)/gm, '').replace(/  /g,' ')
        }
       function removeAcento (text)
        {       
            text = text.toLowerCase();                                                         
            text = text.replace(new RegExp('[ÁÀÂÃ]','gi'), 'a');
            text = text.replace(new RegExp('[ÉÈÊ]','gi'), 'e');
            text = text.replace(new RegExp('[ÍÌÎ]','gi'), 'i');
            text = text.replace(new RegExp('[ÓÒÔÕ]','gi'), 'o');
            text = text.replace(new RegExp('[ÚÙÛ]','gi'), 'u');
            text = text.replace(new RegExp('[Ç]','gi'), 'c');
            return text;                 
        }
    }
    function breakContentIntoSentences(content){
        content.sentences = []
        const sentences = sentenceBoundaryDetection.sentences(content.sourceContentSanitized)
        sentences.forEach((sentence)=>{
            content.sentences.push({
                text: sentence,
                keywords: [],
                images: [],
                imagesLocal: []
            })
        })
    }
    async function fetchKeywordsOfAllSentences(content) {
        for(const sentence of content.sentences){
            sentence.keywords = await fetchWatsonAndReturnKeywords(sentence.text)
        }
    }
    async function fetchWatsonAndReturnKeywords(sentence) {
        return new Promise((resolve, reject) => {
            nlu.analyze({
                text: sentence,
                features: {
                    keywords: {}
                } 
            }, (error, response) => {
                if(error) {
                    throw error
                }
            
                const keywords = response.keywords.map((keyword) => {
                    return keyword.text
                })
    
                resolve(keywords)
            })
        })
    }
    function limitMaximunSentences(content){
        content.sentences = content.sentences.slice(0,content.maximumSentences)
    }
         
}
module.exports = robot
