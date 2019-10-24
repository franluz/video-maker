const Parser = require('rss-parser')
const readline = require('readline-sync')
const state = require('./state.js')
const TREND_URL = 'https://trends.google.com/trends/trendingsearches/daily/rss?geo=BR'
async function robot(){
    const content = {
        maximumSentences: 7
    }
    content.searchTerm = await askAndReturnTerm()
    content.prefix =  await askAndReturnPrefix()
    content.lang = await askAndReturnLang()
    state.save(content)

    async function askAndReturnTerm(){
        const response = readline.question('Type a Wikipidia search Term: ')
        return (response.toUpperCase() === 'G') ? await askAndReturnTrend(): response
    }
   async function askAndReturnPrefix(){
        const prefixes = ['Who is', 'What is ', 'The History of']
        const selectedPrefixIndex = readline.keyInSelect(prefixes, 'Choose one option: ')
        const selectedPrefixText = prefixes[selectedPrefixIndex]
        return selectedPrefixText
        
    }
   async function askAndReturnLang(){
        const languages = ['en','pt']
        const selectedIndexLang = readline.keyInSelect(languages,'Choice Language:')
        const selectedIndexSigla = languages[selectedIndexLang]
        return selectedIndexSigla
    }
    async function askAndReturnTrend(){
        console.log('Please Wait...')
        const trends = await  getGoogleTrends()
        const choice = readline.keyInSelect(trends, 'Chooice your trend:')
        return trends[choice]
    }
    async function getGoogleTrends(){
        const parser = new Parser();
        const trends = await parser.parseURL(TREND_URL);
        return trends.items.map(i => i.title)
    }

}
module.exports = robot