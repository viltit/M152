class MessageBox {

    constructor(maxMessages = 10) {
        this.messages = new Array()
        this.maxMessages = maxMessages
    }
    
    add(message) {
        this.messages.push(message)

        // if the message box is full, remove the oldest entry
        if (this.messages.length > this.maxMessages) {
            this.messages.pop()
        }

        // append all entries to the html:
        var htmlString = ""
        this.messages.forEach(function(message) {
            htmlString += "<br/>" + message
        })
        $('#message-box').html(htmlString)
    }
}