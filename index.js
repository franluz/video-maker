const readline = require('readline-sync')
const Parser = require('rss-parser')
const robots = {
    text: require('./robots/text.js')
}
const TREND_URL = 'https://trends.google.com/trends/trendingsearches/daily/rss?geo=BR' 
    async function start(){

        const sourceContent = {}
        sourceContent.searchTerm = await askAndReturnTerm()
        sourceContent.prefix =  askAndReturnPrefix()
        await robots.text(sourceContent)
        
        async function askAndReturnTerm(){
            const response = readline.question('Type a Wikipidia search Term: ')
            return (response.toUpperCase() === 'G') ? await askAndReturnTrend(): response
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
        function askAndReturnPrefix(){
            const prefixes = ['Who is', 'What is ', 'The History of']
            const selectedPrefixIndex = readline.keyInSelect(prefixes, 'Choose one option: ')
            const selectedPrefixText = prefixes[selectedPrefixIndex]
            return selectedPrefixText
            
        }
        console.log(sourceContent)
    }
start();