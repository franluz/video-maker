const readline = require('readline-sync')

function start(){
    const content = {}
    content.searchTerm = askAndReturnTerm()
    content.prefix = askAndReturnPrefix()
    
    function askAndReturnTerm(){
        return readline.question('Type a Wikipidia search Term: ')
    }
    function askAndReturnPrefix(){
        const prefixes = ['Who is', 'What is ', 'The History of']
        const selectedPrefixIndex = readline.keyInSelect(prefixes, 'Choose one option: ')
        const selectedPrefixText = prefixes[selectedPrefixIndex]
        return selectedPrefixText
        
    }
    console.log(content)
}
start();