export class ChatMessage{
    from: string;
    content: string;

    constructor(from: string, content: string, nextEvent:string = null){
        this.from = from;
        this.content = content;
    }
}