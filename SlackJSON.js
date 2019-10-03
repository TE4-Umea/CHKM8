class SlackJSON {
    /**
     * Create a slack response embed, use red.json() to send this back via the bot
     * @param {*} text Text you want to submit, optional
     * @param {*} attachments Array of attachements, optional
     */
    SlackResponse(text = "", attachments = []) {
        return {
            text: text,
            attachments: attachments
        }
    }


    SlackAttachments(text = "", color = "#0a6cff") {
        return {
            text: text,
            color: color
        }
    }
}

module.exports = SlackJSON