import { eventCenter } from "../../CustomScroll_2";
import MessageList from "../MessageList/MessageList";

const {ccclass, property} = cc._decorator;

@ccclass
export default class InputRichText extends cc.Component {
    @property(cc.Prefab)
    cursor : cc.Prefab = null
    // LIFE-CYCLE CALLBACKS:
    input : string = ''
    lineNum : number = 1
    lineHeight : number
    cursorNode : cc.Node = null
    onLoad () {
        this.lineHeight = this.node.getComponent(cc.RichText).lineHeight
        this.node.on(cc.Node.EventType.TOUCH_END,()=>{
            if(this.node.getChildByName('cursor') == null){
                this.node.getComponent(cc.RichText).string = ''
                this.cursorNode = cc.instantiate(this.cursor)
                this.node.addChild(this.cursorNode)
                this.cursorNode.setPosition(-65,0)
            }
            cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        },this)
        eventCenter.on('pickEmojiList',(node)=>{
            this.input += `<img src="${(Number(node[0].name)+1)}"/>`
            cc.log(`input = ${this.input}`)
            this.node.getComponent(cc.RichText).string = this.input
            this.cursorNode.x += 130/6
            this.lineNumChange()
        },this.node)
        this.node.on(cc.Node.EventType.MOUSE_DOWN, this.onMouseRightDown, this);
    }

    onKeyDown(event){
        
        if(event.keyCode > 47 && event.keyCode < 91) {
            this.input += String.fromCharCode(event.keyCode);
            if(event.keyCode < 57) this.cursorNode.x += 130/11
            else this.cursorNode.x += 130/9
            
        }
        if(event.keyCode == cc.macro.KEY.backspace){
            if(this.input.length > 0){
                if(this.input[this.input.length-1] != '>') {
                    if(this.input[this.input.length-1] <= '9' && this.input[this.input.length-1] >= '0') this.cursorNode.x -= 130/11
                    else this.cursorNode.x -= 130/9
                    this.input = this.input.substring(0,this.input.length-1)
                }
                else {
                    let index = this.input.lastIndexOf('<')
                    this.input = this.input.substring(0,index)
                    this.cursorNode.x -= 130/6
                }
            }
        }
        this.node.getComponent(cc.RichText).string = this.input
        if(event.keyCode != cc.macro.KEY.enter) this.lineNumChange()
        
    }
    onMouseRightDown(event){
        if(event.getButton() == cc.Event.EventMouse.BUTTON_RIGHT) {
            cc.loader.loadRes('Prefab/item',cc.Prefab,(err,prefab)=>{
                let dropListNode = new cc.Node('DropList')
                let dropList = dropListNode.addComponent('CustomScroll_2')
                dropListNode.addComponent('SecondaryList')
                dropList.prefabSet.push(prefab)
                this.node.addChild(dropListNode)
                this.node.zIndex ++
                dropListNode.setPosition(20,-100)
            })
        }
    }

    lineNumChange(){
        if(this.lineNum < Math.floor(this.node.height/this.lineHeight)){//下移一行
            this.node.y += this.lineHeight/2
            this.node.getChildByName('Ground').height += this.lineHeight
            this.node.getChildByName('EmojiButt').y -= this.lineHeight/2
            this.cursorNode.y -= this.lineHeight/2
            if(this.input[this.input.length-1] >= '0' && this.input[this.input.length-1] <= '9') this.cursorNode.x = -55
            else this.cursorNode.x = -52
            this.lineNum ++
        }
        else if(this.lineNum > Math.floor(this.node.height/this.lineHeight)){//上移一行
            this.node.y -= this.lineHeight/2*(this.lineNum-Math.floor(this.node.height/this.lineHeight))
            this.node.getChildByName('Ground').height -= this.lineHeight*(this.lineNum-Math.floor(this.node.height/this.lineHeight))
            this.node.getChildByName('EmojiButt').y += this.lineHeight/2*(this.lineNum-Math.floor(this.node.height/this.lineHeight))
            this.cursorNode.y += this.lineHeight/2
            this.cursorNode.x = 60            
            this.lineNum -= (this.lineNum-Math.floor(this.node.height/this.lineHeight))
        }
    }
}
