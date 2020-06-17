
const {ccclass, property} = cc._decorator;

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
        this.text.horizontalAlign = 0
        this.text.maxWidth = 200;
        this._loadText(this.text.string);
        this.node.x = 150
        this.textNode.x = this.textNode.width/2-this.node.width/2
    }
    private _loadText(text:string){
        cc.log('文本长度='+text.length)
        cc.log('parentname',this.node.name)
        if(text.length == 0) {text = '';return}
        this.node.height = this.textNode.height
        this.node.width = this.textNode.width+40
        cc.log(this.node.name+' height = '+this.node.height)
    }

}
