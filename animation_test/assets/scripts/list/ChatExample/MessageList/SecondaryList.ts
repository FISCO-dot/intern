
const {ccclass, property,executionOrder} = cc._decorator;
import { eventCenter } from '../../CustomScroll_2'
import * as CopyMessage from '../Global/global'
let copyMessage = new CopyMessage.default
@ccclass
export default class AddList extends cc.Component {

    data: any[] = []
    menuTemplate : string [] 

    onLoad () {
        this.node.addComponent(cc.BlockInputEvents)
        let dropList = this.node.getComponent('CustomScroll_2')
        
        if(this.node.parent.name == "InputBox"){
            this.menuTemplate = ['copy','paste']
            dropList.viewWidth = 80           
            dropList.viewHeight = 50
            dropList.fontSize = 20
            dropList.width = 60
            dropList.height = 25
            dropList.itemNumY = 2
            dropList.loadData(this.menuTemplate)
            dropList.setItemColor(cc.color(144,169,214,255))
            eventCenter.on('pickDropList',(node)=>{
                let event = node[0].getComponentInChildren(cc.RichText).string
                
                switch (event) {
                    case 'copy':
                        copyMessage.copyMessage = this.node.parent.getComponent(cc.RichText).string
                        break;
                    case 'paste':
                        if(copyMessage.copyMessage == undefined) break;
                        else this.node.parent.getComponent(cc.RichText).string = copyMessage.copyMessage
                    default:
                        break;
                }
                node[0].parent.parent.parent.removeFromParent()
            },this.node)
        }
        else if(this.node.parent.parent.parent.parent.name == "MessageList"){
            let parentList = this.node.parent.parent.parent.parent.getComponent('CustomScroll_2')
            this.menuTemplate = ['copy','paste','delete','quote']
            dropList.viewWidth = 80           
            dropList.viewHeight = 100
            dropList.fontSize = 20
            dropList.width = 60
            dropList.height = 25
            dropList.itemNumY = 4
            dropList.loadData(this.menuTemplate)
            dropList.setItemColor(cc.color(144,169,214,255))
            eventCenter.on('pickDropList',(node)=>{
                let event = node[0].getComponentInChildren(cc.RichText).string
                switch (event) {
                    case 'delete':
                        parentList.deleteItem()
                        break;
                    case 'copy':
                        copyMessage.copyMessage = parentList.returnPick()[0].getComponentInChildren(cc.RichText).string
                        break;
                    case 'paste':
                        if(copyMessage.copyMessage == undefined) break;
                        else parentList.returnPick()[0].getComponentInChildren(cc.RichText).string = copyMessage.copyMessage
                    default:
                        break;
                }
                eventCenter.emit(`select${parentList.node.name}`,node[0].parent.parent.parent.parent)
                node[0].parent.parent.parent.removeFromParent()
            },this.node)
        }
        

    }




    // update (dt) {}
}

