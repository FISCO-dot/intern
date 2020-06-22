
const {ccclass, property} = cc._decorator;
import {eventCenter} from './CustomScroll_2'
@ccclass
export default class ListItem extends cc.Component {

    
    fontsize : number = 30

    text: cc.RichText = null
    textNode :cc.Node = null
    // LIFE-CYCLE CALLBACKS:
    
    onLoad(){
        this.textNode = this.node.children[0]
        this.text = this.node.getComponentInChildren(cc.RichText)
        this.text.fontSize = this.fontsize
        this.text.lineHeight = this.fontsize
        this._setItemSize()
        this.node.on(cc.Node.EventType.TOUCH_END,function(event){
            eventCenter.emit('select',event.target)
        },this)


    }
    private _loadText(text:string){
        cc.log('parentname',this.node.parent.name)
        if(text.length == 0) {text = '';return}
        this.node.height = this.textNode.height
        // this.node.width = this.textNode.width+20
        this.node.width = text.length*this.fontsize
    }
    private _setItemSize(){
        let listNode = this.node.parent.parent.parent
        let scrollComponent = listNode.getComponent('CustomScroll_2')
        this.text.maxWidth = scrollComponent.maxWidth;
        if(!scrollComponent.messageMode){
            if(!scrollComponent.adaptiveSize){
                this.node.scaleX = scrollComponent.width / this.node.width
                this.node.scaleY = scrollComponent.height / this.node.height
                this.text.horizontalAlign = 1
            }
            else{
                this.text.horizontalAlign = 1
                this._loadText(this.text.string)
            }
        }
        else{
            this.text.horizontalAlign = 0
            this._loadText(this.text.string)
            this.node.x = this.node.parent.width/2-this.textNode.width/2 - 50
        }
    }
    public setFontSize(fontSize:number){
        if(fontSize <= 0) {
            cc.error('fontSize illegal')
            return
        }
        this.fontsize = fontSize

    }
}
