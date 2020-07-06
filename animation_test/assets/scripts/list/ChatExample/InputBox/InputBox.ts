import { eventCenter } from "../../CustomScroll_2";

const {ccclass, property} = cc._decorator;

@ccclass
export default class InputRichText extends cc.Component {

    // LIFE-CYCLE CALLBACKS:
    input : string = ''
    onLoad () {
        this.node.on(cc.Node.EventType.TOUCH_END,()=>{
            this.node.getComponent(cc.RichText).string = ''
            cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        },this)
        eventCenter.on('pickEmojiList',(node)=>{
            this.input += `<img src="${(Number(node[0].name)+1)}"/>`
            cc.log(`input = ${this.input}`)
            this.node.getComponent(cc.RichText).string = this.input
        },this.node)
    }

    onKeyDown(event){
        if(event.keyCode > 47 && event.keyCode < 91) {this.input += String.fromCharCode(event.keyCode);cc.log('input = ',this.input)}
        if(event.keyCode == cc.macro.KEY.backspace){
            if(this.input[this.input.length-1] != '>') this.input = this.input.substring(0,this.input.length-1)
            else {
                let index = this.input.lastIndexOf('<')
                this.input = this.input.substring(0,index)
            }
        }
        this.node.getComponent(cc.RichText).string = this.input
    }


}
