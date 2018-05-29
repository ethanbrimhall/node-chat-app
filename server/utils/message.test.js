var expect = require('expect');

var {generateMessage} = require('./message');

describe('generateMessage', () => {
    it('should generate correct message object', () => {
        var from = "ethan";
        var text = "some message";
        var message = generateMessage(from, text);


        
    });
});