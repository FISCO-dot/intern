
const {ccclass, executionOrder} = cc._decorator;
import {eventCenter} from './CustomScroll_2'
@ccclass
@executionOrder(-3000)
export default class ListItem extends cc.Component {

    
    fontsize : number = 30

    text: cc.RichText = null
    textNode :cc.Node = null
    // LIFE-CYCLE CALLBACKS:
    
    itemOnLoad(){
        this.textNode = this.node.children[0]
        this.text = this.node.getComponentInChildren(cc.RichText)
        this.text.fontSize = this.fontsize
        this.text.lineHeight = this.fontsize
        this._setItemSize()
        this.node.on(cc.Node.EventType.TOUCH_END,function(event){
            eventCenter.dispatch('select'+this.node.parent.parent.parent.name,event.target,2,false,event.target)            
        },this)
    }
    private _loadText(text:string){
        cc.log('parentname',this.node.parent.name)
        if(text.length == 0) {text = '';return}
        this.node.height = this.textNode.height
        this.node.width = this.textNode.width+20
    }
    private _setItemSize(){
        let listNode = this.node.parent.parent.parent
        let scrollComponent = listNode.getComponent('CustomScroll_2')
        
        if(!scrollComponent.adaptiveSize){
            // this.node.scaleX = scrollComponent.width / this.node.width
            // this.node.scaleY = scrollComponent.height / this.node.height
            this.node.width = scrollComponent.width
            this.node.height = scrollComponent.height
            this.text.horizontalAlign = 1
        }
        else{
            if(scrollComponent.scrollHorizontal){
                this.text.horizontalAlign = 1
                this.text.maxWidth = 0
                this._loadText(this.text.string)
            }

            else{
                if(scrollComponent.messageMode){
                    this.text.horizontalAlign = 0
                    this.text.maxWidth = scrollComponent.maxWidth;
                    this._loadText(this.text.string)
                }
                else{
                    this.text.horizontalAlign = 1
                    this.text.maxWidth = scrollComponent.maxWidth;
                    this.node.width = scrollComponent.maxWidth
                    this.node.height = this.textNode.height
                }
            }
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
