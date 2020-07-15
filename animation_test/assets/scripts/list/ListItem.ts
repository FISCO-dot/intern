
const {ccclass, executionOrder} = cc._decorator;
import {eventCenter} from './CustomScroll_2'
@ccclass
@executionOrder(-3000)
export default class ListItem extends cc.Component {

    
    fontsize : number = 30

    text: cc.RichText = null
    img :cc.Sprite = null
    textNode :cc.Node = null
    imgNode :cc.Node =null
    // LIFE-CYCLE CALLBACKS:


    itemOnLoad(){
        this.textNode = this.node.getChildByName('label')
        this.text = this.node.getComponentInChildren(cc.RichText)
        this.imgNode = this.node.getChildByName('imgMsg')
        if(this.imgNode == null) this.img = null
        else this.img = this.imgNode.getComponent(cc.Sprite)
        cc.loader.loadRes('ChatExample/EmojiPic/faceAll',cc.SpriteAtlas,(err,asset)=>{
            this.text.imageAtlas = asset
        })
        this.text.fontSize = this.fontsize
        this.text.lineHeight = this.fontsize
        this._setItemSize()
        this.node.off(cc.Node.EventType.TOUCH_END)
        this.node.on(cc.Node.EventType.TOUCH_END,function(event){  
            if(event.target.name == ('label'||'imgMsg')) event.target = event.target.parent
            eventCenter.dispatch('select'+this.node.parent.parent.parent.name,event.target,2,event.target)            
        },this)
    }
    private _setSize(element:string|cc.SpriteFrame){
        if(typeof(element) == 'string'){
            if(element.length == 0) {element = '';return}
            this.node.height = this.textNode.height + 20 
            this.node.width = this.textNode.width + 20

        }
        else{
            if(element == null) return
            let height = this.img.spriteFrame.getRect().height 
            let width = this.img.spriteFrame.getRect().width
            if(height > 60){
                this.imgNode.height = 60
                this.imgNode.width = this.img.spriteFrame.getRect().width*60/height + 20
                width = this.imgNode.width
                if(width > 200){
                    this.imgNode.height = this.imgNode.height*200/width
                    this.imgNode.width = 200
                }
            }
            this.node.height = this.imgNode.height +20
            this.node.width = 220
        }
    }
    private _setItemSize(){
        let listNode = this.node.parent.parent.parent
        let scrollComponent = listNode.getComponent('CustomScroll_2')
        if(!scrollComponent.adaptiveSize){
            
            this.node.width = scrollComponent.width
            this.node.height = scrollComponent.height
            if(this.img == null || this.img.spriteFrame == null) this.text.horizontalAlign = 1
            else {
                this.imgNode.width = this.node.width
                this.imgNode.height = this.node.height
            }
        }
        else{
            if(scrollComponent.scrollHorizontal){
                if(this.img == null || this.img.spriteFrame == null){
                    this.text.horizontalAlign = 1
                    this.text.maxWidth = 0
                    this._setSize(this.text.string)
                }
                else{
                    this._setSize(this.img.spriteFrame)
                }
            }
            else{
                if(scrollComponent.messageMode){
                    if(this.img == null || this.img.spriteFrame == null){
                        if(this.node.getChildByName('headPic') == null) this.text.horizontalAlign = 1
                        else this.text.horizontalAlign = 0
                        this.text.maxWidth = scrollComponent.maxWidth;
                        this._setSize(this.text.string)
                        
                    }
                    else this._setSize(this.img.spriteFrame)
                }
                else{
                    if(this.img == null || this.img.spriteFrame == null){
                        this.text.horizontalAlign = 1
                        this.text.maxWidth = scrollComponent.maxWidth;
                        this._setSize(this.text.string)
                    }
                    else this._setSize(this.img.spriteFrame)
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
