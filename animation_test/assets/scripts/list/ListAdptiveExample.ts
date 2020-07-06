import List from './CustomScroll_2'
import { eventCenter } from './CustomScroll_2';
const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(List)
    list:List = null
    @property(cc.EditBox)
    editbox : cc.EditBox = null;
    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.editbox.node.on('editing-return', this.sendInputMessage, this);
        eventCenter.on('delete',(node)=>{
            let delMsg = cc.instantiate(this.list.prefabSet[1])
            delMsg.addComponent(cc.RichText).string = `you have delete a message`
            delMsg.setPosition(0,node[0].position.y)
            delMsg.name = node[0].name
            let item = this.list.getItem()
            let itemPos = this.list.getItemposition()
            this.list.content.addChild(delMsg,Number(delMsg.name))
            item[node[0].name] = delMsg
            this.list.addData(delMsg.getComponentInChildren(cc.RichText).string,Number(delMsg.name))
            for(var i = Number(node[0].name);i < this.list.itemNumY;i++){
                if(i == 0) itemPos[String(i)].y = this.list.content.height/2-item['0'].height/2-20
                else {
                    itemPos[String(i)].y = itemPos[String(i-1)].y-item[i-1].height/2-item[i].height/2-20
                }
            }
            this.list.updateView()
        },this.list.node)
        
    }


    clickDel(){
        this.list.deleteItem()
        
    }
    sendInputMessage(){
        if(this.editbox.string == '') return
        this.list.addData(this.editbox.string)
        this.list.sendMessage()
        this.editbox.string = ''
    }

    // update (dt) {}
}
